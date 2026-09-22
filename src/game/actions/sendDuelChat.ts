import { type FormEvent } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'duelOpponent' | 'setMessage' | 'duelChatText' | 'setDuelChatMessages' | 'playerName' | 'playerId' | 'setDuelChatText'>;

export function runSendDuelChat(context: Context, event: FormEvent<HTMLFormElement>): void {
  const { duelOpponent, setMessage, duelChatText, setDuelChatMessages, playerName, playerId, setDuelChatText } = context;
    event.preventDefault();
    if (!duelOpponent) {
      setMessage('Сначала найди игрока по ID или нажми дуэль.');
      return;
    }
    const text = duelChatText.trim();
    if (!text) return;

    setDuelChatMessages((messages) => [
      ...messages,
      { id: `you-${Date.now()}`, from: `${playerName} ID ${playerId}`, text },
    ].slice(-12));
    setDuelChatText('');
  
}
