'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#313131]" style={{ fontFamily: 'var(--font-red-hat-display)' }}>
                DWD
              </h1>
              <Separator orientation="vertical" className="mx-4 h-6" />
              <span className="text-sm text-gray-500">My Dashboard</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-[#6366F1] text-white">
                      {getInitials(user.first_name, user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/')} className="cursor-pointer">
                  Browse Decorations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/')} className="cursor-pointer">
                  View Packages
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user.first_name}!</h2>
          <p className="text-gray-600 mt-2">Manage your wedding decoration orders</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">My Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-gray-500 mt-2">Total orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-gray-500 mt-2">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-gray-500 mt-2">Successfully delivered</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Section */}
        <Card>
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
            <CardDescription>View and track your wedding decoration orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                Start exploring our beautiful wedding decoration packages and make your special day unforgettable!
              </p>
              <div className="flex gap-4">
                <Button onClick={() => router.push('/')} className="bg-[#6366F1] hover:bg-[#5558E3]">
                  Browse Decorations
                </Button>
                <Button onClick={() => router.push('/')} variant="outline">
                  View Packages
                </Button>
              </div>
            </div>

            {/* Example orders list (will be populated with real data later) */}
            {/* <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">Wedding Decoration Package - Premium</h4>
                  <p className="text-sm text-gray-500">Order #12345 • December 15, 2025</p>
                </div>
                <Badge>Pending</Badge>
              </div>
            </div> */}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💬</span>
                Request Consultation
              </CardTitle>
              <CardDescription>
                Get expert advice for your wedding decoration
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🖼️</span>
                View Gallery
              </CardTitle>
              <CardDescription>
                Browse our portfolio of past events
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
