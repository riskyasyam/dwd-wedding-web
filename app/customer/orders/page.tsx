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
                                : order.status === 'paid'
                                ? 'bg-blue-100 text-blue-700'
                                : order.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

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
                        <Link
                          href={`/orders/${order.order_number}/status`}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

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
