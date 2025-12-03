'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { FiPlus } from 'react-icons/fi';

export default function GalleryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getUser();
        if (userData.role !== 'admin') {
          router.push('/customer/dashboard');
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
      <AdminSidebar user={user} />

      <div className="flex-1 ml-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
                <p className="text-sm text-gray-500 mt-1">Manage portfolio images and videos</p>
              </div>
              <Button onClick={() => setShowModal(true)} className="bg-[#D3A0D2] hover:bg-[#c490c3] text-white">
                <FiPlus className="mr-2" />
                Upload Media
              </Button>
            </div>
          </div>
        </header>

        <main className="p-8">
          <Card>
            <CardHeader>
              <CardTitle>Gallery Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">No media uploaded yet.</p>
            </CardContent>
          </Card>
        </main>

        {/* Upload Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8 p-6">
              <h2 className="text-2xl font-bold mb-4">Upload Media</h2>
              <p className="text-gray-600 mb-6">Gallery upload feature coming soon...</p>
              <Button onClick={() => setShowModal(false)} variant="outline" className="w-full">
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
