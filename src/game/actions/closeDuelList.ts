import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setDuelStatus' | 'setDuelOpponent' | 'setDuelTradeOpen' | 'setDuelTradeOffer' | 'setDuelChatMessages' | 'setDuelChatText' | 'setMessage'>;

export function runCloseDuelList(context: Context): void {
  const { setDuelStatus, setDuelOpponent, setDuelTradeOpen, setDuelTradeOffer, setDuelChatMessages, setDuelChatText, setMessage } = context;
    setDuelStatus('idle');
    setDuelOpponent(null);
    setDuelTradeOpen(false);
    setDuelTradeOffer(null);
    setDuelChatMessages([]);
    setDuelChatText('');
    setMessage('Список игроков закрыт. Можно играть дальше.');
  
}
