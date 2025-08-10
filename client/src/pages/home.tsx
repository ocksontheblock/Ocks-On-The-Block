import { useState, useEffect } from "react";
import HamburgerMenu from "@/components/hamburger-menu";
import LogoSection from "@/components/logo-section";
import MisterHeartiSection from "@/components/mister-hearti-section";
import MysteryBoxSection from "@/components/mystery-box-section";
import MapSection from "@/components/map-section";
import Footer from "@/components/footer";
import EmailSignupModal from "@/components/email-signup-modal";

export default function Home() {
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Show signup modal after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSignupModal(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <HamburgerMenu />
      <LogoSection />
      <MisterHeartiSection />
      <MysteryBoxSection />
      <MapSection />
      <Footer />
      
      <EmailSignupModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)} 
      />
    </div>
  );
}
