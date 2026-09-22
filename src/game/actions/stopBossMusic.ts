import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'bossMusicStopRef'>;

export function runStopBossMusic(context: Context): void {
  const { bossMusicStopRef } = context;
    bossMusicStopRef.current?.();
    bossMusicStopRef.current = null;
  
}
