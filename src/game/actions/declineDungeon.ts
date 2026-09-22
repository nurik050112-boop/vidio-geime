import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'dungeon' | 'setDungeon' | 'setMessage'>;

export function runDeclineDungeon(context: Context): void {
  const { dungeon, setDungeon, setMessage } = context;
    if (!dungeon) return;
    setDungeon({ ...dungeon, entered: false, declined: true });
    setMessage('Герой решил не входить в подземелье. Пещера осталась закрытой.');
  
}
