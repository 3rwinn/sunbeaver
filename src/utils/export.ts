import type { Slide } from '../types';

export async function exportSlideAsImage(
  canvas: HTMLCanvasElement,
  slide: Slide,
  index: number
): Promise<void> {
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${slide.name || `slide-${index + 1}`}.png`;
  link.href = dataUrl;
  link.click();
}

export async function exportAllSlidesAsImages(
  slides: Slide[],
  renderSlide: (slide: Slide) => Promise<HTMLCanvasElement>
): Promise<void> {
  for (let i = 0; i < slides.length; i++) {
    const canvas = await renderSlide(slides[i]);
    await exportSlideAsImage(canvas, slides[i], i);
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

export function downloadJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

export function loadJSONFile(): Promise<any> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error('No file selected'));
      }
    };
    input.click();
  });
}

export function loadImageFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else {
        reject(new Error('No file selected'));
      }
    };
    input.click();
  });
}
