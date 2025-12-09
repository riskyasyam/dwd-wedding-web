'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService, User } from '@/lib/auth';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { FaSearch, FaFilter, FaBoxOpen, FaClipboardList, FaEye, FaDownload, FaTimes, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaShoppingCart, FaReceipt, FaTruck, FaCheckCircle } from 'react-icons/fa';
import api from '@/lib/axios';

interface Order {
  id: number;
  order_number: string;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  sub_district: string;
  postal_code: string;
  subtotal: number;
  voucher_code: string | null;
  voucher_discount: number;
  discount: number;
  delivery_fee: number;
  total: number;
  status: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: Array<{
    id: number;
    decoration_name: string;
    type: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

interface UserOrderDetail {
  id: number;
  user_id: number;
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  sub_district: string;
  postal_code: string;
  notes: string | null;
  subtotal: number;
  voucher_code: string | null;
  voucher_discount: number;
  discount: number;
  delivery_fee: number;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  items: Array<{
    id: number;
    order_id: number;
    decoration_id: number;
    type: string;
    quantity: number;
    base_price: number;
    discount: number;
    price: number;
    created_at: string;
    updated_at: string;
    decoration: {
      id: number;
      name: string;
      slug: string;
      description: string;
      price: number;
      discounted_price: number | null;
      discount_percentage: number | null;
      category: string;
      is_active: boolean;
      images: Array<{
        id: number;
        decoration_id: number;
        image_url: string;
        is_primary: boolean;
        order: number;
      }>;
    };
  }>;
}

interface OrderStatistics {
  total_orders: number;
  total_spent: number;
  pending_orders: number;
  completed_orders: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userOrders, setUserOrders] = useState<UserOrderDetail[]>([]);
  const [orderStatistics, setOrderStatistics] = useState<OrderStatistics | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

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

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await api.get('/admin/orders');
      
      console.log('Admin orders response:', response.data);
      
      if (response.data.success) {
        // Backend returns paginated data: response.data.data.data
        const ordersData = response.data.data?.data || response.data.data || [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchUserOrderDetails = async (userId: number) => {
    try {
      setLoadingDetail(true);
      setShowDetailModal(true);
      setSelectedUserId(userId);
      
      const response = await api.get(`/admin/users/${userId}/orders`);
      
      console.log('User orders response:', response.data);
      
      if (response.data.success) {
        const ordersData = response.data.data?.data || [];
        setUserOrders(Array.isArray(ordersData) ? ordersData : []);
        setOrderStatistics(response.data.statistics || null);
      }
    } catch (error) {
      console.error('Error fetching user order details:', error);
      setUserOrders([]);
      setOrderStatistics(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedUserId(null);
    setUserOrders([]);
    setOrderStatistics(null);
  };

  // Filter orders based on search and status
  const filteredOrders = (Array.isArray(orders) ? orders : []).filter((order) => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.first_name} ${order.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Group orders by date
  const groupOrdersByDate = (orders: Order[]) => {
    const grouped: { [key: string]: Order[] } = {};
    
    orders.forEach((order) => {
      const date = new Date(order.created_at);
      const dateKey = date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(order);
    });
    
    // Sort dates in descending order (newest first)
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      const dateA = grouped[a][0].created_at;
      const dateB = grouped[b][0].created_at;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    
    return sortedKeys.map(dateKey => ({
      date: dateKey,
      dayName: new Date(grouped[dateKey][0].created_at).toLocaleDateString('id-ID', { weekday: 'long' }),
      orders: grouped[dateKey].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }));
  };

  const groupedOrders = groupOrdersByDate(filteredOrders);

  // Helper untuk warna status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'paid': return 'bg-blue-100 text-blue-700';
      case 'failed': return 'bg-red-100 text-red-700';
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

      <div className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-6 md:mb-8 pt-20 md:pt-0">
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-black">
                        Order Management
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm md:text-base">View and manage customer transactions.</p>
                    </div>
                    <div className="block">
                        <span className="bg-purple-50 text-purple-700 border border-purple-100 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold flex items-center gap-2 w-fit">
                             Total: {orders.length} Orders
                        </span>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Customer Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 text-sm md:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="w-full md:w-48 relative">
                        <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 text-sm md:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <GradientButton className="w-full md:w-auto">
                        <FaDownload className="mr-2" /> Export
                    </GradientButton>
                </div>
            </div>
        </div>

        {/* Orders Content */}
        {loadingOrders ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-200">
                <div className="bg-purple-50 inline-flex p-6 rounded-full mb-6">
                    <FaBoxOpen className="text-purple-300 text-4xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Orders Found</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'No orders match your search criteria.'
                      : 'There are no orders yet. New orders will appear here once customers start purchasing.'}
                </p>
            </div>
        ) : (
            <div className="space-y-6">
              {groupedOrders.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {/* Date Header */}
                  <div className="mb-4 px-2">
                    <h3 className="text-lg font-bold text-gray-800">
                      {group.dayName}, {group.date}
                    </h3>
                    <div className="h-1 w-20 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full mt-2"></div>
                  </div>

                  {/* Orders Table for this date */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order Number</th>
                            <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {group.orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                {new Date(order.created_at).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap font-mono text-xs md:text-sm font-medium text-purple-600">
                                {order.order_number}
                              </td>
                              <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-700">
                                {order.first_name} {order.last_name}
                                <div className="text-xs text-gray-400">{order.email}</div>
                              </td>
                              <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-600">
                                {order.items.length} item(s)
                              </td>
                              <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-bold text-gray-800">
                                Rp {order.total.toLocaleString('id-ID')}
                              </td>
                              <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-right">
                                <button
                                  onClick={() => fetchUserOrderDetails(order.user_id)}
                                  className="text-gray-400 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-50 inline-block"
                                  title="View customer orders"
                                >
                                  <FaEye size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Table Footer */}
                    <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{group.orders.length} order(s) on this date</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}

        {/* Order Detail Modal */}
        {showDetailModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FaUser className="text-white" />
                  Customer Order History
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <FaBoxOpen className="text-gray-300 text-6xl mx-auto mb-4" />
                    <p className="text-gray-500">No orders found for this customer</p>
                  </div>
                ) : (
                  <>
                    {/* Customer Info & Statistics */}
                    {userOrders[0] && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Customer Info Card */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <FaUser className="text-purple-600" />
                            Customer Information
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <FaUser className="text-gray-400" />
                              <span className="font-semibold text-gray-700">{userOrders[0].user.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <FaEnvelope className="text-gray-400" />
                              <span className="text-gray-600">{userOrders[0].user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <FaPhone className="text-gray-400" />
                              <span className="text-gray-600">{userOrders[0].user.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Address Card */}
                        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-5 border border-green-100">
                          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-green-600" />
                            Latest Delivery Address
                          </h3>
                          <div className="space-y-1.5 text-sm">
                            <p className="font-semibold text-gray-700">{userOrders[0].first_name} {userOrders[0].last_name}</p>
                            <p className="text-gray-600 flex items-start gap-2">
                              <FaPhone className="text-gray-400 mt-1 flex-shrink-0" />
                              <span>{userOrders[0].phone}</span>
                            </p>
                            <p className="text-gray-600 flex items-start gap-2">
                              <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                              <span className="leading-relaxed">
                                {userOrders[0].address}<br />
                                {userOrders[0].sub_district}, {userOrders[0].district}<br />
                                {userOrders[0].city} {userOrders[0].postal_code}
                              </span>
                            </p>
                            {userOrders[0].notes && (
                              <p className="text-xs text-gray-500 italic bg-white p-2 rounded mt-2">
                                Note: {userOrders[0].notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Statistics Card */}
                        {orderStatistics && (
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <FaReceipt className="text-blue-600" />
                              Order Statistics
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-gray-500">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-800">{orderStatistics.total_orders}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Total Spent</p>
                                <p className="text-2xl font-bold text-green-600">Rp {orderStatistics.total_spent.toLocaleString('id-ID')}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Pending</p>
                                <p className="text-xl font-bold text-yellow-600">{orderStatistics.pending_orders}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Completed</p>
                                <p className="text-xl font-bold text-green-600">{orderStatistics.completed_orders}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Orders List */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FaShoppingCart className="text-purple-600" />
                        Order History ({userOrders.length})
                      </h3>
                      
                      {userOrders.map((order) => (
                        <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                          {/* Order Header */}
                          <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <span className="font-mono font-bold text-purple-600">{order.order_number}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="p-5">
                            <div className="space-y-3 mb-4">
                              {order.items.map((item) => {
                                // Debug: Check item data
                                console.log('Order Item Data:', {
                                  decoration_name: item.decoration.name,
                                  base_price: item.base_price,
                                  discount: item.discount,
                                  final_price: item.price
                                });
                                
                                return (
                                <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                                  {item.decoration.images[0] && (
                                    <img
                                      src={`http://localhost:8000${item.decoration.images[0].image_url}`}
                                      alt={item.decoration.name}
                                      className="w-20 h-20 object-cover rounded-lg"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800">{item.decoration.name}</h4>
                                    <p className="text-xs text-gray-500 capitalize">
                                      Type: <span className="font-medium">{item.type}</span> • Qty: {item.quantity}
                                    </p>
                                    {item.discount > 0 && (
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs line-through text-gray-400">
                                          Rp {item.base_price.toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                                          -Rp {item.discount.toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    {item.discount > 0 ? (
                                      <>
                                        <p className="text-xs line-through text-gray-400">Rp {item.base_price.toLocaleString('id-ID')}</p>
                                        <p className="font-bold text-gray-800">Rp {item.price.toLocaleString('id-ID')}</p>
                                      </>
                                    ) : (
                                      <p className="font-bold text-gray-800">Rp {item.price.toLocaleString('id-ID')}</p>
                                    )}
                                  </div>
                                </div>
                              );
                              })}
                            </div>

                            {/* Order Summary */}
                            <div className="border-t border-gray-200 pt-4 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-semibold">Rp {order.subtotal.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                <span className="text-gray-800">Total</span>
                                <span className="text-purple-600">Rp {order.total.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>Payment Method</span>
                                <span className="font-medium capitalize">{order.payment_method}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}