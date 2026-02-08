# Overview

This is an interactive educational web application called **Computer Graphics Learning Platform** that teaches fundamental computer graphics concepts through hands-on visualizations. It features four learning modules:

1. **2D Transformations** — Interactive matrix transformations (translate, rotate, scale) with real-time 3×3 matrix display
2. **3D Transformations** — 3D cube manipulation with translate, rotate, and scale controls
3. **Bresenham's Line Algorithm** — Step-by-step line rasterization visualization with animation controls
4. **RGB ↔ HSV Color Explorer** — Bidirectional color space conversion with interactive color picker and WCAG contrast calculator

All graphics computations happen client-side using HTML5 Canvas. The backend is minimal and primarily serves the frontend assets. No database is actively used for application logic — the Drizzle/PostgreSQL setup exists as scaffolding but the app runs entirely in the browser.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5 with HMR support
- **Routing:** Wouter (lightweight alternative to React Router) — single page app with `/` route serving the Home page with tabbed modules
- **Styling:** Tailwind CSS with CSS variables for theming (light/dark mode support via class-based toggling)
- **UI Components:** shadcn/ui (New York style) built on Radix UI primitives — all components live in `client/src/components/ui/`
- **Fonts:** Inter (body) and JetBrains Mono (monospace for matrices/data) loaded via Google Fonts
- **Icons:** Lucide React
- **State Management:** Local React state (useState/useEffect) — no global state management needed since modules are self-contained
- **Server State:** TanStack Query is configured but minimally used since the app is mostly client-side

## Directory Structure
```
client/               # Frontend application
  src/
    components/       # Module components (TransformationModule, BresenhamModule, etc.)
      ui/             # shadcn/ui component library
      examples/       # Example wrappers for components
    pages/            # Route pages (Home.tsx, not-found.tsx)
    hooks/            # Custom hooks (use-toast, use-mobile)
    lib/              # Utilities (queryClient, cn helper)
server/               # Backend (Express)
  index.ts            # Server entry point
  routes.ts           # API route registration (currently empty)
  storage.ts          # In-memory storage with user CRUD interface
  vite.ts             # Vite dev server middleware integration
shared/               # Shared types/schemas between client and server
  schema.ts           # Drizzle schema (users table) + Zod validation
```

## Backend Architecture
- **Runtime:** Node.js 20 with Express 4
- **TypeScript:** Compiled with tsx in development, esbuild for production builds
- **Dev Server:** Vite middleware integrated into Express for HMR during development
- **Production:** Vite builds static assets to `dist/public`, Express serves them
- **Storage:** In-memory storage class (`MemStorage`) implementing an `IStorage` interface — designed to be swappable with a database-backed implementation
- **Database Schema:** Drizzle ORM with PostgreSQL dialect is configured (`shared/schema.ts` defines a `users` table) but not actively used by the application. The Neon serverless PostgreSQL driver (`@neondatabase/serverless`) is included as a dependency.

## Key Design Decisions
- **Client-side rendering for all graphics:** All visualization logic uses HTML5 Canvas API directly in React components via refs — no WebGL or third-party graphics libraries
- **Self-contained modules:** Each learning module is an independent React component with its own state, canvas, and controls
- **Tabbed navigation:** All modules accessible from a single page via Radix UI Tabs
- **Path aliases:** `@/` maps to `client/src/`, `@shared/` maps to `shared/`, `@assets/` maps to `attached_assets/`

## Build & Run
- **Development:** `npm run dev` — runs tsx to start the Express server with Vite middleware
- **Production Build:** `npm run build` — Vite builds frontend, esbuild bundles server
- **Production Start:** `npm start` — runs the bundled server from `dist/`
- **Database Push:** `npm run db:push` — pushes Drizzle schema to PostgreSQL (requires `DATABASE_URL`)

# External Dependencies

- **PostgreSQL (via Neon):** Drizzle ORM is configured with `@neondatabase/serverless` driver. A `DATABASE_URL` environment variable is required if using database features. Currently only a `users` table is defined. The database is not required for the core learning platform functionality.
- **Google Fonts CDN:** Inter and JetBrains Mono fonts loaded externally
- **Replit Plugins:** `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, and `@replit/vite-plugin-dev-banner` are used in development when running on Replit
- **No other external APIs or services** — all graphics computations are client-side