'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import MenuNav from '@/components/layout/MenuNav';
import Footer from '@/components/layout/Footer';
import HeroCarousel from '@/components/sections/HeroCarousel';
import Image from 'next/image';
import ExclusiveOfferCTA from '@/components/sections/ExclusiveOfferCTA';
import HowToOrderCTA from '@/components/sections/HowToOrderCTA';
import FlashDealsCTA from '@/components/sections/FlashDealCTA';

// Static decoration data
const decorations = [
  {
    id: 1,
    name: 'PURE ELEGANCE',
    category: 'dekorasi',
    image: '/images/image_decor.png',
    rating: 5,
    reviews: 1730,
    price: 40000000,
    vendor: 'Jaboddetabek',
    isDeal: true,
  },
  {
    id: 2,
    name: 'PURE ELEGANCE I',
    category: 'dekorasi',
    image: '/images/image_decor.png',
    rating: 5,
    reviews: 1431,
    price: 50000000,
    vendor: 'Jaboddetabek',
    isDeal: true,
  },
  {
    id: 3,
    name: 'PURE ELEGANCE II',
    category: 'dekorasi',
    image: '/images/image_decor.png',
    rating: 5,
    reviews: 887,
    price: 47000000,
    vendor: 'Jaboddetabek',
    isDeal: false,
  },
  {
    id: 4,
    name: 'CLASSIC CHARM',
    category: 'dekorasi',
    image: '/images/image_decor.png',
    rating: 5,
    reviews: 1123,
    price: 65000000,
    vendor: 'Jaboddetabek',
    isDeal: true,
  },
  {
    id: 5,
    name: 'CLASSIC CHARM I',
    category: 'dekorasi',
    image: '/images/image_decor.png',
    rating: 5,
    reviews: 1101,
    price: 64000000,
    vendor: 'Jaboddetabek',
    isDeal: false,
  },
  {
    id: 6,
    name: 'CLASSIC CHARM II',
    category: 'dekorasi',
    image: '/images/image_decor.png',
    rating: 5,
    reviews: 1154,
    price: 64000000,
    vendor: 'Jaboddetabek',
    isDeal: true,
  },
  {
    id: 7,
    name: 'GOLDEN HARMONY',
    category: 'dekorasi',
    image: '/images/image_decor.png',
    rating: 5,
    reviews: 1791,
    price: 53000000,
    vendor: 'Jaboddetabek',
    isDeal: false,
  },
  {
    id: 8,
    name: 'GOLDEN HARMONY I',
    category: 'dekorasi',
    image: '/images/image_decor.png',
    rating: 5,
    reviews: 877,
    price: 62553000,
    vendor: 'Jaboddetabek',
    isDeal: true,
  },
  {
    id: 9,
    name: 'GOLDEN HARMONY II',
    category: 'dekorasi',
    image: '/images/image_decor.png',
    rating: 5,
    reviews: 536,
    price: 78000000,
    vendor: 'Jaboddetabek',
    isDeal: false,
  },
  {
    id: 10,
    name: 'ROYAL GRACE',
    category: 'dekorasi',
    image: '/images/image_decor.png',
    rating: 5,
    reviews: 821,
    price: 75000000,
    vendor: 'Jaboddetabek',
    isDeal: true,
  },
];

export default function DekorPage() {
  const [showDeals, setShowDeals] = useState(false);

  const filteredDecorations = showDeals
    ? decorations.filter((item) => item.isDeal)
    : decorations;

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredDecorations.map((item) => (
            <div
              key={item.id}
              className="flex flex-col bg-white shadow-md hover:shadow-xl transition-shadow cursor-pointer rounded-lg p-4"
            >
              {/* Image Container */}
              <div className="relative flex justify-center items-center">
                {/* Circular Image */}
                <div className="relative w-[180px] h-[180px] rounded-full overflow-hidden">
                  <Image
                    src={item.image}
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
                <p className="text-sm text-gray-500 mb-2">Kategori {item.category}</p>

                {/* Vendor */}
                <p className="text-xs text-gray-600 mb-2">{item.vendor}</p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Image
                      key={i}
                      src="/images/star.png"
                      alt="star"
                      width={12}
                      height={12}
                      className={i < item.rating ? 'opacity-100' : 'opacity-30'}
                    />
                  ))}
                  <span className="text-xs text-gray-600 ml-1">
                    {item.rating}
                  </span>
                </div>
                <span className="text-xs text-gray-600 mb-4">
                  ({item.reviews} ulasan)
                </span>

                {/* Price Button */}
                <button className="w-full bg-[#E8B4D9] text-white py-2 rounded-lg hover:bg-[#d39ac4] transition-colors">
                  {formatPrice(item.price)}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <HowToOrderCTA />
      <FlashDealsCTA />
      <Footer />
    </div>
  );
}
