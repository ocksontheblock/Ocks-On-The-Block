import HamburgerMenu from "@/components/hamburger-menu";
import LogoSection from "@/components/logo-section";
import OckOriginsSection from "@/components/ock-origins-section";
import MisterHeartiSection from "@/components/mister-hearti-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HamburgerMenu />
      <LogoSection />
      <OckOriginsSection />
      <MisterHeartiSection />
      <Footer />
    </div>
  );
}
