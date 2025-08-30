const mysteryBoxes = [
  {
    id: 1,
    name: "Starter Pack",
    description: "Perfect for new collectors. Contains 1-2 Common Ocks with basic gear. Great entry point to start your block rep journey.",
    price: 29,
    tier: 1,
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
    gradient: "from-gray-600 to-gray-800"
  },
  {
    id: 2,
    name: "Heat Drop",
    description: "Elevated chances for rare finds. Contains 2-3 figurines with guaranteed Rare+ Ock. Better odds, hotter pulls from the block.",
    price: 49,
    tier: 2,
    image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
    gradient: "from-orange-500 to-red-600"
  },
  {
    id: 3,
    name: "Elite Collection",
    description: "Premium experience guaranteed. Contains 3-4 figurines including guaranteed Elite Ock with designer gear and golden accents.",
    price: 89,
    tier: 3,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
    gradient: "from-blue-500 to-purple-600"
  },
  {
    id: 4,
    name: "Legendary Crown",
    description: "The ultimate collector's dream. Contains 4-5 figurines with guaranteed Legendary Ock featuring luxury suit and platinum-crystal base.",
    price: 149,
    tier: 4,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
    gradient: "from-yellow-400 to-orange-500"
  }
];

export default function MysteryBoxSection() {
  return (
    <section className="bg-gray-50 py-16 px-4 md:px-8" id="buy-ocks">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-anton text-4xl md:text-5xl mb-6 text-gray-900">
            Buy Your Ock
          </h2>
          <p className="text-xl md:text-2xl text-ock-orange mb-4 font-semibold">
            Not just a figure — a piece of the block.
          </p>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Step into the world of NYC's corner store legends. Each mystery box contains hand-crafted figurines 
            representing the realest Ocks across all five boroughs. From the bodega warriors of Washington Heights 
            to the corner store kings of Bed-Stuy, these aren't just collectibles – they're pieces of NYC culture.
          </p>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Collect your crew, find them in real life, and compete for the ultimate prize: 
            <span className="text-ock-orange font-bold"> $10,000 cash</span> in our citywide scavenger hunt. 
            The streets are calling – answer with your collection.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mysteryBoxes.map((box) => (
            <div 
              key={box.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`h-48 bg-gradient-to-br ${box.gradient} p-6 flex items-center justify-center`}>
                <img 
                  src={box.image}
                  alt={box.name}
                  className="w-24 h-24 object-cover rounded-lg shadow-lg"
                />
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-anton text-lg text-gray-900">
                    {box.name}
                  </h3>
                  <span className="bg-ock-orange text-white px-2 py-1 rounded text-sm font-bold">
                    Tier {box.tier}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {box.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">
                    ${box.price}
                  </span>
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams({
                        box: box.id.toString(),
                        amount: box.price.toString(),
                        name: box.name,
                        description: box.description
                      });
                      window.location.href = `/cart?${params.toString()}`;
                    }}
                    className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-ock-orange hover:text-black transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-black"
                    data-testid={`button-buy-${box.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            All figures are carefully crafted to represent authentic NYC corner store culture. 
            Each purchase supports the recognition and celebration of real Ocks across the five boroughs.
          </p>
        </div>
      </div>
    </section>
  );
}