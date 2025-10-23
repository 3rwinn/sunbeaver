import { useEffect } from 'react';
import { EditorProvider, useEditor } from './store/EditorContext';
import { SlidesSidebar } from './components/SlidesSidebar';
import { Toolbar } from './components/Toolbar';
import { CanvasEditor } from './components/CanvasEditor';
import { PropertiesPanel } from './components/PropertiesPanel';

function EditorLayout() {
  const { actions } = useEditor();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        actions.undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        actions.redo();
      }
      // Delete layer
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        const target = e.target as HTMLElement;
        // Only delete if not typing in an input
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          // Delete will be handled by fabric canvas
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 shadow-lg">
        <h1 className="text-2xl font-bold">TikTok Slideshow Creator</h1>
        <p className="text-sm opacity-90">Create stunning 9:16 slideshows for TikTok</p>
      </header>
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <SlidesSidebar />
        <CanvasEditor />
        <PropertiesPanel />
      </div>
      <footer className="bg-gray-800 text-white text-center py-2 text-sm">
        <p>Use Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z to redo</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <EditorProvider>
      <EditorLayout />
    </EditorProvider>
  );
}

export default App;
