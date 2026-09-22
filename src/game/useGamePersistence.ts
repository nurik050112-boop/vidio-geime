import { useEffect,useRef,useState } from 'react';
import { browserStorage } from '../lib/browserStorage';
import { loadCloudSave,writeCloudSave } from '../lib/gameSaves';
import { isSupabaseConfigured } from '../lib/supabase';
import type { GameSaveState } from './data/gameSaveState';

type Options = {
  userId?: string; storageKey: string; initialSave: Partial<GameSaveState> | null;
  save: GameSaveState; applySave: (save: Partial<GameSaveState>) => void;
};

export function useGamePersistence({ userId, storageKey, initialSave, save, applySave }: Options) {
  const [ready, setReady] = useState(!userId || !isSupabaseConfigured);
  const [status, setStatus] = useState('Загрузка сохранения…');
  const latest = useRef(save);
  const apply = useRef(applySave);
  const baseline = useRef(initialSave?.savedAt ?? 0);
  const cloudReady = useRef(false);
  const remoteVersion = useRef(0);
  const localVersion = useRef(0);
  const saving = useRef(false);
  apply.current = applySave;
  // Ignore the pre-load defaults until the restored state has rendered.
  useEffect(() => { if (ready) latest.current = save; }, [ready, save]);

  useEffect(() => {
    if (!userId || !isSupabaseConfigured) { setReady(true); return; }
    let cancelled = false;
    setReady(false);
    cloudReady.current = false;
    loadCloudSave(userId).then(remote => {
      if (cancelled) return;
      if (remote && (remote.savedAt ?? 0) > baseline.current) apply.current(remote);
      cloudReady.current = true;
    }).catch(() => {
      if (!cancelled) setStatus('Облако недоступно · сохраняем на устройстве');
    }).finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    if (!ready) return;
    let disposed = false;
    const flushLocal = () => {
      const current = latest.current;
      if (localVersion.current === current.savedAt) return;
      if (browserStorage.setItem(storageKey, JSON.stringify(current))) {
        localVersion.current = current.savedAt;
        if (!disposed) setStatus(userId && !cloudReady.current ? 'Облако недоступно · сохранено на устройстве' : 'Сохранено на устройстве');
      } else if (!disposed) setStatus('Не удалось сохранить: проверь свободное место в браузере');
    };
    const flushCloud = async () => {
      if (!userId || !cloudReady.current || saving.current || remoteVersion.current === latest.current.savedAt) return;
      saving.current = true;
      const current = latest.current;
      try {
        await writeCloudSave(userId, current);
        remoteVersion.current = current.savedAt;
        if (!disposed) setStatus('Сохранено в облаке');
      } catch { if (!disposed) setStatus('Нет связи с облаком · сохранено на устройстве'); }
      finally { saving.current = false; }
    };
    const refreshCloud = async () => {
      if (!userId || !cloudReady.current || saving.current) return;
      try {
        const remote = await loadCloudSave(userId);
        if (remote && (remote.savedAt ?? 0) > latest.current.savedAt) {
          apply.current(remote);
          remoteVersion.current = remote.savedAt ?? 0;
          if (!disposed) setStatus('Обновлено из облака');
        }
      } catch {
        // Saving locally still works when the cloud is temporarily unavailable.
      }
    };
    const onHide = () => { flushLocal(); if (document.hidden) void flushCloud(); };
    const localTimer = window.setInterval(flushLocal, 750);
    const cloudTimer = window.setInterval(() => { void flushCloud(); }, 3000);
    const refreshTimer = window.setInterval(() => { void refreshCloud(); }, 10000);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flushLocal);
    return () => {
      disposed = true;
      flushLocal();
      void flushCloud();
      window.clearInterval(localTimer);
      window.clearInterval(cloudTimer);
      window.clearInterval(refreshTimer);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flushLocal);
    };
  }, [ready, storageKey, userId]);
  return { ready, status };
}
