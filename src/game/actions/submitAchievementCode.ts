import { type FormEvent } from 'react';
import { achievements } from '../data/getLocalDateKey';
import { normalizeCode } from '../data/isDeathSword';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'achievementCode' | 'setUnlockedAchievements' | 'setAchievementCheatActive' | 'setAchievementCode' | 'setAchievementMessage'>;

export function runSubmitAchievementCode(context: Context, event: FormEvent<HTMLFormElement>): void {
  const { achievementCode, setUnlockedAchievements, setAchievementCheatActive, setAchievementCode, setAchievementMessage } = context;
    event.preventDefault();
    const code = normalizeCode(achievementCode);

    if (code === '0009000ddd') {
      setUnlockedAchievements(achievements.map((achievement) => achievement.id));
      setAchievementCheatActive(true);
      setAchievementCode('');
      setAchievementMessage('Все достижения и телепорты открыты.');
      return;
    }

    if (code !== '98981n') {
      setAchievementCode('');
      setAchievementMessage('Код не подошел.');
      return;
    }

    setAchievementCheatActive(true);
    setAchievementCode('');
    setAchievementMessage('Код принят. Теперь нажимай на достижения, чтобы открыть их.');
  
}
