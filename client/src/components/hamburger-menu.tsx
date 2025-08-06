import { useState } from "react";
import { useLocation } from "wouter";

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = (path: string) => {
    setLocation(path);
    setIsOpen(false);
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
        </div>
      </div>
    </nav>
  );
}
