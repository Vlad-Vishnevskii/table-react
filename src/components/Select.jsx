import { useEffect, useId, useRef, useState } from 'react';

// Свой выпадающий список: нативный <select> не даёт стилизовать открытый список.
export default function Select({ value, options, onChange, placeholder, label }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [up, setUp] = useState(false);
  const root = useRef(null);
  const list = useRef(null);
  const id = useId();
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !root.current.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const next = (from, dir) => {
    let i = from;
    for (let n = 0; n < options.length; n++) {
      i = (i + dir + options.length) % options.length;
      if (!options[i].disabled) return i;
    }
    return from;
  };

  const show = () => {
    const r = root.current.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    setUp(below < 260 && r.top > below);
    const i = options.findIndex((o) => o.value === value);
    setActive(i >= 0 ? i : next(-1, 1));
    setOpen(true);
  };

  const choose = (i) => {
    const o = options[i];
    if (!o || o.disabled) return;
    onChange(o.value);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        show();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => next(i, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => next(i, -1));
        break;
      case 'Home':
        e.preventDefault();
        setActive(next(-1, 1));
        break;
      case 'End':
        e.preventDefault();
        setActive(next(options.length, -1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        choose(active);
        break;
      case 'Escape':
        // не даём Esc закрыть модальное окно вместе со списком
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div className={`sel${open ? ' is-open' : ''}${up ? ' is-up' : ''}`} ref={root}>
      <button
        type="button"
        className="sel__btn"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open && active >= 0 ? `${id}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
      >
        <span className={`sel__value${selected ? '' : ' is-placeholder'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className="sel__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul className="sel__list" role="listbox" id={`${id}-list`} ref={list} aria-label={label}>
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-${i}`}
              role="option"
              aria-selected={o.value === value}
              aria-disabled={o.disabled || undefined}
              className={`sel__option${i === active ? ' is-active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => !o.disabled && setActive(i)}
              onClick={() => choose(i)}
            >
              <span>{o.label}</span>
              {o.value === value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12l5 5 9-10" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
