import Image from 'next/image';

const features = [
  {
    title: 'Mengisi form pesanan yang telah tersedia',
  },
  {
    title: 'Melakukan konsultasi via Whatsapp untuk pesanannya',
  },
  {
    title: 'Setelah deal, lakukan pembayaran berdasarkan kesepakatan yang telah dibuat',
  },
  {
    title: 'Pesanan diproses sesuai kesepakatan jadwal yang telah ditentukan',
  },
];

export default function ExclusiveOfferCTA() {
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Gradient Card */}
        <div
          className="rounded-2xl p-12 relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, #D3A0D2 0%, #EAB4DE 40%, #F9D4FE 100%)',
          }}
        >
          {/* Header: Title left, button right */}
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center mb-12">
            {/* Title */}
            <div className="text-left">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#FFF1FE' }}>
                Cara Memesan Produk di DWD
              </h2>
            </div>

            {/* CTA Button */}
            <button
              className="px-8 py-3 rounded-lg font-semibold text-white mt-6 lg:mt-0"
              style={{ backgroundColor: '#EAA0D7' }}
            >
              Pesan Sekarang
            </button>
          </div>

          {/* Features Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">

            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-start">
                

                {/* Vertical Line */}
                <div className="h-full w-1 bg-white/40 mr-4"></div>

                {/* Icon */}
                <div className="flex flex-col mr-4">
                    <Image className="mb-2"
                      src="/images/star.png"
                      width={40}
                      height={40}
                      alt="Star"
                    />
                  {/* Text */}
                  <h3 className="text-base font-semibold" style={{ color: '#FFF1FE' }}>
                    {feature.title}
                  </h3>
                </div>

                
              </div>
            ))}

          </div>

          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        </div>
      </div>
    </section>
  );
}
