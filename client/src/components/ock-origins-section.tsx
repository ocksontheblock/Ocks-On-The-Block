export default function OckOriginsSection() {
  return (
    <section className="bg-gray-50 py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-anton text-3xl md:text-4xl mb-4 text-gray-900">
            What's an "Ock"?
          </h2>
          <div className="w-16 h-1 bg-ock-orange mx-auto mb-6"></div>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg border-l-4 border-ock-orange">
            <h3 className="font-anton text-lg mb-2 text-gray-900">The Word</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              "Ock" comes from Arabic "أخ" (akh), meaning "brother" — a term of respect.
            </p>
          </div>
          
          <div className="bg-white p-5 rounded-lg border-l-4 border-ock-orange">
            <h3 className="font-anton text-lg mb-2 text-gray-900">Evolution</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Over decades in NYC, "akh" became "ock" — from greeting to identity.
            </p>
          </div>
          
          <div className="bg-ock-orange p-5 rounded-lg text-white">
            <h3 className="font-anton text-lg mb-2">Culture</h3>
            <p className="text-sm leading-relaxed">
              Today it represents respect for immigrants who built NYC's corner stores.
            </p>
          </div>
          
          <div className="bg-gray-900 p-5 rounded-lg text-white">
            <h3 className="font-anton text-lg mb-2 text-ock-orange">Legacy</h3>
            <p className="text-sm leading-relaxed">
              Every neighborhood's Ock — keepers of community, one order at a time.
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-lg text-gray-600 italic max-w-3xl mx-auto" style={{ fontFamily: "'Georgia', serif" }}>
            "From 'akh' to 'ock' — a story of language, culture, and community that makes NYC what it is today."
          </p>
        </div>
      </div>
    </section>
  );
}