import { formatPower } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'dungeon' | 'setDungeon' | 'setMessage' | 'navigate'>;

export function runEnterDungeon(context: Context): void {
  const { dungeon, setDungeon, setMessage, navigate } = context;
    if (!dungeon || dungeon.cleared) return;
    setDungeon({ ...dungeon, entered: true });
    setMessage(`Ты вошел в пещеру под городом ${dungeon.city}. Внутри ${formatPower(dungeon.enemiesLeft)} врагов.`);
    navigate('/game');
  
}
