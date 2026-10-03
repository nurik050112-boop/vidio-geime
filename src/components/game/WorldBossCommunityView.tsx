import { useEffect, useState } from 'react';
import { listWorldBossInvites, listWorldBossOnlinePlayers, respondWorldBossInvite, sendWorldBossInvite } from '../../lib/worldBoss';
import type { WorldBossInvite, WorldBossOnlinePlayer, WorldBossSnapshot } from '../../lib/worldBoss';

type Props = {
  playerId: string;
  playerName: string;
  onJoined: (snapshot: WorldBossSnapshot) => void;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Не удалось обновить список игроков.';
}

export function WorldBossCommunityView({ playerId, playerName, onJoined }: Props) {
  const [onlinePlayers, setOnlinePlayers] = useState<WorldBossOnlinePlayer[]>([]);
  const [incomingInvites, setIncomingInvites] = useState<WorldBossInvite[]>([]);
  const [sentInvites, setSentInvites] = useState<string[]>([]);
  const [busyPlayerId, setBusyPlayerId] = useState('');
  const [activeInviteId, setActiveInviteId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let stopped = false;
    let loading = false;
    async function refresh() {
      if (loading) return;
      loading = true;
      try {
        const [players, invites] = await Promise.all([
          listWorldBossOnlinePlayers(),
          listWorldBossInvites(),
        ]);
        if (!stopped) {
          setOnlinePlayers(players);
          setIncomingInvites(invites);
          setError('');
        }
      } catch (refreshError) {
        if (!stopped) setError(getErrorMessage(refreshError));
      } finally {
        loading = false;
      }
    }
    void refresh();
    const interval = window.setInterval(() => { void refresh(); }, 5_000);
    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, []);

  async function invitePlayer(player: WorldBossOnlinePlayer) {
    setBusyPlayerId(player.playerId);
    setError('');
    try {
      await sendWorldBossInvite(player.playerId);
      setSentInvites((current) => [...new Set([...current, player.playerId])]);
    } catch (inviteError) {
      setError(getErrorMessage(inviteError));
    } finally {
      setBusyPlayerId('');
    }
  }

  async function respondToInvite(invite: WorldBossInvite, accept: boolean) {
    setActiveInviteId(invite.id);
    setError('');
    try {
      const snapshot = await respondWorldBossInvite(invite.id, accept, playerId, playerName);
      setIncomingInvites((current) => current.filter((entry) => entry.id !== invite.id));
      if (snapshot) onJoined(snapshot);
    } catch (inviteError) {
      setError(getErrorMessage(inviteError));
    } finally {
      setActiveInviteId('');
    }
  }

  return (
    <>
      {incomingInvites.length > 0 && (
        <div className="boss-dimension-community">
          <h3>Приглашения в измерение</h3>
          {incomingInvites.map((invite) => (
            <div className="boss-online-player" key={invite.id}>
              <span><strong>{invite.name}</strong><code>ID {invite.playerId}</code></span>
              <div>
                <button disabled={activeInviteId !== ''} onClick={() => void respondToInvite(invite, true)} type="button">
                  {activeInviteId === invite.id ? 'Подключаем…' : 'Принять'}
                </button>
                <button className="boss-invite-decline" disabled={activeInviteId !== ''} onClick={() => void respondToInvite(invite, false)} type="button">Отклонить</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="boss-dimension-community">
        <h3>Игроки онлайн · {onlinePlayers.length}</h3>
        {onlinePlayers.length === 0 ? (
          <p>Сейчас нет других игроков онлайн. Список обновляется автоматически.</p>
        ) : onlinePlayers.map((player) => (
          <div className="boss-online-player" key={`${player.playerId}-${player.name}`}>
            <span><strong>{player.name}</strong><code>ID {player.playerId}</code></span>
            <button
              disabled={busyPlayerId !== '' || sentInvites.includes(player.playerId)}
              onClick={() => void invitePlayer(player)}
              type="button"
            >
              {busyPlayerId === player.playerId ? 'Отправляем…' : sentInvites.includes(player.playerId) ? 'Приглашено' : 'Пригласить'}
            </button>
          </div>
        ))}
      </div>
      {error && <p className="boss-dimension-error" role="alert">{error}</p>}
    </>
  );
}
