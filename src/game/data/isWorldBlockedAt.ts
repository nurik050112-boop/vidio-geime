import { browserStorage } from '../../lib/browserStorage';
import { monsterAvalancheHp,nuraliBossHp,worldCollisionEnabled } from './adminBoss';
import { type Armor,type CityStage,type DuelRequest,type OnlinePresence,type Weapon } from './dragonSon';
import { collidesWithBox } from './gameSaveState';
import { getWorldCollisionBoxes } from './getWorldCollisionBoxes';

export function isWorldBlockedAt(position: { x: number; z: number }, chapter: number, locationIndex: number, sceneKey: string, radius = 0.72) {
  if (!worldCollisionEnabled) return false;

  const worldX = -3.4 + position.x / 1000;
  const worldZ = 1.2 + position.z / 1000;
  return getWorldCollisionBoxes(chapter, locationIndex, sceneKey).some((box) => collidesWithBox(worldX, worldZ, box, radius));
}

export const monsterAvalancheWorld: CityStage = {
  name: 'Лавина монстров',
  city: '5 мир',
  country: 'Секрет после 5-го дракона',
  lair: 'Черная гора, где 10 миллиардов монстров падают волной',
  monsterKind: 'avalanche',
  monsterName: 'монстры лавины',
  title: 'секретная лавина',
  power: monsterAvalancheHp,
  color: '#ff004c',
  attackSpeed: 0.4,
  reaction: 'монстры бьют лавиной без остановки',
};

export const nuraliBoss: CityStage = {
  name: 'Нурали',
  city: 'Дом Нурали',
  country: 'Новый мир',
  lair: 'Зеленый двор у большого дома',
  monsterKind: 'nurali',
  monsterName: 'львы и коты',
  title: 'главный босс нового мира',
  power: nuraliBossHp,
  color: '#111111',
  attackSpeed: 0.38,
  reaction: 'рычит как лев и пугает котом',
};

export const presenceStorageKey = 'dragon-game-online-players';

export const leaderboardStorageKey = 'dragon-game-leaderboard-players';

export const dailyRewardStorageKey = 'dragon-game-daily-rewards';

export const winStreakStorageKey = 'dragon-game-win-streak';

export const duelRequestsStorageKey = 'dragon-game-duel-requests';

export const presenceTtlMs = 20_000;

export type DailyRewardState = {
  lastVisitDate: string;
  lastRewardDate: string;
  streak: number;
  bestStreak: number;
};

export type WinStreakState = {
  current: number;
  best: number;
  totalWins: number;
};

export function makePlayerId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '0');
}

export function normalizePlayerId(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

export function makePresenceFallbackWeapon(power: number): Weapon {
  return {
    id: `online-sword-${power}`,
    name: 'Меч игрока',
    rarity: 'Редкий',
    damage: Math.max(100, Math.floor(power / 2)),
    price: 0,
  };
}

export function makePresenceFallbackArmor(power: number): Armor {
  return {
    id: `online-armor-${power}`,
    name: 'Броня игрока',
    rarity: 'Редкий',
    defense: Math.max(25, Math.floor(power / 4)),
    price: 0,
  };
}

export function readOnlinePresences() {
  try {
    const parsed = JSON.parse(browserStorage.getItem(presenceStorageKey) ?? '[]') as OnlinePresence[];
    const now = Date.now();
    return parsed
      .map((player) => ({ ...player, id: normalizePlayerId(player.id) }))
      .filter((player) => player.id.length === 6 && now - player.updatedAt < presenceTtlMs);
  } catch {
    return [];
  }
}

export function readLeaderboardPresences() {
  try {
    const parsed = JSON.parse(browserStorage.getItem(leaderboardStorageKey) ?? '[]') as OnlinePresence[];
    return parsed
      .map((player) => ({ ...player, id: normalizePlayerId(player.id) }))
      .filter((player) => player.id.length === 6)
      .sort((a, b) => b.power - a.power || b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function saveLeaderboardPresences(players: OnlinePresence[]) {
  const strongestById = new Map<string, OnlinePresence>();
  players.forEach((player) => {
    const id = normalizePlayerId(player.id);
    if (id.length !== 6) return;
    const normalizedPlayer = { ...player, id };
    const current = strongestById.get(id);
    if (!current || normalizedPlayer.power > current.power || normalizedPlayer.updatedAt > current.updatedAt) {
      strongestById.set(id, normalizedPlayer);
    }
  });
  const leaderboard = [...strongestById.values()]
    .sort((a, b) => b.power - a.power || b.updatedAt - a.updatedAt)
    .slice(0, 100);
  browserStorage.setItem(leaderboardStorageKey, JSON.stringify(leaderboard));
  return leaderboard;
}

export function readDuelRequests() {
  try {
    const now = Date.now();
    return (JSON.parse(browserStorage.getItem(duelRequestsStorageKey) ?? '[]') as DuelRequest[])
      .filter((request) => now - request.createdAt < 60_000);
  } catch {
    return [];
  }
}

export function saveDuelRequests(requests: DuelRequest[]) {
  browserStorage.setItem(duelRequestsStorageKey, JSON.stringify(requests.slice(-20)));
}
