import { useState, useEffect } from "react";

const featuredOcks = [
  {
    id: 1,
    name: "Mister Hearti",
    bio: "While the block moves loud, Mister Hearti moves steady — always there, always real. He don't just run the store — he holds the corner with heart.",
    image: "mister-hearti.jpg"
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

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentOckIndex((prevIndex) => 
          (prevIndex + 1) % featuredOcks.length
        );
        setIsTransitioning(false);
      }, 300); // Transition duration
      
    }, 6500); // 6.5 seconds per slide

    return () => clearInterval(interval);
  }, []);

  const currentOck = featuredOcks[currentOckIndex];

  return (
    <section id="mister-hearti" className="bg-gray-50 py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900" 
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
          Featured Ocks
        </h2>
        
        <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
          <img 
            src={currentOck.image}
            alt={currentOck.name} 
            className="w-full rounded-2xl shadow-2xl mb-6"
          />
          
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-ock-orange font-anton">
            {currentOck.name}
          </h3>
          
          <p className="text-lg md:text-xl leading-relaxed text-gray-700" 
             style={{ fontFamily: "'Georgia', serif" }}>
            {currentOck.bio}
          </p>
        </div>
        
        {/* Slide indicators */}
        <div className="flex justify-center space-x-2 mt-8">
          {featuredOcks.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentOckIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentOckIndex 
                  ? 'bg-ock-orange scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}