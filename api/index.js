// Vercel serverless function handler
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url } = req;
  
  // Handle different API routes
  if (url === '/api/mystery-boxes' && req.method === 'GET') {
    res.json({
      mysteryBoxes: [
        {
          id: 1,
          name: "Ocky Drop: Classic",
          description: "The essential starter pack. Includes one authentic Ock figure, sticker pack, and corner store trading card.",
          price: "29.00",
          tier: 1,
          image: "/mystery-box-classic.svg",
          inStock: true,
          created_at: "2025-08-10T06:54:58.990Z"
        },
        {
          id: 2,
          name: "Ocky Drop: Heat",
          description: "Level up your collection. Premium Ock figure, exclusive gear, stickers, and limited edition accessories.",
          price: "49.00",
          tier: 2,
          image: "/mystery-box-heat.svg",
          inStock: true,
          created_at: "2025-08-10T06:54:58.990Z"
        },
        {
          id: 3,
          name: "Ocky Drop: Lock",
          description: "For serious collectors. Rare Ock variant, premium gear set, art print, and exclusive collectibles.",
          price: "89.00",
          tier: 3,
          image: "/mystery-box-lock.svg",
          inStock: true,
          created_at: "2025-08-10T06:54:58.990Z"
        },
        {
          id: 4,
          name: "Ocky Drop: Crown",
          description: "The ultimate experience. Ultra-rare golden Ock, complete gear collection, signed art, and VIP perks.",
          price: "149.00",
          tier: 4,
          image: "/mystery-box-crown.svg",
          inStock: true,
          created_at: "2025-08-10T06:54:58.990Z"
        }
      ]
    });
  } else if (url === '/api/health' && req.method === 'GET') {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  } else {
    res.status(404).json({ error: 'API endpoint not found', url });
  }
}