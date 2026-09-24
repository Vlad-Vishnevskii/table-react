import { forwardRef } from 'react';

export default forwardRef(function MatchRow({ match: m, names, children, className = '', ...rest }, ref) {
  const homeWin = m.homeGoals > m.awayGoals;
  const awayWin = m.homeGoals < m.awayGoals;
  return (
    <li className={`game${children ? ' game--editable' : ''} ${className}`.trim()} ref={ref} {...rest}>
      <span className={`game__team game__team--home${homeWin ? ' is-win' : ''}`}>
        {names[m.homeId]}
      </span>
      <span className="game__score">
        {m.homeGoals}<i>:</i>{m.awayGoals}
      </span>
      <span className={`game__team game__team--away${awayWin ? ' is-win' : ''}`}>
        {names[m.awayId]}
      </span>
      {children}
    </li>
  );
});
