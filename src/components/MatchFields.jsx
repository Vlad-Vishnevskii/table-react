import ScoreStepper from './ScoreStepper.jsx';
import Select from './Select.jsx';

// Общий блок «хозяева — счёт — гости» для формы добавления и окна правки.
export default function MatchFields({ teams, value, onChange }) {
  const { homeId, awayId, homeGoals, awayGoals } = value;
  const set = (patch) => onChange({ ...value, ...patch });

  const select = (current, other, key, label) => (
    <Select
      value={current}
      onChange={(v) => set({ [key]: v })}
      label={label}
      placeholder="Выберите команду"
      options={teams.map((t) => ({ value: t.id, label: t.name, disabled: t.id === other }))}
    />
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
