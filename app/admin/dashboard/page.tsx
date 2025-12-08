'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
// Menggunakan komponen bawaan card, tapi kita akan styling ulang container-nya
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// Mengganti icon ke Fa agar konsisten
import { FaShoppingBag, FaClock, FaMoneyBillWave, FaUsers, FaChartLine, FaSignOutAlt, FaCog } from 'react-icons/fa';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
           <p className="text-gray-600 mt-4 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Data dummy untuk stat cards (bisa diganti data real nanti)
  const stats = [
    {
      title: "Total Revenue",
      value: "Rp 0",
      change: "+0% from last month",
      icon: <FaMoneyBillWave size={20} />,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Orders",
      value: "0",
      change: "+0 new orders",
      icon: <FaShoppingBag size={20} />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Pending Orders",
      value: "0",
      change: "Needs attention",
      icon: <FaClock size={20} />,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Total Customers",
      value: "0",
      change: "+0 new users",
      icon: <FaUsers size={20} />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar user={user} />

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 md:px-8 py-4 pt-20 md:pt-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
                  Dashboard
                </h2>
                <p className="text-sm text-gray-500 mt-1">Welcome back, {user.first_name}!</p>
              </div>
              
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 border-2 border-transparent hover:border-purple-200 transition-all">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white font-bold">
                          {getInitials(user.first_name, user.last_name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-2" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-gray-500 font-normal">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <FaCog className="mr-2 h-4 w-4 text-gray-500" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                      <FaSignOutAlt className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 md:p-8">
          <div className="mb-6 md:mb-8 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Hello, {user.first_name}!</h1>
                <p className="opacity-90 text-sm md:text-base">Here is what's happening with your business today.</p>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 right-20 -mb-20 w-48 h-48 rounded-full bg-white opacity-10"></div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-xl md:rounded-2xl overflow-hidden">
                <CardContent className="p-4 md:p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs">
                    <span className="text-green-500 font-medium flex items-center">
                      <FaChartLine className="mr-1" /> {stat.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Section (Placeholder for future widgets like Recent Orders) */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="rounded-xl md:rounded-2xl border border-gray-100 shadow-sm h-48 md:h-64 flex items-center justify-center bg-white">
                <div className="text-center text-gray-400">
                    <p className="mb-2 text-sm md:text-base">Chart Analytics Placeholder</p>
                    <p className="text-xs">Sales overview will appear here</p>
                </div>
            </Card>
            <Card className="rounded-xl md:rounded-2xl border border-gray-100 shadow-sm h-48 md:h-64 flex items-center justify-center bg-white">
                <div className="text-center text-gray-400">
                    <p className="mb-2 text-sm md:text-base">Recent Activities Placeholder</p>
                    <p className="text-xs">Latest transactions will appear here</p>
                </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}