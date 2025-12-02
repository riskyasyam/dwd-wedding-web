'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import MenuNav from '@/components/layout/MenuNav';
import Footer from '@/components/layout/Footer';

export default function InspirasiPage() {

  const [selectedCountry, setSelectedCountry] = useState("Indonesia");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const images = Array.from({ length: 16 }, (_, i) => `/images/inspirasi/${i + 1}.png`);

  const countryList = [
    "Indonesia",
    "Korea",
    "Japan",
    "India",
    "International",
  ];

  const colors = [
    "#FFD1DC", "#FFB6C1", "#F4C2E0", "#D8BFD8", "#C7BFFF",
    "#AEE6E3", "#FCE8B2", "#FFCC99", "#D2B48C", "#A5A5A5"
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <MenuNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Breadcrumb */}
        <div className="text-sm mb-4">
          <Link href="/" className="text-[#9A82DB] hover:underline">Home</Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-600">Inspirasi</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Inspirasi</h1>
        <p className="text-gray-600 mb-8">
          Showing result for inspiration about all <span className="font-semibold">categories</span> in <span className="font-semibold">{selectedCountry}</span>
        </p>

        {/* MAIN LAYOUT */}
        <div className="flex gap-12">

          {/* LEFT SIDEBAR */}
          <div className="w-48">

            {/* Filter Title */}
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>
                <svg width="18" height="18" fill="#555">
                  <path d="M3 4h12l-4.5 6v4l-3 2v-6L3 4z" />
                </svg>
              </span>
              Filter
            </h3>

            {/* Warna */}
            <p className="text-gray-700 font-medium mb-2">Warna</p>

            <div className="grid grid-cols-5 gap-2 mb-8">
              {colors.map((c, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full cursor-pointer border"
                  style={{ backgroundColor: c }}
                ></div>
              ))}
            </div>

            {/* Country Select */}
            <div className="relative">
              <button
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="px-4 py-2 bg-[#F3E4FE] text-[#9A82DB] rounded-full text-sm font-semibold flex items-center gap-2"
              >
                <Image src="/images/world.png" width={18} height={18} alt="world" />
                {selectedCountry}
              </button>

              {showCountryDropdown && (
                <div className="absolute mt-2 w-full bg-white border rounded-xl shadow-lg z-20">
                  {countryList.map((country) => (
                    <button
                      key={country}
                      onClick={() => {
                        setSelectedCountry(country);
                        setShowCountryDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      {country}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CONTENT — MASONRY GRID */}
          <div className="flex-1">
            <div className="columns-1 sm:columns-2 lg:columns-4 gap-4">
              {images.map((src, index) => (
                <div key={index} className="mb-4 break-inside-avoid relative group">

                  <Image
                    src={src}
                    alt="Inspirasi"
                    width={300}
                    height={400}
                    className="w-full rounded-xl object-cover"
                  />

                  {/* Add (+) icon top right */}
                  <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow-md">
                    <svg width="20" height="20" fill="#9A82DB">
                      <path d="M10 4v12M4 10h12" stroke="#9A82DB" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
