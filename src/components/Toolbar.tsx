import { useState } from 'react';
import { useEditor } from '../store/EditorContext';
import { v4 as uuidv4 } from 'uuid';
import type { TextLayer, ImageLayer } from '../types';
import { loadImageFile, downloadJSON, loadJSONFile, exportSlideAsImage } from '../utils/export';
import { getAllTemplates, applyTemplate, saveTemplate } from '../utils/templates';
import {
  Type,
  Image as ImageIcon,
  Download,
  Save,
  FolderOpen,
  Layers,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Undo2,
  Redo2,
} from 'lucide-react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './CanvasEditor';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Toolbar() {
  const { state, actions } = useEditor();
  const [showTemplates, setShowTemplates] = useState(false);
  const currentSlide = state.project.slides[state.project.currentSlideIndex];
  const selectedLayer = currentSlide.layers.find((l) => l.id === state.selectedLayerId);

  const addTextLayer = () => {
    const newLayer: TextLayer = {
      id: uuidv4(),
      type: 'text',
      content: 'Double click to edit',
      position: { x: CANVAS_WIDTH / 2 - 200, y: CANVAS_HEIGHT / 2 - 50 },
      size: { width: 400, height: 100 },
      rotation: 0,
      opacity: 1,
      zIndex: currentSlide.layers.length,
      fontFamily: 'Arial',
      fontSize: 48,
      fontWeight: 700,
      color: '#000000',
      textAlign: 'center',
      lineHeight: 1.2,
    };
    actions.addLayer(newLayer);
  };

  const addImageLayer = async () => {
    try {
      const imageUrl = await loadImageFile();
      const img = new Image();
      img.onload = () => {
        const maxWidth = CANVAS_WIDTH * 0.6;
        const maxHeight = CANVAS_HEIGHT * 0.6;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        const newLayer: ImageLayer = {
          id: uuidv4(),
          type: 'image',
          imageUrl,
          position: { x: CANVAS_WIDTH / 2 - width / 2, y: CANVAS_HEIGHT / 2 - height / 2 },
          size: { width, height },
          rotation: 0,
          opacity: 1,
          zIndex: currentSlide.layers.length,
        };
        actions.addLayer(newLayer);
      };
      img.src = imageUrl;
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  };

  const saveProject = () => {
    downloadJSON(state.project, `${state.project.name}.json`);
  };

  const loadProject = async () => {
    try {
      const project = await loadJSONFile();
      if (project && project.slides) {
        actions.loadProject(project);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project. Please check the file format.');
    }
  };

  const exportCurrentSlide = async () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      await exportSlideAsImage(canvas, currentSlide, state.project.currentSlideIndex);
    }
  };

  const exportAllSlides = async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      alert('Canvas not found!');
      return;
    }

    const originalSlideIndex = state.project.currentSlideIndex;
    const totalSlides = state.project.slides.length;

    try {
      for (let i = 0; i < totalSlides; i++) {
        // Switch to the slide
        actions.setCurrentSlide(i);

        // Wait for the canvas to update (give it time to render)
        await new Promise(resolve => setTimeout(resolve, 300));

        // Export the slide
        await exportSlideAsImage(canvas, state.project.slides[i], i);
      }

      alert(`Successfully exported ${totalSlides} slides!`);
    } catch (error) {
      console.error('Failed to export all slides:', error);
      alert('Failed to export all slides. Please try again.');
    } finally {
      // Restore the original slide
      actions.setCurrentSlide(originalSlideIndex);
    }
  };

  const saveAsTemplate = () => {
    const name = prompt('Enter template name:');
    if (name) {
      saveTemplate(name, currentSlide);
      alert('Template saved!');
    }
  };

  const templates = getAllTemplates();

  return (
    <div className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <Button onClick={addTextLayer} variant="outline" size="sm" title="Add Text">
            <Type className="h-4 w-4" />
            Text
          </Button>
          <Button onClick={addImageLayer} variant="outline" size="sm" title="Add Image">
            <ImageIcon className="h-4 w-4" />
            Image
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Button
            onClick={() => setShowTemplates(!showTemplates)}
            variant="outline"
            size="sm"
            title="Templates"
          >
            <Layers className="h-4 w-4" />
            Templates
          </Button>
          <Button onClick={saveAsTemplate} variant="outline" size="sm" title="Save as Template">
            Save Template
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={actions.undo}
            disabled={state.historyIndex <= 0}
            variant="outline"
            size="sm"
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
            Undo
          </Button>
          <Button
            onClick={actions.redo}
            disabled={state.historyIndex >= state.history.length - 1}
            variant="outline"
            size="sm"
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
            Redo
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Button onClick={loadProject} variant="outline" size="sm" title="Load Project">
            <FolderOpen className="h-4 w-4" />
            Load
          </Button>
          <Button onClick={saveProject} variant="outline" size="sm" title="Save Project">
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button onClick={exportCurrentSlide} variant="default" size="sm" title="Export Current Slide">
            <Download className="h-4 w-4" />
            Export Slide
          </Button>
          <Button onClick={exportAllSlides} variant="default" size="sm" title="Export All Slides" className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {showTemplates && (
        <div className="border-t border-border p-4 bg-muted/50">
          <h3 className="text-sm font-semibold mb-2">Templates</h3>
          <div className="grid grid-cols-6 gap-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  const slide = applyTemplate(template);
                  actions.addSlide(slide);
                  setShowTemplates(false);
                }}
                className="aspect-[9/16] border-2 border-border rounded hover:border-primary text-xs p-2 flex items-center justify-center transition-colors"
                style={{ backgroundColor: template.slide.backgroundColor }}
              >
                <span className="text-muted-foreground opacity-75">{template.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedLayer && (
        <div className="border-t border-border px-4 py-2 bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Layer Controls</span>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => actions.reorderLayer(selectedLayer.id, 'front')}
                variant="outline"
                size="icon"
                className="h-8 w-8"
                title="Bring to Front"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => actions.reorderLayer(selectedLayer.id, 'forward')}
                variant="outline"
                size="icon"
                className="h-8 w-8"
                title="Bring Forward"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => actions.reorderLayer(selectedLayer.id, 'backward')}
                variant="outline"
                size="icon"
                className="h-8 w-8"
                title="Send Backward"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => actions.reorderLayer(selectedLayer.id, 'back')}
                variant="outline"
                size="icon"
                className="h-8 w-8"
                title="Send to Back"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button
                onClick={() => {
                  if (confirm('Delete this layer?')) {
                    actions.deleteLayer(selectedLayer.id);
                  }
                }}
                variant="outline"
                size="icon"
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                title="Delete Layer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
