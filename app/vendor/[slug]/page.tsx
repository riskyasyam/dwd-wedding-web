'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import Navbar from '@/components/layout/Navbar';
import MenuNav from '@/components/layout/MenuNav';
import Footer from '@/components/layout/Footer';
import api, { getImageUrl } from '@/lib/axios';

interface VendorImage {
  id: number;
  vendor_id: number;
  image: string;
  created_at: string;
  updated_at: string;
}

interface Vendor {
  id: number;
  name: string;
  slug: string;
  category: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  rating: number;
  is_active: boolean;
  website?: string;
  instagram?: string;
  images: VendorImage[];
  created_at: string;
  updated_at: string;
}

export default function VendorDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    const fetchVendorDetail = async () => {
      try {
        setLoading(true);
        // Extract ID from slug (format: id-name-slug)
        const vendorId = slug.split('-')[0];
        const response = await api.get(`/public/vendors/${vendorId}`);
        setVendor(response.data.data);
      } catch (error: any) {
        console.error('Failed to fetch vendor detail:', error);
        setError('Vendor not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchVendorDetail();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <MenuNav />
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading vendor details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <MenuNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <p className="text-red-500 text-xl mb-4">{error || 'Vendor not found'}</p>
            <Link href="/" className="text-purple-600 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = vendor.images && vendor.images.length > 0 
    ? vendor.images 
    : [{ id: 0, vendor_id: vendor.id, image: '/images/placeholder-vendor.png', created_at: '', updated_at: '' }];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <MenuNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="text-sm mb-6">
          <Link href="/" className="text-[#9A82DB] hover:underline">Home</Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-[#9A82DB] hover:underline cursor-pointer">Vendors</span>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-600">{vendor.name}</span>
        </div>

        {/* Back Button */}
        <div className="my-7">
          <Link 
            href="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div 
              className="relative w-full h-96 rounded-2xl overflow-hidden mb-4 cursor-pointer group"
              onClick={() => setShowLightbox(true)}
            >
              <Image
                src={getImageUrl(images[selectedImage].image)}
                alt={vendor.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity flex items-center justify-center">
                <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(index)}
                    className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-purple-600 scale-105' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <Image
                      src={getImageUrl(img.image)}
                      alt={`${vendor.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vendor Info */}
          <div>
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-3">
                <span>{vendor.category}</span>
              </span>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{vendor.name}</h1>
              
              {/* Rating */}
              {vendor.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <svg
                        key={index}
                        className={`w-5 h-5 ${
                          index < Math.floor(Number(vendor.rating)) 
                            ? 'text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600 font-medium">{Number(vendor.rating).toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {vendor.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tentang Vendor</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {vendor.description}
                </p>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kontak</h3>
              <div className="space-y-3">
                {vendor.address && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Alamat</p>
                      <p className="text-gray-900">{vendor.address}</p>
                    </div>
                  </div>
                )}

                {vendor.phone && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Telepon</p>
                      <a href={`tel:${vendor.phone}`} className="text-gray-900 hover:text-purple-600">
                        {vendor.phone}
                      </a>
                    </div>
                  </div>
                )}

                {vendor.email && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a href={`mailto:${vendor.email}`} className="text-gray-900 hover:text-purple-600">
                        {vendor.email}
                      </a>
                    </div>
                  </div>
                )}

                {vendor.website && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a 
                        href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 hover:text-purple-600"
                      >
                        {vendor.website}
                      </a>
                    </div>
                  </div>
                )}

                {vendor.instagram && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-600 mt-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Instagram</p>
                      <a 
                        href={`https://instagram.com/${vendor.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 hover:text-purple-600"
                      >
                        {vendor.instagram}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {vendor.phone ? (
                <a 
                  href={`https://wa.me/${vendor.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo ${vendor.name}, saya tertarik dengan layanan ${vendor.category} Anda`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all shadow-lg bg-green-600 hover:bg-green-700 text-center"
                >
                  Hubungi Vendor via WhatsApp
                </a>
              ) : (
                <button 
                  disabled
                  className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all shadow-lg bg-gray-400 cursor-not-allowed"
                >
                  Tidak Tersedia
                </button>
              )}
              <button 
                onClick={() => {
                  const url = window.location.href;
                  if (navigator.share) {
                    navigator.share({
                      title: vendor.name,
                      text: `Check out ${vendor.name} - ${vendor.category}`,
                      url: url,
                    });
                  } else {
                    navigator.clipboard.writeText(url);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="px-6 py-3 border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            onClick={() => setShowLightbox(false)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          {images.length > 1 && selectedImage > 0 && (
            <button 
              className="absolute left-4 text-white hover:text-gray-300 z-50"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(prev => prev - 1);
              }}
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next Button */}
          {images.length > 1 && selectedImage < images.length - 1 && (
            <button 
              className="absolute right-4 text-white hover:text-gray-300 z-50"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(prev => prev + 1);
              }}
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div className="relative max-w-6xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={getImageUrl(images[selectedImage].image)}
              alt={`${vendor.name} portfolio ${selectedImage + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
            {selectedImage + 1} / {images.length}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
