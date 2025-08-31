const mysteryBoxes = [
  {
    id: 1,
    name: "Worker Box",
    subtitle: "The Block Starter",
    description: "Affordable entry — get in the game and start stacking Ocks. Every Worker Box is a step toward the $10K.",
    price: 29,
    odds: [
      { rarity: "Worker (Common)", percentage: "70%" },
      { rarity: "Earner (Rare)", percentage: "20%" },
      { rarity: "Boss (Elite)", percentage: "9%" },
      { rarity: "Don (Legendary)", percentage: "1%" }
    ],
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
    gradient: "from-gray-600 to-gray-800",
    highlight: null
  },
  {
    id: 2,
    name: "Earner Box",
    subtitle: "Best Hustle for Your Dollar",
    description: "Built for grinders leveling up. Better odds, bigger pulls — and every hit brings you closer to the bag.",
    price: 49,
    odds: [
      { rarity: "Worker", percentage: "50%" },
      { rarity: "Earner", percentage: "30%" },
      { rarity: "Boss", percentage: "15%" },
      { rarity: "Don", percentage: "5%" }
    ],
    image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
    gradient: "from-orange-500 to-red-600",
    highlight: "best-value"
  },
  {
    id: 3,
    name: "Boss Box",
    subtitle: "For the Streets, By the Kingpins",
    description: "Premium odds, powerful pulls. Collect like a kingpin and close in on that $10K.",
    price: 89,
    odds: [
      { rarity: "Worker", percentage: "30%" },
      { rarity: "Earner", percentage: "30%" },
      { rarity: "Boss", percentage: "30%" },
      { rarity: "Don", percentage: "10%" }
    ],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
    gradient: "from-blue-500 to-purple-600",
    highlight: null
  },
  {
    id: 4,
    name: "Don Box",
    subtitle: "Only the Chosen (Limited)",
    description: "No Workers here — just pure power. This is the Legendary Edition. Limited drop, heavy odds, and your best shot at the crown.",
    price: 149,
    odds: [
      { rarity: "Earner", percentage: "10%" },
      { rarity: "Boss", percentage: "30%" },
      { rarity: "Don", percentage: "60%" }
    ],
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
    gradient: "from-yellow-400 to-orange-500",
    highlight: "limited"
  }
];

export default function MysteryBoxSection() {
  return (
    <section className="bg-gray-50 py-16 px-4 md:px-8" id="buy-ocks">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-anton text-4xl md:text-5xl mb-6 text-gray-900">
            Buy the Ock
          </h2>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Step onto the corner with your shot at rare Ocks, legendary pulls, and a $10,000 cash prize. 
            Every Mystery Box is a chance to score heat for your collection — and every pull brings you closer to the crown.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mysteryBoxes.map((box) => (
            <div 
              key={box.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 relative ${
                box.highlight === 'best-value' ? 'ring-4 ring-green-500 transform scale-105' : 
                box.highlight === 'limited' ? 'ring-4 ring-yellow-500 transform scale-105' : ''
              }`}
            >
              {/* Highlight badges */}
              {box.highlight === 'best-value' && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                  BEST VALUE
                </div>
              )}
              {box.highlight === 'limited' && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold z-10">
                  LIMITED
                </div>
              )}
              
              <div className={`h-48 bg-gradient-to-br ${box.gradient} p-6 flex items-center justify-center`}>
                <img 
                  src={box.image}
                  alt={box.name}
                  className="w-24 h-24 object-cover rounded-lg shadow-lg"
                />
              </div>
              
              <div className="p-6">
                <div className="mb-3">
                  <h3 className="font-anton text-lg text-gray-900 mb-1">
                    {box.name} – ${box.price}
                  </h3>
                  <p className="text-ock-orange font-semibold text-sm">
                    {box.subtitle}
                  </p>
                </div>
                
                {/* Odds breakdown */}
                <div className="mb-4">
                  <ul className="text-xs text-gray-600 space-y-1">
                    {box.odds.map((odd, index) => (
                      <li key={index} className="flex justify-between">
                        <span>• {odd.percentage} {odd.rarity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  💡 {box.description}
                </p>
                
                <div className="flex justify-center">
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
                    className="w-full bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-ock-orange hover:text-black transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-black"
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
          <p className="text-gray-500 text-xs max-w-2xl mx-auto leading-relaxed">
            All Mystery Box contents are random. All sales are final. Participation in the Ocky Scavenger Hunt is open to all customers. 
            First verified completion wins the $10,000 reward.
          </p>
        </div>
      </div>
    </section>
  );
}