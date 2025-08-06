# Ocks on the Block

Authentic NYC street culture website celebrating corner store characters ("Ocks") with character showcases, merchandise section, and interactive experiences.

## 🚀 Live Demo

- **Production**: [Your Vercel URL will go here]
- **Development**: This Replit environment

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Vercel (Frontend + API)
- **Development**: Replit

## ⚡ Quick Start

### Development (Replit)
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Database
```bash
npm run db:push
```

## 🔄 Deployment Workflow

1. **Development**: Make changes in Replit
2. **Git Sync**: Push to GitHub repository
3. **Auto-Deploy**: Vercel automatically deploys on push to main branch
4. **Live Updates**: Changes appear on production site within minutes

## 📁 Project Structure

```
├── client/          # React frontend
├── server/          # Express.js API
├── shared/          # Shared types/schemas
├── public/          # Static assets
├── dist/            # Production build
└── vercel.json      # Vercel deployment config
```

## 🌟 Features

- Interactive character slideshow with swipe support
- Responsive design optimized for all devices
- NYC corner store culture education section
- Merchandise showcase
- PostgreSQL database integration
- Auto-deployment pipeline

## 🔧 Environment Variables

Required for production:
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to "production"

## 📝 Notes

- Uses Vite for fast development builds
- ESBuild for optimized production bundles
- Drizzle ORM for type-safe database operations
- Automatic hot reloading in development