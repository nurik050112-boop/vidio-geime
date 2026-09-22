import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setHeroMana' | 'currentHeroMaxMana'>;

export function useManaRegeneration(context: Context): void {
  const { setHeroMana, currentHeroMaxMana } = context;
  useEffect(() => {
    const manaTimer = window.setInterval(() => {
      setHeroMana((mana) => Math.min(currentHeroMaxMana, mana + 2));
    }, 1000);

    return () => window.clearInterval(manaTimer);
  }, [currentHeroMaxMana]);
}
