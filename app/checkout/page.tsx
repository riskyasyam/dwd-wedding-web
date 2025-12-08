'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiPhone, FiMapPin, FiPackage } from 'react-icons/fi';
import api, { getImageUrl } from '@/lib/axios';
import { authService } from '@/lib/auth';

interface CartItem {
  id: number;
  decoration_id: number;
  type: 'custom' | 'random';
  quantity: number;
  price: number;
  decoration: {
    id: number;
    name: string;
    slug: string;
    final_price: number;
    images: Array<{ id: number; image: string }>;
  };
}

interface CartData {
  cart: {
    items: CartItem[];
  };
  subtotal: number;
  item_count: number;
}

interface CheckoutFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  sub_district: string;
  postal_code: string;
  notes: string;
  voucher_code: string;
}

// Declare window.snap type
declare global {
  interface Window {
    snap: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    sub_district: '',
    postal_code: '',
    notes: '',
    voucher_code: '',
  });

  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    fetchCart();
    loadUserData();
    
    // Load voucher from cart page if available
    const appliedVoucher = localStorage.getItem('applied_voucher');
    console.log('🔍 Checking localStorage for voucher:', appliedVoucher);
    
    if (appliedVoucher) {
      try {
        const { code, discount } = JSON.parse(appliedVoucher);
        console.log('📦 Parsed voucher data:', { code, discount, type: typeof discount });
        
        if (code && discount > 0) {
          setFormData((prev) => ({ ...prev, voucher_code: code }));
          setVoucherDiscount(discount || 0);
          console.log('✅ Voucher loaded from localStorage:', { code, discount });
        } else {
          console.log('❌ Invalid voucher data - code or discount missing/zero');
          localStorage.removeItem('applied_voucher');
        }
      } catch (error) {
        console.error('❌ Error parsing voucher:', error);
        localStorage.removeItem('applied_voucher');
      }
    } else {
      console.log('ℹ️ No voucher in localStorage');
    }
  }, [router]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/customer/cart');
      if (response.data.success) {
        setCartData(response.data.data);
        
        if (response.data.data.item_count === 0) {
          router.push('/cart');
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const user = await authService.getUser();
      setFormData((prev) => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof CheckoutFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.sub_district.trim()) newErrors.sub_district = 'Sub-district is required';
    if (!formData.postal_code.trim()) newErrors.postal_code = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    // Warn if voucher is applied
    if (voucherDiscount > 0 && formData.voucher_code) {
      const confirmVoucher = window.confirm(
        `⚠️ VOUCHER ACTIVE\n\n` +
        `Voucher: ${formData.voucher_code}\n` +
        `Discount: Rp ${voucherDiscount.toLocaleString('id-ID')}\n` +
        `Total to pay: Rp ${calculateTotal().toLocaleString('id-ID')}\n\n` +
        `Proceed with voucher discount?\n\n` +
        `Click OK to continue with voucher\n` +
        `Click Cancel to remove voucher`
      );
      
      if (!confirmVoucher) {
        removeVoucher();
        return;
      }
    }

    // Check if Snap.js is loaded
    if (typeof window.snap === 'undefined') {
      alert('Payment system not loaded. Please refresh the page.');
      return;
    }

    setProcessing(true);

    try {
      // Prepare checkout data - DO NOT include voucher_code field if no discount
      const checkoutData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        sub_district: formData.sub_district,
        postal_code: formData.postal_code,
        notes: formData.notes,
      };
      
      // ONLY add voucher_code if discount is active
      if (voucherDiscount > 0 && formData.voucher_code) {
        checkoutData.voucher_code = formData.voucher_code;
        console.log('✅ VOUCHER APPLIED:', formData.voucher_code, 'Discount:', voucherDiscount);
      } else {
        console.log('❌ NO VOUCHER - voucher_code field NOT included in request');
      }
      
      console.log('=== CHECKOUT REQUEST DATA ===');
      console.log('Sending to backend:', JSON.stringify(checkoutData, null, 2));
      console.log('Cart subtotal:', cartData?.subtotal);
      console.log('Voucher discount:', voucherDiscount);
      console.log('Calculated total:', calculateTotal());
      console.log('Has voucher_code in request?', 'voucher_code' in checkoutData);
      console.log('============================');
      
      const response = await api.post('/customer/orders/checkout', checkoutData);

      console.log('Checkout response:', response.data);

      if (response.data.success) {
        const { snap_token, order } = response.data.data;
        
        if (!snap_token) {
          alert('❌ Backend tidak mengembalikan snap_token.\n\nSilakan cek konfigurasi Midtrans di backend.');
          setProcessing(false);
          return;
        }
        
        // Store order data
        setOrderData(response.data.data);
        
        // Clear voucher
        localStorage.removeItem('applied_voucher');
        
        console.log('Opening Snap popup with token:', snap_token);
        
        // Open Midtrans Snap popup
        window.snap.pay(snap_token, {
          onSuccess: function(result: any) {
            console.log('Payment success:', result);
            // Redirect to order status page for polling
            router.push(`/orders/${order.order_number}/status`);
          },
          onPending: function(result: any) {
            console.log('Payment pending:', result);
            // Redirect to order status page for polling
            router.push(`/orders/${order.order_number}/status`);
          },
          onError: function(result: any) {
            console.error('Payment error:', result);
            alert('❌ Pembayaran gagal. Silakan coba lagi.');
            setProcessing(false);
          },
          onClose: function() {
            console.log('Snap popup closed');
            alert('⚠️ Popup pembayaran ditutup. Silakan selesaikan pembayaran Anda.\n\nCek halaman "My Orders" untuk melanjutkan pembayaran.');
            setProcessing(false);
            // Optionally redirect to orders page
            router.push('/customer/orders');
          }
        });
      } else {
        alert('Checkout failed. Please try again.');
        setProcessing(false);
      }
    } catch (error: any) {
      console.error('❌ Checkout error:', error);
      console.error('Error response:', error.response?.data);
      
      const backendMessage = error.response?.data?.message || '';
      const errorMessage = backendMessage || 'Terjadi kesalahan saat memproses checkout';
      
      alert(
        '❌ Gagal memproses checkout\n\n' +
        'Error: ' + errorMessage + '\n\n' +
        'Silakan coba lagi atau hubungi customer service jika masalah berlanjut.'
      );
      
      setProcessing(false);
    }
  };



  const calculateTotal = () => {
    if (!cartData) return 0;
    const subtotal = Number(cartData.subtotal) || 0;
    const discount = Number(voucherDiscount) || 0;
    return subtotal - discount;
  };

  const removeVoucher = () => {
    console.log('Removing voucher...');
    setVoucherDiscount(0);
    setFormData((prev) => ({ ...prev, voucher_code: '' }));
    localStorage.removeItem('applied_voucher');
    alert('Voucher removed. Total updated to original price.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9A82DB] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!cartData || cartData.cart.items.length === 0) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-white flex">
        {/* Left Sidebar - Order Summary */}
        <div className="w-full lg:w-[500px] bg-[#DEB5E3] p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            {/* Logo */}
            <h1 className="text-4xl font-bold text-gray-900 mb-8">DWD</h1>
            
            <h2 className="text-2xl font-bold text-white mb-6">Order summary</h2>

            {/* Decoration Item */}
            {cartData.cart.items.length > 0 && (
              <div className="mb-8">
                {cartData.cart.items.map((item) => (
                  <div key={item.id} className="mb-6">
                    <div className="bg-white rounded-xl overflow-hidden mb-4">
                      <Image
                        src={getImageUrl(item.decoration.images[0]?.image) || '/images/placeholder.jpg'}
                        alt={item.decoration.name}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.decoration.name}</h3>
                    <div className="space-y-1 text-gray-700">
                      <div className="flex justify-between">
                        <span className="text-sm">Type</span>
                        <span className="font-medium capitalize">{item.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Notes</span>
                        <span className="font-medium">{formData.notes || '-'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pricing */}
            <div className="border-t-2 border-white/30 pt-6 space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span className="font-medium">Rp {(cartData?.subtotal || 0).toLocaleString('id-ID')}</span>
              </div>
              
              {voucherDiscount > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-green-700">
                    <span>Voucher ({formData.voucher_code})</span>
                    <span className="font-medium">- Rp {voucherDiscount.toLocaleString('id-ID')}</span>
                  </div>
                  <button
                    onClick={removeVoucher}
                    className="text-xs text-red-600 hover:text-red-700 underline"
                  >
                    Remove voucher
                  </button>
                </div>
              )}
              
              <div className="border-t border-white/30 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-white">Total</span>
                  <span className="text-3xl font-bold text-white">
                    Rp {calculateTotal().toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/cart"
              className="block text-center mt-6 text-sm text-gray-700 hover:text-gray-900"
            >
              ← Back to cart
            </Link>
          </div>
        </div>

        {/* Right Content - Forms */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete your order</h1>
            
            {/* Voucher Active Warning */}
            {voucherDiscount > 0 && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Voucher "{formData.voucher_code}" applied! You're saving Rp {voucherDiscount.toLocaleString('id-ID')}
                    </p>
                    <button
                      onClick={removeVoucher}
                      className="mt-1 text-xs text-green-700 hover:text-green-900 underline font-medium"
                    >
                      Remove voucher
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-8">
              {/* Personal Details */}
              <section>
                <h2 className="text-xl font-bold text-[#9A82DB] mb-4">Personal Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Depan
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A82DB] ${
                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter Your First Name..."
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Belakang
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A82DB] ${
                        errors.last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter Your Last Name..."
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A82DB] ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter Your Email..."
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No. Hp
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A82DB] ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter Your Phone Number..."
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section>
                <h2 className="text-xl font-bold text-[#9A82DB] mb-4">Shipping Address</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A82DB] ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Alamat Anda..."
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kota
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A82DB] ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Kota Anda..."
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kelurahan
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A82DB] ${
                          errors.district ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Kelurahan Anda..."
                      />
                      {errors.district && (
                        <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kecamatan
                      </label>
                      <input
                        type="text"
                        name="sub_district"
                        value={formData.sub_district}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A82DB] ${
                          errors.sub_district ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Kecamatan Anda..."
                      />
                      {errors.sub_district && (
                        <p className="mt-1 text-sm text-red-600">{errors.sub_district}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kode Pos
                      </label>
                      <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A82DB] ${
                          errors.postal_code ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Kode Pos (12345)"
                      />
                      {errors.postal_code && (
                        <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/cart')}
                  className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToPayment}
                  disabled={processing}
                  className="flex-1 px-6 py-4 bg-[#6C63FF] text-white rounded-lg font-medium hover:bg-[#5B54E6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processing ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


    </>
  );
}
