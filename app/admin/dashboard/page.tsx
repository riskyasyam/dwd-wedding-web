'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
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
import { FaShoppingBag, FaClock, FaMoneyBillWave, FaUsers, FaChartLine, FaSignOutAlt, FaCog, FaStore, FaImages, FaCalendarAlt, FaTicketAlt, FaPalette, FaLightbulb, FaArrowUp, FaArrowDown, FaStar, FaHeart } from 'react-icons/fa';
import AdminSidebar from '@/components/layout/AdminSidebar';
import api from '@/lib/axios';

interface SummaryCard {
  value: number;
  label: string;
  growth?: number;
  growth_label?: string;
  new_this_month?: number;
  total?: number;
}

interface OrderStats {
  total: number;
  pending: number;
  paid: number;
  completed: number;
  failed: number;
  cancelled: number;
  today: number;
  this_month: number;
  status_distribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

interface RevenueStats {
  total: number;
  today: number;
  this_month: number;
  last_month: number;
  growth_percentage: number;
  monthly_chart: {
    month: string;
    revenue: number;
  }[];
}

interface UsersStats {
  total: number;
  active: number;
  new_today: number;
  new_this_month: number;
}

interface ProductsStats {
  decorations: {
    total: number;
    active: number;
    inactive: number;
  };
  events: {
    total: number;
    active: number;
  };
  vendors: {
    total: number;
    active: number;
  };
}

interface VouchersStats {
  total: number;
  active: number;
  expired: number;
  total_usage: number;
  total_discount_given: number;
}

interface ReviewsStats {
  total: number;
  average_rating: number;
  this_month: number;
}

interface InspirationsStats {
  total: number;
  total_likes: number;
}

interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

interface RecentUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface TopDecoration {
  id: number;
  name: string;
  price: number;
  total_orders: number;
  total_revenue: number;
}

interface DashboardData {
  summary: {
    total_revenue: SummaryCard;
    total_orders: SummaryCard;
    total_customers: SummaryCard;
    active_products: SummaryCard;
  };
  orders: OrderStats;
  revenue: RevenueStats;
  users: UsersStats;
  products: ProductsStats;
  vouchers: VouchersStats;
  reviews: ReviewsStats;
  inspirations: InspirationsStats;
  recent_activities: {
    orders: RecentOrder[];
    users: RecentUser[];
  };
  top_performers: {
    decorations: TopDecoration[];
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [hasError, setHasError] = useState(false);

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

    const fetchDashboardStats = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error.response?.data || error.message);
        setHasError(true);
        
        // Set default/empty dashboard data untuk menghindari crash
        setDashboardData({
          summary: {
            total_revenue: { value: 0, label: 'Total Revenue', growth: 0, growth_label: 'increase' },
            total_orders: { value: 0, label: 'Total Orders', growth: 0, growth_label: 'increase' },
            total_customers: { value: 0, label: 'Total Customers', new_this_month: 0 },
            active_products: { value: 0, label: 'Active Products', total: 0 },
          },
          orders: {
            total: 0,
            pending: 0,
            paid: 0,
            completed: 0,
            failed: 0,
            cancelled: 0,
            today: 0,
            this_month: 0,
            status_distribution: []
          },
          revenue: {
            total: 0,
            today: 0,
            this_month: 0,
            last_month: 0,
            growth_percentage: 0,
            monthly_chart: []
          },
          users: {
            total: 0,
            active: 0,
            new_today: 0,
            new_this_month: 0
          },
          products: {
            decorations: { total: 0, active: 0, inactive: 0 },
            events: { total: 0, active: 0 },
            vendors: { total: 0, active: 0 }
          },
          vouchers: {
            total: 0,
            active: 0,
            expired: 0,
            total_usage: 0,
            total_discount_given: 0
          },
          reviews: {
            total: 0,
            average_rating: 0,
            this_month: 0
          },
          inspirations: {
            total: 0,
            total_likes: 0
          },
          recent_activities: {
            orders: [],
            users: []
          },
          top_performers: {
            decorations: []
          }
        });
      }
    };

    fetchUser();
    fetchDashboardStats();
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-teal-100 text-teal-800',
      completed: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Summary cards from dashboard data
  const summaryCards = dashboardData ? [
    {
      title: dashboardData.summary.total_revenue.label,
      value: formatCurrency(dashboardData.summary.total_revenue.value),
      growth: dashboardData.summary.total_revenue.growth,
      growthLabel: dashboardData.summary.total_revenue.growth_label,
      icon: <FaMoneyBillWave size={24} />,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: dashboardData.summary.total_orders.label,
      value: dashboardData.summary.total_orders.value.toString(),
      growth: dashboardData.summary.total_orders.growth,
      growthLabel: dashboardData.summary.total_orders.growth_label,
      icon: <FaShoppingBag size={24} />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: dashboardData.summary.total_customers.label,
      value: dashboardData.summary.total_customers.value.toString(),
      subValue: `${dashboardData.summary.total_customers.new_this_month} new this month`,
      icon: <FaUsers size={24} />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: dashboardData.summary.active_products.label,
      value: dashboardData.summary.active_products.value.toString(),
      subValue: `of ${dashboardData.summary.active_products.total} total`,
      icon: <FaPalette size={24} />,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
  ] : [];

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
          {/* Error Notice */}
          {hasError && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> Backend dashboard endpoint is not ready yet. Showing default values. Please implement the <code className="bg-yellow-100 px-1 rounded">/api/admin/dashboard</code> endpoint as per README_DASHBOARD.md
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Banner */}
          <div className="mb-6 md:mb-8 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Hello, {user.first_name}!</h1>
                <p className="opacity-90 text-sm md:text-base">Here is what's happening with your business today.</p>
            </div>
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 right-20 -mb-20 w-48 h-48 rounded-full bg-white opacity-10"></div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
            {summaryCards.map((card, index) => (
              <Card key={index} className="border border-gray-100 shadow-sm hover:shadow-lg transition-all rounded-xl md:rounded-2xl overflow-hidden">
                <CardContent className="p-4 md:p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800">{card.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${card.bgColor} ${card.color}`}>
                      {card.icon}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs">
                    {card.growth !== undefined && card.growthLabel && (
                      <span className={`font-medium flex items-center ${card.growthLabel === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                        {card.growthLabel === 'increase' ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                        {card.growth}% from last month
                      </span>
                    )}
                    {card.subValue && (
                      <span className="text-gray-500 font-medium">{card.subValue}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {dashboardData && (
            <>
              {/* Order Statistics & Revenue */}
              <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 mb-6 md:mb-8">
                {/* Orders Overview */}
                <Card className="rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Orders Overview</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Orders</span>
                        <span className="font-bold text-gray-800">{dashboardData.orders.total}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Today</span>
                        <span className="font-bold text-blue-600">{dashboardData.orders.today}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">This Month</span>
                        <span className="font-bold text-purple-600">{dashboardData.orders.this_month}</span>
                      </div>
                      <div className="border-t pt-3 mt-3 grid grid-cols-2 gap-2">
                        <div className="text-center p-2 bg-yellow-50 rounded-lg">
                          <p className="text-xs text-gray-600">Pending</p>
                          <p className="text-lg font-bold text-yellow-700">{dashboardData.orders.pending}</p>
                        </div>
                        <div className="text-center p-2 bg-teal-50 rounded-lg">
                          <p className="text-xs text-gray-600">Paid</p>
                          <p className="text-lg font-bold text-teal-700">{dashboardData.orders.paid}</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-600">Completed</p>
                          <p className="text-lg font-bold text-blue-700">{dashboardData.orders.completed}</p>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded-lg">
                          <p className="text-xs text-gray-600">Failed</p>
                          <p className="text-lg font-bold text-red-700">{dashboardData.orders.failed}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Overview */}
                <Card className="rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Overview</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Revenue</span>
                        <span className="font-bold text-gray-800">{formatCurrency(dashboardData.revenue.total)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Today</span>
                        <span className="font-bold text-green-600">{formatCurrency(dashboardData.revenue.today)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">This Month</span>
                        <span className="font-bold text-purple-600">{formatCurrency(dashboardData.revenue.this_month)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Last Month</span>
                        <span className="font-bold text-gray-600">{formatCurrency(dashboardData.revenue.last_month)}</span>
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm text-gray-600">Growth</span>
                          <span className={`font-bold flex items-center ${dashboardData.revenue.growth_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {dashboardData.revenue.growth_percentage >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                            {Math.abs(dashboardData.revenue.growth_percentage).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Stats */}
              <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-4 mb-6 md:mb-8">
                <Card className="rounded-xl border border-gray-100 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <FaStore className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Vendors</p>
                        <p className="text-lg font-bold">{dashboardData.products.vendors.active}/{dashboardData.products.vendors.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border border-gray-100 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-pink-100 rounded-lg">
                        <FaTicketAlt className="text-pink-600" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Active Vouchers</p>
                        <p className="text-lg font-bold">{dashboardData.vouchers.active}/{dashboardData.vouchers.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border border-gray-100 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <FaStar className="text-yellow-600" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Avg Rating</p>
                        <p className="text-lg font-bold">{dashboardData.reviews.average_rating.toFixed(1)}/5</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border border-gray-100 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <FaHeart className="text-red-600" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Likes</p>
                        <p className="text-lg font-bold">{dashboardData.inspirations.total_likes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activities & Top Performers */}
              <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 mb-6 md:mb-8">
                {/* Recent Orders */}
                <Card className="rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Orders</h3>
                    <div className="space-y-3">
                      {dashboardData.recent_activities.orders.map((order) => (
                        <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-800">{order.order_number}</p>
                            <p className="text-xs text-gray-500">{order.customer_name}</p>
                            <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-gray-800">{formatCurrency(order.total)}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Decorations */}
                <Card className="rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Top Selling Decorations</h3>
                    <div className="space-y-3">
                      {dashboardData.top_performers.decorations.map((decoration, index) => (
                        <div key={decoration.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-800">{decoration.name}</p>
                              <p className="text-xs text-gray-500">{decoration.total_orders} orders</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-purple-600">{formatCurrency(decoration.total_revenue)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* New Customers */}
              <Card className="rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">New Customers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dashboardData.recent_activities.users.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">{formatDate(user.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
}