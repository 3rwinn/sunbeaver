import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Project, Slide, Layer, HistoryState } from '../types';

interface EditorState {
  project: Project;
  selectedLayerId: string | null;
  history: HistoryState[];
  historyIndex: number;
}

type EditorAction =
  | { type: 'SET_PROJECT'; payload: Project }
  | { type: 'ADD_SLIDE'; payload?: Slide }
  | { type: 'DUPLICATE_SLIDE'; payload: number }
  | { type: 'DELETE_SLIDE'; payload: number }
  | { type: 'REORDER_SLIDES'; payload: { from: number; to: number } }
  | { type: 'SET_CURRENT_SLIDE'; payload: number }
  | { type: 'UPDATE_SLIDE'; payload: { index: number; slide: Partial<Slide> } }
  | { type: 'ADD_LAYER'; payload: Layer }
  | { type: 'UPDATE_LAYER'; payload: { id: string; updates: Partial<Layer> } }
  | { type: 'DELETE_LAYER'; payload: string }
  | { type: 'REORDER_LAYER'; payload: { id: string; direction: 'front' | 'back' | 'forward' | 'backward' } }
  | { type: 'SELECT_LAYER'; payload: string | null }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_HISTORY' };

const createDefaultProject = (): Project => ({
  id: uuidv4(),
  name: 'Untitled Project',
  slides: [
    {
      id: uuidv4(),
      name: 'Slide 1',
      backgroundColor: '#ffffff',
      layers: [],
    },
  ],
  currentSlideIndex: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const defaultProject = createDefaultProject();
const initialState: EditorState = {
  project: defaultProject,
  selectedLayerId: null,
  history: [{
    project: JSON.parse(JSON.stringify(defaultProject)),
    timestamp: Date.now(),
  }],
  historyIndex: 0,
};

const EditorContext = createContext<{
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  actions: {
    addSlide: (slide?: Slide) => void;
    duplicateSlide: (index: number) => void;
    deleteSlide: (index: number) => void;
    reorderSlides: (from: number, to: number) => void;
    setCurrentSlide: (index: number) => void;
    updateSlide: (index: number, updates: Partial<Slide>) => void;
    addLayer: (layer: Layer) => void;
    updateLayer: (id: string, updates: Partial<Layer>) => void;
    deleteLayer: (id: string) => void;
    reorderLayer: (id: string, direction: 'front' | 'back' | 'forward' | 'backward') => void;
    selectLayer: (id: string | null) => void;
    undo: () => void;
    redo: () => void;
    loadProject: (project: Project) => void;
  };
} | null>(null);

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  let newState = { ...state };

  switch (action.type) {
    case 'SET_PROJECT':
      return {
        ...state,
        project: action.payload,
        selectedLayerId: null,
      };

    case 'ADD_SLIDE': {
      const newSlide = action.payload || {
        id: uuidv4(),
        name: `Slide ${state.project.slides.length + 1}`,
        backgroundColor: '#ffffff',
        layers: [],
      };
      newState.project = {
        ...state.project,
        slides: [...state.project.slides, newSlide],
        updatedAt: new Date().toISOString(),
      };
      break;
    }

    case 'DUPLICATE_SLIDE': {
      const slideToDuplicate = state.project.slides[action.payload];
      if (slideToDuplicate) {
        const duplicatedSlide: Slide = {
          ...JSON.parse(JSON.stringify(slideToDuplicate)),
          id: uuidv4(),
          name: `${slideToDuplicate.name} (Copy)`,
          layers: slideToDuplicate.layers.map(layer => ({
            ...layer,
            id: uuidv4(),
          })),
        };
        const slides = [...state.project.slides];
        slides.splice(action.payload + 1, 0, duplicatedSlide);
        newState.project = {
          ...state.project,
          slides,
          updatedAt: new Date().toISOString(),
        };
      }
      break;
    }

    case 'DELETE_SLIDE': {
      if (state.project.slides.length > 1) {
        const slides = state.project.slides.filter((_, i) => i !== action.payload);
        const newCurrentIndex = Math.min(state.project.currentSlideIndex, slides.length - 1);
        newState.project = {
          ...state.project,
          slides,
          currentSlideIndex: newCurrentIndex,
          updatedAt: new Date().toISOString(),
        };
      }
      break;
    }

    case 'REORDER_SLIDES': {
      const { from, to } = action.payload;
      const slides = [...state.project.slides];
      const [movedSlide] = slides.splice(from, 1);
      slides.splice(to, 0, movedSlide);

      // Update currentSlideIndex to track the current slide after reordering
      let newCurrentIndex = state.project.currentSlideIndex;
      if (from === state.project.currentSlideIndex) {
        // The current slide is being moved
        newCurrentIndex = to;
      } else if (from < state.project.currentSlideIndex && to >= state.project.currentSlideIndex) {
        // A slide before current is moved to or after current position
        newCurrentIndex--;
      } else if (from > state.project.currentSlideIndex && to <= state.project.currentSlideIndex) {
        // A slide after current is moved to or before current position
        newCurrentIndex++;
      }

      newState.project = {
        ...state.project,
        slides,
        currentSlideIndex: newCurrentIndex,
        updatedAt: new Date().toISOString(),
      };
      break;
    }

    case 'SET_CURRENT_SLIDE':
      newState.project = {
        ...state.project,
        currentSlideIndex: action.payload,
      };
      newState.selectedLayerId = null;
      break;

    case 'UPDATE_SLIDE': {
      const slides = [...state.project.slides];
      slides[action.payload.index] = {
        ...slides[action.payload.index],
        ...action.payload.slide,
      };
      newState.project = {
        ...state.project,
        slides,
        updatedAt: new Date().toISOString(),
      };
      break;
    }

    case 'ADD_LAYER': {
      const currentSlide = state.project.slides[state.project.currentSlideIndex];
      const slides = [...state.project.slides];
      slides[state.project.currentSlideIndex] = {
        ...currentSlide,
        layers: [...currentSlide.layers, action.payload],
      };
      newState.project = {
        ...state.project,
        slides,
        updatedAt: new Date().toISOString(),
      };
      newState.selectedLayerId = action.payload.id;
      break;
    }

    case 'UPDATE_LAYER': {
      const currentSlide = state.project.slides[state.project.currentSlideIndex];
      const slides = [...state.project.slides];
      slides[state.project.currentSlideIndex] = {
        ...currentSlide,
        layers: currentSlide.layers.map(layer =>
          layer.id === action.payload.id
            ? { ...layer, ...action.payload.updates } as Layer
            : layer
        ),
      };
      newState.project = {
        ...state.project,
        slides,
        updatedAt: new Date().toISOString(),
      };
      break;
    }

    case 'DELETE_LAYER': {
      const currentSlide = state.project.slides[state.project.currentSlideIndex];
      const slides = [...state.project.slides];
      slides[state.project.currentSlideIndex] = {
        ...currentSlide,
        layers: currentSlide.layers.filter(layer => layer.id !== action.payload),
      };
      newState.project = {
        ...state.project,
        slides,
        updatedAt: new Date().toISOString(),
      };
      if (state.selectedLayerId === action.payload) {
        newState.selectedLayerId = null;
      }
      break;
    }

    case 'REORDER_LAYER': {
      const currentSlide = state.project.slides[state.project.currentSlideIndex];
      const layerIndex = currentSlide.layers.findIndex(l => l.id === action.payload.id);
      if (layerIndex === -1) break;

      const layers = [...currentSlide.layers];
      const layer = layers[layerIndex];

      switch (action.payload.direction) {
        case 'front':
          layer.zIndex = Math.max(...layers.map(l => l.zIndex)) + 1;
          break;
        case 'back':
          layer.zIndex = Math.min(...layers.map(l => l.zIndex)) - 1;
          break;
        case 'forward':
          layer.zIndex += 1;
          break;
        case 'backward':
          layer.zIndex -= 1;
          break;
      }

      const slides = [...state.project.slides];
      slides[state.project.currentSlideIndex] = {
        ...currentSlide,
        layers,
      };
      newState.project = {
        ...state.project,
        slides,
        updatedAt: new Date().toISOString(),
      };
      break;
    }

    case 'SELECT_LAYER':
      return {
        ...state,
        selectedLayerId: action.payload,
      };

    case 'SAVE_HISTORY': {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({
        project: JSON.parse(JSON.stringify(state.project)),
        timestamp: Date.now(),
      });
      // Keep only last 50 history states
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      return {
        ...state,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'UNDO': {
      if (state.historyIndex > 0) {
        const previousState = state.history[state.historyIndex - 1];
        return {
          ...state,
          project: JSON.parse(JSON.stringify(previousState.project)),
          historyIndex: state.historyIndex - 1,
          selectedLayerId: null,
        };
      }
      return state;
    }

    case 'REDO': {
      if (state.historyIndex < state.history.length - 1) {
        const nextState = state.history[state.historyIndex + 1];
        return {
          ...state,
          project: JSON.parse(JSON.stringify(nextState.project)),
          historyIndex: state.historyIndex + 1,
          selectedLayerId: null,
        };
      }
      return state;
    }

    default:
      return state;
  }

  // Save to history for actions that modify the project
  const nonHistoryActions = ['SELECT_LAYER', 'SET_CURRENT_SLIDE', 'SET_PROJECT', 'UNDO', 'REDO', 'SAVE_HISTORY'];
  if (!nonHistoryActions.includes(action.type)) {
    const newHistory = newState.history.slice(0, newState.historyIndex + 1);
    newHistory.push({
      project: JSON.parse(JSON.stringify(newState.project)),
      timestamp: Date.now(),
    });
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    newState.history = newHistory;
    newState.historyIndex = newHistory.length - 1;
  }

  return newState;
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const actions = {
    addSlide: useCallback((slide?: Slide) => dispatch({ type: 'ADD_SLIDE', payload: slide }), []),
    duplicateSlide: useCallback((index: number) => dispatch({ type: 'DUPLICATE_SLIDE', payload: index }), []),
    deleteSlide: useCallback((index: number) => dispatch({ type: 'DELETE_SLIDE', payload: index }), []),
    reorderSlides: useCallback((from: number, to: number) => dispatch({ type: 'REORDER_SLIDES', payload: { from, to } }), []),
    setCurrentSlide: useCallback((index: number) => dispatch({ type: 'SET_CURRENT_SLIDE', payload: index }), []),
    updateSlide: useCallback((index: number, slide: Partial<Slide>) => dispatch({ type: 'UPDATE_SLIDE', payload: { index, slide } }), []),
    addLayer: useCallback((layer: Layer) => dispatch({ type: 'ADD_LAYER', payload: layer }), []),
    updateLayer: useCallback((id: string, updates: Partial<Layer>) => dispatch({ type: 'UPDATE_LAYER', payload: { id, updates } }), []),
    deleteLayer: useCallback((id: string) => dispatch({ type: 'DELETE_LAYER', payload: id }), []),
    reorderLayer: useCallback((id: string, direction: 'front' | 'back' | 'forward' | 'backward') => dispatch({ type: 'REORDER_LAYER', payload: { id, direction } }), []),
    selectLayer: useCallback((id: string | null) => dispatch({ type: 'SELECT_LAYER', payload: id }), []),
    undo: useCallback(() => dispatch({ type: 'UNDO' }), []),
    redo: useCallback(() => dispatch({ type: 'REDO' }), []),
    loadProject: useCallback((project: Project) => dispatch({ type: 'SET_PROJECT', payload: project }), []),
  };

  return (
    <EditorContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
}
