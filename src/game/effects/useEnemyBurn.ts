import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'enemyBurning' | 'isFinalReveal' | 'currentMonsters' | 'enemyHp' | 'gameActiveRef' | 'setEnemyHp' | 'currentDragonHp' | 'setEnemyBurning' | 'clearCity'>;

export function useEnemyBurn(context: Context): void {
  const { enemyBurning, isFinalReveal, currentMonsters, enemyHp, gameActiveRef, setEnemyHp, currentDragonHp, setEnemyBurning, clearCity } = context;
  useEffect(() => {
    if (!enemyBurning || isFinalReveal || currentMonsters > 0 || enemyHp <= 0) return;

    const burnTimer = window.setInterval(() => {
      if (!gameActiveRef.current) return;
      setEnemyHp((hp) => {
        const burnDamage = Math.max(1, Math.floor(currentDragonHp * 0.1));
        const nextHp = Math.max(0, hp - burnDamage);
        if (nextHp === 0) {
          window.clearInterval(burnTimer);
          setEnemyBurning(false);
          window.setTimeout(() => clearCity(), 0);
        }
        return nextHp;
      });
    }, 1000);

    return () => window.clearInterval(burnTimer);
  }, [enemyBurning, isFinalReveal, currentMonsters, enemyHp, currentDragonHp]);
}
