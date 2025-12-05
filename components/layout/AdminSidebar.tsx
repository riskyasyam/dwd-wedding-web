'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  FiHome, FiPackage, FiGift, FiShoppingBag, FiCalendar, 
  FiImage, FiStar, FiUsers, FiSettings, FiLogOut, 
  FiChevronDown, FiChevronRight, FiBriefcase, FiAlertCircle 
} from 'react-icons/fi';
import { authService } from '@/lib/auth';

interface AdminSidebarProps {
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
  children?: { id: string; label: string; href: string }[];
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['decorations']);
  
  // State untuk mengontrol visibilitas modal logout
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

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, href: '/admin/dashboard' },
    { id: 'decorations', label: 'Decorations', icon: FiPackage, href: '/admin/decorations' },
    { id: 'vouchers', label: 'Vouchers', icon: FiGift, href: '/admin/vouchers' },
    { id: 'events', label: 'Events', icon: FiCalendar, href: '/admin/events' },
    { id: 'advertisements', label: 'Advertisements', icon: FiImage, href: '/admin/advertisements' },
    { id: 'vendors', label: 'Vendors', icon: FiBriefcase, href: '/admin/vendors' },
    { id: 'inspirations', label: 'Inspirations', icon: FiImage, href: '/admin/inspirations' },
    { id: 'testimonials', label: 'Testimonials', icon: FiStar, href: '/admin/testimonials' },
    { id: 'orders', label: 'Orders', icon: FiShoppingBag, href: '/admin/orders' },
    { id: 'customers', label: 'Customers', icon: FiUsers, href: '/admin/customers' },
    { id: 'settings', label: 'Settings', icon: FiSettings, href: '/admin/settings' },
  ];

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isExpanded = expandedMenus.includes(item.id);
    const isActive = item.href === pathname;
    const hasActiveChild = item.children?.some(child => child.href === pathname);

    if (item.children) {
      return (
        <li key={item.id}>
          <button
            onClick={() => toggleMenu(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              hasActiveChild
                ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="flex-1 text-left">{item.label}</span>
            {isExpanded ? (
              <FiChevronDown className="w-4 h-4" />
            ) : (
              <FiChevronRight className="w-4 h-4" />
            )}
          </button>
          {isExpanded && (
            <ul className="mt-1 ml-8 space-y-1">
              {item.children.map((child) => {
                const isChildActive = pathname === child.href;
                return (
                  <li key={child.id}>
                    <button
                      onClick={() => router.push(child.href)}
                      className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-all ${
                        isChildActive
                          ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium shadow-md'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {child.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.id}>
        <button
          onClick={() => item.href && router.push(item.href)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive
              ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Icon className="w-5 h-5" />
          <span>{item.label}</span>
        </button>
      </li>
    );
  };

  return (
    <>
      <aside className="w-64 bg-white shadow-lg fixed h-full flex flex-col z-40">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-red-hat-display)' }}>
            DWD
          </h1>
          <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
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
              <p className="text-sm font-medium truncate text-gray-800">{user.first_name} {user.last_name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => renderMenuItem(item))}
          </ul>
        </nav>

        {/* Logout Button (Triggers Modal) */}
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FiAlertCircle className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to log out? You will need to sign in again to access the admin panel.
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