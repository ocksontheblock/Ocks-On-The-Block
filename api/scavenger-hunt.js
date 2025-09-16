// Scavenger hunt serverless functions for Vercel

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
    if (url.endsWith('/api/scavenger-hunt/join') && method === 'POST') {
      // Join scavenger hunt
      const { email, userId } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // TODO: Connect to actual database
      // TODO: Check if user already joined
      // TODO: Add participant to scavenger hunt
      // TODO: Send welcome email via Brevo
      
      res.json({ 
        message: 'Scavenger hunt join endpoint - needs database connection',
        email,
        userId
      });

    } else if (url.endsWith('/api/scavenger-hunt/leaderboard') && method === 'GET') {
      // Get leaderboard
      
      // TODO: Connect to actual database
      // TODO: Get top participants with points
      
      res.json({ 
        message: 'Leaderboard endpoint - needs database connection',
        leaderboard: []
      });

    } else if (url.endsWith('/api/scavenger-hunt/submit') && method === 'POST') {
      // Submit scavenger hunt entry
      const { userId, location, photoUrl, notes } = req.body;
      
      if (!userId || !location || !photoUrl) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // TODO: Connect to actual database
      // TODO: Save submission
      // TODO: Calculate points
      
      res.json({ 
        message: 'Scavenger hunt submit endpoint - needs database connection',
        userId,
        location,
        photoUrl
      });

    } else if (url.includes('/api/scavenger-hunt/progress/') && method === 'GET') {
      // Get user progress
      const userId = url.split('/').pop();
      
      // TODO: Connect to actual database
      // TODO: Get user's submissions and points
      
      res.json({ 
        message: 'Progress endpoint - needs database connection',
        userId,
        progress: {}
      });

    } else if (url.endsWith('/api/scavenger-hunt/prizes') && method === 'GET') {
      // Get available prizes
      
      // TODO: Connect to actual database
      
      res.json({ 
        message: 'Prizes endpoint - needs database connection',
        prizes: []
      });

    } else {
      res.status(404).json({ error: 'Scavenger hunt endpoint not found' });
    }

  } catch (error) {
    console.error('Scavenger hunt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}