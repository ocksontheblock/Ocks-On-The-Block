import DripSection from "@/components/drip-section";
import HamburgerMenu from "@/components/hamburger-menu";
import Footer from "@/components/footer";

export default function OckyDrip() {
  return (
    <div className="min-h-screen bg-white">
      <HamburgerMenu />
      <div className="pt-20">
        <DripSection />
      </div>
      <Footer />
    </div>
  );
}