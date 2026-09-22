import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setDuelStatus' | 'setDuelTradeOpen' | 'setDuelTradeOffer' | 'setMessage'>;

export function runDeclineDuel(context: Context): void {
  const { setDuelStatus, setDuelTradeOpen, setDuelTradeOffer, setMessage } = context;
    setDuelStatus('declined');
    setDuelTradeOpen(false);
    setDuelTradeOffer(null);
    setMessage('Ты отказался от дуэли. Вызов закрыт.');
  
}
