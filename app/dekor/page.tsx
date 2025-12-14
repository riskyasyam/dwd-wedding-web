'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import MenuNav from '@/components/layout/MenuNav';
import Footer from '@/components/layout/Footer';
import HeroCarousel from '@/components/sections/HeroCarousel';
import Image from 'next/image';
import ExclusiveOfferCTA from '@/components/sections/ExclusiveOfferCTA';
import HowToOrderCTA from '@/components/sections/HowToOrderCTA';
import FlashDealsCTA from '@/components/sections/FlashDealCTA';
import api, { getImageUrl } from '@/lib/axios';

interface Decoration {
  id: number;
  name: string;
  slug: string;
  region: string;
  description: string;
  base_price: number;
  discount_percent?: number;
  final_price: number;
  discount_start_date?: string;
  discount_end_date?: string;
  rating?: number;
  review_count?: number;
  is_deals: boolean;
  images?: { id: number; image: string }[];
}

export default function DekorPage() {
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeals, setShowDeals] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch decorations from API
  useEffect(() => {
    const fetchDecorations = async () => {
      try {
        setLoading(true);
        const params: any = {
          page: currentPage,
          per_page: 20,
          _t: Date.now() // Cache busting
        };
        
        if (showDeals) {
          params.is_deals = true;
        }

        const response = await api.get('/public/decorations', { 
          params,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const data = response.data.data;
        
        // Convert rating from string to number
        const decorationsWithRating = (data.data || []).map((item: any) => ({
          ...item,
          rating: parseFloat(item.rating) || 0,
          review_count: parseInt(item.review_count) || 0
        }));
        
        setDecorations(decorationsWithRating);
        setTotalPages(data.last_page || 1);
      } catch (error: any) {
        console.error('Failed to fetch decorations:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url
        });
        setDecorations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDecorations();
  }, [currentPage, showDeals]);

  const filteredDecorations = decorations;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <MenuNav />
      
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="text-sm">
          <Link href="/" className="text-[#9A82DB] hover:underline">
            Home
          </Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-600">Dekor</span>
        </div>
      </div>

      {/* Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <h1 className="text-2xl font-bold text-gray-900">Dekor</h1>
      </div>

      {/* Filter Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex justify-center">
          <p className="text-gray-600">Menampilkan Hasil untuk Semua Kategori</p>
        </div>
      </div>

      {/* Toggle Deals */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex justify-center items-center gap-3">
          <span className="text-gray-700">Tampilkan Deals Decor</span>
          <button
            onClick={() => setShowDeals(!showDeals)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showDeals ? 'bg-[#9A82DB]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showDeals ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Decoration Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading decorations...</p>
            </div>
          </div>
        ) : filteredDecorations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No decorations found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredDecorations.map((item) => {
                const mainImage = item.images && item.images.length > 0 
                  ? getImageUrl(item.images[0].image)
                  : '/images/image_decor.png';
                
                return (
                  <Link
                    key={item.id}
                    href={`/dekor/${item.slug}`}
                    className="flex flex-col bg-white shadow-md hover:shadow-xl transition-shadow cursor-pointer rounded-lg p-4"
                  >
                    {/* Image Container */}
                    <div className="relative flex justify-center items-center">
                      {/* Circular Image */}
                      <div className="relative w-[180px] h-[180px] rounded-full overflow-hidden">
                        <Image
                          src={mainImage}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      {/* Diamond Icon at bottom center */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                          <Image
                            src="/images/icon_diamond.png"
                            alt="diamond"
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="pt-8 pb-4 px-4 flex flex-col justify-center items-center">
                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 mb-1 text-center">{item.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">Kategori dekorasi</p>

                      {/* Region */}
                      <p className="text-xs text-gray-600 mb-2">{item.region}</p>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Image
                            key={i}
                            src="/images/star.png"
                            alt="star"
                            width={12}
                            height={12}
                            className={i < (item.rating || 0) ? 'opacity-100' : 'opacity-30'}
                          />
                        ))}
                        <span className="text-xs text-gray-600 ml-1">
                          {item.rating || 0}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600 mb-4">
                        ({item.review_count || 0} ulasan)
                      </span>

                      {/* Price Button */}
                      <div className="w-full space-y-2">
                        {item.discount_percent && item.discount_percent > 0 && (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(item.base_price)}
                            </span>
                            <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                              -{item.discount_percent}%
                            </span>
                          </div>
                        )}
                        <button className="w-full bg-[#E8B4D9] text-white py-2 rounded-lg hover:bg-[#d39ac4] transition-colors">
                          {formatPrice(item.final_price)}
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
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
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first 3, last 3, and current page with neighbors
                    if (
                      page <= 3 ||
                      page > totalPages - 3 ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
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
                    } else if (page === 4 || page === totalPages - 3) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
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

      <HowToOrderCTA />
      <FlashDealsCTA />
      <Footer />
    </div>
  );
}
