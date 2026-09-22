import { type AchievementId } from '../data/dragonSon';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'achievementCheatActive' | 'unlockAchievement' | 'setAchievementMessage'>;

export function runCompleteAchievement(context: Context, id: AchievementId): void {
  const { achievementCheatActive, unlockAchievement, setAchievementMessage } = context;
    if (!achievementCheatActive) return;
    unlockAchievement(id);
    setAchievementMessage('Достижение открыто.');
  
}
