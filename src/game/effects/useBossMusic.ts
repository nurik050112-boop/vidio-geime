import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'stopBossMusic' | 'playBossMusic' | 'musicKey'>;

export function useBossMusic(context: Context): void {
  const { stopBossMusic, playBossMusic, musicKey } = context;
  useEffect(() => {
    stopBossMusic();
    playBossMusic(musicKey);
    return () => stopBossMusic();
  }, [musicKey]);
}
