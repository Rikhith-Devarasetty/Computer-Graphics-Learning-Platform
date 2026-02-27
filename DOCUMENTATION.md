# Technical Documentation

## 2D Transformations
The 2D module implements affine transformations using 3×3 homogeneous matrices.

### Coordinate System
- **Origin:** Center of the canvas.
- **Y-Axis:** Points UP (mathematical convention).
- **Rotation:** Positive values result in counter-clockwise rotation.

### Matrix Operations
Transformations are applied in the order selected by the user (default: TRS - Translation * Rotation * Scale).
```typescript
// Translation Matrix
[1, 0, tx]
[0, 1, ty]
[0, 0,  1]
```

## 3D Transformations
The 3D module uses 4×4 matrices and a simple perspective projection.

### Projection
Uses a basic perspective calculation: `scale = distance / (distance + z)`.
```typescript
const perspective = 400 / (400 + nz);
screenX = centerX + worldX * perspective;
screenY = centerY - worldY * perspective;
```

### Coordinate Systems
- **Global Axes:** Fixed at the origin (Solid lines).
- **Local Axes:** Dashed lines attached to the object, showing its current orientation after rotation.

## Bresenham's Line Algorithm
Implements the integer-only line drawing algorithm.
- **Decision Variable (P):** Tracks the cumulative error to decide whether to increment the secondary axis.
- **Optimization:** Only uses addition and subtraction, avoiding floating-point math.

## Color Explorer
### HSV ↔ RGB Math
- **RGB to HSV:** Calculates Hue based on the maximum color component and Value based on intensity.
- **HSV Cone:** Visualizes the cylindrical nature of HSV projected into a 3D cone where Value is the height and Saturation is the radius.

### Accessibility
- **Contrast Ratio:** Uses the WCAG 2.1 formula: `(L1 + 0.05) / (L2 + 0.05)` where L is relative luminance.
