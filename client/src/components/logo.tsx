import { useEffect, useState } from 'react';

interface LogoProps {
  className?: string;
  variant?: 'header' | 'footer' | 'large';
}

export default function Logo({ className = "", variant = 'header' }: LogoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getSize = () => {
    switch (variant) {
      case 'large': return 'text-6xl md:text-8xl';
      case 'footer': return 'text-2xl md:text-3xl';
      default: return 'text-3xl md:text-4xl';
    }
  };

  const getGradient = () => {
    switch (variant) {
      case 'large': return 'from-ock-orange via-red-500 to-yellow-500';
      case 'footer': return 'from-white via-gray-100 to-gray-200';
      default: return 'from-ock-orange via-red-600 to-orange-400';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Graffiti Shadow Effect */}
      <div 
        className={`
          absolute -inset-1 bg-gradient-to-r from-black/30 to-gray-800/30 
          ${getSize()} font-black tracking-tight transform rotate-1 scale-105
          blur-sm opacity-50
        `}
        style={{
          fontFamily: '"Permanent Marker", "Bangers", "Creepster", cursive',
          WebkitTextStroke: '2px black',
        }}
      >
        OCKS ON THE BLOCK
      </div>
      
      {/* Main Logo */}
      <h1 
        className={`
          relative z-10 bg-gradient-to-r ${getGradient()} 
          bg-clip-text text-transparent ${getSize()} 
          font-black tracking-tight transform -rotate-1
          ${mounted ? 'animate-pulse' : ''}
        `}
        style={{
          fontFamily: '"Permanent Marker", "Bangers", "Creepster", cursive',
          WebkitTextStroke: variant === 'footer' ? '1px rgba(0,0,0,0.3)' : '2px black',
          textShadow: variant === 'footer' 
            ? '2px 2px 4px rgba(0,0,0,0.5)' 
            : '3px 3px 0px #000, 4px 4px 8px rgba(0,0,0,0.5)',
          filter: 'drop-shadow(0 0 10px rgba(255, 69, 0, 0.3))',
        }}
      >
        OCKS
        <span className="block text-center leading-none -mt-2">
          ON THE
        </span>
        <span className="block text-center leading-none -mt-2">
          BLOCK
        </span>
      </h1>

      {/* Street Art Accents */}
      {variant === 'large' && (
        <div className="absolute -inset-4 pointer-events-none">
          {/* Spray paint dots */}
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-ock-orange rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-yellow-400 rounded-full opacity-40"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-red-500 rounded-full opacity-80"></div>
          <div className="absolute bottom-0 right-1/4 w-2 h-2 bg-orange-400 rounded-full opacity-50 animate-pulse delay-300"></div>
          
          {/* Graffiti lines */}
          <div className="absolute top-1/2 -left-2 w-8 h-0.5 bg-gradient-to-r from-ock-orange to-transparent opacity-70 transform -rotate-12"></div>
          <div className="absolute bottom-1/3 -right-2 w-6 h-0.5 bg-gradient-to-l from-red-500 to-transparent opacity-60 transform rotate-12"></div>
        </div>
      )}
    </div>
  );
}