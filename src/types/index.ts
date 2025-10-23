export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type LayerType = 'text' | 'image';

export interface BaseLayer {
  id: string;
  type: LayerType;
  position: Position;
  size: Size;
  rotation: number;
  opacity: number;
  zIndex: number;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  imageUrl: string;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type Layer = TextLayer | ImageLayer;

export interface Slide {
  id: string;
  name: string;
  backgroundColor: string;
  layers: Layer[];
}

export interface Project {
  id: string;
  name: string;
  slides: Slide[];
  currentSlideIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  thumbnail?: string;
  slide: Omit<Slide, 'id'>;
}

export interface HistoryState {
  project: Project;
  timestamp: number;
}
