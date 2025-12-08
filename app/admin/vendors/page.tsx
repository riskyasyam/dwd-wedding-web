'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { vendorService, Vendor } from '@/lib/crudService';
import { authService, User } from '@/lib/auth';
import { getImageUrl } from '@/lib/axios';
import AdminSidebar from '@/components/layout/AdminSidebar';
// Menggunakan react-icons/fa untuk konsistensi
import { FaPlus, FaEdit, FaTrash, FaSearch, FaImage, FaTimes, FaPhone, FaMapMarkerAlt, FaEnvelope, FaStar, FaStore } from 'react-icons/fa';

export default function VendorsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    rating: 0
  });

  const categories = [
    'Fotografi',
    'Videografi',
    'Make up / Hair & Hijab',
    'Attire',
    'Entertainment (Musik)'
  ];

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const userData = await authService.getUser();
        if (userData.role !== 'admin') {
          router.push('/customer/dashboard');
          return;
        }
        setUser(userData);
        setIsLoading(false);
        fetchVendors();
      } catch (error) {
        router.push('/login');
      }
    };
    fetchUserAndData();
  }, [router]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterCategory) params.category = filterCategory;
      
      const response = await vendorService.getAll(params);
      setVendors(response.data?.data || response.data || []);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      setError(error.response?.data?.message || 'Failed to fetch vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchVendors();
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm, filterCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await vendorService.update(editingVendor.id, formData);
        alert('Vendor updated successfully');
      } else {
        const response = await vendorService.create(formData);
        
        // Upload images if selected during creation
        if (selectedImages.length > 0 && response.data?.id) {
           await vendorService.uploadImages(response.data.id, selectedImages);
        }
        alert('Vendor created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchVendors();
    } catch (error: any) {
      console.error('Error saving vendor:', error);
      alert(error.response?.data?.message || 'Failed to save vendor');
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      category: vendor.category,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address || '',
      description: vendor.description || '',
      rating: vendor.rating || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    
    try {
      await vendorService.delete(id);
      alert('Vendor deleted successfully');
      fetchVendors();
    } catch (error: any) {
      console.error('Error deleting vendor:', error);
      alert(error.response?.data?.message || 'Failed to delete vendor');
    }
  };

  const handleManageImages = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setShowImageModal(true);
  };

  const handleImageUpload = async (vendorId: number) => {
    if (selectedImages.length === 0) {
      alert('Please select images to upload');
      return;
    }

    try {
      await vendorService.uploadImages(vendorId, selectedImages);
      alert('Images uploaded successfully');
      setShowImageModal(false);
      setSelectedImages([]);
      setEditingVendor(null);
      fetchVendors();
    } catch (error: any) {
      console.error('Error uploading images:', error);
      alert(error.response?.data?.message || 'Failed to upload images');
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await vendorService.deleteImage(imageId);
      alert('Image deleted successfully');
      fetchVendors();
    } catch (error: any) {
      console.error('Error deleting image:', error);
      alert(error.response?.data?.message || 'Failed to delete image');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      email: '',
      phone: '',
      address: '',
      description: '',
      rating: 0
    });
    setEditingVendor(null);
    setSelectedImages([]);
  };

  // --- CUSTOM UI COMPONENTS ---

  const GradientButton = ({ children, onClick, className = '', type = 'button', variant = 'primary' }: any) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md flex items-center justify-center";
    const variants = {
      primary: "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 border-none",
      secondary: "bg-white text-purple-600 border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-50",
      danger: "bg-white text-red-500 border-2 border-red-100 hover:border-red-300 hover:bg-red-50"
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
           <p className="text-gray-600 mt-4 font-medium">Loading Vendors...</p>
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
                        Vendor Management
                        </h1>
                        <p className="text-gray-500 mt-1">Manage your vendor partners and services.</p>
                    </div>
                    <div className="hidden md:block">
                        <span className="bg-purple-50 text-purple-700 border border-purple-100 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                             Total: {vendors.length} Partners
                        </span>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="w-64">
                         <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <GradientButton onClick={() => setShowModal(true)}>
                        <FaPlus className="mr-2" /> Add Vendor
                    </GradientButton>
                </div>
            </div>
        </div>

        {/* Error Message */}
        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 shadow-sm flex items-center">
             <FaTimes className="mr-2"/>
             <div>
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
             </div>
            </div>
        )}

        {/* Vendors Grid */}
        {loading ? (
             <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        ) : vendors.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200">
                <div className="bg-gray-100 inline-flex p-4 rounded-full mb-4">
                    <FaStore className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-600 text-lg font-medium">No vendors found</p>
                <p className="text-gray-400 text-sm">Add a new vendor partner to get started.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map((vendor) => (
                    <div key={vendor.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full">
                        {/* Cover Image Section */}
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                            {vendor.images && vendor.images.length > 0 ? (
                                <img
                                    src={getImageUrl(vendor.images[0].image)}
                                    alt={vendor.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-300 bg-gray-50">
                                    <FaStore size={48} />
                                </div>
                            )}
                            <div className="absolute top-3 left-3">
                                <span className="bg-white/95 backdrop-blur-sm text-purple-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                    {vendor.category}
                                </span>
                            </div>
                            {vendor.rating && vendor.rating > 0 ? (
                                <div className="absolute top-3 right-3">
                                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                                        <FaStar className="text-yellow-500" /> {Number(vendor.rating).toFixed(1)}
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        {/* Content Section */}
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-1">{vendor.name}</h3>
                            
                            <div className="space-y-2 mb-4 text-sm text-gray-600 flex-1">
                                <div className="flex items-center gap-2">
                                    <FaEnvelope className="text-pink-400 shrink-0" />
                                    <span className="truncate">{vendor.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaPhone className="text-green-500 shrink-0" />
                                    <span>{vendor.phone}</span>
                                </div>
                                {vendor.address && (
                                    <div className="flex items-start gap-2">
                                        <FaMapMarkerAlt className="text-purple-500 shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{vendor.address}</span>
                                    </div>
                                )}
                            </div>

                             {vendor.description && (
                                <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 line-clamp-2 italic">"{vendor.description}"</p>
                                </div>
                             )}

                            {/* Actions */}
                            <div className="space-y-2 pt-2 border-t border-gray-100 mt-auto">
                                <GradientButton variant="secondary" onClick={() => handleManageImages(vendor)} className="w-full text-sm py-1.5">
                                    <FaImage className="mr-2" /> Portfolio ({vendor.images?.length || 0})
                                </GradientButton>
                                <div className="flex gap-2">
                                    <GradientButton onClick={() => handleEdit(vendor)} className="flex-1 text-sm py-1.5">
                                        <FaEdit className="mr-1" /> Edit
                                    </GradientButton>
                                    <GradientButton variant="danger" onClick={() => handleDelete(vendor.id)} className="w-10 px-0 flex items-center justify-center">
                                        <FaTrash />
                                    </GradientButton>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Vendor Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g., Premium Photography Studio"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rating (0-5)</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="vendor@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="+62812345678"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Full address"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Describe the vendor services..."
                    />
                  </div>

                  {!editingVendor && (
                     <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Portfolio Images</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => setSelectedImages(Array.from(e.target.files || []))}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                            />
                            {selectedImages.length > 0 && (
                                <p className="mt-2 text-sm text-pink-600 font-medium">{selectedImages.length} images selected</p>
                            )}
                        </div>
                     </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <GradientButton
                    variant="secondary"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </GradientButton>
                  <GradientButton type="submit" className="flex-1">
                    {editingVendor ? 'Save Changes' : 'Create Vendor'}
                  </GradientButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Image Management Modal */}
        {showImageModal && editingVendor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="bg-purple-50 border border-purple-100 p-2 rounded-lg text-purple-600"><FaImage/></span>
                    Manage Portfolio - {editingVendor.name}
                </h2>

                <div className="mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Add New Images</label>
                    <div className="flex gap-4 items-end">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setSelectedImages(Array.from(e.target.files || []))}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                        />
                        <GradientButton
                            onClick={() => handleImageUpload(editingVendor.id)}
                            className="whitespace-nowrap"
                            disabled={selectedImages.length === 0}
                        >
                            Upload Selected
                        </GradientButton>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Current Portfolio ({editingVendor.images?.length || 0})</h3>
                    {editingVendor.images && editingVendor.images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {editingVendor.images.map((img) => (
                            <div key={img.id} className="relative group rounded-xl overflow-hidden shadow-sm aspect-square border border-gray-200">
                            <img
                                src={getImageUrl(img.image)}
                                alt="Portfolio"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => handleDeleteImage(img.id)}
                                    className="bg-white text-red-500 p-3 rounded-full hover:bg-red-50 transition-colors transform hover:scale-110 shadow-sm"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                            <p className="text-gray-500">No images uploaded yet</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end">
                    <GradientButton
                        variant="secondary"
                        onClick={() => {
                            setShowImageModal(false);
                            setEditingVendor(null);
                            setSelectedImages([]);
                        }}
                        className="w-32"
                    >
                        Done
                    </GradientButton>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}