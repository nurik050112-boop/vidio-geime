import { browserStorage } from '../../lib/browserStorage';
import { bbiDirectorHp,bbiFinalBossHp,bbiManagerHp } from './adminBoss';
import { type AchievementId,type BbiBossStage,type CityStage,type DuelPlayer,type OnlinePresence } from './dragonSon';
import { type DailyRewardState,dailyRewardStorageKey,makePresenceFallbackArmor,makePresenceFallbackWeapon,normalizePlayerId,type WinStreakState,winStreakStorageKey } from './isWorldBlockedAt';

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateKey() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateKey(yesterday);
}

export function readDailyRewardState(): DailyRewardState {
  try {
    const parsed = JSON.parse(browserStorage.getItem(dailyRewardStorageKey) ?? 'null') as Partial<DailyRewardState> | null;
    return {
      lastVisitDate: parsed?.lastVisitDate ?? '',
      lastRewardDate: parsed?.lastRewardDate ?? '',
      streak: parsed?.streak ?? 0,
      bestStreak: parsed?.bestStreak ?? 0,
    };
  } catch {
    return { lastVisitDate: '', lastRewardDate: '', streak: 0, bestStreak: 0 };
  }
}

export function saveDailyRewardState(state: DailyRewardState) {
  browserStorage.setItem(dailyRewardStorageKey, JSON.stringify(state));
}

export function readWinStreakState(): WinStreakState {
  try {
    const parsed = JSON.parse(browserStorage.getItem(winStreakStorageKey) ?? 'null') as Partial<WinStreakState> | null;
    return {
      current: parsed?.current ?? 0,
      best: parsed?.best ?? 0,
      totalWins: parsed?.totalWins ?? 0,
    };
  } catch {
    return { current: 0, best: 0, totalWins: 0 };
  }
}

export function saveWinStreakState(state: WinStreakState) {
  browserStorage.setItem(winStreakStorageKey, JSON.stringify(state));
}

export function readRealtimePresenceEntries(state: Record<string, unknown[]>) {
  return Object.values(state)
    .flatMap((players) => players as unknown as OnlinePresence[])
    .map((player) => ({ ...player, id: normalizePlayerId(player.id) }))
    .filter((player) => player.id.length === 6);
}

export function toDuelPlayer(player: OnlinePresence): DuelPlayer {
  return {
    id: player.id,
    name: player.name,
    power: player.power,
    title: 'реальный игрок в сети',
    weapon: player.weapon ?? makePresenceFallbackWeapon(player.power),
    armor: player.armor ?? makePresenceFallbackArmor(player.power),
  };
}

export const bbiBosses: Record<Exclude<BbiBossStage, null>, CityStage> = {
  manager: {
    name: 'Управляющий',
    city: 'BBI новый мир',
    country: 'Детский город',
    lair: 'Главная комната нового мира',
    monsterKind: 'shadow',
    monsterName: 'монстры BBI',
    title: 'управляющий босс',
    power: bbiManagerHp,
    color: '#2f80ed',
    attackSpeed: 0.58,
    reaction: 'управляющий атакует быстро',
  },
  director: {
    name: 'Директор',
    city: 'BBI кабинет директора',
    country: 'Детский город',
    lair: 'Большой кабинет после управляющего',
    monsterKind: 'magma',
    monsterName: 'директорские стражи',
    title: 'директор босс',
    power: bbiDirectorHp,
    color: '#ffd166',
    attackSpeed: 0.5,
    reaction: 'директор сильнее управляющего в 3 раза',
  },
  final: {
    name: 'Последний BBI босс',
    city: 'BBI финальная арена',
    country: 'Детский город',
    lair: 'Арена после надписи сражаться или отказаться',
    monsterKind: 'frost',
    monsterName: 'финальные стражи',
    title: 'последний босс',
    power: bbiFinalBossHp,
    color: '#ff004c',
    attackSpeed: 0.42,
    reaction: 'последний босс сильнее директора в 5 раз',
  },
};

export const achievements: { id: AchievementId; name: string }[] = [
  { id: 'dragonPeace', name: 'Мир после огня' },
  { id: 'dragonWar', name: 'Пустое небо' },
  { id: 'goblinKing', name: 'Люди, ставшие гоблинами' },
  { id: 'furyKing', name: 'Король фури' },
  { id: 'anuarKing', name: 'Бомбическая концовка' },
  { id: 'mansurKing', name: 'Подземелье Мансура' },
  { id: 'arailmKing', name: 'Код хочет выбраться' },
  { id: 'aisultanSea', name: 'Воденой мир' },
  { id: 'adminImpossible', name: 'Это невозможно пройти' },
  { id: 'bbiBadEnding', name: 'Они лишь дети' },
  { id: 'impossibleEnding', name: 'Невозможная концовка' },
  { id: 'monsterAvalanche', name: 'Лавина 10 миллиардов' },
  { id: 'deathHell', name: 'Душа попала в ад' },
  { id: 'deathVictory', name: 'Победивший смерть' },
];
