import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'heroHp' | 'isFinalReveal' | 'isMonsterAvalancheWorld' | 'isFinalSpiritWorld' | 'isFinalSpiritBoss' | 'resetWinStreak' | 'restart' | 'setMessage'>;

export function useHeroRespawn(context: Context): void {
  const { heroHp, isFinalReveal, isMonsterAvalancheWorld, isFinalSpiritWorld, isFinalSpiritBoss, resetWinStreak, restart, setMessage } = context;
  useEffect(() => {
    if (heroHp > 0 || isFinalReveal || isMonsterAvalancheWorld || isFinalSpiritWorld || isFinalSpiritBoss) return;

    const timer = window.setTimeout(() => {
      resetWinStreak('герой погиб');
      restart();
      setMessage('Здоровье героя упало до 0. Игра началась заново.');
    }, 700);
    return () => window.clearTimeout(timer);
  }, [heroHp, isFinalReveal, isMonsterAvalancheWorld, isFinalSpiritWorld, isFinalSpiritBoss]);
}
