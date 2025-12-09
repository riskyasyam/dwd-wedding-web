'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface VendorCard {
  id: number;
  name: string;
  image: string;
  rating: number;
  category: string;
}

interface VendorSectionProps {
  title: string;
  description: string;
  vendors: VendorCard[];
}

export default function VendorSection({ title, description, vendors }: VendorSectionProps) {
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
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Generate slug from vendor name
  const generateSlug = (vendor: VendorCard) => {
    const nameSlug = vendor.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${vendor.id}-${nameSlug}`;
  };

  return (
    <section className="bg-white py-8 mb-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-600 italic">{description}</p>
        </div>

        {/* Vendor Cards Container */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/vendor/${generateSlug(vendor)}`}
              className="flex-none w-64 group cursor-pointer"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                <Image
                  src={vendor.image}
                  alt={vendor.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                  {vendor.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, index) => (
                    <Image
                      key={index}
                      src="/images/star.png"
                      alt="Star"
                      width={14}
                      height={14}
                      className={index < Math.floor(vendor.rating) ? 'opacity-100' : 'opacity-30'}
                    />
                  ))}
                  <span className="text-xs text-[#FBB9B6] ml-1 font-medium">
                    {vendor.rating}
                  </span>
                </div>

                {/* Category */}
                <p className="text-xs text-gray-500">{vendor.category}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
