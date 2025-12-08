'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api, { getImageUrl } from '@/lib/axios';

interface Advertisement {
  id: number;
  title: string;
  image: string;
  description?: string;
  link_url?: string;
}

export default function HeroCarousel() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fetch advertisements from API
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const response = await api.get('/public/advertisements');
        const ads = response.data.data || [];
        setAdvertisements(ads);
      } catch (error: any) {
        console.error('Failed to fetch advertisements:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url
        });
        setAdvertisements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  // Auto play carousel
  useEffect(() => {
    if (!isAutoPlaying || advertisements.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % advertisements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, advertisements.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => 
      prev === 0 ? advertisements.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % advertisements.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  // Calculate visible slides (show 3 at a time on desktop, 1 on mobile)
  const getVisibleSlides = () => {
    if (advertisements.length === 0) return [];
    const slides = [];
    // Always return current slide for mobile, we'll handle desktop in render
    slides.push(advertisements[currentIndex]);
    return slides;
  };

  // Get all slides for desktop
  const getDesktopSlides = () => {
    if (advertisements.length === 0) return [];
    const slides = [];
    for (let i = 0; i < Math.min(3, advertisements.length); i++) {
      const index = (currentIndex + i) % advertisements.length;
      slides.push(advertisements[index]);
    }
    return slides;
  };

  const visibleSlides = getVisibleSlides();
  const desktopSlides = getDesktopSlides();

  if (loading) {
    return (
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">Loading advertisements...</div>
        </div>
      </section>
    );
  }

  if (advertisements.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Mobile Carousel - Single Column */}
          <div className="block md:hidden">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
              {visibleSlides.map((ad, index) => (
                <div
                  key={`${ad.id}-${index}`}
                  className="relative w-full h-full cursor-pointer"
                  onClick={() => ad.link_url && window.open(ad.link_url, '_blank')}
                >
                  <Image
                    src={getImageUrl(ad.image)}
                    alt={ad.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>

            {/* Mobile Navigation Buttons */}
            {advertisements.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg hover:bg-white transition-colors z-10"
                  aria-label="Previous slide"
                >
                  <FiChevronLeft className="w-5 h-5 text-gray-800" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg hover:bg-white transition-colors z-10"
                  aria-label="Next slide"
                >
                  <FiChevronRight className="w-5 h-5 text-gray-800" />
                </button>
              </>
            )}
          </div>

          {/* Desktop Carousel - 3 Columns */}
          <div className="hidden md:grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {desktopSlides.map((ad, index) => (
              <div
                key={`${ad.id}-${index}`}
                className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105"
                onClick={() => ad.link_url && window.open(ad.link_url, '_blank')}
              >
                <Image
                  src={getImageUrl(ad.image)}
                  alt={ad.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          {/* Desktop Navigation Buttons - only show if more than 3 ads */}
          {advertisements.length > 3 && (
            <>
              <button
                onClick={goToPrevious}
                className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-10"
                aria-label="Previous slide"
              >
                <FiChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={goToNext}
                className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-10"
                aria-label="Next slide"
              >
                <FiChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {advertisements.length > 1 && (
            <div className="flex justify-center gap-2 mt-4 md:mt-6">
              {advertisements.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-[#9A82DB] w-6 md:w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
