# TikTok Slideshow Creator

A powerful React web application for creating stunning 9:16 aspect ratio slideshows perfect for TikTok, Instagram Reels, and other vertical video platforms.

## Features

### Core Features
- **Canvas Editor with 9:16 TikTok Aspect Ratio** - Professional canvas sized at 1080x1920 pixels
- **Multi-slide Support** - Add, duplicate, delete, and reorder slides with drag-and-drop
- **Text Layers** - Fully customizable text with:
  - Multiple font families
  - Adjustable font size, weight, and line height
  - Color picker for text color
  - Text alignment (left, center, right)
  - Direct text editing on canvas
- **Image Upload** - Upload images with automatic resize and crop functionality
- **Layer Ordering** - Bring layers to front/back or move forward/backward
- **Undo/Redo** - Full history support with keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z)
- **Project Management** - Save and load projects as JSON files
- **Template System** - Pre-built templates and ability to save custom templates
- **Image Export** - Export individual slides or all slides as PNG images
- **Properties Panel** - Fine-tune every aspect of your elements

### User Interface
- Clean, modern interface with gradient header
- Slide thumbnail sidebar for easy navigation
- Comprehensive toolbar with all essential tools
- Properties panel for detailed customization
- Keyboard shortcuts for productivity

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sunbeaver
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production files will be in the `dist` directory.

## Usage Guide

### Creating a New Slide
1. Click the "Add Slide" button in the sidebar
2. Select from available templates or start with a blank slide
3. Customize the background color in the Properties panel

### Adding Text
1. Click the "Text" button in the toolbar
2. A text element will appear in the center of the canvas
3. Double-click the text on the canvas to edit
4. Use the Properties panel to customize:
   - Font family and size
   - Font weight and color
   - Text alignment and line height
   - Position, rotation, and opacity

### Adding Images
1. Click the "Image" button in the toolbar
2. Select an image file from your computer
3. The image will be automatically resized to fit
4. Resize, rotate, and position the image on the canvas
5. Adjust opacity and other properties in the Properties panel

### Working with Layers
- Select a layer by clicking on it in the canvas
- Use the layer controls in the toolbar to:
  - Bring to Front (top of stack)
  - Bring Forward (one level up)
  - Send Backward (one level down)
  - Send to Back (bottom of stack)
  - Delete the selected layer

### Slide Management
- **Reorder slides**: Drag and drop slides in the sidebar
- **Duplicate slide**: Click the duplicate icon on a slide thumbnail
- **Delete slide**: Click the trash icon on a slide thumbnail
- **Switch slides**: Click on a slide thumbnail to edit it

### Templates
1. Click "Templates" in the toolbar to view available templates
2. Click on a template to create a new slide from it
3. Save your current slide as a template by clicking "Save Template"

### Saving and Loading Projects
- **Save**: Click "Save" to download your project as a JSON file
- **Load**: Click "Load" to import a previously saved project

### Exporting
- **Export Slide**: Export the current slide as a PNG image
- **Export All**: Export all slides as separate PNG images

### Keyboard Shortcuts
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo
- `Delete/Backspace` - Delete selected layer (when not editing text)

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Fabric.js** - Canvas manipulation and rendering
- **Tailwind CSS** - Utility-first styling
- **dnd-kit** - Drag and drop functionality
- **React Icons** - Icon library
- **UUID** - Unique ID generation

## Project Structure

```
src/
├── components/          # React components
│   ├── CanvasEditor.tsx       # Main canvas component
│   ├── SlidesSidebar.tsx      # Slide management sidebar
│   ├── Toolbar.tsx            # Top toolbar with tools
│   └── PropertiesPanel.tsx    # Right panel for properties
├── store/              # State management
│   └── EditorContext.tsx      # Global editor state
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── export.ts              # Export/import utilities
│   └── templates.ts           # Template management
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Tips and Best Practices

1. **Use Templates** - Start with a template to speed up your workflow
2. **Save Often** - Use the Save feature to backup your work
3. **Layer Organization** - Use meaningful positions and layer ordering
4. **Text Readability** - Ensure good contrast between text and background
5. **Image Quality** - Use high-resolution images for best results
6. **Consistent Design** - Maintain consistent fonts and colors across slides

## Browser Compatibility

This application works best in modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Made with by Claude Code
