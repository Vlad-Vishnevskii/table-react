import { useEffect, useMemo } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MatchRow from './MatchRow.jsx';

function SortableRow({ match, names, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: match.id });

  return (
    <MatchRow
      match={match}
      names={names}
      ref={setNodeRef}
      className={isDragging ? 'is-dragging' : ''}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="icon-btn drag-handle"
        aria-label="Перетащить матч"
        title="Перетащить"
        {...attributes}
        {...listeners}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" />
          <circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
        </svg>
      </button>
      <button
        type="button"
        className="icon-btn"
        onClick={() => onEdit(match.id)}
        aria-label="Редактировать матч"
        title="Редактировать"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
    </MatchRow>
  );
}

export default function HistoryEditor({ matches, teams, paused, onEdit, onReorder, onClose }) {
  const names = useMemo(
    () => Object.fromEntries(teams.map((t) => [t.id, t.name])),
    [teams],
  );
  const ids = useMemo(() => matches.map((m) => m.id), [matches]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (paused) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, paused]);

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal__box modal__box--wide" role="dialog" aria-modal="true" aria-label="Редактирование истории">
        <h2 className="card__title">Редактирование истории</h2>
        <p className="hint">Перетаскивайте матчи за значок справа, чтобы изменить порядок.</p>
        {matches.length === 0 ? (
          <p className="hint">Матчей пока нет.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => over && onReorder(active.id, over.id)}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <ul className="games">
                {matches.map((m) => (
                  <SortableRow key={m.id} match={m} names={names} onEdit={onEdit} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
        <div className="modal__actions">
          <span className="spacer" />
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}
