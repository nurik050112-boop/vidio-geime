import { useEffect } from 'react';
import { duelRequestsStorageKey,readDuelRequests,saveDuelRequests } from '../data/isWorldBlockedAt';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setIncomingDuelRequest' | 'playerId'>;

export function useDuelRequests(context: Context): void {
  const { setIncomingDuelRequest, playerId } = context;
  useEffect(() => {
    const refreshDuelRequests = () => {
      const requests = readDuelRequests();
      saveDuelRequests(requests);
      setIncomingDuelRequest(requests.find((request) => request.toId === playerId && request.fromId !== playerId) ?? null);
    };

    refreshDuelRequests();
    const interval = window.setInterval(refreshDuelRequests, 1_500);
    const onStorage = (event: StorageEvent) => {
      if (event.key === duelRequestsStorageKey) refreshDuelRequests();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', onStorage);
    };
  }, [playerId]);
}
