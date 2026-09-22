import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'isClickDuelActive' | 'setClickDuelPower' | 'setClicksPerSecond' | 'clickTimesRef' | 'gameActiveRef' | 'enemy'>;

export function useClickDuel(context: Context): void {
  const { isClickDuelActive, setClickDuelPower, setClicksPerSecond, clickTimesRef, gameActiveRef, enemy } = context;
  useEffect(() => {
    if (!isClickDuelActive) {
      setClickDuelPower(50);
      setClicksPerSecond(0);
      clickTimesRef.current = [];
      return;
    }

    const duelTimer = window.setInterval(() => {
      if (!gameActiveRef.current) return;
      const now = Date.now();
      clickTimesRef.current = clickTimesRef.current.filter((time) => now - time < 1000);
      setClicksPerSecond(clickTimesRef.current.length);
      setClickDuelPower((power) => Math.max(0, power - Math.max(0.18, (enemy?.attackSpeed ?? 1) * 0.42)));
    }, 180);

    return () => window.clearInterval(duelTimer);
  }, [isClickDuelActive, enemy?.attackSpeed]);
}
