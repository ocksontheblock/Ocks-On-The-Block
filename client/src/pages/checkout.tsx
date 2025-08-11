import { useStripe, Elements, PaymentElement, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';
import { Lock, CreditCard, Smartphone } from 'lucide-react';
import AuthModal from '@/components/auth-modal';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ mysteryBox, user }: { mysteryBox: any; user: any }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [processing, setProcessing] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);

  useEffect(() => {
    if (stripe && mysteryBox) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: mysteryBox.name,
          amount: Math.round(mysteryBox.price * 100),
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr);
        }
      });

      pr.on('paymentmethod', async (ev) => {
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/payment-success`,
          },
        });

        if (error) {
          ev.complete('fail');
          toast({
            title: "Payment Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          ev.complete('success');
        }
      });
    }
  }, [stripe, mysteryBox, elements, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setProcessing(false);
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-ock-orange to-red-500 text-white p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Lock className="w-6 h-6" />
            <h2 className="font-anton text-2xl">Secure Checkout</h2>
          </div>
          <p className="text-orange-100">Your payment information is encrypted and secure</p>
        </div>

        <div className="p-8">
          {/* Customer Info */}
          <div className={`${user ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4 mb-6`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${user ? 'bg-green-500' : 'bg-blue-500'} rounded-full flex items-center justify-center`}>
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <p className={`font-semibold ${user ? 'text-green-800' : 'text-blue-800'}`}>
                  {user ? 'Signed in as' : 'Guest Checkout'}
                </p>
                <p className={`${user ? 'text-green-700' : 'text-blue-700'}`}>
                  {user ? user.email : 'Proceeding as guest customer'}
                </p>
                {!user && (
                  <p className="text-blue-600 text-sm mt-1">
                    No account required, but you can sign in anytime for order tracking
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-anton text-lg text-gray-900 mb-4">Order Summary</h3>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <div>
                <h4 className="font-semibold text-gray-900">{mysteryBox?.name}</h4>
                <p className="text-sm text-gray-600">{mysteryBox?.description}</p>
              </div>
              <span className="font-anton text-xl text-ock-orange">${mysteryBox?.price}</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="font-semibold text-lg">Total:</span>
              <span className="font-anton text-2xl text-ock-orange">${mysteryBox?.price}</span>
            </div>
          </div>

          {/* Apple Pay / Google Pay */}
          {paymentRequest && (
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-700">Express Checkout</span>
              </div>
              <PaymentRequestButtonElement 
                options={{ paymentRequest }}
                className="w-full"
              />
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or pay with card</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-700">Payment Information</span>
            </div>
            
            <PaymentElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#374151',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                  },
                },
              }}
            />
            
            <button 
              type="submit"
              disabled={!stripe || processing}
              className={`w-full py-4 px-8 rounded-xl font-bold text-white transition-all duration-300 ${
                processing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-ock-orange to-red-500 hover:from-red-500 hover:to-ock-orange transform hover:scale-105 shadow-lg'
              }`}
              data-testid="button-complete-payment"
            >
              {processing ? 'Processing Payment...' : `Complete Payment - $${mysteryBox?.price}`}
            </button>
          </form>

          <div className="flex items-center justify-center space-x-4 mt-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Lock className="w-4 h-4" />
              <span>SSL Encrypted</span>
            </div>
            <span>•</span>
            <span>Powered by Stripe</span>
            <span>•</span>
            <span>Money-back guarantee</span>
          </div>

          <button 
            onClick={() => navigate('/buy-ocks')}
            className="w-full mt-6 py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
            data-testid="button-back-to-shop"
          >
            ← Back to Mystery Boxes
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [mysteryBox, setMysteryBox] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get mystery box info from URL params first
    const params = new URLSearchParams(window.location.search);
    const boxId = params.get('box');
    const amount = params.get('amount');
    const name = params.get('name');
    const description = params.get('description');

    if (!boxId || !amount) {
      toast({
        title: "Invalid checkout",
        description: "Missing product information",
        variant: "destructive",
      });
      return;
    }

    setMysteryBox({ id: boxId, price: parseFloat(amount), name: name, description: description });

    // Check if user is logged in
    const storedUser = localStorage.getItem('ocks_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (!isGuestCheckout) {
      setShowAuthModal(true);
      return;
    }
  }, [toast, isGuestCheckout]);

  useEffect(() => {
    // Create PaymentIntent when we have the mystery box and either user or guest checkout
    if (mysteryBox && (user || isGuestCheckout)) {
      apiRequest("POST", "/api/create-payment-intent", { 
        amount: mysteryBox.price,
        currency: 'usd',
        metadata: { 
          boxId: mysteryBox.id, 
          name: mysteryBox.name, 
          userEmail: user?.email || 'guest',
          checkoutType: user ? 'authenticated' : 'guest'
        }
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: "Failed to initialize payment",
            variant: "destructive",
          });
        });
    }
  }, [mysteryBox, user, isGuestCheckout, toast]);

  const handleAuthSuccess = (userData: any) => {
    localStorage.setItem('ocks_user', JSON.stringify(userData));
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleGuestCheckout = () => {
    setIsGuestCheckout(true);
    setShowAuthModal(false);
  };

  if (showAuthModal) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto p-6 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <Lock className="w-16 h-16 text-ock-orange mx-auto mb-6" />
            <h1 className="font-anton text-3xl text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-lg text-gray-600 mb-8">
              Choose how you'd like to complete your secure purchase.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-gradient-to-r from-ock-orange to-red-500 text-white py-4 px-8 rounded-xl font-bold hover:from-red-500 hover:to-ock-orange transition-all duration-300"
                data-testid="button-sign-in"
              >
                Sign In to Your Account
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>
              <button
                onClick={handleGuestCheckout}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 px-8 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                data-testid="button-guest-checkout"
              >
                Continue as Guest
              </button>
              <p className="text-sm text-gray-500 text-center">
                Guest checkout is secure and fast. Create an account later for order tracking.
              </p>
            </div>
          </div>
        </div>
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => window.location.href = '/buy-ocks'}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  if (!clientSecret || !mysteryBox || (!user && !isGuestCheckout)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-ock-orange border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Preparing secure checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm mysteryBox={mysteryBox} user={user} />
      </Elements>
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}