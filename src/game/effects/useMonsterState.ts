import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'monsterBotRef' | 'chapter' | 'currentMonsters' | 'currentMonsterTotal' | 'defenseBonus' | 'hasAdminHelmet' | 'heroHp' | 'heroPosition' | 'isFinalReveal' | 'nearestMonsterInAggro' | 'nearestMonsterInPressure' | 'nearestMonsterInRange'>;

export function useMonsterState(context: Context): void {
  const { monsterBotRef, chapter, currentMonsters, currentMonsterTotal, defenseBonus, hasAdminHelmet, heroHp, heroPosition, isFinalReveal, nearestMonsterInAggro, nearestMonsterInPressure, nearestMonsterInRange } = context;
  useEffect(() => {
    monsterBotRef.current = {
      chapter,
      currentMonsters,
      currentMonsterTotal,
      defenseBonus,
      hasAdminHelmet,
      heroHp,
      heroPosition,
      isFinalReveal,
      nearestMonsterInAggro,
      nearestMonsterInPressure,
      nearestMonsterInRange,
    };
  }, [chapter, currentMonsters, currentMonsterTotal, defenseBonus, hasAdminHelmet, heroHp, heroPosition, isFinalReveal, nearestMonsterInAggro, nearestMonsterInPressure, nearestMonsterInRange]);
}
