export default function AboutSection() {
  return (
    <section className="bg-white py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-anton text-4xl md:text-5xl mb-6 text-gray-900">
            About Ocks on the Block
          </h2>
          <div className="w-24 h-1 bg-ock-orange mx-auto mb-8"></div>
        </div>

        {/* Intro Hook */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-6">
            More than collectibles — this is a tribute to the deli workers ("Ocks") 
            who keep NYC fed, connected, and moving.
          </p>
          <p className="text-lg text-gray-600">
            It's about culture, community, and authenticity. It's about respect.
          </p>
        </div>

        {/* Origins Section */}
        <div className="bg-gray-50 py-12 px-8 rounded-lg mb-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="font-anton text-3xl md:text-4xl mb-4 text-gray-900">
                What's an "Ock"?
              </h3>
              <div className="w-16 h-1 bg-ock-orange mx-auto mb-6"></div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-lg border-l-4 border-ock-orange">
                <h4 className="font-anton text-lg mb-2 text-gray-900">The Word</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  "Ock" comes from Arabic "أخ" (akhi), meaning "my brother" — a term of respect.
                </p>
              </div>
              
              <div className="bg-white p-5 rounded-lg border-l-4 border-ock-orange">
                <h4 className="font-anton text-lg mb-2 text-gray-900">Evolution</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Over decades in NYC, "akhi" became "ock" — from greeting to identity.
                </p>
              </div>
              
              <div className="bg-ock-orange p-5 rounded-lg text-white">
                <h4 className="font-anton text-lg mb-2">Culture</h4>
                <p className="text-sm leading-relaxed">
                  Today it represents respect for immigrants who built NYC's corner stores.
                </p>
              </div>
              
              <div className="bg-gray-900 p-5 rounded-lg text-white">
                <h4 className="font-anton text-lg mb-2 text-ock-orange">Legacy</h4>
                <p className="text-sm leading-relaxed">
                  Every neighborhood's Ock — keepers of community, one order at a time.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-lg text-gray-600 italic max-w-3xl mx-auto" style={{ fontFamily: "'Georgia', serif" }}>
                "From 'akhi' to 'ock' — a story of language, culture, and community that makes NYC what it is today."
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h3 className="font-anton text-3xl text-center mb-8 text-gray-900">Timeline of the Culture</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h4 className="font-anton text-xl mb-3 text-ock-orange">1980s</h4>
              <p className="text-gray-700 text-sm">
                Corner delis and bodegas become neighborhood hubs, run by hardworking immigrant families.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h4 className="font-anton text-xl mb-3 text-ock-orange">1990s–2000s</h4>
              <p className="text-gray-700 text-sm">
                The nickname "Ock" spreads through the city's slang and street culture.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h4 className="font-anton text-xl mb-3 text-ock-orange">2010s</h4>
              <p className="text-gray-700 text-sm">
                Ocks and bodega life blow up in music, memes, and streetwear culture.
              </p>
            </div>
            
            <div className="bg-ock-orange p-6 rounded-lg text-center text-white">
              <h4 className="font-anton text-xl mb-3">Today</h4>
              <p className="text-sm">
                Ocks on the Block turns that real energy into collectible figurines, merch, and a living map.
              </p>
            </div>
          </div>
        </div>

        {/* Closing */}
        <div className="text-center bg-gray-900 py-12 px-8 rounded-lg">
          <h3 className="font-anton text-3xl md:text-4xl mb-4 text-white">
            Respect the Ock. Collect the Block.
          </h3>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Every figure represents a real person, a real story, and a real piece of NYC culture 
            that deserves recognition and respect.
          </p>
        </div>
      </div>
    </section>
  );
}