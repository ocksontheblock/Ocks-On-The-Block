import MysteryBoxSection from "@/components/mystery-box-section";
import HamburgerMenu from "@/components/hamburger-menu";
import Footer from "@/components/footer";

export default function BuyOcks() {
  return (
    <div className="min-h-screen bg-white">
      <HamburgerMenu />
      <div className="pt-16">
        <MysteryBoxSection />
      </div>
      <Footer />
    </div>
  );
}