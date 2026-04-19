import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Edit3, Sliders } from "lucide-react";

export default function TransformationModule() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [matrixT, setMatrixT] = useState<number[][]>([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ]);
  const [matrixS, setMatrixS] = useState<number[][]>([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ]);

  const translateX = matrixT[0][2];
  const translateY = -matrixT[1][2];
  const scaleX = matrixS[0][0];
  const scaleY = matrixS[1][1];

  const setTranslateX = (val: number | ((prev: number) => number)) => {
    setMatrixT(prev => {
      const next = typeof val === 'function' ? val(prev[0][2]) : val;
      const newM = [...prev.map(r => [...r])];
      newM[0][2] = next;
      return newM;
    });
  };

  const setTranslateY = (val: number | ((prev: number) => number)) => {
    setMatrixT(prev => {
      const next = typeof val === 'function' ? val(-prev[1][2]) : val;
      const newM = [...prev.map(r => [...r])];
      newM[1][2] = -next;
      return newM;
    });
  };

  const setScaleX = (val: number | ((prev: number) => number)) => {
    setMatrixS(prev => {
      const next = typeof val === 'function' ? val(prev[0][0]) : val;
      const newM = [...prev.map(r => [...r])];
      newM[0][0] = next;
      return newM;
    });
  };

  const setScaleY = (val: number | ((prev: number) => number)) => {
    setMatrixS(prev => {
      const next = typeof val === 'function' ? val(prev[1][1]) : val;
      const newM = [...prev.map(r => [...r])];
      newM[1][1] = next;
      return newM;
    });
  };
  const [matrixOrder, setMatrixOrder] = useState("TRS");
  const [inputMode, setInputMode] = useState<"sliders" | "custom">("sliders");
  const [axisView, setAxisView] = useState<"both" | "x" | "y">("both");

  const [customMatrix, setCustomMatrix] = useState<number[][]>([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ]);

  const originalVertices = [
    [-50, -50], [50, -50], [50, 50], [-50, 50]
  ];

  const clampValue = (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
  };

  const updateCustomMatrix = (row: number, col: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const clampedValue = clampValue(numValue, -10, 10);
    const newMatrix = customMatrix.map((r, i) =>
      i === row ? r.map((c, j) => j === col ? clampedValue : c) : [...r]
    );
    setCustomMatrix(newMatrix);
  };

  const reset = () => {
    setMatrixT([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ]);
    setMatrixS([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ]);
    setRotation(0);
    setCustomMatrix([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ]);
  };

  const createTranslationMatrix = (tx: number, ty: number): number[][] => [
    [1, 0, tx],
    [0, 1, -ty], // Flip Y for internal matrix math to match "Up" convention
    [0, 0, 1]
  ];

  const createRotationMatrix = (angle: number): number[][] => {
    // angle is negated to make positive rotation counter-clockwise when Y is flipped
    const rad = (-angle * Math.PI) / 180;
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
    if (inputMode === "custom") {
      return customMatrix;
    }

    const R = createRotationMatrix(rotation);

    if (matrixOrder === "TRS") {
      return multiplyMatrices(multiplyMatrices(matrixT, R), matrixS);
    } else if (matrixOrder === "TSR") {
      return multiplyMatrices(multiplyMatrices(matrixT, matrixS), R);
    } else {
      return multiplyMatrices(multiplyMatrices(R, matrixT), matrixS);
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
    ctx.scale(1, -1); // Flip Y globally for the "Up" convention

    // Draw static grid lines
    ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Vertical grid lines
    for (let x = -canvas.width / 2; x <= canvas.width / 2; x += 20) {
      ctx.moveTo(x, -canvas.height / 2);
      ctx.lineTo(x, canvas.height / 2);
    }
    // Horizontal grid lines
    for (let y = -canvas.height / 2; y <= canvas.height / 2; y += 20) {
      ctx.moveTo(-canvas.width / 2, y);
      ctx.lineTo(canvas.width / 2, y);
    }
    ctx.stroke();

    const drawArrowhead = (x: number, y: number, angle: number, color: string) => {
      const headLength = 10;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-headLength, headLength / 2);
      ctx.lineTo(-headLength, -headLength / 2);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    // Draw main axes
    ctx.lineWidth = 2;
    // X-axis (Red)
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, 0);
    ctx.stroke();
    drawArrowhead(canvas.width / 2, 0, 0, '#ef4444');

    // Y-axis (Green)
    ctx.strokeStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(0, -canvas.height / 2);
    ctx.lineTo(0, canvas.height / 2);
    ctx.stroke();
    drawArrowhead(0, canvas.height / 2, Math.PI / 2, '#22c55e');

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

    // Draw discrete intermediate snapshots: After translation, After rotation
    if (inputMode === "sliders") {
      const drawSnapshot = (matrix: number[][], dash: number[], colorAlpha: number) => {
        const vertices = originalVertices.map(v => transformPoint(v, matrix));
        ctx.strokeStyle = `hsl(var(--primary) / ${colorAlpha})`;
        ctx.setLineDash(dash);
        ctx.beginPath();
        ctx.moveTo(vertices[0][0], vertices[0][1]);
        for (let i = 1; i < vertices.length; i++) {
          ctx.lineTo(vertices[i][0], vertices[i][1]);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      };

      const T = matrixT;
      const R = createRotationMatrix(rotation);
      const S = matrixS;

      let step1Matrix, step2Matrix;

      if (matrixOrder === "TRS") {
        step1Matrix = T; // Translation
        step2Matrix = multiplyMatrices(T, R); // Translation + Rotation
      } else if (matrixOrder === "TSR") {
        step1Matrix = T; // Translation
        step2Matrix = multiplyMatrices(T, S); // Translation + Scale
      } else { // RTS
        step1Matrix = R; // Rotation
        step2Matrix = multiplyMatrices(R, T); // Rotation + Translation
      }

      const isIdentity = (m: number[][]) =>
        Math.abs(m[0][0] - 1) < 0.001 && Math.abs(m[0][1]) < 0.001 && Math.abs(m[0][2]) < 0.001 &&
        Math.abs(m[1][0]) < 0.001 && Math.abs(m[1][1] - 1) < 0.001 && Math.abs(m[1][2]) < 0.001;

      if (!isIdentity(step1Matrix)) {
        drawSnapshot(step1Matrix, [4, 4], 0.2);
      }

      const combined = getCombinedMatrix();
      const isSameAsComb = (m: number[][]) =>
        Math.abs(m[0][0] - combined[0][0]) < 0.001 && Math.abs(m[0][1] - combined[0][1]) < 0.001 && Math.abs(m[0][2] - combined[0][2]) < 0.001 &&
        Math.abs(m[1][0] - combined[1][0]) < 0.001 && Math.abs(m[1][1] - combined[1][1]) < 0.001 && Math.abs(m[1][2] - combined[1][2]) < 0.001;

      const isSameAsStep1 = (m: number[][]) =>
        Math.abs(m[0][0] - step1Matrix[0][0]) < 0.001 && Math.abs(m[0][1] - step1Matrix[0][1]) < 0.001 && Math.abs(m[0][2] - step1Matrix[0][2]) < 0.001 &&
        Math.abs(m[1][0] - step1Matrix[1][0]) < 0.001 && Math.abs(m[1][1] - step1Matrix[1][1]) < 0.001 && Math.abs(m[1][2] - step1Matrix[1][2]) < 0.001;

      if (!isIdentity(step2Matrix) && !isSameAsStep1(step2Matrix) && !isSameAsComb(step2Matrix)) {
        drawSnapshot(step2Matrix, [2, 2], 0.4);
      }
    }

    const combinedMatrix = getCombinedMatrix();

    // Draw transformed X and Y axes
    const axisLength = 100;
    const xAxisEnd = transformPoint([axisLength, 0], combinedMatrix);
    const yAxisEnd = transformPoint([0, axisLength], combinedMatrix);
    const origin = transformPoint([0, 0], combinedMatrix);

    // X-axis (Red)
    if (axisView === "both" || axisView === "x") {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(origin[0], origin[1]);
      ctx.lineTo(xAxisEnd[0], xAxisEnd[1]);
      ctx.stroke();
    }

    // Y-axis (Green)
    if (axisView === "both" || axisView === "y") {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(origin[0], origin[1]);
      ctx.lineTo(yAxisEnd[0], yAxisEnd[1]);
      ctx.stroke();
    }

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
  }, [matrixT, matrixS, rotation, matrixOrder, customMatrix, inputMode, axisView]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inputMode !== "sliders") return;
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const step = 5;
      if (e.key === 'ArrowLeft' && !e.shiftKey) setTranslateX(prev => prev - step);
      if (e.key === 'ArrowRight' && !e.shiftKey) setTranslateX(prev => prev + step);
      if (e.key === 'ArrowUp' && !e.shiftKey) setTranslateY(prev => prev - step);
      if (e.key === 'ArrowDown' && !e.shiftKey) setTranslateY(prev => prev + step);
      if (e.key === '[' || e.code === 'BracketLeft' || e.key === 'q' || e.key === 'Q') setRotation(prev => prev - 5);
      if (e.key === ']' || e.code === 'BracketRight' || e.key === 'e' || e.key === 'E') setRotation(prev => prev + 5);
      if (e.shiftKey && e.key === 'ArrowLeft') setScaleX(prev => Math.max(0.1, prev - 0.1));
      if (e.shiftKey && e.key === 'ArrowRight') setScaleX(prev => prev + 0.1);
      if (e.shiftKey && e.key === 'ArrowUp') setScaleY(prev => prev + 0.1);
      if (e.shiftKey && e.key === 'ArrowDown') setScaleY(prev => Math.max(0.1, prev - 0.1));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputMode]);

  const T = matrixT;
  const R = createRotationMatrix(rotation);
  const S = matrixS;
  const M = getCombinedMatrix();

  const transformedVertices = originalVertices.map(v => transformPoint(v, M));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Controls</CardTitle>
            <CardDescription>Choose input mode</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "sliders" | "custom")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="sliders" className="gap-2" data-testid="tab-sliders">
                  <Sliders className="w-4 h-4" />
                  Sliders
                </TabsTrigger>
                <TabsTrigger value="custom" className="gap-2" data-testid="tab-custom">
                  <Edit3 className="w-4 h-4" />
                  Custom
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sliders" className="space-y-6 mt-0">
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
              </TabsContent>

              <TabsContent value="custom" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Custom 3×3 Matrix</Label>
                  <p className="text-xs text-muted-foreground">
                    Enter values between -10 and 10
                  </p>
                </div>

                <div className="grid gap-2">
                  {customMatrix.map((row, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2">
                      {row.map((val, j) => (
                        <Input
                          key={`${i}-${j}`}
                          type="number"
                          value={val}
                          onChange={(e) => updateCustomMatrix(i, j, e.target.value)}
                          className="text-center text-sm h-10 font-mono"
                          step={0.1}
                          min={-10}
                          max={10}
                          data-testid={`matrix-input-${i}-${j}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomMatrix([
                      [1, 0, 0],
                      [0, 1, 0],
                      [0, 0, 1]
                    ])}
                    data-testid="button-identity"
                  >
                    Identity
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomMatrix([
                      [1, 0.5, 0],
                      [0, 1, 0],
                      [0, 0, 1]
                    ])}
                    data-testid="button-shear-x"
                  >
                    Shear X
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomMatrix([
                      [1, 0, 0],
                      [0.5, 1, 0],
                      [0, 0, 1]
                    ])}
                    data-testid="button-shear-y"
                  >
                    Shear Y
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomMatrix([
                      [-1, 0, 0],
                      [0, 1, 0],
                      [0, 0, 1]
                    ])}
                    data-testid="button-reflect-x"
                  >
                    Reflect X
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <Button onClick={reset} className="w-full mt-4" variant="outline" data-testid="button-reset">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-6">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Canvas Visualization</CardTitle>
              <CardDescription>Visual representation of the transformation</CardDescription>
            </div>
            <Tabs value={axisView} onValueChange={(v) => setAxisView(v as "both" | "x" | "y")}>
              <TabsList className="grid w-full grid-cols-3 h-8">
                <TabsTrigger value="both" className="text-xs">Both</TabsTrigger>
                <TabsTrigger value="x" className="text-xs">X-Axis</TabsTrigger>
                <TabsTrigger value="y" className="text-xs">Y-Axis</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full border rounded-md bg-background"
              data-testid="canvas-transformation"
            />
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Vertex Coordinates</CardTitle>
            <CardDescription>Original → Transformed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              {originalVertices.map((v, i) => (
                <div key={i} className="p-2 bg-muted rounded text-center">
                  <div className="text-muted-foreground">V{i + 1}</div>
                  <div>({v[0]}, {v[1]})</div>
                  <div className="text-primary">→</div>
                  <div>({transformedVertices[i][0].toFixed(1)}, {transformedVertices[i][1].toFixed(1)})</div>
                </div>
              ))}
            </div>
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
            {inputMode === "sliders" ? (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Translation (T)</Label>
                  <div className="grid gap-2 bg-muted p-3 rounded-md relative" data-testid="matrix-translation">
                    {T.some((row, i) => row.some((v, j) => (j === 2 && i < 2) && (v < -150 || v > 150))) && (
                      <div className="absolute -top-6 right-0 text-[10px] text-red-500 font-medium">
                        Values must be between -150 and 150
                      </div>
                    )}
                    {T.map((row, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2">
                        {row.map((val, j) => {
                          const isEditable = j === 2 && i < 2;
                          const isInvalid = isEditable && (val < -150 || val > 150);
                          return (
                            <Input
                              key={`t-${i}-${j}`}
                              type="number"
                              value={Number.parseFloat(val.toFixed(2))}
                              onChange={(e) => {
                                if (!isEditable) return;
                                const numStr = e.target.value;
                                const numOrigin = numStr === '' ? 0 : parseFloat(numStr);
                                setMatrixT(prev => {
                                  const newT = [...prev.map(r => [...r])];
                                  newT[i][j] = numOrigin || 0;
                                  return newT;
                                });
                              }}
                              onKeyDown={(e) => {
                                if (['e', 'E', '+'].includes(e.key)) e.preventDefault();
                              }}
                              min={-150}
                              max={150}
                              disabled={!isEditable}
                              className={`text-center text-xs h-8 font-mono px-1 ${
                                isInvalid ? 'border-red-500 focus-visible:ring-red-500 text-red-500 ' : ''
                              }${
                                isEditable 
                                  ? 'bg-background' 
                                  : 'bg-muted text-muted-foreground opacity-50'
                              }`}
                              step={5}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Rotation (R)</Label>
                  <pre className="text-xs font-mono bg-muted p-3 rounded-md overflow-x-auto" data-testid="matrix-rotation">
                    {formatMatrix(R)}
                  </pre>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Scale (S)</Label>
                  <div className="grid gap-2 bg-muted p-3 rounded-md relative" data-testid="matrix-scale">
                    {S.some((row, i) => row.some((v, j) => {
                      const isScaleCell = (i === 0 && j === 0) || (i === 1 && j === 1);
                      if (isScaleCell) return v < 0.1 || v > 3;
                      return false;
                    })) && (
                      <div className="absolute -top-6 right-0 text-[10px] text-red-500 font-medium">
                        Scale X/Y must be 0.1 to 3
                      </div>
                    )}
                    {S.map((row, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2">
                        {row.map((val, j) => {
                          const isScaleCell = (i === 0 && j === 0) || (i === 1 && j === 1);
                          const min = 0.1;
                          const max = 3;
                          const isInvalid = isScaleCell && (val < min || val > max);
                          return (
                            <Input
                              key={`s-${i}-${j}`}
                              type="number"
                              value={Number.parseFloat(val.toFixed(2))}
                              onChange={(e) => {
                                if (!isScaleCell) return;
                                const numStr = e.target.value;
                                const numOrigin = numStr === '' ? 0 : parseFloat(numStr);
                                setMatrixS(prev => {
                                  const newS = [...prev.map(r => [...r])];
                                  newS[i][j] = numOrigin || 0;
                                  return newS;
                                });
                              }}
                              onKeyDown={(e) => {
                                if (['e', 'E', '+'].includes(e.key)) e.preventDefault();
                              }}
                              min={min}
                              max={max}
                              disabled={!isScaleCell}
                              className={`text-center text-xs h-8 font-mono px-1 ${
                                isInvalid ? 'border-red-500 focus-visible:ring-red-500 text-red-500 ' : ''
                              }${
                                isScaleCell 
                                  ? 'bg-background' 
                                  : 'bg-muted text-muted-foreground opacity-50'
                              }`}
                              step={0.1}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Combined (M = {matrixOrder})</Label>
                  <pre className="text-xs font-mono bg-muted p-3 rounded-md overflow-x-auto" data-testid="matrix-combined">
                    {formatMatrix(M)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Custom Matrix (M)</Label>
                <pre className="text-xs font-mono bg-muted p-3 rounded-md overflow-x-auto" data-testid="matrix-custom">
                  {formatMatrix(customMatrix)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <div>Arrow keys: Translate</div>
            <div>[ / ] or Q / E: Rotate</div>
            <div>Shift + Arrows: Scale</div>
            <div className="text-xs text-muted-foreground/70 pt-1">(Only in Slider mode)</div>
            <div className="pt-2 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#ef4444]" />
                <span>Transformed X-Axis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#22c55e]" />
                <span>Transformed Y-Axis</span>
              </div>
            </div>
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
              scaling, shearing, and reflection transformations.
            </p>
            <p>
              <strong>Custom Matrix Mode:</strong> Enter any values between -10 and 10 to create custom transformations.
              Try the preset buttons for common operations like shearing (skewing the shape) or reflection (mirroring).
              The matrix multiplication order matters! Try different orders (T·R·S vs R·T·S) in slider mode to see how the
              final result changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
