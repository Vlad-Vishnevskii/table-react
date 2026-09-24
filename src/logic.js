export const DEFAULT_NAMES = [
  'Лимоны',
  'Апельсины',
  'Баклажаны',
  'Яблоки',
  'Груши',
  'Сливы',
  'Вишни',
  'Мандарины',
  'Арбузы',
  'Киви',
  'Бананы',
  'Ананасы',
];

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const initialTeams = () =>
  DEFAULT_NAMES.slice(0, 3).map((name) => ({ id: uid(), name }));

// Имя по умолчанию: первое неиспользованное из списка, иначе «Команда N».
export function nextDefaultName(teams) {
  const used = new Set(teams.map((t) => t.name.toLowerCase()));
  const free = DEFAULT_NAMES.find((n) => !used.has(n.toLowerCase()));
  if (free) return free;
  let n = teams.length + 1;
  while (used.has(`команда ${n}`)) n++;
  return `Команда ${n}`;
}

// Таблица целиком считается из списка матчей — поэтому правка/удаление матча
// автоматически пересчитывает итоги.
export function computeStandings(teams, matches) {
  const rows = new Map(
    teams.map((t) => [
      t.id,
      {
        id: t.id,
        name: t.name,
        points: 0,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        scored: 0,
        conceded: 0,
        diff: 0,
      },
    ]),
  );

  for (const m of matches) {
    const home = rows.get(m.homeId);
    const away = rows.get(m.awayId);
    if (!home || !away) continue;
    home.played++;
    away.played++;
    home.scored += m.homeGoals;
    home.conceded += m.awayGoals;
    away.scored += m.awayGoals;
    away.conceded += m.homeGoals;
    if (m.homeGoals > m.awayGoals) {
      home.points += 3;
      home.wins++;
      away.losses++;
    } else if (m.homeGoals < m.awayGoals) {
      away.points += 3;
      away.wins++;
      home.losses++;
    } else {
      home.points++;
      away.points++;
      home.draws++;
      away.draws++;
    }
  }

  const list = [...rows.values()];
  list.forEach((r) => (r.diff = r.scored - r.conceded));
  // очки → разница голов → забитые → порядок добавления
  return list.sort(
    (a, b) =>
      b.points - a.points || b.diff - a.diff || b.scored - a.scored,
  );
}

export function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem('zo-tournament-v2'));
    if (raw && Array.isArray(raw.teams) && Array.isArray(raw.matches)) {
      return raw;
    }
  } catch {
    /* повреждённые данные — начинаем заново */
  }
  return { teams: initialTeams(), matches: [] };
}

export function saveState(state) {
  try {
    localStorage.setItem('zo-tournament-v2', JSON.stringify(state));
  } catch {
    /* хранилище недоступно */
  }
}
