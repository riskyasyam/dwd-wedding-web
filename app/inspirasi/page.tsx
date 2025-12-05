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
  category?: string;
  colors: string[];
  location: string;
  liked_count: number;
  created_at: string;
}

export default function InspirasiPage() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("Indonesia");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const countryList = [
    "Indonesia",
    "Korea",
    "Japan",
    "India",
    "International",
  ];

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
          order_by: 'liked_count',
          order_dir: 'desc'
        };

        if (selectedCountry !== "International") {
          params.location = selectedCountry;
        }

        if (selectedColor) {
          params.color = selectedColor;
        }

        const response = await api.get('/public/inspirations', { params });
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <MenuNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Breadcrumb */}
        <div className="text-sm mb-4">
          <Link href="/" className="text-[#9A82DB] hover:underline">Home</Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-600">Inspirasi</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Inspirasi</h1>
        <p className="text-gray-600 mb-8">
          Showing result for inspiration about all <span className="font-semibold">categories</span> in <span className="font-semibold">{selectedCountry}</span>
        </p>

        {/* MAIN LAYOUT */}
        <div className="flex gap-12">

          {/* LEFT SIDEBAR */}
          <div className="w-48">

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

          {/* RIGHT CONTENT — MASONRY GRID */}
          <div className="flex-1">
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
                <div className="columns-1 sm:columns-2 lg:columns-4 gap-4">
                  {inspirations.map((item) => (
                    <div key={item.id} className="mb-4 break-inside-avoid relative group">
                      <Image
                        src={getImageUrl(item.image)}
                        alt={item.title}
                        width={300}
                        height={400}
                        className="w-full rounded-xl object-cover"
                      />

                      {/* Overlay with info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.colors.slice(0, 3).map((color, idx) => (
                              <span key={idx} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                {color}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span>📍 {item.location}</span>
                            <span>❤️ {item.liked_count}</span>
                          </div>
                        </div>
                      </div>

                      {/* Add (+) icon top right */}
                      <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow-md hover:bg-white transition-colors cursor-pointer">
                        <svg width="20" height="20" fill="none" stroke="#9A82DB" strokeWidth="2">
                          <path d="M10 4v12M4 10h12" strokeLinecap="round"/>
                        </svg>
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
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
