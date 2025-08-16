import ampedOckPath from "@assets/8DD0FE63-DFAA-44FB-934F-6993CB26A54A_1755271476620.png";

export default function AmpedOckShowcase() {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-anton text-4xl md:text-6xl text-gray-900 mb-4">
            Meet Amped Ock
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The energetic legend who keeps the corner store running with NYC pride and endless energy
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="font-anton text-2xl text-ock-orange mb-4">The Story</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Amped Ock is the heartbeat of his corner store, always ready with a smile and the energy 
                to help every customer. From dawn to dusk, you'll find him restocking shelves, making 
                the perfect sandwich, or sharing stories with the neighborhood.
              </p>
              <p className="text-gray-700 leading-relaxed">
                His signature style represents authentic NYC street culture - no designer logos needed, 
                just real pride in his community and his work.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="font-anton text-2xl text-ock-orange mb-4">His Vibe</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-ock-orange rounded-full"></div>
                  <span>Always positive, never tired</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Knows every regular customer by name</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Coffee connoisseur and sandwich artist</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Authentic NYC corner store culture</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-3xl p-8 shadow-2xl inline-block">
              <img 
                src={ampedOckPath} 
                alt="Amped Ock - NYC Corner Store Legend" 
                className="w-full max-w-md h-auto mx-auto transform hover:scale-105 transition-all duration-500"
              />
              <div className="mt-6 space-y-2">
                <h4 className="font-anton text-xl text-gray-900">Amped Ock Figurine</h4>
                <p className="text-sm text-gray-600">
                  Celebrating authentic NYC corner store culture
                </p>
                <div className="text-xs text-gray-500 italic">
                  * Original NYC street culture design
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <button 
            onClick={() => window.location.href = '/buy-ocks'}
            className="bg-gradient-to-r from-ock-orange to-red-500 text-white py-4 px-8 rounded-2xl font-bold hover:from-red-500 hover:to-ock-orange transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
          >
            Get Your Amped Ock Mystery Box
          </button>
        </div>
      </div>
    </section>
  );
}