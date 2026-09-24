import { useState } from 'react';
import MatchFields from './MatchFields.jsx';

const EMPTY = { homeId: '', awayId: '', homeGoals: 0, awayGoals: 0 };

export default function MatchForm({ teams, onAdd }) {
  const [value, setValue] = useState(EMPTY);
  const valid =
    value.homeId && value.awayId && value.homeId !== value.awayId;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onAdd(value);
    setValue(EMPTY);
  };

  return (
    <form onSubmit={submit}>
      {teams.length < 2 ? (
        <p className="hint">Добавьте минимум две команды, чтобы вносить матчи.</p>
      ) : (
        <MatchFields teams={teams} value={value} onChange={setValue} />
      )}
      <button type="submit" className="btn btn--primary btn--block" disabled={!valid}>
        Добавить результат
      </button>
    </form>
  );
}
