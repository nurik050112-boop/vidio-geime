import { useGameModel } from '../../game/GameContext';

import { Link } from 'wouter';
import { formatPower } from '../../game/data/rarityDamage';



export function QuickHudView() {
  const {
    playerName, playerLevel, playerLevelState, playerLevelProgress, heroHealthText,
    heroHealthPercent, heroMana, currentHeroMaxMana, infiniteGold, gold,
    enemy, currentMonsters, currentEnemyHealthText, setQuestPanelOpen, setInventoryPanelOpen,
    claimMagicStaffs, setTutorialOpen, strike, heroHp, isFinalSpiritBoss
  } = useGameModel();
  return (<div className="quick-hud compact-game-hud" aria-label="Быстрое состояние игры">
          <div className="hud-player-card">
            <strong><span className="admin-nick">{playerName}</span></strong>
            <span>
              Ур. {playerLevel} · {formatPower(playerLevelState.killsOnLevel)} / {formatPower(playerLevelState.killsNeeded)} врагов
            </span>
            <i><b style={{ width: `${playerLevelProgress}%` }} /></i>
          </div>
          <div className="hud-bars">
            <span>HP {heroHealthText}</span>
            <i className="hud-hp"><b style={{ width: `${heroHealthPercent}%` }} /></i>
            <span>MP {Math.floor(heroMana)} / {currentHeroMaxMana}</span>
            <i className="hud-mana"><b style={{ width: `${Math.max(0, Math.min(100, (heroMana / currentHeroMaxMana) * 100))}%` }} /></i>
          </div>
          <div className="hud-money">
            <strong>{infiniteGold ? '∞' : formatPower(gold)}</strong>
            <span>деньги</span>
          </div>
          <div className="hud-target">
            <strong>{enemy.city}</strong>
            <span>{currentMonsters > 0 ? `${formatPower(currentMonsters)} монстров` : currentEnemyHealthText}</span>
          </div>
          <div className="hud-actions-mini">
            <Link className="hud-icon-button" href="/world" aria-label="Мир">Мир</Link>
            <button onClick={() => setQuestPanelOpen(true)} type="button">Квесты</button>
            <button onClick={() => setInventoryPanelOpen(true)} type="button">Сумка</button>
            <button onClick={() => {
              claimMagicStaffs();
              setInventoryPanelOpen(true);
            }} type="button">Магия</button>
            <Link className="hud-icon-button" href="/achievements">Награды</Link>
            <button onClick={() => setTutorialOpen(true)} type="button">Гайд</button>
            {currentMonsters === 0 && (
              <button onClick={strike} disabled={heroHp === 0} type="button">{isFinalSpiritBoss ? 'Души' : 'Босс'}</button>
            )}
          </div>
        </div>);
}
