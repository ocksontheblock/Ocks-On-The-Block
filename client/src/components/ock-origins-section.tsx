export default function OckOriginsSection() {
  return (
    <section className="bg-white py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-anton text-4xl md:text-5xl mb-6 text-gray-900">
            What's an "Ock"?
          </h2>
          <div className="w-24 h-1 bg-ock-orange mx-auto mb-8"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-ock-orange">
              <h3 className="font-anton text-xl mb-3 text-gray-900">The Word</h3>
              <p className="text-gray-700 leading-relaxed">
                "Ock" comes from the Arabic word "أخ" (pronounced "akh"), meaning "brother." 
                It's how many Middle Eastern and South Asian bodega owners address their customers 
                — a term of respect and familiarity.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-ock-orange">
              <h3 className="font-anton text-xl mb-3 text-gray-900">The Evolution</h3>
              <p className="text-gray-700 leading-relaxed">
                Over decades in NYC, "akh" became "ock" in local pronunciation. 
                What started as a greeting evolved into slang for the bodega workers themselves 
                — the heart and soul of every corner store.
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-ock-orange to-orange-600 p-6 rounded-lg text-white">
              <h3 className="font-anton text-xl mb-3">NYC Culture</h3>
              <p className="leading-relaxed">
                Today, "ock" represents more than just a word — it's respect for the 
                immigrants who built NYC's corner store culture. From chopped cheese 
                to late-night snacks, they keep the city running 24/7.
              </p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg text-white">
              <h3 className="font-anton text-xl mb-3 text-ock-orange">The Legacy</h3>
              <p className="leading-relaxed">
                Every neighborhood has their Ock — the person who knows your order, 
                your family, your story. They're not just workers, they're the 
                keepers of community, one sandwich at a time.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-xl text-gray-600 italic" style={{ fontFamily: "'Georgia', serif" }}>
            "From 'akh' to 'ock' — a story of language, culture, and community 
            that makes NYC what it is today."
          </p>
        </div>
      </div>
    </section>
  );
}