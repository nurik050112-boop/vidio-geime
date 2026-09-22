import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'duelStatus' | 'onlinePlayers' | 'duelWins' | 'chapter' | 'weapons' | 'armors' | 'setDuelOpponent' | 'setDuelChatMessages' | 'setDuelStatus' | 'setMessage'>;

export function useDuelSearch(context: Context): void {
  const { duelStatus, onlinePlayers, duelWins, chapter, weapons, armors, setDuelOpponent, setDuelChatMessages, setDuelStatus, setMessage } = context;
  useEffect(() => {
    if (duelStatus !== 'searching') return;
    if (onlinePlayers.length === 0) return;

    const searchTimer = window.setTimeout(() => {
      const player = onlinePlayers[(duelWins + chapter + weapons.length + armors.length) % onlinePlayers.length];
      setDuelOpponent(player);
      setDuelChatMessages([
        { id: `system-${Date.now()}`, from: 'Система', text: `Найден игрок ${player.name} ID ${player.id}.` },
      ]);
      setDuelStatus('challenge');
      setMessage(`${player.name} найден в сети. ID ${player.id}. Он кинул вызов на дуэль.`);
    }, 1100);

    return () => window.clearTimeout(searchTimer);
  }, [armors.length, chapter, duelStatus, duelWins, onlinePlayers, weapons.length]);
}
