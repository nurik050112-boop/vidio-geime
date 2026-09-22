import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setMonsterAttackCount' | 'monsterChaseStartedAt' | 'setNearestMonster' | 'currentMonsters' | 'makeNearestMonsterSpawn' | 'currentMonsterHp' | 'nearestMonsterRef' | 'chapter'>;

export function useMonsterSpawn(context: Context): void {
  const { setMonsterAttackCount, monsterChaseStartedAt, setNearestMonster, currentMonsters, makeNearestMonsterSpawn, currentMonsterHp, nearestMonsterRef, chapter } = context;
  useEffect(() => {
    setMonsterAttackCount(0);
    monsterChaseStartedAt.current = Date.now();
    setNearestMonster(currentMonsters > 0 ? makeNearestMonsterSpawn(currentMonsterHp) : { ...nearestMonsterRef.current, hp: 0, alive: false });
  }, [chapter, currentMonsters]);
}
