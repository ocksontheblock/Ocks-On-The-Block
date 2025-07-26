export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h3 className="font-anton text-2xl text-ock-orange mb-4">
            Ocks on the Block
          </h3>
          <p className="text-gray-400">
            Authentic street culture from NYC's finest corner stores
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8">
          <a 
            href="mailto:info@ocksontheblock.com"
            className="text-gray-300 hover:text-ock-orange transition-colors duration-300"
          >
            Contact Us
          </a>
          <span className="hidden md:inline text-gray-600">|</span>
          <a 
            href="#"
            className="text-gray-300 hover:text-ock-orange transition-colors duration-300"
          >
            Instagram
          </a>
          <span className="hidden md:inline text-gray-600">|</span>
          <a 
            href="#"
            className="text-gray-300 hover:text-ock-orange transition-colors duration-300"
          >
            TikTok
          </a>
          <span className="hidden md:inline text-gray-600">|</span>
          <a 
            href="#"
            className="text-gray-300 hover:text-ock-orange transition-colors duration-300"
          >
            Twitter
          </a>
        </div>
        
        <div className="border-t border-gray-800 pt-6">
          <p className="text-gray-500 text-sm">
            &copy; 2025 Ocks on the Block. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Made with love in the five boroughs
          </p>
        </div>
      </div>
    </footer>
  );
}
