import { Instagram } from "lucide-react";
import { SiTiktok } from "react-icons/si";

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
        
        <div className="flex justify-center items-center gap-8 mb-8">
          <a 
            href="mailto:info@ocksontheblock.com"
            className="text-gray-300 hover:text-ock-orange transition-colors duration-300"
          >
            Contact Us
          </a>
          <a 
            href="#"
            className="flex items-center gap-2 text-gray-300 hover:text-ock-orange transition-colors duration-300"
          >
            <Instagram size={18} />
            Instagram
          </a>
          <a 
            href="#"
            className="flex items-center gap-2 text-gray-300 hover:text-ock-orange transition-colors duration-300"
          >
            <SiTiktok size={18} />
            TikTok
          </a>
        </div>
        
        {/* Copyright Protection */}
        <div className="border-t border-gray-800 pt-8">
          <div className="space-y-3">
            <p className="text-gray-500 text-sm font-semibold">
              &copy; 2025 Ocks on the Block LLC. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs leading-relaxed max-w-2xl mx-auto">
              "Ocks on the Block," all related characters, names, marks, logos, designs, 
              and related content are protected by copyright, trademark, and other intellectual 
              property laws. Unauthorized reproduction, distribution, or use is strictly prohibited.
            </p>
            <p className="text-gray-600 text-xs">
              Designed with respect for NYC corner store culture | Made in Brooklyn
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
