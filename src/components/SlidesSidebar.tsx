import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditor } from '../store/EditorContext';
import type { Slide } from '../types';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function SortableSlideItem({ slide, index, isActive }: { slide: Slide; index: number; isActive: boolean }) {
  const { actions } = useEditor();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden mb-2 transition-all ${
        isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
      }`}
      {...attributes}
      {...listeners}
    >
      <div
        className="w-full aspect-[9/16] flex items-center justify-center text-xs font-medium"
        style={{ backgroundColor: slide.backgroundColor }}
        onClick={() => actions.setCurrentSlide(index)}
      >
        <span className="text-muted-foreground opacity-50">{slide.name}</span>
      </div>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            actions.duplicateSlide(index);
          }}
          className="p-1 bg-card rounded shadow-sm hover:bg-accent transition-colors"
          title="Duplicate"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Delete this slide?')) {
              actions.deleteSlide(index);
            }
          }}
          className="p-1 bg-card rounded shadow-sm hover:bg-destructive/10 hover:text-destructive transition-colors"
          title="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <div className="absolute bottom-1 left-1 bg-background/80 backdrop-blur-sm text-foreground text-xs px-2 py-0.5 rounded border border-border">
        {index + 1}
      </div>
    </div>
  );
}

export function SlidesSidebar() {
  const { state, actions } = useEditor();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = state.project.slides.findIndex((s) => s.id === active.id);
      const newIndex = state.project.slides.findIndex((s) => s.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        actions.reorderSlides(oldIndex, newIndex);
      }
    }
  };

  return (
    <div className="w-48 bg-card border-r border-border flex flex-col">
      <div className="p-3 border-b border-border">
        <h2 className="text-sm font-semibold mb-2">Slides</h2>
        <Button
          onClick={() => actions.addSlide()}
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Slide
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={state.project.slides.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {state.project.slides.map((slide, index) => (
              <SortableSlideItem
                key={slide.id}
                slide={slide}
                index={index}
                isActive={index === state.project.currentSlideIndex}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
