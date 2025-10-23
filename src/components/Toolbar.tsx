import { useState } from 'react';
import { useEditor } from '../store/EditorContext';
import { v4 as uuidv4 } from 'uuid';
import type { TextLayer, ImageLayer } from '../types';
import { loadImageFile, downloadJSON, loadJSONFile, exportSlideAsImage } from '../utils/export';
import { getAllTemplates, applyTemplate, saveTemplate } from '../utils/templates';
import {
  FiType,
  FiImage,
  FiDownload,
  FiSave,
  FiFolder,
  FiLayers,
  FiChevronUp,
  FiChevronDown,
  FiArrowUp,
  FiArrowDown,
  FiTrash2,
} from 'react-icons/fi';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './CanvasEditor';

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
    alert('Export all slides: Switch to each slide and export individually. Full automation coming soon!');
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
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={addTextLayer}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
            title="Add Text"
          >
            <FiType size={18} />
            Text
          </button>
          <button
            onClick={addImageLayer}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
            title="Add Image"
          >
            <FiImage size={18} />
            Image
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
            title="Templates"
          >
            <FiLayers size={18} />
            Templates
          </button>
          <button
            onClick={saveAsTemplate}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
            title="Save as Template"
          >
            Save Template
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={actions.undo}
            disabled={state.historyIndex <= 0}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium"
            title="Undo"
          >
            Undo
          </button>
          <button
            onClick={actions.redo}
            disabled={state.historyIndex >= state.history.length - 1}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium"
            title="Redo"
          >
            Redo
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button
            onClick={loadProject}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
            title="Load Project"
          >
            <FiFolder size={18} />
            Load
          </button>
          <button
            onClick={saveProject}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
            title="Save Project"
          >
            <FiSave size={18} />
            Save
          </button>
          <button
            onClick={exportCurrentSlide}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
            title="Export Current Slide"
          >
            <FiDownload size={18} />
            Export Slide
          </button>
          <button
            onClick={exportAllSlides}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium"
            title="Export All Slides"
          >
            <FiDownload size={18} />
            Export All
          </button>
        </div>
      </div>

      {showTemplates && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
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
                className="aspect-[9/16] border-2 border-gray-300 rounded hover:border-blue-500 text-xs p-2 flex items-center justify-center"
                style={{ backgroundColor: template.slide.backgroundColor }}
              >
                <span className="text-gray-500 opacity-75">{template.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedLayer && (
        <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Layer Controls</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => actions.reorderLayer(selectedLayer.id, 'front')}
                className="p-1.5 bg-white hover:bg-gray-100 rounded border border-gray-300"
                title="Bring to Front"
              >
                <FiArrowUp size={16} />
              </button>
              <button
                onClick={() => actions.reorderLayer(selectedLayer.id, 'forward')}
                className="p-1.5 bg-white hover:bg-gray-100 rounded border border-gray-300"
                title="Bring Forward"
              >
                <FiChevronUp size={16} />
              </button>
              <button
                onClick={() => actions.reorderLayer(selectedLayer.id, 'backward')}
                className="p-1.5 bg-white hover:bg-gray-100 rounded border border-gray-300"
                title="Send Backward"
              >
                <FiChevronDown size={16} />
              </button>
              <button
                onClick={() => actions.reorderLayer(selectedLayer.id, 'back')}
                className="p-1.5 bg-white hover:bg-gray-100 rounded border border-gray-300"
                title="Send to Back"
              >
                <FiArrowDown size={16} />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <button
                onClick={() => {
                  if (confirm('Delete this layer?')) {
                    actions.deleteLayer(selectedLayer.id);
                  }
                }}
                className="p-1.5 bg-white hover:bg-red-100 hover:text-red-600 rounded border border-gray-300"
                title="Delete Layer"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
