import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setTutorialOpen'>;

export function runCloseTutorial(context: Context): void {
  const { setTutorialOpen } = context;
    setTutorialOpen(false);
  
}
