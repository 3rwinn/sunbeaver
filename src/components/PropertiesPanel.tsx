import { useEditor } from '../store/EditorContext';
import type { TextLayer, ImageLayer } from '../types';

export function PropertiesPanel() {
  const { state, actions } = useEditor();
  const currentSlide = state.project.slides[state.project.currentSlideIndex];
  const selectedLayer = currentSlide.layers.find((l) => l.id === state.selectedLayerId);

  const updateCurrentSlide = (updates: any) => {
    actions.updateSlide(state.project.currentSlideIndex, updates);
  };

  if (!selectedLayer) {
    return (
      <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Properties</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Slide Name</label>
            <input
              type="text"
              value={currentSlide.name}
              onChange={(e) => updateCurrentSlide({ name: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={currentSlide.backgroundColor}
                onChange={(e) => updateCurrentSlide({ backgroundColor: e.target.value })}
                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={currentSlide.backgroundColor}
                onChange={(e) => updateCurrentSlide({ backgroundColor: e.target.value })}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">Select a layer to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  const updateLayer = (updates: any) => {
    actions.updateLayer(selectedLayer.id, updates);
  };

  return (
    <div className="w-64 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Properties</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Layer Type</label>
          <div className="px-2 py-1 text-sm bg-gray-100 rounded capitalize">
            {selectedLayer.type}
          </div>
        </div>

        {selectedLayer.type === 'text' && (
          <TextLayerProperties layer={selectedLayer as TextLayer} updateLayer={updateLayer} />
        )}

        {selectedLayer.type === 'image' && (
          <ImageLayerProperties layer={selectedLayer as ImageLayer} updateLayer={updateLayer} />
        )}

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Transform</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Position X</label>
              <input
                type="number"
                value={Math.round(selectedLayer.position.x)}
                onChange={(e) => updateLayer({ position: { ...selectedLayer.position, x: Number(e.target.value) } })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Position Y</label>
              <input
                type="number"
                value={Math.round(selectedLayer.position.y)}
                onChange={(e) => updateLayer({ position: { ...selectedLayer.position, y: Number(e.target.value) } })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
              <input
                type="number"
                value={Math.round(selectedLayer.size.width)}
                onChange={(e) => updateLayer({ size: { ...selectedLayer.size, width: Number(e.target.value) } })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Height</label>
              <input
                type="number"
                value={Math.round(selectedLayer.size.height)}
                onChange={(e) => updateLayer({ size: { ...selectedLayer.size, height: Number(e.target.value) } })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rotation</label>
              <input
                type="number"
                value={Math.round(selectedLayer.rotation)}
                onChange={(e) => updateLayer({ rotation: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selectedLayer.opacity}
                onChange={(e) => updateLayer({ opacity: Number(e.target.value) })}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">{Math.round(selectedLayer.opacity * 100)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextLayerProperties({ layer, updateLayer }: { layer: TextLayer; updateLayer: (updates: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Text Content</label>
        <textarea
          value={layer.content}
          onChange={(e) => updateLayer({ content: e.target.value })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Font Family</label>
        <select
          value={layer.fontFamily}
          onChange={(e) => updateLayer({ fontFamily: e.target.value })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Impact">Impact</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
        <input
          type="number"
          value={layer.fontSize}
          onChange={(e) => updateLayer({ fontSize: Number(e.target.value) })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Font Weight</label>
        <select
          value={layer.fontWeight}
          onChange={(e) => updateLayer({ fontWeight: Number(e.target.value) })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="300">Light (300)</option>
          <option value="400">Normal (400)</option>
          <option value="600">Semi-Bold (600)</option>
          <option value="700">Bold (700)</option>
          <option value="900">Black (900)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Text Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={layer.color}
            onChange={(e) => updateLayer({ color: e.target.value })}
            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={layer.color}
            onChange={(e) => updateLayer({ color: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Text Align</label>
        <select
          value={layer.textAlign}
          onChange={(e) => updateLayer({ textAlign: e.target.value })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Line Height</label>
        <input
          type="number"
          step="0.1"
          value={layer.lineHeight}
          onChange={(e) => updateLayer({ lineHeight: Number(e.target.value) })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

function ImageLayerProperties({ layer, updateLayer }: { layer: ImageLayer; updateLayer: (updates: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
        <input
          type="text"
          value={layer.imageUrl}
          onChange={(e) => updateLayer({ imageUrl: e.target.value })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Image URL or data URL"
        />
      </div>
      <div className="aspect-square w-full bg-gray-200 rounded overflow-hidden">
        <img src={layer.imageUrl} alt="Preview" className="w-full h-full object-contain" />
      </div>
    </div>
  );
}
