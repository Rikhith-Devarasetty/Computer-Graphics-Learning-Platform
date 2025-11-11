# Computer Graphics Learning Platform 🎨

An interactive educational web application for learning fundamental computer graphics concepts through hands-on visualizations.

## What's Inside?

### 📐 2D Transformations
- Interactive matrix transformations (translate, rotate, scale)
- Real-time 3×3 matrix display
- Keyboard shortcuts for quick experimentation
- Configurable matrix multiplication order

### 📏 Bresenham's Line Algorithm  
- Step-by-step line rasterization visualization
- Integer grid with pixel-by-pixel breakdown
- Animation controls with adjustable speed
- Error term tracking at each step

### 🌈 RGB ↔ HSV Color Explorer
- Bidirectional color space conversion
- Interactive 2D color picker
- WCAG contrast ratio calculator
- Hex color display with copy functionality

## Tech Stack (Simple Version)

**Frontend:**
- React + TypeScript (UI framework)
- HTML5 Canvas (graphics rendering)
- Tailwind CSS (styling)
- shadcn/ui (UI components)

**Backend:**
- Node.js + Express (web server)
- Vite (development & bundling)

**No Database Needed** - Everything runs in your browser!

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

That's it! The application will automatically reload when you make changes.

## Project Structure

```
├── client/src/
│   ├── components/          # UI components
│   │   ├── TransformationModule.tsx
│   │   ├── BresenhamModule.tsx
│   │   └── ColorExplorerModule.tsx
│   ├── pages/
│   │   └── Home.tsx         # Main page with tabs
│   └── App.tsx              # Root component
├── server/                  # Express server
└── shared/                  # Shared types
```

## How It Works

All the magic happens in your browser:
1. You adjust sliders or input values
2. JavaScript performs calculations (matrix math, color conversion, line algorithm)
3. HTML5 Canvas renders the visualization
4. React updates the UI in real-time

**No server calls needed** - everything is client-side for instant feedback!

## Educational Features

✅ **Visual Learning** - See concepts in action, not just formulas  
✅ **Interactive Experimentation** - Change parameters and see immediate results  
✅ **Mathematical Transparency** - View the actual matrices and calculations  
✅ **Step-by-Step Breakdown** - Understand how algorithms work internally  
✅ **Accessibility Testing** - Learn about color contrast standards  

## Browser Support

Works in all modern browsers with HTML5 Canvas support:
- Chrome/Edge
- Firefox  
- Safari

## Documentation

For detailed technical documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md)

## Use Cases

**For Students:**
- Learn computer graphics fundamentals
- Experiment with transformations and algorithms
- Visual understanding of abstract concepts

**For Teachers:**
- Ready-to-use demonstration tool
- No installation required (web-based)
- Source code available for study

## Key Technologies Explained

| Technology | What It Does | Why We Use It |
|------------|--------------|---------------|
| React | Manages UI and state | Makes complex interactions simple |
| TypeScript | Adds type safety to JavaScript | Catches errors early (important for math!) |
| Canvas API | Draws 2D graphics | Native browser support, no libraries needed |
| Tailwind CSS | Utility-first styling | Fast, consistent design system |
| Vite | Build tool | Super fast development experience |

## Performance

- Lightweight bundle (~500KB)
- Instant interactions (all client-side)
- Optimized canvas rendering
- No external API calls

## License

This is an educational project - feel free to use it for learning!

---

**Built with ❤️ for computer graphics education**
