'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'ID' | 'EN'>('ID');

  const languages = [
    { code: 'ID', flag: '/images/flag_indo1.png', name: 'Indonesia' },
    { code: 'EN', flag: '/images/flag_english.png', name: 'English' },
  ];

  const handleLanguageChange = (code: 'ID' | 'EN') => {
    setSelectedLang(code);
    setIsLangDropdownOpen(false);
  };

  const currentLanguage = languages.find((lang) => lang.code === selectedLang);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 
              className="text-2xl font-semibold text-[#938F99]" 
              style={{ fontFamily: 'var(--font-red-hat-display)' }}
            >
              DWD
            </h1>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#9A82DB] focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Side - Register, Login, Language */}
          <div className="flex items-center gap-4">
            <Link
              href="/register"
              className="px-6 py-2 bg-[#F2F2F7] border border-[#9A82DB] rounded-lg text-gray-900 font-medium hover:bg-gray-100 transition-colors"
            >
              Register
            </Link>
            <Link
              href="/login"
              className="px-6 py-2 bg-[#F2F2F7] border border-[#9A82DB] rounded-lg text-gray-900 font-medium hover:bg-gray-100 transition-colors"
            >
              Login
            </Link>
            
            {/* Language Selector with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Image
                  src={currentLanguage?.flag || '/images/flag_indo.png'}
                  alt={currentLanguage?.name || 'Indonesia'}
                  width={24}
                  height={16}
                  className="rounded"
                />
                <div className="h-4 w-px bg-gray-300"></div>
                <span className="text-gray-900 font-medium">{selectedLang}</span>
                <FiChevronDown
                  className={`w-4 h-4 text-gray-600 transition-transform ${
                    isLangDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as 'ID' | 'EN')}
                      className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors ${
                        selectedLang === lang.code ? 'bg-gray-50' : ''
                      }`}
                    >
                      <Image
                        src={lang.flag}
                        alt={lang.name}
                        width={24}
                        height={16}
                        className="rounded"
                      />
                      <span className="text-gray-900 font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
