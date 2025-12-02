import Image from 'next/image';
import Link from 'next/link';

export default function HelpCenterSection() {
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Help Center</h2>

        {/* CTA Card with Gradient Background */}
        <div className="relative overflow-hidden rounded-2xl pl-40 shadow-md hover:shadow-lg transition-shadow duration-300">
          {/* Gradient Background with Circles */}
          <div className="absolute inset-0 bg-white">
            {/* Left Circle Shadow */}
            <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-40 h-40 bg-purple-400 rounded-full opacity-30 blur-3xl"></div>
            {/* Right Circle Shadow */}
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-40 h-40 bg-pink-300 rounded-full opacity-30 blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative flex items-center gap-8 p-8">
            {/* Image */}
            <div className="flex-shrink-0">
              <div className="relative w-18 h-18">
                <Image
                  src="/images/halo1.png"
                  alt="Help"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Anda membutuhkan bantuan atau memiliki pertanyaan?
              </h3>
              <Link
                href="/help"
                className="text-[#9A82DB] font-bold hover:underline inline-flex items-center gap-2 text-xl"
              >
                Kunjungi Help Center
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
