import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'forcedCenterLocation' | 'setMapLocationIndex'>;

export function useForcedLocation(context: Context): void {
  const { forcedCenterLocation, setMapLocationIndex } = context;
  useEffect(() => {
    if (forcedCenterLocation) setMapLocationIndex(1);
  }, [forcedCenterLocation]);
}
