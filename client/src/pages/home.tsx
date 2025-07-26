import HamburgerMenu from "@/components/hamburger-menu";
import HeroSection from "@/components/hero-section";
import MisterHeartiSection from "@/components/mister-hearti-section";
import FeaturedOcks from "@/components/featured-ocks";
import DripSection from "@/components/drip-section";
import MapSection from "@/components/map-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HamburgerMenu />
      <HeroSection />
      <MisterHeartiSection />
      <FeaturedOcks />
      <DripSection />
      <MapSection />
      <Footer />
    </div>
  );
}
