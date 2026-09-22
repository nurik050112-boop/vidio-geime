import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setHeroMana' | 'currentHeroMaxMana'>;

export function useManaLimit(context: Context): void {
  const { setHeroMana, currentHeroMaxMana } = context;
  useEffect(() => {
    setHeroMana((mana) => Math.min(currentHeroMaxMana, mana));
  }, [currentHeroMaxMana]);
}
