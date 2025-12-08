'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import AdminSidebar from '@/components/layout/AdminSidebar';
import api from '@/lib/axios';
// Menggunakan react-icons/fa
import { FaSearch, FaStar, FaQuoteLeft, FaTrash, FaEdit, FaPlus, FaCommentAlt, FaUserCircle } from 'react-icons/fa';

// Tipe data sesuai README
interface Review {
  id: number;
  rating: number;
  comment: string;
  posted_at: string;
  customer_name?: string;
  user?: {
    id: number;
    name: string;
  } | null;
  decoration?: {
    id: number;
    name: string;
  } | null;
}

export default function TestimonialsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterDecoration, setFilterDecoration] = useState('');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [decorations, setDecorations] = useState<Array<{id: number; name: string; slug: string}>>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    decoration_id: '',
    rating: 5,
    comment: '',
    posted_at: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getUser();
        if (userData.role !== 'admin') {
          router.push('/customer/dashboard');
          return;
        }
        setUser(userData);
        fetchDecorations();
        fetchReviews();
      } catch (error) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Fetch decorations for dropdown
  const fetchDecorations = async () => {
    try {
      const response = await api.get('/admin/decorations/dropdown');
      setDecorations(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch decorations:', error);
      setDecorations([]);
    }
  };

  // Fetch reviews from API
  const fetchReviews = async () => {
    try {
      const params: any = {
        page: currentPage,
        per_page: 15
      };

      if (filterRating !== 'all') {
        params.rating = parseInt(filterRating);
      }

      if (filterDecoration) {
        params.decoration_id = filterDecoration;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get('/admin/reviews', { params });
      const data = response.data.data;
      
      setReviews(data.data || []);
      setTotalPages(data.last_page || 1);
      setTotalReviews(data.total || 0);
    } catch (error: any) {
      console.error('Failed to fetch reviews:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      setReviews([]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [currentPage, filterRating, filterDecoration, searchTerm]);

  // Create/Update review
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReview) {
        // Update existing review
        await api.put(`/admin/reviews/${editingReview.id}`, {
          rating: formData.rating,
          comment: formData.comment,
          posted_at: formData.posted_at
        });
        alert('Review updated successfully!');
      } else {
        // Create new review
        await api.post('/admin/reviews', formData);
        alert('Review created successfully!');
      }
      setShowModal(false);
      setEditingReview(null);
      resetForm();
      fetchReviews();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save review');
    }
  };

  // Delete review
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await api.delete(`/admin/reviews/${id}`);
      alert('Review deleted successfully!');
      fetchReviews();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete review');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      customer_name: '',
      decoration_id: '',
      rating: 5,
      comment: '',
      posted_at: new Date().toISOString().split('T')[0]
    });
  };

  // Open modal for create
  const openCreateModal = () => {
    resetForm();
    setEditingReview(null);
    setShowModal(true);
  };

  // Open modal for edit
  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setFormData({
      customer_name: review.user?.name || review.customer_name || '',
      decoration_id: review.decoration?.id?.toString() || '',
      rating: review.rating,
      comment: review.comment,
      posted_at: review.posted_at
    });
    setShowModal(true);
  };

  // Helper untuk merender bintang
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"} size={14} />
    ));
  };

  // Custom Button Component
  const GradientButton = ({ children, onClick, className = '', type = 'button', variant = 'primary' }: any) => {
    const baseStyle = "px-3 py-1.5 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm flex items-center justify-center text-xs";
    const variants = {
      primary: "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 border-none",
      success: "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200",
      danger: "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
    };
    return (
      <button 
        type={type} 
        onClick={onClick} 
        className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}
      >
        {children}
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
           <p className="text-gray-600 mt-4 font-medium">Loading Testimonials...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={user} />

      <div className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-8 pt-20 md:pt-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-black">
                        Testimonials
                        </h1>
                        <p className="text-gray-500 mt-1">Manage customer reviews and feedback.</p>
                    </div>
                    <div className="hidden md:block">
                        <span className="bg-purple-50 text-purple-700 border border-purple-100 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                             Total: {totalReviews} Reviews
                        </span>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex gap-4 mb-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by comment..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="w-48">
                        <select
                            value={filterRating}
                            onChange={(e) => setFilterRating(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>
                    <GradientButton onClick={openCreateModal} className="whitespace-nowrap">
                        <FaPlus className="mr-2" /> Create Review
                    </GradientButton>
                </div>
            </div>
        </div>

        {/* Testimonials Grid */}
        {reviews.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200">
                <div className="bg-gray-100 inline-flex p-4 rounded-full mb-4">
                    <FaCommentAlt className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-600 text-lg font-medium">No reviews yet</p>
                <p className="text-gray-400 text-sm">Customer reviews will appear here.</p>
            </div>
        ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 flex flex-col h-full">
                        
                        {/* Header: Avatar, Name, Date */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                                    <FaUserCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm">
                                      {item.user?.name || item.customer_name || 'Anonymous'}
                                    </h3>
                                    <p className="text-xs text-gray-500">{new Date(item.posted_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Decoration Name Badge */}
                        <div className="mb-3">
                            <span className="inline-block bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200">
                                {item.decoration?.name || 'N/A'}
                            </span>
                        </div>

                        {/* Rating */}
                        <div className="flex gap-1 mb-3">
                            {renderStars(item.rating)}
                        </div>

                        {/* Content */}
                        <div className="relative flex-1 mb-6">
                            <FaQuoteLeft className="text-pink-100 absolute -top-1 -left-2 text-3xl -z-10" />
                            <p className="text-gray-600 text-sm italic relative z-10 leading-relaxed">
                                "{item.comment}"
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t border-gray-100 mt-auto">
                            <GradientButton variant="primary" className="flex-1" onClick={() => openEditModal(item)}>
                                <FaEdit className="mr-1" /> Edit
                            </GradientButton>
                            <GradientButton variant="danger" className="flex-1" onClick={() => handleDelete(item.id)}>
                                <FaTrash className="mr-1" /> Delete
                            </GradientButton>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                <div className="flex gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded-lg ${
                          currentPage === page
                            ? 'bg-[#9A82DB] text-white'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
            </>
        )}

        {/* Modal for Create/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingReview ? 'Edit Review' : 'Create Fake Review'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingReview && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name (Custom)</label>
                      <input
                        type="text"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                        placeholder="Enter custom customer name for fake review"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                        maxLength={255}
                      />
                      <p className="text-xs text-gray-500 mt-1">This name will appear as the reviewer</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Decoration</label>
                      <select
                        value={formData.decoration_id}
                        onChange={(e) => setFormData({...formData, decoration_id: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">Select Decoration</option>
                        {decorations.map((decoration) => (
                          <option key={decoration.id} value={decoration.id}>
                            {decoration.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Poor</option>
                    <option value={1}>1 Star - Terrible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({...formData, comment: e.target.value})}
                    rows={5}
                    maxLength={1000}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.comment.length}/1000 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Posted Date</label>
                  <input
                    type="date"
                    value={formData.posted_at}
                    onChange={(e) => setFormData({...formData, posted_at: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingReview(null);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    {editingReview ? 'Update Review' : 'Create Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}