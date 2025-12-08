import Image from 'next/image';
import Link from 'next/link';

export default function HelpCenterSection() {
  return (
    <section className="bg-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Help Center</h2>

        {/* CTA Card with Gradient Background */}
        <div className="relative overflow-hidden rounded-2xl pl-0 md:pl-40 shadow-md hover:shadow-lg transition-shadow duration-300">
          {/* Gradient Background with Circles */}
          <div className="absolute inset-0 bg-white">
            {/* Left Circle Shadow */}
            <div className="absolute -left-10 md:-left-20 top-1/2 -translate-y-1/2 w-20 md:w-40 h-20 md:h-40 bg-purple-400 rounded-full opacity-30 blur-3xl"></div>
            {/* Right Circle Shadow */}
            <div className="absolute -right-10 md:-right-20 top-1/2 -translate-y-1/2 w-20 md:w-40 h-20 md:h-40 bg-pink-300 rounded-full opacity-30 blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative flex flex-col md:flex-row items-center gap-4 md:gap-8 p-6 md:p-8">
            {/* Image */}
            <div className="shrink-0">
              <div className="relative w-16 h-16 md:w-18 md:h-18">
                <Image
                  src="/images/halo1.png"
                  alt="Help"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                Anda membutuhkan bantuan atau memiliki pertanyaan?
              </h3>
              <Link
                href="/help"
                className="text-[#9A82DB] font-bold hover:underline inline-flex items-center gap-2 text-base md:text-xl"
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
