export default function MapSection() {
  const boroughs = [
    { name: "Bronx", locations: 23 },
    { name: "Brooklyn", locations: 31 },
    { name: "Queens", locations: 18 },
    { name: "Manhattan", locations: 12 }
  ];

  return (
    <section className="explore bg-white py-20 px-4 md:px-8" id="map">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-anton text-4xl md:text-5xl mb-4 text-gray-900">
          The Ocky Map
        </h2>
        <p className="text-lg md:text-xl text-gray-700 mb-12">
          Real locations. Real Ocks. Find your corner.
        </p>
        
        <div className="map-container max-w-2xl mx-auto">
          <img 
            src="https://images.unsplash.com/photo-1518391846015-55a9cc003b25?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&h=600"
            alt="NYC Boroughs Map"
            className="w-full rounded-xl shadow-2xl hover:shadow-3xl transition-shadow duration-300"
          />
          <p className="map-note text-gray-500 italic mt-4 text-sm md:text-base">
            Coming soon: tap your borough to find the real Ock.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {boroughs.map((borough) => (
            <div 
              key={borough.name}
              className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              <h4 className="font-anton text-lg text-ock-orange mb-2">
                {borough.name}
              </h4>
              <p className="text-sm text-gray-600">
                {borough.locations} Locations
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
