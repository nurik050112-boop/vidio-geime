import { useGameModel } from '../../game/GameContext';

import { formatPower } from '../../game/data/rarityDamage';



export function ClickDuelView() {
  const {
    battlePulse, clickDuelHeroPower, clicksPerSecond, clickDuelPower, heroHp,
    strike, clickDuelDragonPower
  } = useGameModel();
  return (<div className={`click-duel ${battlePulse % 2 ? 'hero-hit' : 'dragon-hit'}`} aria-label="Клик битва">
              <div className="click-duel-side hero-side">
                <span className="duel-avatar">Я</span>
                <strong>{formatPower(clickDuelHeroPower)}</strong>
              </div>
              <div className="click-duel-core">
                <div className="click-duel-tip">
                  <span>{clicksPerSecond > 0 ? `${clicksPerSecond}.0/с` : 'Начни кликать'}</span>
                  <b>{clickDuelPower >= 50 ? 'Ты давишь' : 'Дракон давит'}</b>
                </div>
                <div className="click-duel-bar">
                  <span className="hero-fill" style={{ width: `${clickDuelPower}%` }} />
                  <i style={{ left: `${clickDuelPower}%` }} />
                </div>
                <button
                  className="click-duel-button"
                  disabled={heroHp === 0}
                  onClick={(event) => {
                    event.stopPropagation();
                    strike();
                  }}
                  type="button"
                >
                  Нажимайте!
                </button>
              </div>
              <div className="click-duel-side dragon-side">
                <span className="duel-avatar">Д</span>
                <strong>{formatPower(clickDuelDragonPower)}</strong>
              </div>
              <span className="click-slash" />
              <span className="dragon-fire-burst" />
            </div>);
}
