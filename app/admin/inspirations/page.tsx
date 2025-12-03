'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import { inspirationService, Inspiration } from '@/lib/crudService';
import { getImageUrl } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaHeart, FaTimes } from 'react-icons/fa';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function InspirationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInspiration, setEditingInspiration] = useState<Inspiration | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    colors: [] as string[],
    location: ''
  });

  const colorOptions = [
    { name: 'Red', code: '#FF383C' },
    { name: 'Light Pink', code: '#F49998' },
    { name: 'Orange', code: '#FEB749' },
    { name: 'Yellow', code: '#FFED90' },
    { name: 'Light Green', code: '#91CC76' },
    { name: 'Green', code: '#749B4C' },
    { name: 'Cyan', code: '#42BFD0' },
    { name: 'Light Blue', code: '#AEDAF5' },
    { name: 'Blue', code: '#4269AF' },
    { name: 'Lavender', code: '#9CA2EE' },
    { name: 'Purple', code: '#9465C3' },
    { name: 'Pink', code: '#FDBBCC' },
    { name: 'Magenta', code: '#DF2886' },
    { name: 'Brown', code: '#A56E5C' },
    { name: 'Dark Gray', code: '#2F2F2F' },
    { name: 'Gold', code: '#AC894D' },
    { name: 'Light Gray', code: '#D3D3D3' },
    { name: 'Beige', code: '#E4D19C' },
    { name: 'Silver', code: '#D2D2D2' }
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
        fetchInspirations();
      } catch (error) {
        router.push('/login');
      }
    };

    fetchUserAndData();
  }, [router]);

  const fetchInspirations = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterColor) params.color = filterColor;
      
      const response = await inspirationService.getAll(params);
      setInspirations(response.data?.data || response.data || []);
    } catch (error: any) {
      console.error('Error fetching inspirations:', error);
      setError(error.response?.data?.message || 'Failed to fetch inspirations');
      setInspirations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchInspirations();
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm, filterColor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitFormData = new FormData();
      submitFormData.append('title', formData.title);
      // Append colors array
      formData.colors.forEach(color => {
        submitFormData.append('colors[]', color);
      });
      submitFormData.append('location', formData.location);
      
      if (selectedImage) {
        submitFormData.append('image', selectedImage);
      }

      if (editingInspiration) {
        await inspirationService.update(editingInspiration.id, submitFormData);
        alert('Inspiration updated successfully');
      } else {
        if (!selectedImage) {
          alert('Please select an image');
          return;
        }
        await inspirationService.create(submitFormData);
        alert('Inspiration created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchInspirations();
    } catch (error: any) {
      console.error('Error saving inspiration:', error);
      alert(error.response?.data?.message || 'Failed to save inspiration');
    }
  };

  const handleEdit = (inspiration: Inspiration) => {
    setEditingInspiration(inspiration);
    setFormData({
      title: inspiration.title,
      colors: inspiration.colors || [],
      location: inspiration.location
    });
    setImagePreview(getImageUrl(inspiration.image));
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this inspiration?')) return;
    
    try {
      await inspirationService.delete(id);
      alert('Inspiration deleted successfully');
      fetchInspirations();
    } catch (error: any) {
      console.error('Error deleting inspiration:', error);
      alert(error.response?.data?.message || 'Failed to delete inspiration');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      colors: [],
      location: ''
    });
    setEditingInspiration(null);
    setSelectedImage(null);
    setImagePreview('');
  };

  const toggleColor = (colorCode: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(colorCode)
        ? prev.colors.filter(c => c !== colorCode)
        : [...prev.colors, colorCode]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Inspirations</h1>
            <p className="text-gray-600">Manage inspiration gallery</p>
          </div>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search inspirations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Colors</option>
              {colorOptions.map(color => (
                <option key={color.code} value={color.code}>{color.name}</option>
              ))}
            </select>
            <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <FaPlus className="mr-2" /> Add Inspiration
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Inspirations Grid */}
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {inspirations.map((inspiration) => (
                <Card key={inspiration.id} className="overflow-hidden">
                  <div className="relative h-64 bg-gray-200">
                    <img
                      src={getImageUrl(inspiration.image)}
                      alt={inspiration.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full flex items-center gap-1 text-red-500">
                      <FaHeart size={14} />
                      <span className="text-xs font-semibold">{inspiration.liked_count}</span>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{inspiration.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {inspiration.colors && inspiration.colors.map((colorCode, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs border border-gray-300"
                        >
                          <span 
                            className="w-3 h-3 rounded-full border border-gray-300" 
                            style={{ backgroundColor: colorCode }}
                          />
                          {colorOptions.find(c => c.code === colorCode)?.name || colorCode}
                        </span>
                      ))}
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {inspiration.location}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(inspiration)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(inspiration.id)}
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

          {inspirations.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              No inspirations found
            </div>
          )}

          {/* Add/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">
                    {editingInspiration ? 'Edit Inspiration' : 'Add Inspiration'}
                  </h2>
                  <button onClick={() => { setShowModal(false); resetForm(); }}>
                    <FaTimes className="text-gray-500 hover:text-gray-700" />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Elegant White Beach Wedding"
                        required
                        maxLength={255}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Colors * (Select one or more)
                      </label>
                      <div className="grid grid-cols-5 gap-3">
                        {colorOptions.map(color => (
                          <button
                            key={color.code}
                            type="button"
                            onClick={() => toggleColor(color.code)}
                            className="flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all hover:border-blue-300"
                            style={{
                              borderColor: formData.colors.includes(color.code) ? '#3B82F6' : '#E5E7EB',
                              backgroundColor: formData.colors.includes(color.code) ? '#EFF6FF' : 'white'
                            }}
                            title={color.name}
                          >
                            <div
                              className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                              style={{ backgroundColor: color.code }}
                            />
                            <span className="text-xs text-gray-600 text-center leading-tight">
                              {color.name}
                            </span>
                          </button>
                        ))}
                      </div>
                      {formData.colors.length === 0 && (
                        <p className="text-sm text-red-500 mt-1">Please select at least one color</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Indonesia, Eropa"
                        required
                        maxLength={255}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image * {editingInspiration && '(Leave empty to keep current image)'}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!editingInspiration}
                      />
                      {imagePreview && (
                        <div className="mt-3">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}
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
                      {editingInspiration ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
