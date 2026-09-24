import { useMemo } from 'react';
import MatchRow from './MatchRow.jsx';

export default function History({ matches, teams, onManage }) {
  const names = useMemo(
    () => Object.fromEntries(teams.map((t) => [t.id, t.name])),
    [teams],
  );

  return (
    <>
      <div className="history__head">
        <h2 className="card__title">История матчей</h2>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onManage}
          disabled={matches.length === 0}
        >
          Редактировать
        </button>
      </div>

      {matches.length === 0 ? (
        <p className="hint">Матчей пока нет.</p>
      ) : (
        <ul className="games">
          {matches.map((m) => (
            <MatchRow key={m.id} match={m} names={names} />
          ))}
        </ul>
      )}
    </>
  );
}
