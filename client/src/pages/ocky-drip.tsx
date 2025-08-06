import DripSection from "@/components/drip-section";
import HamburgerMenu from "@/components/hamburger-menu";
import Footer from "@/components/footer";

export default function OckyDrip() {
  return (
    <div className="min-h-screen bg-white">
      <HamburgerMenu />
      <div className="pt-16">
        {/* Header Section */}
        <section className="bg-white py-8 px-4 md:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-anton text-4xl md:text-6xl mb-4 text-gray-900">
              Ocky Drip
            </h1>
            <p className="font-anton text-xl md:text-2xl text-ock-orange mb-4">
              Rep Your Ock. Wear Your Block.
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Authentic NYC street culture merchandise that celebrates corner store legends.
            </p>
          </div>
        </section>
        <DripSection />
      </div>
      <Footer />
    </div>
  );
}