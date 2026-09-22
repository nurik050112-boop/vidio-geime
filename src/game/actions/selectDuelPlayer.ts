import { type DuelPlayer } from '../data/dragonSon';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setDuelTargetId' | 'setDuelOpponent' | 'setDuelTradeOpen' | 'setDuelTradeOffer' | 'setDuelStatus' | 'setDuelChatMessages' | 'setMessage'>;

export function runSelectDuelPlayer(context: Context, player: DuelPlayer): void {
  const { setDuelTargetId, setDuelOpponent, setDuelTradeOpen, setDuelTradeOffer, setDuelStatus, setDuelChatMessages, setMessage } = context;
    setDuelTargetId(player.id);
    setDuelOpponent(player);
    setDuelTradeOpen(false);
    setDuelTradeOffer(null);
    setDuelStatus('challenge');
    setDuelChatMessages([
      { id: `system-${Date.now()}`, from: 'Система', text: `Выбран игрок онлайн: ${player.name} ID ${player.id}.` },
    ]);
    setMessage(`${player.name} выбран из списка онлайн игроков.`);
  
}
