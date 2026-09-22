import { normalizePlayerId,readDuelRequests,saveDuelRequests } from '../data/isWorldBlockedAt';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'duelStatus' | 'duelTargetId' | 'setDuelTargetId' | 'playerId' | 'setMessage' | 'onlinePlayers' | 'setDuelStatus' | 'setDuelOpponent' | 'setDuelChatMessages' | 'playerName'>;

export function runStartDuelSearch(context: Context): void {
  const { duelStatus, duelTargetId, setDuelTargetId, playerId, setMessage, onlinePlayers, setDuelStatus, setDuelOpponent, setDuelChatMessages, playerName } = context;
    if (duelStatus === 'searching' || duelStatus === 'challenge' || duelStatus === 'fighting') return;
    const requestedId = normalizePlayerId(duelTargetId);
    setDuelTargetId(requestedId);
    if (requestedId === playerId) {
      setMessage('Это твой ID. Впиши ID другого игрока, чтобы вызвать его.');
      return;
    }
    const requestedPlayer = requestedId ? onlinePlayers.find((player) => player.id === requestedId) : null;
    if (requestedId && !requestedPlayer) {
      setMessage(`Игрок с ID ${requestedId} не найден онлайн. Если список пустой, реальных игроков в сети сейчас нет.`);
      return;
    }
    if (!requestedId && onlinePlayers.length === 0) {
      setMessage('Реальных игроков онлайн сейчас нет. Список пустой.');
      setDuelStatus('searching');
      return;
    }
    setDuelOpponent(null);
    setDuelChatMessages([]);
    setDuelStatus('searching');
    if (requestedPlayer) {
      saveDuelRequests([
        ...readDuelRequests().filter((request) => request.id !== `fight-${playerId}-${requestedPlayer.id}`),
        {
          id: `fight-${playerId}-${requestedPlayer.id}`,
          kind: 'fight',
          fromId: playerId,
          fromName: playerName,
          toId: requestedPlayer.id,
          createdAt: Date.now(),
        },
      ]);
      setDuelOpponent(requestedPlayer);
      setDuelChatMessages([
        { id: `system-${Date.now()}`, from: 'Система', text: `Чат открыт: ${playerName} ID ${playerId} и ${requestedPlayer.name} ID ${requestedPlayer.id}.` },
      ]);
      setDuelStatus('challenge');
      setMessage(`${playerName} вызвал игрока ${requestedPlayer.name} по ID ${requestedPlayer.id}. У него появятся кнопки Принять / Отвергнуть.`);
      return;
    }
    setMessage(`${playerName} ищет игроков в сети для дуэли...`);
  
}
