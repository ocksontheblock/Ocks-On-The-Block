import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function PaymentSuccess() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Redirect to home after 5 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="font-anton text-4xl text-gray-900 mb-6">Payment Successful!</h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Thank you for your purchase! Your mystery box is being prepared and you'll receive 
            a confirmation email shortly with tracking information.
          </p>
          
          <div className="bg-ock-orange/10 rounded-2xl p-6 mb-8">
            <h3 className="font-anton text-lg text-ock-orange mb-3">What happens next?</h3>
            <ul className="text-left text-gray-700 space-y-2">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-ock-orange rounded-full"></div>
                <span>You'll receive a confirmation email within 5 minutes</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-ock-orange rounded-full"></div>
                <span>Your mystery box ships within 2-3 business days</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-ock-orange rounded-full"></div>
                <span>Track your package with the provided tracking number</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/')}
              className="bg-ock-orange text-white py-3 px-8 rounded-xl font-bold hover:bg-red-500 transition-all duration-300"
            >
              Back to Home
            </button>
            <button 
              onClick={() => navigate('/buy-ocks')}
              className="bg-white text-ock-orange py-3 px-8 rounded-xl font-bold border-2 border-ock-orange hover:bg-ock-orange hover:text-white transition-all duration-300"
            >
              Shop More Boxes
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            Redirecting to homepage in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}