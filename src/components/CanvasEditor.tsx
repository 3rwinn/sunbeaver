import { useEffect, useRef, useState } from 'react';
import { Canvas, IText, FabricImage } from 'fabric';
import { useEditor } from '../store/EditorContext';
import type { TextLayer, ImageLayer } from '../types';

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;
const DISPLAY_SCALE = 0.35; // Scale for display

export function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const { state, actions } = useEditor();
  const [isReady, setIsReady] = useState(false);

  const currentSlide = state.project.slides[state.project.currentSlideIndex];

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: currentSlide.backgroundColor,
    });

    fabricCanvasRef.current = canvas;
    setIsReady(true);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
      setIsReady(false);
    };
  }, [currentSlide.backgroundColor]);

  // Set up event handlers - these need to update when actions change
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Handle object selection
    const handleSelectionCreated = (e: any) => {
      if (e.selected && e.selected[0]) {
        const obj = e.selected[0];
        actions.selectLayer((obj as any).data?.layerId || null);
      }
    };

    const handleSelectionUpdated = (e: any) => {
      if (e.selected && e.selected[0]) {
        const obj = e.selected[0];
        actions.selectLayer((obj as any).data?.layerId || null);
      }
    };

    const handleSelectionCleared = () => {
      actions.selectLayer(null);
    };

    // Handle object modifications
    const handleObjectModified = (e: any) => {
      if (e.target && (e.target as any).data?.layerId) {
        const obj = e.target;
        actions.updateLayer((obj as any).data.layerId, {
          position: { x: obj.left || 0, y: obj.top || 0 },
          size: {
            width: (obj.width || 0) * (obj.scaleX || 1),
            height: (obj.height || 0) * (obj.scaleY || 1),
          },
          rotation: obj.angle || 0,
        });
      }
    };

    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionUpdated);
    canvas.on('selection:cleared', handleSelectionCleared);
    canvas.on('object:modified', handleObjectModified);

    return () => {
      canvas.off('selection:created', handleSelectionCreated);
      canvas.off('selection:updated', handleSelectionUpdated);
      canvas.off('selection:cleared', handleSelectionCleared);
      canvas.off('object:modified', handleObjectModified);
    };
  }, [actions]);

  // Update canvas background when slide background changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.backgroundColor = currentSlide.backgroundColor;
      fabricCanvasRef.current.renderAll();
    }
  }, [currentSlide.backgroundColor]);

  // Render layers on canvas
  useEffect(() => {
    if (!fabricCanvasRef.current || !isReady) return;

    const canvas = fabricCanvasRef.current;
    canvas.clear();
    canvas.backgroundColor = currentSlide.backgroundColor;

    // Sort layers by zIndex
    const sortedLayers = [...currentSlide.layers].sort((a, b) => a.zIndex - b.zIndex);

    sortedLayers.forEach((layer) => {
      if (layer.type === 'text') {
        renderTextLayer(canvas, layer as TextLayer);
      } else if (layer.type === 'image') {
        renderImageLayer(canvas, layer as ImageLayer);
      }
    });

    canvas.renderAll();

    // Select the currently selected layer
    if (state.selectedLayerId) {
      const obj = canvas.getObjects().find((o: any) => o.data?.layerId === state.selectedLayerId);
      if (obj) {
        canvas.setActiveObject(obj);
        canvas.renderAll();
      }
    }
  }, [currentSlide, isReady, state.selectedLayerId]);

  function renderTextLayer(canvas: Canvas, layer: TextLayer) {
    const text = new IText(layer.content, {
      left: layer.position.x,
      top: layer.position.y,
      fontSize: layer.fontSize,
      fontFamily: layer.fontFamily,
      fontWeight: layer.fontWeight as any,
      fill: layer.color,
      textAlign: layer.textAlign,
      angle: layer.rotation,
      opacity: layer.opacity,
      width: layer.size.width,
      selectable: true,
      hasControls: true,
      hasBorders: true,
    });

    (text as any).data = { layerId: layer.id };
    canvas.add(text);

    // Handle text changes
    text.on('changed', () => {
      actions.updateLayer(layer.id, {
        content: text.text || '',
      });
    });
  }

  function renderImageLayer(canvas: Canvas, layer: ImageLayer) {
    FabricImage.fromURL(layer.imageUrl, { crossOrigin: 'anonymous' })
      .then((img) => {
        img.set({
          left: layer.position.x,
          top: layer.position.y,
          angle: layer.rotation,
          opacity: layer.opacity,
          scaleX: layer.size.width / (img.width || 1),
          scaleY: layer.size.height / (img.height || 1),
          selectable: true,
          hasControls: true,
          hasBorders: true,
        });

        (img as any).data = { layerId: layer.id };
        canvas.add(img);
        canvas.renderAll();
      })
      .catch((error) => {
        console.error('Failed to load image:', error);
      });
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-muted p-8 overflow-auto">
      <div
        className="bg-card shadow-2xl rounded-lg overflow-hidden"
        style={{
          width: CANVAS_WIDTH * DISPLAY_SCALE,
          height: CANVAS_HEIGHT * DISPLAY_SCALE,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    </div>
  );
}

export { CANVAS_WIDTH, CANVAS_HEIGHT };
