import { formatPower } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'duelOpponent' | 'duelStatus' | 'attackBonus' | 'weapons' | 'artifactDamageMultiplier' | 'defenseBonus' | 'duelOpponentHp' | 'setBattlePulse' | 'playHeroAnimation' | 'setDuelOpponentHp' | 'setDuelWins' | 'addGold' | 'addWinStreak' | 'setDuelStatus' | 'setMessage' | 'playerName' | 'duelHeroHp' | 'setDuelHeroHp' | 'resetWinStreak'>;

export function runDuelHit(context: Context): void {
  const { duelOpponent, duelStatus, attackBonus, weapons, artifactDamageMultiplier, defenseBonus, duelOpponentHp, setBattlePulse, playHeroAnimation, setDuelOpponentHp, setDuelWins, addGold, addWinStreak, setDuelStatus, setMessage, playerName, duelHeroHp, setDuelHeroHp, resetWinStreak } = context;
    if (!duelOpponent || duelStatus !== 'fighting') return;

    const heroDuelDamage = Math.max(50, Math.floor((attackBonus + 100 + weapons.length * 30) * artifactDamageMultiplier));
    const opponentDuelDamage = Math.max(1, Math.floor(duelOpponent.power / 12 - defenseBonus));
    const nextOpponentHp = Math.max(0, duelOpponentHp - heroDuelDamage);
    setBattlePulse((pulse) => pulse + 1);
    playHeroAnimation('strike', 420);
    setDuelOpponentHp(nextOpponentHp);

    if (nextOpponentHp === 0) {
      const duelReward = Math.min(Number.MAX_SAFE_INTEGER, Math.max(1_000, 1_000 + Math.floor(duelOpponent.power / 10)));
      setDuelWins((wins) => wins + 1);
      addGold(duelReward);
      const streakRewardText = addWinStreak('дуэль выиграна');
      setDuelStatus('won');
      setMessage(`${playerName} победил ${duelOpponent.name} в настоящей дуэли. Награда: ${formatPower(duelReward)} золота. ${streakRewardText}`);
      return;
    }

    const nextHeroDuelHp = Math.max(0, duelHeroHp - opponentDuelDamage);
    setDuelHeroHp(nextHeroDuelHp);
    if (nextHeroDuelHp === 0) {
      setDuelStatus('declined');
      resetWinStreak('поражение в дуэли');
      setMessage(`${duelOpponent.name} победил в дуэли. Можно найти другого игрока.`);
      return;
    }

    setMessage(`${playerName} ударил: -${formatPower(heroDuelDamage)} HP. ${duelOpponent.name} ответил: -${formatPower(opponentDuelDamage)} HP.`);
  
}
