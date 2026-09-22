import { type AchievementId } from '../data/dragonSon';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setUnlockedAchievements'>;

export function runUnlockAchievement(context: Context, id: AchievementId): void {
  const { setUnlockedAchievements } = context;
    setUnlockedAchievements((current) => current.includes(id) ? current : [...current, id]);
  
}
