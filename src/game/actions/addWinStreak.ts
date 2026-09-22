import { saveWinStreakState } from '../data/getLocalDateKey';
import { createWeapon } from '../data/isDeathSword';
import { formatPower,getWeaponDisplayName } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'winStreakState' | 'chapter' | 'addGold' | 'setWeapons' | 'setEquippedWeapon' | 'setShopLevels' | 'setItems' | 'setHealthLevel' | 'setHeroHp' | 'currentHeroMaxHp' | 'setWinStreakState' | 'setWinStreakText'>;

export function runAddWinStreak(context: Context, reason: string): string {
  const { winStreakState, chapter, addGold, setWeapons, setEquippedWeapon, setShopLevels, setItems, setHealthLevel, setHeroHp, currentHeroMaxHp, setWinStreakState, setWinStreakText } = context;
    const nextCurrent = winStreakState.current + 1;
    const nextState = {
      current: nextCurrent,
      best: Math.max(winStreakState.best, nextCurrent),
      totalWins: winStreakState.totalWins + 1,
    };
    const bonusGold = Math.min(Number.MAX_SAFE_INTEGER, Math.max(100, nextCurrent * nextCurrent * (chapter + 1) * 150));
    addGold(bonusGold);

    let rewardText = `Винстрик x${nextCurrent}: ${reason}. Бонус ${formatPower(bonusGold)} золота.`;
    if (nextCurrent % 10 === 0) {
      const weapon = createWeapon('Легендарка', Math.max(chapter + 2, Math.floor(nextCurrent / 2)));
      setWeapons((currentWeapons) => [...currentWeapons, weapon]);
      setEquippedWeapon(weapon);
      rewardText += ` За серию ${nextCurrent} получено оружие ${getWeaponDisplayName(weapon)}.`;
    } else if (nextCurrent % 5 === 0) {
      setShopLevels((levels) => ({ ...levels, sword: levels.sword + 1, health: levels.health + 1 }));
      setItems((items) => ({ ...items, sword: items.sword + 1, health: items.health + 1 }));
      setHealthLevel((level) => level + 1);
      setHeroHp((hp) => Math.min(currentHeroMaxHp, hp + 250));
      rewardText += ` За серию ${nextCurrent}: +1 урон и +1 здоровье.`;
    }

    setWinStreakState(nextState);
    saveWinStreakState(nextState);
    setWinStreakText(rewardText);
    return rewardText;
  
}
