'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FiHome, FiShoppingBag, FiUser, FiLogOut, FiAlertCircle } from 'react-icons/fi';
import { authService } from '@/lib/auth';

interface CustomerSidebarProps {
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function CustomerSidebar({ user }: CustomerSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, href: '/customer/dashboard' },
    { id: 'orders', label: 'My Orders', icon: FiShoppingBag, href: '/customer/orders' },
    { id: 'profile', label: 'Profile', icon: FiUser, href: '/customer/profile' },
  ];

  return (
    <>
      <aside className="w-64 bg-white shadow-lg fixed h-full flex flex-col z-40">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1
            className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"
            style={{ fontFamily: 'var(--font-red-hat-display)' }}
          >
            DWD
          </h1>
          <p className="text-sm text-gray-500 mt-1">Customer Panel</p>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-gray-800">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button → trigger modal */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all group"
          >
            <FiLogOut className="w-5 h-5 group-hover:text-red-600" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FiAlertCircle className="w-6 h-6 text-red-600" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to log out from your account?
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 font-medium transition-colors shadow-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
