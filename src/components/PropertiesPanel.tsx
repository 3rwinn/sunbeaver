import { useEditor } from '../store/EditorContext';
import type { TextLayer, ImageLayer } from '../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PropertiesPanel() {
  const { state, actions } = useEditor();
  const currentSlide = state.project.slides[state.project.currentSlideIndex];
  const selectedLayer = currentSlide.layers.find((l) => l.id === state.selectedLayerId);

  const updateCurrentSlide = (updates: any) => {
    actions.updateSlide(state.project.currentSlideIndex, updates);
  };

  if (!selectedLayer) {
    return (
      <div className="w-72 bg-card border-l border-border p-4">
        <h2 className="text-sm font-semibold mb-4">Properties</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slideName">Slide Name</Label>
            <Input
              id="slideName"
              type="text"
              value={currentSlide.name}
              onChange={(e) => updateCurrentSlide({ name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bgColor">Background Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={currentSlide.backgroundColor}
                onChange={(e) => updateCurrentSlide({ backgroundColor: e.target.value })}
                className="w-12 h-9 border border-input rounded-md cursor-pointer"
              />
              <Input
                id="bgColor"
                type="text"
                value={currentSlide.backgroundColor}
                onChange={(e) => updateCurrentSlide({ backgroundColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">Select a layer to edit its properties</p>
        </div>
      </div>
    );
  }

  const updateLayer = (updates: any) => {
    actions.updateLayer(selectedLayer.id, updates);
  };

  return (
    <div className="w-72 bg-card border-l border-border p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold mb-4">Properties</h2>

      <Tabs defaultValue="style" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="transform">Transform</TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Layer Type</Label>
            <div className="px-3 py-2 text-sm bg-muted rounded-md capitalize">
              {selectedLayer.type}
            </div>
          </div>

          {selectedLayer.type === 'text' && (
            <TextLayerProperties layer={selectedLayer as TextLayer} updateLayer={updateLayer} />
          )}

          {selectedLayer.type === 'image' && (
            <ImageLayerProperties layer={selectedLayer as ImageLayer} updateLayer={updateLayer} />
          )}
        </TabsContent>

        <TabsContent value="transform" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="posX">Position X</Label>
            <Input
              id="posX"
              type="number"
              value={Math.round(selectedLayer.position.x)}
              onChange={(e) => updateLayer({ position: { ...selectedLayer.position, x: Number(e.target.value) } })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="posY">Position Y</Label>
            <Input
              id="posY"
              type="number"
              value={Math.round(selectedLayer.position.y)}
              onChange={(e) => updateLayer({ position: { ...selectedLayer.position, y: Number(e.target.value) } })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              type="number"
              value={Math.round(selectedLayer.size.width)}
              onChange={(e) => updateLayer({ size: { ...selectedLayer.size, width: Number(e.target.value) } })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="number"
              value={Math.round(selectedLayer.size.height)}
              onChange={(e) => updateLayer({ size: { ...selectedLayer.size, height: Number(e.target.value) } })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rotation">Rotation ({Math.round(selectedLayer.rotation)}°)</Label>
            <Input
              id="rotation"
              type="number"
              value={Math.round(selectedLayer.rotation)}
              onChange={(e) => updateLayer({ rotation: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="opacity">Opacity ({Math.round(selectedLayer.opacity * 100)}%)</Label>
            <Slider
              id="opacity"
              min={0}
              max={1}
              step={0.01}
              value={[selectedLayer.opacity]}
              onValueChange={([value]) => updateLayer({ opacity: value })}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TextLayerProperties({ layer, updateLayer }: { layer: TextLayer; updateLayer: (updates: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="textContent">Text Content</Label>
        <textarea
          id="textContent"
          value={layer.content}
          onChange={(e) => updateLayer({ content: e.target.value })}
          className="w-full min-h-[80px] px-3 py-2 text-sm border border-input rounded-md bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fontFamily">Font Family</Label>
        <Select value={layer.fontFamily} onValueChange={(value) => updateLayer({ fontFamily: value })}>
          <SelectTrigger id="fontFamily">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Helvetica">Helvetica</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Verdana">Verdana</SelectItem>
            <SelectItem value="Impact">Impact</SelectItem>
            <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fontSize">Font Size ({layer.fontSize}px)</Label>
        <Slider
          id="fontSize"
          min={8}
          max={200}
          step={1}
          value={[layer.fontSize]}
          onValueChange={([value]) => updateLayer({ fontSize: value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fontWeight">Font Weight</Label>
        <Select value={layer.fontWeight.toString()} onValueChange={(value) => updateLayer({ fontWeight: Number(value) })}>
          <SelectTrigger id="fontWeight">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="300">Light (300)</SelectItem>
            <SelectItem value="400">Normal (400)</SelectItem>
            <SelectItem value="600">Semi-Bold (600)</SelectItem>
            <SelectItem value="700">Bold (700)</SelectItem>
            <SelectItem value="900">Black (900)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="textColor">Text Color</Label>
        <div className="flex gap-2">
          <input
            type="color"
            value={layer.color}
            onChange={(e) => updateLayer({ color: e.target.value })}
            className="w-12 h-9 border border-input rounded-md cursor-pointer"
          />
          <Input
            id="textColor"
            type="text"
            value={layer.color}
            onChange={(e) => updateLayer({ color: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="textAlign">Text Align</Label>
        <Select value={layer.textAlign} onValueChange={(value: any) => updateLayer({ textAlign: value })}>
          <SelectTrigger id="textAlign">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="lineHeight">Line Height ({layer.lineHeight.toFixed(1)})</Label>
        <Slider
          id="lineHeight"
          min={0.5}
          max={3}
          step={0.1}
          value={[layer.lineHeight]}
          onValueChange={([value]) => updateLayer({ lineHeight: value })}
        />
      </div>
    </div>
  );
}

function ImageLayerProperties({ layer, updateLayer }: { layer: ImageLayer; updateLayer: (updates: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          type="text"
          value={layer.imageUrl}
          onChange={(e) => updateLayer({ imageUrl: e.target.value })}
          placeholder="Image URL or data URL"
        />
      </div>
      <div className="aspect-square w-full bg-muted rounded-md overflow-hidden">
        <img src={layer.imageUrl} alt="Preview" className="w-full h-full object-contain" />
      </div>
    </div>
  );
}
