'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import MenuNav from '@/components/layout/MenuNav';
import Footer from '@/components/layout/Footer';

export default function EventPage() {
  const events = [
    {
      id: 1,
      title: "Wedding Market Fair by Loka Mata. Yuk, #NikahTanpaRibet!",
      dateRange: "24 Oktober – 26 Oktober 2025",
      location: "Jl. Gatot Subroto No.6 Kav. 37, RT.6/RW.3, Kuningan, East Kuningan, Setiabudi",
      description: "You're invited to the Wedding Market Fair by Loka Mata. Yuk, #NikahTanpaRibet!…",
      image: "/images/event/1.png",
    },
    {
      id: 2,
      title: "Wedding Expo by Gunawarman. Together, We've Created Moments Filled with Love, Warmth, and Inspiration",
      dateRange: "09 November 2025",
      location: "Jl. Gatot Subroto, RT.1/RW.3, Gelora, Kecamatan Setiabudi, Kota Jakarta Pusat",
      description: "You're invited to the Wedding Expo by Gunawarman. Together, We've Created Moments Filled with Love, Warmth, and Inspiration…",
      image: "/images/event/2.png",
    },
    {
      id: 3,
      title: "Wedding Celebration Festival by Jakarta Convention Center. Year and Biggest Wedding Exhibition",
      dateRange: "14 November – 27 November 2025",
      location: "Jl. Gatot Subroto, RT.1/RW.3, Gelora, Kecamatan Tanah Abang, Kota Jakarta Pusat",
      description: "You're invited to the Wedding Celebration Festival by Jakarta Convention Center. Year and Biggest Wedding Exhibition…",
      image: "/images/event/3.png",
    },
    {
      id: 4,
      title: "16th Bekasi Wedding Exhibition by Jakarta Event Organizer. The Biggest Wedding Exhibition in the City",
      dateRange: "28 November – 30 November 2025",
      location: "Mall, Grand Galaxy Park, Jl. Boulevard Raya No.1 Lantai 2, Jaka Setia, Bekasi Selatan",
      description: "You're invited to the 16th Bekasi Wedding Exhibition by Jakarta Event Organizer. The Biggest Wedding Exhibition in the City…",
      image: "/images/event/4.png",
    },
    {
      id: 5,
      title: "Jakarta Dream Wedding Expo 2025",
      dateRange: "15 Desember – 18 Desember 2025",
      location: "Jl. HR Rasuna Said No. 22, Kota Jakarta Selatan",
      description: "You're invited to the Jakarta Dream Wedding Expo 2025…",
      image: "/images/event/5.png",
    },
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
          <span className="text-gray-600">Event</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Event</h1>
        <p className="text-gray-600 mb-10">
          Sedang mencari inspirasi untuk hari pernikahan Anda? Lihat rangkaian event pernikahan yang dapat Anda kunjungi
          di bawah ini! Rencanakan kunjungan Anda dan jangan lupa untuk melakukan RSVP.
        </p>

        {/* LIST OF EVENT CARDS */}
        <div className="flex flex-col gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col lg:flex-row"
            >
              {/* LEFT IMAGE */}
              <div className="lg:w-1/3 w-full h-64 lg:h-auto relative">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none"
                />
              </div>

              {/* RIGHT CONTENT */}
              <div className="lg:w-2/3 w-full p-6 flex flex-col justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{event.dateRange}</p>

                  <h2 className="text-lg font-semibold text-gray-900 leading-relaxed mb-2">
                    {event.title}
                  </h2>

                  {/* Location */}
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                    <svg width="18" height="18" fill="#9A82DB" className="mt-0.5">
                      <path d="M12 10c0 1.657-1.343 3-3 3s-3-1.343-3-3 
                        1.343-3 3-3 3 1.343 3 3zm-3-9C6.243 1 4 3.243 4 6c0 
                        4.5 5 11 5 11s5-6.5 5-11c0-2.757-2.243-5-5-5z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {event.description}
                  </p>
                </div>

                {/* BUTTON */}
                <button className="mt-4 px-5 py-2 rounded-lg bg-[#D3A0D2] text-white font-semibold hover:bg-[#caa3e3] transition">
                  Lihat Selengkapnya
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      <Footer />
    </div>
  );
}
