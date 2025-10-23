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
import { FiPlus, FiCopy, FiTrash2 } from 'react-icons/fi';

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
      className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden mb-2 ${
        isActive ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-blue-400'
      }`}
      {...attributes}
      {...listeners}
    >
      <div
        className="w-full aspect-[9/16] flex items-center justify-center text-xs font-medium"
        style={{ backgroundColor: slide.backgroundColor }}
        onClick={() => actions.setCurrentSlide(index)}
      >
        <span className="text-gray-500 opacity-50">{slide.name}</span>
      </div>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            actions.duplicateSlide(index);
          }}
          className="p-1 bg-white rounded shadow hover:bg-gray-100"
          title="Duplicate"
        >
          <FiCopy size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Delete this slide?')) {
              actions.deleteSlide(index);
            }
          }}
          className="p-1 bg-white rounded shadow hover:bg-red-100 hover:text-red-600"
          title="Delete"
        >
          <FiTrash2 size={12} />
        </button>
      </div>
      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded">
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
    <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Slides</h2>
        <button
          onClick={() => actions.addSlide()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          <FiPlus size={16} />
          Add Slide
        </button>
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
