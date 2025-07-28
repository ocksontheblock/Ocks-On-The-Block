import FeaturedOcks from "@/components/featured-ocks";
import HamburgerMenu from "@/components/hamburger-menu";
import Footer from "@/components/footer";

export default function BuyOcks() {
  return (
    <div className="min-h-screen bg-white">
      <HamburgerMenu />
      <div className="pt-20">
        <FeaturedOcks />
      </div>
      <Footer />
    </div>
  );
}