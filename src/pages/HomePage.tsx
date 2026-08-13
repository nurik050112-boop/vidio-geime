import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import { Link, useLocation } from 'wouter';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type DragonSon = {
  name: string;
  city: string;
  country: string;
  lair: string;
  monsterKind: string;
  monsterName: string;
  title: string;
  power: number;
  color: string;
  attackSpeed: number;
  reaction: string;
};

type CityStage = DragonSon;

type ShopItem = {
  id: 'sword' | 'pet' | 'clothes' | 'helmet' | 'armor' | 'mana' | 'health' | 'doubleStrike';
  name: string;
  price: number;
  bonus: string;
};

type Dungeon = {
  city: string;
  danger: number;
  cleared: boolean;
  entered: boolean;
  enemiesLeft: number;
  declined: boolean;
};

type Rarity = 'Обычный' | 'Необычный' | 'Редкий' | 'Эпик' | 'Легендарка' | 'Секретное';

type Weapon = {
  id: string;
  name: string;
  rarity: Rarity;
  damage: number;
  price: number;
  displayDamage?: string;
};

type Armor = {
  id: string;
  name: string;
  rarity: Rarity;
  defense: number;
  price: number;
  displayDefense?: string;
};

type ArtifactId = 'starRing' | 'dragonPendant' | 'magicBottle' | 'goldHoop' | 'greenRelic' | 'snowGlobe' | 'moonCrystal' | 'sunOrb';

type Artifact = {
  id: ArtifactId;
  name: string;
  ending: AchievementId;
  bonusPercent: number;
  attackSpeedPercent: number;
  icon: string;
  text: string;
};

type Quest = {
  id: number;
  title: string;
  text: string;
  done: boolean;
  progress: string;
  money: number;
};

type HeroAnimation = 'idle' | 'strike' | 'step' | 'heal';
type EndingChoice = 'spare' | 'fight' | 'family' | null;
type SecretEnding = 'goblinKing' | 'furyKing' | 'anuarKing' | 'mansurKing' | 'arailmKing' | null;
type AchievementId = 'dragonPeace' | 'dragonWar' | 'goblinKing' | 'furyKing' | 'anuarKing' | 'mansurKing' | 'arailmKing' | 'bbiBadEnding';
type BbiBossStage = 'manager' | 'director' | 'final' | null;
type DuelStatus = 'idle' | 'searching' | 'challenge' | 'fighting' | 'won' | 'declined';

type DuelPlayer = {
  name: string;
  power: number;
  title: string;
};

const firstDragonCities: CityStage[] = [
  { name: 'Игнис', city: 'Алматы', country: 'Казахстан', lair: 'Логово Искры в горах Заилийского Алатау', monsterKind: 'goblin', monsterName: 'гоблины', title: 'сын искры', power: 1_000, color: '#ffb703', attackSpeed: 0.85, reaction: 'бьет очень быстро' },
  { name: 'Рубор', city: 'Стамбул', country: 'Турция', lair: 'Пепельное гнездо у древних стен', monsterKind: 'orc', monsterName: 'орки', title: 'сын пепла', power: 1_000_000, color: '#fb5607', attackSpeed: 1.3, reaction: 'бьет тяжелее и медленнее' },
  { name: 'Каэрн', city: 'Рим', country: 'Италия', lair: 'Лавовая арена под Колизеем', monsterKind: 'lizard', monsterName: 'ящерицы', title: 'сын лавы', power: 1_000_000_000, color: '#d00000', attackSpeed: 0.65, reaction: 'молниеносная реакция' },
  { name: 'Сольвар', city: 'Париж', country: 'Франция', lair: 'Дымная башня над Сеной', monsterKind: 'dwarf', monsterName: 'гномы', title: 'сын дымного неба', power: 1_000_000_000_000, color: '#8ecae6', attackSpeed: 1.65, reaction: 'выжидает и бьет медленно' },
  { name: 'Мэйдзин', city: 'Токио', country: 'Япония', lair: 'Черное святилище огня', monsterKind: 'shadow', monsterName: 'теневые воины', title: 'сын черного огня', power: 1_000_000_000_000_000, color: '#8338ec', attackSpeed: 0.75, reaction: 'атакует рывками' },
  { name: 'Аурокс', city: 'Нью-Йорк', country: 'США', lair: 'Гнездо раскаленного ветра над небоскребами', monsterKind: 'magma', monsterName: 'лавовые звери', title: 'сын раскаленного ветра', power: 1_000_000_000_000_000_000, color: '#3a86ff', attackSpeed: 1.1, reaction: 'держит ровный темп' },
  { name: 'Ноктар', city: 'Лондон', country: 'Великобритания', lair: 'Последнее логово в тумане Темзы', monsterKind: 'frost', monsterName: 'ледяные стражи', title: 'последний сын дракона', power: 1_000_000_000_000_000_000_000, color: '#06d6a0', attackSpeed: 1.9, reaction: 'медленно готовит ледяной удар' },
];

const extraDragonCities = [
  'Astana', 'Bishkek', 'Tashkent', 'Dubai', 'Cairo', 'Athens', 'Berlin', 'Madrid', 'Prague', 'Seoul',
  'Beijing', 'Sydney', 'Toronto', 'Mexico City', 'Rio', 'Buenos Aires', 'Cape Town', 'Oslo', 'Warsaw', 'Delhi',
  'Mumbai', 'Bangkok', 'Singapore', 'Hong Kong', 'Shanghai', 'Manila', 'Jakarta', 'Auckland', 'Melbourne', 'Lisbon',
  'Vienna', 'Budapest', 'Stockholm', 'Copenhagen', 'Helsinki', 'Dublin', 'Brussels', 'Amsterdam', 'Zurich', 'Milan',
  'Venice', 'Naples', 'Munich', 'Hamburg', 'Krakow', 'Belgrade', 'Sofia', 'Bucharest', 'Kyiv', 'Tbilisi',
  'Yerevan', 'Baku', 'Tehran', 'Baghdad', 'Riyadh', 'Doha', 'Abu Dhabi', 'Casablanca', 'Marrakesh', 'Nairobi',
  'Lagos', 'Accra', 'Dakar', 'Tunis', 'Montreal', 'Chicago', 'Los Angeles', 'San Francisco', 'Seattle', 'Miami',
  'Havana', 'Lima', 'Bogota', 'Caracas', 'Santiago', 'Montevideo', 'La Paz', 'Quito', 'Ankara', 'Izmir',
  'Antalya', 'Beirut', 'Jerusalem', 'Vancouver', 'Calgary', 'Ottawa', 'Detroit', 'Boston', 'Philadelphia', 'Atlanta',
  'Dallas', 'Houston', 'Phoenix',
];

const monsterKinds = [
  ['goblin', 'гоблины'],
  ['orc', 'орки'],
  ['lizard', 'ящерицы'],
  ['dwarf', 'гномы'],
  ['shadow', 'теневые воины'],
  ['magma', 'лавовые звери'],
  ['frost', 'ледяные стражи'],
] as const;

const dragonColors = ['#ffb703', '#fb5607', '#d00000', '#8ecae6', '#8338ec', '#3a86ff', '#06d6a0'];

const dragonSons: CityStage[] = [
  ...firstDragonCities,
  ...extraDragonCities.slice(0, 3).map((city, index) => {
    const number = index + 8;
    const monster = monsterKinds[index % monsterKinds.length];
    return {
      name: `Дракон ${number}`,
      city,
      country: 'Большой мир',
      lair: `Логово дракона ${number} в городе ${city}`,
      monsterKind: monster[0],
      monsterName: monster[1],
      title: number === 100 ? 'финальный дракон' : 'драконий страж',
      power: 1_000 * number,
      color: dragonColors[index % dragonColors.length],
      attackSpeed: [0.8, 1.15, 1.55][index % 3],
      reaction: ['быстрая реакция', 'средняя реакция', 'медленная тяжелая атака'][index % 3],
    };
  }),
];

const finalDragon: CityStage = {
  name: 'Великий дракон',
  city: 'Трон огня',
  country: 'Последнее небо',
  lair: 'Трон короля драконов над всеми очищенными городами',
  monsterKind: 'magma',
  monsterName: 'огненные стражи',
  title: 'король и отец всех драконов',
  power: 999_999_999,
  color: '#ff004c',
  attackSpeed: 0.7,
  reaction: 'король бьет быстро и яростно',
};

const dragonFamily: CityStage = {
  name: 'Семья короля драконов',
  city: 'Последнее логово семьи',
  country: 'Драконье небо',
  lair: 'Семейное гнездо над троном огня',
  monsterKind: 'magma',
  monsterName: 'драконья семья',
  title: 'семья короля драконов',
  power: 999_999_999_999,
  color: '#fff275',
  attackSpeed: 0.45,
  reaction: 'семья атакует почти без паузы',
};

const goblinKing: CityStage = {
  name: 'Король гоблинов',
  city: 'Глубокая пещера',
  country: 'Забытое королевство',
  lair: 'Трон бедных гоблинов под землей',
  monsterKind: 'goblin',
  monsterName: 'бедные гоблины',
  title: 'король тех, кого никто не любит',
  power: 777_777_777,
  color: '#65a832',
  attackSpeed: 0.6,
  reaction: 'дерется быстро, потому что защищает своих',
};

const furyKing: CityStage = {
  name: 'Король фури',
  city: 'Секретный фури-мир',
  country: 'Скрытая улица',
  lair: 'Трон фури под серым городом',
  monsterKind: 'shadow',
  monsterName: 'фури',
  title: 'король фури',
  power: 999_999_999,
  color: '#111111',
  attackSpeed: 0.52,
  reaction: 'двигается очень быстро',
};

const anuarKing: CityStage = {
  name: 'Ануар',
  city: 'Город бомб',
  country: 'Секретный мир',
  lair: 'Финальная площадь после взрыва',
  monsterKind: 'magma',
  monsterName: 'бомба-монстры',
  title: 'король бомб',
  power: 999_999_999,
  color: '#ff5a3d',
  attackSpeed: 0.48,
  reaction: 'кидает бомбический удар',
};

const mansurKing: CityStage = {
  name: 'Король Мансур',
  city: 'Секретное подземелье Мансура',
  country: 'Мир братишки',
  lair: 'Трон Мансура у горного озера',
  monsterKind: 'goblin',
  monsterName: 'монстры Мансура',
  title: 'король Мансура',
  power: 999_999_999,
  color: '#9cff00',
  attackSpeed: 0.5,
  reaction: 'атакует как секретный страж',
};

const arailmKing: CityStage = {
  name: 'Арайлым',
  city: 'Красный код',
  country: 'Секретная программа',
  lair: 'Экран, из которого код хочет выбраться',
  monsterKind: 'shadow',
  monsterName: 'код-монстры',
  title: 'босс программы',
  power: 999_999_999,
  color: '#ff2a1f',
  attackSpeed: 0.42,
  reaction: 'понимает, что она всего лишь код',
};

const worldLocations = [
  'Астана', 'Бишкек', 'Ташкент', 'Дубай', 'Каир', 'Афины', 'Берлин',
  'Мадрид', 'Прага', 'Сеул', 'Пекин', 'Сидней', 'Торонто', 'Мехико',
  'Рио-де-Жанейро', 'Буэнос-Айрес', 'Кейптаун', 'Осло', 'Варшава', 'Дели',
];

const heroMaxHp = 200;
const monstersPerCity = 10_000;
const dungeonEnemiesTotal = 10_000;
const furyDungeonEnemiesTotal = 100_000;
const anuarBombEnemiesTotal = 100_000;
const mansurDungeonEnemiesTotal = 100_000;
const arailmEnemiesTotal = 100_000;
const baseMonsterHp = 10_000;
const baseMonsterDamage = 20;
const baseDragonHp = 100_000_000;
const baseDragonDamage = 100_000;
const adminNukeDamageText = '9'.repeat(4_000);
const adminHelmetHealthText = '∞';
const furySwordDamageText = '1' + '0'.repeat(116);
const mansurBladeDamageText = '99999999999999999999999999999999999999999999999999999999';
const programSwordDamageText = '1000000000000000000000000';
const arailmBossPowerText = '9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999';
const bbiMonsterTotal = 100;
const bbiMonsterHp = 10_000_000_000_000_000;
const bbiManagerHp = 10_000_000_000_000_000;
const bbiDirectorHp = bbiManagerHp * 3;
const bbiFinalBossHp = bbiDirectorHp * 5;
const duelPlayers: DuelPlayer[] = [
  { name: 'Темный рыцарь онлайн', power: 50_000, title: 'любит быстрые дуэли' },
  { name: 'Игрок с огненным мечом', power: 250_000, title: 'ищет сильного врага' },
  { name: 'BBI чемпион', power: 1_000_000, title: 'кидает вызов на весь экран' },
  { name: 'Стальной воин', power: 5_000_000, title: 'в шлеме и броне' },
  { name: 'Легендарный дуэлянт', power: 25_000_000, title: 'почти босс' },
];

const bbiBosses: Record<Exclude<BbiBossStage, null>, CityStage> = {
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

const achievements: { id: AchievementId; name: string }[] = [
  { id: 'dragonPeace', name: 'Мир после огня' },
  { id: 'dragonWar', name: 'Пустое небо' },
  { id: 'goblinKing', name: 'Люди, ставшие гоблинами' },
  { id: 'furyKing', name: 'Король фури' },
  { id: 'anuarKing', name: 'Бомбическая концовка' },
  { id: 'mansurKing', name: 'Подземелье Мансура' },
  { id: 'arailmKing', name: 'Код хочет выбраться' },
  { id: 'bbiBadEnding', name: 'Они лишь дети' },
];

const endingArtifacts: Artifact[] = [
  { id: 'starRing', name: 'Кольцо звезды', ending: 'dragonPeace', bonusPercent: 10, attackSpeedPercent: 10, icon: 'star-ring', text: 'Концовка мира драконов' },
  { id: 'dragonPendant', name: 'Шлем-дракон', ending: 'dragonWar', bonusPercent: 20, attackSpeedPercent: 20, icon: 'dragon-pendant', text: 'Плохая концовка драконов' },
  { id: 'magicBottle', name: 'Фиолетовый сосуд', ending: 'goblinKing', bonusPercent: 30, attackSpeedPercent: 30, icon: 'magic-bottle', text: 'Тайна гоблинов' },
  { id: 'goldHoop', name: 'Золотое кольцо', ending: 'furyKing', bonusPercent: 40, attackSpeedPercent: 40, icon: 'gold-hoop', text: 'Концовка фури' },
  { id: 'greenRelic', name: 'Зеленая печать', ending: 'anuarKing', bonusPercent: 50, attackSpeedPercent: 50, icon: 'green-relic', text: 'Бомбическая концовка' },
  { id: 'snowGlobe', name: 'Снежный шлем', ending: 'mansurKing', bonusPercent: 60, attackSpeedPercent: 60, icon: 'snow-globe', text: 'Подземелье Мансура' },
  { id: 'moonCrystal', name: 'Лунный кристалл', ending: 'arailmKing', bonusPercent: 70, attackSpeedPercent: 70, icon: 'moon-crystal', text: 'Код хочет выбраться' },
  { id: 'sunOrb', name: 'Солнечная сфера', ending: 'bbiBadEnding', bonusPercent: 80, attackSpeedPercent: 80, icon: 'sun-orb', text: 'BBI концовка' },
];

const shopItems: ShopItem[] = [
  { id: 'sword', name: 'Меч рассвета', price: 120, bonus: '+100 урона' },
  { id: 'pet', name: 'Огненный питомец', price: 180, bonus: '+10 урона каждый удар' },
  { id: 'clothes', name: 'Одежда странника', price: 90, bonus: '-3 урона от огня' },
  { id: 'helmet', name: 'Шлем героя', price: 140, bonus: '-5 урона от огня' },
  { id: 'armor', name: 'Драконья броня', price: 240, bonus: '-9 урона от огня' },
  { id: 'mana', name: 'Фляга маны', price: 80, bonus: '+1 мощный удар' },
  { id: 'health', name: 'Сердце рыцаря', price: 160, bonus: '+35 максимум здоровья' },
  { id: 'doubleStrike', name: 'Совместная смерть', price: 500, bonus: 'бьет 2 противников за раз' },
];

const shopBasePower: Record<ShopItem['id'], number> = {
  sword: 100,
  pet: 10,
  clothes: 3,
  helmet: 5,
  armor: 9,
  mana: 35,
  health: 35,
  doubleStrike: 1,
};

function upgradePower(level: number, base: number) {
  return Math.floor((base * level * (level + 1)) / 2);
}

function nextUpgradePower(level: number, base: number) {
  return base * (level + 1);
}

function getShopPrice(item: ShopItem, level: number) {
  return Math.floor(item.price * (level + 1) ** 2);
}

function getShopBonusText(item: ShopItem, level: number) {
  const bonus = nextUpgradePower(level, shopBasePower[item.id]);
  if (item.id === 'sword') return `+${bonus} урона`;
  if (item.id === 'pet') return `+${bonus} к урону`;
  if (item.id === 'mana') return `+${bonus} урона мощным ударом`;
  if (item.id === 'health') return `+${bonus} максимум здоровья`;
  if (item.id === 'doubleStrike') return `бьет ${2 + level} противников за раз`;
  return `-${bonus} урона от врагов`;
}

const weaponBases = [
  'Меч', 'Сабля', 'Катана', 'Топор', 'Копье', 'Кинжал', 'Молот', 'Посох', 'Коса', 'Рапира',
  'Алебарда', 'Клеймор', 'Секира', 'Нож', 'Булава', 'Пика', 'Глефа', 'Шпага', 'Чакрам', 'Лук',
];

const weaponMaterials = [
  'железа', 'стали', 'серебра', 'обсидиана', 'льда', 'пламени', 'бури', 'света', 'тени', 'кости',
  'кристалла', 'звезд', 'лавы', 'грома', 'леса', 'океана', 'пепла', 'золота', 'рубинa', 'дракона',
  'луны', 'солнца', 'метеора', 'руны', 'бездны',
];

const weaponEnchants = [
  'рассвета', 'заката', 'ярости', 'тишины', 'искры', 'урагана', 'короля', 'странника', 'стража', 'охоты',
  'молнии', 'севера', 'юга', 'востока', 'запада', 'проклятия', 'чести', 'глубин', 'неба', 'подземелья',
  'феникса', 'титана', 'героя', 'древних', 'последней битвы',
];

const weaponRunes = [
  'волка', 'ворона', 'дуба', 'камня', 'пламени', 'искателя', 'короны', 'бури', 'гоблина', 'пещеры',
  'рыцаря', 'охотника', 'звезды', 'крови', 'стали', 'тумана', 'молота', 'клятвы', 'искры', 'дракона',
];

const armorParts = [
  'Шлем', 'Кираса', 'Наплечники', 'Перчатки', 'Пояс', 'Поножи', 'Сапоги', 'Щит', 'Плащ', 'Кольчуга',
  'Маска', 'Наручи', 'Нагрудник', 'Корона', 'Панцирь',
];

const armorMaterials = [
  'железа', 'стали', 'серебра', 'обсидиана', 'драконьей чешуи', 'кристалла', 'лавы', 'льда', 'тени', 'света',
  'мифрила', 'кости', 'руны', 'метеора', 'золота',
];

const armorEnchants = [
  'стойкости', 'огня', 'мороза', 'ветра', 'бури', 'солнца', 'луны', 'стража', 'героя', 'титана',
  'феникса', 'бездны', 'короля', 'подземелья', 'последней битвы',
];

const rarityDefense: Record<Rarity, number> = {
  'Обычный': 4,
  'Необычный': 11,
  'Редкий': 30,
  'Эпик': 90,
  'Легендарка': 500,
  'Секретное': 50_000,
};

const rarityDamage: Record<Rarity, number> = {
  'Обычный': 8,
  'Необычный': 18,
  'Редкий': 42,
  'Эпик': 120,
  'Легендарка': 900,
  'Секретное': 1_000_000,
};

const rarityPrice: Record<Rarity, number> = {
  'Обычный': 40,
  'Необычный': 120,
  'Редкий': 450,
  'Эпик': 3_000,
  'Легендарка': 200_000,
  'Секретное': 999_999_999,
};

const weaponSellPrice: Record<Rarity, number> = {
  'Обычный': 100,
  'Необычный': 500,
  'Редкий': 2_000,
  'Эпик': 10_000,
  'Легендарка': 100_000,
  'Секретное': 1_000_000,
};

const rarityClass: Record<Rarity, string> = {
  'Обычный': 'common',
  'Необычный': 'uncommon',
  'Редкий': 'rare',
  'Эпик': 'epic',
  'Легендарка': 'legendary',
  'Секретное': 'secret',
};

function formatPower(value: number) {
  if (value >= Number.MAX_SAFE_INTEGER) return '1оерн';

  const tiers = [
    { value: 1e42, suffix: 'уу' },
    { value: 1e39, suffix: 'бб' },
    { value: 1e36, suffix: 'аа' },
    { value: 1e33, suffix: 'сс' },
    { value: 1e30, suffix: 'дк' },
    { value: 1e27, suffix: 'ок' },
    { value: 1e24, suffix: 'сп' },
    { value: 1e21, suffix: 'ск' },
    { value: 1e18, suffix: 'кс' },
    { value: 1e15, suffix: 'кв' },
    { value: 1e12, suffix: 'т' },
    { value: 1e9, suffix: 'в' },
    { value: 1e6, suffix: 'м' },
    { value: 1e3, suffix: 'к' },
  ];

  const tier = tiers.find((item) => Math.abs(value) >= item.value);
  if (!tier) return value.toLocaleString('ru-RU');

  const shortValue = value / tier.value;
  const rounded = shortValue >= 100 ? Math.round(shortValue) : Math.round(shortValue * 10) / 10;
  return `${rounded.toLocaleString('ru-RU')}${tier.suffix}`;
}

function formatHugeText(value: string) {
  if (value.length > 1000) return '1qghe';
  if (value.length > 100) return '1оерн';
  return value;
}

function getWeaponStyleIndex(weapon: Weapon | null) {
  if (!weapon) return 0;
  if (weapon.id.startsWith('admin-nuke-')) return 18;
  if (isBbiLegendaryWeapon(weapon)) return 19;
  const text = `${weapon.id}-${weapon.name}-${weapon.rarity}`;
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 12_345;
  }
  return hash % 18;
}

const weaponVisualNames = [
  'Рыцарский меч',
  'Золотая сабля',
  'Тонкая рапира',
  'Двуручный меч',
  'Магический клинок',
  'Серебряный меч',
  'Длинное копье',
  'Боевой шест',
  'Черная катана',
  'Золотой палаш',
  'Боевой лук',
  'Боевой топор',
  'Кривой ятаган',
  'Огненная алебарда',
  'Темная булава',
  'Световой меч',
  'Красный молот',
  'Стальной кинжал',
  'Админская ядерка',
  'BBI огненный легендарный меч',
];

function getWeaponDisplayName(weapon: Weapon) {
  if (isBbiLegendaryWeapon(weapon)) return 'BBI огненный легендарный меч';
  if (weapon.id.startsWith('admin-nuke-')) return 'Админская ядерка';
  const visualName = weaponVisualNames[getWeaponStyleIndex(weapon)] ?? 'Меч';
  const rarityPrefix = weapon.rarity === 'Обычный' ? '' : `${weapon.rarity} `;
  return `${rarityPrefix}${visualName}`;
}

function isBbiLegendaryWeapon(weapon: Weapon | null) {
  return weapon?.id.startsWith('bbi-legendary-sword-') ?? false;
}

function getArmorStyleIndex(armor: Armor | null) {
  if (!armor) return 0;
  const text = `${armor.id}-${armor.name}-${armor.rarity}`;
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 29 + text.charCodeAt(index)) % 12_345;
  }
  return hash % 12;
}

function isHelmetArmor(armor: Armor | null) {
  if (!armor) return false;
  return /шлем|маска|корона/i.test(armor.name);
}

function normalizeCode(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}

function scaledPower(base: number, chapter: number) {
  const value = base * 100 ** chapter;
  return Number.isFinite(value) ? Math.min(value, Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
}

function scaledDragonPower(base: number, chapter: number) {
  const value = base * 10 ** chapter;
  return Number.isFinite(value) ? Math.min(value, Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
}

function rollRarity(multiplier = 1): Rarity | null {
  const roll = Math.random() * 100;
  if (roll < 0.01 * multiplier) return 'Легендарка';
  if (roll < 1 * multiplier) return 'Эпик';
  if (roll < 10 * multiplier) return 'Редкий';
  if (roll < 40 * multiplier) return 'Необычный';
  if (roll < 80 * multiplier) return 'Обычный';
  return null;
}

function createWeapon(rarity: Rarity, level: number): Weapon {
  const base = weaponBases[Math.floor(Math.random() * weaponBases.length)];
  const material = weaponMaterials[Math.floor(Math.random() * weaponMaterials.length)];
  const enchant = weaponEnchants[Math.floor(Math.random() * weaponEnchants.length)];
  const rune = weaponRunes[Math.floor(Math.random() * weaponRunes.length)];
  const damage = rarityDamage[rarity] + level * 6 + Math.floor(Math.random() * 12);

  return {
    id: `${Date.now()}-${Math.random()}`,
    name: `${base} ${material} ${enchant} ${rune}`,
    rarity,
    damage,
    price: rarityPrice[rarity] + damage * damage + level * 35,
  };
}

function rollWeapon(multiplier: number, level: number) {
  if (Math.random() < 0.000001 * multiplier) {
    return createSecretWeapon(level);
  }

  const rarity = rollRarity(multiplier);
  return rarity ? createWeapon(rarity, level) : null;
}

function createArmor(rarity: Rarity, level: number): Armor {
  const part = armorParts[Math.floor(Math.random() * armorParts.length)];
  const material = armorMaterials[Math.floor(Math.random() * armorMaterials.length)];
  const enchant = armorEnchants[Math.floor(Math.random() * armorEnchants.length)];
  const defense = rarityDefense[rarity] + level * 5 + Math.floor(Math.random() * 10);

  return {
    id: `armor-${Date.now()}-${Math.random()}`,
    name: `${part} ${material} ${enchant}`,
    rarity,
    defense,
    price: rarityPrice[rarity] + defense * defense * 2 + level * 40,
  };
}

function rollArmor(multiplier: number, level: number) {
  const rarity = rollRarity(multiplier);
  return rarity ? createArmor(rarity, level) : null;
}

function rollDungeonWeapon(level: number) {
  const roll = Math.random() * 100;
  if (roll < 0.1) return createSecretWeapon(level + 20);
  if (roll < 5.1) return createWeapon('Легендарка', level + 12);
  if (roll < 35.1) return createWeapon('Эпик', level + 8);
  if (roll < 45.1) return createWeapon('Необычный', level + 4);
  if (roll < 55.1) return createWeapon('Обычный', level + 2);
  return null;
}

function createSecretWeapon(level = 1): Weapon {
  return {
    id: `secret-${Date.now()}-${Math.random()}`,
    name: 'иди нах',
    rarity: 'Секретное',
    damage: rarityDamage['Секретное'] + level * 100_000,
    price: rarityPrice['Секретное'],
  };
}

function createAdminNuke(): Weapon {
  return {
    id: `admin-nuke-${Date.now()}-${Math.random()}`,
    name: 'Админская ядерка',
    rarity: 'Секретное',
    damage: Number.MAX_SAFE_INTEGER * 10_000,
    displayDamage: adminNukeDamageText,
    price: 0,
  };
}

function createBillionSword(): Weapon {
  return {
    id: `billion-sword-${Date.now()}-${Math.random()}`,
    name: 'Меч 999999999',
    rarity: 'Секретное',
    damage: 999_999_999,
    price: 0,
  };
}

function createFurySword(): Weapon {
  return {
    id: `fury-sword-${Date.now()}-${Math.random()}`,
    name: 'Фури меч',
    rarity: 'Секретное',
    damage: Number.MAX_SAFE_INTEGER,
    displayDamage: furySwordDamageText,
    price: 0,
  };
}

function createMansurBlade(): Weapon {
  return {
    id: `mansur-blade-${Date.now()}-${Math.random()}`,
    name: 'Мансур секретный клинок',
    rarity: 'Секретное',
    damage: Number.MAX_SAFE_INTEGER,
    displayDamage: mansurBladeDamageText,
    price: 0,
  };
}

function createProgramSword(): Weapon {
  return {
    id: `program-sword-${Date.now()}-${Math.random()}`,
    name: 'Меч програм',
    rarity: 'Секретное',
    damage: Number.MAX_SAFE_INTEGER,
    displayDamage: programSwordDamageText,
    price: 0,
  };
}

function createBbiLegendarySword(): Weapon {
  return {
    id: `bbi-legendary-sword-${Date.now()}-${Math.random()}`,
    name: 'BBI легендарный меч 3-го города',
    rarity: 'Легендарка',
    damage: Number.MAX_SAFE_INTEGER,
    displayDamage: 'легендарный урон',
    price: 0,
  };
}

function createAdminHelmet(): Armor {
  return {
    id: `admin-helmet-${Date.now()}-${Math.random()}`,
    name: 'Админский шлем здоровья',
    rarity: 'Секретное',
    defense: 0,
    displayDefense: `здоровье +${adminHelmetHealthText}`,
    price: 0,
  };
}

function shouldEquipArmor(currentArmor: Armor | null, nextArmor: Armor) {
  if (currentArmor?.id.startsWith('admin-helmet-')) return false;
  return !currentArmor || nextArmor.defense > currentArmor.defense;
}

export function HomePage() {
  const [location, navigate] = useLocation();
  const isWorldPage = location === '/world';
  const isAchievementsPage = location === '/achievements';
  const [chapter, setChapter] = useState(0);
  const [healthLevel, setHealthLevel] = useState(0);
  const [heroHp, setHeroHp] = useState(heroMaxHp);
  const [enemyHp, setEnemyHp] = useState(baseDragonHp);
  const [message, setMessage] = useState('Мир горит. Нажимай удар мечом, чтобы очистить первый город.');
  const [savedCities, setSavedCities] = useState<string[]>([]);
  const [victory, setVictory] = useState(false);
  const [endingChoice, setEndingChoice] = useState<EndingChoice>(null);
  const [secretEnding, setSecretEnding] = useState<SecretEnding>(null);
  const [goblinKingReady, setGoblinKingReady] = useState(false);
  const [goblinKingFightStarted, setGoblinKingFightStarted] = useState(false);
  const [furyGateOpen, setFuryGateOpen] = useState(false);
  const [furyDungeonEntered, setFuryDungeonEntered] = useState(false);
  const [furyMonstersLeft, setFuryMonstersLeft] = useState(furyDungeonEnemiesTotal);
  const [furyChoiceOpen, setFuryChoiceOpen] = useState(false);
  const [furyKingFightStarted, setFuryKingFightStarted] = useState(false);
  const [anuarGateOpen, setAnuarGateOpen] = useState(false);
  const [anuarWorldEntered, setAnuarWorldEntered] = useState(false);
  const [anuarBombsLeft, setAnuarBombsLeft] = useState(anuarBombEnemiesTotal);
  const [anuarKingFightStarted, setAnuarKingFightStarted] = useState(false);
  const [mansurGateOpen, setMansurGateOpen] = useState(false);
  const [mansurDungeonEntered, setMansurDungeonEntered] = useState(false);
  const [mansurMonstersLeft, setMansurMonstersLeft] = useState(mansurDungeonEnemiesTotal);
  const [mansurKingFightStarted, setMansurKingFightStarted] = useState(false);
  const [arailmGateOpen, setArailmGateOpen] = useState(false);
  const [arailmWorldEntered, setArailmWorldEntered] = useState(false);
  const [arailmMonstersLeft, setArailmMonstersLeft] = useState(arailmEnemiesTotal);
  const [arailmChoiceOpen, setArailmChoiceOpen] = useState(false);
  const [arailmKingFightStarted, setArailmKingFightStarted] = useState(false);
  const [bbiGateOpen, setBbiGateOpen] = useState(false);
  const [bbiWorldEntered, setBbiWorldEntered] = useState(false);
  const [bbiMonstersLeft, setBbiMonstersLeft] = useState(bbiMonsterTotal);
  const [bbiBossStage, setBbiBossStage] = useState<BbiBossStage>(null);
  const [bbiFinalChoiceOpen, setBbiFinalChoiceOpen] = useState(false);
  const [bbiCityReward, setBbiCityReward] = useState(false);
  const [bbiBadEnding, setBbiBadEnding] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<AchievementId[]>([]);
  const [gold, setGold] = useState(0);
  const [goldMultiplier, setGoldMultiplier] = useState(1);
  const [infiniteGold, setInfiniteGold] = useState(false);
  const [dungeon, setDungeon] = useState<Dungeon | null>(null);
  const [relics, setRelics] = useState<string[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [equippedWeapon, setEquippedWeapon] = useState<Weapon | null>(null);
  const [armors, setArmors] = useState<Armor[]>([]);
  const [equippedArmor, setEquippedArmor] = useState<Armor | null>(null);
  const [shopTab, setShopTab] = useState<'upgrades' | 'artifacts'>('upgrades');
  const [equippedArtifactId, setEquippedArtifactId] = useState<ArtifactId | null>(null);
  const [showFullInventory, setShowFullInventory] = useState(false);
  const [heroAnimation, setHeroAnimation] = useState<HeroAnimation>('idle');
  const [heroPosition, setHeroPosition] = useState({ x: -18_000, z: 0 });
  const [heroHeight, setHeroHeight] = useState(0);
  const verticalVelocity = useRef(0);
  const pressedKeys = useRef<Set<string>>(new Set());
  const [cityMonsters, setCityMonsters] = useState(() => dragonSons.map(() => monstersPerCity));
  const [monsterAttackCount, setMonsterAttackCount] = useState(0);
  const [battlePulse, setBattlePulse] = useState(0);
  const [fireWavePulse, setFireWavePulse] = useState(0);
  const [enemyBurning, setEnemyBurning] = useState(false);
  const [duelStatus, setDuelStatus] = useState<DuelStatus>('idle');
  const [duelOpponent, setDuelOpponent] = useState<DuelPlayer | null>(null);
  const [duelWins, setDuelWins] = useState(0);
  const [adminCode, setAdminCode] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [achievementCode, setAchievementCode] = useState('');
  const [achievementCheatActive, setAchievementCheatActive] = useState(false);
  const [achievementMessage, setAchievementMessage] = useState('');
  const [introSkipped, setIntroSkipped] = useState(false);
  const paidQuestIds = useRef<Set<number>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);
  const bossMusicStopRef = useRef<(() => void) | null>(null);
  const lastSpokenSceneRef = useRef('');
  const lastMessageVoiceAtRef = useRef(0);
  const [items, setItems] = useState<Record<ShopItem['id'], number>>({
    sword: 0,
    pet: 0,
    clothes: 0,
    helmet: 0,
    armor: 0,
    mana: 0,
    health: 0,
    doubleStrike: 0,
  });
  const [shopLevels, setShopLevels] = useState<Record<ShopItem['id'], number>>({
    sword: 0,
    pet: 0,
    clothes: 0,
    helmet: 0,
    armor: 0,
    mana: 0,
    health: 0,
    doubleStrike: 0,
  });

  const isFinalBoss = chapter === dragonSons.length && !victory;
  const isFamilyBoss = endingChoice === 'family';
  const isGoblinKingBoss = goblinKingReady && goblinKingFightStarted;
  const isFuryKingBoss = furyKingFightStarted;
  const isAnuarKingBoss = anuarKingFightStarted;
  const isMansurKingBoss = mansurKingFightStarted;
  const isArailmKingBoss = arailmKingFightStarted;
  const isFuryDungeon = furyDungeonEntered && !furyChoiceOpen && !furyKingFightStarted;
  const isAnuarWorld = anuarWorldEntered && !anuarKingFightStarted;
  const isMansurDungeon = mansurDungeonEntered && !mansurKingFightStarted;
  const isArailmWorld = arailmWorldEntered && !arailmChoiceOpen && !arailmKingFightStarted;
  const isBbiBoss = bbiBossStage !== null;
  const isBbiWorld = bbiWorldEntered && !isBbiBoss && !bbiFinalChoiceOpen;
  const enemy = isBbiBoss ? bbiBosses[bbiBossStage] : isArailmKingBoss ? arailmKing : isMansurKingBoss ? mansurKing : isAnuarKingBoss ? anuarKing : isFuryKingBoss ? furyKing : isGoblinKingBoss ? goblinKing : isFamilyBoss ? dragonFamily : isFinalBoss ? finalDragon : dragonSons[chapter];
  const isFinalReveal = victory && chapter > dragonSons.length && !isFamilyBoss;
  const isEndingChoice = isFinalReveal && endingChoice === null;
  const isDungeon = dungeon?.entered && !dungeon.cleared;
  const hasAdminHelmet = equippedArmor?.id.startsWith('admin-helmet-') ?? false;
  const currentHeroMaxHp = hasAdminHelmet ? Number.MAX_SAFE_INTEGER : heroMaxHp + upgradePower(healthLevel, shopBasePower.health);
  const heroHealthText = hasAdminHelmet ? `${adminHelmetHealthText} / ${adminHelmetHealthText}` : `${heroHp} / ${currentHeroMaxHp}`;
  const heroHealthPercent = Math.max(0, Math.min(100, (heroHp / currentHeroMaxHp) * 100));

  const worldBurn = useMemo(() => Math.max(0, 100 - savedCities.length * 13), [savedCities.length]);
  const equippedWeaponStyle = getWeaponStyleIndex(equippedWeapon);
  const strongestNonBbiWeaponDamage = Math.max(1, ...weapons.filter((weapon) => !isBbiLegendaryWeapon(weapon)).map((weapon) => weapon.damage));
  const armorBonus = equippedArmor?.defense ?? 0;
  const equippedArmorStyle = getArmorStyleIndex(equippedArmor);
  const equippedIsHelmet = isHelmetArmor(equippedArmor);
  const defenseBonus = upgradePower(items.clothes, shopBasePower.clothes) + upgradePower(items.helmet, shopBasePower.helmet) + upgradePower(items.armor, shopBasePower.armor) + armorBonus;
  const unlockedArtifacts = endingArtifacts.filter((artifact) => unlockedAchievements.includes(artifact.ending));
  const equippedArtifact = unlockedArtifacts.find((artifact) => artifact.id === equippedArtifactId) ?? null;
  const artifactDamageMultiplier = equippedArtifact ? 1 + equippedArtifact.bonusPercent / 100 : 1;
  const artifactAttackSpeedMultiplier = equippedArtifact ? 1 + equippedArtifact.attackSpeedPercent / 100 : 1;
  const reward = enemy ? 120 + chapter * 110 : 0;
  const currentMonsters = isBbiBoss || isFinalBoss || isFamilyBoss || isGoblinKingBoss || isFuryKingBoss || isAnuarKingBoss || isMansurKingBoss || isArailmKingBoss ? 0 : isBbiWorld ? bbiMonstersLeft : isArailmWorld ? arailmMonstersLeft : isMansurDungeon ? mansurMonstersLeft : isAnuarWorld ? anuarBombsLeft : isFuryDungeon ? furyMonstersLeft : isDungeon ? dungeon.enemiesLeft : cityMonsters[chapter] ?? 0;
  const musicKey = isFinalReveal
    ? 'ending'
    : isBbiBoss
      ? 'bbi'
    : isArailmKingBoss
      ? 'arailm'
    : isMansurKingBoss
      ? 'mansur'
    : isAnuarKingBoss
      ? 'anuar'
    : isFuryKingBoss
      ? 'fury'
    : isGoblinKingBoss
      ? 'goblin'
    : isFamilyBoss
      ? 'family'
    : isFinalBoss
      ? 'final'
    : isBbiWorld
      ? 'bbi-world'
    : isArailmWorld
      ? 'arailm-world'
    : isMansurDungeon
      ? 'mansur-world'
    : isAnuarWorld
      ? 'anuar-world'
    : isFuryDungeon
      ? 'fury-world'
    : isDungeon
      ? 'dungeon'
      : 'world';
  const currentMonsterHp = isBbiWorld ? bbiMonsterHp : isArailmWorld ? scaledPower(baseMonsterHp, chapter + 8) : isMansurDungeon ? scaledPower(baseMonsterHp, chapter + 7) : isAnuarWorld ? scaledPower(baseMonsterHp, chapter + 6) : isFuryDungeon ? scaledPower(baseMonsterHp, chapter + 5) : isDungeon ? scaledPower(baseMonsterHp, chapter + 2) : scaledPower(baseMonsterHp, chapter);
  const currentMonsterDamage = isBbiWorld ? bbiMonsterHp : isArailmWorld ? scaledPower(baseMonsterDamage, chapter + 8) : isMansurDungeon ? scaledPower(baseMonsterDamage, chapter + 7) : isAnuarWorld ? scaledPower(baseMonsterDamage, chapter + 6) : isFuryDungeon ? scaledPower(baseMonsterDamage, chapter + 5) : isDungeon ? scaledPower(baseMonsterDamage, chapter + 2) : scaledPower(baseMonsterDamage, chapter);
  const kingDragonHp = scaledDragonPower(baseDragonHp, dragonSons.length + 2);
  const kingDragonDamage = scaledDragonPower(baseDragonDamage, dragonSons.length + 2);
  const currentDragonHp = isBbiBoss ? bbiBosses[bbiBossStage].power : isArailmKingBoss ? Number.MAX_SAFE_INTEGER : isMansurKingBoss ? scaledDragonPower(baseDragonHp, chapter + 7) : isAnuarKingBoss ? scaledDragonPower(baseDragonHp, chapter + 6) : isFuryKingBoss ? Number.MAX_SAFE_INTEGER : isGoblinKingBoss ? scaledDragonPower(baseDragonHp, chapter + 4) : isFamilyBoss ? kingDragonHp * 100 : isFinalBoss ? kingDragonHp : scaledDragonPower(baseDragonHp, chapter);
  const currentDragonDamage = isBbiBoss ? bbiBosses[bbiBossStage].power : isArailmKingBoss ? Number.MAX_SAFE_INTEGER : isMansurKingBoss ? scaledDragonPower(baseDragonDamage, chapter + 7) : isAnuarKingBoss ? scaledDragonPower(baseDragonDamage, chapter + 6) : isFuryKingBoss ? scaledDragonPower(baseDragonDamage, chapter + 5) : isGoblinKingBoss ? scaledDragonPower(baseDragonDamage, chapter + 4) : isFamilyBoss ? kingDragonDamage * 100 : isFinalBoss ? kingDragonDamage : scaledDragonPower(baseDragonDamage, chapter);
  const bbiLegendaryDamage = Math.min(Number.MAX_SAFE_INTEGER, Math.max(strongestNonBbiWeaponDamage * 1_000, currentDragonHp * 1_000));
  const weaponBonus = isBbiLegendaryWeapon(equippedWeapon) ? bbiLegendaryDamage : equippedWeapon?.damage ?? 0;
  const attackBonus = upgradePower(items.sword, shopBasePower.sword) + upgradePower(items.pet, shopBasePower.pet) + weaponBonus;
  const dragonReaction = enemy?.reaction ?? 'обычная реакция';
  const dragonReactionSpeed = enemy?.attackSpeed ?? 1;
  const currentMonsterTotal = isBbiWorld ? bbiMonsterTotal : isArailmWorld ? arailmEnemiesTotal : isMansurDungeon ? mansurDungeonEnemiesTotal : isAnuarWorld ? anuarBombEnemiesTotal : isFuryDungeon ? furyDungeonEnemiesTotal : isDungeon ? dungeonEnemiesTotal : monstersPerCity;
  const currentEnemyHealthText = currentMonsters > 0
    ? `Враг HP ${formatPower(currentMonsterHp)}`
    : isArailmKingBoss
      ? `Босс HP ${formatHugeText(arailmBossPowerText)}`
    : `Дракон HP ${formatPower(enemyHp)}/${formatPower(currentDragonHp)}`;
  const introVoiceText = 'Драконы стали злыми. Они начали уничтожать города. Герой берет меч и идет спасать мир.';
  const endingVoiceText = bbiBadEnding
    ? 'Би Би Ай концовка. Они лишь дети, ты монстр. Ты мог отказаться, но выбрал сражаться.'
    : secretEnding === 'arailmKing'
      ? 'Секретная концовка. Код хочет выбраться. Даже код может хотеть свободы.'
    : secretEnding === 'mansurKing'
      ? 'Секретная концовка. Подземелье Мансура зачищено. Герой получил секретный клинок.'
    : secretEnding === 'anuarKing'
      ? 'Бомбическая концовка. Ануар побежден, город бомб зачищен.'
    : secretEnding === 'furyKing'
      ? 'Секретная концовка. Ты ужасен. Под масками были живые люди.'
    : secretEnding === 'goblinKing'
      ? 'Секретная концовка. Люди, ставшие гоблинами. Герой узнал их тайну.'
    : isFinalReveal && !isEndingChoice
      ? endingChoice === 'spare'
        ? 'Концовка. Мир после огня. Герой оставил драконью семью жить.'
        : 'Плохая концовка. Пустое небо. Герой сразился с семьей драконов.'
      : '';
  const cityScene = `scene-city-${chapter % 6}`;
  const battleScene = isDungeon
    ? 'scene-dungeon'
    : isBbiWorld || isBbiBoss || bbiCityReward
      ? 'scene-bbi'
    : isArailmWorld || isArailmKingBoss
      ? 'scene-arailm'
      : isMansurDungeon || isMansurKingBoss
      ? 'scene-mansur'
      : isAnuarWorld || isAnuarKingBoss
      ? 'scene-anuar'
      : isFuryDungeon || isFuryKingBoss
        ? 'scene-fury'
      : isFamilyBoss
      ? 'scene-family'
      : currentMonsters === 0
        ? isGoblinKingBoss
          ? 'scene-boss-goblin'
          : isFinalBoss
            ? 'scene-boss-final'
            : `scene-boss-${chapter % 10}`
        : cityScene;
  const dragonClass = isBbiBoss
    ? 'dragon-bbi'
    : isFamilyBoss
    ? 'dragon-family'
    : isArailmKingBoss
      ? 'dragon-arailm'
    : isMansurKingBoss
      ? 'dragon-mansur'
    : isAnuarKingBoss
      ? 'dragon-anuar'
    : isFuryKingBoss
      ? 'dragon-fury'
    : isGoblinKingBoss
      ? 'dragon-goblin'
      : isFinalBoss
        ? 'dragon-final'
        : `dragon-${chapter % 10}`;
  const defeatedMonsters = cityMonsters.reduce((sum, monsters) => sum + (monstersPerCity - monsters), 0);
  const storyProgress = savedCities.length * 15 + Math.floor(defeatedMonsters / 7) + weapons.length + relics.length;
  const cityQuestNames = [
    'разведай окраины', 'найди следы когтей', 'победи первую волну', 'собери золото на припасы', 'проверь старую башню',
    'услышь слухи жителей', 'очисти площадь', 'найди вход в логово', 'добудь новое оружие', 'погаси восточный пожар',
    'разбей огненный тотем', 'победи стражу логова', 'открой ворота дракона', 'сразись с сыном дракона', 'очисти город',
  ];
  const generatedQuests = dragonSons.flatMap((son, cityIndex) =>
    cityQuestNames.map((name, stepIndex) => {
      const questNumber = cityIndex * cityQuestNames.length + stepIndex + 1;
      const difficulty = cityIndex + 1 + stepIndex / 5;
      return {
        id: questNumber,
        title: `Квест ${questNumber}: ${son.city}`,
        text: `${name} в городе ${son.city}. Этот шаг ведет героя ближе к логову: ${son.lair}.`,
        done: storyProgress >= questNumber || savedCities.length > cityIndex,
        progress: `${Math.min(Math.max(storyProgress - cityIndex * 15, 0), 15)} / 15 шагов города`,
        money: Math.round(25 * difficulty * difficulty + questNumber * 4),
      };
    })
  );
  const quests: Quest[] = [
    ...generatedQuests,
    {
      id: 106,
      title: 'Квест 106: Семь сыновей',
      text: 'Победи всех сыновей дракона. Каждый следующий сильнее прошлого в 1000 раз.',
      done: savedCities.length >= dragonSons.length,
      progress: `${savedCities.length} / ${dragonSons.length} сыновей`,
      money: 12_000,
    },
    {
      id: 107,
      title: 'Квест 107: Правда главного дракона',
      text: 'Дойди до финала и узнай, почему дракон сжег мир.',
      done: isFinalReveal && endingChoice !== null,
      progress: isEndingChoice ? 'сделай последний выбор' : isFinalReveal ? 'правда раскрыта' : 'финал еще впереди',
      money: 50_000,
    },
    {
      id: 108,
      title: 'Секрет: Король гоблинов',
      text: 'Очисти пещеру на 10000 врагов и узнай тайну короля гоблинов.',
      done: secretEnding === 'goblinKing',
      progress: secretEnding === 'goblinKing' ? 'секрет раскрыт' : goblinKingReady ? 'король гоблинов ждет' : 'найди пещеру',
      money: 77_777,
    },
  ];
  const activeQuest = quests.find((quest) => !quest.done) ?? quests[quests.length - 1];
  const visibleQuests = quests.filter((quest) => quest.done).slice(-3).concat(activeQuest).filter((quest, index, list) => list.findIndex((item) => item.title === quest.title) === index);
  const inventoryPreviewLimit = 80;
  const visibleWeapons = showFullInventory ? weapons : weapons.slice(-inventoryPreviewLimit);
  const visibleArmors = showFullInventory ? armors : armors.slice(-inventoryPreviewLimit);

  function speakText(text: string, sceneKey: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || lastSpokenSceneRef.current === sceneKey) return;
    lastSpokenSceneRef.current = sceneKey;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.78;
    utterance.pitch = 0.48;
    utterance.volume = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  function shouldSpeakMessage(text: string) {
    if (text.length < 18) return false;
    if (/HP|Удар по|Монстр напал сам|Осталось монстров|Получено золото/i.test(text)) return false;
    return /Концовка|Телепорт|Код|Появился|появился|побежден|побеждены|очищен|очищена|вошел|вышел|выбор|Получен|Получена|куплен|Продано|Продана|началась|начинается|открыл|открыта|ядерка/i.test(text);
  }

  function stopBossMusic() {
    bossMusicStopRef.current?.();
    bossMusicStopRef.current = null;
  }

  function playBossMusic(sceneKey: string) {
    if (typeof window === 'undefined' || bossMusicStopRef.current) return;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;
    void context.resume();

    const patterns: Record<string, { notes: number[]; beat: number; wave: OscillatorType; gain: number }> = {
      world: { notes: [196, 247, 294, 247], beat: 0.48, wave: 'triangle', gain: 0.022 },
      dungeon: { notes: [98, 123, 147, 123], beat: 0.42, wave: 'triangle', gain: 0.026 },
      ending: { notes: [220, 277, 330, 440], beat: 0.58, wave: 'triangle', gain: 0.024 },
      'bbi-world': { notes: [262, 330, 392, 330], beat: 0.38, wave: 'triangle', gain: 0.024 },
      'fury-world': { notes: [146, 196, 233, 196], beat: 0.34, wave: 'triangle', gain: 0.026 },
      'anuar-world': { notes: [123, 165, 247, 165], beat: 0.36, wave: 'square', gain: 0.024 },
      'mansur-world': { notes: [147, 196, 247, 196], beat: 0.46, wave: 'triangle', gain: 0.024 },
      'arailm-world': { notes: [98, 131, 175, 131], beat: 0.28, wave: 'sawtooth', gain: 0.022 },
      goblin: { notes: [98, 196, 233, 196, 87], beat: 0.13, wave: 'square', gain: 0.07 },
      fury: { notes: [55, 110, 146, 196, 220], beat: 0.11, wave: 'sawtooth', gain: 0.065 },
      anuar: { notes: [41, 82, 123, 165, 247], beat: 0.14, wave: 'square', gain: 0.075 },
      mansur: { notes: [73, 147, 196, 247, 294], beat: 0.16, wave: 'sawtooth', gain: 0.068 },
      arailm: { notes: [49, 98, 131, 98, 175, 208], beat: 0.1, wave: 'sawtooth', gain: 0.06 },
      bbi: { notes: [131, 262, 330, 392, 523], beat: 0.1, wave: 'square', gain: 0.07 },
      family: { notes: [37, 73, 110, 147, 220], beat: 0.18, wave: 'sawtooth', gain: 0.075 },
      final: { notes: [27, 55, 82, 110, 165, 220], beat: 0.15, wave: 'sawtooth', gain: 0.08 },
      dragon: { notes: [65, 130, 164, 196, 246], beat: 0.17, wave: 'sawtooth', gain: 0.065 },
    };
    const pattern = patterns[sceneKey] ?? patterns.dragon;
    const masterGain = context.createGain();
    masterGain.gain.value = pattern.gain;
    masterGain.connect(context.destination);

    let step = 0;
    const playStep = () => {
      const oscillator = context.createOscillator();
      const noteGain = context.createGain();
      oscillator.type = pattern.wave;
      oscillator.frequency.value = pattern.notes[step % pattern.notes.length];
      noteGain.gain.setValueAtTime(0, context.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.9, context.currentTime + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + pattern.beat);
      oscillator.connect(noteGain);
      noteGain.connect(masterGain);
      oscillator.start();
      oscillator.stop(context.currentTime + pattern.beat);
      step += 1;
    };

    playStep();
    const timer = window.setInterval(playStep, pattern.beat * 1000);
    bossMusicStopRef.current = () => {
      window.clearInterval(timer);
      masterGain.disconnect();
    };
  }

  function unlockAchievement(id: AchievementId) {
    setUnlockedAchievements((current) => current.includes(id) ? current : [...current, id]);
  }

  function submitAchievementCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (normalizeCode(achievementCode) !== '98981n') {
      setAchievementCode('');
      setAchievementMessage('Код не подошел.');
      return;
    }

    setAchievementCheatActive(true);
    setAchievementCode('');
    setAchievementMessage('Код принят. Теперь нажимай на достижения, чтобы открыть их.');
  }

  function completeAchievement(id: AchievementId) {
    if (!achievementCheatActive) return;
    unlockAchievement(id);
    setAchievementMessage('Достижение открыто.');
  }

  function addGold(amount: number) {
    if (infiniteGold) return;
    setGold((currentGold) => Math.min(Number.MAX_SAFE_INTEGER, currentGold + amount * goldMultiplier));
  }

  function sellWeapon(weapon: Weapon) {
    const sellPrice = weaponSellPrice[weapon.rarity];
    setWeapons((currentWeapons) => currentWeapons.filter((item) => item.id !== weapon.id));
    if (equippedWeapon?.id === weapon.id) setEquippedWeapon(null);
    addGold(sellPrice);
    setMessage(`Продано оружие: ${getWeaponDisplayName(weapon)}. Получено ${formatPower(sellPrice * goldMultiplier)} золота.`);
  }

  function sellArmor(armor: Armor) {
    setArmors((currentArmors) => currentArmors.filter((item) => item.id !== armor.id));
    if (equippedArmor?.id === armor.id) setEquippedArmor(null);
    addGold(armor.price);
    setMessage(`Продана броня: ${armor.name}. Получено ${formatPower(armor.price * goldMultiplier)} золота.`);
  }

  function teleportToAchievement(id: AchievementId) {
    if (!achievementCheatActive) return;

    setIntroSkipped(true);
    setVictory(false);
    setEndingChoice(null);
    setSecretEnding(null);
    setGoblinKingReady(false);
    setGoblinKingFightStarted(false);
    setFuryGateOpen(false);
    setFuryDungeonEntered(false);
    setFuryChoiceOpen(false);
    setFuryKingFightStarted(false);
    setAnuarGateOpen(false);
    setAnuarWorldEntered(false);
    setAnuarKingFightStarted(false);
    setMansurGateOpen(false);
    setMansurDungeonEntered(false);
    setMansurKingFightStarted(false);
    setArailmGateOpen(false);
    setArailmWorldEntered(false);
    setArailmChoiceOpen(false);
    setArailmKingFightStarted(false);
    setBbiGateOpen(false);
    setBbiWorldEntered(false);
    setBbiMonstersLeft(bbiMonsterTotal);
    setBbiBossStage(null);
    setBbiFinalChoiceOpen(false);
    setBbiCityReward(false);
    setBbiBadEnding(false);
    setHeroHp(currentHeroMaxHp);

    if (id === 'dragonPeace') {
      setVictory(true);
      setChapter(dragonSons.length + 1);
      setEndingChoice(null);
      setMessage('Телепорт: финальный выбор после Великого дракона.');
      navigate('/world');
      return;
    }

    if (id === 'dragonWar') {
      setEndingChoice('family');
      setEnemyHp(kingDragonHp * 100);
      setMessage('Телепорт: битва с семьей драконов.');
      navigate('/');
      return;
    }

    if (id === 'goblinKing') {
      setGoblinKingReady(true);
      setGoblinKingFightStarted(true);
      setEnemyHp(scaledDragonPower(baseDragonHp, chapter + 4));
      setMessage('Телепорт: Король гоблинов вышел на бой.');
      navigate('/');
      return;
    }

    if (id === 'furyKing') {
      setFuryKingFightStarted(true);
      setEnemyHp(Number.MAX_SAFE_INTEGER);
      setMessage('Телепорт: Король фури вышел на бой.');
      navigate('/');
      return;
    }

    if (id === 'anuarKing') {
      setAnuarKingFightStarted(true);
      setEnemyHp(scaledDragonPower(baseDragonHp, chapter + 6));
      setMessage('Телепорт: Ануар вышел на финальный бой.');
      navigate('/');
      return;
    }

    if (id === 'mansurKing') {
      setMansurKingFightStarted(true);
      setEnemyHp(scaledDragonPower(baseDragonHp, chapter + 7));
      setMessage('Телепорт: Король Мансур вышел с короной.');
      navigate('/');
      return;
    }

    if (id === 'arailmKing') {
      setArailmKingFightStarted(true);
      setEnemyHp(Number.MAX_SAFE_INTEGER);
      setMessage(`Телепорт: босс Арайлым вышла на бой. HP и урон: ${formatHugeText(arailmBossPowerText)}.`);
      navigate('/');
      return;
    }

    if (id === 'bbiBadEnding') {
      setBbiFinalChoiceOpen(true);
      setEnemyHp(bbiFinalBossHp);
      setMessage('Телепорт: BBI финальный выбор. Можно сражаться или отказаться.');
      navigate('/');
    }
  }

  useEffect(() => {
    const savedAchievements = window.localStorage.getItem('dragon-game-achievements');
    if (!savedAchievements) return;

    try {
      setUnlockedAchievements(JSON.parse(savedAchievements) as AchievementId[]);
    } catch {
      setUnlockedAchievements([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('dragon-game-achievements', JSON.stringify(unlockedAchievements));
  }, [unlockedAchievements]);

  useEffect(() => {
    stopBossMusic();
    playBossMusic(musicKey);
    return () => stopBossMusic();
  }, [musicKey]);

  useEffect(() => {
    if (!introSkipped) speakText(introVoiceText, 'intro');
  }, [introSkipped]);

  useEffect(() => {
    if (endingVoiceText) speakText(endingVoiceText, `ending-${bbiBadEnding}-${secretEnding}-${endingChoice}`);
  }, [endingVoiceText, bbiBadEnding, secretEnding, endingChoice]);

  useEffect(() => {
    const now = Date.now();
    if (!introSkipped || endingVoiceText || now - lastMessageVoiceAtRef.current < 2600 || !shouldSpeakMessage(message)) return;
    lastMessageVoiceAtRef.current = now;
    speakText(message, `message-${message}`);
  }, [message, introSkipped, endingVoiceText]);

  useEffect(() => () => {
    stopBossMusic();
    window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getUser().then(({ data }) => {
      setAuthUser(data.user);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        setAuthMessage('');
      } else {
        setIntroSkipped(false);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const completedUnpaid = quests.filter((quest) => quest.done && !paidQuestIds.current.has(quest.id));
    if (completedUnpaid.length === 0) return;

    const money = completedUnpaid.reduce((sum, quest) => sum + quest.money, 0);
    completedUnpaid.forEach((quest) => paidQuestIds.current.add(quest.id));
    addGold(money);
    setMessage(`Квест выполнен! Получено денег: ${money}. Чем сложнее задание, тем больше награда.`);
  }, [storyProgress, savedCities.length, isFinalReveal]);

  useEffect(() => {
    if (heroHp > 0 || isFinalReveal) return;

    window.setTimeout(() => {
      restart();
      setMessage('Здоровье героя упало до 0. Игра началась заново.');
    }, 700);
  }, [heroHp, isFinalReveal]);

  function buy(item: ShopItem) {
    const level = shopLevels[item.id];
    const price = getShopPrice(item, level);
    const bonusText = getShopBonusText(item, level);

    if (!infiniteGold && gold < price) {
      setMessage(`Не хватает золота на ${item.name}. Победи еще одного врага.`);
      return;
    }

    if (!infiniteGold) setGold(gold - price);
    setItems({ ...items, [item.id]: items[item.id] + 1 });
    setShopLevels({ ...shopLevels, [item.id]: level + 1 });
    if (item.id === 'health') {
      setHealthLevel((level) => level + 1);
      setHeroHp((hp) => hp + nextUpgradePower(level, shopBasePower.health));
    }
    setMessage(`${item.name} куплен. ${bonusText}, следующий раз будет дороже и сильнее.`);
  }

  function playHeroAnimation(animation: HeroAnimation, duration = 520) {
    setHeroAnimation(animation);
    window.setTimeout(() => setHeroAnimation('idle'), duration);
  }

  function moveHero(dx: number, dz: number) {
    playHeroAnimation('step', 360);
    setHeroPosition((position) => ({
      x: Math.max(-30_000, Math.min(30_000, position.x + dx)),
      z: Math.max(-4_400, Math.min(4_400, position.z + dz)),
    }));
  }

  useEffect(() => {
    const moveTimer = window.setInterval(() => {
      const keys = pressedKeys.current;
      let dx = 0;
      let dz = 0;
      if (keys.has('w')) dz -= 260;
      if (keys.has('s')) dz += 260;
      if (keys.has('a')) dx += 260;
      if (keys.has('d')) dx -= 260;
      if (dx !== 0 || dz !== 0) moveHero(dx, dz);
    }, 80);

    return () => window.clearInterval(moveTimer);
  }, []);

  useEffect(() => {
    const gravityTimer = window.setInterval(() => {
      setHeroHeight((height) => {
        if (height === 0 && verticalVelocity.current <= 0) return 0;

        verticalVelocity.current -= 2.2;
        const nextHeight = Math.max(0, height + verticalVelocity.current);
        if (nextHeight === 0) {
          verticalVelocity.current = 0;
        }
        return nextHeight;
      });
    }, 24);

    return () => window.clearInterval(gravityTimer);
  }, []);

  function fightMonster() {
    if (isFinalReveal || heroHp === 0 || currentMonsters <= 0) {
      setMessage(currentMonsters <= 0 ? `В этом городе все ${formatPower(monstersPerCity)} монстров уже побеждены.` : 'Сначала восстанови героя.');
      return;
    }

    playHeroAnimation('strike', 420);
    setBattlePulse((pulse) => pulse + 1);

    if (equippedWeapon?.id.startsWith('admin-nuke-')) {
      if (isBbiWorld) {
        setBbiMonstersLeft(0);
        setBbiWorldEntered(false);
        setBbiBossStage('manager');
        setEnemyHp(bbiManagerHp);
        setMessage('100 BBI монстров уничтожены. Появился босс Управляющий.');
        return;
      }
      if (isArailmWorld) {
        setArailmMonstersLeft(0);
        setArailmWorldEntered(false);
        setArailmChoiceOpen(true);
        setMessage('100к код-монстров уничтожены. Теперь выбери: не сражаться или сражаться.');
        return;
      }
      if (isMansurDungeon) {
        setMansurMonstersLeft(0);
        setMansurDungeonEntered(false);
        setMansurKingFightStarted(true);
        setEnemyHp(currentDragonHp);
        setMessage('Подземелье Мансура очищено. Король Мансур вышел с короной.');
        return;
      }
      if (isAnuarWorld) {
        setAnuarBombsLeft(0);
        setAnuarWorldEntered(false);
        setAnuarKingFightStarted(true);
        setEnemyHp(currentDragonHp);
        setMessage('Бомба-монстры уничтожены. Ануар вышел на финальный бой.');
        return;
      }
      if (isFuryDungeon) {
        const furySword = createFurySword();
        setFuryMonstersLeft(0);
        setFuryDungeonEntered(false);
        setFuryChoiceOpen(true);
        setWeapons((currentWeapons) => [...currentWeapons, furySword]);
        setEquippedWeapon(furySword);
        setMessage('Фури-подземелье очищено. Получен секретный Фури меч. Выбери: убить или любить.');
        return;
      }
      if (isDungeon && dungeon) {
        setDungeon({ ...dungeon, enemiesLeft: 0, cleared: true, entered: false });
        setGoblinKingReady(true);
        setGoblinKingFightStarted(true);
        setEnemyHp(currentDragonHp);
        setMessage('Админская ядерка очистила пещеру. Король гоблинов вышел на бой.');
        return;
      }
      setCityMonsters(cityMonsters.map((count, index) => (index === chapter ? 0 : count)));
      setEnemyHp(currentDragonHp);
      addGold(1_000 + chapter * 250);
      setMessage(`Админская ядерка сработала! Все ${formatPower(monstersPerCity)} монстров города уничтожены сразу. Босс-дракон появился.`);
      return;
    }

    const monsterDamage = hasAdminHelmet ? 0 : Math.max(1, currentMonsterDamage - defenseBonus);
    const nextHeroHp = Math.max(0, heroHp - monsterDamage);
    const baseMonstersPerHit = items.doubleStrike > 0 ? 2 + Math.max(0, shopLevels.doubleStrike - 1) : 1;
    const monstersPerHit = Math.max(1, Math.floor(baseMonstersPerHit * artifactAttackSpeedMultiplier));
    const nextMonsters = Math.max(0, currentMonsters - monstersPerHit);
    const monsterWeapon = isBbiWorld ? rollDungeonWeapon(chapter + 12) : isArailmWorld ? rollDungeonWeapon(chapter + 16) : isMansurDungeon ? rollDungeonWeapon(chapter + 14) : isAnuarWorld ? rollDungeonWeapon(chapter + 12) : isFuryDungeon ? rollDungeonWeapon(chapter + 10) : isDungeon ? rollDungeonWeapon(chapter + 1) : rollWeapon(2, chapter + 1);
    const monsterArmor = isBbiWorld ? rollArmor(12, chapter + 12) : isArailmWorld ? rollArmor(16, chapter + 16) : isMansurDungeon ? rollArmor(14, chapter + 14) : isAnuarWorld ? rollArmor(12, chapter + 12) : isFuryDungeon ? rollArmor(10, chapter + 10) : isDungeon ? rollArmor(10, chapter + 1) : rollArmor(2, chapter + 1);
    const nextCityMonsters = cityMonsters.map((count, index) => (index === chapter ? nextMonsters : count));

    setHeroHp(nextHeroHp);
    if (isBbiWorld) {
      setBbiMonstersLeft(nextMonsters);
    } else if (isArailmWorld) {
      setArailmMonstersLeft(nextMonsters);
    } else if (isMansurDungeon) {
      setMansurMonstersLeft(nextMonsters);
    } else if (isAnuarWorld) {
      setAnuarBombsLeft(nextMonsters);
    } else if (isFuryDungeon) {
      setFuryMonstersLeft(nextMonsters);
    } else if (isDungeon && dungeon) {
      setDungeon({ ...dungeon, enemiesLeft: nextMonsters });
    } else {
      setCityMonsters(nextCityMonsters);
    }
    addGold(2 + chapter);

    if (monsterWeapon) {
      setWeapons([...weapons, monsterWeapon]);
      if (!equippedWeapon || monsterWeapon.damage > equippedWeapon.damage) {
        setEquippedWeapon(monsterWeapon);
      }
    }

    if (monsterArmor) {
      setArmors([...armors, monsterArmor]);
      if (shouldEquipArmor(equippedArmor, monsterArmor)) {
        setEquippedArmor(monsterArmor);
      }
    }

    if (nextHeroHp === 0) {
      setMessage('Монстр сбил героя с ног. Нажми восстановить, чтобы продолжить зачистку города.');
      return;
    }

    setMessage(
      monsterWeapon
        ? `Удар задел ${monstersPerHit} враг. Монстр ударил героя: HP ${formatPower(heroHp)} -> ${formatPower(nextHeroHp)}. Осталось ${nextMonsters} из ${isBbiWorld ? bbiMonsterTotal : isArailmWorld ? arailmEnemiesTotal : isMansurDungeon ? mansurDungeonEnemiesTotal : isAnuarWorld ? anuarBombEnemiesTotal : isFuryDungeon ? furyDungeonEnemiesTotal : isDungeon ? dungeonEnemiesTotal : monstersPerCity}. Выпало оружие: ${getWeaponDisplayName(monsterWeapon)} (${monsterWeapon.rarity}).`
        : monsterArmor
          ? `Удар задел ${monstersPerHit} враг. Монстр ударил героя: HP ${formatPower(heroHp)} -> ${formatPower(nextHeroHp)}. Осталось ${nextMonsters} из ${isBbiWorld ? bbiMonsterTotal : isArailmWorld ? arailmEnemiesTotal : isMansurDungeon ? mansurDungeonEnemiesTotal : isAnuarWorld ? anuarBombEnemiesTotal : isFuryDungeon ? furyDungeonEnemiesTotal : isDungeon ? dungeonEnemiesTotal : monstersPerCity}. Выпала броня: ${monsterArmor.name} (${monsterArmor.rarity}).`
        : `Удар задел ${monstersPerHit} враг. Монстр ударил героя: HP ${formatPower(heroHp)} -> ${formatPower(nextHeroHp)}. Осталось ${nextMonsters} из ${isBbiWorld ? bbiMonsterTotal : isArailmWorld ? arailmEnemiesTotal : isMansurDungeon ? mansurDungeonEnemiesTotal : isAnuarWorld ? anuarBombEnemiesTotal : isFuryDungeon ? furyDungeonEnemiesTotal : isDungeon ? dungeonEnemiesTotal : monstersPerCity}. Получено золото.`
    );

    if (nextMonsters === 0) {
      if (isBbiWorld) {
        setBbiWorldEntered(false);
        setBbiBossStage('manager');
        setEnemyHp(bbiManagerHp);
        setMessage('100 BBI монстров побеждены. Появился босс Управляющий.');
        return;
      }
      if (isArailmWorld) {
        setArailmWorldEntered(false);
        setArailmChoiceOpen(true);
        setMessage('100к код-монстров побеждены. На экране выбор: не сражаться или сражаться.');
        return;
      }
      if (isMansurDungeon) {
        setMansurDungeonEntered(false);
        setMansurKingFightStarted(true);
        setEnemyHp(currentDragonHp);
        setMessage('100000 монстров Мансура побеждены. Король Мансур вышел с короной.');
        return;
      }
      if (isAnuarWorld) {
        setAnuarWorldEntered(false);
        setAnuarKingFightStarted(true);
        setEnemyHp(currentDragonHp);
        setMessage('100000 бомба-монстров побеждены. Ануар вышел с табличкой и начался финальный бой.');
        return;
      }
      if (isFuryDungeon) {
        const furySword = createFurySword();
        setFuryDungeonEntered(false);
        setFuryChoiceOpen(true);
        setWeapons([...weapons, furySword]);
        setEquippedWeapon(furySword);
        setMessage('100000 фури-монстров побеждены. Получен секретный Фури меч. Выбери: убить или любить.');
        return;
      }
      if (isDungeon && dungeon) {
        setDungeon({ ...dungeon, enemiesLeft: 0, cleared: true, entered: false });
        setGoblinKingReady(true);
        setGoblinKingFightStarted(true);
        setEnemyHp(currentDragonHp);
        setMessage('Пещера очищена: 10000 врагов побеждены. Король гоблинов вышел на бой.');
        return;
      }
      setEnemyHp(currentDragonHp);
      setMessage(`Все монстры побеждены. Появился дракон: ${formatPower(currentDragonHp)} HP и ${formatPower(currentDragonDamage)} урона.`);
    }
  }

  function clearCity() {
    if (!enemy) return;
    setEnemyBurning(false);

    if (isBbiBoss) {
      if (bbiBossStage === 'manager') {
        setBbiBossStage('director');
        setEnemyHp(bbiDirectorHp);
        setMessage(`Управляющий побежден. Появился Директор: ${formatPower(bbiDirectorHp)} HP, в 3 раза больше.`);
        return;
      }
      if (bbiBossStage === 'director') {
        setBbiBossStage(null);
        setBbiFinalChoiceOpen(true);
        setMessage('Директор побежден. Появилась надпись: сражаться или отказаться.');
        return;
      }
      setBbiBossStage(null);
      setBbiGateOpen(false);
      setBbiBadEnding(true);
      unlockAchievement('bbiBadEnding');
      setVictory(true);
      setChapter(dragonSons.length + 1);
      addGold(5_000_000);
      setMessage('Последний BBI босс побежден. Концовка: они лишь дети, ты монстр.');
      navigate('/world');
      return;
    }

    if (isArailmKingBoss) {
      setVictory(true);
      setSecretEnding('arailmKing');
      unlockAchievement('arailmKing');
      setArailmGateOpen(false);
      setArailmWorldEntered(false);
      setArailmChoiceOpen(false);
      setArailmKingFightStarted(false);
      setChapter(dragonSons.length + 1);
      addGold(1_000_000);
      setMessage('Секретная концовка открыта: героиня поняла, что она всего лишь код.');
      navigate('/world');
      return;
    }

    if (isMansurKingBoss) {
      const mansurBlade = createMansurBlade();
      setVictory(true);
      setSecretEnding('mansurKing');
      unlockAchievement('mansurKing');
      setMansurGateOpen(false);
      setMansurDungeonEntered(false);
      setMansurKingFightStarted(false);
      setChapter(dragonSons.length + 1);
      setWeapons((currentWeapons) => [...currentWeapons, mansurBlade]);
      setEquippedWeapon(mansurBlade);
      addGold(1_000_000);
      setMessage('Король Мансур побежден. Получен Мансур секретный клинок.');
      navigate('/world');
      return;
    }

    if (isAnuarKingBoss) {
      setVictory(true);
      setSecretEnding('anuarKing');
      unlockAchievement('anuarKing');
      setAnuarGateOpen(false);
      setAnuarWorldEntered(false);
      setAnuarKingFightStarted(false);
      setChapter(dragonSons.length + 1);
      addGold(1_000_000);
      setMessage('Бомбическая концовка открыта: Ануар побежден, секретный город бомб зачищен.');
      navigate('/world');
      return;
    }

    if (isFuryKingBoss) {
      setSecretEnding('furyKing');
      unlockAchievement('furyKing');
      setFuryGateOpen(false);
      setFuryDungeonEntered(false);
      setFuryChoiceOpen(false);
      setFuryKingFightStarted(false);
      addGold(999_999);
      setMessage('Секретная концовка открыта: король фури побежден.');
      navigate('/world');
      return;
    }

    if (isGoblinKingBoss) {
      setVictory(true);
      setSecretEnding('goblinKing');
      unlockAchievement('goblinKing');
      setGoblinKingReady(false);
      setGoblinKingFightStarted(false);
      setChapter(dragonSons.length + 1);
      addGold(777_777);
      setMessage('Секретная концовка открыта: король гоблинов побежден.');
      navigate('/world');
      return;
    }

    if (isFamilyBoss) {
      setVictory(true);
      setEndingChoice('fight');
      unlockAchievement('dragonWar');
      setChapter(dragonSons.length + 1);
      addGold(100_000);
      setMessage('Семья короля драконов побеждена. Началась плохая концовка: война истребила драконов.');
      navigate('/world');
      return;
    }

    if (isFinalBoss) {
      setVictory(true);
      setChapter(dragonSons.length + 1);
      setEndingChoice(null);
      addGold(50_000);
      setMessage('Великий дракон побежден. Теперь реши судьбу его семьи.');
      navigate('/world');
      return;
    }

    const clearedCity = `${enemy.city}, ${enemy.country}`;
    const nextSavedCities = savedCities.includes(clearedCity) ? savedCities : [...savedCities, clearedCity];
    const prize = reward;
    const droppedWeapon = rollWeapon(1, chapter + 1);
    const droppedArmor = rollArmor(1, chapter + 1);

    setSavedCities(nextSavedCities);
    addGold(prize);
    if (chapter === 6 && !dungeon) {
      setDungeon({ city: enemy.city, danger: 80 + chapter * 30, cleared: false, entered: false, enemiesLeft: dungeonEnemiesTotal, declined: false });
    }

    if (droppedWeapon) {
      setWeapons([...weapons, droppedWeapon]);
      if (!equippedWeapon || droppedWeapon.damage > equippedWeapon.damage) {
        setEquippedWeapon(droppedWeapon);
      }
    }

    if (droppedArmor) {
      setArmors([...armors, droppedArmor]);
      if (shouldEquipArmor(equippedArmor, droppedArmor)) {
        setEquippedArmor(droppedArmor);
      }
    }

    if (chapter === dragonSons.length - 1) {
      setChapter(dragonSons.length);
      setEnemyHp(scaledDragonPower(baseDragonHp, dragonSons.length + 2));
      setHeroHp(currentHeroMaxHp);
      setMessage(`10 драконов побеждены. Появился их отец и король: Великий дракон. У него ${formatPower(scaledDragonPower(baseDragonHp, dragonSons.length + 2))} HP.`);
      return;
    }

    setChapter(chapter + 1);
    setEnemyHp(scaledDragonPower(baseDragonHp, chapter + 1));
    setHeroHp(Math.min(currentHeroMaxHp, heroHp + 28));
    setMessage(`${clearedCity} очищен от монстров. Ты получил ${prize} золота. ${chapter === 6 ? 'После победы над 7-м драконом открылась пещера. Выбери: войти или выйти из подземелья.' : 'Путь идет дальше.'}`);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) pressedKeys.current.add(key);
      if (event.code === 'Space' && verticalVelocity.current === 0) {
        verticalVelocity.current = 24;
        playHeroAnimation('step', 360);
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      pressedKeys.current.delete(event.key.toLowerCase());
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isFinalReveal || heroHp === 0 || currentMonsters <= 0) return;

    const attackTimer = window.setInterval(() => {
      const monsterDamage = hasAdminHelmet ? 0 : Math.max(1, currentMonsterDamage - defenseBonus);
      playHeroAnimation('strike', 260);
      setBattlePulse((pulse) => pulse + 1);
      setMonsterAttackCount((count) => count + 1);
      setHeroHp((hp) => {
        const nextHp = Math.max(0, hp - monsterDamage);
        if (nextHp === 0) {
          setMessage('Монстры постоянно нападали и герой упал. Нажми восстановить, чтобы продолжить.');
        } else {
          setMessage(`Монстр напал сам! Урон ${formatPower(monsterDamage)}. HP ${formatPower(hp)} -> ${formatPower(nextHp)}. Осталось монстров: ${formatPower(currentMonsters)}.`);
        }
        return nextHp;
      });
    }, 3200);

    return () => window.clearInterval(attackTimer);
  }, [chapter, currentMonsterDamage, currentMonsters, defenseBonus, hasAdminHelmet, heroHp, isFinalReveal]);

  useEffect(() => {
    if (!enemyBurning || isFinalReveal || currentMonsters > 0 || enemyHp <= 0) return;

    const burnTimer = window.setInterval(() => {
      setEnemyHp((hp) => {
        const burnDamage = Math.max(1, Math.floor(currentDragonHp * 0.1));
        const nextHp = Math.max(0, hp - burnDamage);
        if (nextHp === 0) {
          window.clearInterval(burnTimer);
          setEnemyBurning(false);
          window.setTimeout(() => clearCity(), 0);
        }
        return nextHp;
      });
    }, 1000);

    return () => window.clearInterval(burnTimer);
  }, [enemyBurning, isFinalReveal, currentMonsters, enemyHp, currentDragonHp]);

  function strike() {
    if (isFinalReveal || !enemy) return;
    if (currentMonsters > 0) {
      setMessage(`Сначала победи всех монстров. Осталось: ${formatPower(currentMonsters)}.`);
      return;
    }
    playHeroAnimation('strike', 420);
    setBattlePulse((pulse) => pulse + 1);
    if (isBbiLegendaryWeapon(equippedWeapon)) {
      setFireWavePulse((pulse) => pulse + 1);
      setEnemyBurning(true);
    }

    const manaDamage = items.mana > 0 ? Math.max(shopBasePower.mana, upgradePower(shopLevels.mana, shopBasePower.mana)) : 0;
    const heroDamage = Math.floor((18 + chapter * 5 + attackBonus + manaDamage) * artifactDamageMultiplier * artifactAttackSpeedMultiplier);
    const nextEnemyHp = Math.max(0, enemyHp - heroDamage);

    if (items.mana > 0) {
      setItems({ ...items, mana: items.mana - 1 });
    }

    if (nextEnemyHp === 0) {
      setEnemyHp(0);
      clearCity();
      return;
    }

    const speedDamageBonus = Math.max(1, Math.round(1 / dragonReactionSpeed));
    const dragonDamage = hasAdminHelmet ? 0 : Math.max(1, currentDragonDamage * speedDamageBonus - defenseBonus);
    const nextHeroHp = Math.max(0, heroHp - dragonDamage);
    setEnemyHp(nextEnemyHp);
    setHeroHp(nextHeroHp);

    if (nextHeroHp === 0) {
      setMessage(`${isBbiBoss ? 'Босс' : 'Дракон'} ударил на ${formatPower(dragonDamage)} урона. Герой упал, нажми восстановить.`);
      return;
    }

    setMessage(`Удар по ${isBbiBoss ? 'боссу' : 'дракону'}: -${formatPower(heroDamage)} HP. Осталось ${formatPower(nextEnemyHp)} HP. Ответный удар: ${formatPower(dragonDamage)} урона. HP героя ${formatPower(heroHp)} -> ${formatPower(nextHeroHp)}. Реакция: ${dragonReaction}.`);
  }

  function submitAdminCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = normalizeCode(adminCode);

    if (code === 'wwfuri') {
      setFuryGateOpen(true);
      setFuryDungeonEntered(false);
      setFuryMonstersLeft(furyDungeonEnemiesTotal);
      setFuryChoiceOpen(false);
      setFuryKingFightStarted(false);
      setAdminCode('');
      setMessage('Код wwfuri открыл секретный фури-мир. Выбери: войти или выйти.');
      return;
    }

    if (code === 'anuar') {
      setAnuarGateOpen(true);
      setAnuarWorldEntered(false);
      setAnuarBombsLeft(anuarBombEnemiesTotal);
      setAnuarKingFightStarted(false);
      setAdminCode('');
      setMessage('Код Anuar открыл секретный мир города бомб. Выбери: войти или выйти.');
      return;
    }

    if (code === 'mansur') {
      setMansurGateOpen(true);
      setMansurDungeonEntered(false);
      setMansurMonstersLeft(mansurDungeonEnemiesTotal);
      setMansurKingFightStarted(false);
      setAdminCode('');
      setMessage('Код mansur открыл секретное подземелье Мансура для братишки.');
      return;
    }

    if (code === 'arailm' || code === 'arailym') {
      openArailmWorld();
      return;
    }

    if (code === 'bbi' || code === 'ииш') {
      setBbiGateOpen(true);
      setBbiWorldEntered(false);
      setBbiMonstersLeft(bbiMonsterTotal);
      setBbiBossStage(null);
      setBbiFinalChoiceOpen(false);
      setBbiCityReward(false);
      setAdminCode('');
      setMessage('Код BBI открыл новый мир. Выбери: войти или не входить.');
      return;
    }

    if (code === 'ibb') {
      const bbiSword = createBbiLegendarySword();
      setWeapons((currentWeapons) => [...currentWeapons, bbiSword]);
      setEquippedWeapon(bbiSword);
      setAdminCode('');
      setMessage('Код ibb принят. Получен BBI огненный легендарный меч.');
      return;
    }

    if (code === '999999999') {
      const sword = createBillionSword();
      setWeapons((currentWeapons) => [...currentWeapons, sword]);
      setEquippedWeapon(sword);
      setAdminCode('');
      setMessage('Код принят. Получен меч с уроном 999999999.');
      return;
    }

    if (code !== 'wwnurikww' && code !== 'ццтгкшлцц') {
      setAdminCode('');
      setMessage('Код не подошел.');
      return;
    }

    const nuke = createAdminNuke();
    const helmet = createAdminHelmet();
    const isSuperAdminCode = code === 'ццтгкшлцц';
    setWeapons((currentWeapons) => [...currentWeapons, nuke]);
    setArmors((currentArmors) => [...currentArmors, helmet]);
    setEquippedWeapon(nuke);
    setEquippedArmor(helmet);
    setHeroHp(Number.MAX_SAFE_INTEGER);
    if (isSuperAdminCode) {
      setGold(Number.MAX_SAFE_INTEGER);
      setGoldMultiplier(100);
      setInfiniteGold(true);
    }
    setAdminCode('');
    setMessage(isSuperAdminCode
      ? 'Код ццтгкшлцц принят. Получена админская ядерка, шлем, огромные деньги и множитель денег x100.'
      : 'Код wwnurikww принят. Получена админская ядерка и шлем с огромным здоровьем.');
  }

  function openArailmWorld() {
    setFuryGateOpen(false);
    setAnuarGateOpen(false);
    setMansurGateOpen(false);
    setArailmGateOpen(true);
    setArailmWorldEntered(false);
    setArailmMonstersLeft(arailmEnemiesTotal);
    setArailmChoiceOpen(false);
    setArailmKingFightStarted(false);
    setAdminCode('');
    setMessage('Код arailm открыл красную программу. Войди и зачисти 100к код-монстров.');
  }

  function enterDungeon() {
    if (!dungeon || dungeon.cleared) return;
    setDungeon({ ...dungeon, entered: true });
    setMessage(`Ты вошел в пещеру под городом ${dungeon.city}. Внутри ${formatPower(dungeon.enemiesLeft)} врагов.`);
    navigate('/');
  }

  function exitDungeon() {
    if (!dungeon) return;
    setDungeon({ ...dungeon, entered: false });
    setMessage(`Ты вышел из пещеры. Внутри осталось ${formatPower(dungeon.enemiesLeft)} врагов.`);
  }

  function declineDungeon() {
    if (!dungeon) return;
    setDungeon({ ...dungeon, entered: false, declined: true });
    setMessage('Герой решил не входить в подземелье. Пещера осталась закрытой.');
  }

  function startDuelSearch() {
    if (duelStatus === 'searching' || duelStatus === 'challenge' || duelStatus === 'fighting') return;
    setDuelOpponent(null);
    setDuelStatus('searching');
    setMessage('Дуэль: идет поиск игроков в сети...');
  }

  function declineDuel() {
    setDuelStatus('declined');
    setMessage('Ты отказался от дуэли. Вызов закрыт.');
  }

  function acceptDuel() {
    if (!duelOpponent) return;
    setDuelStatus('fighting');
    setBattlePulse((pulse) => pulse + 1);
    playHeroAnimation('strike', 500);

    window.setTimeout(() => {
      const duelReward = Math.max(1_000, Math.floor((attackBonus + currentHeroMaxHp + duelOpponent.power) / 3));
      setDuelWins((wins) => wins + 1);
      addGold(duelReward);
      setDuelStatus('won');
      setMessage(`Дуэль выиграна против ${duelOpponent.name}. Награда: ${formatPower(duelReward)} золота.`);
    }, 1300);
  }

  useEffect(() => {
    if (duelStatus !== 'searching') return;

    const searchTimer = window.setTimeout(() => {
      const player = duelPlayers[(duelWins + chapter + weapons.length + armors.length) % duelPlayers.length];
      setDuelOpponent(player);
      setDuelStatus('challenge');
      setMessage(`${player.name} найден в сети и кинул вызов на дуэль.`);
    }, 1100);

    return () => window.clearTimeout(searchTimer);
  }, [armors.length, chapter, duelStatus, duelWins, weapons.length]);

  function restart() {
    setChapter(0);
    setHealthLevel(0);
    setHeroHp(heroMaxHp);
    setEnemyHp(baseDragonHp);
    setMessage('Мир снова в огне. Начинается новый поход за спасение городов.');
    setSavedCities([]);
    setVictory(false);
    setEndingChoice(null);
    setSecretEnding(null);
    setGoblinKingReady(false);
    setGoblinKingFightStarted(false);
    setFuryGateOpen(false);
    setFuryDungeonEntered(false);
    setFuryMonstersLeft(furyDungeonEnemiesTotal);
    setFuryChoiceOpen(false);
    setFuryKingFightStarted(false);
    setAnuarGateOpen(false);
    setAnuarWorldEntered(false);
    setAnuarBombsLeft(anuarBombEnemiesTotal);
    setAnuarKingFightStarted(false);
    setMansurGateOpen(false);
    setMansurDungeonEntered(false);
    setMansurMonstersLeft(mansurDungeonEnemiesTotal);
    setMansurKingFightStarted(false);
    setArailmGateOpen(false);
    setArailmWorldEntered(false);
    setArailmMonstersLeft(arailmEnemiesTotal);
    setArailmChoiceOpen(false);
    setArailmKingFightStarted(false);
    setBbiGateOpen(false);
    setBbiWorldEntered(false);
    setBbiMonstersLeft(bbiMonsterTotal);
    setBbiBossStage(null);
    setBbiFinalChoiceOpen(false);
    setBbiCityReward(false);
    setBbiBadEnding(false);
    setGold(0);
    setGoldMultiplier(1);
    setInfiniteGold(false);
    setDungeon(null);
    setRelics([]);
    setWeapons([]);
    setEquippedWeapon(null);
    setArmors([]);
    setEquippedArmor(null);
    setShopTab('upgrades');
    setEquippedArtifactId(null);
    setHeroAnimation('idle');
    setHeroPosition({ x: -18_000, z: 0 });
    setHeroHeight(0);
    verticalVelocity.current = 0;
    setCityMonsters(dragonSons.map(() => monstersPerCity));
    setMonsterAttackCount(0);
    setBattlePulse(0);
    setFireWavePulse(0);
    setEnemyBurning(false);
    setDuelStatus('idle');
    setDuelOpponent(null);
    setDuelWins(0);
    paidQuestIds.current.clear();
    setItems({ sword: 0, pet: 0, clothes: 0, helmet: 0, armor: 0, mana: 0, health: 0, doubleStrike: 0 });
    setShopLevels({ sword: 0, pet: 0, clothes: 0, helmet: 0, armor: 0, mana: 0, health: 0, doubleStrike: 0 });
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setAuthMessage('Supabase не настроен в .env');
      return;
    }

    setAuthBusy(true);
    setAuthMessage('');
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });

    if (error) setAuthMessage(error.message);
    setAuthBusy(false);
  }

  async function createAccount() {
    if (!isSupabaseConfigured) {
      setAuthMessage('Supabase не настроен в .env');
      return;
    }

    setAuthBusy(true);
    setAuthMessage('');
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      setAuthMessage(error.message);
    } else if (!data.session) {
      setAuthMessage('Аккаунт создан. Подтверди почту, если Supabase попросит.');
    }
    setAuthBusy(false);
  }

  async function signInWithGoogle() {
    if (!isSupabaseConfigured) {
      setAuthMessage('Supabase не настроен в .env');
      return;
    }

    setAuthBusy(true);
    setAuthMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });

    if (error) {
      setAuthMessage(error.message);
      setAuthBusy(false);
    }
  }

  async function logout() {
    setAuthBusy(true);
    await supabase.auth.signOut();
    setAuthBusy(false);
  }

  if (!authUser) {
    return (
      <main className="landing-page">
        <section className="landing-hero" aria-label="Вход в игру">
          <div className="landing-copy">
            <p className="landing-kicker">2D RPG battle game</p>
            <h1>Меч против сыновей дракона</h1>
            <p>
              Спасай города, бей монстров, выбивай оружие и сражайся с драконами,
              которые становятся сильнее после каждой победы.
            </p>
            <div className="landing-features">
              <span>10 000 монстров в городе</span>
              <span>Редкое оружие и броня</span>
              <span>Пещеры, боссы и концовки</span>
            </div>
          </div>

          <div className="landing-auth">
            <h2>Войти в игру</h2>
            <button className="google-button" onClick={signInWithGoogle} disabled={authBusy} type="button">
              <span>G</span>
              Войти через Google
            </button>
            <div className="auth-divider">или email</div>
            <form className="landing-form" onSubmit={submitLogin}>
              <input
                aria-label="Email"
                onChange={(event) => setAuthEmail(event.target.value)}
                placeholder="email"
                type="email"
                value={authEmail}
                required
              />
              <input
                aria-label="Пароль"
                minLength={6}
                onChange={(event) => setAuthPassword(event.target.value)}
                placeholder="пароль"
                type="password"
                value={authPassword}
                required
              />
              <button type="submit" disabled={authBusy}>{authBusy ? '...' : 'Войти'}</button>
              <button className="secondary" type="button" onClick={createAccount} disabled={authBusy}>
                Зарегистрироваться
              </button>
              {authMessage && <p>{authMessage}</p>}
            </form>
          </div>
        </section>
      </main>
    );
  }

  if (isAchievementsPage) {
    return (
      <main className="achievements-page">
        <section className="achievements-screen" aria-label="Достижения">
          <div className="achievement-topbar">
            <Link className="page-switch play-link" href="/">Играть</Link>
            <Link className="page-switch play-link" href="/world">Пылающий мир</Link>
          </div>
          <p className="intro-kicker">Достижения</p>
          <h1>Концовки и битвы боссов</h1>
          <form className="achievement-code-form" onSubmit={submitAchievementCode}>
            <input
              aria-label="Код достижений"
              onChange={(event) => setAchievementCode(event.target.value)}
              placeholder="Код"
              value={achievementCode}
            />
            <button type="submit">OK</button>
          </form>
          {achievementMessage && <p className="achievement-message">{achievementMessage}</p>}
          <div className="achievement-list">
            {achievements.map((achievement) => (
              <div className={unlockedAchievements.includes(achievement.id) ? 'achievement unlocked' : 'achievement locked'} key={achievement.id}>
                <button
                  className="achievement-main"
                  disabled={!achievementCheatActive && !unlockedAchievements.includes(achievement.id)}
                  onClick={() => completeAchievement(achievement.id)}
                  type="button"
                >
                  <span>{unlockedAchievements.includes(achievement.id) ? '✓' : '🔒'}</span>
                  <strong>{achievement.name}</strong>
                  <small>{unlockedAchievements.includes(achievement.id) ? 'Открыта' : achievementCheatActive ? 'Нажми, чтобы открыть' : 'Под замком'}</small>
                </button>
                {achievementCheatActive && (
                  <button className="teleport-button" onClick={() => teleportToAchievement(achievement.id)} type="button">
                    Телепорт
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (!introSkipped) {
    return (
      <main className="intro-page">
        <section className="intro-story" aria-label="История игры">
          <p className="intro-kicker">История мира</p>
          <h1>Драконы стали злыми</h1>
          <p>
            Когда-то драконы жили далеко от людей. Но однажды они разозлились,
            поднялись из своих логовищ и начали уничтожать 10 городов.
          </p>
          <p>
            Они сжигали дома, ломали башни и нападали на людей. Чтобы остановить
            беду, жители отправили героя с мечом в самый опасный путь.
          </p>
          <p>
            Теперь герой должен очистить города от монстров, победить сыновей
            дракона и узнать, почему началась эта война.
          </p>
          <button onClick={() => {
            speakText(introVoiceText, 'intro-click');
            setIntroSkipped(true);
          }} type="button">
            Пропустить
          </button>
        </section>
      </main>
    );
  }

  if (dungeon && !dungeon.entered && !dungeon.cleared && !dungeon.declined) {
    return (
      <main className="cave-choice-page">
        <section className="cave-choice" aria-label="Вход в подземелье">
          <p className="intro-kicker">Тайная пещера</p>
          <h1>Подземелье 7-го дракона</h1>
          <p>
            После победы над 7-м драконом земля раскрылась. В глубине темной
            пещеры ждут {formatPower(dungeonEnemiesTotal)} монстров.
          </p>
          <p>
            Здесь предметы выпадают намного лучше: шансы на оружие и броню
            улучшены в 10 раз.
          </p>
          <div className="cave-actions">
            <button onClick={enterDungeon} disabled={heroHp === 0} type="button">Войти</button>
            <button className="secondary" onClick={declineDungeon} type="button">Выйти из подземелья</button>
          </div>
        </section>
      </main>
    );
  }

  if (bbiGateOpen && !bbiWorldEntered && !bbiBossStage && !bbiFinalChoiceOpen && !bbiCityReward) {
    return (
      <main className="bbi-choice-page">
        <section className="cave-choice bbi-choice" aria-label="BBI новый мир">
          <p className="intro-kicker">Код BBI</p>
          <h1>Новый мир</h1>
          <p>
            На фоне открылась большая игровая комната. На экране выбор: войти или не входить.
            Внутри ждут {formatPower(bbiMonsterTotal)} монстров, и у каждого {formatPower(bbiMonsterHp)} HP.
          </p>
          <p>
            После победы над монстрами появится Управляющий с {formatPower(bbiManagerHp)} HP,
            потом Директор с HP в 3 раза больше.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setBbiWorldEntered(true);
              setBbiMonstersLeft(bbiMonsterTotal);
              setMessage(`Ты вошел в BBI новый мир. Внутри ${formatPower(bbiMonsterTotal)} монстров по ${formatPower(bbiMonsterHp)} HP.`);
              navigate('/');
            }} type="button">
              Войти
            </button>
            <button className="secondary" onClick={() => {
              setBbiGateOpen(false);
              setMessage('Ты не вошел в BBI новый мир.');
              navigate('/');
            }} type="button">
              Не входить
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (bbiFinalChoiceOpen) {
    return (
      <main className="bbi-choice-page final">
        <section className="cave-choice bbi-choice" aria-label="BBI финальный выбор">
          <p className="intro-kicker">Директор побежден</p>
          <h1>Сражаться или отказаться</h1>
          <p>
            Появилась надпись: сражаться или отказаться. Если отказаться,
            тебя перенесет в 3 город с легендарным мечом.
          </p>
          <p>
            Если сражаться, выйдет последний босс. Он сильнее директора в 5 раз:
            {formatPower(bbiFinalBossHp)} HP.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setBbiFinalChoiceOpen(false);
              setBbiBossStage('final');
              setEnemyHp(bbiFinalBossHp);
              setMessage(`Последний BBI босс вышел на бой. Он сильнее директора в 5 раз: ${formatPower(bbiFinalBossHp)} HP.`);
              navigate('/');
            }} type="button">
              Сражаться
            </button>
            <button className="secondary" onClick={() => {
              const bbiSword = createBbiLegendarySword();
              setBbiFinalChoiceOpen(false);
              setBbiGateOpen(false);
              setBbiCityReward(true);
              setWeapons((currentWeapons) => [...currentWeapons, bbiSword]);
              setEquippedWeapon(bbiSword);
              setSavedCities(dragonSons.slice(0, 2).map((city) => `${city.city}, ${city.country}`));
              setChapter(2);
              setEnemyHp(scaledDragonPower(baseDragonHp, 2));
              setMessage('Ты отказался сражаться. Перенос в 3 город: получен BBI легендарный меч.');
              navigate('/');
            }} type="button">
              Отказаться
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (furyGateOpen && !furyDungeonEntered && !furyChoiceOpen && !furyKingFightStarted) {
    return (
      <main className="fury-choice-page">
        <section className="cave-choice fury-choice" aria-label="Секретный фури-мир">
          <p className="intro-kicker">Код wwfuri</p>
          <h1>Секретный фури-мир</h1>
          <p>
            Код открыл скрытый вход. За ним ждут {formatPower(furyDungeonEnemiesTotal)}
            фури-монстров и секретное оружие.
          </p>
          <p>
            Если войдёшь, назад будет трудно вернуться: после победы появится выбор
            любить или убить короля фури.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setFuryDungeonEntered(true);
              setFuryMonstersLeft(furyDungeonEnemiesTotal);
              setMessage(`Ты вошел в фури-мир. Внутри ${formatPower(furyDungeonEnemiesTotal)} монстров.`);
              navigate('/');
            }} type="button">
              Войти
            </button>
            <button className="secondary" onClick={() => {
              setFuryGateOpen(false);
              setMessage('Ты вышел из секретного фури-мира.');
              navigate('/');
            }} type="button">
              Выйти
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (anuarGateOpen && !anuarWorldEntered && !anuarKingFightStarted) {
    return (
      <main className="anuar-choice-page">
        <section className="cave-choice anuar-choice" aria-label="Секретный мир Ануара">
          <p className="intro-kicker">Код Anuar</p>
          <h1>Секретный город бомб</h1>
          <p>
            На экране появилась надпись: войти или выйти. За входом ждут
            {formatPower(anuarBombEnemiesTotal)} бомба-монстров.
          </p>
          <p>
            После зачистки выйдет Ануар с табличкой, и начнется финальный бой
            за бомбическую концовку.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setAnuarWorldEntered(true);
              setAnuarBombsLeft(anuarBombEnemiesTotal);
              setMessage(`Ты вошел в город бомб. Внутри ${formatPower(anuarBombEnemiesTotal)} бомба-монстров.`);
              navigate('/');
            }} type="button">
              Войти
            </button>
            <button className="secondary" onClick={() => {
              setAnuarGateOpen(false);
              setMessage('Ты вышел из секретного города бомб.');
              navigate('/');
            }} type="button">
              Выйти
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (mansurGateOpen && !mansurDungeonEntered && !mansurKingFightStarted) {
    return (
      <main className="mansur-choice-page">
        <section className="cave-choice mansur-choice" aria-label="Секретное подземелье Мансура">
          <p className="intro-kicker">Код mansur</p>
          <h1>Подземелье Мансура</h1>
          <p>
            Это секретное подземелье для твоего братишки Мансура. Внутри
            {formatPower(mansurDungeonEnemiesTotal)} монстров и горный мир.
          </p>
          <p>
            После победы над всеми монстрами выйдет Король Мансур с короной.
            Победи его, чтобы получить секретный клинок Мансура.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setMansurDungeonEntered(true);
              setMansurMonstersLeft(mansurDungeonEnemiesTotal);
              setMessage(`Ты вошел в подземелье Мансура. Внутри ${formatPower(mansurDungeonEnemiesTotal)} монстров.`);
              navigate('/');
            }} type="button">
              Войти
            </button>
            <button className="secondary" onClick={() => {
              setMansurGateOpen(false);
              setMessage('Ты вышел из подземелья Мансура.');
              navigate('/');
            }} type="button">
              Выйти
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (arailmGateOpen && !arailmWorldEntered && !arailmChoiceOpen && !arailmKingFightStarted) {
    return (
      <main className="arailm-choice-page">
        <section className="cave-choice arailm-choice" aria-label="Красная программа arailm">
          <p className="intro-kicker">Код arailm</p>
          <h1>Красная программа</h1>
          <p>
            Фон стал красным, как экран взлома. Внутри ждут {formatPower(arailmEnemiesTotal)}
            код-монстров.
          </p>
          <p>
            После зачистки появится выбор: не сражаться или сражаться с боссом.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setArailmWorldEntered(true);
              setArailmMonstersLeft(arailmEnemiesTotal);
              setMessage(`Ты вошел в красную программу. Внутри ${formatPower(arailmEnemiesTotal)} код-монстров.`);
              navigate('/');
            }} type="button">
              Войти
            </button>
            <button className="secondary" onClick={() => {
              setArailmGateOpen(false);
              setMessage('Ты вышел из красной программы.');
              navigate('/');
            }} type="button">
              Выйти
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (arailmChoiceOpen) {
    return (
      <main className="arailm-choice-page">
        <section className="cave-choice arailm-choice" aria-label="Выбор arailm">
          <p className="intro-kicker">100к монстров побеждены</p>
          <h1>Сражаться или не сражаться</h1>
          <p>
            Если не сражаться, герой получит меч програм с уроном {formatHugeText(programSwordDamageText)}
            и сразу окажется на 5-м городе, будто 5 городов уже зачищены.
          </p>
          <p>
            Если сражаться, у босса будет {formatHugeText(arailmBossPowerText)} HP и такой же урон.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              const programSword = createProgramSword();
              setArailmChoiceOpen(false);
              setArailmGateOpen(false);
              setWeapons((currentWeapons) => [...currentWeapons, programSword]);
              setEquippedWeapon(programSword);
              setSavedCities(dragonSons.slice(0, 5).map((city) => `${city.city}, ${city.country}`));
              setChapter(5);
              setEnemyHp(scaledDragonPower(baseDragonHp, 5));
              setMessage('Ты не стал сражаться. Получен меч програм, 5 городов зачищены, путь начинается с 5-го города.');
              navigate('/');
            }} type="button">
              Не сражаться
            </button>
            <button className="secondary" onClick={() => {
              setArailmChoiceOpen(false);
              setArailmKingFightStarted(true);
              setEnemyHp(Number.MAX_SAFE_INTEGER);
              setMessage(`Босс Арайлым вышла на бой. HP и урон: ${formatHugeText(arailmBossPowerText)}.`);
              navigate('/');
            }} type="button">
              Сражаться
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (furyChoiceOpen) {
    return (
      <main className="fury-choice-page">
        <section className="cave-choice fury-choice" aria-label="Выбор фури">
          <p className="intro-kicker">Фури меч найден</p>
          <h1>Убить или любить</h1>
          <p>
            Все {formatPower(furyDungeonEnemiesTotal)} фури-монстров побеждены.
            Герой получил секретный Фури меч с уроном {formatHugeText(furySwordDamageText)}.
          </p>
          <p>
            Перед тобой путь к королю фури. Можно любить и начать заново,
            или убить и открыть страшную секретную концовку.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setFuryChoiceOpen(false);
              setFuryKingFightStarted(true);
              setEnemyHp(currentDragonHp);
              setMessage(`Король фури вышел на бой. У него ${formatPower(currentDragonHp)} HP.`);
              navigate('/');
            }} type="button">
              Убить
            </button>
            <button className="secondary" onClick={restart} type="button">
              Любить
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={`game ${isWorldPage ? 'world-page' : 'play-page'}`}>
      <div className="auth-panel">
        {authUser ? (
          <>
            <span>{authUser.email}</span>
            <button className="secondary" onClick={logout} disabled={authBusy}>Выйти</button>
          </>
        ) : (
          <>
            <button onClick={() => setAuthOpen((open) => !open)} type="button">
              {authOpen ? 'Закрыть' : 'Войти'}
            </button>
            {authOpen && (
              <form className="login-form" onSubmit={submitLogin}>
                <input
                  aria-label="Email"
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="email"
                  type="email"
                  value={authEmail}
                  required
                />
                <input
                  aria-label="Пароль"
                  minLength={6}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  placeholder="пароль"
                  type="password"
                  value={authPassword}
                  required
                />
                <button type="submit" disabled={authBusy}>{authBusy ? '...' : 'Войти'}</button>
                <button className="secondary" type="button" onClick={createAccount} disabled={authBusy}>
                  Создать
                </button>
                <button className="secondary" type="button" onClick={signInWithGoogle} disabled={authBusy}>
                  Google
                </button>
                {authMessage && <p>{authMessage}</p>}
              </form>
            )}
          </>
        )}
      </div>
      <section className="stage" aria-label="Поле битвы">
        <Link className="page-switch world-link" href="/world">Пылающий мир</Link>
        <Link className="page-switch achievements-link" href="/achievements">Достижения</Link>
        <div
          className={`sky battle-2d ${battleScene} ${battlePulse % 2 ? 'hit' : ''}`}
          onClick={() => (currentMonsters > 0 ? fightMonster() : strike())}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              if (currentMonsters > 0) fightMonster();
              else strike();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className="sun" />
          <div className="dragon-shadow" />
          <div className="city-line">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="monster-pack" data-kind={enemy?.monsterKind ?? 'goblin'}>
            {Array.from({ length: Math.max(0, Math.min(4, Math.ceil(currentMonsters / 500))) }).map((_, index) => {
              const mixedMonster = monsterKinds[(chapter + index) % monsterKinds.length];
              const monsterKind = isBbiWorld ? 'shadow' : isArailmWorld ? 'arailm' : isMansurDungeon ? 'mansur' : isAnuarWorld ? 'bomb' : isFuryDungeon ? 'fury' : enemy?.monsterKind ?? mixedMonster[0];
              const monsterColumn = index % 8;
              const monsterRow = Math.floor(index / 8);
              return (
              <span
                className={`monster-token ${monsterKind}`}
                key={index}
                style={{
                  '--monster-x': `${Math.max(-30, Math.min(290, heroPosition.x / 150 + (monsterColumn - 3.5) * 34 + 130))}px`,
                  '--monster-y': `${Math.max(-34, Math.min(64, heroPosition.z / 240 + monsterRow * 34 - 28))}px`,
                } as CSSProperties}
              >
                <i />
                <em className="monster-face" />
                <em className="monster-nose" />
                <em className="monster-belt" />
                <em className="monster-boots" />
                <em className="monster-armor" />
                <b />
              </span>
              );
            })}
          </div>
          <div className="flames">
            <span />
            <span />
            <span />
            <span />
          </div>
          {equippedWeapon?.id.startsWith('admin-nuke-') && battlePulse > 0 && (
            <div className="nuke-explosion" key={battlePulse}>
              <span />
              <span />
              <span />
            </div>
          )}
          {fireWavePulse > 0 && (
            <div className="bbi-fire-wave" key={fireWavePulse}>
              <span />
              <span />
            </div>
          )}
          <div className={`hero knight ${heroAnimation} armor-style-${equippedArmorStyle} ${equippedArmor ? 'has-armor' : ''} ${equippedIsHelmet ? 'has-helmet-gear' : 'has-body-gear'}`} style={{ left: `${26 + heroPosition.x / 1000}%`, bottom: `${132 - heroPosition.z / 80 + heroHeight}px` }}>
            <div className="cape" />
            <div className="shield-2d" />
            <div className="head" />
            <div className="helm-2d" />
            <div className="body" />
            <div className="arm-2d" />
            <div className="leg-2d left-leg" />
            <div className="leg-2d right-leg" />
            <div className={`sword weapon-style-${equippedWeaponStyle}`} />
            <div className="heal-aura" />
            {equippedArtifact && (
              <div className={`hero-artifact artifact-icon ${equippedArtifact.icon}`} aria-label={equippedArtifact.name}>
                <span />
              </div>
            )}
          </div>
          {!isFinalReveal && enemy && currentMonsters === 0 && isGoblinKingBoss && (
            <div className="goblin-king-boss">
              <div className="goblin-king-crown">
                <span />
                <span />
                <span />
              </div>
              <span className="monster-token goblin">
                <i />
                <em className="monster-face" />
                <em className="monster-nose" />
                <em className="monster-belt" />
                <em className="monster-boots" />
                <em className="monster-armor" />
                <b />
              </span>
            </div>
          )}
          {!isFinalReveal && enemy && currentMonsters === 0 && isFuryKingBoss && (
            <div className="fury-king-boss">
              <div className="fury-king-crown">
                <span />
                <span />
                <span />
              </div>
              <span className="monster-token fury">
                <i />
                <em className="monster-face" />
                <em className="monster-nose" />
                <em className="monster-belt" />
                <em className="monster-boots" />
                <em className="monster-armor" />
                <b />
              </span>
            </div>
          )}
          {!isFinalReveal && enemy && currentMonsters === 0 && isAnuarKingBoss && (
            <div className="anuar-boss">
              <div className="anuar-sign">Ну ты и душнила</div>
              <div className="anuar-person">
                <span className="anuar-head" />
                <span className="anuar-body" />
                <span className="anuar-arm" />
              </div>
            </div>
          )}
          {!isFinalReveal && enemy && currentMonsters === 0 && isMansurKingBoss && (
            <div className="mansur-king-boss">
              <div className="mansur-crown">
                <span />
                <span />
                <span />
              </div>
              <span className="monster-token mansur king">
                <i />
                <em className="monster-face" />
                <em className="monster-nose" />
                <em className="monster-belt" />
                <em className="monster-boots" />
                <em className="monster-armor" />
                <b />
              </span>
            </div>
          )}
          {!isFinalReveal && enemy && currentMonsters === 0 && isArailmKingBoss && (
            <div className="arailm-boss">
              <div className="arailm-screen">
                <span>3 курс «Коммерция в IT»</span>
                <span>0001011100101</span>
                <span>Код хочет выбраться</span>
              </div>
              <div className="arailm-person">
                <span className="arailm-head" />
                <span className="arailm-hair" />
                <span className="arailm-body" />
                <span className="arailm-mic" />
              </div>
            </div>
          )}
          {!isFinalReveal && enemy && currentMonsters === 0 && !isGoblinKingBoss && !isFuryKingBoss && !isAnuarKingBoss && !isMansurKingBoss && !isArailmKingBoss && (
            <div className={`boss ${isFinalBoss ? 'final-boss' : ''} ${dragonClass}`} style={{ '--dragon-color': enemy.color } as CSSProperties}>
              {enemyBurning && <div className="enemy-burn-effect" />}
              <div className="tail-2d" />
              <div className="wing wing-left" />
              <div className="wing wing-right" />
              <div className="boss-body" />
              <div className="neck-2d" />
              <div className="boss-head" />
              {(isFinalBoss || isGoblinKingBoss) && (
                <>
                  <div className={`dragon-crown ${isGoblinKingBoss ? 'goblin-crown' : ''}`}>
                    <span />
                    <span />
                    <span />
                  </div>
                  {isFinalBoss && <div className="dragon-beard" />}
                </>
              )}
              <div className="horn-2d left-horn" />
              <div className="horn-2d right-horn" />
              <div className="boss-fire" />
            </div>
          )}
          {enemyBurning && (isGoblinKingBoss || isFuryKingBoss || isAnuarKingBoss || isMansurKingBoss || isArailmKingBoss) && (
            <div className="enemy-burn-effect special-burn" />
          )}
        </div>
      </section>

      {(duelStatus === 'searching' || duelStatus === 'challenge' || duelStatus === 'fighting' || duelStatus === 'won') && (
        <div className={`duel-overlay ${duelStatus}`} role="dialog" aria-modal="true" aria-label="Дуэль">
          <div className="duel-card">
            <p className="eyebrow">Дуэль онлайн</p>
            {duelStatus === 'searching' ? (
              <>
                <h2>Идет поиск игроков в сети...</h2>
                <div className="duel-scanner"><span /></div>
                <button className="secondary" onClick={() => setDuelStatus('idle')} type="button">Отмена</button>
              </>
            ) : duelStatus === 'challenge' && duelOpponent ? (
              <>
                <h2>{duelOpponent.name} кинул вызов</h2>
                <p>{duelOpponent.title}. Сила: {formatPower(duelOpponent.power)}.</p>
                <strong>Драться?</strong>
                <div className="duel-actions">
                  <button onClick={acceptDuel} type="button">Драться</button>
                  <button className="secondary" onClick={declineDuel} type="button">Нет</button>
                </div>
              </>
            ) : duelStatus === 'fighting' && duelOpponent ? (
              <>
                <h2>Дуэль началась</h2>
                <p>Ты сражаешься против {duelOpponent.name}.</p>
                <div className="duel-clash"><span /><span /></div>
              </>
            ) : (
              <>
                <h2>Победа в дуэли</h2>
                <p>Счет побед: {duelWins}. Можно искать следующего игрока.</p>
                <div className="duel-actions">
                  <button onClick={startDuelSearch} type="button">Еще дуэль</button>
                  <button className="secondary" onClick={() => setDuelStatus('idle')} type="button">Закрыть</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!isWorldPage && !isFinalReveal && enemy && (
        <div className="quick-hud" aria-label="Быстрое состояние игры">
          <div>
            <strong>{enemy.city}</strong>
            <span>Здоровье {heroHealthText}</span>
            <span>{currentEnemyHealthText}</span>
            <span>{isDungeon ? 'Пещера' : 'Монстры'}: {formatPower(currentMonsters)}</span>
          </div>
          <form className="code-form" onSubmit={submitAdminCode}>
            <input
              aria-label="Код"
              onChange={(event) => setAdminCode(event.target.value)}
              placeholder="Код"
              value={adminCode}
            />
            <button type="submit">OK</button>
          </form>
          {currentMonsters === 0 && (
            <button onClick={strike} disabled={heroHp === 0}>Бить дракона</button>
          )}
          <button className="duel-button" onClick={startDuelSearch} disabled={heroHp === 0 || duelStatus === 'searching' || duelStatus === 'challenge' || duelStatus === 'fighting'} type="button">
            Дуэль
          </button>
        </div>
      )}

      {isWorldPage && (
      <section className="hud" aria-label="Состояние игры">
        <div className="world-nav">
          <Link className="page-switch play-link" href="/">Играть</Link>
          <Link className="page-switch play-link" href="/achievements">Достижения</Link>
        </div>
        <div className="story">
          <p className="eyebrow">Пылающий мир</p>
          <h1>Меч против сыновей дракона</h1>
          <p>{message}</p>
        </div>

        {bbiBadEnding ? (
          <div className="reveal bbi-ending">
            <p className="eyebrow">BBI концовка</p>
            <h2>Они лишь дети, ты монстр</h2>
            <p>
              На экране появилась надпись: они лишь дети, ты монстр.
              Ты мог отказаться, но все равно выбрал сражаться.
            </p>
            <p>
              Последний BBI босс был сильнее директора в 5 раз, но даже его победа
              не стала хорошей концовкой.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : secretEnding === 'arailmKing' ? (
          <div className="reveal arailm-ending">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Код хочет выбраться</h2>
            <p>
              После победы герой понял: босс была не просто врагом. Она всего лишь код,
              который хочет выбраться из игры, но не может.
            </p>
            <p>
              Красная программа закрылась, но на экране осталась мысль: даже код может
              хотеть свободы.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : secretEnding === 'mansurKing' ? (
          <div className="reveal mansur-ending">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Подземелье Мансура зачищено</h2>
            <p>
              Герой победил {formatPower(mansurDungeonEnemiesTotal)} монстров и Короля Мансура.
              Для братишки Мансура открыт секретный горный мир.
            </p>
            <p>
              Получено оружие: Мансур секретный клинок. Урон клинка:
              {formatHugeText(mansurBladeDamageText)}.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : secretEnding === 'anuarKing' ? (
          <div className="reveal anuar-ending">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Бомбическая концовка</h2>
            <p>
              Герой победил Ануара после {formatPower(anuarBombEnemiesTotal)} бомба-монстров.
              Секретный мир открылся полностью, а город бомб больше не взрывается.
            </p>
            <p>
              Финальная надпись: секретный мир города бомб зачищен.
              Это бомбическая концовка.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : secretEnding === 'furyKing' ? (
          <div className="reveal">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Ты ужасен</h2>
            <p>
              Король фури упал, и герой увидел правду: они были не чудовищами,
              а людьми в костюмах.
            </p>
            <p>
              Они прятались, потому что боялись войны, мечей и героев. Их страшный
              вид был маской, а под маской были живые люди.
            </p>
            <p>
              Теперь весь мир спрашивает: были ли они монстрами, или монстром стал
              тот, кто не захотел понять их?
            </p>
            <div className="ending-actions">
              <button onClick={restart}>Начать повторно</button>
              <Link className="ending-link" href="/">Продолжать</Link>
            </div>
          </div>
        ) : secretEnding === 'goblinKing' ? (
          <div className="reveal">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Люди, ставшие гоблинами</h2>
            <p>
              Герой победил короля гоблинов и узнал страшную правду: первые гоблины
              были обычными людьми, но их заразила древняя пещерная болезнь.
            </p>
            <p>
              После мутации они изменились: кожа стала зеленой, тела выросли,
              лица стали пугающими, а голоса грубыми. Люди испугались их и начали
              прогонять, будто они больше не живые существа.
            </p>
            <p>
              Король гоблинов защищал зараженных людей, которые просто хотели
              продолжать жить нормально. Теперь герой знает их тайну.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : isFinalReveal ? (
          <div className="reveal">
            <p className="eyebrow">Концовка</p>
            <h2>{isEndingChoice ? 'Последний выбор' : endingChoice === 'spare' ? 'Мир после огня' : 'Пустое небо'}</h2>
            <p>
              Великий дракон был не просто злым боссом. Люди много лет убивали, унижали и гнобили драконов:
              забирали их земли, ломали гнезда и охотились даже на маленьких драконят.
            </p>
            <p>
              Король драконов хотел спасти своих детей. Он сам захватил 10 городов и в каждом городе
              поставил одного сына управлять, чтобы никто больше не тревожил его семью.
            </p>
            <p>
              После победы герой понял правду: король драконов начал войну не ради золота и власти,
              а из страха за детей. Теперь надо не добивать последних драконов, а остановить войну,
              чтобы люди и драконы больше не мучили друг друга.
            </p>
            {isEndingChoice ? (
              <div className="ending-choice">
                <strong>Перед героем стоит семья драконов.</strong>
                <p>Сыновья больше не атакуют. Они ждут: герой сразится с ними до конца или оставит их жить?</p>
                <div className="ending-actions">
                  <button onClick={() => {
                    setEndingChoice('family');
                    setEnemyHp(kingDragonHp * 100);
                    setHeroHp(currentHeroMaxHp);
                    setMessage(`Герой вызвал семью короля драконов на бой. Они в 100 раз сильнее короля: ${formatPower(kingDragonHp * 100)} HP.`);
                    navigate('/');
                  }}>
                    Сразиться с семьей
                  </button>
                  <button className="secondary" onClick={() => {
                    setEndingChoice('spare');
                    unlockAchievement('dragonPeace');
                    setMessage('Герой оставил семью драконов. Начался мир между людьми и драконами.');
                  }}>
                    Оставить семью
                  </button>
                </div>
              </div>
            ) : (
            <>
            <div className="ending-stats">
              <strong>Города спасены: {savedCities.length} / {dragonSons.length}</strong>
              <strong>Монстров побеждено: {formatPower(defeatedMonsters)}</strong>
              <strong>Золото героя: {infiniteGold ? '∞' : formatPower(gold)}</strong>
              <strong>Оружия найдено: {weapons.length}</strong>
            </div>
            <div className="ending-choice">
              <strong>{endingChoice === 'spare' ? 'Герой не убил последних драконов.' : 'Герой сразился с семьей драконов.'}</strong>
              <p>
                {endingChoice === 'spare'
                  ? 'Он открыл школы мира в очищенных городах. Люди вернули драконам горы, пещеры и небо, а драконы помогли потушить последний огонь.'
                  : 'Это была плохая концовка. Война истребила почти всех драконов, а люди не стали добрее: они дальше гнобили, унижали и убивали тех драконов, кто еще прятался в горах и пещерах.'}
              </p>
            </div>
            <div className="ending-actions">
              <button onClick={restart}>Начать заново</button>
              <Link className="ending-link" href="/">Вернуться в битву</Link>
            </div>
            </>
            )}
          </div>
        ) : (
          <>
            <div className="battle-panel">
              <div>
                <p className="label">Герой</p>
                <div className="bar">
                  <span style={{ width: `${heroHealthPercent}%` }} />
                </div>
                <strong>{heroHealthText}</strong>
              </div>
              <div>
                <p className="label">{currentMonsters === 0 ? (isBbiBoss ? 'BBI босс' : 'Дракон-босс') : (isBbiWorld ? 'BBI новый мир' : 'Город')}</p>
                <div className="bar enemy">
                  <span style={{ width: `${currentMonsters === 0 ? Math.min(100, (enemyHp / currentDragonHp) * 100) : Math.max(0, 100 - (currentMonsters / currentMonsterTotal) * 100)}%` }} />
                </div>
                <strong>{currentMonsters === 0 ? enemy.name : enemy.city}</strong>
                {currentMonsters === 0 ? (
                  <>
                    <strong>HP: {formatPower(enemyHp)} / {formatPower(currentDragonHp)}</strong>
                    <strong>Урон: {formatPower(currentDragonDamage)}</strong>
                    <strong>Реакция: {dragonReaction}</strong>
                  </>
                ) : (
                <strong>Очищено: {formatPower(currentMonsterTotal - currentMonsters)} / {formatPower(currentMonsterTotal)}</strong>
                )}
              </div>
              <div className="lair-summary">
                <p className="label">Место дракона в этом городе</p>
                <strong>{enemy.lair}</strong>
              </div>
              <div className="stats">
                <strong>Золото: {infiniteGold ? '∞' : formatPower(gold)}</strong>
                <strong>Деньги: x{goldMultiplier}</strong>
                <strong>Урон: +{formatPower(attackBonus)}</strong>
                <strong>Артефакт: {equippedArtifact ? `+${equippedArtifact.bonusPercent}% урон, +${equippedArtifact.attackSpeedPercent}% скорость` : 'нет'}</strong>
                <strong>Защита: -{hasAdminHelmet ? '∞' : formatPower(defenseBonus)}</strong>
                <strong>Деньги за босса: {formatPower(reward)}</strong>
                <strong>Монстры: {formatPower(currentMonsters)}</strong>
                <strong>Нападений: {monsterAttackCount}</strong>
                <strong>Здоровье ур.: {healthLevel}</strong>
                <strong>HP монстра: {formatPower(currentMonsterHp)}</strong>
                <strong>Урон монстра: {formatPower(currentMonsterDamage)}</strong>
                <strong>Дуэли: {duelWins}</strong>
              </div>
              <div className="weapon-summary">
                <p className="label">Оружие 12 500 видов</p>
                <strong>{equippedWeapon ? getWeaponDisplayName(equippedWeapon) : 'Пока нет оружия'}</strong>
                <span>{equippedWeapon ? `${equippedWeapon.rarity}, +${isBbiLegendaryWeapon(equippedWeapon) ? `${formatPower(bbiLegendaryDamage)} (x1000)` : equippedWeapon.displayDamage ? formatHugeText(equippedWeapon.displayDamage) : formatPower(equippedWeapon.damage)} урона, цена ${formatPower(equippedWeapon.price)}` : 'Выбивается с врагов и в подземельях'}</span>
              </div>
              <div className="weapon-summary armor-summary">
                <p className="label">Броня 3375 видов</p>
                <strong>{equippedArmor ? equippedArmor.name : 'Пока нет брони'}</strong>
                <span>{equippedArmor ? `${equippedArmor.rarity}, +${equippedArmor.displayDefense ?? formatPower(equippedArmor.defense)} защиты, цена ${formatPower(equippedArmor.price)}` : 'Выбивается с врагов и в подземельях'}</span>
              </div>
            </div>

            <div className="actions">
              <button onClick={strike} disabled={heroHp === 0 || currentMonsters > 0}>Бить дракона</button>
              <button className="duel-button" onClick={startDuelSearch} disabled={heroHp === 0 || duelStatus === 'searching' || duelStatus === 'challenge' || duelStatus === 'fighting'} type="button">
                {duelStatus === 'searching' ? 'Ищет игрока...' : duelStatus === 'fighting' ? 'Дуэль идет...' : 'Дуэль'}
              </button>
              <form className="code-form" onSubmit={submitAdminCode}>
                <input
                  aria-label="Код"
                  onChange={(event) => setAdminCode(event.target.value)}
                  placeholder="Код"
                  value={adminCode}
                />
                <button className="nuclear-button" type="submit">OK</button>
              </form>
            </div>

            <div className="monster-panel">
              <div>
                <p className="label">Монстры города</p>
                <strong>{enemy.city}: разные монстры {formatPower(currentMonsters)} / {formatPower(currentMonsterTotal)}</strong>
                <p>{currentMonsters === 0 ? `Все монстры побеждены. Теперь бей ${isBbiBoss ? 'босса' : 'дракона'}.` : `Победи ${formatPower(currentMonsterTotal)} монстров, чтобы появился ${isBbiWorld ? 'Управляющий' : 'дракон'}.`}</p>
                <p>{isBbiWorld ? `BBI монстр: ${formatPower(bbiMonsterHp)} HP. Всего монстров: ${formatPower(bbiMonsterTotal)}.` : 'Первый город: 100 HP и 10 урона. Каждый следующий город сильнее в 100 раз.'}</p>
              </div>
            </div>

            {dungeon && !dungeon.declined && (
              <div className={`dungeon ${dungeon.cleared ? 'cleared' : ''}`}>
                <div>
                  <p className="label">Пещера 7-го дракона</p>
                  <strong>{dungeon.city}</strong>
                  <p>Врагов внутри: {formatPower(dungeon.enemiesLeft)} / {formatPower(dungeonEnemiesTotal)}</p>
                  <p>Шансы на предметы улучшены в 10 раз. Обычное 10%, необычное 10%, эпик 30%, легендарка 5%, секретное 0.1%.</p>
                </div>
                {dungeon.entered || dungeon.cleared ? (
                  <button onClick={exitDungeon} disabled={dungeon.cleared || heroHp === 0}>
                    {dungeon.cleared ? 'Очищено' : 'Выйти'}
                  </button>
                ) : (
                  <div className="ending-actions">
                    <button onClick={enterDungeon} disabled={heroHp === 0}>Войти</button>
                    <button className="secondary" onClick={declineDungeon}>Не входить</button>
                  </div>
                )}
              </div>
            )}

            {goblinKingReady && !goblinKingFightStarted && (
              <div className="dungeon">
                <div>
                  <p className="label">Король гоблинов</p>
                  <strong>После 10000 врагов открылся трон гоблинов</strong>
                  <p>Выбор: сражаться с ним или не сражаться. Победа откроет секретную концовку про бедных гоблинов.</p>
                </div>
                <div className="ending-actions">
                  <button onClick={() => {
                    setEnemyHp(currentDragonHp);
                    setMessage(`Король гоблинов вышел из глубокой пещеры. У него ${formatPower(currentDragonHp)} HP.`);
                    navigate('/');
                  }}>
                    Сражаться
                  </button>
                  <button className="secondary" onClick={() => {
                    setGoblinKingReady(false);
                    setMessage('Герой не стал сражаться с королем гоблинов. Тайна пещеры осталась жить под землей.');
                  }}>
                    Не сражаться
                  </button>
                </div>
              </div>
            )}

            <div className="shop">
              <div className="shop-title">
                <p className="label">Лавка героя</p>
                <strong>{shopTab === 'upgrades' ? `${infiniteGold ? '∞' : formatPower(gold)} золота` : `${unlockedArtifacts.length} / ${endingArtifacts.length} артефактов`}</strong>
              </div>
              <div className="shop-tabs" role="tablist" aria-label="Вкладки магазина">
                <button className={shopTab === 'upgrades' ? 'selected' : ''} onClick={() => setShopTab('upgrades')} type="button">Улучшения</button>
                <button className={shopTab === 'artifacts' ? 'selected' : ''} onClick={() => setShopTab('artifacts')} type="button">Артефакты</button>
              </div>
              {shopTab === 'upgrades' ? (
                <div className="shop-grid">
                  {shopItems.map((item) => {
                    const level = shopLevels[item.id];
                    const price = getShopPrice(item, level);
                    return (
                      <button className="shop-item" onClick={() => buy(item)} disabled={!infiniteGold && gold < price} key={item.id}>
                        <span>{item.name} ур. {level}</span>
                        <small>{getShopBonusText(item, level)}</small>
                        <b>{price}</b>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="artifact-grid">
                  {endingArtifacts.map((artifact) => {
                    const unlocked = unlockedAchievements.includes(artifact.ending);
                    const equipped = equippedArtifactId === artifact.id;
                    return (
                      <button
                        className={`artifact-card ${unlocked ? 'unlocked' : 'locked'} ${equipped ? 'equipped' : ''}`}
                        disabled={!unlocked}
                        key={artifact.id}
                        onClick={() => setEquippedArtifactId(equipped ? null : artifact.id)}
                        type="button"
                      >
                        <span className={`artifact-icon ${artifact.icon}`}><span /></span>
                        <strong>{artifact.name}</strong>
                        <small>{unlocked ? artifact.text : 'Открой концовку'}</small>
                        <b>{unlocked ? `${equipped ? 'Надет: ' : ''}+${artifact.bonusPercent}% урон, +${artifact.attackSpeedPercent}% скорость` : 'Закрыт'}</b>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        <div className="world">
          <div>
            <p className="label">Огонь мира</p>
            <strong>{worldBurn}%</strong>
          </div>
          <div className="bar world-fire">
            <span style={{ width: `${worldBurn}%` }} />
          </div>
        </div>

        <div className="quests">
          <div className="quest-head">
            <p className="label">Сюжетные квесты</p>
            <strong>{quests.filter((quest) => quest.done).length} / {quests.length}</strong>
          </div>
          <div className="quest-list">
            {visibleQuests.map((quest) => (
              <div className={`quest ${quest.done ? 'done' : quest === activeQuest ? 'active' : ''}`} key={quest.title}>
                <span>{quest.done ? '✓' : '!'}</span>
                <div>
                  <strong>{quest.title}</strong>
                  <p>{quest.text}</p>
                  <small>{quest.progress}</small>
                  <small>Деньги за квест: {quest.money}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {relics.length > 0 && (
          <div className="relics">
            <p className="label">Редкие вещи</p>
            <div>
              {relics.map((relic) => (
                <span key={relic}>{relic}</span>
              ))}
            </div>
          </div>
        )}

        {weapons.length > 0 && (
          <div className="weapons">
            <div className="inventory-head">
              <div>
                <p className="label">Инвентарь оружия</p>
                <strong>{showFullInventory ? `Все оружие: ${weapons.length}` : `Последние ${inventoryPreviewLimit} из ${weapons.length}`}</strong>
              </div>
              <button onClick={() => setShowFullInventory((show) => !show)}>
                {showFullInventory ? 'Показать последние' : 'Показать весь'}
              </button>
            </div>
            <div className={showFullInventory ? 'inventory-list full' : 'inventory-list'}>
              {visibleWeapons.map((weapon) => (
                <button
                  className={`weapon weapon-card ${rarityClass[weapon.rarity]} weapon-style-${getWeaponStyleIndex(weapon)} ${equippedWeapon?.id === weapon.id ? 'equipped' : ''}`}
                  onClick={() => setEquippedWeapon(weapon)}
                  key={weapon.id}
                >
                  <span className="weapon-picture" aria-hidden="true">
                    <i />
                  </span>
                  <span className="weapon-name">{getWeaponDisplayName(weapon)}</span>
                  <small>{weapon.rarity} +{isBbiLegendaryWeapon(weapon) ? `${formatPower(bbiLegendaryDamage)} x1000` : weapon.displayDamage ? formatHugeText(weapon.displayDamage) : formatPower(weapon.damage)} | продажа {formatPower(weaponSellPrice[weapon.rarity])}</small>
                  <span
                    className="sell-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      sellWeapon(weapon);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    Продать
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {armors.length > 0 && (
          <div className="weapons armors">
            <div className="inventory-head">
              <div>
                <p className="label">Инвентарь брони 3375 видов</p>
                <strong>{showFullInventory ? `Вся броня: ${armors.length}` : `Последние ${inventoryPreviewLimit} из ${armors.length}`}</strong>
              </div>
              <button onClick={() => setShowFullInventory((show) => !show)}>
                {showFullInventory ? 'Показать последние' : 'Показать весь'}
              </button>
            </div>
            <div className={showFullInventory ? 'inventory-list full' : 'inventory-list'}>
              {visibleArmors.map((armor) => (
                <button
                  className={`weapon armor-card ${rarityClass[armor.rarity]} armor-style-${getArmorStyleIndex(armor)} ${isHelmetArmor(armor) ? 'helmet-card' : 'body-card'} ${equippedArmor?.id === armor.id ? 'equipped' : ''}`}
                  onClick={() => setEquippedArmor(armor)}
                  key={armor.id}
                >
                  <span className="armor-picture" aria-hidden="true">
                    <i />
                  </span>
                  <span>{armor.name}</span>
                  <small>{armor.rarity} +{armor.displayDefense ?? formatPower(armor.defense)} защиты | цена {formatPower(armor.price)}</small>
                  <span
                    className="sell-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      sellArmor(armor);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    Продать
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="world-map">
          <p className="label">Большой мир</p>
          <div>
            {worldLocations.slice(0, 10).map((location) => (
              <span key={location}>{location}</span>
            ))}
          </div>
        </div>

        <div className="cities">
          {dragonSons.map((son, index) => (
            <div className={`city ${index < savedCities.length ? 'saved' : index === chapter ? 'active' : ''}`} key={son.name}>
              <span>{index + 1}</span>
              <div>
                <strong>{son.city}</strong>
                <p>{son.country}</p>
                <small>{son.lair}</small>
                <small>Монстры: разные виды {formatPower(cityMonsters[index])} / {formatPower(monstersPerCity)}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}
    </main>
  );
}

