import { useEffect } from 'react';
import { browserStorage } from '../../lib/browserStorage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'allAchievementsUnlocked' | 'creatorCreditsOpen' | 'setCreatorCreditsOpen'>;

export function useCreatorCredits(context: Context): void {
  const { allAchievementsUnlocked, creatorCreditsOpen, setCreatorCreditsOpen } = context;
  useEffect(() => {
    if (!allAchievementsUnlocked || creatorCreditsOpen) return;
    if (browserStorage.getItem('dragon-game-creator-credits-seen') === 'yes') return;
    browserStorage.setItem('dragon-game-creator-credits-seen', 'yes');
    setCreatorCreditsOpen(true);
  }, [allAchievementsUnlocked, creatorCreditsOpen]);
}
