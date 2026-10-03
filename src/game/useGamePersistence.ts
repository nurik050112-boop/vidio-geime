import { useEffect, useRef, useState } from 'react';
import { browserStorage } from '../lib/browserStorage';
import { loadCloudSave, writeCloudSave } from '../lib/gameSaves';
import { isSupabaseConfigured } from '../lib/supabase';
import type { GameSaveState } from './data/gameSaveState';

type Options = {
  userId?: string;
  storageKey: string;
  initialSave: Partial<GameSaveState> | null;
  save: GameSaveState;
  applySave: (save: Partial<GameSaveState>) => void;
};

function getSaveFingerprint(save: Partial<GameSaveState>): string {
  const entries = Object.entries(save)
    .filter(([key]) => key !== 'savedAt')
    .sort(([left], [right]) => left.localeCompare(right));
  return JSON.stringify(entries);
}

export function useGamePersistence({ userId, storageKey, initialSave, save, applySave }: Options) {
  const [ready, setReady] = useState(!userId || !isSupabaseConfigured);
  const [status, setStatus] = useState('Загрузка сохранения…');
  const latest = useRef({ ...save, savedAt: initialSave?.savedAt ?? 0 });
  const latestFingerprint = useRef(getSaveFingerprint(save));
  const apply = useRef(applySave);
  const cloudReady = useRef(false);
  const remoteFingerprint = useRef<string | null>(null);
  const localFingerprint = useRef<string | null>(null);
  const saving = useRef(false);
  apply.current = applySave;

  useEffect(() => {
    if (!ready) return;
    const fingerprint = getSaveFingerprint(save);
    if (fingerprint === latestFingerprint.current) return;
    latest.current = { ...save, savedAt: Date.now() };
    latestFingerprint.current = fingerprint;
  }, [ready, save]);

  useEffect(() => {
    if (!ready) return;
    let disposed = false;
    const flushLocal = () => {
      const fingerprint = latestFingerprint.current;
      if (localFingerprint.current === fingerprint) return;
      if (browserStorage.setItem(storageKey, JSON.stringify(latest.current))) {
        localFingerprint.current = fingerprint;
        if (!disposed) {
          setStatus(userId && !cloudReady.current
            ? 'Облако недоступно · сохранено на устройстве'
            : userId && remoteFingerprint.current === fingerprint
              ? 'Сохранено в Supabase'
              : userId ? 'Сохранено на устройстве · синхронизация…' : 'Сохранено на устройстве');
        }
      } else if (!disposed) {
        setStatus('Не удалось сохранить: проверь свободное место в браузере');
      }
    };
    const onHide = () => flushLocal();
    const localTimer = window.setInterval(flushLocal, 750);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flushLocal);
    return () => {
      disposed = true;
      flushLocal();
      window.clearInterval(localTimer);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flushLocal);
    };
  }, [ready, storageKey, userId]);

  useEffect(() => {
    if (!userId || !isSupabaseConfigured) {
      cloudReady.current = false;
      if (!latest.current.savedAt) latest.current = { ...latest.current, savedAt: Date.now() };
      setReady(true);
      return;
    }

    let disposed = false;
    let loadingCloud = false;
    let initialLoadFinished = false;
    setReady(false);
    cloudReady.current = false;
    remoteFingerprint.current = null;

    const synchronizeCloud = async () => {
      if (disposed || loadingCloud || saving.current) return;
      loadingCloud = true;
      try {
        const remote = await loadCloudSave(userId);
        if (disposed) return;
        cloudReady.current = true;
        remoteFingerprint.current = remote ? getSaveFingerprint(remote) : null;

        if (remote && (remote.savedAt ?? 0) > latest.current.savedAt) {
          if (getSaveFingerprint(remote) === latestFingerprint.current) {
            latest.current = { ...latest.current, savedAt: remote.savedAt ?? latest.current.savedAt };
          } else {
            latest.current = { ...latest.current, ...remote, savedAt: remote.savedAt ?? Date.now() };
            latestFingerprint.current = getSaveFingerprint(latest.current);
            apply.current(remote);
          }
          setStatus('Обновлено из облака');
        } else if (!remote && !latest.current.savedAt) {
          latest.current = { ...latest.current, savedAt: Date.now() };
        }
      } catch {
        cloudReady.current = false;
        if (!disposed) setStatus('Облако недоступно · сохраняем на устройстве');
      } finally {
        loadingCloud = false;
        if (!initialLoadFinished) {
          initialLoadFinished = true;
          if (!disposed) setReady(true);
        }
      }
    };

    const flushCloud = async () => {
      const fingerprint = latestFingerprint.current;
      if (!userId || !cloudReady.current || saving.current || remoteFingerprint.current === fingerprint) return;
      saving.current = true;
      const current = latest.current;
      try {
        await writeCloudSave(userId, current);
        remoteFingerprint.current = fingerprint;
        if (!disposed && latestFingerprint.current === fingerprint) setStatus('Сохранено в Supabase');
      } catch {
        if (!disposed) setStatus('Нет связи с облаком · сохранено на устройстве');
      } finally {
        saving.current = false;
      }
    };

    const flushBeforeHide = () => {
      if (document.hidden) void flushCloud();
    };
    const cloudTimer = window.setInterval(() => void flushCloud(), 3000);
    const refreshTimer = window.setInterval(() => void synchronizeCloud(), 10000);
    document.addEventListener('visibilitychange', flushBeforeHide);
    void synchronizeCloud();

    return () => {
      disposed = true;
      void flushCloud();
      window.clearInterval(cloudTimer);
      window.clearInterval(refreshTimer);
      document.removeEventListener('visibilitychange', flushBeforeHide);
    };
  }, [userId]);

  return { ready, status };
}
