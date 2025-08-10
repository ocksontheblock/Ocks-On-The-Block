import MysteryBoxSection from "@/components/mystery-box-section";
import HamburgerMenu from "@/components/hamburger-menu";
import Footer from "@/components/footer";

export default function BuyOcks() {
  return (
    <div className="min-h-screen bg-white">
      <HamburgerMenu />
      <div className="pt-16">
        {/* Header Section */}
        <section className="bg-white py-12 px-4 md:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-anton text-4xl md:text-6xl mb-6 text-gray-900">
              Buy Your Ock
            </h1>
            <p className="text-xl md:text-2xl text-ock-orange mb-4 font-semibold">
              Not just a figure — a piece of the block.
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Each mystery box contains an authentic Ock figure representing real NYC corner store culture. 
              Choose your tier and discover which legend you'll add to your collection.
            </p>
          </div>
        </section>
        <MysteryBoxSection />
      </div>
      <Footer />
    </div>
  );
}