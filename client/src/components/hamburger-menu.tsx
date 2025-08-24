import { useState } from "react";
import { useLocation } from "wouter";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = (path: string) => {
    setLocation(path);
    setIsOpen(false);
    // Scroll to top when navigating
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setLocation('/');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      <div 
        className="hamburger fixed top-5 left-5 z-[999] cursor-pointer transition-all duration-300 bg-black bg-opacity-70 p-3 rounded-lg backdrop-blur-sm border border-white border-opacity-20"
        onClick={toggleMenu}
      >
        <span 
          className={`block w-8 h-1 mb-1.5 bg-white rounded transition-all duration-300 ${
            isOpen ? 'transform rotate-45 translate-y-2.5' : ''
          }`}
        />
        <span 
          className={`block w-8 h-1 mb-1.5 bg-white rounded transition-all duration-300 ${
            isOpen ? 'opacity-0' : ''
          }`}
        />
        <span 
          className={`block w-8 h-1 bg-white rounded transition-all duration-300 ${
            isOpen ? 'transform -rotate-45 -translate-y-2.5' : ''
          }`}
        />
      </div>
      
      <div 
        className={`menu-overlay fixed top-0 left-0 h-full w-full bg-black bg-opacity-95 justify-center items-center z-[998] transition-all duration-300 ${
          isOpen ? 'flex' : 'hidden'
        }`}
      >
        <div className="menu-content text-center">
          <button
            onClick={() => handleLinkClick('/')}
            className="block text-white text-4xl md:text-5xl my-6 font-anton hover:text-ock-orange transition-colors duration-300"
          >
            Home
          </button>
          <button
            onClick={() => handleLinkClick('/about')}
            className="block text-white text-4xl md:text-5xl my-6 font-anton hover:text-ock-orange transition-colors duration-300"
          >
            About
          </button>
          <button
            onClick={() => handleLinkClick('/ocky-drip')}
            className="block text-white text-4xl md:text-5xl my-6 font-anton hover:text-ock-orange transition-colors duration-300"
          >
            Ocky Drip
          </button>
          <button
            onClick={() => handleLinkClick('/buy-ocks')}
            className="block text-white text-4xl md:text-5xl my-6 font-anton hover:text-ock-orange transition-colors duration-300"
          >
            Buy the Ocks
          </button>
          <button
            onClick={() => handleLinkClick('/ocky-map')}
            className="block text-white text-4xl md:text-5xl my-6 font-anton hover:text-ock-orange transition-colors duration-300"
          >
            The Ocky Map
          </button>
          <button
            onClick={() => handleLinkClick('/scavenger-hunt')}
            className="block text-white text-4xl md:text-5xl my-6 font-anton hover:text-ock-orange transition-colors duration-300"
          >
            Scavenger Hunt
          </button>
          
          {/* Authentication Section */}
          <div className="border-t border-white border-opacity-20 mt-8 pt-6">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center text-white text-lg mb-4">
                  <User className="h-5 w-5 mr-2" />
                  <span>{user?.username}</span>
                </div>
                <button
                  onClick={() => handleLinkClick('/inventory')}
                  className="block text-white text-2xl hover:text-ock-orange transition-colors duration-300"
                >
                  My Collection
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center text-white text-2xl hover:text-ock-orange transition-colors duration-300 mx-auto"
                >
                  <LogOut className="h-6 w-6 mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => handleLinkClick('/login')}
                  className="block text-white text-2xl hover:text-ock-orange transition-colors duration-300"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleLinkClick('/signup')}
                  className="block text-white text-2xl hover:text-ock-orange transition-colors duration-300"
                >
                  Join the Hunt
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
