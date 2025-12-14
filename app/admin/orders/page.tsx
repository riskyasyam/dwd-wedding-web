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
  payment_type?: 'full' | 'dp';
  dp_amount?: number;
  remaining_amount?: number;
  dp_paid_at?: string | null;
  remaining_paid_at?: string | null;
  full_paid_at?: string | null;
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
  payment_type?: 'full' | 'dp';
  dp_amount?: number;
  remaining_amount?: number;
  dp_paid_at?: string | null;
  remaining_paid_at?: string | null;
  full_paid_at?: string | null;
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const fetchOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Build query params based on current filters
      const params: any = {};
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await api.get('/admin/orders/export', {
        params,
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
      const filename = `Orders_Report_${dateStr}_${timeStr}.xlsx`;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('Export successful!');
    } catch (error: any) {
      console.error('Export failed:', error);
      alert('Failed to export orders. Please try again.');
    } finally {
      setIsExporting(false);
    }
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
      case 'dp_paid': return 'bg-purple-100 text-purple-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700'; // pending
    }
  };

  // Custom Button Component
  const GradientButton = ({ children, onClick, className = '', type = 'button', disabled = false }: any) => (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 border-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
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
                            <option value="dp_paid">DP Paid (Belum Lunas)</option>
                            <option value="paid">Paid (Lunas)</option>
                        </select>
                    </div>
                    <GradientButton 
                        onClick={handleExport} 
                        className="w-full md:w-auto"
                        disabled={isExporting}
                    >
                        <FaDownload className="mr-2" /> {isExporting ? 'Exporting...' : 'Export to Excel'}
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
                            <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                            <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">DP/Remaining</th>
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
                              <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.payment_type === 'dp' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                  {order.payment_type === 'dp' ? 'DP' : 'FULL'}
                                </span>
                              </td>
                              <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-bold text-gray-800">
                                Rp {order.total.toLocaleString('id-ID')}
                              </td>
                              <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-600">
                                {order.payment_type === 'dp' ? (
                                  <div className="space-y-0.5">
                                    <div className="text-xs">
                                      <span className="text-green-600 font-semibold">DP:</span> Rp {(order.dp_amount || 0).toLocaleString('id-ID')}
                                    </div>
                                    {order.status === 'dp_paid' && (
                                      <div className="text-xs">
                                        <span className="text-orange-600 font-semibold">Sisa:</span> Rp {(order.remaining_amount || 0).toLocaleString('id-ID')}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                  {order.status === 'dp_paid' ? 'DP PAID' : order.status}
                                </span>
                              </td>
                              <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-right">
                                <button
                                  onClick={() => fetchOrderDetail(order)}
                                  className="text-gray-400 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-50 inline-block"
                                  title="View order details"
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
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <FaReceipt className="text-white" />
                    Order Details
                  </h2>
                  <p className="text-white/80 text-sm mt-1">Order #{selectedOrder.order_number}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Order Status & Payment Type */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-block ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status === 'dp_paid' ? 'DP PAID - BELUM LUNAS' : selectedOrder.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Payment Type</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${selectedOrder.payment_type === 'dp' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-700'}`}>
                      {selectedOrder.payment_type === 'dp' ? 'DOWN PAYMENT (DP)' : 'FULL PAYMENT'}
                    </span>
                  </div>
                </div>

                {/* DP Payment Info */}
                {selectedOrder.payment_type === 'dp' && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5 mb-6">
                    <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                      </svg>
                      Down Payment Information
                    </h3>
                    
                    {/* Total */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-purple-800">Total Order Amount:</span>
                        <span className="text-lg font-bold text-gray-900">Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                    
                    {/* Payment Timeline */}
                    <div className="space-y-3">
                      {/* DP Payment */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-sm font-semibold text-green-800">DP Dibayar ✓</span>
                            </div>
                            {selectedOrder.dp_paid_at && (
                              <p className="text-xs text-green-700 ml-4">
                                {new Date(selectedOrder.dp_paid_at).toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-bold text-green-700">
                            Rp {(selectedOrder.dp_amount || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Remaining Payment - Paid */}
                      {selectedOrder.remaining_paid_at && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="text-sm font-semibold text-green-800">Sisa Dibayar ✓</span>
                              </div>
                              <p className="text-xs text-green-700 ml-4">
                                {new Date(selectedOrder.remaining_paid_at).toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-green-700">
                              Rp {((selectedOrder.total || 0) - (selectedOrder.dp_amount || 0)).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Remaining Payment - Pending */}
                      {!selectedOrder.remaining_paid_at && selectedOrder.remaining_amount && selectedOrder.remaining_amount > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                                <span className="text-sm font-semibold text-orange-800">Sisa Pembayaran</span>
                              </div>
                              <p className="text-xs text-orange-700 ml-4">Menunggu pembayaran customer</p>
                            </div>
                            <span className="text-sm font-bold text-orange-600">
                              Rp {selectedOrder.remaining_amount.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Payment Status Badge */}
                    <div className="border-t border-purple-200 pt-4 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-purple-900">Payment Status:</span>
                        {selectedOrder.remaining_paid_at ? (
                          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            ✓ FULLY PAID (LUNAS)
                          </span>
                        ) : selectedOrder.status === 'dp_paid' ? (
                          <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                            🔔 WAITING FOR REMAINING
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                            PENDING
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer & Shipping Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Customer Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-md font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <FaUser className="text-blue-600" />
                      Customer Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <span className="font-semibold">{selectedOrder.first_name} {selectedOrder.last_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400" />
                        <span className="text-gray-600">{selectedOrder.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-400" />
                        <span className="text-gray-600">{selectedOrder.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-md font-bold text-green-900 mb-3 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-green-600" />
                      Shipping Address
                    </h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p className="font-semibold">{selectedOrder.address}</p>
                      <p>{selectedOrder.sub_district}, {selectedOrder.district}</p>
                      <p>{selectedOrder.city} - {selectedOrder.postal_code}</p>
                      {selectedOrder.notes && (
                        <p className="text-xs bg-white p-2 rounded mt-2 italic text-gray-600">
                          Note: {selectedOrder.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
                  <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaShoppingCart className="text-purple-600" />
                    Order Items ({selectedOrder.items.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">{item.decoration_name}</p>
                          <p className="text-xs text-gray-500">
                            Type: <span className="capitalize font-medium">{item.type}</span> • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">Rp {item.price.toLocaleString('id-ID')}</p>
                          <p className="text-xs text-gray-500">per item</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-white border-2 border-gray-300 rounded-lg p-5">
                  <h3 className="text-md font-bold text-gray-900 mb-4">Pricing Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">Rp {selectedOrder.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    {selectedOrder.voucher_discount > 0 && (
                      <>
                        <div className="flex justify-between text-green-600">
                          <span>Voucher Discount ({selectedOrder.voucher_code})</span>
                          <span className="font-semibold">- Rp {selectedOrder.voucher_discount.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2">
                          <span className="text-gray-600">After Discount</span>
                          <span className="font-semibold">Rp {(selectedOrder.subtotal - selectedOrder.voucher_discount).toLocaleString('id-ID')}</span>
                        </div>
                      </>
                    )}
                    <div className="border-t-2 border-gray-300 pt-3 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total Order</span>
                        <span className="text-2xl font-bold text-purple-600">Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Metadata */}
                <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                  <p><span className="font-semibold">Order Created:</span> {new Date(selectedOrder.created_at).toLocaleString('id-ID')}</p>
                  <p><span className="font-semibold">Last Updated:</span> {new Date(selectedOrder.updated_at).toLocaleString('id-ID')}</p>
                </div>
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
