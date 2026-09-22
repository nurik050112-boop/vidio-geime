import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'stopBossMusic'>;

export function useAudioCleanup(context: Context): void {
  const { stopBossMusic } = context;
  useEffect(() => () => {
    stopBossMusic();
    window.speechSynthesis?.cancel();
  }, []);
}
