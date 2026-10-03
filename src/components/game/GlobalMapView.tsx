import { useEffect, useState } from 'react';
import { formatPower } from '../../game/data/rarityDamage';
import { useGameModel } from '../../game/GameContext';
import { attackWorldBoss, joinWorldBoss, leaveWorldBoss, type WorldBossSnapshot } from '../../lib/worldBoss';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { GameDialog } from '../GameDialog';
import { WorldBossModel } from './WorldBossModel';

type Props = { onClose: () => void };

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Не удалось связаться с сервером мирового босса.';
}

export function GlobalMapView({ onClose }: Props) {
  const { authUser, guestMode, playerId, playerName } = useGameModel();
  const [joinWithPlayerId, setJoinWithPlayerId] = useState('');
  const [snapshot, setSnapshot] = useState<WorldBossSnapshot | null>(null);
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [attackReadyAt, setAttackReadyAt] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!joined || !authUser) return;
    let stopped = false;
    let refreshing = false;
    async function refresh() {
      if (refreshing) return;
      refreshing = true;
      try {
        const next = await joinWorldBoss(playerId, playerName, '');
        if (!stopped) setSnapshot(next);
      } catch (refreshError) {
        if (!stopped) setError(getErrorMessage(refreshError));
      } finally {
        refreshing = false;
      }
    }
    const channel = supabase.channel('world-boss-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'world_boss_state' }, () => { void refresh(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'world_boss_players' }, () => { void refresh(); })
      .subscribe();
    const heartbeat = window.setInterval(() => { void refresh(); }, 5_000);
    const clock = window.setInterval(() => setNow(Date.now()), 250);
    return () => {
      stopped = true;
      window.clearInterval(heartbeat);
      window.clearInterval(clock);
      supabase.removeChannel(channel);
      void leaveWorldBoss().catch((leaveError: unknown) => {
        console.error('Не удалось выйти из измерения мирового босса.', leaveError);
      });
    };
  }, [authUser, joined, playerId, playerName]);

  async function enterWorld() {
    setBusy(true);
    setError('');
    try {
      const next = await joinWorldBoss(playerId, playerName, joinWithPlayerId.trim());
      setSnapshot(next);
      setJoined(true);
    } catch (joinError) {
      setError(getErrorMessage(joinError));
    } finally {
      setBusy(false);
    }
  }

  async function strikeBoss() {
    setBusy(true);
    setError('');
    try {
      const next = await attackWorldBoss();
      setSnapshot(next);
      setAttackReadyAt(Date.now() + 1_000);
    } catch (attackError) {
      setError(getErrorMessage(attackError));
    } finally {
      setBusy(false);
    }
  }

  const healthPercent = snapshot ? Math.max(0, Math.min(100, snapshot.hp / snapshot.maxHp * 100)) : 100;
  const respawnSeconds = snapshot?.respawnAt ? Math.max(0, Math.ceil((Date.parse(snapshot.respawnAt) - now) / 1_000)) : 0;

  return (
    <GameDialog title="Другое измерение" onClose={onClose} className="global-map-dialog">
      <section className="boss-dimension">
        <header className="boss-dimension-header">
          <div>
            <p className="eyebrow">Отдельный онлайн-мир · сервер Supabase</p>
            <h2>Мировой босс</h2>
            <p>Один босс и общая шкала здоровья. Объединяйтесь по ID и сражайтесь до 50 игроков.</p>
          </div>
          <button className="boss-dimension-close" onClick={onClose} type="button">Закрыть <kbd>Esc</kbd></button>
        </header>

        {!isSupabaseConfigured ? (
          <p className="boss-dimension-notice">Для общего измерения нужно настроить Supabase в окружении приложения.</p>
        ) : guestMode || !authUser ? (
          <p className="boss-dimension-notice">Войди в аккаунт, чтобы подключиться к серверу и сражаться вместе с другими игроками.</p>
        ) : !joined ? (
          <div className="boss-dimension-join">
            <p>Сначала один игрок входит без кода. Остальные вводят его ID, чтобы присоединиться к общей битве.</p>
            <label htmlFor="world-boss-player-id">ID игрока в измерении (необязательно)</label>
            <input
              autoComplete="off"
              id="world-boss-player-id"
              maxLength={6}
              onChange={(event) => setJoinWithPlayerId(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="Например, A1B2C3"
              value={joinWithPlayerId}
            />
            <button disabled={busy} onClick={() => void enterWorld()} type="button">{busy ? 'Подключаем…' : 'Войти в измерение'}</button>
          </div>
        ) : (
          <>
            <div className="boss-dimension-arena">
              <WorldBossModel />
              <p className="eyebrow">Единственный противник</p>
              <h3>Древний мировой дракон</h3>
              <p>Его здоровье больше здоровья самого сильного босса обычного мира более чем в 5 раз.</p>
              <div className="boss-health-label">
                <span>Здоровье босса</span>
                <strong>{snapshot ? `${formatPower(snapshot.hp)} / ${formatPower(snapshot.maxHp)}` : 'Синхронизация…'}</strong>
              </div>
              <div className="boss-health-track" role="progressbar" aria-label="Здоровье мирового босса" aria-valuenow={healthPercent} aria-valuemin={0} aria-valuemax={100}>
                <span style={{ width: `${healthPercent}%` }} />
              </div>
              {respawnSeconds > 0 ? (
                <p className="boss-respawn">Босс повержен! Новый появится через {respawnSeconds} сек.</p>
              ) : (
                <button className="boss-attack" disabled={busy || now < attackReadyAt || !snapshot} onClick={() => void strikeBoss()} type="button">
                  {busy ? 'Атака…' : now < attackReadyAt ? 'Подожди секунду' : 'Ударить босса'}
                </button>
              )}
              {snapshot?.damage !== undefined && <p className="boss-last-hit">Урон последнего удара: {formatPower(snapshot.damage)}</p>}
            </div>
            <div className="boss-dimension-team">
              <div><strong>Твой ID: {playerId}</strong><span>{snapshot?.players.length ?? 0} / 50 игроков</span></div>
              <ul>
                {snapshot?.players.map((player) => (
                  <li key={player.playerId}><span>{player.name}</span><code>{player.playerId}</code></li>
                ))}
              </ul>
              <p>Поделись своим ID, чтобы друзья ввели его при входе. Здоровье босса общее для всех.</p>
            </div>
          </>
        )}

        {error && <p className="boss-dimension-error" role="alert">{error}</p>}
        <p className="boss-dimension-hint"><kbd>N</kbd> + <kbd>B</kbd> — открыть или закрыть измерение</p>
      </section>
    </GameDialog>
  );
}
