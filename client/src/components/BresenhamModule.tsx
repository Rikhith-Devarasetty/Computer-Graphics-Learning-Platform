import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward, RotateCcw, Shuffle } from "lucide-react";

interface Step {
  x: number;
  y: number;
  error: number;
  decision: string;
}

export default function BresenhamModule() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [x0, setX0] = useState(5);
  const [y0, setY0] = useState(5);
  const [x1, setX1] = useState(25);
  const [y1, setY1] = useState(15);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);

  const gridSize = 30;
  const cellSize = 20;

  const calculateBresenham = () => {
    const newSteps: Step[] = [];
    let x = x0;
    let y = y0;
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      const decision = err > 0 ? (sx > 0 ? "Move right" : "Move left") : (sy > 0 ? "Move down" : "Move up");
      newSteps.push({ x, y, error: err, decision });

      if (x === x1 && y === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    setSteps(newSteps);
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  useEffect(() => {
    calculateBresenham();
  }, [x0, y0, x1, y1]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, steps.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, gridSize * cellSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(gridSize * cellSize, i * cellSize);
      ctx.stroke();
    }

    ctx.fillStyle = 'hsl(var(--muted-foreground))';
    ctx.font = '10px monospace';
    for (let i = 0; i <= gridSize; i += 5) {
      ctx.fillText(i.toString(), i * cellSize - 5, 10);
      ctx.fillText(i.toString(), 2, i * cellSize + 5);
    }

    for (let i = 0; i <= currentStep && i < steps.length; i++) {
      const step = steps[i];
      const alpha = i === currentStep ? 1 : 0.5;
      ctx.fillStyle = `hsl(var(--primary) / ${alpha})`;
      ctx.fillRect(step.x * cellSize + 2, step.y * cellSize + 2, cellSize - 4, cellSize - 4);

      if (i === currentStep) {
        ctx.strokeStyle = 'hsl(var(--destructive))';
        ctx.lineWidth = 3;
        ctx.strokeRect(step.x * cellSize, step.y * cellSize, cellSize, cellSize);
      }
    }

    ctx.strokeStyle = 'hsl(var(--muted-foreground))';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x0 * cellSize + cellSize / 2, y0 * cellSize + cellSize / 2);
    ctx.lineTo(x1 * cellSize + cellSize / 2, y1 * cellSize + cellSize / 2);
    ctx.stroke();
    ctx.setLineDash([]);

  }, [x0, y0, x1, y1, currentStep, steps]);

  const reset = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  const randomize = () => {
    setX0(Math.floor(Math.random() * 25) + 2);
    setY0(Math.floor(Math.random() * 25) + 2);
    setX1(Math.floor(Math.random() * 25) + 2);
    setY1(Math.floor(Math.random() * 25) + 2);
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const togglePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(-1);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Controls</CardTitle>
            <CardDescription>Set start and end points</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Start X</Label>
                <Input
                  type="number"
                  value={x0}
                  onChange={(e) => setX0(Number(e.target.value))}
                  min={0}
                  max={gridSize - 1}
                  data-testid="input-x0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Start Y</Label>
                <Input
                  type="number"
                  value={y0}
                  onChange={(e) => setY0(Number(e.target.value))}
                  min={0}
                  max={gridSize - 1}
                  data-testid="input-y0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">End X</Label>
                <Input
                  type="number"
                  value={x1}
                  onChange={(e) => setX1(Number(e.target.value))}
                  min={0}
                  max={gridSize - 1}
                  data-testid="input-x1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">End Y</Label>
                <Input
                  type="number"
                  value={y1}
                  onChange={(e) => setY1(Number(e.target.value))}
                  min={0}
                  max={gridSize - 1}
                  data-testid="input-y1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Animation Speed</Label>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Slow</span>
                <Slider
                  value={[1000 - speed]}
                  onValueChange={([val]) => setSpeed(1000 - val)}
                  min={100}
                  max={900}
                  step={100}
                  className="flex-1"
                  data-testid="slider-speed"
                />
                <span>Fast</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={togglePlay} className="flex-1" data-testid="button-play-pause">
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button onClick={stepForward} variant="outline" data-testid="button-step">
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={reset} variant="outline" className="flex-1" data-testid="button-reset-bresenham">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={randomize} variant="outline" className="flex-1" data-testid="button-random">
                <Shuffle className="w-4 h-4 mr-2" />
                Random
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Grid Visualization</CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {steps.length} 
              {currentStep >= 0 && ` - Current pixel highlighted in red`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              width={gridSize * cellSize}
              height={gridSize * cellSize}
              className="w-full border rounded-md bg-background"
              data-testid="canvas-bresenham"
            />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Algorithm Steps</CardTitle>
            <CardDescription>Detailed step information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] overflow-auto">
              {steps.length === 0 ? (
                <p className="text-sm text-muted-foreground">No steps calculated</p>
              ) : (
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md border text-xs font-mono ${
                        index === currentStep
                          ? 'bg-primary/10 border-primary'
                          : index < currentStep
                          ? 'bg-muted/50'
                          : 'bg-background'
                      }`}
                      data-testid={`step-${index}`}
                    >
                      <div className="font-semibold mb-1">Step {index + 1}</div>
                      <div>Pixel: ({step.x}, {step.y})</div>
                      <div>Error: {step.error}</div>
                      <div className="text-muted-foreground text-[10px] mt-1">{step.decision}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About Bresenham's Line Algorithm</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              Bresenham's line algorithm is an efficient method for rasterizing lines on a pixel grid using only
              integer arithmetic. Developed by Jack E. Bresenham in 1962, it determines which points in an n-dimensional
              raster should be selected to form a close approximation to a straight line between two points.
            </p>
            <p>
              The algorithm uses an error term to decide whether to move diagonally or straight at each step,
              ensuring the line stays as close as possible to the ideal mathematical line while only using
              addition, subtraction, and bit shifting operations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
