import VendorSection from './VendorSection';

// Photography vendors
const photographyVendors = [
  {
    id: 1,
    name: 'IMAGENIC',
    image: '/images/fotografi.png',
    rating: 4.5,
    category: 'Recommended Photography',
  },
  {
    id: 2,
    name: 'ROTROF PHT',
    image: '/images/fotografi.png',
    rating: 4.8,
    category: 'Favorite Photography',
  },
  {
    id: 3,
    name: 'POTOMOTO',
    image: '/images/fotografi.png',
    rating: 4.7,
    category: 'Recommended Photography',
  },
  {
    id: 4,
    name: 'SECREFCY',
    image: '/images/fotografi.png',
    rating: 4.9,
    category: 'Recommended Photography',
  },
  {
    id: 5,
    name: 'TALKPICT TO',
    image: '/images/fotografi.png',
    rating: 4.6,
    category: 'New Photography',
  },
];

// Videography vendors
const videographyVendors = [
  {
    id: 1,
    name: 'OSKY STUDIO',
    image: '/images/videografi.png',
    rating: 4.8,
    category: 'Recommended Videography',
  },
  {
    id: 2,
    name: 'CERAH DIGITAL',
    image: '/images/videografi.png',
    rating: 4.7,
    category: 'New Videography',
  },
  {
    id: 3,
    name: 'KAMERA POHON',
    image: '/images/videografi.png',
    rating: 4.9,
    category: 'Favorite Videography',
  },
  {
    id: 4,
    name: 'VML PROJECTS',
    image: '/images/videografi.png',
    rating: 4.6,
    category: 'Recommended Videography',
  },
  {
    id: 5,
    name: 'PINEAPPLE VIDEOWORK',
    image: '/images/videografi.png',
    rating: 4.8,
    category: 'Favorite Videography',
  },
];

// Makeup vendors
const makeupVendors = [
  {
    id: 1,
    name: 'DEVY MUA',
    image: '/images/makeup.png',
    rating: 4.9,
    category: 'Favorite Make Up',
  },
  {
    id: 2,
    name: 'NURADILLA MUA',
    image: '/images/makeup.png',
    rating: 4.7,
    category: 'Favorite Photography',
  },
  {
    id: 3,
    name: 'WULAN MUA',
    image: '/images/makeup.png',
    rating: 4.8,
    category: 'New Make Up',
  },
  {
    id: 4,
    name: 'IMA MUA',
    image: '/images/makeup.png',
    rating: 4.6,
    category: 'Recommended Make Up',
  },
  {
    id: 5,
    name: 'YOBEL MUA',
    image: '/images/makeup.png',
    rating: 4.9,
    category: 'New Make Up',
  },
];

// Attire vendors
const attireVendors = [
  {
    id: 1,
    name: 'SUNDARI',
    image: '/images/attire.png',
    rating: 4.7,
    category: 'New Attire',
  },
  {
    id: 2,
    name: 'IVORY BRIDAL',
    image: '/images/attire.png',
    rating: 4.8,
    category: 'Recommended Attire',
  },
  {
    id: 3,
    name: 'DUSERA',
    image: '/images/attire.png',
    rating: 4.9,
    category: 'Favorite Attire',
  },
  {
    id: 4,
    name: 'RENTIQUE',
    image: '/images/attire.png',
    rating: 4.6,
    category: 'Favorite Attire',
  },
  {
    id: 5,
    name: 'STYLE THEORY',
    image: '/images/attire.png',
    rating: 4.8,
    category: 'New Attire',
  },
];

// Entertainment vendors
const entertainmentVendors = [
  {
    id: 1,
    name: 'JAKARTA EVENT GROUP',
    image: '/images/entertainment.png',
    rating: 4.8,
    category: 'Recommended Entertainment',
  },
  {
    id: 2,
    name: 'SWEET MEMORY ENT',
    image: '/images/entertainment.png',
    rating: 4.7,
    category: 'New Entertainment',
  },
  {
    id: 3,
    name: 'THREE 5',
    image: '/images/entertainment.png',
    rating: 4.9,
    category: 'Recommended Entertainment',
  },
  {
    id: 4,
    name: 'ARJUNA',
    image: '/images/entertainment.png',
    rating: 4.6,
    category: 'Favorite Entertainment',
  },
  {
    id: 5,
    name: 'VOYAGE',
    image: '/images/entertainment.png',
    rating: 4.8,
    category: 'Recommended Entertainment',
  },
];

export default function VendorSectionsGroup() {
  return (
    <div className="bg-white">
      <VendorSection
        title="Fotografi"
        description="Our trusted photography partners who capture your moments beautifully"
        vendors={photographyVendors}
      />
      
      <VendorSection
        title="Videografi"
        description="Creative storytellers who bring your memories to life"
        vendors={videographyVendors}
      />
      
      <VendorSection
        title="Make up / Hair & Hijab do"
        description="Beauty experts who enhance every detail of your elegance"
        vendors={makeupVendors}
      />
      
      <VendorSection
        title="Attire"
        description="Designers who craft perfection for your special day"
        vendors={attireVendors}
      />
      
      <VendorSection
        title="Entertainment (Musik)"
        description="Entertainers who set the perfect tone for your special day"
        vendors={entertainmentVendors}
      />
    </div>
  );
}
