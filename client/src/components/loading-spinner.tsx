export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Animated ock circle */}
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-ock-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <h2 className="font-anton text-2xl text-gray-900 mb-2">
          Loading the Block...
        </h2>
        <p className="text-gray-600 text-sm">
          Getting your Ocks ready
        </p>
      </div>
    </div>
  );
}