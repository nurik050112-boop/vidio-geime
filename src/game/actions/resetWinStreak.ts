import { saveWinStreakState } from '../data/getLocalDateKey';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'winStreakState' | 'setWinStreakState' | 'setWinStreakText'>;

export function runResetWinStreak(context: Context, reason: string): void {
  const { winStreakState, setWinStreakState, setWinStreakText } = context;
    if (winStreakState.current === 0) return;
    const nextState = { ...winStreakState, current: 0 };
    setWinStreakState(nextState);
    saveWinStreakState(nextState);
    setWinStreakText(`Винстрик сброшен: ${reason}. Лучший рекорд ${nextState.best}.`);
  
}
