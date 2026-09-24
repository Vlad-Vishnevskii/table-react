import ScoreStepper from './ScoreStepper.jsx';

// Общий блок «хозяева — счёт — гости» для формы добавления и окна правки.
export default function MatchFields({ teams, value, onChange }) {
  const { homeId, awayId, homeGoals, awayGoals } = value;
  const set = (patch) => onChange({ ...value, ...patch });

  const select = (current, other, key, label) => (
    <select
      className="select"
      value={current}
      onChange={(e) => set({ [key]: e.target.value })}
      aria-label={label}
    >
      <option value="" disabled>
        Выберите команду
      </option>
      {teams.map((t) => (
        <option key={t.id} value={t.id} disabled={t.id === other}>
          {t.name}
        </option>
      ))}
    </select>
  );

  return (
    <div className="match-fields">
      <div className="match-fields__side">
        {select(homeId, awayId, 'homeId', 'Хозяева')}
        <ScoreStepper
          value={homeGoals}
          onChange={(v) => set({ homeGoals: v })}
          label="Голы хозяев"
        />
      </div>
      <div className="match-fields__vs">Против</div>
      <div className="match-fields__side">
        {select(awayId, homeId, 'awayId', 'Гости')}
        <ScoreStepper
          value={awayGoals}
          onChange={(v) => set({ awayGoals: v })}
          label="Голы гостей"
        />
      </div>
    </div>
  );
}
