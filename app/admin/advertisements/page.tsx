'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import { advertisementService, Advertisement } from '@/lib/crudService';
import { getImageUrl } from '@/lib/axios';
import AdminSidebar from '@/components/layout/AdminSidebar';
// Mengganti library icon ke FA agar konsisten dengan halaman lain
import { FaPlus, FaEdit, FaTrash, FaSearch, FaImage, FaTimes, FaExternalLinkAlt, FaEye, FaEyeSlash, FaCalendarAlt, FaBullhorn, FaLink, FaSortNumericDown } from 'react-icons/fa';

export default function AdvertisementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Mengganti nama showForm jadi showModal agar konsisten
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link_url: '',
    order: 0,
    is_active: true,
    start_date: '',
    end_date: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

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
        fetchAdvertisements();
      } catch (error) {
        router.push('/login');
      }
    };

    fetchUserAndData();
  }, [router]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (!isLoading) fetchAdvertisements();
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm, filterActive, isLoading]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterActive !== 'all') params.is_active = filterActive === 'active' ? true : false;

      const response = await advertisementService.getAll(params);
      setAdvertisements(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      if (formData.description) submitData.append('description', formData.description);
      if (formData.link_url) submitData.append('link_url', formData.link_url);
      submitData.append('order', formData.order.toString());
      submitData.append('is_active', formData.is_active ? '1' : '0');
      if (formData.start_date) submitData.append('start_date', formData.start_date);
      if (formData.end_date) submitData.append('end_date', formData.end_date);
      if (imageFile) submitData.append('image', imageFile);

      if (editingId) {
        await advertisementService.update(editingId, submitData);
      } else {
        await advertisementService.create(submitData);
      }

      resetForm();
      fetchAdvertisements();
    } catch (error) {
      console.error('Failed to save advertisement:', error);
      alert('Failed to save advertisement');
    }
  };

  const handleEdit = (advertisement: Advertisement) => {
    setEditingId(advertisement.id);
    setFormData({
      title: advertisement.title,
      description: advertisement.description || '',
      link_url: advertisement.link_url || '',
      order: advertisement.order,
      is_active: advertisement.is_active,
      start_date: advertisement.start_date || '',
      end_date: advertisement.end_date || '',
    });
    setImagePreview(getImageUrl(advertisement.image));
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return;

    try {
      await advertisementService.delete(id);
      fetchAdvertisements();
    } catch (error) {
      console.error('Failed to delete advertisement:', error);
      alert('Failed to delete advertisement');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      link_url: '',
      order: 0,
      is_active: true,
      start_date: '',
      end_date: '',
    });
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
    setShowModal(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
           <p className="text-gray-600 mt-4 font-medium">Loading Advertisements...</p>
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
                        Advertisements
                        </h1>
                        <p className="text-gray-500 mt-1">Manage promotion banners and ads.</p>
                    </div>
                    <div className="hidden md:block">
                        <span className="bg-purple-50 text-purple-700 border border-purple-100 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                             Total: {advertisements.length} Ads
                        </span>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search advertisements..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="w-48">
                         <select
                            value={filterActive}
                            onChange={(e) => setFilterActive(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <GradientButton onClick={() => setShowModal(true)}>
                        <FaPlus className="mr-2" /> Add New
                    </GradientButton>
                </div>
            </div>
        </div>

        {/* List / Grid */}
        {loading ? (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        ) : advertisements.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200">
                <div className="bg-gray-100 inline-flex p-4 rounded-full mb-4">
                    <FaBullhorn className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-600 text-lg font-medium">No advertisements found</p>
                <p className="text-gray-400 text-sm">Create a new ad to promote content.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advertisements.map((ad) => (
                  <div key={ad.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full">
                    
                    {/* Image Area */}
                    <div className="relative h-48 bg-gray-100">
                        <img
                            src={getImageUrl(ad.image)}
                            alt={ad.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                            }}
                        />
                        <div className="absolute top-3 right-3">
                             <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 ${
                                ad.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                             }`}>
                                {ad.is_active ? <><FaEye/> Active</> : <><FaEyeSlash/> Inactive</>}
                             </span>
                        </div>
                         <div className="absolute top-3 left-3">
                             <span className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                                <FaSortNumericDown/> Order: {ad.order}
                             </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1" title={ad.title}>
                            {ad.title}
                        </h3>
                        
                        {ad.description && (
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                                {ad.description}
                            </p>
                        )}

                        <div className="space-y-2 mt-auto text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                             {(ad.start_date || ad.end_date) && (
                                <div className="flex items-start gap-2">
                                    <FaCalendarAlt className="mt-0.5 text-pink-500"/>
                                    <div className="flex flex-col">
                                        {ad.start_date && <span>Start: {new Date(ad.start_date).toLocaleDateString()}</span>}
                                        {ad.end_date && <span>End: {new Date(ad.end_date).toLocaleDateString()}</span>}
                                    </div>
                                </div>
                            )}
                            {ad.link_url && (
                                <div className="flex items-center gap-2 pt-1 border-t border-gray-200 mt-1">
                                    <FaLink className="text-purple-500"/>
                                    <a 
                                        href={ad.link_url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-purple-600 hover:text-purple-800 hover:underline truncate"
                                    >
                                        Visit Link <FaExternalLinkAlt className="inline ml-1 text-[10px]"/>
                                    </a>
                                </div>
                            )}
                        </div>

                         {/* Actions */}
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                            <GradientButton onClick={() => handleEdit(ad)} className="flex-1 text-sm py-1.5">
                                <FaEdit className="mr-1" /> Edit
                            </GradientButton>
                            <GradientButton variant="danger" onClick={() => handleDelete(ad.id)} className="w-10 px-0 flex items-center justify-center">
                                <FaTrash />
                            </GradientButton>
                        </div>
                    </div>
                  </div>
                ))}
            </div>
        )}

        {/* Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingId ? 'Edit Advertisement' : 'Add New Advertisement'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Link URL</label>
                    <input
                      type="url"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5 bg-purple-50 p-5 rounded-xl border border-purple-100">
                    <div>
                        <label className="block text-xs font-bold text-purple-800 uppercase mb-2">Display Order</label>
                        <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        min="0"
                        className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                     <div className="flex items-end">
                        <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-purple-100 transition-colors w-full">
                            <div className="relative">
                                <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="sr-only"
                                />
                                <div className={`block w-10 h-6 rounded-full ${formData.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${formData.is_active ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                            <span className="ml-3 text-sm font-bold text-gray-700">Set as Active</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Banner Image {!editingId && '*'}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!editingId}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                    />
                  </div>
                  {imagePreview && (
                    <div className="mt-4 relative rounded-xl overflow-hidden shadow-md border border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">Preview</div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <GradientButton variant="secondary" onClick={resetForm} className="flex-1">
                    Cancel
                  </GradientButton>
                  <GradientButton type="submit" className="flex-1">
                    {editingId ? 'Save Changes' : 'Create Ad'}
                  </GradientButton>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}