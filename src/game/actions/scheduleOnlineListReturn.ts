import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'onlinePlayerScrollTimer' | 'onlinePlayerListRef'>;

export function runScheduleOnlineListReturn(context: Context): void {
  const { onlinePlayerScrollTimer, onlinePlayerListRef } = context;
    if (onlinePlayerScrollTimer.current) {
      window.clearTimeout(onlinePlayerScrollTimer.current);
    }
    onlinePlayerScrollTimer.current = window.setTimeout(() => {
      onlinePlayerListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1600);
  
}
