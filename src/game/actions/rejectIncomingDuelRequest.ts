import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'incomingDuelRequest' | 'clearIncomingDuelRequest' | 'setMessage'>;

export function runRejectIncomingDuelRequest(context: Context): void {
  const { incomingDuelRequest, clearIncomingDuelRequest, setMessage } = context;
    if (!incomingDuelRequest) return;
    const kindText = incomingDuelRequest.kind === 'trade' ? 'обмен' : 'дуэль';
    const fromName = incomingDuelRequest.fromName;
    clearIncomingDuelRequest();
    setMessage(`${kindText} от ${fromName} отвергнут.`);
  
}
