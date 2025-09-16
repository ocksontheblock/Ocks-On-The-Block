// Email signup and unsubscribe serverless functions for Vercel

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;

  try {
    if (url.endsWith('/api/email-signup') && method === 'POST') {
      // Email signup logic
      const { email, firstName, lastName } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // TODO: Connect to actual database
      // TODO: Check if email already exists
      // TODO: Store email signup
      // TODO: Send welcome email via Brevo
      
      res.json({ 
        message: 'Email signup endpoint - needs database connection',
        email,
        firstName,
        lastName
      });

    } else if (url.endsWith('/api/unsubscribe') && method === 'POST') {
      // Email unsubscribe logic
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: 'Token required' });
      }

      // TODO: Connect to actual database
      // TODO: Decode token and find email signup
      // TODO: Deactivate subscription
      
      res.json({ 
        message: 'Unsubscribe endpoint - needs database connection',
        token
      });

    } else {
      res.status(404).json({ error: 'Email endpoint not found' });
    }

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}