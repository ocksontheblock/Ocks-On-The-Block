export default function HeroSection() {
  const handleShopClick = () => {
    const element = document.querySelector('#buy');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="hero relative h-screen flex items-center justify-center text-center text-white" id="home">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      <div className="relative z-10 px-4 md:px-8 max-w-4xl mx-auto">
        <h1 className="font-anton text-5xl md:text-7xl lg:text-8xl mb-4 drop-shadow-2xl">
          Ocks on the Block
        </h1>
        <p className="font-anton text-2xl md:text-4xl lg:text-5xl mb-8 drop-shadow-xl">
          Rep Your Ock. Wear Your Block.
        </p>
        <button
          onClick={handleShopClick}
          className="inline-block bg-ock-orange hover:bg-ock-orange/90 text-white font-bold py-4 px-8 rounded-lg text-lg md:text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Shop the Drop
        </button>
      </div>
    </header>
  );
}
