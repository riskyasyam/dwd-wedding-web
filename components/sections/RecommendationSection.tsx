'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

interface DecorationCard {
  id: number;
  title: string;
  image: string;
  basePrice: number;
  discountPercent: number;
  category: string;
  dateRange: string;
}

// Static data for now - will be connected to database later
const decorations: DecorationCard[] = [
  {
    id: 1,
    title: 'PURE ELEGANCE',
    image: '/images/bg_card.png',
    basePrice: 40000000,
    discountPercent: 10,
    category: 'Cinematic',
    dateRange: '01 - 31 November 2025',
  },
  {
    id: 2,
    title: 'CLASSIC CHARM',
    image: '/images/bg_card.png',
    basePrice: 50000000,
    discountPercent: 7,
    category: 'Foto & Video',
    dateRange: '01 - 31 November 2025',
  },
  {
    id: 3,
    title: 'GOLDEN HARMONY',
    image: '/images/bg_card.png',
    basePrice: 59000000,
    discountPercent: 9,
    category: 'Cinematic',
    dateRange: '01 - 30 November 2025',
  },
  {
    id: 4,
    title: 'ROYAL GRACE',
    image: '/images/bg_card.png',
    basePrice: 63000000,
    discountPercent: 4,
    category: 'Make Up & Hair',
    dateRange: '15 - 27 November 2025',
  },
  {
    id: 5,
    title: 'MAJESTIC LOVE',
    image: '/images/bg_card.png',
    basePrice: 80000000,
    discountPercent: 11,
    category: 'Foto & Video',
    dateRange: '15 - 27 November 2025',
  },
];

export default function RecommendationSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  const calculateDiscount = (basePrice: number, discountPercent: number) => {
    return basePrice * (discountPercent / 100);
  };

  const calculateFinalPrice = (basePrice: number, discountPercent: number) => {
    return basePrice - calculateDiscount(basePrice, discountPercent);
  };

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
            {decorations.map((item) => (
              <div
                key={item.id}
                className="flex-none w-80 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Image with badges */}
                <div className="relative aspect-video">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  {/* Hemat Badge - No left margin, rounded right only */}
                  <div className="absolute top-2 left-0 bg-[#F95E51] text-white px-4 py-2 rounded-r-full font-semibold">
                    <div className="text-xs">Hemat</div>
                    <div className="text-lg font-bold">
                      {formatPrice(calculateDiscount(item.basePrice, item.discountPercent))}
                    </div>
                  </div>
                  {/* Harga Terbaik Badge */}
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
                </div>

                {/* Card Content */}
                <div className="p-4">
                  {/* Title */}
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">by DWD Decoration</p>
                  <p className="text-xs text-gray-500 mb-3">{item.dateRange}</p>

                  {/* Category Tag */}
                  <div className="mb-3">
                    <span className="inline-block bg-[#FEEFEE] text-[#BB473D] px-3 py-1 rounded text-xs font-medium">
                      {item.category}
                    </span>
                  </div>

                  {/* Price Section */}
                  <div className="flex items-center justify-end mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through text-sm">
                        {formatPrice(item.basePrice)}
                      </span>
                      <span className="bg-[#F2E6C1] text-[#F15C59] px-2 py-0.5 rounded text-xs font-semibold">
                        -{item.discountPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Final Price */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#F95E51]">
                      {formatPrice(calculateFinalPrice(item.basePrice, item.discountPercent))}
                    </p>
                    <p className="text-xs text-gray-500">(Termasuk pajak)</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
