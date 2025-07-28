# Ocks on the Block - Complete Website Code Backup

## Project Structure

```
client/
├── index.html
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── components/
│   │   ├── hamburger-menu.tsx
│   │   ├── hero-section.tsx
│   │   ├── logo-section.tsx
│   │   ├── mister-hearti-section.tsx (slideshow)
│   │   ├── featured-ocks.tsx
│   │   ├── drip-section.tsx
│   │   ├── map-section.tsx
│   │   └── footer.tsx
│   ├── pages/
│   │   ├── home.tsx
│   │   ├── ocky-drip.tsx
│   │   ├── ocky-map.tsx
│   │   ├── buy-ocks.tsx
│   │   └── not-found.tsx
│   ├── lib/
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   └── hooks/
│       ├── use-mobile.tsx
│       └── use-toast.ts
server/
├── index.ts
├── db.ts
├── storage.ts
├── routes.ts
└── vite.ts
shared/
└── schema.ts
public/
└── mister-hearti.jpg
```

## Key Files

### client/index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>Ocks on the Block - Rep Your Ock. Wear Your Block.</title>
    <meta name="description" content="Authentic street culture from NYC's finest corner stores. Meet the Ocks and rep your block with exclusive merchandise." />
    <link href="https://fonts.googleapis.com/css2?family=Anton:wght@400&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    <script type="text/javascript" src="https://replit.com/public/js/replit-dev-banner.js"></script>
  </body>
</html>
```

### client/src/main.tsx
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### client/src/App.tsx
```tsx
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import OckyDrip from "@/pages/ocky-drip";
import OckyMap from "@/pages/ocky-map";
import BuyOcks from "@/pages/buy-ocks";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/ocky-drip" component={OckyDrip} />
      <Route path="/ocky-map" component={OckyMap} />
      <Route path="/buy-ocks" component={BuyOcks} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
```

### client/src/pages/home.tsx
```tsx
import HamburgerMenu from "@/components/hamburger-menu";
import LogoSection from "@/components/logo-section";
import MisterHeartiSection from "@/components/mister-hearti-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HamburgerMenu />
      <LogoSection />
      <MisterHeartiSection />
      <Footer />
    </div>
  );
}
```

### client/src/components/logo-section.tsx
```tsx
export default function LogoSection() {
  return (
    <section className="bg-white py-20 px-4 md:px-8 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-anton text-6xl md:text-8xl lg:text-9xl mb-8 text-gray-900">
          Ocks on the Block
        </h1>
        <p className="font-anton text-2xl md:text-3xl lg:text-4xl text-ock-orange mb-8">
          Rep Your Ock. Wear Your Block.
        </p>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Authentic street culture from NYC's finest corner stores. 
          Meet the Ocks and rep your block with exclusive merchandise.
        </p>
      </div>
    </section>
  );
}
```

### client/src/components/mister-hearti-section.tsx (Auto-Slideshow)
```tsx
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
            className="w-full max-w-2xl mx-auto h-96 object-cover rounded-2xl shadow-2xl mb-6"
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
```

### client/src/components/hamburger-menu.tsx
```tsx
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
        className={`hamburger fixed top-5 left-5 z-[999] cursor-pointer transition-all duration-300 ${
          window.scrollY > 100 ? 'bg-black bg-opacity-80 p-2 rounded-lg' : ''
        }`}
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
```

## Installation & Setup

1. **Dependencies**: All packages are listed in package.json
2. **Database**: PostgreSQL with Drizzle ORM
3. **Environment**: NODE_ENV=development, DATABASE_URL provided
4. **Start**: `npm run dev` runs both frontend and backend
5. **Custom Image**: Place mister-hearti.jpg in public/ folder

## Key Features Implemented

- ✅ Multi-page navigation (Home, Ocky Drip, Ocky Map, Buy Ocks)
- ✅ Auto-slideshow with 6.5 second intervals
- ✅ Responsive design with NYC street culture theme
- ✅ Custom Mister Hearti image integration
- ✅ "Buy Now" button routing
- ✅ Balanced image sizing in slideshow
- ✅ Database schema for future expansion

This is your complete working website backup!