import { supabase } from './supabase';

export type WorldBossPlayer = {
  playerId: string;
  name: string;
  joinedAt: string;
};

export type WorldBossSnapshot = {
  hp: number;
  maxHp: number;
  respawnAt: string | null;
  players: WorldBossPlayer[];
  damage?: number;
};

function parseSnapshot(value: unknown): WorldBossSnapshot {
  if (!value || typeof value !== 'object') throw new Error('Сервер прислал неправильное состояние босса.');
  const data = value as Record<string, unknown>;
  if (typeof data.hp !== 'number' && typeof data.hp !== 'string') throw new Error('Сервер не прислал здоровье босса.');
  if (typeof data.maxHp !== 'number' && typeof data.maxHp !== 'string') throw new Error('Сервер не прислал максимальное здоровье босса.');
  if (!Array.isArray(data.players)) throw new Error('Сервер не прислал список игроков.');
  const players = data.players.map((player): WorldBossPlayer => {
    if (!player || typeof player !== 'object') throw new Error('Сервер прислал неправильный список игроков.');
    const entry = player as Record<string, unknown>;
    if (typeof entry.playerId !== 'string' || typeof entry.name !== 'string' || typeof entry.joinedAt !== 'string') {
      throw new Error('Сервер прислал неправильные данные игрока.');
    }
    return { playerId: entry.playerId, name: entry.name, joinedAt: entry.joinedAt };
  });
  const damage = typeof data.damage === 'number' ? data.damage : undefined;
  return {
    hp: Number(data.hp),
    maxHp: Number(data.maxHp),
    respawnAt: typeof data.respawnAt === 'string' ? data.respawnAt : null,
    players,
    ...(damage === undefined ? {} : { damage }),
  };
}

export async function joinWorldBoss(playerId: string, nickname: string, joinWithPlayerId: string) {
  const { data, error } = await supabase.rpc('join_world_boss', {
    p_player_id: playerId,
    p_nickname: nickname,
    p_join_with_player_id: joinWithPlayerId || null,
  });
  if (error) throw error;
  return parseSnapshot(data);
}

export async function attackWorldBoss() {
  const { data, error } = await supabase.rpc('attack_world_boss');
  if (error) throw error;
  return parseSnapshot(data);
}

export async function leaveWorldBoss() {
  const { error } = await supabase.rpc('leave_world_boss');
  if (error) throw error;
}
