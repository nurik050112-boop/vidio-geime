import { formatPower } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'dungeon' | 'setDungeon' | 'setMessage'>;

export function runExitDungeon(context: Context): void {
  const { dungeon, setDungeon, setMessage } = context;
    if (!dungeon) return;
    setDungeon({ ...dungeon, entered: false });
    setMessage(`Ты вышел из пещеры. Внутри осталось ${formatPower(dungeon.enemiesLeft)} врагов.`);
  
}
