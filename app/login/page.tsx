'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/lib/auth';
import { FaFacebook, FaGoogle, FaApple, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa'; // Tambahkan FaArrowLeft

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [expiredMessage, setExpiredMessage] = useState('');

  useEffect(() => {
    // Check if user was redirected due to token expiration
    const expired = searchParams.get('expired');
    if (expired === 'true') {
      setExpiredMessage('Your session has expired. Please login again.');
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await authService.login(formData);
      // Redirect based on user role
      if (response.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        // Redirect customer langsung ke My Orders
        router.push('/customer/orders');
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      {/* Tambahkan class 'relative' di sini agar tombol back bisa di-position absolute */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 relative">
        
        {/* --- Tombol Back to Home --- */}
        <div className="absolute top-6 left-6 md:top-8 md:left-8">
          <Link 
            href="/" 
            className="flex items-center text-gray-500 hover:text-[#515DEF] transition-colors group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={14} />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>

        <div className="w-full max-w-md mt-10 lg:mt-0">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#313131]" style={{ fontFamily: 'var(--font-red-hat-display)' }}>
              DWD
            </h1>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Login</h2>
            <p className="text-gray-600">Login to access your travelwise account</p>
          </div>

          {/* Token Expired Message */}
          {expiredMessage && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-yellow-800 font-medium">{expiredMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#6366F1] border-gray-300 rounded focus:ring-[#6366F1]"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-[#FF6B6B] hover:underline">
                Forgot Password
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#515DEF] text-white py-3 rounded-lg font-semibold hover:bg-[#192BFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#FF6B6B] font-semibold hover:underline">
                Sign up
              </Link>
            </p>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or login with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaFacebook className="text-blue-600" size={24} />
              </button>
              <button
                type="button"
                className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaGoogle className="text-red-500" size={24} />
              </button>
              <button
                type="button"
                className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaApple className="text-black" size={24} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-white p-12">
        <div className="w-full max-w-md">
          <div className="p-8 flex items-center justify-center">
            <Image
              src="/images/bg_login.png"
              alt="Login Illustration"
              width={400}
              height={600}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}