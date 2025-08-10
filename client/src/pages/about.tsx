import AboutSection from "@/components/about-section";
import HamburgerMenu from "@/components/hamburger-menu";
import Footer from "@/components/footer";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <HamburgerMenu />
      <div className="pt-16">
        <AboutSection />
      </div>
      <Footer />
    </div>
  );
}