import { useEffect } from 'react';
import { getLocalDateKey,getYesterdayDateKey,readDailyRewardState,saveDailyRewardState } from '../data/getLocalDateKey';
import { type DailyRewardState } from '../data/isWorldBlockedAt';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'saveReady' | 'dailyRewardCheckedRef' | 'setDailyRewardState' | 'setDailyRewardText' | 'grantDailyReward' | 'setMessage'>;

export function useDailyReward(context: Context): void {
  const { saveReady, dailyRewardCheckedRef, setDailyRewardState, setDailyRewardText, grantDailyReward, setMessage } = context;
  useEffect(() => {
    if (!saveReady || dailyRewardCheckedRef.current) return;
    dailyRewardCheckedRef.current = true;

    const today = getLocalDateKey();
    const saved = readDailyRewardState();
    if (saved.lastRewardDate === today) {
      setDailyRewardState(saved);
      setDailyRewardText(`Сегодня награда уже получена. Рекорд дней: ${saved.bestStreak}.`);
      return;
    }

    const nextStreak = saved.lastVisitDate === getYesterdayDateKey() ? saved.streak + 1 : 1;
    const nextState: DailyRewardState = {
      lastVisitDate: today,
      lastRewardDate: today,
      streak: nextStreak,
      bestStreak: Math.max(saved.bestStreak, nextStreak),
    };
    saveDailyRewardState(nextState);
    setDailyRewardState(nextState);

    const rewardText = grantDailyReward(nextStreak);
    setDailyRewardText(`${rewardText} Рекорд дней: ${nextState.bestStreak}.`);
    setMessage(`${rewardText} Заходи завтра, чтобы получить следующую награду.`);
  }, [saveReady]);
}
