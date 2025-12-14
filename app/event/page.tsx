'use client';

import { useState, useEffect } from 'react';
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

export default function EventPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/public/events', {
          params: {
            page: currentPage,
            per_page: 10,
            order_by: 'start_date',
            order_dir: 'asc',
            _t: Date.now() // Cache busting
          },
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const data = response.data.data;
        
        setEvents(data.data || []);
        setTotalPages(data.last_page || 1);
      } catch (error: any) {
        console.error('Failed to fetch events:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url
        });
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentPage]);

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const startStr = start.toLocaleDateString('id-ID', options);
    const endStr = end.toLocaleDateString('id-ID', options);
    
    if (startDate === endDate) {
      return startStr;
    }
    return `${startStr} – ${endStr}`;
  };

  // Generate slug from event
  const generateSlug = (event: Event) => {
    const titleSlug = event.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${event.id}-${titleSlug}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <MenuNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Breadcrumb */}
        <div className="text-sm mb-4">
          <Link href="/" className="text-[#9A82DB] hover:underline">Home</Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-600">Event</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Event</h1>
        <p className="text-gray-600 mb-10">
          Sedang mencari inspirasi untuk hari pernikahan Anda? Lihat rangkaian event pernikahan yang dapat Anda kunjungi
          di bawah ini! Rencanakan kunjungan Anda dan jangan lupa untuk melakukan RSVP.
        </p>

        {/* LIST OF EVENT CARDS */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No events found</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-8">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col lg:flex-row"
                >
                  {/* LEFT IMAGE */}
                  <div className="lg:w-1/3 w-full h-64 lg:h-auto relative">
                    {event.banner_image ? (
                      <Image
                        src={getImageUrl(event.banner_image)}
                        alt={event.title}
                        fill
                        className="object-cover rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* RIGHT CONTENT */}
                  <div className="lg:w-2/3 w-full p-6 flex flex-col justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">{formatDateRange(event.start_date, event.end_date)}</p>

                      <h2 className="text-lg font-semibold text-gray-900 leading-relaxed mb-2">
                        {event.title}
                      </h2>

                      {/* Location */}
                      <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                        <svg width="18" height="18" fill="#9A82DB" className="mt-0.5">
                          <path d="M12 10c0 1.657-1.343 3-3 3s-3-1.343-3-3 
                            1.343-3 3-3 3 1.343 3 3zm-3-9C6.243 1 4 3.243 4 6c0 
                            4.5 5 11 5 11s5-6.5 5-11c0-2.757-2.243-5-5-5z" />
                        </svg>
                        <span>{event.location}</span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    {/* BUTTON */}
                    {event.link_url ? (
                      <div className="flex gap-3 mt-4">
                        <Link 
                          href={`/event/${generateSlug(event)}`}
                          className="flex-1 px-5 py-2 rounded-lg border-2 border-[#D3A0D2] text-[#D3A0D2] font-semibold hover:bg-[#D3A0D2] hover:text-white transition text-center"
                        >
                          Lihat Detail
                        </Link>
                        <a 
                          href={event.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-5 py-2 rounded-lg bg-[#D3A0D2] text-white font-semibold hover:bg-[#caa3e3] transition text-center"
                        >
                          RSVP Event
                        </a>
                      </div>
                    ) : (
                      <Link 
                        href={`/event/${generateSlug(event)}`}
                        className="block mt-4 px-5 py-2 rounded-lg bg-[#D3A0D2] text-white font-semibold hover:bg-[#caa3e3] transition text-center"
                      >
                        Lihat Selengkapnya
                      </Link>
                    )}
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

      <Footer />
    </div>
  );
}
