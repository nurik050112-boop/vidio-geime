import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'gameActiveRef' | 'currentMonsters' | 'fightMonster' | 'strike' | 'heroHp' | 'heroPosition' | 'enemyHp' | 'equippedWeapon' | 'equippedArtifactId' | 'items' | 'shopLevels'>;

export function useKeyboardAttack(context: Context): void {
  const { gameActiveRef, currentMonsters, fightMonster, strike, heroHp, heroPosition, enemyHp, equippedWeapon, equippedArtifactId, items, shopLevels } = context;
  useEffect(() => {
    function onAttackKey(event: KeyboardEvent) {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (!gameActiveRef.current || event.repeat || isTyping || event.code !== 'KeyF') return;
      event.preventDefault();
      if (currentMonsters > 0) fightMonster();
      else strike();
    }

    window.addEventListener('keydown', onAttackKey);
    return () => window.removeEventListener('keydown', onAttackKey);
  }, [currentMonsters, heroHp, heroPosition, enemyHp, equippedWeapon, equippedArtifactId, items, shopLevels]);
}
