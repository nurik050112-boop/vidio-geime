import { useEffect } from 'react';
import { browserStorage } from '../../lib/browserStorage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'unlockedAchievements'>;

export function useAchievementStorage(context: Context): void {
  const { unlockedAchievements } = context;
  useEffect(() => {
    browserStorage.setItem('dragon-game-achievements', JSON.stringify(unlockedAchievements));
  }, [unlockedAchievements]);
}
