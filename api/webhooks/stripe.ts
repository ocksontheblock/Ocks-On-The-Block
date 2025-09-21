import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from "stripe";

// Utility function for safe error logging
function logError(message: string, error: unknown) {
  console.error({
    level: "error",
    message,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });
}

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

// Note: bodyParser config is not needed for @vercel/node functions
// Raw body is read manually below for Stripe signature verification

// Helper to read raw body
async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    
    req.on('error', (error) => {
      reject(error);
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe signature' });
    }

    let event: Stripe.Event;
    
    try {
      // Verify webhook signature
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_ENDPOINT_SECRET || 'whsec_placeholder';
      if (!endpointSecret || endpointSecret === 'whsec_placeholder') {
        console.warn('Using placeholder webhook secret - set STRIPE_WEBHOOK_SECRET environment variable for production');
        // In development/placeholder mode, skip signature verification
        event = JSON.parse(rawBody.toString()) as Stripe.Event;
      } else {
        event = getStripe().webhooks.constructEvent(rawBody, signature as string, endpointSecret);
      }

      event = getStripe().webhooks.constructEvent(rawBody, signature as string, endpointSecret);
    } catch (err) {
      logError(`Webhook signature verification failed`, err);
      return res.status(400).json({ error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` });
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`Payment ${paymentIntent.id} succeeded!`);
          
          // TODO: Update order status in database
          // TODO: Send confirmation email
          // TODO: Create user mystery box entry
          
          break;
        
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          console.log(`Payment ${failedPayment.id} failed!`);
          
          // TODO: Handle failed payment
          
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      logError(`Error processing webhook ${event.type}`, error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }

  } catch (error) {
    logError("Stripe webhook error", error);
    res.status(500).json({ error: "Internal server error" });
  }
}