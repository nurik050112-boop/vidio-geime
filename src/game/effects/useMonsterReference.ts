import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'nearestMonsterRef' | 'nearestMonster'>;

export function useMonsterReference(context: Context): void {
  const { nearestMonsterRef, nearestMonster } = context;
  useEffect(() => {
    nearestMonsterRef.current = nearestMonster;
  }, [nearestMonster]);
}
