import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RotateCcw, Box } from "lucide-react";

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
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const project = (x: number, y: number, z: number) => {
      // Apply Scale
      let x1 = x * sx;
      let y1 = y * sy;
      let z1 = z * sz;

      // Apply Rotation X
      const radX = (rx * Math.PI) / 180;
      let y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
      let z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);
      y1 = y2; z1 = z2;

      // Apply Rotation Y
      const radY = (ry * Math.PI) / 180;
      let x2 = x1 * Math.cos(radY) + z1 * Math.sin(radY);
      let z3 = -x1 * Math.sin(radY) + z1 * Math.cos(radY);
      x1 = x2; z1 = z3;

      // Apply Rotation Z
      const radZ = (rz * Math.PI) / 180;
      let x3 = x1 * Math.cos(radZ) - y1 * Math.sin(radZ);
      let y3 = x1 * Math.sin(radZ) + y1 * Math.cos(radZ);
      x1 = x3; y1 = y3;

      // Apply Translation
      x1 += tx;
      y1 += ty;
      z1 += tz;

      // Simple perspective projection
      const perspective = 400 / (400 + z1);
      return [
        width / 2 + x1 * perspective,
        height / 2 - y1 * perspective
      ];
    };

    // Draw grid lines (XY plane) - STATIC (NOT TRANSFORMED)
    ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.1)';
    ctx.lineWidth = 0.5;
    
    // Project function that ignores TRS for the static grid
    const projectStatic = (x: number, y: number, z: number) => {
      const perspective = 400 / (400 + z);
      return [
        width / 2 + x * perspective,
        height / 2 - y * perspective
      ];
    };

    for (let i = -200; i <= 200; i += 20) {
      // Vertical lines
      const [x1, y1] = projectStatic(i, -200, 0);
      const [x2, y2] = projectStatic(i, 200, 0);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      
      // Horizontal lines
      const [x3, y3] = projectStatic(-200, i, 0);
      const [x4, y4] = projectStatic(200, i, 0);
      ctx.beginPath(); ctx.moveTo(x3, y3); ctx.lineTo(x4, y4); ctx.stroke();
    }

    // Draw main axes through origin - STATIC
    const drawFullAxis = (start: [number, number, number], end: [number, number, number], color: string, label: string) => {
      const [p1x, p1y] = projectStatic(...start);
      const [p2x, p2y] = projectStatic(...end);
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.stroke();

      // Add label
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
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Draw axes
    // Removed old axis drawing logic
  }, [tx, ty, tz, rx, ry, rz, sx, sy, sz]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-3 space-y-3">
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold">Translation (T)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3">
            {[
              { label: 'X', val: tx, set: setTx },
              { label: 'Y', val: ty, set: setTy },
              { label: 'Z', val: tz, set: setTz }
            ].map((item) => (
              <div key={item.label} className="space-y-0.5">
                <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">{item.label}: {item.val}px</Label>
                <Slider value={[item.val]} onValueChange={([v]) => item.set(v)} min={-150} max={150} step={1} className="py-1" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold">Rotation (R)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3">
            {[
              { label: 'X', val: rx, set: setRx },
              { label: 'Y', val: ry, set: setRy },
              { label: 'Z', val: rz, set: setRz }
            ].map((item) => (
              <div key={item.label} className="space-y-0.5">
                <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">{item.label}: {item.val}°</Label>
                <Slider value={[item.val]} onValueChange={([v]) => item.set(v)} min={-180} max={180} step={1} className="py-1" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold">Scale (S)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3">
            {[
              { label: 'X', val: sx, set: setSx },
              { label: 'Y', val: sy, set: setSy },
              { label: 'Z', val: sz, set: setSz }
            ].map((item) => (
              <div key={item.label} className="space-y-0.5">
                <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">{item.label}: {item.val.toFixed(2)}</Label>
                <Slider value={[item.val]} onValueChange={([v]) => item.set(v)} min={0.1} max={3} step={0.1} className="py-1" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Button onClick={reset} variant="outline" size="sm" className="w-full h-8 text-xs">
          <RotateCcw className="w-3 h-3 mr-2" /> Reset All
        </Button>
      </div>
      <div className="lg:col-span-9">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">3D Viewport</CardTitle>
            <CardDescription>3D wireframe cube with T, R, S applied independently</CardDescription>
          </CardHeader>
          <CardContent>
            <canvas ref={canvasRef} width={600} height={500} className="w-full border rounded-md bg-background" />
            <div className="mt-4 flex gap-4 text-xs text-muted-foreground justify-center">
              <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-[#ef4444]" /> X-Axis</div>
              <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-[#22c55e]" /> Y-Axis</div>
              <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-[#3b82f6]" /> Z-Axis</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
