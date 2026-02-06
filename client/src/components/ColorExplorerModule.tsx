import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, RotateCcw, Shuffle, RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ColorExplorerModule() {
  const { toast } = useToast();
  const pickerRef = useRef<HTMLCanvasElement>(null);
  const hsv3dRef = useRef<HTMLCanvasElement>(null);
  
  const [r, setR] = useState(128);
  const [g, setG] = useState(100);
  const [b, setB] = useState(200);
  
  const [h, setH] = useState(0);
  const [s, setS] = useState(0);
  const [v, setV] = useState(0);
  
  const [updatingFrom, setUpdatingFrom] = useState<'rgb' | 'hsv' | null>(null);
  
  const [rotation3d, setRotation3d] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);

  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = max === 0 ? 0 : delta / max;
    let v = max;

    if (delta !== 0) {
      if (max === r) {
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
      } else if (max === g) {
        h = ((b - r) / delta + 2) / 6;
      } else {
        h = ((r - g) / delta + 4) / 6;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  };

  const hsvToRgb = (h: number, s: number, v: number) => {
    h = h / 360;
    s = s / 100;
    v = v / 100;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    let r = 0, g = 0, b = 0;
    
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  useEffect(() => {
    if (updatingFrom === 'rgb') {
      const hsv = rgbToHsv(r, g, b);
      setH(hsv.h);
      setS(hsv.s);
      setV(hsv.v);
    }
    setUpdatingFrom(null);
  }, [r, g, b]);

  useEffect(() => {
    if (updatingFrom === 'hsv') {
      const rgb = hsvToRgb(h, s, v);
      setR(rgb.r);
      setG(rgb.g);
      setB(rgb.b);
    }
    setUpdatingFrom(null);
  }, [h, s, v]);

  useEffect(() => {
    const canvas = pickerRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const saturation = (x / width) * 100;
        const value = ((height - y) / height) * 100;
        const rgb = hsvToRgb(h, saturation, value);
        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    const currentX = (s / 100) * width;
    const currentY = ((100 - v) / 100) * height;
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
    ctx.stroke();
  }, [h, s, v]);

  useEffect(() => {
    const canvas = hsv3dRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2 + 20;
    const radius = Math.min(width, height) / 3;

    ctx.clearRect(0, 0, width, height);

    const rotRad = (rotation3d * Math.PI) / 180;
    const cosR = Math.cos(rotRad);
    const sinR = Math.sin(rotRad);

    const project3D = (x: number, y: number, z: number): [number, number] => {
      const rotatedX = x * cosR - z * sinR;
      const rotatedZ = x * sinR + z * cosR;
      
      const scale = 0.8;
      const projX = rotatedX * scale;
      const projY = y * scale - rotatedZ * 0.3;
      
      return [centerX + projX, centerY - projY];
    };

    const segments = 24;
    const valueSteps = 5;
    const satSteps = 5;

    for (let vi = 0; vi < valueSteps; vi++) {
      const valLevel = (vi / (valueSteps - 1)) * 100;
      const levelY = (vi / (valueSteps - 1)) * radius * 1.5 - radius * 0.75;
      const levelRadius = radius * (valLevel / 100);

      for (let i = 0; i < segments; i++) {
        const hue1 = (i / segments) * 360;
        const hue2 = ((i + 1) / segments) * 360;
        const angle1 = (i / segments) * Math.PI * 2;
        const angle2 = ((i + 1) / segments) * Math.PI * 2;

        for (let si = 0; si < satSteps; si++) {
          const sat1 = ((si) / satSteps) * 100;
          const sat2 = ((si + 1) / satSteps) * 100;
          const r1 = levelRadius * (sat1 / 100);
          const r2 = levelRadius * (sat2 / 100);

          const x1a = Math.cos(angle1) * r1;
          const z1a = Math.sin(angle1) * r1;
          const x2a = Math.cos(angle2) * r1;
          const z2a = Math.sin(angle2) * r1;
          const x1b = Math.cos(angle1) * r2;
          const z1b = Math.sin(angle1) * r2;
          const x2b = Math.cos(angle2) * r2;
          const z2b = Math.sin(angle2) * r2;

          const avgHue = (hue1 + hue2) / 2;
          const avgSat = (sat1 + sat2) / 2;
          const rgb = hsvToRgb(avgHue, avgSat, valLevel);

          const [px1a, py1a] = project3D(x1a, levelY, z1a);
          const [px2a, py2a] = project3D(x2a, levelY, z2a);
          const [px1b, py1b] = project3D(x1b, levelY, z1b);
          const [px2b, py2b] = project3D(x2b, levelY, z2b);

          ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
          ctx.beginPath();
          ctx.moveTo(px1a, py1a);
          ctx.lineTo(px2a, py2a);
          ctx.lineTo(px2b, py2b);
          ctx.lineTo(px1b, py1b);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    const currentHueRad = (h / 360) * Math.PI * 2;
    const currentValLevel = (v / 100) * radius * 1.5 - radius * 0.75;
    const currentLevelRadius = radius * (v / 100);
    const currentSatRadius = currentLevelRadius * (s / 100);
    const currentX3D = Math.cos(currentHueRad) * currentSatRadius;
    const currentZ3D = Math.sin(currentHueRad) * currentSatRadius;
    const [markerX, markerY] = project3D(currentX3D, currentValLevel, currentZ3D);

    // Draw projection line to the base of the cone (black center)
    const [originX, originY] = project3D(0, -radius * 0.75, 0);
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(markerX, markerY);
    ctx.lineTo(originX, originY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(markerX, markerY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.beginPath();
    ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'hsl(var(--muted-foreground))';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    
    ctx.fillText('Value ↑', centerX, 25);
    ctx.fillText('0%', centerX, height - 8);
    ctx.fillText('100%', centerX, 40);
    
    const hueLabel1 = project3D(radius + 15, 0, 0);
    ctx.fillText('H=0°', hueLabel1[0], hueLabel1[1]);

  }, [h, s, v, r, g, b, rotation3d]);

  useEffect(() => {
    if (!isAutoRotating) return;

    const interval = setInterval(() => {
      setRotation3d(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [isAutoRotating]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = pickerRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newS = Math.round((x / rect.width) * 100);
    const newV = Math.round(((rect.height - y) / rect.height) * 100);

    setUpdatingFrom('hsv');
    setS(Math.max(0, Math.min(100, newS)));
    setV(Math.max(0, Math.min(100, newV)));
  };

  const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  const getRelativeLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const getContrastRatio = (l1: number, l2: number) => {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const colorLuminance = getRelativeLuminance(r, g, b);
  const whiteLuminance = 1;
  const blackLuminance = 0;
  
  const whiteContrast = getContrastRatio(colorLuminance, whiteLuminance);
  const blackContrast = getContrastRatio(colorLuminance, blackLuminance);

  const copyHex = () => {
    navigator.clipboard.writeText(hexColor);
    toast({
      title: "Copied!",
      description: `${hexColor} copied to clipboard`,
    });
  };

  const randomColor = () => {
    const newR = Math.floor(Math.random() * 256);
    const newG = Math.floor(Math.random() * 256);
    const newB = Math.floor(Math.random() * 256);
    setUpdatingFrom('rgb');
    setR(newR);
    setG(newG);
    setB(newB);
  };

  const reset = () => {
    setUpdatingFrom('rgb');
    setR(128);
    setG(100);
    setB(200);
    setRotation3d(0);
    setIsAutoRotating(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">RGB Controls</CardTitle>
            <CardDescription>Red, Green, Blue (0-255)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Red</Label>
                <Input
                  type="number"
                  value={r}
                  onChange={(e) => { setUpdatingFrom('rgb'); setR(Number(e.target.value)); }}
                  className="w-20 h-8 text-xs"
                  min={0}
                  max={255}
                  data-testid="input-red"
                />
              </div>
              <Slider
                value={[r]}
                onValueChange={([val]) => { setUpdatingFrom('rgb'); setR(val); }}
                min={0}
                max={255}
                className="[&_[role=slider]]:bg-red-500"
                data-testid="slider-red"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Green</Label>
                <Input
                  type="number"
                  value={g}
                  onChange={(e) => { setUpdatingFrom('rgb'); setG(Number(e.target.value)); }}
                  className="w-20 h-8 text-xs"
                  min={0}
                  max={255}
                  data-testid="input-green"
                />
              </div>
              <Slider
                value={[g]}
                onValueChange={([val]) => { setUpdatingFrom('rgb'); setG(val); }}
                min={0}
                max={255}
                className="[&_[role=slider]]:bg-green-500"
                data-testid="slider-green"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Blue</Label>
                <Input
                  type="number"
                  value={b}
                  onChange={(e) => { setUpdatingFrom('rgb'); setB(Number(e.target.value)); }}
                  className="w-20 h-8 text-xs"
                  min={0}
                  max={255}
                  data-testid="input-blue"
                />
              </div>
              <Slider
                value={[b]}
                onValueChange={([val]) => { setUpdatingFrom('rgb'); setB(val); }}
                min={0}
                max={255}
                className="[&_[role=slider]]:bg-blue-500"
                data-testid="slider-blue"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">HSV Controls</CardTitle>
            <CardDescription>Hue, Saturation, Value</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Hue</Label>
                <Input
                  type="number"
                  value={h}
                  onChange={(e) => { setUpdatingFrom('hsv'); setH(Number(e.target.value)); }}
                  className="w-20 h-8 text-xs"
                  min={0}
                  max={360}
                  data-testid="input-hue"
                />
              </div>
              <Slider
                value={[h]}
                onValueChange={([val]) => { setUpdatingFrom('hsv'); setH(val); }}
                min={0}
                max={360}
                data-testid="slider-hue"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Saturation</Label>
                <span className="text-xs text-muted-foreground">{s}%</span>
              </div>
              <Slider
                value={[s]}
                onValueChange={([val]) => { setUpdatingFrom('hsv'); setS(val); }}
                min={0}
                max={100}
                data-testid="slider-saturation"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Value</Label>
                <span className="text-xs text-muted-foreground">{v}%</span>
              </div>
              <Slider
                value={[v]}
                onValueChange={([val]) => { setUpdatingFrom('hsv'); setV(val); }}
                min={0}
                max={100}
                data-testid="slider-value"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Color Preview</CardTitle>
            <CardDescription>Current color and hex value</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className="w-full h-48 rounded-md border flex items-center justify-center"
              style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
              data-testid="color-preview"
            >
              <div className="text-center space-y-2">
                <div
                  className="text-3xl font-mono font-bold px-4 py-2 rounded"
                  style={{ color: blackContrast > whiteContrast ? 'black' : 'white' }}
                >
                  {hexColor.toUpperCase()}
                </div>
                <Button
                  onClick={copyHex}
                  variant="outline"
                  size="sm"
                  className="bg-background/80 backdrop-blur"
                  data-testid="button-copy-hex"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Hex
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={randomColor} variant="outline" data-testid="button-random-color">
                <Shuffle className="w-4 h-4 mr-2" />
                Random Color
              </Button>
              <Button onClick={reset} variant="outline" data-testid="button-reset-color">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2D Saturation/Value Picker</CardTitle>
              <CardDescription>Click to select saturation and value</CardDescription>
            </CardHeader>
            <CardContent>
              <canvas
                ref={pickerRef}
                width={300}
                height={200}
                className="w-full border rounded-md cursor-crosshair"
                onClick={handleCanvasClick}
                data-testid="canvas-color-picker"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">3D HSV Cone</CardTitle>
                  <CardDescription>Interactive HSV color space</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  data-testid="button-auto-rotate"
                >
                  <RotateCw className={`w-4 h-4 ${isAutoRotating ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <canvas
                ref={hsv3dRef}
                width={300}
                height={250}
                className="w-full border rounded-md bg-background"
                data-testid="canvas-hsv-3d"
              />
              <div className="space-y-2">
                <Label className="text-xs">Rotation: {rotation3d}°</Label>
                <Slider
                  value={[rotation3d]}
                  onValueChange={([val]) => { setIsAutoRotating(false); setRotation3d(val); }}
                  min={0}
                  max={360}
                  step={1}
                  data-testid="slider-3d-rotation"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">WCAG Contrast Ratio</CardTitle>
            <CardDescription>Accessibility compliance for text colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">vs White Text</Label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{whiteContrast.toFixed(2)}:1</span>
                  <Badge variant={whiteContrast >= 7 ? "default" : whiteContrast >= 4.5 ? "secondary" : "destructive"} data-testid="badge-white-aa">
                    {whiteContrast >= 7 ? "AAA" : whiteContrast >= 4.5 ? "AA" : "Fail"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">vs Black Text</Label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{blackContrast.toFixed(2)}:1</span>
                  <Badge variant={blackContrast >= 7 ? "default" : blackContrast >= 4.5 ? "secondary" : "destructive"} data-testid="badge-black-aa">
                    {blackContrast >= 7 ? "AAA" : blackContrast >= 4.5 ? "AA" : "Fail"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About RGB ↔ HSV Color Models</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              RGB (Red, Green, Blue) and HSV (Hue, Saturation, Value) are two different color models used in computer
              graphics. RGB is an additive color model where colors are created by combining red, green, and blue light
              in various intensities (0-255).
            </p>
            <p>
              The <strong>3D HSV Cone</strong> visualizes the HSV color space in three dimensions: Hue is represented
              around the circular base (0-360°), Saturation extends from the center outward, and Value goes from bottom
              (dark) to top (bright). The white marker shows your current color position in this 3D space. Use the
              rotation slider or auto-rotate button to explore the full color space.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
