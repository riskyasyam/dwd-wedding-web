'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import MenuNav from '@/components/layout/MenuNav';
import Footer from '@/components/layout/Footer';
import api, { getImageUrl } from '@/lib/axios';

interface Event {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  description: string;
  banner_image: string;
  link_url?: string;
  created_at: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        setLoading(true);
        // Extract ID from slug (format: id-title-slug)
        const eventId = slug.split('-')[0];
        // Add cache-busting to prevent stale data
        const response = await api.get(`/public/events/${eventId}?_t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        setEvent(response.data.data);
      } catch (error: any) {
        console.error('Failed to fetch event detail:', error);
        setError('Event not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEventDetail();
    }
  }, [slug]);

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    const startStr = start.toLocaleDateString('id-ID', options);
    const endStr = end.toLocaleDateString('id-ID', options);
    
    if (startDate === endDate) {
      return startStr;
    }
    return `${startStr} – ${endStr}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <MenuNav />
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <MenuNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <p className="text-red-500 text-xl mb-4">{error || 'Event not found'}</p>
            <Link href="/event" className="text-purple-600 hover:underline">
              ← Back to Events
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <MenuNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="text-sm mb-6">
          <Link href="/" className="text-[#9A82DB] hover:underline">Home</Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <Link href="/event" className="text-[#9A82DB] hover:underline">Event</Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-600">{event.title}</span>
        </div>

        {/* Event Banner */}
        <div className="mb-8">
          <div className="relative w-full h-96 rounded-2xl overflow-hidden">
            {event.banner_image ? (
              <Image
                src={getImageUrl(event.banner_image)}
                alt={event.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Additional Info */}
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Informasi Event</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-purple-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Waktu Event</p>
                    <p className="text-gray-900 font-medium">{formatDateRange(event.start_date, event.end_date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-purple-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Lokasi</p>
                    <p className="text-gray-900 font-medium">{event.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Daftar Sekarang</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Jangan lewatkan kesempatan untuk menghadiri event ini dan dapatkan inspirasi untuk hari spesial Anda!
                </p>
                
                {event.link_url ? (
                  <a
                    href={event.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-center font-semibold rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg"
                  >
                    RSVP Event
                  </a>
                ) : (
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg">
                    RSVP Event
                  </button>
                )}

                <div className="mt-6 pt-6 border-t border-purple-200">
                  <p className="text-xs text-gray-500 text-center">
                    Dengan mendaftar, Anda akan mendapatkan akses eksklusif ke event ini
                  </p>
                </div>
              </div>

              {/* Share */}
              <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bagikan Event</h3>
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Facebook
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12">
          <Link 
            href="/event"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Daftar Event
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
