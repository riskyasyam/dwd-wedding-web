'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import { advertisementService, Advertisement } from '@/lib/crudService';
import { getImageUrl } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { FiPlus, FiEdit, FiTrash, FiImage, FiExternalLink, FiEye, FiEyeOff, FiX } from 'react-icons/fi';

export default function AdvertisementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
    setShowForm(true);
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
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex">
      <AdminSidebar user={user} />
      <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Advertisements</h1>
            <p className="text-gray-600 mt-1">Manage banner/promotional images</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-pink-400 to-purple-400 text-white"
          >
            <FiPlus className="mr-2" />
            {showForm ? 'Cancel' : 'Add Advertisement'}
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search advertisements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Edit Advertisement' : 'Add New Advertisement'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Link URL</label>
                    <input
                      type="url"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium">Active</label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Banner Image {!editingId && '*'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required={!editingId}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button type="submit" className="bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" onClick={resetForm} variant="outline">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid gap-6">
            {advertisements.map((ad) => (
              <Card key={ad.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="w-64 h-40 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={getImageUrl(ad.image)}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">{ad.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {ad.is_active ? (
                              <span className="flex items-center text-green-600 text-sm">
                                <FiEye className="mr-1" /> Active
                              </span>
                            ) : (
                              <span className="flex items-center text-gray-400 text-sm">
                                <FiEyeOff className="mr-1" /> Inactive
                              </span>
                            )}
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">Order: {ad.order}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(ad)}
                            variant="outline"
                            size="sm"
                          >
                            <FiEdit className="mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(ad.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiTrash className="mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      {ad.description && (
                        <p className="text-gray-600 mb-2">{ad.description}</p>
                      )}

                      {ad.link_url && (
                        <a
                          href={ad.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-pink-600 hover:text-pink-700 text-sm"
                        >
                          <FiExternalLink className="mr-1" />
                          {ad.link_url}
                        </a>
                      )}

                      {(ad.start_date || ad.end_date) && (
                        <div className="mt-2 text-sm text-gray-500">
                          {ad.start_date && (
                            <span>From: {new Date(ad.start_date).toLocaleDateString()}</span>
                          )}
                          {ad.start_date && ad.end_date && <span className="mx-2">•</span>}
                          {ad.end_date && (
                            <span>Until: {new Date(ad.end_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {advertisements.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  <FiImage className="mx-auto text-4xl mb-2" />
                  <p>No advertisements found</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
