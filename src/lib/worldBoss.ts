import { supabase } from './supabase';

export type WorldBossPlayer = {
  playerId: string;
  name: string;
  joinedAt: string;
};

export type WorldBossOnlinePlayer = {
  playerId: string;
  name: string;
  lastSeen: string;
};

export type WorldBossInvite = {
  id: string;
  playerId: string;
  name: string;
  createdAt: string;
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

function parseList<T>(value: unknown, parseItem: (item: unknown) => T): T[] {
  if (!Array.isArray(value)) throw new Error('Сервер прислал неправильный список.');
  return value.map(parseItem);
}

function parseOnlinePlayer(value: unknown): WorldBossOnlinePlayer {
  if (!value || typeof value !== 'object') throw new Error('Сервер прислал неправильные данные игрока онлайн.');
  const player = value as Record<string, unknown>;
  if (typeof player.playerId !== 'string' || typeof player.name !== 'string' || typeof player.lastSeen !== 'string') {
    throw new Error('Сервер прислал неправильные данные игрока онлайн.');
  }
  return { playerId: player.playerId, name: player.name, lastSeen: player.lastSeen };
}

function parseInvite(value: unknown): WorldBossInvite {
  if (!value || typeof value !== 'object') throw new Error('Сервер прислал неправильное приглашение.');
  const invite = value as Record<string, unknown>;
  if (typeof invite.id !== 'string' || typeof invite.playerId !== 'string' || typeof invite.name !== 'string' || typeof invite.createdAt !== 'string') {
    throw new Error('Сервер прислал неправильное приглашение.');
  }
  return { id: invite.id, playerId: invite.playerId, name: invite.name, createdAt: invite.createdAt };
}

export async function heartbeatWorldBossPresence(sessionId: string, playerId: string, nickname: string) {
  const { error } = await supabase.rpc('heartbeat_world_boss_presence', {
    p_session_id: sessionId,
    p_player_id: playerId,
    p_nickname: nickname,
  });
  if (error) throw error;
}

export async function leaveWorldBossPresence(sessionId: string) {
  const { error } = await supabase.rpc('leave_world_boss_presence', { p_session_id: sessionId });
  if (error) throw error;
}

export async function listWorldBossOnlinePlayers() {
  const { data, error } = await supabase.rpc('list_world_boss_online_players');
  if (error) throw error;
  return parseList(data, parseOnlinePlayer);
}

export async function sendWorldBossInvite(playerId: string) {
  const { error } = await supabase.rpc('send_world_boss_invite', { p_target_player_id: playerId });
  if (error) throw error;
}

export async function listWorldBossInvites() {
  const { data, error } = await supabase.rpc('list_world_boss_invites');
  if (error) throw error;
  return parseList(data, parseInvite);
}

export async function respondWorldBossInvite(
  inviteId: string,
  accept: boolean,
  playerId: string,
  nickname: string,
) {
  const { data, error } = await supabase.rpc('respond_world_boss_invite', {
    p_invite_id: inviteId,
    p_accept: accept,
    p_player_id: playerId,
    p_nickname: nickname,
  });
  if (error) throw error;
  return accept ? parseSnapshot(data) : null;
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
