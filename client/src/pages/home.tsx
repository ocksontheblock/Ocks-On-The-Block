import { useState, useEffect } from "react";
import HamburgerMenu from "@/components/hamburger-menu";
import UserDisplay from "@/components/user-display";
import MisterHeartiSection from "@/components/mister-hearti-section";
import AmpedOckShowcase from "@/components/amped-ock-showcase";
import Footer from "@/components/footer";
import EmailSignupModal from "@/components/email-signup-modal";
import Logo from "@/components/logo";
import logoPath from "@assets/05510F49-8788-4872-9022-591FAA016F73_1756020759938.png";

export default function Home() {
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Auto-popup removed - modal will only show when manually triggered

  return (
    <div className="min-h-screen bg-white">
      <HamburgerMenu />
      <UserDisplay />
      
      <main>
        {/* Hero Section with Logo */}
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 px-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-ock-orange/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-green-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="text-center max-w-5xl mx-auto relative z-10">
          <div className="mb-12">
            <div className="flex justify-center mb-8">
              <img 
                src={logoPath} 
                alt="Ocks on the Block - Ockwear for Everywhere" 
                className="w-full max-w-lg md:max-w-2xl h-auto transform hover:scale-105 transition-all duration-500 drop-shadow-2xl"
              />
            </div>
          </div>
          
          <div className="space-y-6 mb-12">
            <p className="text-2xl md:text-3xl text-gray-700 font-light max-w-3xl mx-auto leading-relaxed">
              Celebrating the heartbeat of NYC corner stores through authentic street culture
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-ock-orange rounded-full"></div>
                <span>Authentic NYC Culture</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Corner Store Legends</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Street Culture</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button 
              onClick={() => document.getElementById('mister-hearti')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-ock-orange text-white py-4 px-8 rounded-2xl font-bold hover:bg-red-500 transition-all duration-300 transform hover:scale-105 shadow-lg active:bg-red-600"
            >
              Meet the Ocks
            </button>
            <button 
              onClick={() => window.location.href = '/buy-ocks'}
              className="bg-white text-ock-orange py-4 px-8 rounded-2xl font-bold border-2 border-ock-orange hover:bg-ock-orange hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Shop Collection
            </button>
          </div>
        </div>
      </section>

        <AmpedOckShowcase />
        <MisterHeartiSection />
      </main>
      <Footer />
      
      <EmailSignupModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)} 
      />
    </div>
  );
}
