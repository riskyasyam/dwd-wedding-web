'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import MenuNav from '@/components/layout/MenuNav';
import Footer from '@/components/layout/Footer';
import api, { getImageUrl } from '@/lib/axios';

interface Inspiration {
  id: number;
  title: string;
  image: string;
  image_url?: string;
  category?: string;
  colors: string[];
  location: string;
  liked_count: number;
  is_saved?: boolean;
  created_at: string;
}

export default function InspirasiPage() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [savingStates, setSavingStates] = useState<{ [key: number]: boolean }>({});
  const [countryList, setCountryList] = useState<string[]>(["All"]);

  const colors = [
    { name: 'Red', hex: '#FF383C' },
    { name: 'Light Pink', hex: '#F49998' },
    { name: 'Orange', hex: '#FEB749' },
    { name: 'Yellow', hex: '#FFED90' },
    { name: 'Light Green', hex: '#91CC76' },
    { name: 'Green', hex: '#749B4C' },
    { name: 'Cyan', hex: '#42BFD0' },
    { name: 'Light Blue', hex: '#AEDAF5' },
    { name: 'Blue', hex: '#4269AF' },
    { name: 'Lavender', hex: '#9CA2EE' },
    { name: 'Purple', hex: '#9465C3' },
    { name: 'Pink', hex: '#FDBBCC' },
    { name: 'Magenta', hex: '#DF2886' },
    { name: 'Brown', hex: '#A56E5C' },
    { name: 'Dark Gray', hex: '#2F2F2F' },
    { name: 'Gold', hex: '#AC894D' },
    { name: 'Light Gray', hex: '#D3D3D3' },
    { name: 'Beige', hex: '#E4D19C' },
    { name: 'Silver', hex: '#D2D2D2' }
  ];

  // Fetch inspirations from API
  useEffect(() => {
    const fetchInspirations = async () => {
      try {
        setLoading(true);
        const params: any = {
          page: currentPage,
          per_page: 20,
          order_by: 'created_at',
          order_dir: 'desc',
          _t: Date.now() // Cache busting
        };

        if (selectedCountry !== "All") {
          params.location = selectedCountry;
        }

        if (selectedColor) {
          params.color = selectedColor;
        }

        // Use public endpoint (auth optional for is_saved field)
        const response = await api.get('/public/inspirations', { 
          params,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const data = response.data.data;
        
        setInspirations(data.data || []);
        setTotalPages(data.last_page || 1);
      } catch (error: any) {
        console.error('Failed to fetch inspirations:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url
        });
        setInspirations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInspirations();
  }, [currentPage, selectedCountry, selectedColor]);

  // Fetch unique locations for country filter
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get('/public/inspirations', { 
          params: { 
            per_page: 1000,
            _t: Date.now() // Cache busting
          },
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const data = response.data.data;
        const allInspirations = data.data || [];
        
        // Extract unique locations
        const uniqueLocations = Array.from(
          new Set(allInspirations.map((item: Inspiration) => item.location))
        ).sort() as string[];
        
        setCountryList(["All", ...uniqueLocations]);
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      }
    };

    fetchLocations();
  }, []);

  const handleToggleSave = async (inspiration: Inspiration) => {
    try {
      setSavingStates(prev => ({ ...prev, [inspiration.id]: true }));
      
      const response = await api.post(`/customer/inspirations/${inspiration.id}/like`);
      
      console.log('Toggle save response:', response.data);
      
      if (response.data.success) {
        // Update UI with new state - use the returned data
        const newIsSaved = response.data.data.is_saved;
        const newLikedCount = response.data.data.liked_count;
        
        console.log('Updating inspiration:', inspiration.id, 'is_saved:', newIsSaved);
        
        setInspirations(prev => {
          const updated = prev.map(item => 
            item.id === inspiration.id 
              ? {
                  ...item,
                  is_saved: newIsSaved,
                  liked_count: newLikedCount
                }
              : item
          );
          console.log('Updated inspirations:', updated.find(i => i.id === inspiration.id));
          return updated;
        });
      }
    } catch (error: any) {
      console.error('Failed to toggle save:', error);
      if (error.response?.status === 401) {
        if (confirm('Please login to save inspirations. Go to login page?')) {
          window.location.href = '/login';
        }
      } else {
        alert('Failed to save inspiration');
      }
    } finally {
      setSavingStates(prev => ({ ...prev, [inspiration.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <MenuNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-12">

        {/* Breadcrumb - Hidden on mobile */}
        <div className="text-sm mb-4 hidden md:block">
          <Link href="/" className="text-[#9A82DB] hover:underline">Home</Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-600">Inspirasi</span>
        </div>

        {/* Title & Mobile Filter Button */}
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Inspirasi</h1>
            <p className="text-sm md:text-base text-gray-600 hidden md:block">
              Showing result for inspiration about all <span className="font-semibold">categories</span> in <span className="font-semibold">{selectedCountry}</span>
            </p>
          </div>
          
          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-[#9A82DB] text-white rounded-full text-sm font-medium shadow-md"
          >
            <svg width="18" height="18" fill="white">
              <path d="M3 4h12l-4.5 6v4l-3 2v-6L3 4z" />
            </svg>
            Filter
          </button>
        </div>

        {/* MAIN LAYOUT */}
        <div className="flex gap-6 md:gap-12">

          {/* LEFT SIDEBAR - Desktop */}
          <div className="hidden md:block w-48 flex-shrink-0">

            {/* Filter Title */}
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>
                <svg width="18" height="18" fill="#555">
                  <path d="M3 4h12l-4.5 6v4l-3 2v-6L3 4z" />
                </svg>
              </span>
              Filter
            </h3>

            {/* Warna */}
            <p className="text-gray-700 font-medium mb-2">Warna</p>

            <div className="grid grid-cols-5 gap-2 mb-8">
              {/* No Filter Button */}
              <div
                className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-all flex items-center justify-center ${
                  selectedColor === null ? 'border-gray-800 scale-110' : 'border-gray-300'
                }`}
                onClick={() => {
                  setSelectedColor(null);
                  setCurrentPage(1);
                }}
                title="No Filter"
              >
                <Image 
                  src="/images/stop.png" 
                  alt="No Filter" 
                  width={24} 
                  height={24}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {colors.map((c, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-all ${
                    selectedColor === c.hex ? 'border-gray-800 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => {
                    setSelectedColor(selectedColor === c.hex ? null : c.hex);
                    setCurrentPage(1);
                  }}
                  title={c.name}
                ></div>
              ))}
            </div>

            {/* Country Select */}
            <div className="relative">
              <button
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="px-4 py-2 bg-[#F3E4FE] text-[#9A82DB] rounded-full text-sm font-semibold flex items-center gap-2"
              >
                <Image src="/images/world.png" width={18} height={18} alt="world" />
                {selectedCountry}
              </button>

              {showCountryDropdown && (
                <div className="absolute mt-2 w-full bg-white border rounded-xl shadow-lg z-20">
                  {countryList.map((country) => (
                    <button
                      key={country}
                      onClick={() => {
                        setSelectedCountry(country);
                        setShowCountryDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      {country}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* MOBILE FILTER MODAL */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Filter</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                {/* Country Select */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-3">Location</label>
                  <div className="grid grid-cols-2 gap-2">
                    {countryList.map((country) => (
                      <button
                        key={country}
                        onClick={() => {
                          setSelectedCountry(country);
                          setCurrentPage(1);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedCountry === country
                            ? 'bg-[#9A82DB] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warna */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-3">Warna</label>
                  <div className="grid grid-cols-8 gap-3">
                    {/* No Filter Button */}
                    <div
                      className={`w-10 h-10 rounded-full cursor-pointer border-2 transition-all flex items-center justify-center ${
                        selectedColor === null ? 'border-gray-800 scale-110' : 'border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedColor(null);
                        setCurrentPage(1);
                      }}
                      title="No Filter"
                    >
                      <Image 
                        src="/images/stop.png" 
                        alt="No Filter" 
                        width={32} 
                        height={32}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    {colors.map((c, i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 rounded-full cursor-pointer border-2 transition-all ${
                          selectedColor === c.hex ? 'border-gray-800 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        onClick={() => {
                          setSelectedColor(selectedColor === c.hex ? null : c.hex);
                          setCurrentPage(1);
                        }}
                        title={c.name}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-3 bg-[#9A82DB] text-white rounded-full font-semibold text-lg shadow-lg hover:bg-[#8871c9] transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* RIGHT CONTENT — MASONRY GRID */}
          <div className="flex-1 w-full">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading inspirations...</p>
                </div>
              </div>
            ) : inspirations.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">No inspirations found</p>
              </div>
            ) : (
              <>
                <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4">
                  {inspirations.map((item) => {
                    // Always use getImageUrl to ensure proper backend URL
                    const imageUrl = getImageUrl(item.image_url || item.image);
                    return (
                    <div key={item.id} className="mb-3 md:mb-4 break-inside-avoid relative group">
                      <Image
                        src={imageUrl}
                        alt={item.title}
                        width={300}
                        height={400}
                        className="w-full rounded-lg md:rounded-xl object-cover"
                      />

                      {/* Overlay with info - Always visible on mobile, hover on desktop */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity rounded-lg md:rounded-xl">
                        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 text-white">
                          <h3 className="font-semibold text-xs md:text-sm mb-1 line-clamp-2">{item.title}</h3>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.colors.slice(0, 3).map((color, idx) => (
                              <span key={idx} className="text-[10px] md:text-xs bg-white/20 px-1.5 md:px-2 py-0.5 rounded-full">
                                {color}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-[10px] md:text-xs">
                            <span>📍 {item.location}</span>
                            <span>❤️ {item.liked_count}</span>
                          </div>
                        </div>
                      </div>

                      {/* Save/Heart icon top right */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleSave(item);
                        }}
                        disabled={savingStates[item.id]}
                        className={`absolute top-1.5 md:top-2 right-1.5 md:right-2 rounded-full p-1.5 md:p-2 shadow-md transition-all ${
                          item.is_saved 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white/90 text-gray-600 hover:bg-white'
                        } ${savingStates[item.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {item.is_saved ? (
                          <svg width="18" height="18" fill="currentColor" className="md:w-5 md:h-5">
                            <path d="M9 3.5c-1.74-1.3-4.5-1.3-6 .5-2.5 2.5-1 6.5 2 9 1.5 1.2 3 2.3 4 3 1-.7 2.5-1.8 4-3 3-2.5 4.5-6.5 2-9-1.5-1.8-4.26-1.8-6-.5z"/>
                          </svg>
                        ) : (
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-5 md:h-5">
                            <path d="M9 3.5c-1.74-1.3-4.5-1.3-6 .5-2.5 2.5-1 6.5 2 9 1.5 1.2 3 2.3 4 3 1-.7 2.5-1.8 4-3 3-2.5 4.5-6.5 2-9-1.5-1.8-4.26-1.8-6-.5z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6 md:mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 md:px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm md:text-base"
                    >
                      Previous
                    </button>
                    
                    <div className="flex gap-1 md:gap-2">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 md:px-4 py-2 border rounded-lg text-sm md:text-base ${
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
                      className="px-3 md:px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm md:text-base"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
