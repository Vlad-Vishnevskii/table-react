import { useState } from 'react';
import { nextDefaultName } from '../logic.js';

export default function TeamsPanel({ teams, onAdd, onRemove, onRename }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const err = onAdd(name);
    setError(err || '');
    if (!err) setName('');
  };

  return (
    <>
      <ul className="teams">
        {teams.map((t) => (
          <li key={t.id} className="team-chip">
            <input
              className="team-chip__input"
              value={t.name}
              onChange={(e) => onRename(t.id, e.target.value)}
              onBlur={(e) => !e.target.value.trim() && onRename(t.id, nextDefaultName(teams.filter((x) => x.id !== t.id)))}
              aria-label="Название команды"
              size={Math.max(t.name.length, 4)}
            />
            <button
              type="button"
              className="team-chip__remove"
              onClick={() => onRemove(t.id)}
              aria-label={`Удалить ${t.name}`}
              title="Удалить команду"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form className="add-team" onSubmit={submit}>
        <input
          className="input"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          placeholder={`Название (по умолчанию: ${nextDefaultName(teams)})`}
          maxLength={30}
        />
        <button type="submit" className="btn btn--green">
          + Команда
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </>
  );
}
