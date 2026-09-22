import { useEffect } from 'react';
import { browserStorage } from '../../lib/browserStorage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'playerName'>;

export function useNickname(context: Context): void {
  const { playerName } = context;
  useEffect(() => {
    browserStorage.setItem('hero-nickname', playerName);
  }, [playerName]);
}
