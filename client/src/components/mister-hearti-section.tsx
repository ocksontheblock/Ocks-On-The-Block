import { useState, useEffect, useRef } from "react";

const featuredOcks = [
  {
    id: 1,
    name: "Mister Hearti",
    bio: "While the block moves loud, Mister Hearti moves steady — always there, always real. He don't just run the store — he holds the corner with heart.",
    image: "./mister-hearti.jpg",
    objectPosition: "center top"
  },
  {
    id: 2,
    name: "Young Ock",
    bio: "The rookie with the fresh cut. Might burn your sandwich, still your bro. New to the game but got that corner store spirit running through his veins.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
  },
  {
    id: 3,
    name: "No Credit Ock",
    bio: "Knows your whole family. Still won't let you slide. Zero tabs. He's seen it all, heard every excuse, and his answer stays the same: cash only, my friend.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
  },
  {
    id: 4,
    name: "Big Ock",
    bio: "Runs the grill, runs the energy. The one all the other Ocks listen to. When Big Ock speaks, the whole corner store goes quiet — that's respect.",
    image: "https://images.unsplash.com/photo-1557862921-37829c790f19?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
  },
  {
    id: 5,
    name: "Amped Ock",
    bio: "Loudest in the store. Calls your order before you even open your mouth. Pure energy, pure NYC — he knows what you want before you do.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
  }
];

export default function MisterHeartiSection() {
  const [currentOckIndex, setCurrentOckIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartRef = useRef<number>(0);
  const touchEndRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoAdvance = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentOckIndex((prevIndex) => 
          (prevIndex + 1) % featuredOcks.length
        );
        setIsTransitioning(false);
      }, 300);
      
    }, 6500); // 6.5 seconds per slide
  };

  useEffect(() => {
    startAutoAdvance();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentOckIndex((prevIndex) => 
            prevIndex === 0 ? featuredOcks.length - 1 : prevIndex - 1
          );
          setIsTransitioning(false);
        }, 300);
        startAutoAdvance(); // Restart timer
      } else if (e.key === 'ArrowRight') {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentOckIndex((prevIndex) => 
            (prevIndex + 1) % featuredOcks.length
          );
          setIsTransitioning(false);
        }, 300);
        startAutoAdvance(); // Restart timer
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    
    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      // Swipe left - next slide
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentOckIndex((prevIndex) => 
          (prevIndex + 1) % featuredOcks.length
        );
        setIsTransitioning(false);
      }, 300);
      startAutoAdvance(); // Restart timer
    }

    if (isRightSwipe) {
      // Swipe right - previous slide
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentOckIndex((prevIndex) => 
          prevIndex === 0 ? featuredOcks.length - 1 : prevIndex - 1
        );
        setIsTransitioning(false);
      }, 300);
      startAutoAdvance(); // Restart timer
    }
  };

  const currentOck = featuredOcks[currentOckIndex];

  return (
    <section id="mister-hearti" className="bg-gradient-to-br from-gray-50 to-white py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-12">
          <h2 className="font-anton text-4xl md:text-6xl mb-6 text-gray-900">
            Featured Ocks
          </h2>
          <p className="text-xl md:text-2xl text-ock-orange font-semibold mb-4">
            Meet the legends behind the counter
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            These are the real ones who make NYC corner stores more than just places to shop — they're the heartbeat of the neighborhood.
          </p>
        </div>
        
        <div 
          className={`transition-all duration-500 select-none ${isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 max-w-4xl mx-auto border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1 text-left">
                <h3 className="text-3xl md:text-4xl font-anton mb-6 text-ock-orange">
                  {currentOck.name}
                </h3>
                <p className="text-lg md:text-xl leading-relaxed text-gray-700 mb-6" 
                   style={{ fontFamily: "'Georgia', serif" }}>
                  {currentOck.bio}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-ock-orange rounded-full"></div>
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Corner Store Legend
                  </span>
                </div>
              </div>
              
              <div className="order-1 md:order-2">
                <img 
                  src={currentOck.image}
                  alt={currentOck.name} 
                  className="w-full h-80 md:h-96 object-cover rounded-2xl shadow-xl"
                  style={{ 
                    objectPosition: currentOck.objectPosition || 'center',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                  }}
                  onError={(e) => {
                    console.log('Image failed to load:', currentOck.image);
                    // Keep the original image path for Mister Hearti
                    if (currentOck.name === "Mister Hearti") {
                      e.currentTarget.src = "/mister-hearti.jpg";
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Slide indicators and instructions */}
        <div className="flex justify-center space-x-2 mt-8">
          {featuredOcks.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentOckIndex(index);
                  setIsTransitioning(false);
                }, 300);
                startAutoAdvance(); // Restart timer
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentOckIndex 
                  ? 'bg-ock-orange scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
        
        <p className="text-xs text-gray-400 text-center mt-3">
          Swipe or use arrow keys • Auto-advances every 6.5 seconds
        </p>
      </div>
    </section>
  );
}