// Admin functionality serverless functions for Vercel

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
    if (url.endsWith('/api/admin/submissions/pending') && method === 'GET') {
      // Get pending scavenger hunt submissions for admin review
      
      // TODO: Add admin authentication check
      // TODO: Connect to actual database
      // TODO: Get pending submissions
      
      res.json({ 
        message: 'Admin pending submissions endpoint - needs database connection',
        submissions: []
      });

    } else if (url.includes('/api/admin/submissions/') && url.endsWith('/verify') && method === 'POST') {
      // Verify or reject a scavenger hunt submission
      const submissionId = url.split('/')[4]; // Extract submission ID from URL
      const { approved, points, feedback } = req.body;
      
      if (approved === undefined) {
        return res.status(400).json({ error: 'Approval status required' });
      }

      // TODO: Add admin authentication check
      // TODO: Connect to actual database
      // TODO: Update submission status
      // TODO: Update participant points if approved
      
      res.json({ 
        message: 'Admin verify submission endpoint - needs database connection',
        submissionId,
        approved,
        points,
        feedback
      });

    } else {
      res.status(404).json({ error: 'Admin endpoint not found' });
    }

  } catch (error) {
    console.error('Admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}