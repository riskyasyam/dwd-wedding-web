import Link from 'next/link';
import { FaInstagram, FaTiktok, FaFacebookF, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#E8B4D9] text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 - DWD Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6">DWD</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="hover:opacity-80 transition-opacity">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/decor" className="hover:opacity-80 transition-opacity">
                  Decor
                </Link>
              </li>
              <li>
                <Link href="/inspiration" className="hover:opacity-80 transition-opacity">
                  Inspiration
                </Link>
              </li>
              <li>
                <Link href="/event" className="hover:opacity-80 transition-opacity">
                  Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 - Layanan Konsumen */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Layanan Konsumen</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="hover:opacity-80 transition-opacity">
                  Pusat Bantuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Social Media Icons */}
          <div className="flex md:justify-end items-start">
            <div className="flex gap-4">
              <Link 
                href="https://instagram.com" 
                target="_blank"
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <FaInstagram className="text-[#E8B4D9] text-xl" />
              </Link>
              <Link 
                href="https://tiktok.com" 
                target="_blank"
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <FaTiktok className="text-[#E8B4D9] text-xl" />
              </Link>
              <Link 
                href="https://facebook.com" 
                target="_blank"
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <FaFacebookF className="text-[#E8B4D9] text-xl" />
              </Link>
              <Link 
                href="https://youtube.com" 
                target="_blank"
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <FaYoutube className="text-[#E8B4D9] text-xl" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Left - Logo and Links */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <h2 className="text-2xl font-bold">DWD</h2>
              <div className="flex gap-4 text-sm">
                <Link href="/privacy" className="hover:opacity-80 transition-opacity">
                  Kebijakan Privasi
                </Link>
                <Link href="/terms" className="hover:opacity-80 transition-opacity">
                  Syarat & Ketentuan
                </Link>
                <Link href="/sitemap" className="hover:opacity-80 transition-opacity">
                  Peta Situs
                </Link>
              </div>
            </div>

            {/* Right - Copyright */}
            <div className="text-sm">
              Hak Cipta © 2025 DWD. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
