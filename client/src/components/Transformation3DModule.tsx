import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Box, Edit3, Sliders } from "lucide-react";

export default function Transformation3DModule() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [tz, setTz] = useState(0);
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const [rz, setRz] = useState(0);
  const [sx, setSx] = useState(1);
  const [sy, setSy] = useState(1);
  const [sz, setSz] = useState(1);
  const [inputMode, setInputMode] = useState<"sliders" | "custom">("sliders");

  const [customMatrix, setCustomMatrix] = useState<number[][]>([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]);

  const cubeVertices = [
    [-50, -50, -50], [50, -50, -50], [50, 50, -50], [-50, 50, -50],
    [-50, -50, 50], [50, -50, 50], [50, 50, 50], [-50, 50, 50]
  ];

  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
  ];

  const reset = () => {
    setTx(0); setTy(0); setTz(0);
    setRx(0); setRy(0); setRz(0);
    setSx(1); setSy(1); setSz(1);
    setCustomMatrix([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]);
  };

  const updateCustomMatrix = (row: number, col: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newMatrix = customMatrix.map((r, i) =>
      i === row ? r.map((c, j) => j === col ? numValue : c) : [...r]
    );
    setCustomMatrix(newMatrix);
  };

  const createTranslationMatrix = (x: number, y: number, z: number): number[][] => [
    [1, 0, 0, x],
    [0, 1, 0, y],
    [0, 0, 1, z],
    [0, 0, 0, 1]
  ];

  const createRotationXMatrix = (angle: number): number[][] => {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [
      [1, 0, 0, 0],
      [0, cos, -sin, 0],
      [0, sin, cos, 0],
      [0, 0, 0, 1]
    ];
  };

  const createRotationYMatrix = (angle: number): number[][] => {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [
      [cos, 0, sin, 0],
      [0, 1, 0, 0],
      [-sin, 0, cos, 0],
      [0, 0, 0, 1]
    ];
  };

  const createRotationZMatrix = (angle: number): number[][] => {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [
      [cos, -sin, 0, 0],
      [sin, cos, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
  };

  const createScaleMatrix = (x: number, y: number, z: number): number[][] => [
    [x, 0, 0, 0],
    [0, y, 0, 0],
    [0, 0, z, 0],
    [0, 0, 0, 1]
  ];

  const multiplyMatrices = (a: number[][], b: number[][]): number[][] => {
    const result: number[][] = Array(4).fill(0).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return result;
  };

  const formatMatrix = (matrix: number[][]): string => {
    return matrix.map(row =>
      row.map(val => val.toFixed(2).padStart(6, ' ')).join(' ')
    ).join('\n');
  };

  const getCombinedMatrix = (): number[][] => {
    if (inputMode === "custom") return customMatrix;

    const T = createTranslationMatrix(tx, ty, tz);
    const RX = createRotationXMatrix(rx);
    const RY = createRotationYMatrix(ry);
    const RZ = createRotationZMatrix(rz);
    const S = createScaleMatrix(sx, sy, sz);

    // Apply S then R (XYZ) then T
    const R = multiplyMatrices(multiplyMatrices(RX, RY), RZ);
    return multiplyMatrices(T, multiplyMatrices(R, S));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const combinedMatrix = getCombinedMatrix();

    const transformPoint = (p: number[], matrix: number[][]): number[] => {
      const x = p[0], y = p[1], z = p[2];
      const nx = matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z + matrix[0][3];
      const ny = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z + matrix[1][3];
      const nz = matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z + matrix[2][3];
      return [nx, ny, nz];
    };

    const project = (x: number, y: number, z: number, useTransform = true) => {
      let nx = x, ny = y, nz = z;
      if (useTransform) {
        [nx, ny, nz] = transformPoint([x, y, z], combinedMatrix);
      }
      const perspective = 400 / (400 + nz);
      return [
        width / 2 + nx * perspective,
        height / 2 - ny * perspective
      ];
    };

    // Draw grid lines (XY plane) - STATIC (NOT TRANSFORMED)
    ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = -200; i <= 200; i += 20) {
      const [x1, y1] = project(i, -200, 0, false);
      const [x2, y2] = project(i, 200, 0, false);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      const [x3, y3] = project(-200, i, 0, false);
      const [x4, y4] = project(200, i, 0, false);
      ctx.beginPath(); ctx.moveTo(x3, y3); ctx.lineTo(x4, y4); ctx.stroke();
    }

    // Draw main axes through origin - STATIC
    const drawFullAxis = (start: [number, number, number], end: [number, number, number], color: string, label: string) => {
      const [p1x, p1y] = project(...start, false);
      const [p2x, p2y] = project(...end, false);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = '10px Inter';
      ctx.fillText(label, p2x + 5, p2y + 5);
    };

    drawFullAxis([-200, 0, 0], [200, 0, 0], '#ef4444', 'X'); // X
    drawFullAxis([0, -200, 0], [0, 200, 0], '#22c55e', 'Y'); // Y
    drawFullAxis([0, 0, -200], [0, 0, 200], '#3b82f6', 'Z'); // Z

    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2;
    edges.forEach(([start, end]) => {
      const [x1, y1] = project(...(cubeVertices[start] as [number, number, number]));
      const [x2, y2] = project(...(cubeVertices[end] as [number, number, number]));
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    });

  }, [tx, ty, tz, rx, ry, rz, sx, sy, sz, customMatrix, inputMode]);

  const T = createTranslationMatrix(tx, ty, tz);
  const R = multiplyMatrices(multiplyMatrices(createRotationXMatrix(rx), createRotationYMatrix(ry)), createRotationZMatrix(rz));
  const S = createScaleMatrix(sx, sy, sz);
  const M = getCombinedMatrix();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-3 space-y-3">
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold">Controls</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "sliders" | "custom")}>
              <TabsList className="grid w-full grid-cols-2 h-8 mb-4">
                <TabsTrigger value="sliders" className="text-[10px] gap-1">
                  <Sliders className="w-3 h-3" /> Sliders
                </TabsTrigger>
                <TabsTrigger value="custom" className="text-[10px] gap-1">
                  <Edit3 className="w-3 h-3" /> Custom
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sliders" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Translation (T)</Label>
                  {[
                    { label: 'X', val: tx, set: setTx },
                    { label: 'Y', val: ty, set: setTy },
                    { label: 'Z', val: tz, set: setTz }
                  ].map((item) => (
                    <div key={item.label} className="space-y-0.5">
                      <Label className="text-[9px] uppercase tracking-wider">{item.label}: {item.val}px</Label>
                      <Slider value={[item.val]} onValueChange={([v]) => item.set(v)} min={-150} max={150} step={1} className="py-1" />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Rotation (R)</Label>
                  {[
                    { label: 'X', val: rx, set: setRx },
                    { label: 'Y', val: ry, set: setRy },
                    { label: 'Z', val: rz, set: setRz }
                  ].map((item) => (
                    <div key={item.label} className="space-y-0.5">
                      <Label className="text-[9px] uppercase tracking-wider">{item.label}: {item.val}°</Label>
                      <Slider value={[item.val]} onValueChange={([v]) => item.set(v)} min={-180} max={180} step={1} className="py-1" />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Scale (S)</Label>
                  {[
                    { label: 'X', val: sx, set: setSx },
                    { label: 'Y', val: sy, set: setSy },
                    { label: 'Z', val: sz, set: setSz }
                  ].map((item) => (
                    <div key={item.label} className="space-y-0.5">
                      <Label className="text-[9px] uppercase tracking-wider">{item.label}: {item.val.toFixed(2)}</Label>
                      <Slider value={[item.val]} onValueChange={([v]) => item.set(v)} min={0.1} max={3} step={0.1} className="py-1" />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Custom 4×4 Matrix</Label>
                  <div className="grid gap-1.5">
                    {customMatrix.map((row, i) => (
                      <div key={i} className="grid grid-cols-4 gap-1.5">
                        {row.map((val, j) => (
                          <Input
                            key={`${i}-${j}`}
                            type="number"
                            value={val}
                            onChange={(e) => updateCustomMatrix(i, j, e.target.value)}
                            className="text-center text-[10px] h-7 font-mono p-1"
                            step={0.1}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => reset()} className="w-full h-7 text-[10px]">
                  Identity Matrix
                </Button>
              </TabsContent>
            </Tabs>
            <Button onClick={reset} variant="outline" size="sm" className="w-full h-8 text-xs mt-4">
              <RotateCcw className="w-3 h-3 mr-2" /> Reset All
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-6">
        <Card className="h-full">
          <CardHeader className="py-3">
            <CardTitle className="text-lg">3D Viewport</CardTitle>
            <CardDescription className="text-xs">Wireframe cube visualization</CardDescription>
          </CardHeader>
          <CardContent>
            <canvas ref={canvasRef} width={600} height={500} className="w-full border rounded-md bg-background" />
            <div className="mt-4 flex gap-4 text-[10px] text-muted-foreground justify-center uppercase tracking-widest font-bold">
              <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-[#ef4444]" /> X</div>
              <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-[#22c55e]" /> Y</div>
              <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-[#3b82f6]" /> Z</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-lg">Matrices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inputMode === "sliders" ? (
              <>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Translation (T)</Label>
                  <pre className="text-[9px] font-mono bg-muted p-2 rounded overflow-x-auto leading-tight">{formatMatrix(T)}</pre>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Rotation (R)</Label>
                  <pre className="text-[9px] font-mono bg-muted p-2 rounded overflow-x-auto leading-tight">{formatMatrix(R)}</pre>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Scale (S)</Label>
                  <pre className="text-[9px] font-mono bg-muted p-2 rounded overflow-x-auto leading-tight">{formatMatrix(S)}</pre>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Combined (M)</Label>
                  <pre className="text-[9px] font-mono bg-muted p-2 rounded overflow-x-auto leading-tight">{formatMatrix(M)}</pre>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Custom Matrix (M)</Label>
                <pre className="text-[9px] font-mono bg-muted p-2 rounded overflow-x-auto leading-tight">{formatMatrix(customMatrix)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
