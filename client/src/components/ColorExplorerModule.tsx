import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, RotateCcw, Shuffle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ColorExplorerModule() {
  const { toast } = useToast();
  const pickerRef = useRef<HTMLCanvasElement>(null);
  
  const [r, setR] = useState(128);
  const [g, setG] = useState(100);
  const [b, setB] = useState(200);
  
  const [h, setH] = useState(0);
  const [s, setS] = useState(0);
  const [v, setV] = useState(0);
  
  const [updatingFrom, setUpdatingFrom] = useState<'rgb' | 'hsv' | null>(null);

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
              className="w-full h-64 rounded-md border flex items-center justify-center"
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

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">2D Hue/Saturation Picker</CardTitle>
            <CardDescription>Click to select saturation and value</CardDescription>
          </CardHeader>
          <CardContent>
            <canvas
              ref={pickerRef}
              width={400}
              height={300}
              className="w-full border rounded-md cursor-crosshair"
              onClick={handleCanvasClick}
              data-testid="canvas-color-picker"
            />
          </CardContent>
        </Card>

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
              HSV represents colors using Hue (0-360°, the color type), Saturation (0-100%, color intensity), and
              Value (0-100%, brightness). HSV is often more intuitive for artists and designers as it separates color
              information from brightness. The conversion between these models uses mathematical formulas that preserve
              the visual appearance of colors.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
