'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiTrash2, FiMinus, FiPlus, FiTag, FiShoppingBag } from 'react-icons/fi';
import api, { getImageUrl } from '@/lib/axios';
import { authService } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import MenuNav from '@/components/layout/MenuNav';
import Footer from '@/components/layout/Footer';

interface CartItem {
  id: number;
  cart_id: number;
  decoration_id: number;
  type: 'custom' | 'random';
  quantity: number;
  price: number;
  decoration: {
    id: number;
    name: string;
    slug: string;
    region: string;
    price: number;
    final_price: number;
    discount: number;
    images: Array<{ id: number; image: string }>;
  };
}

interface CartData {
  cart: {
    id: number;
    user_id: number;
    items: CartItem[];
  };
  subtotal: number;
  item_count: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchCart();
  }, [router]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/customer/cart');
      if (response.data.success) {
        setCartData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdating(itemId);
    try {
      const response = await api.put(`/customer/cart/items/${itemId}`, {
        quantity: newQuantity,
      });
      
      if (response.data.success) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to remove this item?')) return;
    
    setUpdating(itemId);
    try {
      const response = await api.delete(`/customer/cart/items/${itemId}`);
      
      if (response.data.success) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Please enter a voucher code');
      return;
    }

    if (!cartData) {
      setVoucherError('Cart is empty');
      return;
    }

    setApplyingVoucher(true);
    setVoucherError('');
    
    try {
      const response = await api.post('/customer/orders/checkout/validate-voucher', {
        code: voucherCode.toUpperCase(),
        cart_total: cartData.subtotal,
      });
      
      if (response.data.success) {
        const discountAmount = response.data.data.discount_amount || 0;
        setVoucherDiscount(discountAmount);
        // Store voucher for checkout page
        localStorage.setItem('applied_voucher', JSON.stringify({
          code: voucherCode.toUpperCase(),
          discount: discountAmount
        }));
        alert(`Voucher applied! Discount: Rp ${discountAmount.toLocaleString('id-ID')}`);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid voucher code';
      setVoucherError(errorMessage);
      setVoucherDiscount(0);
      localStorage.removeItem('applied_voucher');
    } finally {
      setApplyingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setVoucherCode('');
    setVoucherDiscount(0);
    setVoucherError('');
    localStorage.removeItem('applied_voucher');
  };

  const calculateDiscount = () => {
    if (!cartData) return 0;
    
    // Calculate total discount from decoration prices
    return cartData.cart.items.reduce((total, item) => {
      const discountPerItem = item.decoration.price - item.decoration.final_price;
      return total + (discountPerItem * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    if (!cartData || !cartData.subtotal) return 0;
    const subtotal = Number(cartData.subtotal) || 0;
    const discount = Number(calculateDiscount()) || 0;
    const voucher = Number(voucherDiscount) || 0;
    return subtotal - discount - voucher;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <MenuNav />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9A82DB] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cart...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!cartData || cartData.cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <FiShoppingBag className="mx-auto h-24 w-24 text-gray-400" />
              <h2 className="mt-4 text-2xl font-semibold text-gray-900">Your cart is empty</h2>
              <p className="mt-2 text-gray-600">Start adding some decorations to your cart!</p>
              <Link
                href="/dekor"
                className="mt-6 inline-block px-8 py-3 bg-[#9A82DB] text-white rounded-lg font-medium hover:bg-[#8A72CB] transition-colors"
              >
                Browse Decorations
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <MenuNav />
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-[#9A82DB] hover:underline">Home</Link>
            <span className="text-gray-400">&gt;</span>
            <Link href="/dekor" className="text-[#9A82DB] hover:underline">Dekor</Link>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-600">Your cart</span>
          </div>
        </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartData.cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 p-6 flex gap-4"
              >
                {/* Image */}
                <div className="shrink-0">
                  <Image
                    src={getImageUrl(item.decoration.images[0]?.image) || '/images/placeholder.jpg'}
                    alt={item.decoration.name}
                    width={120}
                    height={120}
                    className="rounded-lg object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        href={`/dekor/${item.decoration.slug}`}
                        className="text-lg font-semibold text-gray-900 hover:text-[#9A82DB]"
                      >
                        {item.decoration.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        Type: <span className="font-medium capitalize">{item.type}</span>
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={updating === item.id}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Price and Quantity */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900">
                      Rp {item.decoration.final_price.toLocaleString('id-ID')}
                      {item.decoration.discount > 0 && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          Rp {item.decoration.price.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating === item.id || item.quantity <= 1}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiMinus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating === item.id}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiPlus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    Rp {cartData.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>

                {calculateDiscount() > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount (-20%)</span>
                    <span className="font-medium">
                      - Rp {calculateDiscount().toLocaleString('id-ID')}
                    </span>
                  </div>
                )}

                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Voucher Discount</span>
                    <span className="font-medium">
                      - Rp {voucherDiscount.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-medium">Rp 0</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>Rp {calculateTotal().toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Voucher Input */}
              <div className="mb-4">
                {voucherDiscount > 0 ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-800">Voucher Applied: {voucherCode}</p>
                      <p className="text-xs text-green-600">Discount: Rp {voucherDiscount.toLocaleString('id-ID')}</p>
                    </div>
                    <button
                      onClick={removeVoucher}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Add promo code"
                        value={voucherCode}
                        onChange={(e) => {
                          setVoucherCode(e.target.value.toUpperCase());
                          setVoucherError('');
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A82DB] focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={applyVoucher}
                      disabled={applyingVoucher || !voucherCode.trim()}
                      className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {applyingVoucher ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}
                {voucherError && (
                  <p className="mt-2 text-sm text-red-600">{voucherError}</p>
                )}
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="block w-full px-6 py-3 bg-black text-white text-center rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Go to Payment →
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}
