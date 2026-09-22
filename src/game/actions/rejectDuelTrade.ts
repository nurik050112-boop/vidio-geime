import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setDuelTradeOffer' | 'setDuelTradeOpen' | 'setMessage'>;

export function runRejectDuelTrade(context: Context): void {
  const { setDuelTradeOffer, setDuelTradeOpen, setMessage } = context;
    setDuelTradeOffer(null);
    setDuelTradeOpen(false);
    setMessage('Обмен отвергнут.');
  
}
