import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useEditor } from '../store/EditorContext';
import type { TextLayer, ImageLayer } from '../types';

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;
const DISPLAY_SCALE = 0.35; // Scale for display

export function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { state, actions } = useEditor();
  const [isReady, setIsReady] = useState(false);

  const currentSlide = state.project.slides[state.project.currentSlideIndex];

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: currentSlide.backgroundColor,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;
    setIsReady(true);

    // Handle object selection
    canvas.on('selection:created', (e: any) => {
      if (e.selected && e.selected[0]) {
        const obj = e.selected[0];
        actions.selectLayer(obj.data?.layerId || null);
      }
    });

    canvas.on('selection:updated', (e: any) => {
      if (e.selected && e.selected[0]) {
        const obj = e.selected[0];
        actions.selectLayer(obj.data?.layerId || null);
      }
    });

    canvas.on('selection:cleared', () => {
      actions.selectLayer(null);
    });

    // Handle object modifications
    canvas.on('object:modified', (e: any) => {
      if (e.target && e.target.data?.layerId) {
        const obj = e.target;
        actions.updateLayer(obj.data.layerId, {
          position: { x: obj.left || 0, y: obj.top || 0 },
          size: {
            width: (obj.width || 0) * (obj.scaleX || 1),
            height: (obj.height || 0) * (obj.scaleY || 1),
          },
          rotation: obj.angle || 0,
        });
      }
    });

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

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

  function renderTextLayer(canvas: fabric.Canvas, layer: TextLayer) {
    const text = new fabric.IText(layer.content, {
      left: layer.position.x,
      top: layer.position.y,
      fontSize: layer.fontSize,
      fontFamily: layer.fontFamily,
      fontWeight: layer.fontWeight,
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

  function renderImageLayer(canvas: fabric.Canvas, layer: ImageLayer) {
    (fabric.Image as any).fromURL(
      layer.imageUrl,
      (img: any) => {
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

        img.data = { layerId: layer.id };
        canvas.add(img);
        canvas.renderAll();
      },
      { crossOrigin: 'anonymous' }
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 p-8 overflow-auto">
      <div
        className="bg-white shadow-2xl"
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
