# Ocks on the Block - Project Documentation

## Overview

"Ocks on the Block" is a full-stack web application built as a street culture brand website celebrating NYC corner store culture. The project features a modern React frontend with a Node.js/Express backend, styled with Tailwind CSS and shadcn/ui components. The application showcases "Ocks" (corner store workers) as characters and promotes merchandise related to NYC street culture.

## User Preferences

Preferred communication style: Simple, everyday language.
Design preferences: More fluid, less space, more professional layout.
Tagline placement: "Rep Your Ock. Wear Your Block." moved to Ocky Drip page.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **State Management**: React Query (TanStack Query) for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: REST API with `/api` prefix routing
- **Storage**: In-memory storage implementation with interface for future database integration
- **Development**: Hot module replacement via Vite integration

### Key Design Decisions

**Frontend Choices**:
- Wouter over React Router for lightweight routing needs
- shadcn/ui for consistent, accessible component library
- TanStack Query for efficient server state management and caching
- Custom color scheme with "Ock Orange" (hsl(16, 100%, 50%)) as primary brand color

**Backend Choices**:
- Express with TypeScript for type safety and modern JavaScript features
- Modular storage interface allowing easy transition from in-memory to database
- Vite integration for seamless development experience
- Error handling middleware for consistent API responses

## Key Components

### Frontend Components
- **Navigation**: Hamburger menu with smooth scrolling to sections
- **Hero Section**: Full-screen hero with background image and CTA
- **Featured Ocks**: Character showcase grid with hover effects
- **Drip Section**: Merchandise display with placeholder images
- **Map Section**: NYC boroughs exploration interface
- **Footer**: Contact and social media links

### Backend Structure
- **Routes**: Centralized route registration in `/server/routes.ts`
- **Storage**: Abstract storage interface with in-memory implementation
- **Middleware**: Request logging and error handling
- **Vite Integration**: Development server with HMR support

### Database Schema
The application uses Drizzle ORM with PostgreSQL schema:
- **Users Table**: Basic user management with username/password
- **Database**: Configured for PostgreSQL with Neon Database serverless driver
- **Migrations**: Managed through Drizzle Kit with migrations directory

## Data Flow

1. **Frontend Requests**: Components use TanStack Query for API calls
2. **API Layer**: Express routes handle requests with `/api` prefix
3. **Storage Layer**: Abstract interface allows switching between in-memory and database storage
4. **Response Handling**: Consistent error handling and JSON responses
5. **State Management**: React Query manages caching and synchronization

## External Dependencies

### Production Dependencies
- **Database**: Neon Database serverless PostgreSQL
- **ORM**: Drizzle ORM for type-safe database operations
- **UI**: Radix UI primitives for accessible components
- **Utilities**: date-fns for date manipulation, clsx for conditional classes

### Development Tools
- **TypeScript**: Strict type checking across frontend and backend
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind CSS
- **Replit Integration**: Development environment optimization

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles server code to `dist/index.js`
3. **Production Mode**: Serves static files and API from single Express server

### Environment Configuration
- **Development**: Hot reloading with Vite dev server
- **Production**: Static file serving with Express
- **Database**: Environment variable configuration for DATABASE_URL

### Scripts
- `npm run dev`: Development mode with hot reloading
- `npm run build`: Production build for both frontend and backend
- `npm run start`: Production server startup
- `npm run db:push`: Database schema deployment

The application is designed for easy deployment on platforms like Replit, with built-in support for development banners and runtime error overlays in development mode.