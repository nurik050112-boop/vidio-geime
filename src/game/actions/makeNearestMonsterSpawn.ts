import { cityHalfSize,monsterSpawnDistanceUnits,type NearestMonsterState } from '../data/adminBoss';
import { isWorldBlockedAt } from '../data/isWorldBlockedAt';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'currentMonsterHp' | 'heroDirection' | 'collisionContextRef' | 'heroPosition' | 'currentMonsters'>;

export function runMakeNearestMonsterSpawn(context: Context, hp: number): NearestMonsterState {
  const { heroDirection, collisionContextRef, heroPosition, currentMonsters } = context;
    const directionLength = Math.max(1, Math.hypot(heroDirection.x, heroDirection.z));
    const forward = {
      x: heroDirection.x / directionLength,
      z: heroDirection.z / directionLength,
    };
    const collisionContext = collisionContextRef.current;
    const baseAngle = Math.atan2(forward.x, forward.z);
    for (let attempt = 0; attempt < 16; attempt += 1) {
      const angle = baseAngle + (attempt % 2 ? -1 : 1) * Math.ceil(attempt / 2) * 0.42;
      const distance = monsterSpawnDistanceUnits + Math.floor(attempt / 4) * 5_000;
      const position = {
        x: Math.max(-cityHalfSize, Math.min(cityHalfSize, heroPosition.x + Math.sin(angle) * distance)),
        z: Math.max(-cityHalfSize, Math.min(cityHalfSize, heroPosition.z + Math.cos(angle) * distance)),
      };
      if (!isWorldBlockedAt(position, collisionContext.chapter, collisionContext.mapLocationIndex, collisionContext.mapSceneKey, 0.74)) {
        return {
          ...position,
          hp,
          alive: currentMonsters > 0,
        };
      }
    }
    return {
      x: heroPosition.x + forward.x * monsterSpawnDistanceUnits,
      z: heroPosition.z + forward.z * monsterSpawnDistanceUnits,
      hp,
      alive: currentMonsters > 0,
    };
  
}
