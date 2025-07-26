export default function DripSection() {
  const merchandise = [
    {
      id: 1,
      alt: "Ocks T-Shirt Mockup",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
    },
    {
      id: 2,
      alt: "Ocks Hoodie Mockup",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
    },
    {
      id: 3,
      alt: "Ocks Cap Mockup",
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
    },
    {
      id: 4,
      alt: "Ocks Accessories Mockup",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
    }
  ];

  return (
    <section className="drip-section bg-gray-900 text-white py-20 px-4 md:px-8" id="drip">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-anton text-4xl md:text-5xl mb-8">
          Ocky Drip
        </h2>
        <p className="text-lg md:text-xl leading-relaxed mb-12">
          Exclusive drops coming soon. From corner tees to bobble-head heat, rep your favorite Ock loud.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {merchandise.map((item) => (
            <div 
              key={item.id}
              className="aspect-square bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
            >
              <img 
                src={item.image}
                alt={item.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
