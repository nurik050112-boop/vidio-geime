import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'heroHp' | 'isFinalSpiritWorld' | 'isFinalSpiritBoss' | 'setHeroHp' | 'currentHeroMaxHp' | 'setMessage'>;

export function useSpiritRespawn(context: Context): void {
  const { heroHp, isFinalSpiritWorld, isFinalSpiritBoss, setHeroHp, currentHeroMaxHp, setMessage } = context;
  useEffect(() => {
    if (heroHp > 0 || (!isFinalSpiritWorld && !isFinalSpiritBoss)) return;

    const timer = window.setTimeout(() => {
      setHeroHp(currentHeroMaxHp);
      setMessage('В подземном мире герой не пропадает. Душа вернула HP, можно спокойно продолжать бой.');
    }, 700);

    return () => window.clearTimeout(timer);
  }, [heroHp, isFinalSpiritWorld, isFinalSpiritBoss, currentHeroMaxHp]);
}
