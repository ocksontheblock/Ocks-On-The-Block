export default function FeaturedOcks() {
  const ocks = [
    {
      id: 1,
      name: "Mister Hearti",
      description: "The original. Heart of the block. Gives game, wraps love.",
      image: "mister-hearti.jpg"
    },
    {
      id: 2,
      name: "Young Ock",
      description: "The rookie with the fresh cut. Might burn your sandwich, still your bro.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
    },
    {
      id: 3,
      name: "No Credit Ock",
      description: "Knows your whole family. Still won't let you slide. Zero tabs.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
    },
    {
      id: 4,
      name: "Big Ock",
      description: "Runs the grill, runs the energy. The one all the other Ocks listen to.",
      image: "https://images.unsplash.com/photo-1557862921-37829c790f19?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
    },
    {
      id: 5,
      name: "Amped Ock",
      description: "Loudest in the store. Calls your order before you even open your mouth.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
    }
  ];

  return (
    <section className="featured-ocks bg-gray-100 py-16 px-4 md:px-8" id="buy">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-anton text-4xl md:text-5xl text-center mb-4 text-gray-900">
          Meet the Ocks
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-12">
          {ocks.map((ock) => (
            <div 
              key={ock.id}
              className="ock-card bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 transform"
            >
              <img 
                src={ock.image}
                alt={`${ock.name} Character`}
                className="w-full h-48 object-cover rounded-lg mb-4"
                style={{ 
                  objectPosition: ock.name === "Mister Hearti" ? "center 15%" : "center"
                }}
              />
              <h3 className="font-anton text-xl mb-2 text-gray-900">
                {ock.name}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {ock.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
