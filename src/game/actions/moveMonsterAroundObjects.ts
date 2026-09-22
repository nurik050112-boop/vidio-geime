import { cityHalfSize,type NearestMonsterState } from '../data/adminBoss';
import { isWorldBlockedAt } from '../data/isWorldBlockedAt';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'collisionContextRef'>;

export function runMoveMonsterAroundObjects(context: Context, monster: NearestMonsterState, dx: number, dz: number): NearestMonsterState {
  const { collisionContextRef } = context;
    const clampPosition = (nextPosition: { x: number; z: number }) => ({
      x: Math.max(-cityHalfSize, Math.min(cityHalfSize, nextPosition.x)),
      z: Math.max(-cityHalfSize, Math.min(cityHalfSize, nextPosition.z)),
    });
    const collisionContext = collisionContextRef.current;
    const canStand = (position: { x: number; z: number }) =>
      !isWorldBlockedAt(position, collisionContext.chapter, collisionContext.mapLocationIndex, collisionContext.mapSceneKey, 0.48);
    const nextPosition = clampPosition({ x: monster.x + dx, z: monster.z + dz });
    if (canStand(nextPosition)) return { ...monster, ...nextPosition };

    const slideX = clampPosition({ x: monster.x + dx, z: monster.z });
    if (canStand(slideX)) return { ...monster, ...slideX };

    const slideZ = clampPosition({ x: monster.x, z: monster.z + dz });
    if (canStand(slideZ)) return { ...monster, ...slideZ };

    const sidestepLength = Math.max(1, Math.hypot(dx, dz));
    const sideStep = {
      x: monster.x - (dz / sidestepLength) * sidestepLength * 0.75,
      z: monster.z + (dx / sidestepLength) * sidestepLength * 0.75,
    };
    const sidePosition = clampPosition(sideStep);
    if (canStand(sidePosition)) return { ...monster, ...sidePosition };

    const otherSidePosition = clampPosition({
      x: monster.x + (dz / sidestepLength) * sidestepLength * 0.75,
      z: monster.z - (dx / sidestepLength) * sidestepLength * 0.75,
    });
    if (canStand(otherSidePosition)) return { ...monster, ...otherSidePosition };

    return monster;
  
}
