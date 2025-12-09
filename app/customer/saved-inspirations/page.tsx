'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authService, User } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerSidebar from '@/components/layout/CustomerSidebar';
import api, { getImageUrl } from '@/lib/axios';

interface Inspiration {
  id: number;
  title: string;
  image: string;
  image_url?: string;
  colors: string[];
  location: string;
  liked_count: number;
  is_saved: boolean;
  created_at: string;
}

export default function SavedInspirationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loadingInspirations, setLoadingInspirations] = useState(true);
  const [removingStates, setRemovingStates] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getUser();
        if (userData.role !== 'customer') {
          router.push('/admin/dashboard');
          return;
        }
        setUser(userData);
      } catch (error) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchSavedInspirations();
    }
  }, [user]);

  const fetchSavedInspirations = async () => {
    try {
      setLoadingInspirations(true);
      const response = await api.get('/customer/my-saved-inspirations');
      
      if (response.data.success) {
        const data = response.data.data?.data || response.data.data || [];
        setInspirations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching saved inspirations:', error);
      setInspirations([]);
    } finally {
      setLoadingInspirations(false);
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm('Remove this inspiration from your saved list?')) return;

    try {
      setRemovingStates(prev => ({ ...prev, [id]: true }));
      const response = await api.delete(`/customer/inspirations/${id}/saved`);
      
      if (response.data.success) {
        setInspirations(prev => prev.filter(item => item.id !== id));
      }
    } catch (error: any) {
      console.error('Error removing inspiration:', error);
      alert(error.response?.data?.message || 'Failed to remove inspiration');
    } finally {
      setRemovingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CustomerSidebar user={user} />

      <div className="flex-1 ml-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Saved Inspirations</h2>
              <p className="text-sm text-gray-500 mt-1">Your favorite wedding inspirations</p>
            </div>
            <Link 
              href="/inspirasi"
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition font-medium shadow-sm"
            >
              Browse More
            </Link>
          </div>
        </header>

        <main className="p-8">
          <Card>
            <CardHeader>
              <CardTitle>My Collection ({inspirations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingInspirations ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading saved inspirations...</p>
                </div>
              ) : inspirations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Inspirations Yet</h3>
                  <p className="text-gray-500 mb-6">Start browsing and save your favorite wedding inspirations!</p>
                  <Link 
                    href="/inspirasi"
                    className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Browse Inspirations
                  </Link>
                </div>
              ) : (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
                  {inspirations.map((item) => {
                    // Always use getImageUrl to ensure proper backend URL
                    const imageUrl = getImageUrl(item.image_url || item.image);
                    return (
                    <div key={item.id} className="mb-4 break-inside-avoid relative group">
                      <Image
                        src={imageUrl}
                        alt={item.title}
                        width={300}
                        height={400}
                        className="w-full rounded-xl object-cover"
                      />

                      {/* Overlay with info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h3>
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

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={removingStates[item.id]}
                        className={`absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-md hover:bg-red-600 transition-colors ${
                          removingStates[item.id] ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Remove from saved"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
