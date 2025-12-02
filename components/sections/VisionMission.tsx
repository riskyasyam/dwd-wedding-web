import Image from 'next/image';

const visionCards = [
  {
    image: '/images/blossom1.png',
    title: 'We create beauty',
    subtitle: 'with purpose',
  },
  {
    image: '/images/heart1.png',
    title: 'We turn love',
    subtitle: 'into art',
  },
  {
    image: '/images/abstract1.png',
    title: 'We blend luxury',
    subtitle: 'with meaning',
  },
];

export default function VisionMission() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-16 bg-gray-300"></div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Our Vision Mission
            </h2>
            <div className="h-px w-16 bg-gray-300"></div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">
            Elevating Every Moment into Masterpiece
          </h3>
        </div>

        {/* Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {visionCards.map((card, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Icon */}
              <div className="mb-6 relative w-20 h-20">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Text */}
              <h4 className="text-xl font-semibold text-gray-900">
                {card.title}
              </h4>
              <p className="text-xl font-semibold text-gray-900">
                {card.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
