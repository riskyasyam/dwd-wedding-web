'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import { decorationService, freeItemsService, Decoration, FreeItem } from '@/lib/crudService';
import { getImageUrl } from '@/lib/axios';
// Hapus import Button & Card dari ui/shadcn karena kita pakai custom style di file ini
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaImage, FaTimes, FaGift, FaTag, FaMapMarkerAlt } from 'react-icons/fa';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function DecorationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showFreeItemsModal, setShowFreeItemsModal] = useState(false);
  const [editingDecoration, setEditingDecoration] = useState<Decoration | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [freeItems, setFreeItems] = useState<FreeItem[]>([]);
  const [freeItemForm, setFreeItemForm] = useState({
    item_name: '',
    description: '',
    quantity: 1
  });
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    description: '',
    base_price: 0,
    discount_percent: 0,
    discount_start_date: '',
    discount_end_date: '',
    is_deals: false
  });

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
        fetchDecorations();
      } catch (error) {
        router.push('/login');
      }
    };

    fetchUserAndData();
  }, [router]);

  const fetchDecorations = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (filterRegion) params.region = filterRegion;
      if (searchTerm) params.search = searchTerm;
      
      const response = await decorationService.getAll(params);
      setDecorations(response.data?.data || response.data || []);
    } catch (error: any) {
      console.error('Error fetching decorations:', error);
      setError(error.response?.data?.message || 'Failed to fetch decorations. Please make sure the backend is running.');
      setDecorations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchDecorations();
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm, filterRegion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDecoration) {
        await decorationService.update(editingDecoration.id, formData);
        alert('Decoration updated successfully');
      } else {
        const response = await decorationService.create(formData);
        alert('Decoration created successfully');
        
        if (selectedImages.length > 0 && response.data?.id) {
          await decorationService.uploadImages(response.data.id, selectedImages);
        }
      }
      setShowModal(false);
      resetForm();
      fetchDecorations();
    } catch (error: any) {
      console.error('Error saving decoration:', error);
      alert(error.response?.data?.message || 'Failed to save decoration');
    }
  };

  const handleImageUpload = async (decorationId: number) => {
    if (selectedImages.length === 0) {
      alert('Please select images to upload');
      return;
    }

    try {
      await decorationService.uploadImages(decorationId, selectedImages);
      alert('Images uploaded successfully');
      setShowImageModal(false);
      setSelectedImages([]);
      setEditingDecoration(null);
      fetchDecorations();
    } catch (error: any) {
      console.error('Error uploading images:', error);
      alert(error.response?.data?.message || 'Failed to upload images');
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await decorationService.deleteImage(imageId);
      alert('Image deleted successfully');
      fetchDecorations();
    } catch (error: any) {
      console.error('Error deleting image:', error);
      alert(error.response?.data?.message || 'Failed to delete image');
    }
  };

  const handleEdit = (decoration: Decoration) => {
    setEditingDecoration(decoration);
    setFormData({
      name: decoration.name,
      region: decoration.region,
      description: decoration.description,
      base_price: decoration.base_price,
      discount_percent: decoration.discount_percent || 0,
      discount_start_date: decoration.discount_start_date || '',
      discount_end_date: decoration.discount_end_date || '',
      is_deals: decoration.is_deals
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this decoration?')) return;
    
    try {
      await decorationService.delete(id);
      alert('Decoration deleted successfully');
      fetchDecorations();
    } catch (error: any) {
      console.error('Error deleting decoration:', error);
      alert(error.response?.data?.message || 'Failed to delete decoration');
    }
  };

  const handleManageImages = (decoration: Decoration) => {
    setEditingDecoration(decoration);
    setShowImageModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      region: '',
      description: '',
      base_price: 0,
      discount_percent: 0,
      discount_start_date: '',
      discount_end_date: '',
      is_deals: false
    });
    setEditingDecoration(null);
    setSelectedImages([]);
  };

  const handleManageFreeItems = async (decoration: Decoration) => {
    setEditingDecoration(decoration);
    try {
      const response = await freeItemsService.getAll(decoration.id);
      setFreeItems(response.data || []);
      setShowFreeItemsModal(true);
    } catch (error) {
      console.error('Error fetching free items:', error);
      alert('Failed to fetch free items');
    }
  };

  const handleAddFreeItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDecoration) return;

    try {
      await freeItemsService.create(editingDecoration.id, freeItemForm);
      const response = await freeItemsService.getAll(editingDecoration.id);
      setFreeItems(response.data || []);
      setFreeItemForm({ item_name: '', description: '', quantity: 1 });
      alert('Include item added successfully!');
    } catch (error: any) {
      console.error('Error adding free item:', error);
      alert(error.response?.data?.message || 'Failed to add include item');
    }
  };

  const handleDeleteFreeItem = async (freeItemId: number) => {
    if (!editingDecoration) return;
    if (!confirm('Are you sure you want to delete this include item?')) return;

    try {
      await freeItemsService.delete(editingDecoration.id, freeItemId);
      const response = await freeItemsService.getAll(editingDecoration.id);
      setFreeItems(response.data || []);
      alert('Include item deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting free item:', error);
      alert(error.response?.data?.message || 'Failed to delete include item');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatPriceInput = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handlePriceChange = (value: string, field: 'base_price') => {
    const numbers = value.replace(/\./g, '');
    setFormData({ ...formData, [field]: Number(numbers) || 0 });
  };

  // --- THEMED COMPONENTS ---

  // Reusable Gradient Button Component (The core of your request)
  const GradientButton = ({ children, onClick, className = '', type = 'button', variant = 'primary', disabled = false }: any) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      // The main gradient theme button
      primary: "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 border-none",
      // Secondary button with themed text and border
      secondary: "bg-white text-purple-600 border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-50",
      // Danger button remains red for semantic meaning
      danger: "bg-white text-red-500 border-2 border-red-100 hover:border-red-300 hover:bg-red-50"
    };
    
    return (
      <button 
        type={type} 
        onClick={onClick} 
        disabled={disabled}
        className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}
      >
        {children}
      </button>
    );
  };

  // Custom Card Component for cleaner look against white background
  const DecorationCard = ({ children, className = '' }: any) => (
      <div className={`bg-white rounded-2xl shadow hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 ${className}`}>
          {children}
      </div>
  );

  if (isLoading) {
    return (
      // Background changed to gray-50 (clean look)
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
           <p className="text-gray-600 mt-4 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    // Main background changed to gray-50
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={user} />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header & Stats Area */}
        <div className="mb-8">
          {/* Removed glassmorphism, used solid white background */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                {/* Title retains the gradient text effect */}
                <h1 className="text-3xl font-bold bg-clip-text text-black">
                  Decoration Management
                </h1>
                <p className="text-gray-500 mt-1">Manage your catalogue, prices, and deals.</p>
              </div>
              <div className="hidden md:block">
                 <span className="bg-purple-50 text-purple-700 border border-purple-100 px-4 py-2 rounded-full text-sm font-semibold">
                    Total: {decorations.length} Items
                 </span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {/* Inputs now have clean white background but themed focus ring */}
                <input
                  type="text"
                  placeholder="Search decorations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all"
                />
              </div>
              <div className="md:col-span-4">
                <input
                  type="text"
                  placeholder="Filter by region..."
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all"
                />
              </div>
              <div className="md:col-span-3">
                {/* Themed Gradient Button */}
                <GradientButton onClick={() => setShowModal(true)} className="w-full h-full text-lg">
                  <FaPlus className="mr-2" /> Add New
                </GradientButton>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 shadow-sm">
            <p className="font-semibold flex items-center"><FaTimes className="mr-2"/> Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Decorations Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decorations.map((decoration) => (
              // Using custom DecorationCard component defined above
              <DecorationCard key={decoration.id} className="group">
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  {decoration.images && decoration.images.length > 0 ? (
                    <img
                      src={getImageUrl(decoration.images[0].image)}
                      alt={decoration.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                      <FaImage size={48} />
                    </div>
                  )}
                  
                  {/* Overlay gradient only on image hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {decoration.is_deals && (
                    // Deal badge retains gradient
                    <span className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      HOT DEAL
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                     <span className="bg-white/95 text-purple-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center shadow-sm">
                       <FaTag className="mr-1" /> {decoration.category}
                     </span>
                     <span className="bg-white/95 text-pink-600 px-2 py-1 rounded-lg text-xs font-bold flex items-center shadow-sm">
                       <FaMapMarkerAlt className="mr-1" /> {decoration.region}
                     </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-purple-700 transition-colors">{decoration.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{decoration.description}</p>
                  
                  {/* Price block uses themed light background */}
                  <div className="mb-5 bg-purple-50 p-3 rounded-xl border border-purple-100">
                    <div className="flex items-end justify-between">
                       <div>
                          <p className="text-xs text-purple-500 font-semibold uppercase tracking-wider">Final Price</p>
                          <div className="text-xl font-bold text-purple-800">
                            {formatPrice(decoration.final_price)}
                          </div>
                       </div>
                       {decoration.discount_percent && decoration.discount_percent > 0 ? (
                         <div className="text-right">
                           <span className="block text-xs text-gray-400 line-through">{formatPrice(decoration.base_price)}</span>
                           <span className="text-xs text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-100">-{decoration.discount_percent}%</span>
                         </div>
                       ) : null}
                    </div>
                  </div>

                  {/* Action Buttons using GradientButton component */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <GradientButton variant="secondary" onClick={() => handleManageImages(decoration)} className="text-xs py-1.5">
                       <FaImage className="mr-1" /> Gallery ({decoration.images?.length || 0})
                    </GradientButton>
                    <GradientButton variant="secondary" onClick={() => handleManageFreeItems(decoration)} className="text-xs py-1.5">
                       <FaGift className="mr-1" /> Items ({decoration.freeItems?.length || 0})
                    </GradientButton>
                  </div>
                  
                  <div className="flex gap-2 border-t pt-3 border-gray-100">
                    <GradientButton onClick={() => handleEdit(decoration)} className="flex-1 text-sm py-1.5">
                      <FaEdit className="mr-1" /> Edit
                    </GradientButton>
                    <GradientButton variant="danger" onClick={() => handleDelete(decoration.id)} className="w-10 px-0 flex items-center justify-center">
                      <FaTrash />
                    </GradientButton>
                  </div>
                </div>
              </DecorationCard>
            ))}
          </div>
        )}

        {decorations.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200">
            <div className="bg-gray-100 inline-flex p-4 rounded-full mb-4">
                <FaSearch className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-600 text-lg font-medium">No decorations found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or add a new one.</p>
          </div>
        )}

      {/* --- MODALS SECTION --- */}
      
      {/* Add/Edit Modal */}
      {showModal && (
        // Standard dim overlay instead of purple
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          {/* Clean white modal */}
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-8 transform transition-all scale-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4 border-gray-100">
              {editingDecoration ? 'Edit Decoration' : 'New Decoration'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-5 mb-6">
                {/* Inputs have standard gray borders but themed focus states */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Decoration Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Region *</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., Jakarta"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Base Price (IDR) *</label>
                  <input
                    type="text"
                    value={formatPriceInput(formData.base_price.toString())}
                    onChange={(e) => handlePriceChange(e.target.value, 'base_price')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="0"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
                
                {/* Themed accent block for discounts */}
                <div className="col-span-2 bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <h4 className="text-sm font-bold text-purple-800 mb-3 uppercase tracking-wide">Discount Settings</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Discount (%)</label>
                        <input
                            type="number"
                            value={formData.discount_percent}
                            onChange={(e) => setFormData({ ...formData, discount_percent: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            min="0" max="100"
                        />
                        </div>
                        <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={formData.discount_start_date}
                            onChange={(e) => setFormData({ ...formData, discount_start_date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        </div>
                        <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                        <input
                            type="date"
                            value={formData.discount_end_date}
                            onChange={(e) => setFormData({ ...formData, discount_end_date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        </div>
                    </div>
                </div>

                {!editingDecoration && (
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Images</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <FaImage className="mx-auto text-gray-400 mb-2" size={24} />
                        <p className="text-sm text-gray-500">Drop files here or click to upload</p>
                        {selectedImages.length > 0 && (
                            <div className="mt-2 text-pink-600 font-medium text-sm bg-pink-50 inline-block px-3 py-1 rounded-full border border-pink-100">
                                {selectedImages.length} file(s) selected
                            </div>
                        )}
                    </div>
                  </div>
                )}
                
                <div className="col-span-2">
                  <label className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.is_deals}
                      onChange={(e) => setFormData({ ...formData, is_deals: e.target.checked })}
                      // Checkbox uses theme color
                      className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Mark as Special Deal</span>
                  </label>
                </div>
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
                  {editingDecoration ? 'Update Changes' : 'Create Decoration'}
                </GradientButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Management Modal */}
      {showImageModal && editingDecoration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              {/* Icon accent uses theme color */}
              <span className="bg-purple-50 border border-purple-100 p-2 rounded-lg text-purple-600"><FaImage/></span>
              Manage Images
            </h2>
            
            <div className="mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-3">Add New Images</label>
              <div className="flex gap-4 items-end">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                  />
                  <GradientButton
                    onClick={() => handleImageUpload(editingDecoration.id)}
                    className="whitespace-nowrap"
                    disabled={selectedImages.length === 0}
                  >
                    Upload Selected
                  </GradientButton>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800">Current Gallery ({editingDecoration.images?.length || 0})</h3>
              {editingDecoration.images && editingDecoration.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {editingDecoration.images.map((img) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden shadow-sm aspect-square border border-gray-200">
                      <img
                        src={getImageUrl(img.image)}
                        alt="Decoration"
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
                  setEditingDecoration(null);
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

      {/* Free Items Modal */}
      {showFreeItemsModal && editingDecoration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    {/* Icon accent uses theme color */}
                    <span className="bg-pink-50 border border-pink-100 p-2 rounded-lg text-pink-600"><FaGift/></span>
                    Manage Included Items
                </h2>
                <button
                  onClick={() => {
                    setShowFreeItemsModal(false);
                    setEditingDecoration(null);
                    setFreeItems([]);
                    fetchDecorations();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Form (Themed accent block) */}
                  <div className="lg:col-span-1">
                      <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 sticky top-0">
                        <h3 className="font-bold text-purple-900 mb-4">Add New Item</h3>
                        <form onSubmit={handleAddFreeItem} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Item Name</label>
                                <input
                                type="text"
                                value={freeItemForm.item_name}
                                onChange={(e) => setFreeItemForm({ ...freeItemForm, item_name: e.target.value })}
                                className="w-full mt-1 px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                placeholder="e.g. Video Cinematic"
                                required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                <textarea
                                value={freeItemForm.description}
                                onChange={(e) => setFreeItemForm({ ...freeItemForm, description: e.target.value })}
                                className="w-full mt-1 px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                rows={2}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Quantity</label>
                                <input
                                type="number"
                                value={freeItemForm.quantity}
                                onChange={(e) => setFreeItemForm({ ...freeItemForm, quantity: parseInt(e.target.value) || 1 })}
                                className="w-full mt-1 px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                min={1}
                                required
                                />
                            </div>
                            <GradientButton type="submit" className="w-full mt-2">
                                <FaPlus className="mr-2" /> Add Item
                            </GradientButton>
                        </form>
                      </div>
                  </div>

                  {/* Right Column: List */}
                  <div className="lg:col-span-2">
                    <h3 className="font-bold text-gray-800 mb-4">Included Package List ({freeItems.length})</h3>
                    {freeItems.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                            <FaGift className="mx-auto text-gray-300 text-4xl mb-3"/>
                            <p className="text-gray-500">No included items yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                        {freeItems.map((item) => (
                            <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="bg-green-50 text-green-600 border border-green-100 p-3 rounded-lg">
                                        <FaGift />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{item.item_name} <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full ml-2">x{item.quantity}</span></h4>
                                        {item.description && (
                                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteFreeItem(item.id)}
                                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                        </div>
                    )}
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}
        
      </div>
    </div>
  );
}