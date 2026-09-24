export default function Standings({ rows }) {
  if (rows.length === 0) {
    return <p className="hint">Пока нет команд.</p>;
  }
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th title="Место">М</th>
            <th className="table__name">Команда</th>
            <th title="Очки">О</th>
            <th title="Игры">И</th>
            <th title="Победы">Пб</th>
            <th title="Поражения">Пр</th>
            <th title="Ничьи">Н</th>
            <th className="table__extra" title="Забито">ГЗ</th>
            <th className="table__extra" title="Пропущено">ГП</th>
            <th className="table__extra" title="Разница голов">РГ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className={i === 0 && r.played > 0 ? 'is-leader' : ''}>
              <td><span className="place">{i + 1}</span></td>
              <td className="table__name">{r.name}</td>
              <td className="table__points">{r.points}</td>
              <td>{r.played}</td>
              <td>{r.wins}</td>
              <td>{r.losses}</td>
              <td>{r.draws}</td>
              <td className="table__extra">{r.scored}</td>
              <td className="table__extra">{r.conceded}</td>
              <td className="table__extra">{r.diff > 0 ? `+${r.diff}` : r.diff}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
