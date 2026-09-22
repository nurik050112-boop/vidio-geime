import { useGameModel } from '../../game/GameContext';

import { formatPower } from '../../game/data/rarityDamage';



export function PanelView2() {
  const {
    playerName, duelOpponent, battlePulse, duelHeroHp, currentHeroMaxHp,
    defenseBonus, attackBonus, duelOpponentHp, duelHit, openDuelTrade,
    declineDuel
  } = useGameModel();
  if (!duelOpponent) return null;
  return (<>
                <h2>Дуэль началась</h2>
                <p><span className="admin-nick">{playerName}</span> сражается против {duelOpponent.name}.</p>
                <div className="duel-arena" aria-hidden="true">
                  <span className={`arena-fighter hero-side ${battlePulse % 2 ? 'strike' : ''}`} />
                  <span className="arena-magic" />
                  <span className={`arena-fighter opponent-side ${battlePulse % 2 ? '' : 'strike'}`} />
                </div>
                <div className="duel-fighters">
                  <div>
                    <strong className="admin-nick">{playerName}</strong>
                    <div className="bar"><span style={{ width: `${Math.max(0, Math.min(100, (duelHeroHp / Math.max(1, currentHeroMaxHp + defenseBonus + attackBonus)) * 100))}%` }} /></div>
                    <small>HP {formatPower(duelHeroHp)}</small>
                  </div>
                  <div>
                    <strong>{duelOpponent.name}</strong>
                    <div className="bar enemy"><span style={{ width: `${Math.max(0, Math.min(100, (duelOpponentHp / Math.max(1, duelOpponent.power * 4)) * 100))}%` }} /></div>
                    <small>HP {formatPower(duelOpponentHp)}</small>
                  </div>
                </div>
                <div className="duel-clash"><span /><span /></div>
                <div className="duel-actions">
                  <button onClick={duelHit} type="button">Удар</button>
                  <button className="secondary" onClick={openDuelTrade} type="button">Обмен</button>
                  <button className="secondary" onClick={declineDuel} type="button">Выйти</button>
                </div>
              </>);
}
