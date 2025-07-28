import MapSection from "@/components/map-section";
import HamburgerMenu from "@/components/hamburger-menu";
import Footer from "@/components/footer";

export default function OckyMap() {
  return (
    <div className="min-h-screen bg-white">
      <HamburgerMenu />
      <div className="pt-20">
        <MapSection />
      </div>
      <Footer />
    </div>
  );
}