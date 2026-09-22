import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'infiniteGold' | 'setGold' | 'goldMultiplier' | 'artifactGoldMultiplier'>;

export function runAddGold(context: Context, amount: number): void {
  const { infiniteGold, setGold, goldMultiplier, artifactGoldMultiplier } = context;
    if (infiniteGold) return;
    setGold((currentGold) => Math.min(Number.MAX_SAFE_INTEGER, currentGold + amount * goldMultiplier * artifactGoldMultiplier));
  
}
