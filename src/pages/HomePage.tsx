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
type SecretEnding = 'goblinKing' | null;

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

const worldLocations = [
  'Астана', 'Бишкек', 'Ташкент', 'Дубай', 'Каир', 'Афины', 'Берлин',
  'Мадрид', 'Прага', 'Сеул', 'Пекин', 'Сидней', 'Торонто', 'Мехико',
  'Рио-де-Жанейро', 'Буэнос-Айрес', 'Кейптаун', 'Осло', 'Варшава', 'Дели',
];

const heroMaxHp = 100;
const monstersPerCity = 10_000;
const dungeonEnemiesTotal = 100_000;
const baseMonsterHp = 1_000;
const baseMonsterDamage = 10;
const baseDragonHp = 1_000_000;
const baseDragonDamage = 1_000;
const adminNukeDamageText = '9'.repeat(4_000);
const adminHelmetHealthText = '9'.repeat(384);

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

const rarityClass: Record<Rarity, string> = {
  'Обычный': 'common',
  'Необычный': 'uncommon',
  'Редкий': 'rare',
  'Эпик': 'epic',
  'Легендарка': 'legendary',
  'Секретное': 'secret',
};

function formatPower(value: number) {
  return value.toLocaleString('ru-RU');
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
  const [gold, setGold] = useState(0);
  const [dungeon, setDungeon] = useState<Dungeon | null>(null);
  const [relics, setRelics] = useState<string[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [equippedWeapon, setEquippedWeapon] = useState<Weapon | null>(null);
  const [armors, setArmors] = useState<Armor[]>([]);
  const [equippedArmor, setEquippedArmor] = useState<Armor | null>(null);
  const [showFullInventory, setShowFullInventory] = useState(false);
  const [heroAnimation, setHeroAnimation] = useState<HeroAnimation>('idle');
  const [heroPosition, setHeroPosition] = useState({ x: -18_000, z: 0 });
  const [heroHeight, setHeroHeight] = useState(0);
  const verticalVelocity = useRef(0);
  const pressedKeys = useRef<Set<string>>(new Set());
  const [cityMonsters, setCityMonsters] = useState(() => dragonSons.map(() => monstersPerCity));
  const [monsterAttackCount, setMonsterAttackCount] = useState(0);
  const [battlePulse, setBattlePulse] = useState(0);
  const [adminCode, setAdminCode] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [introSkipped, setIntroSkipped] = useState(false);
  const paidQuestIds = useRef<Set<number>>(new Set());
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
  const isGoblinKingBoss = goblinKingReady;
  const enemy = isGoblinKingBoss ? goblinKing : isFamilyBoss ? dragonFamily : isFinalBoss ? finalDragon : dragonSons[chapter];
  const isFinalReveal = victory && chapter > dragonSons.length && !isFamilyBoss;
  const isEndingChoice = isFinalReveal && endingChoice === null;
  const isDungeon = dungeon?.entered && !dungeon.cleared;
  const hasAdminHelmet = equippedArmor?.id.startsWith('admin-helmet-') ?? false;
  const currentHeroMaxHp = hasAdminHelmet ? Number.MAX_SAFE_INTEGER : heroMaxHp + upgradePower(healthLevel, shopBasePower.health);
  const heroHealthText = hasAdminHelmet ? `${adminHelmetHealthText} / ${adminHelmetHealthText}` : `${heroHp} / ${currentHeroMaxHp}`;

  const worldBurn = useMemo(() => Math.max(0, 100 - savedCities.length * 13), [savedCities.length]);
  const weaponBonus = equippedWeapon?.damage ?? 0;
  const attackBonus = upgradePower(items.sword, shopBasePower.sword) + upgradePower(items.pet, shopBasePower.pet) + weaponBonus;
  const armorBonus = equippedArmor?.defense ?? 0;
  const defenseBonus = upgradePower(items.clothes, shopBasePower.clothes) + upgradePower(items.helmet, shopBasePower.helmet) + upgradePower(items.armor, shopBasePower.armor) + armorBonus;
  const reward = enemy ? 120 + chapter * 110 : 0;
  const currentMonsters = isFinalBoss || isFamilyBoss || isGoblinKingBoss ? 0 : isDungeon ? dungeon.enemiesLeft : cityMonsters[chapter] ?? 0;
  const currentMonsterHp = isDungeon ? scaledPower(baseMonsterHp, chapter + 2) : scaledPower(baseMonsterHp, chapter);
  const currentMonsterDamage = isDungeon ? scaledPower(baseMonsterDamage, chapter + 2) : scaledPower(baseMonsterDamage, chapter);
  const kingDragonHp = scaledDragonPower(baseDragonHp, dragonSons.length + 2);
  const kingDragonDamage = scaledDragonPower(baseDragonDamage, dragonSons.length + 2);
  const currentDragonHp = isGoblinKingBoss ? scaledDragonPower(baseDragonHp, chapter + 4) : isFamilyBoss ? kingDragonHp * 100 : isFinalBoss ? kingDragonHp : scaledDragonPower(baseDragonHp, chapter);
  const currentDragonDamage = isGoblinKingBoss ? scaledDragonPower(baseDragonDamage, chapter + 4) : isFamilyBoss ? kingDragonDamage * 100 : isFinalBoss ? kingDragonDamage : scaledDragonPower(baseDragonDamage, chapter);
  const dragonReaction = enemy?.reaction ?? 'обычная реакция';
  const dragonReactionSpeed = enemy?.attackSpeed ?? 1;
  const currentEnemyHealthText = currentMonsters > 0
    ? `Враг HP ${formatPower(currentMonsterHp)}`
    : `Дракон HP ${formatPower(enemyHp)}/${formatPower(currentDragonHp)}`;
  const cityScene = `scene-city-${chapter % 6}`;
  const battleScene = isDungeon
    ? 'scene-dungeon'
    : isFamilyBoss
      ? 'scene-family'
      : currentMonsters === 0
        ? isGoblinKingBoss
          ? 'scene-boss-goblin'
          : isFinalBoss
            ? 'scene-boss-final'
            : `scene-boss-${chapter % 10}`
        : cityScene;
  const dragonClass = isFamilyBoss
    ? 'dragon-family'
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
      text: 'Очисти пещеру на 100000 врагов и узнай тайну бедных гоблинов.',
      done: secretEnding === 'goblinKing',
      progress: secretEnding === 'goblinKing' ? 'секрет раскрыт' : goblinKingReady ? 'король гоблинов ждет' : 'найди пещеру',
      money: 77_777,
    },
  ];
  const activeQuest = quests.find((quest) => !quest.done) ?? quests[quests.length - 1];
  const visibleQuests = quests.filter((quest) => quest.done).slice(-3).concat(activeQuest).filter((quest, index, list) => list.findIndex((item) => item.title === quest.title) === index);
  const visibleWeapons = showFullInventory ? weapons : weapons.slice(-8);
  const visibleArmors = showFullInventory ? armors : armors.slice(-8);

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
    setGold((currentGold) => currentGold + money);
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

    if (gold < price) {
      setMessage(`Не хватает золота на ${item.name}. Победи еще одного врага.`);
      return;
    }

    setGold(gold - price);
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
      setMessage(currentMonsters <= 0 ? `В этом городе все ${monstersPerCity} монстров уже побеждены.` : 'Сначала восстанови героя.');
      return;
    }

    playHeroAnimation('strike', 420);
    setBattlePulse((pulse) => pulse + 1);

    if (equippedWeapon?.id.startsWith('admin-nuke-')) {
      if (isDungeon && dungeon) {
        setDungeon({ ...dungeon, enemiesLeft: 0, cleared: true, entered: false });
        setGoblinKingReady(true);
        setEnemyHp(currentDragonHp);
        setMessage('Админская ядерка очистила пещеру. Теперь можно сразиться с королем гоблинов.');
        return;
      }
      setCityMonsters(cityMonsters.map((count, index) => (index === chapter ? 0 : count)));
      setEnemyHp(currentDragonHp);
      setGold(gold + 1_000 + chapter * 250);
      setMessage(`Админская ядерка сработала! Все ${monstersPerCity} монстров города уничтожены сразу. Босс-дракон появился.`);
      return;
    }

    const monsterDamage = Math.max(1, currentMonsterDamage - defenseBonus);
    const nextHeroHp = Math.max(0, heroHp - monsterDamage);
    const monstersPerHit = items.doubleStrike > 0 ? 2 + Math.max(0, shopLevels.doubleStrike - 1) : 1;
    const nextMonsters = Math.max(0, currentMonsters - monstersPerHit);
    const monsterWeapon = isDungeon ? rollDungeonWeapon(chapter + 1) : rollWeapon(2, chapter + 1);
    const monsterArmor = rollArmor(2, chapter + 1);
    const nextCityMonsters = cityMonsters.map((count, index) => (index === chapter ? nextMonsters : count));

    setHeroHp(nextHeroHp);
    if (isDungeon && dungeon) {
      setDungeon({ ...dungeon, enemiesLeft: nextMonsters });
    } else {
      setCityMonsters(nextCityMonsters);
    }
    setGold(gold + 2 + chapter);

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
        ? `Удар задел ${monstersPerHit} враг. Осталось ${nextMonsters} из ${isDungeon ? dungeonEnemiesTotal : monstersPerCity}. Выпало оружие: ${monsterWeapon.name} (${monsterWeapon.rarity}).`
        : monsterArmor
          ? `Удар задел ${monstersPerHit} враг. Осталось ${nextMonsters} из ${isDungeon ? dungeonEnemiesTotal : monstersPerCity}. Выпала броня: ${monsterArmor.name} (${monsterArmor.rarity}).`
        : `Удар задел ${monstersPerHit} враг. Осталось ${nextMonsters} из ${isDungeon ? dungeonEnemiesTotal : monstersPerCity}. Получено золото.`
    );

    if (nextMonsters === 0) {
      if (isDungeon && dungeon) {
        setDungeon({ ...dungeon, enemiesLeft: 0, cleared: true, entered: false });
        setGoblinKingReady(true);
        setEnemyHp(currentDragonHp);
        setMessage('Пещера очищена: 100000 врагов побеждены. Теперь выбери: сражаться с королем гоблинов или не сражаться.');
        return;
      }
      setEnemyHp(currentDragonHp);
      setMessage(`Все монстры побеждены. Появился дракон: ${formatPower(currentDragonHp)} HP и ${formatPower(currentDragonDamage)} урона.`);
    }
  }

  function clearCity() {
    if (!enemy) return;

    if (isGoblinKingBoss) {
      setVictory(true);
      setSecretEnding('goblinKing');
      setGoblinKingReady(false);
      setChapter(dragonSons.length + 1);
      setGold(gold + 777_777);
      setMessage('Секретная концовка открыта: король гоблинов побежден.');
      navigate('/world');
      return;
    }

    if (isFamilyBoss) {
      setVictory(true);
      setEndingChoice('fight');
      setChapter(dragonSons.length + 1);
      setGold(gold + 100_000);
      setMessage('Семья короля драконов побеждена. Началась плохая концовка: война истребила драконов.');
      navigate('/world');
      return;
    }

    if (isFinalBoss) {
      setVictory(true);
      setChapter(dragonSons.length + 1);
      setEndingChoice(null);
      setGold(gold + 50_000);
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
    setGold(gold + prize);
    if (chapter === 5 && !dungeon) {
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
    setMessage(`${clearedCity} очищен от монстров. Ты получил ${prize} золота. ${chapter === 5 ? 'После победы над драконом открылась пещера. Выбери: войти или не входить.' : 'Путь идет дальше.'}`);
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
      const monsterDamage = Math.max(1, currentMonsterDamage - defenseBonus);
      playHeroAnimation('strike', 260);
      setBattlePulse((pulse) => pulse + 1);
      setMonsterAttackCount((count) => count + 1);
      setHeroHp((hp) => {
        const nextHp = Math.max(0, hp - monsterDamage);
        if (nextHp === 0) {
          setMessage('Монстры постоянно нападали и герой упал. Нажми восстановить, чтобы продолжить.');
        } else {
          setMessage(`Монстр напал сам! Урон ${monsterDamage}. Осталось монстров: ${currentMonsters}.`);
        }
        return nextHp;
      });
    }, 3200);

    return () => window.clearInterval(attackTimer);
  }, [chapter, currentMonsters, defenseBonus, heroHp, isFinalReveal]);

  function strike() {
    if (isFinalReveal || !enemy) return;
    if (currentMonsters > 0) {
      setMessage(`Сначала победи всех монстров города. Осталось: ${currentMonsters} из ${monstersPerCity}.`);
      return;
    }
    playHeroAnimation('strike', 420);
    setBattlePulse((pulse) => pulse + 1);

    const manaDamage = items.mana > 0 ? Math.max(shopBasePower.mana, upgradePower(shopLevels.mana, shopBasePower.mana)) : 0;
    const heroDamage = 18 + chapter * 5 + attackBonus + manaDamage;
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
    const dragonDamage = Math.max(1, currentDragonDamage * speedDamageBonus - defenseBonus);
    const nextHeroHp = Math.max(0, heroHp - dragonDamage);
    setEnemyHp(nextEnemyHp);
    setHeroHp(nextHeroHp);

    if (nextHeroHp === 0) {
      setMessage(`Дракон ударил на ${formatPower(dragonDamage)} урона. Герой упал, нажми восстановить.`);
      return;
    }

    setMessage(`Удар по дракону: -${formatPower(heroDamage)} HP. У дракона осталось ${formatPower(nextEnemyHp)} HP. Реакция: ${dragonReaction}. Он ответил на ${formatPower(dragonDamage)} урона.`);
  }

  function submitAdminCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (adminCode.trim() === '999999999') {
      const sword = createBillionSword();
      setWeapons((currentWeapons) => [...currentWeapons, sword]);
      setEquippedWeapon(sword);
      setAdminCode('');
      setMessage('Код принят. Получен меч с уроном 999999999.');
      return;
    }

    if (adminCode.trim().toUpperCase() !== 'DDD') {
      setAdminCode('');
      setMessage('Код не подошел.');
      return;
    }

    const nuke = createAdminNuke();
    const helmet = createAdminHelmet();
    setWeapons((currentWeapons) => [...currentWeapons, nuke]);
    setArmors((currentArmors) => [...currentArmors, helmet]);
    setEquippedWeapon(nuke);
    setEquippedArmor(helmet);
    setHeroHp(Number.MAX_SAFE_INTEGER);
    setAdminCode('');
    setMessage('Код DDD принят. Получена админская ядерка и шлем с огромным здоровьем.');
  }

  function enterDungeon() {
    if (!dungeon || dungeon.cleared) return;
    setDungeon({ ...dungeon, entered: true });
    setMessage(`Ты вошел в пещеру под городом ${dungeon.city}. Внутри ${formatPower(dungeon.enemiesLeft)} врагов.`);
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
    setGold(0);
    setDungeon(null);
    setRelics([]);
    setWeapons([]);
    setEquippedWeapon(null);
    setArmors([]);
    setEquippedArmor(null);
    setHeroAnimation('idle');
    setHeroPosition({ x: -18_000, z: 0 });
    setHeroHeight(0);
    verticalVelocity.current = 0;
    setCityMonsters(dragonSons.map(() => monstersPerCity));
    setMonsterAttackCount(0);
    setBattlePulse(0);
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
          <button onClick={() => setIntroSkipped(true)} type="button">
            Пропустить
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={`game ${isWorldPage ? 'world-page' : 'play-page'}`}>
      <div className="auth-panel">
        <span>{authUser.email}</span>
        <button className="secondary" onClick={logout} disabled={authBusy}>Выйти</button>
      </div>
      <section className="stage" aria-label="Поле битвы">
        <Link className="page-switch world-link" href="/world">Пылающий мир</Link>
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
              const monsterKind = enemy?.monsterKind ?? mixedMonster[0];
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
          <div className={`hero knight ${heroAnimation}`} style={{ left: `${26 + heroPosition.x / 1000}%`, bottom: `${132 - heroPosition.z / 80 + heroHeight}px` }}>
            <div className="cape" />
            <div className="shield-2d" />
            <div className="head" />
            <div className="helm-2d" />
            <div className="body" />
            <div className="arm-2d" />
            <div className="leg-2d left-leg" />
            <div className="leg-2d right-leg" />
            <div className="sword" />
            <div className="heal-aura" />
          </div>
          {!isFinalReveal && enemy && currentMonsters === 0 && (
            <div className={`boss ${isFinalBoss ? 'final-boss' : ''} ${dragonClass}`} style={{ '--dragon-color': enemy.color } as CSSProperties}>
              <div className="tail-2d" />
              <div className="wing wing-left" />
              <div className="wing wing-right" />
              <div className="boss-body" />
              <div className="neck-2d" />
              <div className="boss-head" />
              {isFinalBoss && (
                <>
                  <div className="dragon-crown">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="dragon-beard" />
                </>
              )}
              <div className="horn-2d left-horn" />
              <div className="horn-2d right-horn" />
              <div className="boss-fire" />
            </div>
          )}
        </div>
      </section>

      {!isWorldPage && !isFinalReveal && enemy && (
        <div className="quick-hud" aria-label="Быстрое состояние игры">
          <div>
            <strong>{enemy.city}</strong>
            <span>Здоровье {heroHealthText}</span>
            <span>{currentEnemyHealthText}</span>
            <span>{isDungeon ? 'Пещера' : 'Монстры'}: {currentMonsters}</span>
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
        </div>
      )}

      {isWorldPage && (
      <section className="hud" aria-label="Состояние игры">
        <Link className="page-switch play-link" href="/">Играть</Link>
        <div className="story">
          <p className="eyebrow">Пылающий мир</p>
          <h1>Меч против сыновей дракона</h1>
          <p>{message}</p>
        </div>

        {secretEnding === 'goblinKing' ? (
          <div className="reveal">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Король бедных гоблинов</h2>
            <p>
              Герой победил короля гоблинов и узнал правду: самые бедные гоблины жили в пещерах,
              потому что их никто не любил, все прогоняли их из городов и считали злыми с рождения.
            </p>
            <p>
              Они нападали не ради славы, а потому что боялись снова остаться без дома, еды и защиты.
              Теперь герой может рассказать людям, что даже гоблинам нужен шанс.
            </p>
            <div className="ending-actions">
              <button onClick={restart}>Начать заново</button>
              <Link className="ending-link" href="/">Вернуться в битву</Link>
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
              <strong>Золото героя: {formatPower(gold)}</strong>
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
                  <span style={{ width: `${(heroHp / currentHeroMaxHp) * 100}%` }} />
                </div>
                <strong>{heroHealthText}</strong>
              </div>
              <div>
                <p className="label">{currentMonsters === 0 ? 'Дракон-босс' : 'Город'}</p>
                <div className="bar enemy">
                  <span style={{ width: `${currentMonsters === 0 ? Math.min(100, (enemyHp / currentDragonHp) * 100) : Math.max(0, 100 - (currentMonsters / monstersPerCity) * 100)}%` }} />
                </div>
                <strong>{currentMonsters === 0 ? enemy.name : enemy.city}</strong>
                {currentMonsters === 0 ? (
                  <>
                    <strong>HP: {formatPower(enemyHp)} / {formatPower(currentDragonHp)}</strong>
                    <strong>Урон: {formatPower(currentDragonDamage)}</strong>
                    <strong>Реакция: {dragonReaction}</strong>
                  </>
                ) : (
                  <strong>Очищено: {monstersPerCity - currentMonsters} / {monstersPerCity}</strong>
                )}
              </div>
              <div className="lair-summary">
                <p className="label">Место дракона в этом городе</p>
                <strong>{enemy.lair}</strong>
              </div>
              <div className="stats">
                <strong>Золото: {gold}</strong>
                <strong>Урон: +{attackBonus}</strong>
                <strong>Защита: -{defenseBonus}</strong>
                <strong>Деньги за босса: {reward}</strong>
                <strong>Монстры: {currentMonsters}</strong>
                <strong>Нападений: {monsterAttackCount}</strong>
                <strong>Здоровье ур.: {healthLevel}</strong>
                <strong>HP монстра: {currentMonsterHp}</strong>
                <strong>Урон монстра: {currentMonsterDamage}</strong>
              </div>
              <div className="weapon-summary">
                <p className="label">Оружие 12 500 видов</p>
                <strong>{equippedWeapon ? equippedWeapon.name : 'Пока нет оружия'}</strong>
                <span>{equippedWeapon ? `${equippedWeapon.rarity}, +${equippedWeapon.displayDamage ?? equippedWeapon.damage} урона, цена ${equippedWeapon.price}` : 'Выбивается с врагов и в подземельях'}</span>
              </div>
              <div className="weapon-summary armor-summary">
                <p className="label">Броня 3375 видов</p>
                <strong>{equippedArmor ? equippedArmor.name : 'Пока нет брони'}</strong>
                <span>{equippedArmor ? `${equippedArmor.rarity}, +${equippedArmor.displayDefense ?? equippedArmor.defense} защиты, цена ${equippedArmor.price}` : 'Выбивается с врагов и в подземельях'}</span>
              </div>
            </div>

            <div className="actions">
              <button onClick={strike} disabled={heroHp === 0 || currentMonsters > 0}>Бить дракона</button>
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
                <strong>{enemy.city}: разные монстры {currentMonsters} / {monstersPerCity}</strong>
                <p>{currentMonsters === 0 ? 'Все монстры побеждены. Теперь бей дракона.' : `Победи ${monstersPerCity} монстров, чтобы появился дракон.`}</p>
                <p>Первый город: 100 HP и 10 урона. Каждый следующий город сильнее в 100 раз.</p>
              </div>
            </div>

            {dungeon && !dungeon.declined && (
              <div className={`dungeon ${dungeon.cleared ? 'cleared' : ''}`}>
                <div>
                  <p className="label">Пещера 6-го города после дракона</p>
                  <strong>{dungeon.city}</strong>
                  <p>Врагов внутри: {formatPower(dungeon.enemiesLeft)} / {formatPower(dungeonEnemiesTotal)}</p>
                  <p>Шансы оружия: обычное 10%, необычное 10%, эпик 30%, легендарка 5%, секретное 0.1%.</p>
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

            {goblinKingReady && (
              <div className="dungeon">
                <div>
                  <p className="label">Король гоблинов</p>
                  <strong>После 100000 врагов открылся трон гоблинов</strong>
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
                <strong>{gold} золота</strong>
              </div>
              <div className="shop-grid">
                {shopItems.map((item) => {
                  const level = shopLevels[item.id];
                  const price = getShopPrice(item, level);
                  return (
                    <button className="shop-item" onClick={() => buy(item)} disabled={gold < price} key={item.id}>
                      <span>{item.name} ур. {level}</span>
                      <small>{getShopBonusText(item, level)}</small>
                      <b>{price}</b>
                    </button>
                  );
                })}
              </div>
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
                <strong>{showFullInventory ? `Все оружие: ${weapons.length}` : `Последние 8 из ${weapons.length}`}</strong>
              </div>
              <button onClick={() => setShowFullInventory((show) => !show)}>
                {showFullInventory ? 'Показать последние' : 'Показать весь'}
              </button>
            </div>
            <div className={showFullInventory ? 'inventory-list full' : 'inventory-list'}>
              {visibleWeapons.map((weapon) => (
                <button
                  className={`weapon ${rarityClass[weapon.rarity]} ${equippedWeapon?.id === weapon.id ? 'equipped' : ''}`}
                  onClick={() => setEquippedWeapon(weapon)}
                  key={weapon.id}
                >
                  <span>{weapon.name}</span>
                  <small>{weapon.rarity} +{weapon.displayDamage ?? weapon.damage} | цена {weapon.price}</small>
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
                <strong>{showFullInventory ? `Вся броня: ${armors.length}` : `Последние 8 из ${armors.length}`}</strong>
              </div>
              <button onClick={() => setShowFullInventory((show) => !show)}>
                {showFullInventory ? 'Показать последние' : 'Показать весь'}
              </button>
            </div>
            <div className={showFullInventory ? 'inventory-list full' : 'inventory-list'}>
              {visibleArmors.map((armor) => (
                <button
                  className={`weapon ${rarityClass[armor.rarity]} ${equippedArmor?.id === armor.id ? 'equipped' : ''}`}
                  onClick={() => setEquippedArmor(armor)}
                  key={armor.id}
                >
                  <span>{armor.name}</span>
                  <small>{armor.rarity} +{armor.displayDefense ?? armor.defense} защиты | цена {armor.price}</small>
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
                <small>Монстры: разные виды {cityMonsters[index]} / {monstersPerCity}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}
    </main>
  );
}

