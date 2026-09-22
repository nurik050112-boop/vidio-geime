import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'gameActiveRef' | 'blockNextStageClick' | 'currentMonsters' | 'fightMonster' | 'strike'>;

export function runAttackFromStageClick(context: Context): void {
  const { gameActiveRef, blockNextStageClick, currentMonsters, fightMonster, strike } = context;
    if (!gameActiveRef.current) return;
    if (blockNextStageClick.current) {
      blockNextStageClick.current = false;
      return;
    }
    if (currentMonsters > 0) fightMonster();
    else strike();
  
}
