import { useEffect, useMemo, useState } from 'react';
import {
  computeStandings,
  loadState,
  nextDefaultName,
  saveState,
  uid,
} from './logic.js';
import TeamsPanel from './components/TeamsPanel.jsx';
import MatchForm from './components/MatchForm.jsx';
import Standings from './components/Standings.jsx';
import History from './components/History.jsx';
import EditModal from './components/EditModal.jsx';
import HistoryEditor from './components/HistoryEditor.jsx';

export default function App() {
  const [state, setState] = useState(loadState);
  const [editingId, setEditingId] = useState(null);
  const [managing, setManaging] = useState(false);
  const { teams, matches } = state;

  useEffect(() => saveState(state), [state]);

  const standings = useMemo(
    () => computeStandings(teams, matches),
    [teams, matches],
  );

  const addTeam = (rawName) => {
    const name = rawName.trim() || nextDefaultName(teams);
    if (teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      return 'Команда с таким названием уже есть';
    }
    setState((s) => ({ ...s, teams: [...s.teams, { id: uid(), name }] }));
    return null;
  };

  const removeTeam = (id) => {
    const count = matches.filter(
      (m) => m.homeId === id || m.awayId === id,
    ).length;
    const team = teams.find((t) => t.id === id);
    if (
      count > 0 &&
      !confirm(`У «${team.name}» сыграно матчей: ${count}. Удалить команду вместе с ними?`)
    ) {
      return;
    }
    setState((s) => ({
      teams: s.teams.filter((t) => t.id !== id),
      matches: s.matches.filter((m) => m.homeId !== id && m.awayId !== id),
    }));
  };

  const renameTeam = (id, name) =>
    setState((s) => ({
      ...s,
      teams: s.teams.map((t) => (t.id === id ? { ...t, name } : t)),
    }));

  const addMatch = (match) =>
    setState((s) => ({
      ...s,
      matches: [...s.matches, { ...match, id: uid(), createdAt: Date.now() }],
    }));

  const updateMatch = (id, patch) =>
    setState((s) => ({
      ...s,
      matches: s.matches.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));

  const reorderMatches = (fromId, toId) =>
    setState((s) => {
      const from = s.matches.findIndex((m) => m.id === fromId);
      const to = s.matches.findIndex((m) => m.id === toId);
      if (from < 0 || to < 0 || from === to) return s;
      const matches = [...s.matches];
      matches.splice(to, 0, matches.splice(from, 1)[0]);
      return { ...s, matches };
    });

  const deleteMatch = (id) =>
    setState((s) => ({ ...s, matches: s.matches.filter((m) => m.id !== id) }));

  const clearAll = () => {
    if (confirm('Очистить таблицу и все результаты? Команды тоже сбросятся.')) {
      localStorage.removeItem('zo-tournament-v2');
      setState(loadState());
    }
  };

  const editing = matches.find((m) => m.id === editingId);

  return (
    <>
      <header className="header">
        <div className="container header__inner">
          <img className="header__logo" src={`${import.meta.env.BASE_URL}logo.jpg`} alt="ФК Зелёная околица" />
          <div>
            <h1 className="header__title">Таблица тренировок</h1>
            <p className="header__sub">Зелёная околица · итоги дня</p>
          </div>
          <button
            type="button"
            className="icon-btn icon-btn--danger header__clear"
            onClick={clearAll}
            title="Очистить всё"
            aria-label="Очистить всё"
          >
            <svg width="18" height="18" viewBox="0 0 23 23" aria-hidden="true">
              <path d="M2 2l19 19M21 2L2 21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <main className="container main">
        <div className="grid">
          <div className="col">
            <section className="card">
              <h2 className="card__title">Ввод результатов матча</h2>
              <MatchForm teams={teams} onAdd={addMatch} />
            </section>
            <section className="card">
              <h2 className="card__title">Команды</h2>
              <TeamsPanel
                teams={teams}
                onAdd={addTeam}
                onRemove={removeTeam}
                onRename={renameTeam}
              />
            </section>
          </div>

          <div className="col">
            <section className="card">
              <h2 className="card__title">Итоговая таблица дня</h2>
              <Standings rows={standings} />
            </section>
          </div>
        </div>

        <section className="card">
          <History
            matches={matches}
            teams={teams}
            onManage={() => setManaging(true)}
          />
        </section>
      </main>

      {managing && (
        <HistoryEditor
          matches={matches}
          teams={teams}
          paused={!!editing}
          onEdit={setEditingId}
          onReorder={reorderMatches}
          onClose={() => setManaging(false)}
        />
      )}

      {editing && (
        <EditModal
          match={editing}
          teams={teams}
          onSave={(patch) => {
            updateMatch(editing.id, patch);
            setEditingId(null);
          }}
          onDelete={() => {
            deleteMatch(editing.id);
            setEditingId(null);
          }}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  );
}
