# Overview

This is an interactive educational web application called **Computer Graphics Learning Platform** that teaches fundamental computer graphics concepts through hands-on visualizations. It features four core learning modules:

1. **2D Transformations** — Interactive 3×3 matrix transformations using a standard Y-up mathematical convention. Features step history visualization.
2. **3D Transformations** — Wireframe cube manipulation using 4×4 matrices with perspective projection. Includes local vs. global axes visualization and step restoration.
3. **Bresenham's Line Algorithm** — Detailed step-by-step line rasterization on an integer grid with error term tracking.
4. **RGB ↔ HSV Color Explorer** — Bidirectional color space conversion with a 3D HSV cone visualization and WCAG contrast calculator.

All graphics computations happen client-side using the HTML5 Canvas API. The architecture emphasizes mathematical transparency by displaying internal matrices and algorithm states.

# System Architecture

## Frontend Architecture
- **Framework:** React 18 with TypeScript
- **Graphics:** Direct HTML5 Canvas API usage (no external engines like Three.js or WebGL used for core logic)
- **UI Components:** shadcn/ui (Radix UI primitives) + Tailwind CSS
- **Theming:** Full Light/Dark mode support
- **State:** Local React state for module-specific data; TanStack Query for infrastructure

## Key Design Decisions
- **Standard Conventions:** 2D module uses a flipped Y-axis (`ctx.scale(1, -1)`) to match standard mathematical coordinate systems.
- **Visual Feedback:** All modules use consistent color-coding (X=Red, Y=Green, Z=Blue). Dashed lines are used for "previous states" and "local axes" to provide context without clutter.
- **Self-Contained Logic:** Each module encapsulates its own math and rendering logic for easier study.

## Directory Structure
```
client/src/
  components/       # Core Learning Modules
    TransformationModule.tsx    # 2D Logic
    Transformation3DModule.tsx  # 3D Logic
    BresenhamModule.tsx         # Algorithm Logic
    ColorExplorer.tsx           # Color Space Logic
  pages/            # Home.tsx (Tabbed Interface)
server/             # Express server and Vite integration
shared/             # Schema definitions (PostgreSQL/Drizzle scaffolding)
```

# Build & Run
- **Development:** `npm run dev` (Express + Vite HMR)
- **Production:** `npm run build` && `npm start`
