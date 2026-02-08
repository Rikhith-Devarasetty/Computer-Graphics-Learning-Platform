import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransformationModule from "@/components/TransformationModule";
import Transformation3DModule from "@/components/Transformation3DModule";
import BresenhamModule from "@/components/BresenhamModule";
import ColorExplorerModule from "@/components/ColorExplorerModule";
import { Grid3x3, TrendingUp, Palette, Box } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("transformations");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-semibold text-foreground">
            Computer Graphics Learning Platform
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Interactive visualizations for fundamental computer graphics concepts
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8" data-testid="tabs-navigation">
            <TabsTrigger value="transformations" className="gap-2" data-testid="tab-transformations">
              <Grid3x3 className="w-4 h-4" />
              <span>2D Transformations</span>
            </TabsTrigger>
            <TabsTrigger value="transformations3d" className="gap-2" data-testid="tab-transformations3d">
              <Box className="w-4 h-4" />
              <span>3D Transformations</span>
            </TabsTrigger>
            <TabsTrigger value="bresenham" className="gap-2" data-testid="tab-bresenham">
              <TrendingUp className="w-4 h-4" />
              <span>Bresenham's Line</span>
            </TabsTrigger>
            <TabsTrigger value="color" className="gap-2" data-testid="tab-color">
              <Palette className="w-4 h-4" />
              <span>Color Explorer</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transformations" className="mt-0">
            <TransformationModule />
          </TabsContent>

          <TabsContent value="transformations3d" className="mt-0">
            <Transformation3DModule />
          </TabsContent>

          <TabsContent value="bresenham" className="mt-0">
            <BresenhamModule />
          </TabsContent>

          <TabsContent value="color" className="mt-0">
            <ColorExplorerModule />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
