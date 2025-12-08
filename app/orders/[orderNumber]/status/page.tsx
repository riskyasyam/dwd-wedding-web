'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiCheckCircle, FiClock, FiXCircle, FiDownload, FiCopy } from 'react-icons/fi';
import api from '@/lib/axios';
import { authService } from '@/lib/auth';

interface PaymentStatus {
  order_number: string;
  order_status: 'pending' | 'paid' | 'failed' | 'completed' | 'cancelled';
  transaction_status: string;
  payment_type: string;
  transaction_time: string;
  gross_amount: string;
  va_number?: string;
  bank?: string;
  qr_code_url?: string;
}

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;
  
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_ATTEMPTS = 60; // 5 minutes with 5 second intervals
  const INITIAL_INTERVAL = 2000; // 2 seconds for first 30 seconds
  const NORMAL_INTERVAL = 5000; // 5 seconds after

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!orderNumber) {
      router.push('/cart');
      return;
    }

    checkPaymentStatus();
    
    let interval: NodeJS.Timeout;

    if (polling) {
      const pollInterval = attempts < 15 ? INITIAL_INTERVAL : NORMAL_INTERVAL;
      
      interval = setInterval(() => {
        setAttempts((prev) => prev + 1);
        
        if (attempts >= MAX_ATTEMPTS) {
          setPolling(false);
          clearInterval(interval);
          return;
        }
        
        checkPaymentStatus();
      }, pollInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderNumber, polling, attempts, router]);

  const checkPaymentStatus = async () => {
    try {
      const response = await api.get(`/customer/orders/payment-status/${orderNumber}`);
      
      if (response.data.success) {
        const paymentData = response.data.data;
        setStatus(paymentData);
        
        // Stop polling if status is final
        const finalStates = ['paid', 'failed', 'cancelled', 'completed'];
        if (finalStates.includes(paymentData.order_status)) {
          setPolling(false);
        }
      }
    } catch (error: any) {
      console.error('Error checking payment status:', error);
      
      // Handle 404 error - order might not exist yet or Midtrans transaction not created
      if (error.response?.status === 404 || error.response?.data?.message?.includes("doesn't exist")) {
        // If we've tried multiple times and still 404, likely backend didn't create Midtrans transaction
        if (attempts > 5) {
          console.error('⚠️ BACKEND ISSUE: Midtrans transaction not found after multiple attempts');
          console.error('Order number:', orderNumber);
          console.error('This means backend created the order but failed to create Midtrans transaction');
          
          setError(
            'Informasi pembayaran tidak tersedia. ' +
            'Backend belum membuat transaksi Midtrans untuk order ini. ' +
            '\n\nSilakan cek halaman "My Orders" atau hubungi customer service.'
          );
          
          setPolling(false);
          // Redirect after showing error
          setTimeout(() => router.push('/customer/orders'), 5000);
          return;
        }
        // Otherwise keep trying (transaction might be being created)
        console.log(`Attempt ${attempts}: Transaction not found yet, retrying...`);
      }
      
      // For other errors (500, etc), show error message
      if (error.response?.status === 500) {
        const errorMsg = error.response?.data?.message || 'Internal server error';
        console.error('❌ Backend error (500):', errorMsg);
        
        if (attempts > 3) {
          setError(
            'Backend error: ' + errorMsg +
            '\n\nSilakan refresh halaman atau hubungi customer service jika masalah berlanjut.'
          );
          setPolling(false);
        }
      }
      
      // Stop polling after too many attempts
      if (attempts > 10) {
        setPolling(false);
        if (!error) {
          setError('Gagal memuat status pembayaran setelah beberapa percobaan. Silakan refresh halaman.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshStatus = () => {
    setLoading(true);
    checkPaymentStatus();
  };

  if (loading && !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#9A82DB] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Checking payment status...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiXCircle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">Order Not Found</h2>
          <p className="mt-2 text-gray-600">Unable to find order information</p>
          <Link
            href="/cart"
            className="mt-6 inline-block px-6 py-3 bg-[#9A82DB] text-white rounded-lg font-medium hover:bg-[#8A72CB] transition-colors"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success State */}
        {status.order_status === 'paid' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Success!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-semibold text-gray-900">{status.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {status.payment_type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold text-gray-900">
                    Rp {parseInt(status.gross_amount).toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Time</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(status.transaction_time).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link
                href="/customer/orders"
                className="px-8 py-3 bg-[#9A82DB] text-white rounded-lg font-medium hover:bg-[#8A72CB] transition-colors"
              >
                View My Orders
              </Link>
              <Link
                href="/"
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Pending State */}
        {status.order_status === 'pending' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <FiClock className="h-12 w-12 text-yellow-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Waiting for Payment</h1>
              <p className="text-gray-600">
                Please complete your payment to confirm your order
              </p>
              {polling && (
                <p className="mt-2 text-sm text-gray-500">
                  Checking payment status automatically...
                </p>
              )}
            </div>

            {/* Bank Transfer Instructions */}
            {status.payment_type === 'bank_transfer' && status.va_number && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">
                  Virtual Account Payment
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-blue-800 mb-1">Bank</p>
                    <p className="text-xl font-bold text-blue-900 uppercase">
                      {status.bank || 'Bank Transfer'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 mb-1">Virtual Account Number</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-mono font-bold text-blue-900 tracking-wider">
                        {status.va_number}
                      </p>
                      <button
                        onClick={() => copyToClipboard(status.va_number!)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Copy VA Number"
                      >
                        <FiCopy className="h-5 w-5 text-blue-600" />
                      </button>
                    </div>
                    {copied && (
                      <p className="text-sm text-green-600 mt-1">✓ Copied to clipboard!</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 mb-1">Amount to Pay</p>
                    <p className="text-2xl font-bold text-blue-900">
                      Rp {parseInt(status.gross_amount).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">How to Pay:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li>Open your mobile banking or internet banking</li>
                    <li>Select Transfer to Virtual Account</li>
                    <li>Enter the VA number above</li>
                    <li>Enter the exact amount shown</li>
                    <li>Confirm and complete the payment</li>
                  </ol>
                </div>
              </div>
            )}

            {/* QRIS Instructions */}
            {status.payment_type === 'qris' && status.qr_code_url && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-green-900 mb-4 text-center">
                  Scan QR Code to Pay
                </h2>
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <Image
                      src={status.qr_code_url}
                      alt="QRIS Code"
                      width={300}
                      height={300}
                      className="rounded-lg"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-800 mb-2">Amount to Pay</p>
                  <p className="text-2xl font-bold text-green-900">
                    Rp {parseInt(status.gross_amount).toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">How to Pay:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li>Open your e-wallet app (GoPay, OVO, Dana, ShopeePay, etc.)</li>
                    <li>Select Scan QR or QRIS payment</li>
                    <li>Scan the QR code above</li>
                    <li>Confirm the amount and complete payment</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Order Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number</span>
                  <span className="font-medium text-gray-900">{status.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-yellow-600">Waiting Payment</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-900">
                    {new Date(status.transaction_time).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleRefreshStatus}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#9A82DB] text-white rounded-lg font-medium hover:bg-[#8A72CB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Checking...' : 'Refresh Status'}
              </button>
              <Link
                href="/customer/orders"
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 text-center rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                View Orders
              </Link>
            </div>

            {!polling && attempts >= MAX_ATTEMPTS && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 text-center">
                  ⚠️ Auto-check timeout. Click "Refresh Status" to check manually or check your orders page later.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Failed State */}
        {(status.order_status === 'failed' || status.order_status === 'cancelled') && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiXCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {status.order_status === 'cancelled' ? 'Order Cancelled' : 'Payment Failed'}
            </h1>
            <p className="text-gray-600 mb-6">
              {status.order_status === 'cancelled'
                ? 'Your order has been cancelled.'
                : 'Unfortunately, your payment could not be processed.'}
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="space-y-2 text-sm text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number</span>
                  <span className="font-medium text-gray-900">{status.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-red-600 capitalize">
                    {status.order_status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link
                href="/cart"
                className="px-8 py-3 bg-[#9A82DB] text-white rounded-lg font-medium hover:bg-[#8A72CB] transition-colors"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
