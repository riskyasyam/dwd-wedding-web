'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService, User } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerSidebar from '@/components/layout/CustomerSidebar';
import api from '@/lib/axios';

interface Order {
  id: number;
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
    decoration_id: number;
    decoration_name: string;
    type: string;
    quantity: number;
    price: number;
    subtotal: number;
    has_reviewed: boolean;
    decoration?: {
      id: number;
      name: string;
      images?: Array<{ image_path: string }>;
    };
  }>;
}

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDecorationId, setSelectedDecorationId] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

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
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await api.get('/customer/orders');
      
      console.log('Customer orders response:', response.data);
      
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

  const handleOpenReviewModal = (order: Order, decorationId: number) => {
    setSelectedOrder(order);
    setSelectedDecorationId(decorationId);
    setReviewForm({ rating: 5, comment: '' });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedDecorationId) return;

    try {
      setSubmittingReview(true);
      await api.post(`/customer/orders/${selectedOrder.id}/review`, {
        decoration_id: selectedDecorationId,
        ...reviewForm
      });
      alert('Review submitted successfully!');
      setShowReviewModal(false);
      setSelectedDecorationId(null);
      fetchOrders(); // Refresh orders to update has_reviewed status
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const pollPaymentStatus = async (orderNumber: string, maxAttempts = 10) => {
    let attempts = 0;
    const delayMs = 2000; // 2 seconds between polls

    const poll = async (): Promise<void> => {
      try {
        console.log(`Polling payment status (attempt ${attempts + 1}/${maxAttempts})...`);
        
        const response = await api.get(`/customer/orders/payment-status/${orderNumber}`);
        
        console.log('Poll response:', response.data);
        
        if (response.data.success) {
          const { order_status, order } = response.data.data;
          
          if (order_status === 'paid' && order.remaining_paid_at) {
            // ✅ Order sudah lunas!
            console.log('✅ Order lunas! Remaining paid at:', order.remaining_paid_at);
            
            // Refresh order list
            await fetchOrders();
            
            // Close modal if open
            setShowOrderDetailModal(false);
            
            // Show success message
            alert('✅ Pelunasan berhasil! Order sudah lunas.');
            
            return; // Stop polling
          }
          
          // Belum paid, poll lagi
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`⏳ Belum lunas, polling lagi dalam ${delayMs / 1000} detik...`);
            setTimeout(() => poll(), delayMs);
          } else {
            console.log('⚠️ Max polling attempts reached');
            alert('Pembayaran sedang diproses. Mohon refresh halaman dalam beberapa saat untuk melihat status terbaru.');
            await fetchOrders(); // Try refresh anyway
          }
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(() => poll(), delayMs);
        } else {
          alert('Gagal mengecek status pembayaran. Mohon refresh halaman.');
        }
      }
    };

    // Start polling
    await poll();
  };

  const handlePayRemaining = async (order: Order) => {
    // Check if Snap.js is loaded
    if (typeof (window as any).snap === 'undefined') {
      alert('Payment system not loaded. Please refresh the page.');
      return;
    }

    try {
      const response = await api.post(`/customer/orders/${order.id}/pay-remaining`);
      
      console.log('Pay remaining response:', response.data);
      
      if (response.data.success) {
        // Backend returns: { success: true, snap_token: "...", remaining_amount: ..., order: {...} }
        const snap_token = response.data.snap_token;
        
        if (!snap_token) {
          alert('❌ Backend tidak mengembalikan snap_token untuk sisa pembayaran.');
          return;
        }
        
        console.log('Opening Snap popup for remaining payment:', snap_token);
        
        // Open Midtrans Snap popup
        (window as any).snap.pay(snap_token, {
          onSuccess: async function(result: any) {
            console.log('Remaining payment success:', result);
            console.log('Midtrans order_id:', result.order_id);
            
            // CRITICAL: Poll untuk update database
            // Order ID dari Midtrans include suffix: ORD-XXX-REMAINING-{timestamp}
            const remainingOrderNumber = result.order_id;
            
            console.log('🔄 Starting polling for order:', remainingOrderNumber);
            
            // Show processing message
            alert('✅ Pembayaran berhasil! Mohon tunggu, sistem sedang memproses...');
            
            // Start polling
            await pollPaymentStatus(remainingOrderNumber);
          },
          onPending: async function(result: any) {
            console.log('Remaining payment pending:', result);
            
            // Try to poll anyway in case it settles quickly
            const remainingOrderNumber = result.order_id;
            await pollPaymentStatus(remainingOrderNumber, 5); // Less attempts for pending
            
            fetchOrders();
            setShowOrderDetailModal(false);
          },
          onError: function(result: any) {
            console.error('Remaining payment error:', result);
            alert('❌ Pembayaran gagal. Silakan coba lagi.');
          },
          onClose: function() {
            console.log('Snap popup closed');
            // Refresh data saat popup ditutup
            fetchOrders();
          }
        });
      }
    } catch (error: any) {
      console.error('Error paying remaining:', error);
      alert(error.response?.data?.message || 'Failed to process remaining payment');
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
              <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
              <p className="text-sm text-gray-500 mt-1">View and track your orders</p>
            </div>
            <Link 
              href="/dekor"
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition font-medium shadow-sm"
            >
              Browse Decorations
            </Link>
          </div>
        </header>

        <main className="p-8">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No orders yet.</p>
                  <Link 
                    href="/dekor"
                    className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Browse Decorations
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">
                            Order #{order.order_number}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : (order.status === 'paid' || (order.payment_type === 'dp' && order.dp_paid_at && order.remaining_paid_at))
                                ? 'bg-blue-100 text-blue-700'
                                : (order.status === 'dp_paid' || (order.payment_type === 'dp' && order.dp_paid_at && !order.remaining_paid_at))
                                ? 'bg-purple-100 text-purple-700'
                                : order.status === 'processing'
                                ? 'bg-indigo-100 text-indigo-700'
                                : order.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {order.status === 'completed'
                              ? 'COMPLETED'
                              : (order.status === 'paid' || (order.payment_type === 'dp' && order.dp_paid_at && order.remaining_paid_at))
                              ? 'FULLY PAID'
                              : (order.status === 'dp_paid' || (order.payment_type === 'dp' && order.dp_paid_at && !order.remaining_paid_at))
                              ? 'DP PAID - BELUM LUNAS'
                              : order.status === 'processing'
                              ? 'PROCESSING'
                              : order.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* DP Info Section */}
                      {order.payment_type === 'dp' && (
                        <div className="mb-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-purple-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                                </svg>
                                Pembayaran DP (Down Payment)
                              </p>
                              <div className="space-y-1 text-sm text-purple-800">
                                <div className="flex justify-between">
                                  <span>Total Harga:</span>
                                  <span className="font-medium">Rp {order.total.toLocaleString('id-ID')}</span>
                                </div>
                                {order.dp_amount && (
                                  <>
                                    <div className="flex justify-between">
                                      <span>DP Dibayar:</span>
                                      <span className="font-medium text-green-700">
                                        Rp {order.dp_amount.toLocaleString('id-ID')} ✓
                                        {order.dp_paid_at && (
                                          <span className="text-xs text-gray-600 ml-1">
                                            ({new Date(order.dp_paid_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                    {order.remaining_paid_at ? (
                                      <div className="flex justify-between border-t border-purple-200 pt-1 mt-1">
                                        <span className="font-semibold text-green-700">Sisa Dibayar:</span>
                                        <span className="font-bold text-green-700">
                                          Rp {((order.total || 0) - (order.dp_amount || 0)).toLocaleString('id-ID')} ✓
                                          <span className="text-xs text-gray-600 ml-1">
                                            ({new Date(order.remaining_paid_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})
                                          </span>
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex justify-between border-t border-purple-200 pt-1 mt-1">
                                        <span className="font-semibold">Sisa Pembayaran:</span>
                                        <span className="font-bold text-orange-600">Rp {(order.remaining_amount || 0).toLocaleString('id-ID')}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            {order.payment_type === 'dp' && !order.remaining_paid_at && order.remaining_amount && order.remaining_amount > 0 && order.dp_paid_at && (
                              <button
                                onClick={() => handlePayRemaining(order)}
                                className="ml-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition text-sm font-medium shadow-sm whitespace-nowrap"
                              >
                                Bayar Sisa
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2 font-semibold">Items:</p>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {item.decoration?.name || item.decoration_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.type} • Qty: {item.quantity} • Rp {item.price.toLocaleString('id-ID')}
                                </p>
                              </div>
                              {(order.status === 'paid' || order.status === 'completed') && (
                                <div className="ml-3">
                                  {item.has_reviewed ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                      ✓ Reviewed
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenReviewModal(order, item.decoration_id)}
                                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium"
                                    >
                                      Review
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-sm text-gray-600">Total:</p>
                          <p className="text-xl font-bold text-gray-900">
                            Rp {order.total.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetailModal(true);
                          }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Order Details</h3>
                <p className="text-white/80 text-sm">Order #{selectedOrder.order_number}</p>
              </div>
              <button
                onClick={() => setShowOrderDetailModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                    selectedOrder.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : (selectedOrder.status === 'paid' || (selectedOrder.payment_type === 'dp' && selectedOrder.dp_paid_at && selectedOrder.remaining_paid_at))
                      ? 'bg-blue-100 text-blue-700'
                      : (selectedOrder.status === 'dp_paid' || (selectedOrder.payment_type === 'dp' && selectedOrder.dp_paid_at && !selectedOrder.remaining_paid_at))
                      ? 'bg-purple-100 text-purple-700'
                      : selectedOrder.status === 'processing'
                      ? 'bg-indigo-100 text-indigo-700'
                      : selectedOrder.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedOrder.status === 'completed'
                      ? 'COMPLETED'
                      : (selectedOrder.status === 'paid' || (selectedOrder.payment_type === 'dp' && selectedOrder.dp_paid_at && selectedOrder.remaining_paid_at))
                      ? 'FULLY PAID'
                      : (selectedOrder.status === 'dp_paid' || (selectedOrder.payment_type === 'dp' && selectedOrder.dp_paid_at && !selectedOrder.remaining_paid_at))
                      ? 'DP PAID - BELUM LUNAS'
                      : selectedOrder.status === 'processing'
                      ? 'PROCESSING'
                      : selectedOrder.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Order Date</p>
                  <p className="text-sm font-medium">{new Date(selectedOrder.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>

              {/* DP Payment Info */}
              {selectedOrder.payment_type === 'dp' && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
                  <h4 className="text-md font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                    </svg>
                    Down Payment (DP) Information
                  </h4>
                  
                  {/* Payment Timeline */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-800">Total Harga:</span>
                      <span className="font-bold text-gray-900">Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                    </div>
                    
                    {/* DP Payment */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
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
                        <span className="font-bold text-green-700">Rp {(selectedOrder.dp_amount || 0).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                    
                    {/* Remaining Payment - Paid */}
                    {selectedOrder.remaining_paid_at && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div>
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
                          <span className="font-bold text-green-700">
                            Rp {((selectedOrder.total || 0) - (selectedOrder.dp_amount || 0)).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Remaining Payment - Pending */}
                    {!selectedOrder.remaining_paid_at && selectedOrder.remaining_amount && selectedOrder.remaining_amount > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                              <span className="text-sm font-semibold text-orange-800">Sisa Pembayaran</span>
                            </div>
                            <p className="text-xs text-orange-700 ml-4">Belum dibayar</p>
                          </div>
                          <span className="font-bold text-orange-600">Rp {selectedOrder.remaining_amount.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Pay Remaining Button */}
                  {!selectedOrder.remaining_paid_at && selectedOrder.remaining_amount && selectedOrder.remaining_amount > 0 && selectedOrder.dp_paid_at && (
                    <button
                      onClick={() => {
                        setShowOrderDetailModal(false);
                        handlePayRemaining(selectedOrder);
                      }}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-medium shadow-sm"
                    >
                      💳 Bayar Sisa Pembayaran
                    </button>
                  )}
                  
                  {/* Fully Paid Message */}
                  {selectedOrder.remaining_paid_at && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-3 text-center">
                      <p className="text-sm font-bold text-green-800">✅ Pembayaran Lunas</p>
                      <p className="text-xs text-green-600 mt-1">Terima kasih atas pembayaran Anda</p>
                    </div>
                  )}
                </div>
              )}

              {/* Shipping Address */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-md font-bold text-green-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  Alamat Pengiriman
                </h4>
                <div className="text-sm space-y-1 text-gray-700">
                  <p className="font-semibold">{selectedOrder.first_name} {selectedOrder.last_name}</p>
                  <p>{selectedOrder.phone}</p>
                  <p className="mt-2">{selectedOrder.address}</p>
                  <p>{selectedOrder.sub_district}, {selectedOrder.district}</p>
                  <p>{selectedOrder.city} - {selectedOrder.postal_code}</p>
                  {selectedOrder.notes && (
                    <p className="bg-white p-2 rounded mt-2 text-xs italic text-gray-600">
                      <span className="font-semibold">Catatan:</span> {selectedOrder.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-md font-bold text-gray-900 mb-3">Items Ordered</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">{item.decoration?.name || item.decoration_name}</p>
                        <p className="text-xs text-gray-500">
                          Type: <span className="capitalize font-medium">{item.type}</span> • Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">Rp {item.price.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-gray-500">per item</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">Rp {selectedOrder.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {selectedOrder.voucher_discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Voucher ({selectedOrder.voucher_code})</span>
                    <span className="font-semibold">- Rp {selectedOrder.voucher_discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-purple-600">Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setShowOrderDetailModal(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900">Write Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Order</label>
                <p className="text-sm text-gray-600">#{selectedOrder.order_number}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Decoration</label>
                <p className="text-sm text-gray-900 font-medium">
                  {selectedOrder.items.find(item => item.decoration_id === selectedDecorationId)?.decoration?.name || 
                   selectedOrder.items.find(item => item.decoration_id === selectedDecorationId)?.decoration_name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`text-3xl transition-colors ${
                        star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Comment *</label>
                <textarea
                  required
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                  placeholder="Share your experience with this decoration..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
