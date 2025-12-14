'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api, { getImageUrl } from '@/lib/axios';

interface DecorationCard {
  id: number;
  name: string;
  slug: string;
  images?: { id: number; image: string }[];
  base_price: number;
  discount_percent?: number;
  final_price: number;
  discount_start_date?: string;
  discount_end_date?: string;
  is_deals: boolean;
  free_items?: Array<{
    id: number;
    item_name: string;
    description?: string;
    quantity: number;
  }>;
  free_items_count?: number;
}

export default function RecommendationSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [decorations, setDecorations] = useState<DecorationCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch decorations with deals from API
  useEffect(() => {
    const fetchDecorations = async () => {
      try {
        const response = await api.get('/public/decorations', {
          params: {
            is_deals: true,
            per_page: 10,
            _t: Date.now() // Cache busting
          },
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const data = response.data.data?.data || response.data.data || [];
        setDecorations(data);
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
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startDay = start.getDate().toString().padStart(2, '0');
    const endDay = end.getDate().toString().padStart(2, '0');
    const month = start.toLocaleDateString('id-ID', { month: 'long' });
    const year = start.getFullYear();
    
    return `${startDay} - ${endDay} ${month} ${year}`;
  };

  if (loading) {
    return (
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading recommendations...</div>
        </div>
      </section>
    );
  }

  if (decorations.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-12" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Rekomendasi untuk Anda
          </h2>
          <h3 className="text-xl font-semibold text-gray-800">
            DWD Deals of the Week
          </h3>
        </div>

        {/* Cards Container with Background */}
        <div className="bg-[#F3EDF7] rounded-2xl p-6">
          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 cursor-grab active:cursor-grabbing select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {decorations.map((item) => {
              const discountAmount = item.base_price - item.final_price;
              const mainImage = item.images && item.images.length > 0 
                ? getImageUrl(item.images[0].image) 
                : '/images/bg_card.png';
              
              return (
                <Link
                  key={item.id}
                  href={`/dekor/${item.slug}`}
                  className="flex-none w-80 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  {/* Image with badges */}
                  <div className="relative aspect-video">
                    <Image
                      src={mainImage}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    {/* Hemat Badge */}
                    {item.discount_percent && item.discount_percent > 0 && (
                      <div className="absolute top-2 left-0 bg-[#F95E51] text-white px-4 py-2 rounded-r-full font-semibold">
                        <div className="text-xs">Hemat</div>
                        <div className="text-lg font-bold">
                          {formatPrice(discountAmount)}
                        </div>
                      </div>
                    )}
                    {/* Harga Terbaik Badge */}
                    {item.is_deals && (
                      <div className="absolute top-4 right-4 bg-[#F95E51] text-white px-3 py-1.5 rounded-full flex items-center gap-1 font-medium text-sm shadow-md">
                        <Image
                          src="/images/star.png"
                          alt="Star"
                          width={16}
                          height={16}
                          className="object-contain"
                        />
                        Harga Terbaik
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    {/* Free Items Tags */}
                    {item.free_items && item.free_items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.free_items.slice(0, 2).map((freeItem, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-pink-50 text-pink-700 border border-pink-200 px-2 py-1 rounded-full text-xs font-medium"
                          >
                            {freeItem.item_name}
                          </span>
                        ))}
                        {item.free_items.length > 2 && (
                          <span className="inline-flex items-center bg-pink-50 text-pink-700 border border-pink-200 px-2 py-1 rounded-full text-xs font-medium">
                            +{item.free_items.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Title */}
                    <h4 className="text-lg font-bold text-gray-900 mb-1">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">by DWD Decoration</p>
                    <p className="text-xs text-gray-500 mb-3">
                      {formatDateRange(item.discount_start_date, item.discount_end_date)}
                    </p>

                    {/* Price Section */}
                    <div className="flex items-center justify-end mb-2">
                      <div className="flex items-center gap-2">
                        {item.discount_percent && item.discount_percent > 0 && (
                          <span className="text-gray-400 line-through text-sm">
                            {formatPrice(item.base_price)}
                          </span>
                        )}
                        <span className="bg-[#F95E51] text-white px-2 py-0.5 rounded text-xs font-bold">
                          {item.discount_percent || 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <span className="text-[#BB473D] font-bold text-xl">
                        {formatPrice(item.final_price)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
