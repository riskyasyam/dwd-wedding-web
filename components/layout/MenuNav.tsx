'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Home', href: '/' },
  { name: 'Dekor', href: '/dekor' },
  { name: 'Inspirasi', href: '/inspirasi' },
  { name: 'Event', href: '/event' },
];

export default function MenuNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-12 h-14">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`text-base font-medium transition-colors ${
                  isActive
                    ? 'text-[#9A82DB]'
                    : 'text-gray-600 hover:text-[#9A82DB]'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
