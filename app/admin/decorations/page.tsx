'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import { decorationService, freeItemsService, Decoration, FreeItem } from '@/lib/crudService';
import { getImageUrl } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaImage, FaTimes, FaGift } from 'react-icons/fa';
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
        
        // Upload images if any
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
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    // Add thousand separators
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handlePriceChange = (value: string, field: 'base_price') => {
    // Remove dots to get the actual number
    const numbers = value.replace(/\./g, '');
    setFormData({ ...formData, [field]: Number(numbers) || 0 });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={user} />
      
      <div className="flex-1 ml-64">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Decorations</h1>
            <p className="text-gray-600">Manage decoration products</p>
          </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search decorations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <input
          type="text"
          placeholder="Filter by region..."
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <FaPlus className="mr-2" /> Add Decoration
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Decorations Grid */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decorations.map((decoration) => (
            <Card key={decoration.id} className="overflow-hidden">
              <div className="relative h-48 bg-gray-200">
                {decoration.images && decoration.images.length > 0 ? (
                  <img
                    src={getImageUrl(decoration.images[0].image)}
                    alt={decoration.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <FaImage size={48} />
                  </div>
                )}
                {decoration.is_deals && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    DEALS
                  </span>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{decoration.name}</CardTitle>
                <div className="text-sm text-gray-600">
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                    {decoration.category}
                  </span>
                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded">
                    {decoration.region}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3 line-clamp-2">{decoration.description}</p>
                <div className="mb-4">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(decoration.final_price)}
                  </div>
                  {decoration.discount_percent && decoration.discount_percent > 0 && (
                    <div className="text-sm text-gray-500">
                      <span className="line-through">{formatPrice(decoration.base_price)}</span>
                      <span className="ml-2 text-red-600 font-semibold">-{decoration.discount_percent}%</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mb-2">
                  <Button
                    onClick={() => handleManageImages(decoration)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <FaImage className="mr-1" /> Images ({decoration.images?.length || 0})
                  </Button>
                  <Button
                    onClick={() => handleManageFreeItems(decoration)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <FaGift className="mr-1" /> Include ({decoration.freeItems?.length || 0})
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(decoration)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <FaEdit className="mr-1" /> Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(decoration.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {decorations.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          No decorations found
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8 p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingDecoration ? 'Edit Decoration' : 'Add Decoration'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Decoration Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region *
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Jakarta, Bandung, Surabaya"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price (IDR) *
                  </label>
                  <input
                    type="text"
                    value={formatPriceInput(formData.base_price.toString())}
                    onChange={(e) => handlePriceChange(e.target.value, 'base_price')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 10.000.000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.discount_start_date}
                    onChange={(e) => setFormData({ ...formData, discount_start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount End Date
                  </label>
                  <input
                    type="date"
                    value={formData.discount_end_date}
                    onChange={(e) => setFormData({ ...formData, discount_end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {!editingDecoration && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images (Upload after creation)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {selectedImages.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedImages.length} file(s) selected
                      </p>
                    )}
                  </div>
                )}
                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_deals}
                      onChange={(e) => setFormData({ ...formData, is_deals: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Mark as Deals</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {editingDecoration ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Management Modal */}
      {showImageModal && editingDecoration && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8 p-6">
            <h2 className="text-2xl font-bold mb-4">
              Manage Images - {editingDecoration.name}
            </h2>
            
            {/* Upload New Images */}
            <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload New Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {selectedImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedImages.length} file(s) selected
                  </p>
                  <Button
                    onClick={() => handleImageUpload(editingDecoration.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Upload Images
                  </Button>
                </div>
              )}
            </div>

            {/* Existing Images */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Current Images ({editingDecoration.images?.length || 0})</h3>
              {editingDecoration.images && editingDecoration.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {editingDecoration.images.map((img) => (
                    <div key={img.id} className="relative group">
                      <div className="relative h-32 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={getImageUrl(img.image)}
                          alt="Decoration"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No images uploaded yet</p>
              )}
            </div>

            <div className="mt-6">
              <Button
                onClick={() => {
                  setShowImageModal(false);
                  setEditingDecoration(null);
                  setSelectedImages([]);
                }}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Free Items Modal */}
      {showFreeItemsModal && editingDecoration && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-bold">
                  Manage Include Items - {editingDecoration.name}
                </h2>
                <button
                  onClick={() => {
                    setShowFreeItemsModal(false);
                    setEditingDecoration(null);
                    setFreeItems([]);
                    setFreeItemForm({ item_name: '', description: '', quantity: 1 });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Add Free Item Form */}
              <form onSubmit={handleAddFreeItem} className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Add New Include Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name * (e.g., Cinematic Video, Makeup Artist, Foto & Video)
                    </label>
                    <input
                      type="text"
                      value={freeItemForm.item_name}
                      onChange={(e) => setFreeItemForm({ ...freeItemForm, item_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Cinematic Video, Foto & Video"
                      required
                      maxLength={255}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={freeItemForm.description}
                      onChange={(e) => setFreeItemForm({ ...freeItemForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Professional HD cinematic wedding video with drone coverage"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={freeItemForm.quantity}
                      onChange={(e) => setFreeItemForm({ ...freeItemForm, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={1}
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full">
                      <FaPlus className="mr-2" /> Add Item
                    </Button>
                  </div>
                </div>
              </form>

              {/* Free Items List */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Current Include Items ({freeItems.length})
                </h3>
                {freeItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No include items yet. Add your first one above!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {freeItems.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4 flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FaGift className="text-green-600" />
                            <h4 className="font-semibold text-lg">{item.item_name}</h4>
                            <span className="text-sm text-gray-500">× {item.quantity}</span>
                          </div>
                          {item.description && (
                            <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleDeleteFreeItem(item.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => {
                    setShowFreeItemsModal(false);
                    setEditingDecoration(null);
                    setFreeItems([]);
                    setFreeItemForm({ item_name: '', description: '', quantity: 1 });
                    fetchDecorations(); // Reload to get updated free items count
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
