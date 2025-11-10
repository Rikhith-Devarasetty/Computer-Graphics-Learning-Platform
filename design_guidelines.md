# Design Guidelines: Interactive Computer Graphics Learning Platform

## Design Approach
**Selected Approach:** Design System (Material Design inspired) with educational clarity focus
**Justification:** This is a utility-focused, information-dense educational application requiring clear visual hierarchy, strong functional patterns, and accessible learning interfaces. The priority is usability and comprehension over aesthetic experimentation.

## Core Design Principles
1. **Educational Clarity:** Every visual element supports learning
2. **Immediate Feedback:** Visual responses to all user interactions
3. **Information Hierarchy:** Mathematical data, controls, and canvas clearly separated
4. **Scannable Structure:** Students can quickly locate controls and outputs

## Typography
- **Primary Font:** Inter or Roboto (via Google Fonts CDN)
- **Monospace Font:** JetBrains Mono or Roboto Mono (for matrices, coordinates, code)
- **Hierarchy:**
  - Page Title: 2.5rem, semibold
  - Module Titles: 1.75rem, semibold
  - Section Headers: 1.25rem, medium
  - Body Text: 1rem, regular
  - Data/Numbers: 0.875rem, monospace, medium
  - Labels: 0.875rem, medium

## Layout System
**Spacing Units:** Tailwind units of 2, 4, 6, 8, 12, 16 (p-2, m-4, gap-6, h-8, etc.)

**Main Structure:**
- Fixed header with tab navigation (h-16)
- Content area with sidebar controls + main canvas/visualization (split layout)
- Educational explanation panel below or alongside

**Module Layout Pattern:**
- Left sidebar (w-80): Controls, sliders, inputs, buttons
- Center canvas area (flex-1): Primary visualization with border
- Right panel (w-64): Numerical outputs, matrices, tables
- Bottom section (full-width): Explanations and instructions

## Component Library

### Navigation
- **Tab Bar:** Horizontal tabs with underline indicator, fixed at top
- Each tab: "2D Transformations", "Bresenham's Line", "Color Explorer"
- Active state: bold text with accent underline

### Canvas Components
- **Primary Canvas:** Bordered container with grid background where applicable
- Canvas dimensions: Responsive with max-width constraints
- Grid overlays: Subtle lines for coordinate systems
- Transformation overlays: Axis lines, origin markers

### Control Panels
- **Slider Groups:** Label above, value display inline with slider
- Range sliders with visible track, prominent thumb
- Grouped controls with subtle background containers (p-4)
- **Input Fields:** Labeled number inputs for precise values
- **Button Groups:** Horizontal arrangement with equal spacing (gap-2)

### Data Display Components
- **Matrix Display:** 3×3 grid in monospace font, boxed with subtle borders
- Each cell: equal width/height squares (w-16 h-16), centered text
- **Tables:** Striped rows, header row with medium weight
- Column alignment: left for labels, right for numbers
- **Coordinate Display:** Small labeled boxes showing (x, y) pairs

### Buttons & Controls
- **Primary Actions:** "Reset", "Play/Pause", "Step" - solid backgrounds
- **Secondary Actions:** "Random", "Copy" - outline style
- **Icon Integration:** Heroicons for play/pause/step/reset icons
- Button sizing: h-10 for standard, h-12 for primary actions

### Information Panels
- **Explanation Sections:** Max-width prose containers with comfortable line-height
- **Code Snippets:** Monospace in subtle background boxes
- **Tips/Notes:** Border-left accent with icon, padded content

## Interactive States
- **Hover:** Subtle brightness/opacity changes on controls
- **Active/Selected:** Stronger accent, potential glow effect on active canvas elements
- **Disabled:** Reduced opacity (50%) for unavailable controls
- **Focus:** Visible outline for keyboard navigation accessibility

## Module-Specific Design

### 2D Transformations
- Canvas centered with visible axes (X/Y in contrasting treatment)
- Original shape: outline only
- Transformed shape: filled
- Control groups: Translation, Rotation, Scale in separate card containers
- Matrix multiplication order dropdown prominent near matrix display

### Bresenham's Line
- Integer grid overlay with numbered axes
- Current pixel highlight with distinct visual treatment
- Step table: Fixed header, scrollable body if many steps
- Animation controls (play/pause/step) in prominent horizontal group
- Speed slider labeled with "Slow" and "Fast" endpoints

### Color Explorer
- Large color preview square (min-height: 200px) with hex value overlay
- RGB sliders stacked vertically with color-coded tracks (red/green/blue tints)
- HSV sliders stacked with appropriate hue gradient visualization
- 2D hue/saturation picker: interactive square with draggable indicator
- Contrast checker: Pass/fail badges (AA/AAA) with visual indicators
- Action buttons (Copy Hex, Random, Reset) in horizontal group below preview

## Images
**No hero images required** - This is a functional educational tool prioritizing canvas and interaction areas over marketing imagery. All visual content is generated through canvas elements and UI components.

## Accessibility
- High contrast between text and backgrounds
- Keyboard navigation for all controls
- ARIA labels on canvas elements and interactive areas
- Visible focus indicators throughout
- Screen-reader friendly matrix and table markup

## Responsive Behavior
- **Desktop (>1024px):** Full sidebar + canvas + data panel layout
- **Tablet (768-1024px):** Stack data panel below canvas, maintain sidebar
- **Mobile (<768px):** Single column stack: controls, canvas, data output