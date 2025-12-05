'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { eventService, Event } from '@/lib/crudService';
import { authService, User } from '@/lib/auth';
import { getImageUrl } from '@/lib/axios';
import AdminSidebar from '@/components/layout/AdminSidebar';
// Hapus import component UI bawaan, kita gunakan custom style
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaImage, FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import Image from 'next/image';

export default function EventsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    end_date: '',
    location: '',
    short_description: '',
    full_description: '',
    organizer: ''
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
        fetchEvents();
      } catch (error) {
        router.push('/login');
      }
    };
    fetchUserAndData();
  }, [router]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      
      const response = await eventService.getAll(params);
      setEvents(response.data?.data || response.data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      setError(error.response?.data?.message || 'Failed to fetch events. Please make sure the backend is running.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchEvents();
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        if (bannerFile) {
          const formDataToSend = new FormData();
          Object.entries(formData).forEach(([key, value]) => {
            formDataToSend.append(key, value);
          });
          formDataToSend.append('banner_image', bannerFile);
          await eventService.update(editingEvent.id, formDataToSend);
        } else {
          await eventService.update(editingEvent.id, formData);
        }
        alert('Event updated successfully');
      } else {
        if (bannerFile) {
          const formDataToSend = new FormData();
          Object.entries(formData).forEach(([key, value]) => {
            formDataToSend.append(key, value);
          });
          formDataToSend.append('banner_image', bannerFile);
          const response = await eventService.create(formDataToSend);
          
          if (selectedImages.length > 0 && response.data?.id) {
            await eventService.uploadImages(response.data.id, selectedImages);
          }
        } else {
          const response = await eventService.create(formData);
          if (selectedImages.length > 0 && response.data?.id) {
            await eventService.uploadImages(response.data.id, selectedImages);
          }
        }
        alert('Event created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      console.error('Error saving event:', error);
      alert(error.response?.data?.message || 'Failed to save event');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      start_date: event.start_date.split('T')[0], // Ensure date format for input
      end_date: event.end_date.split('T')[0],
      location: event.location,
      short_description: event.short_description,
      full_description: event.full_description,
      organizer: event.organizer || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await eventService.delete(id);
      alert('Event deleted successfully');
      fetchEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      alert(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleManageImages = (event: Event) => {
    setEditingEvent(event);
    setShowImageModal(true);
  };

  const handleImageUpload = async (eventId: number) => {
    if (selectedImages.length === 0) {
      alert('Please select images to upload');
      return;
    }

    try {
      await eventService.uploadImages(eventId, selectedImages);
      alert('Images uploaded successfully');
      setShowImageModal(false);
      setSelectedImages([]);
      setEditingEvent(null);
      fetchEvents();
    } catch (error: any) {
      console.error('Error uploading images:', error);
      alert(error.response?.data?.message || 'Failed to upload images');
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await eventService.deleteImage(imageId);
      alert('Image deleted successfully');
      fetchEvents();
    } catch (error: any) {
      console.error('Error deleting image:', error);
      alert(error.response?.data?.message || 'Failed to delete image');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      start_date: '',
      end_date: '',
      location: '',
      short_description: '',
      full_description: '',
      organizer: ''
    });
    setEditingEvent(null);
    setSelectedImages([]);
    setBannerFile(null);
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
           <p className="text-gray-600 mt-4 font-medium">Loading Events...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={user} />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header Section */}
        <div className="mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-black">
                        Event Management
                        </h1>
                        <p className="text-gray-500 mt-1">Manage wedding exhibitions and events.</p>
                    </div>
                    <div className="hidden md:block">
                        <span className="bg-purple-50 text-purple-700 border border-purple-100 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                             Total: {events.length} Events
                        </span>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <GradientButton onClick={() => setShowModal(true)}>
                        <FaPlus className="mr-2" /> Add Event
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

        {/* Events Grid */}
        {loading ? (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        ) : events.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200">
                <div className="bg-gray-100 inline-flex p-4 rounded-full mb-4">
                    <FaCalendarAlt className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-600 text-lg font-medium">No events found</p>
                <p className="text-gray-400 text-sm">Create a new event to get started.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <div key={event.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full">
                        {/* Image Section */}
                        <div className="relative h-52 bg-gray-200 overflow-hidden">
                            {event.banner_image ? (
                                <Image
                                    src={getImageUrl(event.banner_image)}
                                    alt={event.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
                                    <FaImage size={48} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        {/* Content Section */}
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1" title={event.title}>
                                {event.title}
                            </h3>
                            
                            <div className="space-y-2 mb-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <FaCalendarAlt className="text-pink-500 shrink-0" />
                                    <span>{new Date(event.start_date).toLocaleDateString('id-ID')} - {new Date(event.end_date).toLocaleDateString('id-ID')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-purple-500 shrink-0" />
                                    <span className="line-clamp-1">{event.location}</span>
                                </div>
                                {event.organizer && (
                                    <div className="flex items-center gap-2">
                                        <FaUser className="text-blue-500 shrink-0" />
                                        <span className="line-clamp-1">{event.organizer}</span>
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                                {event.short_description}
                            </p>

                            {/* Actions */}
                            <div className="space-y-2 pt-4 border-t border-gray-100 mt-auto">
                                <GradientButton variant="secondary" onClick={() => handleManageImages(event)} className="w-full text-sm py-1.5">
                                    <FaImage className="mr-2" /> Gallery ({event.images?.length || 0})
                                </GradientButton>
                                <div className="flex gap-2">
                                    <GradientButton onClick={() => handleEdit(event)} className="flex-1 text-sm py-1.5">
                                        <FaEdit className="mr-1" /> Edit
                                    </GradientButton>
                                    <GradientButton variant="danger" onClick={() => handleDelete(event.id)} className="w-10 px-0 flex items-center justify-center">
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
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-red-500 transition-colors">
                  <FaTimes size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-5 mb-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                    <div className="relative">
                        <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                        />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Organizer</label>
                    <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                        type="text"
                        value={formData.organizer}
                        onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description *</label>
                    <textarea
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Description *</label>
                    <textarea
                      value={formData.full_description}
                      onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Banner Image {!editingEvent && '*'}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                         <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                            required={!editingEvent}
                        />
                    </div>
                  </div>

                  {!editingEvent && (
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Gallery Images (Optional)</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setSelectedImages(e.target.files ? Array.from(e.target.files) : [])}
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
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1"
                  >
                    Cancel
                  </GradientButton>
                  <GradientButton type="submit" className="flex-1">
                    {editingEvent ? 'Save Changes' : 'Create Event'}
                  </GradientButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Image Management Modal */}
        {showImageModal && editingEvent && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="bg-purple-50 border border-purple-100 p-2 rounded-lg text-purple-600"><FaImage/></span>
                    Manage Gallery - {editingEvent.title}
                </h2>
                
                <div className="mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Add New Images</label>
                    <div className="flex gap-4 items-end">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setSelectedImages(e.target.files ? Array.from(e.target.files) : [])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                        />
                        <GradientButton
                            onClick={() => handleImageUpload(editingEvent.id)}
                            className="whitespace-nowrap"
                            disabled={selectedImages.length === 0}
                        >
                            Upload Selected
                        </GradientButton>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Current Gallery ({editingEvent.images?.length || 0})</h3>
                    {editingEvent.images && editingEvent.images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {editingEvent.images.map((img) => (
                            <div key={img.id} className="relative group rounded-xl overflow-hidden shadow-sm aspect-square border border-gray-200">
                            <Image
                                src={getImageUrl(img.image)}
                                alt="Event Gallery"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => handleDeleteImage(img.id)}
                                    className="bg-white text-red-500 p-3 rounded-full hover:bg-red-50 transition-colors transform hover:scale-110 shadow-sm"
                                >
                                    <FaTimes />
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
                        setEditingEvent(null);
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