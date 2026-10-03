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
  const [onlineListOpen, setOnlineListOpen] = useState(false);
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
          <h3>Приглашение на мирового босса</h3>
          {incomingInvites.map((invite) => (
            <div className="boss-incoming-invite" key={invite.id}>
              <p><strong>{invite.name}</strong> зовёт тебя сразиться с мировым боссом.</p>
              <span>ID игрока: <code>{invite.playerId}</code></span>
              <div className="boss-incoming-invite-actions">
                <button className="boss-invite-accept" disabled={activeInviteId !== ''} onClick={() => void respondToInvite(invite, true)} type="button">
                  {activeInviteId === invite.id ? 'Подключаем к боссу…' : 'Присоединиться к боссу'}
                </button>
                <button className="boss-invite-decline" disabled={activeInviteId !== ''} onClick={() => void respondToInvite(invite, false)} type="button">
                  Отказаться
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="boss-dimension-community">
        <button
          aria-controls="world-boss-online-players"
          aria-expanded={onlineListOpen}
          className="boss-online-invite-toggle"
          onClick={() => setOnlineListOpen((open) => !open)}
          type="button"
        >
          <span>{onlineListOpen ? 'Скрыть список игроков онлайн' : 'Показать список игроков для приглашения'}</span>
          <strong>{onlinePlayers.length}</strong>
        </button>
        {onlineListOpen && (
          <div id="world-boss-online-players" className="boss-online-player-list">
            {onlinePlayers.length === 0 ? (
              <p>Сейчас нет других игроков онлайн. Список обновляется автоматически.</p>
            ) : (
              <>
                <p>Выбери онлайн-игрока, которого хочешь позвать на бой.</p>
                {onlinePlayers.map((player) => (
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
              </>
            )}
          </div>
        )}
      </div>
      {error && <p className="boss-dimension-error" role="alert">{error}</p>}
    </>
  );
}
