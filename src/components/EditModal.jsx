import { useEffect, useState } from 'react';
import MatchFields from './MatchFields.jsx';

export default function EditModal({ match, teams, onSave, onDelete, onClose }) {
  const [value, setValue] = useState({
    homeId: match.homeId,
    awayId: match.awayId,
    homeGoals: match.homeGoals,
    awayGoals: match.awayGoals,
  });
  const valid = value.homeId && value.awayId && value.homeId !== value.awayId;

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="modal__box"
        role="dialog"
        aria-modal="true"
        aria-label="Редактирование матча"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onSave(value);
        }}
      >
        <h2 className="card__title">Редактирование матча</h2>
        <MatchFields teams={teams} value={value} onChange={setValue} />
        <div className="modal__actions">
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => confirm('Удалить этот матч?') && onDelete()}
          >
            Удалить
          </button>
          <span className="spacer" />
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary" disabled={!valid}>
            Сохранить
          </button>
        </div>
      </form>
    </div>
  );
}
