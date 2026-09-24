import { useEffect, useMemo, useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import Standings from './Standings.jsx';
import MatchRow from './MatchRow.jsx';

const today = () =>
  new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

// Картинка для отправки: рендерится вне экрана фиксированной ширины,
// чтобы результат не зависел от размера экрана устройства.
function ShareCard({ standings, matches, teams, cardRef }) {
  const names = useMemo(
    () => Object.fromEntries(teams.map((t) => [t.id, t.name])),
    [teams],
  );
  return (
    <div className="share-card" ref={cardRef}>
      <div className="share-card__head">
        <img
          className="header__logo"
          src={`${import.meta.env.BASE_URL}logo.jpg`}
          alt=""
        />
        <div>
          <h1 className="header__title">Таблица тренировок</h1>
          <p className="header__sub">Итоги дня · {today()}</p>
        </div>
      </div>
      <section className="card">
        <h2 className="card__title">Итоговая таблица дня</h2>
        <Standings rows={standings} />
      </section>
      {matches.length > 0 && (
        <section className="card">
          <h2 className="card__title">История матчей</h2>
          <ul className="games">
            {matches.map((m) => (
              <MatchRow key={m.id} match={m} names={names} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function Share({ standings, matches, teams }) {
  const [stage, setStage] = useState('idle'); // idle | rendering | ready
  const [file, setFile] = useState(null);
  const cardRef = useRef(null);
  const url = useMemo(() => file && URL.createObjectURL(file), [file]);

  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);

  useEffect(() => {
    if (stage !== 'rendering') return;
    let cancelled = false;
    (async () => {
      try {
        const node = cardRef.current;
        await document.fonts.ready;
        await Promise.all(
          [...node.querySelectorAll('img')].map((img) => img.decode().catch(() => {})),
        );
        const bg = getComputedStyle(document.body).backgroundColor;
        const blob = await toBlob(node, { pixelRatio: 2, backgroundColor: bg });
        if (cancelled) return;
        const date = new Date().toISOString().slice(0, 10);
        setFile(new File([blob], `tablica-${date}.png`, { type: 'image/png' }));
        setStage('ready');
      } catch {
        if (cancelled) return;
        alert('Не удалось создать картинку');
        setStage('idle');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== 'ready') return;
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage]);

  const close = () => {
    setStage('idle');
    setFile(null);
  };

  const canShare = file && navigator.canShare?.({ files: [file] });

  const share = async () => {
    try {
      await navigator.share({ files: [file], title: 'Таблица тренировок' });
    } catch (e) {
      if (e.name !== 'AbortError') download();
    }
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
  };

  return (
    <>
      <button
        type="button"
        className="icon-btn"
        onClick={() => setStage('rendering')}
        disabled={stage === 'rendering'}
        title="Поделиться"
        aria-label="Поделиться таблицей и историей"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      </button>

      {stage === 'rendering' && (
        <div className="share-stage" aria-hidden="true">
          <ShareCard standings={standings} matches={matches} teams={teams} cardRef={cardRef} />
        </div>
      )}

      {stage === 'ready' && (
        <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div className="modal__box modal__box--wide" role="dialog" aria-modal="true" aria-label="Поделиться">
            <h2 className="card__title">Поделиться</h2>
            <div className="modal__body">
              <img className="share-preview" src={url} alt="Итоговая таблица и история матчей" />
            </div>
            <div className={`modal__actions share-actions${canShare ? '' : ' share-actions--single'}`}>
              <button type="button" className="btn btn--ghost" onClick={close}>
                Закрыть
              </button>
              <span className="spacer" />
              <button type="button" className={canShare ? 'btn btn--ghost' : 'btn btn--primary'} onClick={download}>
                Скачать
              </button>
              {canShare && (
                <button type="button" className="btn btn--primary" onClick={share}>
                  Поделиться
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
