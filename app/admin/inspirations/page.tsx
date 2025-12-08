'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import { inspirationService, Inspiration } from '@/lib/crudService';
import { getImageUrl } from '@/lib/axios';
import AdminSidebar from '@/components/layout/AdminSidebar';
// Menggunakan react-icons/fa
import { FaPlus, FaEdit, FaTrash, FaSearch, FaHeart, FaTimes, FaMapMarkerAlt, FaPalette, FaCheck } from 'react-icons/fa';

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
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
           <p className="text-gray-600 mt-4 font-medium">Loading Inspirations...</p>
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
                        Inspiration Gallery
                        </h1>
                        <p className="text-gray-500 mt-1">Manage wedding ideas and color palettes.</p>
                    </div>
                    <div className="hidden md:block">
                        <span className="bg-purple-50 text-purple-700 border border-purple-100 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                             Total: {inspirations.length} Items
                        </span>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search inspirations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="w-64">
                        <select
                            value={filterColor}
                            onChange={(e) => setFilterColor(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">All Colors</option>
                            {colorOptions.map(color => (
                                <option key={color.code} value={color.code}>{color.name}</option>
                            ))}
                        </select>
                    </div>
                    <GradientButton onClick={() => setShowModal(true)}>
                        <FaPlus className="mr-2" /> Add Inspiration
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

        {/* Inspirations Grid */}
        {loading ? (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        ) : inspirations.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200">
                <div className="bg-gray-100 inline-flex p-4 rounded-full mb-4">
                    <FaPalette className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-600 text-lg font-medium">No inspirations found</p>
                <p className="text-gray-400 text-sm">Add new ideas to the gallery.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {inspirations.map((inspiration) => (
                    <div key={inspiration.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full">
                        {/* Image Section */}
                        <div className="relative h-64 bg-gray-100 overflow-hidden">
                            <img
                                src={getImageUrl(inspiration.image)}
                                alt={inspiration.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-pink-500 shadow-sm">
                                <FaHeart size={12} />
                                <span className="text-xs font-bold">{inspiration.liked_count}</span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <span className="text-white text-sm font-medium flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-pink-400" /> {inspiration.location}
                                </span>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-1" title={inspiration.title}>
                                {inspiration.title}
                            </h3>
                            
                            <div className="flex flex-wrap gap-2 mb-4 flex-1 content-start">
                                {inspiration.colors && inspiration.colors.map((colorCode, index) => (
                                    <div 
                                        key={index}
                                        className="group/color relative"
                                        title={colorOptions.find(c => c.code === colorCode)?.name || colorCode}
                                    >
                                        <div 
                                            className="w-6 h-6 rounded-full border border-gray-200 shadow-sm ring-1 ring-transparent group-hover/color:ring-gray-300 transition-all" 
                                            style={{ backgroundColor: colorCode }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-3 border-t border-gray-100 mt-auto">
                                <GradientButton variant="secondary" onClick={() => handleEdit(inspiration)} className="flex-1 text-xs py-1.5">
                                    <FaEdit className="mr-1" /> Edit
                                </GradientButton>
                                <GradientButton variant="danger" onClick={() => handleDelete(inspiration.id)} className="w-8 px-0 flex items-center justify-center">
                                    <FaTrash size={12} />
                                </GradientButton>
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
                        {editingInspiration ? 'Edit Inspiration' : 'Add New Inspiration'}
                    </h2>
                    <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-red-500 transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="e.g., Elegant White Beach Wedding"
                            required
                            maxLength={255}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                        <div className="relative">
                            <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                placeholder="e.g., Bali, Indonesia"
                                required
                                maxLength={255}
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                            Primary Colors * <span className="text-gray-400 font-normal text-xs">(Select one or more)</span>
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                            {colorOptions.map(color => {
                                const isSelected = formData.colors.includes(color.code);
                                return (
                                    <button
                                        key={color.code}
                                        type="button"
                                        onClick={() => toggleColor(color.code)}
                                        className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all duration-200 ${
                                            isSelected 
                                            ? 'border-purple-500 bg-purple-50 shadow-sm transform scale-105' 
                                            : 'border-transparent hover:bg-gray-100 hover:border-gray-200'
                                        }`}
                                    >
                                        <div className="relative">
                                            <div 
                                                className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" 
                                                style={{ backgroundColor: color.code }}
                                            />
                                            {isSelected && (
                                                <div className="absolute -top-1 -right-1 bg-purple-600 text-white rounded-full p-0.5 shadow-sm border border-white">
                                                    <FaCheck size={8} />
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-medium text-center leading-tight ${isSelected ? 'text-purple-700' : 'text-gray-500'}`}>
                                            {color.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {formData.colors.length === 0 && (
                            <p className="text-xs text-red-500 mt-2 font-medium">Please select at least one color palette.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Inspiration Image * <span className="font-normal text-gray-400">{editingInspiration && '(Leave empty to keep current)'}</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                                required={!editingInspiration}
                            />
                        </div>
                        {imagePreview && (
                            <div className="mt-4 relative rounded-xl overflow-hidden shadow-md border border-gray-200 w-full h-48">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">Preview</div>
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
                            {editingInspiration ? 'Save Changes' : 'Create Inspiration'}
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