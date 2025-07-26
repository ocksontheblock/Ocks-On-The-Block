export default function MisterHeartiSection() {
  return (
    <section id="mister-hearti" className="bg-gray-50 py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900" 
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
          Featured Ocks
        </h2>
        <img 
          src="mister-hearti.jpg"
          alt="Mister Hearti" 
          className="w-full rounded-2xl shadow-2xl"
        />
        <p className="mt-8 text-lg md:text-xl leading-relaxed text-gray-700" 
           style={{ fontFamily: "'Georgia', serif" }}>
          While the block moves loud, Mister Hearti moves steady — always there, always real. 
          He don't just run the store — he holds the corner with heart.
        </p>
      </div>
    </section>
  );
}