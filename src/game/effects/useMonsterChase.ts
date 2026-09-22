import { useEffect, useRef } from 'react';
import { meleeRangeUnits,monsterAggroDistanceUnits,monsterRunSpeedPerSecond } from '../data/adminBoss';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setNearestMonster' | 'gameActiveRef' | 'currentMonsters' | 'heroHp' | 'isFinalReveal' | 'heroPosition' | 'moveMonsterAroundObjects'>;

export function useMonsterChase(context: Context): void {
  const latest = useRef(context);
  latest.current = context;
  useEffect(() => {
    const chaseTimer = window.setInterval(() => {
      const { setNearestMonster, gameActiveRef, currentMonsters, heroHp, isFinalReveal, heroPosition, moveMonsterAroundObjects } = latest.current;
      setNearestMonster((monster) => {
        if (!gameActiveRef.current || !monster.alive || currentMonsters <= 0 || heroHp <= 0 || isFinalReveal) return monster;
        const dx = heroPosition.x - monster.x;
        const dz = heroPosition.z - monster.z;
        const distance = Math.hypot(dx, dz);
        const stopDistance = meleeRangeUnits * 0.92;
        if (distance > monsterAggroDistanceUnits || distance <= stopDistance) return monster;
        const step = Math.min(distance - stopDistance, monsterRunSpeedPerSecond * 0.04);
        const length = Math.max(1, distance);
        return moveMonsterAroundObjects(monster, (dx / length) * step, (dz / length) * step);
      });
    }, 40);

    return () => window.clearInterval(chaseTimer);
  }, []);
}
