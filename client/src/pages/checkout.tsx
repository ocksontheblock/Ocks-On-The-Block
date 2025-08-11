import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ mysteryBox }: { mysteryBox: any }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [processing, setProcessing] = useState(false);

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
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="font-anton text-2xl text-ock-orange mb-6">Complete Your Order</h2>
        
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-anton text-lg text-gray-900">{mysteryBox?.name}</h3>
              <p className="text-sm text-gray-600">{mysteryBox?.description}</p>
            </div>
            <div className="text-right">
              <span className="font-anton text-2xl text-ock-orange">${mysteryBox?.price}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <PaymentElement />
          <button 
            disabled={!stripe || processing}
            className={`w-full mt-6 py-4 px-8 rounded-xl font-bold text-white transition-all duration-300 ${
              processing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-ock-orange hover:bg-red-500 transform hover:scale-105 shadow-lg'
            }`}
          >
            {processing ? 'Processing...' : `Pay $${mysteryBox?.price}`}
          </button>
        </form>

        <button 
          onClick={() => navigate('/buy-ocks')}
          className="w-full mt-4 py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
        >
          Back to Mystery Boxes
        </button>
      </div>
    </div>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [mysteryBox, setMysteryBox] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get mystery box info from URL params
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

    setMysteryBox({ id: boxId, price: amount, name: name, description: description });

    // Create PaymentIntent
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: parseFloat(amount),
      currency: 'usd',
      metadata: { boxId, name }
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
  }, [toast]);

  if (!clientSecret || !mysteryBox) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-ock-orange border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm mysteryBox={mysteryBox} />
      </Elements>
    </div>
  );
}