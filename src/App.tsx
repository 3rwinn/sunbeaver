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
    <div className="h-screen flex flex-col bg-background">
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">TikTok Slideshow Creator</h1>
            <p className="text-sm opacity-90 font-medium">Create stunning 9:16 vertical slideshows</p>
          </div>
          <div className="text-xs opacity-75 text-right">
            <p>Keyboard Shortcuts</p>
            <p>Undo: Ctrl/Cmd+Z | Redo: Ctrl/Cmd+Shift+Z</p>
          </div>
        </div>
      </header>
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <SlidesSidebar />
        <CanvasEditor />
        <PropertiesPanel />
      </div>
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
