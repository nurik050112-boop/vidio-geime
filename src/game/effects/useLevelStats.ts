import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setLevelStatMultiplier' | 'expectedLevelStatMultiplier'>;

export function useLevelStats(context: Context): void {
  const { setLevelStatMultiplier, expectedLevelStatMultiplier } = context;
  useEffect(() => {
    setLevelStatMultiplier(expectedLevelStatMultiplier);
  }, [expectedLevelStatMultiplier]);
}
