import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

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
};

type CityStage = DragonSon;

type ShopItem = {
  id: 'sword' | 'pet' | 'clothes' | 'helmet' | 'armor' | 'mana' | 'health';
  name: string;
  price: number;
  bonus: string;
};

type Dungeon = {
  city: string;
  danger: number;
  cleared: boolean;
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

const firstDragonCities: CityStage[] = [
  { name: 'Игнис', city: 'Алматы', country: 'Казахстан', lair: 'Логово Искры в горах Заилийского Алатау', monsterKind: 'goblin', monsterName: 'гоблины', title: 'сын искры', power: 1_000, color: '#ffb703' },
  { name: 'Рубор', city: 'Стамбул', country: 'Турция', lair: 'Пепельное гнездо у древних стен', monsterKind: 'orc', monsterName: 'орки', title: 'сын пепла', power: 1_000_000, color: '#fb5607' },
  { name: 'Каэрн', city: 'Рим', country: 'Италия', lair: 'Лавовая арена под Колизеем', monsterKind: 'lizard', monsterName: 'ящерицы', title: 'сын лавы', power: 1_000_000_000, color: '#d00000' },
  { name: 'Сольвар', city: 'Париж', country: 'Франция', lair: 'Дымная башня над Сеной', monsterKind: 'dwarf', monsterName: 'гномы', title: 'сын дымного неба', power: 1_000_000_000_000, color: '#8ecae6' },
  { name: 'Мэйдзин', city: 'Токио', country: 'Япония', lair: 'Черное святилище огня', monsterKind: 'shadow', monsterName: 'теневые воины', title: 'сын черного огня', power: 1_000_000_000_000_000, color: '#8338ec' },
  { name: 'Аурокс', city: 'Нью-Йорк', country: 'США', lair: 'Гнездо раскаленного ветра над небоскребами', monsterKind: 'magma', monsterName: 'лавовые звери', title: 'сын раскаленного ветра', power: 1_000_000_000_000_000_000, color: '#3a86ff' },
  { name: 'Ноктар', city: 'Лондон', country: 'Великобритания', lair: 'Последнее логово в тумане Темзы', monsterKind: 'frost', monsterName: 'ледяные стражи', title: 'последний сын дракона', power: 1_000_000_000_000_000_000_000, color: '#06d6a0' },
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
  ...extraDragonCities.slice(0, 93).map((city, index) => {
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
    };
  }),
];

const worldLocations = [
  'Астана', 'Бишкек', 'Ташкент', 'Дубай', 'Каир', 'Афины', 'Берлин',
  'Мадрид', 'Прага', 'Сеул', 'Пекин', 'Сидней', 'Торонто', 'Мехико',
  'Рио-де-Жанейро', 'Буэнос-Айрес', 'Кейптаун', 'Осло', 'Варшава', 'Дели',
];

const heroMaxHp = 120;
const monstersPerCity = 10_000;
const baseMonsterHp = 100;
const baseMonsterDamage = 10;
const baseDragonHp = 1_000;
const baseDragonDamage = 1_000;

const shopItems: ShopItem[] = [
  { id: 'sword', name: 'Меч рассвета', price: 120, bonus: '+14 к урону' },
  { id: 'pet', name: 'Огненный питомец', price: 180, bonus: '+10 урона каждый удар' },
  { id: 'clothes', name: 'Одежда странника', price: 90, bonus: '-3 урона от огня' },
  { id: 'helmet', name: 'Шлем героя', price: 140, bonus: '-5 урона от огня' },
  { id: 'armor', name: 'Драконья броня', price: 240, bonus: '-9 урона от огня' },
  { id: 'mana', name: 'Фляга маны', price: 80, bonus: '+1 мощный удар' },
  { id: 'health', name: 'Сердце рыцаря', price: 160, bonus: '+35 максимум здоровья' },
];

const shopBasePower: Record<ShopItem['id'], number> = {
  sword: 14,
  pet: 10,
  clothes: 3,
  helmet: 5,
  armor: 9,
  mana: 35,
  health: 35,
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
  if (item.id === 'sword' || item.id === 'pet') return `+${bonus} к урону`;
  if (item.id === 'mana') return `+${bonus} урона мощным ударом`;
  if (item.id === 'health') return `+${bonus} максимум здоровья`;
  return `-${bonus} урона от врагов`;
}

const rareLoot = [
  { name: 'Лунный клинок', text: '+45 к урону', gold: 60, sword: 3 },
  { name: 'Корона пепла', text: '+18 защиты', gold: 90, armor: 2 },
  { name: 'Феникс-питомец', text: '+35 к урону питомца', gold: 120, pet: 3 },
  { name: 'Кристалл маны', text: '+4 маны', gold: 40, mana: 4 },
];

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
  const damage = rarityDamage[rarity] + level * 6 + Math.floor(Math.random() * 12);

  return {
    id: `${Date.now()}-${Math.random()}`,
    name: `${base} ${material} ${enchant}`,
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

function createSecretWeapon(level = 1): Weapon {
  return {
    id: `secret-${Date.now()}-${Math.random()}`,
    name: 'иди нах',
    rarity: 'Секретное',
    damage: rarityDamage['Секретное'] + level * 100_000,
    price: rarityPrice['Секретное'],
  };
}

export function HomePage() {
  const [chapter, setChapter] = useState(0);
  const [healthLevel, setHealthLevel] = useState(0);
  const [heroHp, setHeroHp] = useState(heroMaxHp);
  const [enemyHp, setEnemyHp] = useState(baseDragonHp);
  const [message, setMessage] = useState('Мир горит. Нажимай удар мечом, чтобы очистить первый город.');
  const [savedCities, setSavedCities] = useState<string[]>([]);
  const [victory, setVictory] = useState(false);
  const [gold, setGold] = useState(0);
  const [dungeon, setDungeon] = useState<Dungeon | null>(null);
  const [relics, setRelics] = useState<string[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [equippedWeapon, setEquippedWeapon] = useState<Weapon | null>(null);
  const [armors, setArmors] = useState<Armor[]>([]);
  const [equippedArmor, setEquippedArmor] = useState<Armor | null>(null);
  const [heroAnimation, setHeroAnimation] = useState<HeroAnimation>('idle');
  const [heroPosition, setHeroPosition] = useState({ x: -3_100, z: 0 });
  const pressedKeys = useRef<Set<string>>(new Set());
  const [cityMonsters, setCityMonsters] = useState(() => dragonSons.map(() => monstersPerCity));
  const [monsterAttackCount, setMonsterAttackCount] = useState(0);
  const [battlePulse, setBattlePulse] = useState(0);
  const paidQuestIds = useRef<Set<number>>(new Set());
  const [items, setItems] = useState<Record<ShopItem['id'], number>>({
    sword: 0,
    pet: 0,
    clothes: 0,
    helmet: 0,
    armor: 0,
    mana: 0,
    health: 0,
  });
  const [shopLevels, setShopLevels] = useState<Record<ShopItem['id'], number>>({
    sword: 0,
    pet: 0,
    clothes: 0,
    helmet: 0,
    armor: 0,
    mana: 0,
    health: 0,
  });

  const enemy = dragonSons[chapter];
  const isFinalReveal = victory && chapter >= dragonSons.length;
  const currentHeroMaxHp = heroMaxHp + upgradePower(healthLevel, shopBasePower.health);

  const worldBurn = useMemo(() => Math.max(0, 100 - savedCities.length * 13), [savedCities.length]);
  const weaponBonus = equippedWeapon?.damage ?? 0;
  const attackBonus = upgradePower(items.sword, shopBasePower.sword) + upgradePower(items.pet, shopBasePower.pet) + weaponBonus;
  const armorBonus = equippedArmor?.defense ?? 0;
  const defenseBonus = upgradePower(items.clothes, shopBasePower.clothes) + upgradePower(items.helmet, shopBasePower.helmet) + upgradePower(items.armor, shopBasePower.armor) + armorBonus;
  const reward = enemy ? 120 + chapter * 110 : 0;
  const currentMonsters = cityMonsters[chapter] ?? 0;
  const currentMonsterHp = scaledPower(baseMonsterHp, chapter);
  const currentMonsterDamage = scaledPower(baseMonsterDamage, chapter);
  const currentDragonHp = scaledDragonPower(baseDragonHp, chapter);
  const currentDragonDamage = scaledDragonPower(baseDragonDamage, chapter);
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
      done: isFinalReveal,
      progress: isFinalReveal ? 'правда раскрыта' : 'финал еще впереди',
      money: 50_000,
    },
  ];
  const activeQuest = quests.find((quest) => !quest.done) ?? quests[quests.length - 1];
  const visibleQuests = quests.filter((quest) => quest.done).slice(-3).concat(activeQuest).filter((quest, index, list) => list.findIndex((item) => item.title === quest.title) === index);

  useEffect(() => {
    const completedUnpaid = quests.filter((quest) => quest.done && !paidQuestIds.current.has(quest.id));
    if (completedUnpaid.length === 0) return;

    const money = completedUnpaid.reduce((sum, quest) => sum + quest.money, 0);
    completedUnpaid.forEach((quest) => paidQuestIds.current.add(quest.id));
    setGold((currentGold) => currentGold + money);
    setMessage(`Квест выполнен! Получено денег: ${money}. Чем сложнее задание, тем больше награда.`);
  }, [storyProgress, savedCities.length, isFinalReveal]);

  function maybeOpenDungeon(city: string, nextChapter: number) {
    if (Math.random() < 0.45) {
      setDungeon({ city, danger: 35 + nextChapter * 10, cleared: false });
      return true;
    }

    setDungeon(null);
    return false;
  }

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
      if (keys.has('w')) dz -= 120;
      if (keys.has('s')) dz += 120;
      if (keys.has('a')) dx += 120;
      if (keys.has('d')) dx -= 120;
      if (dx !== 0 || dz !== 0) moveHero(dx, dz);
    }, 80);

    return () => window.clearInterval(moveTimer);
  }, []);

  function fightMonster() {
    if (isFinalReveal || heroHp === 0 || currentMonsters <= 0) {
      setMessage(currentMonsters <= 0 ? `В этом городе все ${monstersPerCity} монстров уже побеждены.` : 'Сначала восстанови героя.');
      return;
    }

    playHeroAnimation('strike', 420);
    setBattlePulse((pulse) => pulse + 1);

    if (equippedWeapon?.name === 'ядерка') {
      const nextCityMonsters = cityMonsters.map((count, index) => (index === chapter ? 0 : count));
      setCityMonsters(nextCityMonsters);
      setGold(gold + 1_000 + chapter * 250);
      setMessage(`Ядерка сработала! Все ${monstersPerCity} монстров города уничтожены сразу. Босс-дракон появился.`);
      return;
    }

    const monsterDamage = Math.max(1, currentMonsterDamage - defenseBonus);
    const nextHeroHp = Math.max(0, heroHp - monsterDamage);
    const nextMonsters = Math.max(0, currentMonsters - 1);
    const monsterWeapon = rollWeapon(2, chapter + 1);
    const monsterArmor = rollArmor(2, chapter + 1);
    const nextCityMonsters = cityMonsters.map((count, index) => (index === chapter ? nextMonsters : count));

    setHeroHp(nextHeroHp);
    setCityMonsters(nextCityMonsters);
    setGold(gold + 7 + chapter * 2);

    if (monsterWeapon) {
      setWeapons([...weapons, monsterWeapon]);
      if (!equippedWeapon || monsterWeapon.damage > equippedWeapon.damage) {
        setEquippedWeapon(monsterWeapon);
      }
    }

    if (monsterArmor) {
      setArmors([...armors, monsterArmor]);
      if (!equippedArmor || monsterArmor.defense > equippedArmor.defense) {
        setEquippedArmor(monsterArmor);
      }
    }

    if (nextHeroHp === 0) {
      setMessage('Монстр сбил героя с ног. Нажми восстановить, чтобы продолжить зачистку города.');
      return;
    }

    setMessage(
      monsterWeapon
        ? `Монстр побежден. Осталось ${nextMonsters} из ${monstersPerCity}. Выпало оружие: ${monsterWeapon.name} (${monsterWeapon.rarity}).`
        : monsterArmor
          ? `Монстр побежден. Осталось ${nextMonsters} из ${monstersPerCity}. Выпала броня: ${monsterArmor.name} (${monsterArmor.rarity}).`
        : `Монстр побежден. Осталось ${nextMonsters} из ${monstersPerCity}. Получено золото.`
    );

    if (nextMonsters === 0) {
      setEnemyHp(currentDragonHp);
      setMessage(`Все монстры побеждены. Появился дракон: ${formatPower(currentDragonHp)} HP и ${formatPower(currentDragonDamage)} урона.`);
    }
  }

  function clearCity() {
    if (!enemy) return;
    const clearedCity = `${enemy.city}, ${enemy.country}`;
    const nextSavedCities = savedCities.includes(clearedCity) ? savedCities : [...savedCities, clearedCity];
    const prize = reward;
    const dungeonOpened = maybeOpenDungeon(enemy.city, chapter + 1);
    const droppedWeapon = rollWeapon(1, chapter + 1);
    const droppedArmor = rollArmor(1, chapter + 1);

    setSavedCities(nextSavedCities);
    setGold(gold + prize);

    if (droppedWeapon) {
      setWeapons([...weapons, droppedWeapon]);
      if (!equippedWeapon || droppedWeapon.damage > equippedWeapon.damage) {
        setEquippedWeapon(droppedWeapon);
      }
    }

    if (droppedArmor) {
      setArmors([...armors, droppedArmor]);
      if (!equippedArmor || droppedArmor.defense > equippedArmor.defense) {
        setEquippedArmor(droppedArmor);
      }
    }

    if (chapter === dragonSons.length - 1) {
      setVictory(true);
      setChapter(dragonSons.length);
      setMessage(`Последний город очищен. Ты получил ${prize} золота. Мир больше не горит.`);
      return;
    }

    setChapter(chapter + 1);
    setEnemyHp(scaledDragonPower(baseDragonHp, chapter + 1));
    setHeroHp(Math.min(currentHeroMaxHp, heroHp + 28));
    setMessage(`${clearedCity} очищен от монстров. Ты получил ${prize} золота. ${dungeonOpened ? 'В городе появилось тайное подземелье.' : 'Путь идет дальше.'}`);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) pressedKeys.current.add(key);
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

    const dragonDamage = Math.max(1, currentDragonDamage - defenseBonus);
    const nextHeroHp = Math.max(0, heroHp - dragonDamage);
    setEnemyHp(nextEnemyHp);
    setHeroHp(nextHeroHp);

    if (nextHeroHp === 0) {
      setMessage(`Дракон ударил на ${formatPower(dragonDamage)} урона. Герой упал, нажми восстановить.`);
      return;
    }

    setMessage(`Удар по дракону: -${formatPower(heroDamage)} HP. У дракона осталось ${formatPower(nextEnemyHp)} HP. Он ответил на ${formatPower(dragonDamage)} урона.`);
  }

  function heal() {
    playHeroAnimation('heal', 720);
    setHeroHp(currentHeroMaxHp);
    setMessage('Герой поднялся. Меч снова светится, можно продолжать бой.');
  }

  function enterDungeon() {
    if (!dungeon || dungeon.cleared) return;

    const damage = Math.max(4, dungeon.danger - defenseBonus - items.pet * 4);
    const nextHeroHp = Math.max(0, heroHp - damage);
    const foundRare = Math.random() < 0.18;
    const dungeonWeapon = rollWeapon(10, chapter + 1);
    const dungeonArmor = rollArmor(10, chapter + 1);
    setHeroHp(nextHeroHp);

    if (nextHeroHp === 0) {
      setMessage(`Подземелье в городе ${dungeon.city} оказалось опасным. Герой выжил чудом, восстановись перед новым походом.`);
      return;
    }

    if (foundRare) {
      const loot = rareLoot[Math.floor(Math.random() * rareLoot.length)];
      setItems({
        ...items,
        sword: items.sword + ('sword' in loot ? loot.sword ?? 0 : 0),
        armor: items.armor + ('armor' in loot ? loot.armor ?? 0 : 0),
        pet: items.pet + ('pet' in loot ? loot.pet ?? 0 : 0),
        mana: items.mana + ('mana' in loot ? loot.mana ?? 0 : 0),
      });
      setGold(gold + loot.gold);
      setRelics([...relics, loot.name]);
      setDungeon({ ...dungeon, cleared: true });
      setMessage(`Редкая находка: ${loot.name}! ${loot.text}. Еще найдено ${loot.gold} золота.`);
      return;
    }

    if (dungeonWeapon) {
      setWeapons([...weapons, dungeonWeapon]);
      if (!equippedWeapon || dungeonWeapon.damage > equippedWeapon.damage) {
        setEquippedWeapon(dungeonWeapon);
      }
      setGold(gold + 35);
      setDungeon({ ...dungeon, cleared: true });
      setMessage(`В подземелье выпало оружие x10 шанс: ${dungeonWeapon.name} (${dungeonWeapon.rarity}, +${dungeonWeapon.damage} урона). Еще найдено 35 золота.`);
      return;
    }

    if (dungeonArmor) {
      setArmors([...armors, dungeonArmor]);
      if (!equippedArmor || dungeonArmor.defense > equippedArmor.defense) {
        setEquippedArmor(dungeonArmor);
      }
      setGold(gold + 35);
      setDungeon({ ...dungeon, cleared: true });
      setMessage(`В подземелье выпала броня x10 шанс: ${dungeonArmor.name} (${dungeonArmor.rarity}, +${dungeonArmor.defense} защиты). Еще найдено 35 золота.`);
      return;
    }

    setGold(gold + 35);
    setDungeon({ ...dungeon, cleared: true });
    setMessage(`Подземелье в городе ${dungeon.city} очищено. Редкая вещь не выпала, но ты нашел 35 золота.`);
  }

  function restart() {
    setChapter(0);
    setHealthLevel(0);
    setHeroHp(heroMaxHp);
    setEnemyHp(baseDragonHp);
    setMessage('Мир снова в огне. Начинается новый поход за спасение городов.');
    setSavedCities([]);
    setVictory(false);
    setGold(0);
    setDungeon(null);
    setRelics([]);
    setWeapons([]);
    setEquippedWeapon(null);
    setArmors([]);
    setEquippedArmor(null);
    setHeroAnimation('idle');
    setHeroPosition({ x: -3_100, z: 0 });
    setCityMonsters(dragonSons.map(() => monstersPerCity));
    setMonsterAttackCount(0);
    setBattlePulse(0);
    paidQuestIds.current.clear();
    setItems({ sword: 0, pet: 0, clothes: 0, helmet: 0, armor: 0, mana: 0, health: 0 });
    setShopLevels({ sword: 0, pet: 0, clothes: 0, helmet: 0, armor: 0, mana: 0, health: 0 });
  }

  return (
    <main className="game">
      <section className="stage" aria-label="Поле битвы">
        <div
          className={`sky battle-2d ${battlePulse % 2 ? 'hit' : ''}`}
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
            {Array.from({ length: Math.max(0, Math.min(24, Math.ceil(currentMonsters / 500))) }).map((_, index) => {
              const mixedMonster = monsterKinds[(chapter + index) % monsterKinds.length];
              return (
              <span
                className={`monster-token ${mixedMonster[0]}`}
                key={index}
                style={{
                  '--monster-x': `${Math.max(-90, Math.min(95, heroPosition.x / 150 + (index - 4) * 18))}px`,
                  '--monster-y': `${Math.max(-25, Math.min(45, heroPosition.z / 240 + (index % 3) * 14))}px`,
                } as CSSProperties}
              >
                <i />
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
          <div className={`hero knight ${heroAnimation}`} style={{ left: `${50 + heroPosition.x / 1000}%`, bottom: `${132 - heroPosition.z / 80}px` }}>
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
            <div className="boss" style={{ '--dragon-color': enemy.color } as CSSProperties}>
              <div className="tail-2d" />
              <div className="wing wing-left" />
              <div className="wing wing-right" />
              <div className="boss-body" />
              <div className="neck-2d" />
              <div className="boss-head" />
              <div className="horn-2d left-horn" />
              <div className="horn-2d right-horn" />
              <div className="boss-fire" />
            </div>
          )}
        </div>
      </section>

      <section className="hud" aria-label="Состояние игры">
        <div className="story">
          <p className="eyebrow">Пылающий мир</p>
          <h1>Меч против сыновей дракона</h1>
          <p>{message}</p>
        </div>

        {isFinalReveal ? (
          <div className="reveal">
            <h2>Финальное раскрытие</h2>
            <p>
              Главный дракон разрушал мир не просто из злости. Люди много лет гнали драконов,
              отнимали их земли и называли чудовищами даже детенышей. Его огонь был местью.
            </p>
            <p>
              Теперь герой должен решить: добить последнего дракона или остановить войну и
              построить мир, где люди и драконы больше не будут мучить друг друга.
            </p>
            <button onClick={restart}>Начать заново</button>
          </div>
        ) : (
          <>
            <div className="battle-panel">
              <div>
                <p className="label">Герой</p>
                <div className="bar">
                  <span style={{ width: `${(heroHp / currentHeroMaxHp) * 100}%` }} />
                </div>
                <strong>{heroHp} / {currentHeroMaxHp}</strong>
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
              <button className="secondary" onClick={heal}>Восстановить</button>
            </div>

            <div className="movement">
              <div>
                <p className="label">Движение по 2D миру</p>
                <strong>W вперед, A вправо, D влево, S назад</strong>
              </div>
              <div className="move-pad">
                <button onClick={() => moveHero(0, -450)}>Вперед</button>
                <button onClick={() => moveHero(450, 0)}>Вправо</button>
                <button onClick={() => moveHero(-450, 0)}>Влево</button>
                <button onClick={() => moveHero(0, 450)}>Назад</button>
              </div>
            </div>

            <div className="monster-panel">
              <div>
                <p className="label">Монстры города</p>
                <strong>{enemy.city}: разные монстры {currentMonsters} / {monstersPerCity}</strong>
                <p>{currentMonsters === 0 ? 'Все монстры побеждены. Теперь бей дракона.' : `Победи ${monstersPerCity} монстров, чтобы появился дракон.`}</p>
                <p>Первый город: 100 HP и 10 урона. Каждый следующий город сильнее в 100 раз.</p>
              </div>
              <button onClick={fightMonster} disabled={heroHp === 0 || currentMonsters === 0}>Бить монстра</button>
            </div>

            {dungeon && (
              <div className={`dungeon ${dungeon.cleared ? 'cleared' : ''}`}>
                <div>
                  <p className="label">Случайное подземелье</p>
                  <strong>{dungeon.city}</strong>
                  <p>Маленький шанс на редкую вещь. Опасность: {dungeon.danger}</p>
                </div>
                <button onClick={enterDungeon} disabled={dungeon.cleared || heroHp === 0}>
                  {dungeon.cleared ? 'Очищено' : 'Войти'}
                </button>
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
            <p className="label">Инвентарь оружия</p>
            <div>
              {weapons.slice(-8).map((weapon) => (
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
            <p className="label">Инвентарь брони 3375 видов</p>
            <div>
              {armors.slice(-8).map((armor) => (
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
            {worldLocations.map((location) => (
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
    </main>
  );
}
