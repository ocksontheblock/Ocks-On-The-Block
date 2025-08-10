import { useState, useEffect } from "react";
import HamburgerMenu from "@/components/hamburger-menu";
import MisterHeartiSection from "@/components/mister-hearti-section";
import Footer from "@/components/footer";
import EmailSignupModal from "@/components/email-signup-modal";
import logoPath from "@assets/05510F49-8788-4872-9022-591FAA016F73_1754809027759.png";

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
      
      {/* Hero Section with Logo */}
      <section className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-4xl mx-auto">
          <img 
            src={logoPath} 
            alt="Ocks on the Block - Ockwear for Everywhere" 
            className="mx-auto mb-8 max-w-md w-full h-auto"
          />
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Celebrating the heartbeat of NYC corner stores through authentic street culture
          </p>
        </div>
      </section>

      <MisterHeartiSection />
      <Footer />
      
      <EmailSignupModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)} 
      />
    </div>
  );
}
