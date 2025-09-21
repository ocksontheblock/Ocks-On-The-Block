import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from "stripe";
import { setCorsHeaders, logError, parseJsonBody } from "./_utils";

// Initialize Stripe lazily
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET || 'sk_test_placeholder';
    if (!secretKey || secretKey === 'sk_test_placeholder') {
      console.warn('Using placeholder Stripe key - set STRIPE_SECRET_KEY environment variable for production');
    }
    stripe = new Stripe(secretKey);
  }
  return stripe;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res, 'POST,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await parseJsonBody(req);
    const { amount, currency = 'usd', metadata = {} } = body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        ...metadata,
        source: 'ocks-mystery-boxes'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    });

  } catch (error) {
    logError("Create payment intent error", error);
    res.status(500).json({ error: "Internal server error" });
  }
}