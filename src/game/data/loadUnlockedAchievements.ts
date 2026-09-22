import { browserStorage } from '../../lib/browserStorage';
import { type AchievementId,type Artifact,type Rarity,type ShopItem } from './dragonSon';
import { achievements } from './getLocalDateKey';

export function loadUnlockedAchievements(): AchievementId[] {
  try {
    const parsed: unknown = JSON.parse(browserStorage.getItem('dragon-game-achievements') ?? '[]');
    if (!Array.isArray(parsed)) return [];

    const achievementIds = new Set(achievements.map((achievement) => achievement.id));
    return parsed.filter((id): id is AchievementId => (
      typeof id === 'string' && achievementIds.has(id as AchievementId)
    ));
  } catch {
    return [];
  }
}

export const endingArtifacts: Artifact[] = [
  { id: 'starRing', name: 'Кольцо звезды', ending: 'dragonPeace', bonusPercent: 10, goldBonusPercent: 10, attackSpeedPercent: 10, manaBonusPercent: 10, icon: 'star-ring', text: 'Концовка мира драконов' },
  { id: 'dragonPendant', name: 'Шлем-дракон', ending: 'dragonWar', bonusPercent: 20, goldBonusPercent: 20, attackSpeedPercent: 20, manaBonusPercent: 20, icon: 'dragon-pendant', text: 'Плохая концовка драконов' },
  { id: 'magicBottle', name: 'Фиолетовый сосуд', ending: 'goblinKing', bonusPercent: 30, goldBonusPercent: 30, attackSpeedPercent: 30, manaBonusPercent: 50, icon: 'magic-bottle', text: 'Тайна гоблинов' },
  { id: 'goldHoop', name: 'Золотое кольцо', ending: 'furyKing', bonusPercent: 40, goldBonusPercent: 40, attackSpeedPercent: 40, manaBonusPercent: 40, icon: 'gold-hoop', text: 'Концовка фури' },
  { id: 'greenRelic', name: 'Зеленая печать', ending: 'anuarKing', bonusPercent: 50, goldBonusPercent: 50, attackSpeedPercent: 50, manaBonusPercent: 50, icon: 'green-relic', text: 'Бомбическая концовка' },
  { id: 'snowGlobe', name: 'Снежный шлем', ending: 'mansurKing', bonusPercent: 60, goldBonusPercent: 60, attackSpeedPercent: 60, manaBonusPercent: 60, icon: 'snow-globe', text: 'Подземелье Мансура' },
  { id: 'moonCrystal', name: 'Лунный кристалл', ending: 'arailmKing', bonusPercent: 70, goldBonusPercent: 70, attackSpeedPercent: 70, manaBonusPercent: 90, icon: 'moon-crystal', text: 'Код хочет выбраться' },
  { id: 'seaPearl', name: 'Шар водного вихря', ending: 'aisultanSea', bonusPercent: 1000, goldBonusPercent: 10000, attackSpeedPercent: 1000, manaBonusPercent: 1000, icon: 'sea-pearl', text: 'Воденой мир: усиливает воденой меч на 1000%' },
  { id: 'deathPendant', name: 'Кулон смерти', ending: 'adminImpossible', bonusPercent: 100000, goldBonusPercent: 100000, attackSpeedPercent: 100000, healthBonusPercent: 100000, defenseBonusPercent: 100000, luckBonusPercent: 100000, manaBonusPercent: 100000, healingBonusPercent: 100, icon: 'death-pendant', text: 'Админская сила заключена в кулоне смерти' },
  { id: 'sunOrb', name: 'Солнечная сфера', ending: 'bbiBadEnding', bonusPercent: 80, goldBonusPercent: 80, attackSpeedPercent: 80, manaBonusPercent: 80, icon: 'sun-orb', text: 'BBI концовка' },
  { id: 'impossibleMedallion', name: 'Медальон невозможности', ending: 'impossibleEnding', bonusPercent: 1000, goldBonusPercent: 1000, attackSpeedPercent: 1000, manaBonusPercent: 1000, icon: 'impossible-medallion', text: 'Невозможная концовка мира Нурали' },
  { id: 'avalancheCrown', name: 'Корона лавины', ending: 'monsterAvalanche', bonusPercent: 100, goldBonusPercent: 100, attackSpeedPercent: 100, healthBonusPercent: 100, defenseBonusPercent: 100, luckBonusPercent: 100, manaBonusPercent: 100, icon: 'avalanche-crown', text: 'Концовка лавины монстров' },
  { id: 'godHead', name: 'Голова бога', ending: 'deathVictory', bonusPercent: 666, goldBonusPercent: 666, attackSpeedPercent: 666, healthBonusPercent: 666, defenseBonusPercent: 666, luckBonusPercent: 666, manaBonusPercent: 666, healingBonusPercent: 666, icon: 'god-head', text: 'Победа над смертью: усиливает меч смерти' },
];

export const shopItems: ShopItem[] = [
  { id: 'sword', name: 'Меч рассвета', price: 120, bonus: '+20 урона' },
  { id: 'pet', name: 'Огненный питомец', price: 180, bonus: '+20 урона максимум' },
  { id: 'clothes', name: 'Одежда странника', price: 90, bonus: '-3 урона от огня' },
  { id: 'helmet', name: 'Шлем героя', price: 140, bonus: '-5 урона от огня' },
  { id: 'armor', name: 'Драконья броня', price: 240, bonus: '-9 урона от огня' },
  { id: 'mana', name: 'Кристалл маны', price: 120, bonus: '+25 максимум маны' },
  { id: 'health', name: 'Сердце рыцаря', price: 160, bonus: '+35 максимум здоровья' },
  { id: 'doubleStrike', name: 'Совместная смерть', price: 500, bonus: 'бьет 2 противников за раз' },
];

export const shopBasePower: Record<ShopItem['id'], number> = {
  sword: 20,
  pet: 10,
  clothes: 3,
  helmet: 5,
  armor: 9,
  mana: 25,
  health: 35,
  doubleStrike: 1,
};

export function upgradePower(level: number, base: number) {
  return Math.floor((base * level * (level + 1)) / 2);
}

export function nextUpgradePower(level: number, base: number) {
  return base * (level + 1);
}

export function getPlayerLevelFromKills(defeatedEnemies: number) {
  let level = 1;
  let killsOnLevel = Math.max(0, defeatedEnemies);
  let killsNeeded = 10;

  while (killsOnLevel >= killsNeeded && killsNeeded < Number.MAX_SAFE_INTEGER / 10) {
    killsOnLevel -= killsNeeded;
    level += 1;
    killsNeeded *= 10;
  }

  return {
    level,
    killsOnLevel,
    killsNeeded,
    progress: Math.min(100, Math.floor((killsOnLevel / killsNeeded) * 100)),
  };
}

export function getShopPrice(item: ShopItem, level: number) {
  return Math.floor(item.price * (level + 1) ** 2);
}

export function getShopBonusText(item: ShopItem, level: number) {
  const bonus = nextUpgradePower(level, shopBasePower[item.id]);
  if (item.id === 'sword') return `+${bonus} урона`;
  if (item.id === 'pet') return `+${Math.min(20, bonus)} к урону, максимум 20`;
  if (item.id === 'mana') return `+${bonus} максимум маны`;
  if (item.id === 'health') return `+${bonus} максимум здоровья`;
  if (item.id === 'doubleStrike') return `бьет ${2 + level} противников за раз`;
  return `-${bonus} урона от врагов`;
}

export const weaponBases = [
  'Меч', 'Сабля', 'Катана', 'Топор', 'Копье', 'Кинжал', 'Молот', 'Посох', 'Коса', 'Рапира',
  'Алебарда', 'Клеймор', 'Секира', 'Нож', 'Булава', 'Пика', 'Глефа', 'Шпага', 'Чакрам', 'Лук',
];

export const weaponMaterials = [
  'железа', 'стали', 'серебра', 'обсидиана', 'льда', 'пламени', 'бури', 'света', 'тени', 'кости',
  'кристалла', 'звезд', 'лавы', 'грома', 'леса', 'океана', 'пепла', 'золота', 'рубинa', 'дракона',
  'луны', 'солнца', 'метеора', 'руны', 'бездны',
];

export const weaponEnchants = [
  'рассвета', 'заката', 'ярости', 'тишины', 'искры', 'урагана', 'короля', 'странника', 'стража', 'охоты',
  'молнии', 'севера', 'юга', 'востока', 'запада', 'проклятия', 'чести', 'глубин', 'неба', 'подземелья',
  'феникса', 'титана', 'героя', 'древних', 'последней битвы',
];

export const weaponRunes = [
  'волка', 'ворона', 'дуба', 'камня', 'пламени', 'искателя', 'короны', 'бури', 'гоблина', 'пещеры',
  'рыцаря', 'охотника', 'звезды', 'крови', 'стали', 'тумана', 'молота', 'клятвы', 'искры', 'дракона',
];

export const armorParts = [
  'Шлем', 'Кираса', 'Наплечники', 'Перчатки', 'Пояс', 'Поножи', 'Сапоги', 'Щит', 'Плащ', 'Кольчуга',
  'Маска', 'Наручи', 'Нагрудник', 'Корона', 'Панцирь',
];

export const armorMaterials = [
  'железа', 'стали', 'серебра', 'обсидиана', 'драконьей чешуи', 'кристалла', 'лавы', 'льда', 'тени', 'света',
  'мифрила', 'кости', 'руны', 'метеора', 'золота',
];

export const armorEnchants = [
  'стойкости', 'огня', 'мороза', 'ветра', 'бури', 'солнца', 'луны', 'стража', 'героя', 'титана',
  'феникса', 'бездны', 'короля', 'подземелья', 'последней битвы',
];

export const rarityDefense: Record<Rarity, number> = {
  'Обычный': 4,
  'Необычный': 11,
  'Редкий': 30,
  'Эпик': 90,
  'Легендарка': 500,
  'Секретное': 50_000,
  'Эксклюзив': Number.MAX_SAFE_INTEGER,
};
