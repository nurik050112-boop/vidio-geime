import { readDuelRequests,saveDuelRequests } from '../data/isWorldBlockedAt';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'incomingDuelRequest' | 'setIncomingDuelRequest'>;

export function runClearIncomingDuelRequest(context: Context): void {
  const { incomingDuelRequest, setIncomingDuelRequest } = context;
    if (!incomingDuelRequest) return;
    saveDuelRequests(readDuelRequests().filter((request) => request.id !== incomingDuelRequest.id));
    setIncomingDuelRequest(null);
  
}
