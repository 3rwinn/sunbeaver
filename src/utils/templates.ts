import { v4 as uuidv4 } from 'uuid';
import type { Template, Slide } from '../types';

export const defaultTemplates: Template[] = [
  {
    id: 'template-1',
    name: 'Simple Title',
    slide: {
      name: 'Simple Title',
      backgroundColor: '#1a1a1a',
      layers: [
        {
          id: uuidv4(),
          type: 'text',
          content: 'Your Title Here',
          position: { x: 540, y: 400 },
          size: { width: 800, height: 200 },
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          fontFamily: 'Arial',
          fontSize: 72,
          fontWeight: 700,
          color: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.2,
        },
      ],
    },
  },
  {
    id: 'template-2',
    name: 'Title + Subtitle',
    slide: {
      name: 'Title + Subtitle',
      backgroundColor: '#0f172a',
      layers: [
        {
          id: uuidv4(),
          type: 'text',
          content: 'Main Title',
          position: { x: 540, y: 300 },
          size: { width: 800, height: 150 },
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          fontFamily: 'Arial',
          fontSize: 64,
          fontWeight: 700,
          color: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.2,
        },
        {
          id: uuidv4(),
          type: 'text',
          content: 'Subtitle text goes here',
          position: { x: 540, y: 500 },
          size: { width: 700, height: 100 },
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          fontFamily: 'Arial',
          fontSize: 32,
          fontWeight: 400,
          color: '#94a3b8',
          textAlign: 'center',
          lineHeight: 1.5,
        },
      ],
    },
  },
  {
    id: 'template-3',
    name: 'Gradient Background',
    slide: {
      name: 'Gradient Background',
      backgroundColor: '#6366f1',
      layers: [
        {
          id: uuidv4(),
          type: 'text',
          content: 'Eye-Catching Text',
          position: { x: 540, y: 450 },
          size: { width: 900, height: 200 },
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          fontFamily: 'Arial',
          fontSize: 56,
          fontWeight: 800,
          color: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.3,
        },
      ],
    },
  },
];

export function saveTemplate(name: string, slide: Slide): Template {
  const template: Template = {
    id: uuidv4(),
    name,
    slide: {
      name: slide.name,
      backgroundColor: slide.backgroundColor,
      layers: slide.layers.map(layer => ({
        ...layer,
        id: uuidv4(),
      })),
    },
  };

  // Save to localStorage
  const templates = getCustomTemplates();
  templates.push(template);
  localStorage.setItem('custom-templates', JSON.stringify(templates));

  return template;
}

export function getCustomTemplates(): Template[] {
  const stored = localStorage.getItem('custom-templates');
  return stored ? JSON.parse(stored) : [];
}

export function deleteTemplate(id: string): void {
  const templates = getCustomTemplates();
  const filtered = templates.filter(t => t.id !== id);
  localStorage.setItem('custom-templates', JSON.stringify(filtered));
}

export function getAllTemplates(): Template[] {
  return [...defaultTemplates, ...getCustomTemplates()];
}

export function applyTemplate(template: Template): Slide {
  return {
    id: uuidv4(),
    name: template.slide.name,
    backgroundColor: template.slide.backgroundColor,
    layers: template.slide.layers.map(layer => ({
      ...layer,
      id: uuidv4(),
    })),
  };
}
