import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw } from "lucide-react";

export default function TransformationModule() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [matrixOrder, setMatrixOrder] = useState("TRS");

  const originalVertices = [
    [-50, -50], [50, -50], [50, 50], [-50, 50]
  ];

  const reset = () => {
    setTranslateX(0);
    setTranslateY(0);
    setRotation(0);
    setScaleX(1);
    setScaleY(1);
  };

  const createTranslationMatrix = (tx: number, ty: number): number[][] => [
    [1, 0, tx],
    [0, 1, ty],
    [0, 0, 1]
  ];

  const createRotationMatrix = (angle: number): number[][] => {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [
      [cos, -sin, 0],
      [sin, cos, 0],
      [0, 0, 1]
    ];
  };

  const createScaleMatrix = (sx: number, sy: number): number[][] => [
    [sx, 0, 0],
    [0, sy, 0],
    [0, 0, 1]
  ];

  const multiplyMatrices = (a: number[][], b: number[][]): number[][] => {
    const result: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return result;
  };

  const transformPoint = (point: number[], matrix: number[][]): number[] => {
    const [x, y] = point;
    const newX = matrix[0][0] * x + matrix[0][1] * y + matrix[0][2];
    const newY = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2];
    return [newX, newY];
  };

  const getCombinedMatrix = (): number[][] => {
    const T = createTranslationMatrix(translateX, translateY);
    const R = createRotationMatrix(rotation);
    const S = createScaleMatrix(scaleX, scaleY);

    if (matrixOrder === "TRS") {
      return multiplyMatrices(multiplyMatrices(T, R), S);
    } else if (matrixOrder === "TSR") {
      return multiplyMatrices(multiplyMatrices(T, S), R);
    } else {
      return multiplyMatrices(multiplyMatrices(R, T), S);
    }
  };

  const formatMatrix = (matrix: number[][]): string => {
    return matrix.map(row =>
      row.map(val => val.toFixed(2).padStart(7, ' ')).join(' ')
    ).join('\n');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, 0);
    ctx.moveTo(0, -canvas.height / 2);
    ctx.lineTo(0, canvas.height / 2);
    ctx.stroke();

    ctx.strokeStyle = 'hsl(var(--muted-foreground))';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(originalVertices[0][0], originalVertices[0][1]);
    for (let i = 1; i < originalVertices.length; i++) {
      ctx.lineTo(originalVertices[i][0], originalVertices[i][1]);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    const combinedMatrix = getCombinedMatrix();
    const transformedVertices = originalVertices.map(v => transformPoint(v, combinedMatrix));

    ctx.fillStyle = 'hsl(var(--primary) / 0.3)';
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(transformedVertices[0][0], transformedVertices[0][1]);
    for (let i = 1; i < transformedVertices.length; i++) {
      ctx.lineTo(transformedVertices[i][0], transformedVertices[i][1]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }, [translateX, translateY, rotation, scaleX, scaleY, matrixOrder]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 5;
      if (e.key === 'ArrowLeft') setTranslateX(prev => prev - step);
      if (e.key === 'ArrowRight') setTranslateX(prev => prev + step);
      if (e.key === 'ArrowUp') setTranslateY(prev => prev - step);
      if (e.key === 'ArrowDown') setTranslateY(prev => prev + step);
      if (e.key === '[') setRotation(prev => prev - 5);
      if (e.key === ']') setRotation(prev => prev + 5);
      if (e.shiftKey && e.key === 'ArrowLeft') setScaleX(prev => Math.max(0.1, prev - 0.1));
      if (e.shiftKey && e.key === 'ArrowRight') setScaleX(prev => prev + 0.1);
      if (e.shiftKey && e.key === 'ArrowUp') setScaleY(prev => prev + 0.1);
      if (e.shiftKey && e.key === 'ArrowDown') setScaleY(prev => Math.max(0.1, prev - 0.1));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const T = createTranslationMatrix(translateX, translateY);
  const R = createRotationMatrix(rotation);
  const S = createScaleMatrix(scaleX, scaleY);
  const M = getCombinedMatrix();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Controls</CardTitle>
            <CardDescription>Adjust transformation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Translate X: {translateX}px</Label>
                <Slider
                  value={[translateX]}
                  onValueChange={([val]) => setTranslateX(val)}
                  min={-150}
                  max={150}
                  step={1}
                  data-testid="slider-translate-x"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Translate Y: {translateY}px</Label>
                <Slider
                  value={[translateY]}
                  onValueChange={([val]) => setTranslateY(val)}
                  min={-150}
                  max={150}
                  step={1}
                  data-testid="slider-translate-y"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Rotation: {rotation}°</Label>
              <Slider
                value={[rotation]}
                onValueChange={([val]) => setRotation(val)}
                min={-180}
                max={180}
                step={1}
                data-testid="slider-rotation"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Scale X: {scaleX.toFixed(2)}</Label>
                <Slider
                  value={[scaleX]}
                  onValueChange={([val]) => setScaleX(val)}
                  min={0.1}
                  max={3}
                  step={0.1}
                  data-testid="slider-scale-x"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Scale Y: {scaleY.toFixed(2)}</Label>
                <Slider
                  value={[scaleY]}
                  onValueChange={([val]) => setScaleY(val)}
                  min={0.1}
                  max={3}
                  step={0.1}
                  data-testid="slider-scale-y"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Matrix Order</Label>
              <Select value={matrixOrder} onValueChange={setMatrixOrder}>
                <SelectTrigger data-testid="select-matrix-order">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRS">T · R · S</SelectItem>
                  <SelectItem value="TSR">T · S · R</SelectItem>
                  <SelectItem value="RTS">R · T · S</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={reset} className="w-full" variant="outline" data-testid="button-reset">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Canvas Visualization</CardTitle>
            <CardDescription>Original (dashed) and transformed (filled) square</CardDescription>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              width={600}
              height={500}
              className="w-full border rounded-md bg-background"
              data-testid="canvas-transformation"
            />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Matrices</CardTitle>
            <CardDescription>3×3 transformation matrices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Translation (T)</Label>
              <pre className="text-xs font-mono bg-muted p-3 rounded-md overflow-x-auto" data-testid="matrix-translation">
                {formatMatrix(T)}
              </pre>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Rotation (R)</Label>
              <pre className="text-xs font-mono bg-muted p-3 rounded-md overflow-x-auto" data-testid="matrix-rotation">
                {formatMatrix(R)}
              </pre>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Scale (S)</Label>
              <pre className="text-xs font-mono bg-muted p-3 rounded-md overflow-x-auto" data-testid="matrix-scale">
                {formatMatrix(S)}
              </pre>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Combined (M = {matrixOrder})</Label>
              <pre className="text-xs font-mono bg-muted p-3 rounded-md overflow-x-auto" data-testid="matrix-combined">
                {formatMatrix(M)}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <div>Arrow keys: Translate</div>
            <div>[ / ]: Rotate</div>
            <div>Shift + Arrows: Scale</div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About 2D Transformations</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              2D transformations are fundamental operations in computer graphics that allow you to manipulate objects
              in 2D space. Using 3×3 matrices in homogeneous coordinates, we can represent translation, rotation,
              and scaling transformations, as well as combine them through matrix multiplication.
            </p>
            <p>
              The order of matrix multiplication matters! Try different orders (T·R·S vs R·T·S) to see how the
              final result changes. Generally, transformations are applied right-to-left in the matrix multiplication.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
