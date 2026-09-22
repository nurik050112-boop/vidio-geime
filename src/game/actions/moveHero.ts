import { cityHalfSize } from '../data/adminBoss';
import { isWorldBlockedAt } from '../data/isWorldBlockedAt';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setHeroPosition' | 'collisionContextRef'>;

export function runMoveHero(context: Context, dx: number, dz: number): void {
  const { setHeroPosition, collisionContextRef } = context;
    setHeroPosition((position) => {
      const clampPosition = (nextPosition: { x: number; z: number }) => ({
        x: Math.max(-cityHalfSize, Math.min(cityHalfSize, nextPosition.x)),
        z: Math.max(-cityHalfSize, Math.min(cityHalfSize, nextPosition.z)),
      });
      const collisionContext = collisionContextRef.current;
      const nextPosition = clampPosition({ x: position.x + dx, z: position.z + dz });
      const isCurrentPositionBlocked = isWorldBlockedAt(position, collisionContext.chapter, collisionContext.mapLocationIndex, collisionContext.mapSceneKey, 0.52);
      if (isCurrentPositionBlocked || !isWorldBlockedAt(nextPosition, collisionContext.chapter, collisionContext.mapLocationIndex, collisionContext.mapSceneKey, 0.42)) return nextPosition;

      const slideX = clampPosition({ x: position.x + dx, z: position.z });
      if (!isWorldBlockedAt(slideX, collisionContext.chapter, collisionContext.mapLocationIndex, collisionContext.mapSceneKey, 0.42)) return slideX;

      const slideZ = clampPosition({ x: position.x, z: position.z + dz });
      if (!isWorldBlockedAt(slideZ, collisionContext.chapter, collisionContext.mapLocationIndex, collisionContext.mapSceneKey, 0.42)) return slideZ;

      return position;
    });
  
}
