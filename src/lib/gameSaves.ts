import { supabase } from './supabase';
import { validateGameSave } from './validateGameSave';
import type { GameSaveState } from '../game/data/gameSaveState';

export async function loadCloudSave(userId: string) {
  const { data, error } = await supabase.from('game_saves').select('save_data, updated_at')
    .eq('user_id', userId).abortSignal(AbortSignal.timeout(10000)).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const save = validateGameSave(data.save_data);
  if (!save) throw new Error('Сохранение повреждено');
  return { ...save, savedAt: save.savedAt ?? Date.parse(data.updated_at) };
}

export async function writeCloudSave(userId: string, save: GameSaveState) {
  const { error } = await supabase.from('game_saves').upsert({
    user_id: userId, save_data: save, updated_at: new Date(save.savedAt).toISOString(),
  }, { onConflict: 'user_id' });
  if (error) throw error;
}
