import { useEffect, useMemo, useState } from "react";
import {
  computeStandings,
  loadState,
  nextDefaultName,
  saveState,
  uid,
} from "./logic.js";
import TeamsPanel from "./components/TeamsPanel.jsx";
import MatchForm from "./components/MatchForm.jsx";
import Standings from "./components/Standings.jsx";
import History from "./components/History.jsx";
import EditModal from "./components/EditModal.jsx";
import HistoryEditor from "./components/HistoryEditor.jsx";
import Share from "./components/Share.jsx";

export default function App() {
  const [state, setState] = useState(loadState);
  const [editingId, setEditingId] = useState(null);
  const [managing, setManaging] = useState(false);
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "dark",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "light" ? "#eaf0ec" : "#070a09");
    try {
      localStorage.setItem("zo-theme", theme);
    } catch {
      /* хранилище недоступно */
    }
  }, [theme]);
  const { teams, matches } = state;

  useEffect(() => saveState(state), [state]);

  const standings = useMemo(
    () => computeStandings(teams, matches),
    [teams, matches],
  );

  const addTeam = (rawName) => {
    const name = rawName.trim() || nextDefaultName(teams);
    if (teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      return "Команда с таким названием уже есть";
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
      !confirm(
        `У «${team.name}» сыграно матчей: ${count}. Удалить команду вместе с ними?`,
      )
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
    if (confirm("Очистить таблицу и все результаты? Команды тоже сбросятся.")) {
      localStorage.removeItem("zo-tournament-v2");
      setState(loadState());
    }
  };

  const editing = matches.find((m) => m.id === editingId);

  return (
    <>
      <header className="header">
        <div className="container header__inner">
          <img
            className="header__logo"
            src={`${import.meta.env.BASE_URL}logo.jpg`}
            alt="ФК Зелёная околица"
          />
          <div>
            <h1 className="header__title">Таблица тренировок</h1>
            <p className="header__sub">Итоги дня</p>
          </div>
          <div className="header__actions">
            <Share standings={standings} matches={matches} teams={teams} />
            <button
              type="button"
              className="icon-btn theme-toggle"
              onClick={() =>
                setTheme((t) => (t === "light" ? "dark" : "light"))
              }
              title={theme === "light" ? "Тёмная тема" : "Светлая тема"}
              aria-label={
                theme === "light"
                  ? "Включить тёмную тему"
                  : "Включить светлую тему"
              }
            >
              <svg
                className="icon-sun"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
              <svg
                className="icon-moon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
            </button>
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              onClick={clearAll}
              title="Очистить всё"
              aria-label="Очистить всё"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 23 23"
                aria-hidden="true"
              >
                <path
                  d="M2 2l19 19M21 2L2 21"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
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
