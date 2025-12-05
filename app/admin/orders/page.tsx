'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { FaSearch, FaFilter, FaBoxOpen, FaClipboardList, FaEye, FaDownload } from 'react-icons/fa';

// Definisi tipe data dummy untuk order (bisa disesuaikan dengan interface backend nanti)
interface Order {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  itemsCount: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // State untuk data order (kosong untuk saat ini sesuai kode asli)
  const [orders, setOrders] = useState<Order[]>([]); 

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

  // Helper untuk warna status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700'; // pending
    }
  };

  // Custom Button Component
  const GradientButton = ({ children, onClick, className = '', type = 'button' }: any) => (
    <button 
      type={type} 
      onClick={onClick} 
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 border-none ${className}`}
    >
      {children}
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
           <p className="text-gray-600 mt-4 font-medium">Loading Orders...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={user} />

      <div className="flex-1 ml-64 p-8">
        {/* Header Section */}
        <div className="mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-black">
                        Order Management
                        </h1>
                        <p className="text-gray-500 mt-1">View and manage customer transactions.</p>
                    </div>
                    <div className="hidden md:block">
                        <span className="bg-purple-50 text-purple-700 border border-purple-100 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                             Total: {orders.length} Orders
                        </span>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Customer Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="w-48 relative">
                        <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <GradientButton>
                        <FaDownload className="mr-2" /> Export
                    </GradientButton>
                </div>
            </div>
        </div>

        {/* Orders Content */}
        {orders.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-200">
                <div className="bg-purple-50 inline-flex p-6 rounded-full mb-6">
                    <FaBoxOpen className="text-purple-300 text-4xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Orders Found</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                    There are no orders matching your criteria right now. New orders will appear here once customers start purchasing.
                </p>
            </div>
        ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-purple-600">
                                        #{order.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {order.customerName}
                                        <div className="text-xs text-gray-400">{order.itemsCount} Items</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {order.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                                        Rp {order.total.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button className="text-gray-400 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-50">
                                            <FaEye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Placeholder */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Showing 0 of 0 entries</span>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1 text-xs border rounded bg-white text-gray-300 cursor-not-allowed">Previous</button>
                        <button disabled className="px-3 py-1 text-xs border rounded bg-white text-gray-300 cursor-not-allowed">Next</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}