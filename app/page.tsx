import Navbar from '@/components/layout/Navbar';
import MenuNav from '@/components/layout/MenuNav';
import Footer from '@/components/layout/Footer';
import HeroCarousel from '@/components/sections/HeroCarousel';
import VisionMission from '@/components/sections/VisionMission';
import RecommendationSection from '@/components/sections/RecommendationSection';
import HelpCenterSection from '@/components/sections/HelpCenterSection';
import ExclusiveOfferCTA from '@/components/sections/ExclusiveOfferCTA';
import VendorSectionsGroup from '@/components/sections/VendorSectionsGroup';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <MenuNav />
      <HeroCarousel />
      <VisionMission />
      <RecommendationSection />
      <HelpCenterSection />
      <ExclusiveOfferCTA />
      <VendorSectionsGroup />
      <Footer />
    </div>
  );
}
