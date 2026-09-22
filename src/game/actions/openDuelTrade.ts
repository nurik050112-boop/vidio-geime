import { readDuelRequests,saveDuelRequests } from '../data/isWorldBlockedAt';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'duelOpponent' | 'setMessage' | 'playerId' | 'playerName' | 'setDuelTradeOpen' | 'setDuelTradeOffer'>;

export function runOpenDuelTrade(context: Context): void {
  const { duelOpponent, setMessage, playerId, playerName, setDuelTradeOpen, setDuelTradeOffer } = context;
    if (!duelOpponent) {
      setMessage('Сначала найди игрока для обмена.');
      return;
    }
    saveDuelRequests([
      ...readDuelRequests().filter((request) => request.id !== `trade-${playerId}-${duelOpponent.id}`),
      {
        id: `trade-${playerId}-${duelOpponent.id}`,
        kind: 'trade',
        fromId: playerId,
        fromName: playerName,
        toId: duelOpponent.id,
        createdAt: Date.now(),
      },
    ]);
    setDuelTradeOpen((open) => !open);
    setDuelTradeOffer(null);
    setMessage(`Игроку ${duelOpponent.name} отправлена надпись: Обмен или нет.`);
  
}
