export default function ScoreStepper({ value, onChange, label }) {
  const set = (v) => onChange(Math.max(0, Math.min(99, v)));
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => set(value - 1)}
        disabled={value <= 0}
        aria-label="Меньше"
      >
        −
      </button>
      <output className="stepper__value">{value}</output>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => set(value + 1)}
        aria-label="Больше"
      >
        +
      </button>
    </div>
  );
}
