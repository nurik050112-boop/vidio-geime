import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'collisionContextRef' | 'chapter' | 'mapLocationIndex' | 'mapSceneKey'>;

export function useCollisionContext(context: Context): void {
  const { collisionContextRef, chapter, mapLocationIndex, mapSceneKey } = context;
  useEffect(() => {
    collisionContextRef.current = { chapter, mapLocationIndex, mapSceneKey };
  }, [chapter, mapLocationIndex, mapSceneKey]);
}
