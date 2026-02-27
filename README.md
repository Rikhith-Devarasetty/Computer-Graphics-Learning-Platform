# Computer Graphics Learning Platform 🎨

An interactive educational web application for learning fundamental computer graphics concepts through hands-on visualizations.

## What's Inside?

### 📐 2D Transformations
- **Standard Mathematical Convention:** Uses Y-up coordinate system for intuitive learning.
- **Interactive Matrix Transformations:** Translate, rotate (counter-clockwise), and scale in real-time.
- **Visual History:** Dashed outlines show previous transformation states (up to 5 steps) to track changes.
- **Axes Visualization:** Clear Red (X) and Green (Y) axes with arrowheads.
- **Real-time 3×3 Matrix:** View individual and combined transformation matrices.
- **Keyboard Shortcuts:** Quick experimentation using arrow keys and brackets.

### 📦 3D Transformations
- **Interactive Cube Manipulation:** 3D wireframe cube with perspective projection.
- **Local & Global Axes:** Shows both fixed global axes and dashed local axes that move with the object.
- **Step Restoration:** Visualizes the previous transformation state as a dashed cube.
- **Custom 4×4 Matrix:** Support for manual matrix entry for advanced users.
- **Matrices Display:** Real-time breakdown of Translation, Rotation, and Scaling matrices.

### 📏 Bresenham's Line Algorithm  
- **Step-by-Step Visualization:** Watch the line rasterization process pixel-by-pixel.
- **Integer Grid:** Detailed breakdown showing exactly which pixels are colored.
- **Animation Controls:** Play, pause, and adjust speed for better understanding.
- **Error Term Tracking:** Real-time display of the decision parameter (P) at each step.

### 🌈 Color Explorer (RGB ↔ HSV)
- **Bidirectional Conversion:** Seamlessly convert between RGB and HSV color spaces.
- **3D HSV Cone:** Interactive 3D visualization of the HSV color space.
- **Contrast Calculator:** Built-in WCAG contrast ratio checker for accessibility testing.
- **Interactive Pickers:** 2D sliders and hex input for precise color selection.

## Tech Stack

**Frontend:**
- **React 18 + TypeScript:** Robust UI development.
- **HTML5 Canvas:** High-performance 2D/3D graphics rendering without external libraries.
- **Tailwind CSS + shadcn/ui:** Modern, responsive design with dark mode support.
- **Wouter:** Lightweight routing.

**Backend:**
- **Node.js + Express:** Minimal server for asset delivery.
- **Vite:** Lightning-fast development and optimized production builds.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   ```
   http://localhost:5000
   ```

## Educational Value
This platform is designed to bridge the gap between abstract mathematical formulas and visual results. By seeing the matrices update as they manipulate objects, students can build a mental model of how linear algebra powers computer graphics.

---

**Built for computer graphics education**
