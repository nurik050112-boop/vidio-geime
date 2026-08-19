import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, PointerEvent as ReactPointerEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import { Link, useLocation } from 'wouter';
import { BattleScene3D } from '../components/BattleScene3D';
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
  hiddenDamageText?: string;
};

type Armor = {
  id: string;
  name: string;
  rarity: Rarity;
  defense: number;
  price: number;
  displayDefense?: string;
};

type ArtifactId = 'starRing' | 'dragonPendant' | 'magicBottle' | 'goldHoop' | 'greenRelic' | 'snowGlobe' | 'moonCrystal' | 'seaPearl' | 'deathPendant' | 'sunOrb' | 'impossibleMedallion' | 'avalancheCrown' | 'godHead';

type Artifact = {
  id: ArtifactId;
  name: string;
  ending: AchievementId;
  bonusPercent: number;
  goldBonusPercent: number;
  attackSpeedPercent: number;
  healthBonusPercent?: number;
  defenseBonusPercent?: number;
  luckBonusPercent?: number;
  manaBonusPercent?: number;
  healingBonusPercent?: number;
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
  reward: string;
};

type HeroAnimation = 'idle' | 'strike' | 'step' | 'heal' | 'cast';
type EndingChoice = 'spare' | 'fight' | 'family' | null;
type SecretEnding = 'goblinKing' | 'furyKing' | 'anuarKing' | 'mansurKing' | 'arailmKing' | 'aisultanSea' | 'adminImpossible' | 'monsterAvalanche' | 'deathHell' | 'deathVictory' | null;
type AchievementId = 'dragonPeace' | 'dragonWar' | 'goblinKing' | 'furyKing' | 'anuarKing' | 'mansurKing' | 'arailmKing' | 'aisultanSea' | 'adminImpossible' | 'bbiBadEnding' | 'impossibleEnding' | 'monsterAvalanche' | 'deathHell' | 'deathVictory';
type BbiBossStage = 'manager' | 'director' | 'final' | null;
type DuelStatus = 'idle' | 'searching' | 'challenge' | 'fighting' | 'won' | 'declined';

type DuelPlayer = {
  id: string;
  name: string;
  power: number;
  title: string;
  weapon: Weapon;
  armor: Armor;
};

type OnlinePresence = {
  id: string;
  name: string;
  power: number;
  weapon: Weapon | null;
  armor: Armor | null;
  updatedAt: number;
};

type DuelChatMessage = {
  id: string;
  from: string;
  text: string;
};

type DuelRequest = {
  id: string;
  kind: 'fight' | 'trade';
  fromId: string;
  fromName: string;
  toId: string;
  createdAt: number;
};

type DuelTradeOffer =
  | { kind: 'weapon'; item: Weapon }
  | { kind: 'armor'; item: Armor }
  | null;

const arcaneSpells = [
  { name: 'Огненный вихрь', icon: 'O', power: 20, mana: 32, cooldown: 3_000, targets: 28, radius: 70, speed: 100 },
  { name: 'Рассекающий ветер', icon: 'V', power: 17, mana: 24, cooldown: 3_000, targets: 24, radius: 70, speed: 100 },
  { name: 'Ледяной дождь', icon: 'I', power: 18, mana: 28, cooldown: 3_000, targets: 26, radius: 70, speed: 100 },
  { name: 'Окаменение', icon: 'K', power: 16, mana: 26, cooldown: 3_000, targets: 22, radius: 70, speed: 100 },
  { name: 'Громовой разлом', icon: 'G', power: 22, mana: 36, cooldown: 3_000, targets: 34, radius: 70, speed: 100 },
  { name: 'Теневая коса', icon: 'Q', power: 19, mana: 30, cooldown: 3_000, targets: 30, radius: 70, speed: 100 },
  { name: 'Огонь', icon: 'F', power: 8, mana: 14, cooldown: 3_000, targets: 3 },
  { name: 'Лед', icon: 'I', power: 7, mana: 12, cooldown: 3_000, targets: 4 },
  { name: 'Молния', icon: 'L', power: 10, mana: 18, cooldown: 3_000, targets: 5 },
  { name: 'Вода', icon: 'W', power: 7, mana: 12, cooldown: 3_000, targets: 4 },
  { name: 'Свет', icon: 'S', power: 9, mana: 16, cooldown: 3_000, targets: 6 },
  { name: 'Тьма', icon: 'D', power: 11, mana: 20, cooldown: 3_000, targets: 7 },
  { name: 'Луч', icon: 'B', power: 12, mana: 22, cooldown: 3_000, targets: 8 },
  { name: 'Яд', icon: 'P', power: 8, mana: 14, cooldown: 3_000, targets: 6 },
  { name: 'Звезда', icon: '*', power: 13, mana: 24, cooldown: 3_000, targets: 10 },
  { name: 'Портал', icon: 'O', power: 9, mana: 18, cooldown: 3_000, targets: 9 },
  { name: 'Метеор', icon: 'M', power: 15, mana: 30, cooldown: 3_000, targets: 14 },
  { name: 'Кристалл', icon: 'C', power: 10, mana: 18, cooldown: 3_000, targets: 8 },
  { name: 'Ветер', icon: 'V', power: 8, mana: 13, cooldown: 3_000, targets: 7 },
  { name: 'Земля', icon: 'E', power: 11, mana: 21, cooldown: 3_000, targets: 9 },
  { name: 'Руна', icon: 'R', power: 12, mana: 22, cooldown: 3_000, targets: 11 },
  { name: 'Комета', icon: 'K', power: 18, mana: 38, cooldown: 3_000, targets: 20 },
  { name: 'Шторм', icon: 'T', power: 14, mana: 28, cooldown: 3_000, targets: 16 },
  { name: 'Солнце', icon: 'U', power: 16, mana: 34, cooldown: 3_000, targets: 18 },
] as const;

const firstDragonCities: CityStage[] = [
  { name: 'Игнис', city: 'Клинковая Нора', country: 'Подземное королевство', lair: 'Площадь ржавых ножей под первым городом', monsterKind: 'goblin', monsterName: 'ножевые гоблины', title: 'сын искры', power: 1_000, color: '#ffb703', attackSpeed: 0.85, reaction: 'бьет очень быстро' },
  { name: 'Рубор', city: 'Орочий Вал', country: 'Земли тяжелых племен', lair: 'Крепость наплечников и костяных трофеев', monsterKind: 'orc', monsterName: 'броневые орки', title: 'сын пепла', power: 1_000_000, color: '#fb5607', attackSpeed: 1.3, reaction: 'бьет тяжелее и медленнее' },
  { name: 'Каэрн', city: 'Серый Исполин', country: 'Пепельные холмы', lair: 'Арена каменных великанов с длинными руками', monsterKind: 'giant', monsterName: 'серые великаны', title: 'сын лавы', power: 1_000_000_000, color: '#d00000', attackSpeed: 0.65, reaction: 'молниеносная реакция' },
  { name: 'Сольвар', city: 'Громовая Утесина', country: 'Горные глубины', lair: 'Разлом, где ходят голые пещерные титаны', monsterKind: 'cave-titan', monsterName: 'пещерные титаны', title: 'сын дымного неба', power: 1_000_000_000_000, color: '#8ecae6', attackSpeed: 1.65, reaction: 'выжидает и бьет медленно' },
  { name: 'Мэйдзин', city: 'Камнебрюх', country: 'Серые рудники', lair: 'Шахта круглых каменных громил', monsterKind: 'stone-brute', monsterName: 'каменные громилы', title: 'сын черного огня', power: 1_000_000_000_000_000, color: '#8338ec', attackSpeed: 0.75, reaction: 'атакует рывками' },
  { name: 'Аурокс', city: 'Проволочный Разлом', country: 'Мир пустой кожи', lair: 'Темный зал прозрачных сетчатых монстров', monsterKind: 'wire', monsterName: 'сетчатые твари', title: 'сын раскаленного ветра', power: 1_000_000_000_000_000_000, color: '#3a86ff', attackSpeed: 1.1, reaction: 'держит ровный темп' },
  { name: 'Ноктар', city: 'Белый Слизень', country: 'Холодные болота', lair: 'Скользкая тропа бледных пузатых существ', monsterKind: 'pale', monsterName: 'бледные ходоки', title: 'последний сын дракона', power: 1_000_000_000_000_000_000_000, color: '#06d6a0', attackSpeed: 1.9, reaction: 'медленно готовит ледяной удар' },
];
const arcaneSpellCooldownMs = 3_000;
const arcaneSpellRadiusMeters = 70;
const arcaneSpellSpeedKmh = 100;

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
  ['goblin', 'ножевые гоблины'],
  ['orc', 'броневые орки'],
  ['giant', 'серые великаны'],
  ['cave-titan', 'пещерные титаны'],
  ['stone-brute', 'каменные громилы'],
  ['wire', 'сетчатые твари'],
  ['pale', 'бледные ходоки'],
  ['lizard-brute', 'ящеры-громилы'],
  ['saw-warrior', 'воины с пилой'],
  ['spider', 'пещерные пауки'],
] as const;

const extraCityStages = [
  { city: 'Зеленая Чешуя', country: 'Болотная империя', lair: 'Лагерь ящеров-громил с железными наплечниками', monsterKind: 'lizard-brute', monsterName: 'ящеры-громилы' },
  { city: 'Пила Черепа', country: 'Черный арсенал', lair: 'Кузница воинов с зубчатыми клинками', monsterKind: 'saw-warrior', monsterName: 'воины с пилой' },
  { city: 'Паучий Фонарь', country: 'Светящаяся паутина', lair: 'Гнездо огромных пещерных пауков', monsterKind: 'spider', monsterName: 'пещерные пауки' },
] as const;

const dragonColors = ['#ffb703', '#fb5607', '#d00000', '#8ecae6', '#8338ec', '#3a86ff', '#06d6a0'];

const dragonSons: CityStage[] = [
  ...firstDragonCities,
  ...extraDragonCities.slice(0, 3).map((_, index) => {
    const number = index + 8;
    const stage = extraCityStages[index];
    return {
      name: `Дракон ${number}`,
      city: stage.city,
      country: stage.country,
      lair: stage.lair,
      monsterKind: stage.monsterKind,
      monsterName: stage.monsterName,
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

const finalDragonSpirit: CityStage = {
  name: 'Дух Великого дракона',
  city: 'Подземный мир',
  country: 'Тень финального босса',
  lair: 'Подземный трон, где душа короля драконов не дает уйти дальше',
  monsterKind: 'shadow',
  monsterName: 'духи огня',
  title: 'дух короля драконов',
  power: 2_000_000_000,
  color: '#2b2434',
  attackSpeed: 0.38,
  reaction: 'дух летает и бьет тяжелой тенью',
};

const deathGod: CityStage = {
  name: 'Король ада',
  city: 'Адский трон',
  country: 'После подземного мира',
  lair: 'Черный зал ада, где король ада ждет героя после смерти душ финального босса',
  monsterKind: 'death-god',
  monsterName: 'души ада',
  title: 'король ада',
  power: 999_999_999_999,
  color: '#8b0000',
  attackSpeed: 0.3,
  reaction: 'ударяет адским огнем и давит душу',
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

const seaShark: CityStage = {
  name: 'Промежуточный босс Акула',
  city: 'Водный мир',
  country: '10 мир',
  lair: 'Глубина под холодной волной',
  monsterKind: 'shark',
  monsterName: 'рыбы',
  title: 'страж бога моря',
  power: 100_000_000_000,
  color: '#75c7e8',
  attackSpeed: 0.5,
  reaction: 'акула режет воду быстрым рывком',
};

const aisultanSeaGod: CityStage = {
  name: 'Бог моря Айсултан',
  city: 'Трон водного мира',
  country: '10 мир',
  lair: 'Дворец из волн на дне океана',
  monsterKind: 'sea-god',
  monsterName: 'морские стражи',
  title: 'бог моря',
  power: 1_000_000_000_000,
  color: '#2f80ed',
  attackSpeed: 0.36,
  reaction: 'поднимает волну сильнее меча',
};

const adminBoss: CityStage = {
  name: 'Админ',
  city: '11 мир',
  country: 'Админская сложность',
  lair: 'Последний экран, где игра почти ломается',
  monsterKind: 'admin',
  monsterName: 'админские монстры',
  title: 'создатель невозможного режима',
  power: 500_000_000_000,
  color: '#ff2a1f',
  attackSpeed: 0.22,
  reaction: 'админ бьет так, будто нажал все кнопки сразу',
};

const heroMaxHp = 200;
const monstersPerCity = 1_000;
const dungeonEnemiesTotal = 500;
const furyDungeonEnemiesTotal = 700;
const anuarBombEnemiesTotal = 700;
const mansurDungeonEnemiesTotal = 700;
const arailmEnemiesTotal = 700;
const aisultanMonsterTotal = 1_000;
const aisultanMonsterHp = 1_000;
const aisultanSharkHp = aisultanMonsterHp * 10;
const aisultanSeaGodHp = aisultanSharkHp * 10;
const adminWorldMonsterTotal = 1_000;
const adminWorldMonsterHp = 1_000;
const adminWorldBossesHp = 250_000_000_000;
const adminFinalBossHp = 500_000_000_000;
const baseMonsterHp = 1_000;
const baseDragonHp = 100_000_000;
const adminNukeHiddenDamageText = '9'.repeat(999);
const adminNukeDamageText = '∞';
const adminHelmetHealthText = '∞';
const furySwordDamageText = '1' + '0'.repeat(116);
const mansurBladeDamageText = '99999999999999999999999999999999999999999999999999999999';
const programSwordDamageText = '1000000000000000000000000';
const bbiMonsterTotal = 100;
const bbiMonsterHp = 1_000;
const bbiManagerHp = 5_000_000;
const bbiDirectorHp = bbiManagerHp * 3;
const bbiFinalBossHp = bbiDirectorHp * 3;
const nuraliMonsterTotal = 100;
const nuraliMonsterHp = 1_000;
const nuraliBossHp = 25_000_000;
const monsterAvalancheTotal = 1_000;
const monsterAvalancheHp = 1_000;
const monsterAvalancheDamage = 100_000;
const monsterAvalancheStartChapter = 7;
const finalSpiritMonsterTotal = 1_000;
const finalSpiritMonsterHp = 1_000;
const deathSwordDamageText = '999999999999999999999999999999999999999999999';
const citySizeMeters = 5_000;
const cityHalfSize = (citySizeMeters / 2) * 1_000;
const heroMoveSpeedPerSecond = (22 / 3.6) * 1_000;
const heroRunSpeedPerSecond = (34 / 3.6) * 1_000;
const meleeRangeMeters = 5;
const meleeRangeUnits = meleeRangeMeters * 1_000;
const monsterPressureRangeUnits = 12_000;
const monsterRunSpeedPerSecond = (18 / 3.6) * 1_000;
const monsterSpawnDistanceUnits = 11_000;
const monsterAggroDistanceUnits = 100_000;
const monsterBotAttackDamage = 10;
const monsterBotAttackCooldownMs = 1_100;
const monsterChaseCatchTimeMs = 2_500;

type NearestMonsterState = {
  x: number;
  z: number;
  hp: number;
  alive: boolean;
};

type CollisionBox = {
  x: number;
  z: number;
  halfX: number;
  halfZ: number;
};

type GameSaveState = {
  version: 1;
  savedAt: number;
  chapter: number;
  healthLevel: number;
  heroHp: number;
  enemyHp: number;
  message: string;
  savedCities: string[];
  victory: boolean;
  endingChoice: EndingChoice;
  secretEnding: SecretEnding;
  goblinKingReady: boolean;
  goblinKingFightStarted: boolean;
  furyGateOpen: boolean;
  furyDungeonEntered: boolean;
  furyMonstersLeft: number;
  furyChoiceOpen: boolean;
  furyKingFightStarted: boolean;
  anuarGateOpen: boolean;
  anuarWorldEntered: boolean;
  anuarBombsLeft: number;
  anuarKingFightStarted: boolean;
  mansurGateOpen: boolean;
  mansurDungeonEntered: boolean;
  mansurMonstersLeft: number;
  mansurKingFightStarted: boolean;
  arailmGateOpen: boolean;
  arailmWorldEntered: boolean;
  arailmMonstersLeft: number;
  arailmChoiceOpen: boolean;
  arailmKingFightStarted: boolean;
  aisGateOpen: boolean;
  aisWorldEntered: boolean;
  aisMonstersLeft: number;
  aisSharkFightStarted: boolean;
  aisFinalChoiceOpen: boolean;
  aisGodFightStarted: boolean;
  adminWorldGateOpen: boolean;
  adminWorldEntered: boolean;
  adminWorldMonstersLeft: number;
  adminWorldBossesStarted: boolean;
  adminFinalChoiceOpen: boolean;
  adminBossFightStarted: boolean;
  bbiGateOpen: boolean;
  bbiWorldEntered: boolean;
  bbiMonstersLeft: number;
  bbiBossStage: BbiBossStage;
  bbiFinalChoiceOpen: boolean;
  bbiCityReward: boolean;
  bbiBadEnding: boolean;
  impossibleEnding: boolean;
  nuraliGateOpen: boolean;
  nuraliWorldEntered: boolean;
  nuraliMonstersLeft: number;
  nuraliChoiceOpen: boolean;
  nuraliBossFightStarted: boolean;
  monsterAvalancheEntered: boolean;
  monsterAvalancheLeft: number;
  monsterAvalancheEnding: boolean;
  finalSpiritWorldOpen: boolean;
  finalSpiritMonstersLeft: number;
  finalSpiritFightStarted: boolean;
  deathGodFightStarted: boolean;
  gold: number;
  goldMultiplier: number;
  infiniteGold: boolean;
  dungeon: Dungeon | null;
  relics: string[];
  weapons: Weapon[];
  equippedWeapon: Weapon | null;
  armors: Armor[];
  equippedArmor: Armor | null;
  equippedArtifactId: ArtifactId | null;
  heroMana: number;
  heroPosition: { x: number; z: number };
  heroDirection: { x: number; z: number };
  mapLocationIndex: number;
  cityMonsters: number[];
  duelWins: number;
  items: Record<ShopItem['id'], number>;
  shopLevels: Record<ShopItem['id'], number>;
  introSkipped: boolean;
  paidQuestIds: number[];
};

const gameSaveStorageKey = 'dragon-game-save-v1';
const heroMaxMana = 100;

function readGameSave() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = JSON.parse(window.localStorage.getItem(gameSaveStorageKey) ?? 'null') as Partial<GameSaveState> | null;
    return saved?.version === 1 ? saved : null;
  } catch {
    return null;
  }
}

function collidesWithBox(x: number, z: number, box: CollisionBox, radius = 0.72) {
  return Math.abs(x - box.x) < box.halfX + radius && Math.abs(z - box.z) < box.halfZ + radius;
}

function hashSceneKey(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 997;
  }
  return hash;
}

function getLocationStyle(chapter: number, locationIndex: number, sceneKey: string) {
  return Math.abs(chapter * 3 + locationIndex * 5 + hashSceneKey(sceneKey)) % 14;
}

function getWorldCollisionBoxes(chapter: number, locationIndex: number, sceneKey: string) {
  const boxes: CollisionBox[] = [];

  const isEnding = sceneKey.startsWith('ending') || sceneKey.includes('final') || sceneKey.includes('death') || sceneKey.includes('admin');
  const captured = sceneKey.startsWith('captured');
  const locationStyle = getLocationStyle(chapter, locationIndex, sceneKey);

  if (captured) {
    for (let i = 0; i < 46; i += 1) {
      const lane = i % 4;
      const row = Math.floor(i / 4);
      const x = lane < 2 ? -28 - lane * 16 + Math.sin(i) * 1.2 : 28 + (lane - 2) * 16 + Math.sin(i) * 1.2;
      const z = -58 + row * 10.4 + Math.cos(i * 0.7) * 1.6;
      boxes.push({ x, z, halfX: 3.2, halfZ: 2.8 });
    }
  }

  if (locationStyle === 0) {
    for (let i = 0; i < 28; i += 1) {
      boxes.push({
        x: -42 + (i % 7) * 13.4,
        z: -27 + Math.floor(i / 7) * 15.5,
        halfX: 1.7 + (i % 3) * 0.5,
        halfZ: 1.35,
      });
    }
  } else if (locationStyle === 1) {
    for (let i = 0; i < 18; i += 1) {
      boxes.push({
        x: -38 + (i % 6) * 15,
        z: -24 + Math.floor(i / 6) * 20,
        halfX: 1.05,
        halfZ: 1.05,
      });
    }
    boxes.push({ x: 0, z: -18, halfX: 6.8, halfZ: 6.8 });
  } else if (locationStyle === 2) {
    for (let i = 0; i < 46; i += 1) {
      boxes.push({
        x: -50 + (i % 12) * 9.2 + Math.sin(i) * 1.4,
        z: -34 + Math.floor(i / 12) * 18 + Math.cos(i) * 1.8,
        halfX: 0.7,
        halfZ: 0.7,
      });
    }
  } else if (locationStyle === 3) {
    for (let i = 0; i < 24; i += 1) {
      const x = -42 + (i % 8) * 12;
      const z = -30 + Math.floor(i / 8) * 24;
      boxes.push({ x, z, halfX: 1.55, halfZ: 1.45 });
      boxes.push({ x: x + 3.4, z: z + 1.8, halfX: 0.5, halfZ: 0.5 });
    }
  } else if (locationStyle === 4) {
    for (let i = 0; i < 18; i += 1) {
      const x = -44 + (i % 6) * 17;
      const z = -30 + Math.floor(i / 6) * 24;
      boxes.push({ x, z, halfX: 4.25, halfZ: 0.85 });
      boxes.push({ x: x + 3.9, z, halfX: 1.35, halfZ: 1.35 });
    }
  } else if (locationStyle === 5) {
    for (let i = 0; i < 30; i += 1) {
      const x = -48 + (i % 10) * 10.5;
      const z = -33 + Math.floor(i / 10) * 27;
      boxes.push({ x, z, halfX: 1.15 + (i % 3) * 0.45, halfZ: 0.75 });
      boxes.push({ x: x + 2.2, z: z + 1.4, halfX: 0.7, halfZ: 0.7 });
    }
  } else if (locationStyle === 7) {
    for (let i = 0; i < 34; i += 1) {
      boxes.push({
        x: -46 + (i % 9) * 11.5,
        z: -34 + Math.floor(i / 9) * 22,
        halfX: 1.35,
        halfZ: 1.35,
      });
    }
  } else if (locationStyle === 8) {
    for (let i = 0; i < 20; i += 1) {
      boxes.push({
        x: -44 + (i % 5) * 21,
        z: -31 + Math.floor(i / 5) * 19,
        halfX: 1.05,
        halfZ: 1.05,
      });
    }
  } else if (locationStyle === 10) {
    for (let i = 0; i < 32; i += 1) {
      boxes.push({
        x: -48 + (i % 8) * 13.6,
        z: -34 + Math.floor(i / 8) * 22,
        halfX: 0.8,
        halfZ: 0.8,
      });
    }
  } else if (locationStyle === 11) {
    for (let i = 0; i < 22; i += 1) {
      boxes.push({
        x: -42 + (i % 7) * 14,
        z: -30 + Math.floor(i / 7) * 22,
        halfX: 2.2,
        halfZ: 2.2,
      });
    }
  } else if (locationStyle === 12) {
    for (let i = 0; i < 30; i += 1) {
      boxes.push({
        x: -48 + (i % 10) * 10.5,
        z: -34 + Math.floor(i / 10) * 26,
        halfX: 1.1,
        halfZ: 1.1,
      });
    }
  } else if (locationStyle === 13) {
    for (let i = 0; i < 34; i += 1) {
      boxes.push({
        x: -50 + (i % 9) * 12.3,
        z: -34 + Math.floor(i / 9) * 23,
        halfX: 1.15,
        halfZ: 1.15,
      });
    }
  } else {
    for (let i = 0; i < 24; i += 1) {
      boxes.push({
        x: -46 + (i % 8) * 12.8,
        z: -32 + Math.floor(i / 8) * 25,
        halfX: 1.45,
        halfZ: 1.45,
      });
    }
  }

  if (isEnding) {
    for (let i = 0; i < 7; i += 1) {
      boxes.push({ x: -30 + i * 10, z: -34 + Math.sin(i) * 7, halfX: 1.05, halfZ: 1.05 });
    }
  }

  return boxes.map((box) => ({
    ...box,
    x: box.x + Math.sin(locationIndex + box.z) * 0,
  }));
}

function isWorldBlockedAt(position: { x: number; z: number }, chapter: number, locationIndex: number, sceneKey: string, radius = 0.72) {
  const worldX = -3.4 + position.x / 1000;
  const worldZ = 1.2 + position.z / 1000;
  return getWorldCollisionBoxes(chapter, locationIndex, sceneKey).some((box) => collidesWithBox(worldX, worldZ, box, radius));
}

const monsterAvalancheWorld: CityStage = {
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

const nuraliBoss: CityStage = {
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
const presenceStorageKey = 'dragon-game-online-players';
const leaderboardStorageKey = 'dragon-game-leaderboard-players';
const dailyRewardStorageKey = 'dragon-game-daily-rewards';
const winStreakStorageKey = 'dragon-game-win-streak';
const duelRequestsStorageKey = 'dragon-game-duel-requests';
const presenceTtlMs = 20_000;

type DailyRewardState = {
  lastVisitDate: string;
  lastRewardDate: string;
  streak: number;
  bestStreak: number;
};

type WinStreakState = {
  current: number;
  best: number;
  totalWins: number;
};

function makePlayerId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '0');
}

function normalizePlayerId(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

function makePresenceFallbackWeapon(power: number): Weapon {
  return {
    id: `online-sword-${power}`,
    name: 'Меч игрока',
    rarity: 'Редкий',
    damage: Math.max(100, Math.floor(power / 2)),
    price: 0,
  };
}

function makePresenceFallbackArmor(power: number): Armor {
  return {
    id: `online-armor-${power}`,
    name: 'Броня игрока',
    rarity: 'Редкий',
    defense: Math.max(25, Math.floor(power / 4)),
    price: 0,
  };
}

function readOnlinePresences() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(presenceStorageKey) ?? '[]') as OnlinePresence[];
    const now = Date.now();
    return parsed
      .map((player) => ({ ...player, id: normalizePlayerId(player.id) }))
      .filter((player) => player.id.length === 6 && now - player.updatedAt < presenceTtlMs);
  } catch {
    return [];
  }
}

function readLeaderboardPresences() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(leaderboardStorageKey) ?? '[]') as OnlinePresence[];
    return parsed
      .map((player) => ({ ...player, id: normalizePlayerId(player.id) }))
      .filter((player) => player.id.length === 6)
      .sort((a, b) => b.power - a.power || b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

function saveLeaderboardPresences(players: OnlinePresence[]) {
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
  window.localStorage.setItem(leaderboardStorageKey, JSON.stringify(leaderboard));
  return leaderboard;
}

function readDuelRequests() {
  try {
    const now = Date.now();
    return (JSON.parse(window.localStorage.getItem(duelRequestsStorageKey) ?? '[]') as DuelRequest[])
      .filter((request) => now - request.createdAt < 60_000);
  } catch {
    return [];
  }
}

function saveDuelRequests(requests: DuelRequest[]) {
  window.localStorage.setItem(duelRequestsStorageKey, JSON.stringify(requests.slice(-20)));
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayDateKey() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateKey(yesterday);
}

function readDailyRewardState(): DailyRewardState {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(dailyRewardStorageKey) ?? 'null') as Partial<DailyRewardState> | null;
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

function saveDailyRewardState(state: DailyRewardState) {
  window.localStorage.setItem(dailyRewardStorageKey, JSON.stringify(state));
}

function readWinStreakState(): WinStreakState {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(winStreakStorageKey) ?? 'null') as Partial<WinStreakState> | null;
    return {
      current: parsed?.current ?? 0,
      best: parsed?.best ?? 0,
      totalWins: parsed?.totalWins ?? 0,
    };
  } catch {
    return { current: 0, best: 0, totalWins: 0 };
  }
}

function saveWinStreakState(state: WinStreakState) {
  window.localStorage.setItem(winStreakStorageKey, JSON.stringify(state));
}

function readRealtimePresenceEntries(state: Record<string, unknown[]>) {
  return Object.values(state)
    .flatMap((players) => players as unknown as OnlinePresence[])
    .map((player) => ({ ...player, id: normalizePlayerId(player.id) }))
    .filter((player) => player.id.length === 6);
}

function toDuelPlayer(player: OnlinePresence): DuelPlayer {
  return {
    id: player.id,
    name: player.name,
    power: player.power,
    title: 'реальный игрок в сети',
    weapon: player.weapon ?? makePresenceFallbackWeapon(player.power),
    armor: player.armor ?? makePresenceFallbackArmor(player.power),
  };
}

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
  { id: 'aisultanSea', name: 'Воденой мир' },
  { id: 'adminImpossible', name: 'Это невозможно пройти' },
  { id: 'bbiBadEnding', name: 'Они лишь дети' },
  { id: 'impossibleEnding', name: 'Невозможная концовка' },
  { id: 'monsterAvalanche', name: 'Лавина 10 миллиардов' },
  { id: 'deathHell', name: 'Душа попала в ад' },
  { id: 'deathVictory', name: 'Победивший смерть' },
];

const endingArtifacts: Artifact[] = [
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

const shopItems: ShopItem[] = [
  { id: 'sword', name: 'Меч рассвета', price: 120, bonus: '+20 урона' },
  { id: 'pet', name: 'Огненный питомец', price: 180, bonus: '+20 урона максимум' },
  { id: 'clothes', name: 'Одежда странника', price: 90, bonus: '-3 урона от огня' },
  { id: 'helmet', name: 'Шлем героя', price: 140, bonus: '-5 урона от огня' },
  { id: 'armor', name: 'Драконья броня', price: 240, bonus: '-9 урона от огня' },
  { id: 'mana', name: 'Кристалл маны', price: 120, bonus: '+25 максимум маны' },
  { id: 'health', name: 'Сердце рыцаря', price: 160, bonus: '+35 максимум здоровья' },
  { id: 'doubleStrike', name: 'Совместная смерть', price: 500, bonus: 'бьет 2 противников за раз' },
];

const shopBasePower: Record<ShopItem['id'], number> = {
  sword: 20,
  pet: 10,
  clothes: 3,
  helmet: 5,
  armor: 9,
  mana: 25,
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
  if (item.id === 'pet') return `+${Math.min(20, bonus)} к урону, максимум 20`;
  if (item.id === 'mana') return `+${bonus} максимум маны`;
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
  if (isArcaneWeapon(weapon)) return 4;
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

function getWeaponModelName(weapon: Weapon) {
  const styleIndex = getWeaponStyleIndex(weapon);
  if (styleIndex === 6 || styleIndex === 13) return 'KayKit staff.gltf';
  if (styleIndex === 10) return 'KayKit crossbow_2handed.gltf';
  if (styleIndex === 11 || styleIndex === 16) return 'KayKit axe_2handed.gltf';
  if (styleIndex === 17) return 'KayKit dagger.gltf';
  if (styleIndex === 3 || styleIndex === 19) return 'KayKit sword_2handed.gltf';
  return 'KayKit sword_1handed.gltf';
}

function isBbiLegendaryWeapon(weapon: Weapon | null) {
  return weapon?.id.startsWith('bbi-legendary-sword-') ?? false;
}

function isAdminNuke(weapon: Weapon | null) {
  return weapon?.id.startsWith('admin-nuke-') ?? false;
}

function isAisultanSword(weapon: Weapon | null) {
  return weapon?.id.startsWith('aisultan-sea-sword-') ?? false;
}

function isDeathSword(weapon: Weapon | null) {
  return weapon?.id.startsWith('death-sword-') ?? false;
}

function isArcaneWeapon(weapon: Weapon | null) {
  return weapon?.id.startsWith('arcane-scepter-') ?? false;
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

function scaledDragonPower(base: number, chapter: number) {
  const value = base * 10 ** chapter;
  return Number.isFinite(value) ? Math.min(value, Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
}

function worldWeaponMultiplier(level: number) {
  const exponent = Math.max(0, Math.floor(level) - 1);
  const value = 100 ** exponent;
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
  const cityMultiplier = worldWeaponMultiplier(level);
  const baseDamage = rarityDamage[rarity] + level * 6 + Math.floor(Math.random() * 12);
  const damage = Math.min(Number.MAX_SAFE_INTEGER, baseDamage * cityMultiplier);

  return {
    id: `${Date.now()}-${Math.random()}`,
    name: `${base} ${material} ${enchant} ${rune}`,
    rarity,
    damage,
    price: Math.min(Number.MAX_SAFE_INTEGER, rarityPrice[rarity] + damage * 10 + level * 35),
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
  const damage = Math.min(Number.MAX_SAFE_INTEGER, (rarityDamage['Секретное'] + level * 100_000) * worldWeaponMultiplier(level));
  return {
    id: `secret-${Date.now()}-${Math.random()}`,
    name: 'иди нах',
    rarity: 'Секретное',
    damage,
    price: rarityPrice['Секретное'],
  };
}

function createAdminNuke(): Weapon {
  return {
    id: `admin-nuke-${Date.now()}-${Math.random()}`,
    name: 'Админская ядерка',
    rarity: 'Секретное',
    damage: 1_000_000,
    displayDamage: adminNukeDamageText,
    hiddenDamageText: adminNukeHiddenDamageText,
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

function createDeathSword(): Weapon {
  return {
    id: `death-sword-${Date.now()}-${Math.random()}`,
    name: 'Смертельный секретный меч',
    rarity: 'Секретное',
    damage: Number.MAX_SAFE_INTEGER,
    displayDamage: deathSwordDamageText,
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

function createAisultanSword(bestDamage: number): Weapon {
  const boostedDamage = Math.min(Number.MAX_SAFE_INTEGER, bestDamage * 1001);
  return {
    id: `aisultan-sea-sword-${Date.now()}-${Math.random()}`,
    name: 'Воденой меч Айсултана',
    rarity: 'Секретное',
    damage: boostedDamage,
    displayDamage: `${formatPower(bestDamage)} +100000%`,
    price: 0,
  };
}

function createArcaneScepter(level = 1): Weapon {
  const damage = Math.min(Number.MAX_SAFE_INTEGER, (250_000 + level * 150_000) * worldWeaponMultiplier(Math.max(1, level)));
  return {
    id: `arcane-scepter-${Date.now()}-${Math.random()}`,
    name: 'Сасопковый посох магии',
    rarity: 'Секретное',
    damage,
    displayDamage: `${formatPower(damage)} + магия`,
    price: 0,
  };
}

function createMagicStaff(name: string, level = 1, bonus = 1): Weapon {
  const damage = Math.min(Number.MAX_SAFE_INTEGER, (180_000 + level * 120_000) * worldWeaponMultiplier(Math.max(1, level)) * bonus);
  return {
    id: `arcane-scepter-${name}-${Date.now()}-${Math.random()}`,
    name,
    rarity: 'Секретное',
    damage,
    displayDamage: `${formatPower(damage)} + радиус 70м`,
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
  const savedGameRef = useRef(readGameSave());
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [chapter, setChapter] = useState(savedGameRef.current?.chapter ?? 0);
  const [healthLevel, setHealthLevel] = useState(savedGameRef.current?.healthLevel ?? 0);
  const [heroHp, setHeroHp] = useState(savedGameRef.current?.heroHp ?? heroMaxHp);
  const [enemyHp, setEnemyHp] = useState(savedGameRef.current?.enemyHp ?? baseDragonHp);
  const [message, setMessage] = useState(savedGameRef.current?.message ?? 'Мир горит. Нажимай удар мечом, чтобы очистить первый город.');
  const [savedCities, setSavedCities] = useState<string[]>(savedGameRef.current?.savedCities ?? []);
  const [victory, setVictory] = useState(savedGameRef.current?.victory ?? false);
  const [endingChoice, setEndingChoice] = useState<EndingChoice>(savedGameRef.current?.endingChoice ?? null);
  const [secretEnding, setSecretEnding] = useState<SecretEnding>(savedGameRef.current?.secretEnding ?? null);
  const [goblinKingReady, setGoblinKingReady] = useState(savedGameRef.current?.goblinKingReady ?? false);
  const [goblinKingFightStarted, setGoblinKingFightStarted] = useState(savedGameRef.current?.goblinKingFightStarted ?? false);
  const [furyGateOpen, setFuryGateOpen] = useState(savedGameRef.current?.furyGateOpen ?? false);
  const [furyDungeonEntered, setFuryDungeonEntered] = useState(savedGameRef.current?.furyDungeonEntered ?? false);
  const [furyMonstersLeft, setFuryMonstersLeft] = useState(savedGameRef.current?.furyMonstersLeft ?? furyDungeonEnemiesTotal);
  const [furyChoiceOpen, setFuryChoiceOpen] = useState(savedGameRef.current?.furyChoiceOpen ?? false);
  const [furyKingFightStarted, setFuryKingFightStarted] = useState(savedGameRef.current?.furyKingFightStarted ?? false);
  const [anuarGateOpen, setAnuarGateOpen] = useState(savedGameRef.current?.anuarGateOpen ?? false);
  const [anuarWorldEntered, setAnuarWorldEntered] = useState(savedGameRef.current?.anuarWorldEntered ?? false);
  const [anuarBombsLeft, setAnuarBombsLeft] = useState(savedGameRef.current?.anuarBombsLeft ?? anuarBombEnemiesTotal);
  const [anuarKingFightStarted, setAnuarKingFightStarted] = useState(savedGameRef.current?.anuarKingFightStarted ?? false);
  const [mansurGateOpen, setMansurGateOpen] = useState(savedGameRef.current?.mansurGateOpen ?? false);
  const [mansurDungeonEntered, setMansurDungeonEntered] = useState(savedGameRef.current?.mansurDungeonEntered ?? false);
  const [mansurMonstersLeft, setMansurMonstersLeft] = useState(savedGameRef.current?.mansurMonstersLeft ?? mansurDungeonEnemiesTotal);
  const [mansurKingFightStarted, setMansurKingFightStarted] = useState(savedGameRef.current?.mansurKingFightStarted ?? false);
  const [arailmGateOpen, setArailmGateOpen] = useState(savedGameRef.current?.arailmGateOpen ?? false);
  const [arailmWorldEntered, setArailmWorldEntered] = useState(savedGameRef.current?.arailmWorldEntered ?? false);
  const [arailmMonstersLeft, setArailmMonstersLeft] = useState(savedGameRef.current?.arailmMonstersLeft ?? arailmEnemiesTotal);
  const [arailmChoiceOpen, setArailmChoiceOpen] = useState(savedGameRef.current?.arailmChoiceOpen ?? false);
  const [arailmKingFightStarted, setArailmKingFightStarted] = useState(savedGameRef.current?.arailmKingFightStarted ?? false);
  const [aisGateOpen, setAisGateOpen] = useState(savedGameRef.current?.aisGateOpen ?? false);
  const [aisWorldEntered, setAisWorldEntered] = useState(savedGameRef.current?.aisWorldEntered ?? false);
  const [aisMonstersLeft, setAisMonstersLeft] = useState(savedGameRef.current?.aisMonstersLeft ?? aisultanMonsterTotal);
  const [aisSharkFightStarted, setAisSharkFightStarted] = useState(savedGameRef.current?.aisSharkFightStarted ?? false);
  const [aisFinalChoiceOpen, setAisFinalChoiceOpen] = useState(savedGameRef.current?.aisFinalChoiceOpen ?? false);
  const [aisGodFightStarted, setAisGodFightStarted] = useState(savedGameRef.current?.aisGodFightStarted ?? false);
  const [adminWorldGateOpen, setAdminWorldGateOpen] = useState(savedGameRef.current?.adminWorldGateOpen ?? false);
  const [adminWorldEntered, setAdminWorldEntered] = useState(savedGameRef.current?.adminWorldEntered ?? false);
  const [adminWorldMonstersLeft, setAdminWorldMonstersLeft] = useState(savedGameRef.current?.adminWorldMonstersLeft ?? adminWorldMonsterTotal);
  const [adminWorldBossesStarted, setAdminWorldBossesStarted] = useState(savedGameRef.current?.adminWorldBossesStarted ?? false);
  const [adminFinalChoiceOpen, setAdminFinalChoiceOpen] = useState(savedGameRef.current?.adminFinalChoiceOpen ?? false);
  const [adminBossFightStarted, setAdminBossFightStarted] = useState(savedGameRef.current?.adminBossFightStarted ?? false);
  const [bbiGateOpen, setBbiGateOpen] = useState(savedGameRef.current?.bbiGateOpen ?? false);
  const [bbiWorldEntered, setBbiWorldEntered] = useState(savedGameRef.current?.bbiWorldEntered ?? false);
  const [bbiMonstersLeft, setBbiMonstersLeft] = useState(savedGameRef.current?.bbiMonstersLeft ?? bbiMonsterTotal);
  const [bbiBossStage, setBbiBossStage] = useState<BbiBossStage>(savedGameRef.current?.bbiBossStage ?? null);
  const [bbiFinalChoiceOpen, setBbiFinalChoiceOpen] = useState(savedGameRef.current?.bbiFinalChoiceOpen ?? false);
  const [bbiCityReward, setBbiCityReward] = useState(savedGameRef.current?.bbiCityReward ?? false);
  const [bbiBadEnding, setBbiBadEnding] = useState(savedGameRef.current?.bbiBadEnding ?? false);
  const [impossibleEnding, setImpossibleEnding] = useState(savedGameRef.current?.impossibleEnding ?? false);
  const [nuraliGateOpen, setNuraliGateOpen] = useState(savedGameRef.current?.nuraliGateOpen ?? false);
  const [nuraliWorldEntered, setNuraliWorldEntered] = useState(savedGameRef.current?.nuraliWorldEntered ?? false);
  const [nuraliMonstersLeft, setNuraliMonstersLeft] = useState(savedGameRef.current?.nuraliMonstersLeft ?? nuraliMonsterTotal);
  const [nuraliChoiceOpen, setNuraliChoiceOpen] = useState(savedGameRef.current?.nuraliChoiceOpen ?? false);
  const [nuraliBossFightStarted, setNuraliBossFightStarted] = useState(savedGameRef.current?.nuraliBossFightStarted ?? false);
  const [monsterAvalancheEntered, setMonsterAvalancheEntered] = useState(savedGameRef.current?.monsterAvalancheEntered ?? false);
  const [monsterAvalancheLeft, setMonsterAvalancheLeft] = useState(savedGameRef.current?.monsterAvalancheLeft ?? monsterAvalancheTotal);
  const [monsterAvalancheEnding, setMonsterAvalancheEnding] = useState(savedGameRef.current?.monsterAvalancheEnding ?? false);
  const [finalSpiritWorldOpen, setFinalSpiritWorldOpen] = useState(savedGameRef.current?.finalSpiritWorldOpen ?? false);
  const [finalSpiritMonstersLeft, setFinalSpiritMonstersLeft] = useState(savedGameRef.current?.finalSpiritMonstersLeft ?? finalSpiritMonsterTotal);
  const [finalSpiritFightStarted, setFinalSpiritFightStarted] = useState(savedGameRef.current?.finalSpiritFightStarted ?? false);
  const [deathGodFightStarted, setDeathGodFightStarted] = useState(savedGameRef.current?.deathGodFightStarted ?? false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<AchievementId[]>([]);
  const [gold, setGold] = useState(savedGameRef.current?.gold ?? 0);
  const [goldMultiplier, setGoldMultiplier] = useState(savedGameRef.current?.goldMultiplier ?? 1);
  const [infiniteGold, setInfiniteGold] = useState(savedGameRef.current?.infiniteGold ?? false);
  const [dungeon, setDungeon] = useState<Dungeon | null>(savedGameRef.current?.dungeon ?? null);
  const [relics, setRelics] = useState<string[]>(savedGameRef.current?.relics ?? []);
  const [weapons, setWeapons] = useState<Weapon[]>(savedGameRef.current?.weapons ?? []);
  const [equippedWeapon, setEquippedWeapon] = useState<Weapon | null>(savedGameRef.current?.equippedWeapon ?? null);
  const [armors, setArmors] = useState<Armor[]>(savedGameRef.current?.armors ?? []);
  const [equippedArmor, setEquippedArmor] = useState<Armor | null>(savedGameRef.current?.equippedArmor ?? null);
  const [shopTab, setShopTab] = useState<'upgrades' | 'artifacts' | 'code' | 'duel' | 'players' | 'id'>('upgrades');
  const [equippedArtifactId, setEquippedArtifactId] = useState<ArtifactId | null>(savedGameRef.current?.equippedArtifactId ?? null);
  const [heroMana, setHeroMana] = useState(savedGameRef.current?.heroMana ?? heroMaxMana);
  const [showFullInventory, setShowFullInventory] = useState(false);
  const [heroAnimation, setHeroAnimation] = useState<HeroAnimation>('idle');
  const [heroPosition, setHeroPosition] = useState(savedGameRef.current?.heroPosition ?? { x: -18_000, z: 0 });
  const [heroHeight, setHeroHeight] = useState(0);
  const [heroMoving, setHeroMoving] = useState(false);
  const [heroDirection, setHeroDirection] = useState(savedGameRef.current?.heroDirection ?? { x: 0, z: -1 });
  const [cameraYaw, setCameraYaw] = useState(Math.atan2(savedGameRef.current?.heroDirection?.x ?? 0, savedGameRef.current?.heroDirection?.z ?? -1));
  const [nearestMonster, setNearestMonster] = useState<NearestMonsterState>({
    x: -18_000,
    z: -monsterSpawnDistanceUnits,
    hp: baseMonsterHp,
    alive: true,
  });
  const [mapLocationIndex, setMapLocationIndex] = useState(savedGameRef.current?.mapLocationIndex ?? 0);
  const [joystickThumb, setJoystickThumb] = useState({ x: 0, y: 0 });
  const verticalVelocity = useRef(0);
  const heroAnimationTimer = useRef<number | null>(null);
  const pressedKeys = useRef<Set<string>>(new Set());
  const joystickVector = useRef({ x: 0, z: 0 });
  const movementVelocity = useRef({ x: 0, z: 0 });
  const joystickPointerId = useRef<number | null>(null);
  const cameraYawRef = useRef(cameraYaw);
  const cameraPointer = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const blockNextStageClick = useRef(false);
  const lastMoveAt = useRef<number | null>(null);
  const clickTimesRef = useRef<number[]>([]);
  const monsterChaseStartedAt = useRef(Date.now());
  const nearestMonsterRef = useRef<NearestMonsterState>({
    x: -18_000,
    z: -monsterSpawnDistanceUnits,
    hp: baseMonsterHp,
    alive: true,
  });
  const monsterBotRef = useRef({
    chapter: 0,
    currentMonsters: 0,
    currentMonsterTotal: monstersPerCity,
    defenseBonus: 0,
    hasAdminHelmet: false,
    heroHp: heroMaxHp,
    heroPosition: { x: -18_000, z: 0 },
    isFinalReveal: false,
    nearestMonsterInAggro: false,
    nearestMonsterInPressure: false,
    nearestMonsterInRange: false,
  });
  const [cityMonsters, setCityMonsters] = useState(() => savedGameRef.current?.cityMonsters ?? dragonSons.map(() => monstersPerCity));
  const [, setMonsterAttackCount] = useState(0);
  const [battlePulse, setBattlePulse] = useState(0);
  const [nukePulse, setNukePulse] = useState(0);
  const [fireWavePulse, setFireWavePulse] = useState(0);
  const [waterWavePulse, setWaterWavePulse] = useState(0);
  const [soulFirePulse, setSoulFirePulse] = useState(0);
  const [arcanePulse, setArcanePulse] = useState(0);
  const [arcaneBurstPulse, setArcaneBurstPulse] = useState(0);
  const [selectedArcaneSpell, setSelectedArcaneSpell] = useState(0);
  const [arcaneSkillReadyAt, setArcaneSkillReadyAt] = useState(0);
  const [arcaneCooldownNow, setArcaneCooldownNow] = useState(Date.now());
  const [clickDuelPower, setClickDuelPower] = useState(50);
  const [clicksPerSecond, setClicksPerSecond] = useState(0);
  const [enemyBurning, setEnemyBurning] = useState(false);
  const [duelStatus, setDuelStatus] = useState<DuelStatus>('idle');
  const [duelOpponent, setDuelOpponent] = useState<DuelPlayer | null>(null);
  const [duelWins, setDuelWins] = useState(savedGameRef.current?.duelWins ?? 0);
  const [duelHeroHp, setDuelHeroHp] = useState(0);
  const [duelOpponentHp, setDuelOpponentHp] = useState(0);
  const [duelTradeOpen, setDuelTradeOpen] = useState(false);
  const [duelTradeOffer, setDuelTradeOffer] = useState<DuelTradeOffer>(null);
  const [incomingDuelRequest, setIncomingDuelRequest] = useState<DuelRequest | null>(null);
  const [duelChatMessages, setDuelChatMessages] = useState<DuelChatMessage[]>([]);
  const [duelChatText, setDuelChatText] = useState('');
  const [onlinePlayers, setOnlinePlayers] = useState<DuelPlayer[]>([]);
  const [leaderboardPlayers, setLeaderboardPlayers] = useState<OnlinePresence[]>(() => readLeaderboardPresences());
  const [dailyRewardState, setDailyRewardState] = useState<DailyRewardState>(() => readDailyRewardState());
  const [dailyRewardText, setDailyRewardText] = useState('');
  const [winStreakState, setWinStreakState] = useState<WinStreakState>(() => readWinStreakState());
  const [winStreakText, setWinStreakText] = useState('');
  const [nickname, setNickname] = useState(() => window.localStorage.getItem('hero-nickname') ?? 'BBI герой');
  const [playerId] = useState(() => {
    const savedId = window.localStorage.getItem('hero-player-id');
    if (savedId) {
      const normalizedId = normalizePlayerId(savedId);
      if (normalizedId.length === 6) {
        window.localStorage.setItem('hero-player-id', normalizedId);
        return normalizedId;
      }
    }
    const nextId = makePlayerId();
    window.localStorage.setItem('hero-player-id', nextId);
    return nextId;
  });
  const [duelTargetId, setDuelTargetId] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [guestMode, setGuestMode] = useState(() => window.localStorage.getItem('dragon-game-guest-mode') === 'yes');
  const [adminCode, setAdminCode] = useState('');
  const [achievementCode, setAchievementCode] = useState('');
  const [achievementCheatActive, setAchievementCheatActive] = useState(false);
  const [achievementMessage, setAchievementMessage] = useState('');
  const [introSkipped, setIntroSkipped] = useState(savedGameRef.current?.introSkipped ?? false);
  const [creatorCreditsOpen, setCreatorCreditsOpen] = useState(false);
  const paidQuestIds = useRef<Set<number>>(new Set(savedGameRef.current?.paidQuestIds ?? []));
  const audioContextRef = useRef<AudioContext | null>(null);
  const bossMusicStopRef = useRef<(() => void) | null>(null);
  const lastSpokenSceneRef = useRef('');
  const lastMessageVoiceAtRef = useRef(0);
  const onlinePlayerListRef = useRef<HTMLDivElement | null>(null);
  const onlinePlayerScrollTimer = useRef<number | null>(null);
  const supabaseSaveTimer = useRef<number | null>(null);
  const supabaseSaveLoadedRef = useRef(false);
  const dailyRewardCheckedRef = useRef(false);
  const [items, setItems] = useState<Record<ShopItem['id'], number>>(savedGameRef.current?.items ?? {
    sword: 0,
    pet: 0,
    clothes: 0,
    helmet: 0,
    armor: 0,
    mana: 0,
    health: 0,
    doubleStrike: 0,
  });
  const [shopLevels, setShopLevels] = useState<Record<ShopItem['id'], number>>(savedGameRef.current?.shopLevels ?? {
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
  const isFinalSpiritBoss = finalSpiritFightStarted;
  const isFinalSpiritWorld = finalSpiritWorldOpen && !finalSpiritFightStarted;
  const isFamilyBoss = endingChoice === 'family';
  const isGoblinKingBoss = goblinKingReady && goblinKingFightStarted;
  const isFuryKingBoss = furyKingFightStarted;
  const isAnuarKingBoss = anuarKingFightStarted;
  const isMansurKingBoss = mansurKingFightStarted;
  const isArailmKingBoss = arailmKingFightStarted;
  const isAisSharkBoss = aisSharkFightStarted;
  const isAisGodBoss = aisGodFightStarted;
  const isAdminWorldBosses = adminWorldBossesStarted;
  const isAdminBoss = adminBossFightStarted;
  const isNuraliKingBoss = nuraliBossFightStarted;
  const isFuryDungeon = furyDungeonEntered && !furyChoiceOpen && !furyKingFightStarted;
  const isAnuarWorld = anuarWorldEntered && !anuarKingFightStarted;
  const isMansurDungeon = mansurDungeonEntered && !mansurKingFightStarted;
  const isArailmWorld = arailmWorldEntered && !arailmChoiceOpen && !arailmKingFightStarted;
  const isAisWorld = aisWorldEntered && !aisSharkFightStarted && !aisFinalChoiceOpen && !aisGodFightStarted;
  const isAdminWorld = adminWorldEntered && !adminWorldBossesStarted && !adminFinalChoiceOpen && !adminBossFightStarted;
  const isNuraliWorld = nuraliWorldEntered && !nuraliChoiceOpen && !nuraliBossFightStarted;
  const isBbiBoss = bbiBossStage !== null;
  const isBbiWorld = bbiWorldEntered && !isBbiBoss && !bbiFinalChoiceOpen;
  const isMonsterAvalancheWorld = monsterAvalancheEntered && !monsterAvalancheEnding;
  const isDeathGodBoss = deathGodFightStarted;
  const enemy = isDeathGodBoss ? deathGod : isFinalSpiritBoss || isFinalSpiritWorld ? finalDragonSpirit : isMonsterAvalancheWorld ? monsterAvalancheWorld : isAdminBoss ? adminBoss : isAdminWorldBosses ? adminBoss : isAisGodBoss ? aisultanSeaGod : isAisSharkBoss ? seaShark : isNuraliKingBoss ? nuraliBoss : isBbiBoss ? bbiBosses[bbiBossStage] : isArailmKingBoss ? arailmKing : isMansurKingBoss ? mansurKing : isAnuarKingBoss ? anuarKing : isFuryKingBoss ? furyKing : isGoblinKingBoss ? goblinKing : isFamilyBoss ? dragonFamily : isFinalBoss ? finalDragon : dragonSons[chapter];
  const isFinalReveal = victory && chapter > dragonSons.length && !isFamilyBoss;
  const isEndingChoice = isFinalReveal && endingChoice === null;
  const isDungeon = dungeon?.entered && !dungeon.cleared;
  const hasAdminHelmet = equippedArmor?.id.startsWith('admin-helmet-') ?? false;
  const unlockedArtifacts = endingArtifacts.filter((artifact) => unlockedAchievements.includes(artifact.ending));
  const equippedArtifact = unlockedArtifacts.find((artifact) => artifact.id === equippedArtifactId) ?? null;
  const artifactHealthMultiplier = equippedArtifact?.healthBonusPercent ? 1 + equippedArtifact.healthBonusPercent / 100 : 1;
  const currentHeroMaxHp = hasAdminHelmet ? Number.MAX_SAFE_INTEGER : Math.floor((heroMaxHp + upgradePower(healthLevel, shopBasePower.health)) * artifactHealthMultiplier);
  const artifactManaMultiplier = equippedArtifact?.manaBonusPercent ? 1 + equippedArtifact.manaBonusPercent / 100 : 1;
  const currentHeroMaxMana = Math.floor((heroMaxMana + upgradePower(shopLevels.mana, shopBasePower.mana)) * artifactManaMultiplier);
  const heroHealthText = hasAdminHelmet ? `${adminHelmetHealthText} / ${adminHelmetHealthText}` : `${heroHp} / ${currentHeroMaxHp}`;
  const heroHealthPercent = Math.max(0, Math.min(100, (heroHp / currentHeroMaxHp) * 100));

  const worldBurn = useMemo(() => Math.max(0, 100 - savedCities.length * 13), [savedCities.length]);
  const equippedWeaponStyle = getWeaponStyleIndex(equippedWeapon);
  const strongestNonBbiWeaponDamage = Math.max(1, ...weapons.filter((weapon) => !isBbiLegendaryWeapon(weapon)).map((weapon) => weapon.damage));
  const armorBonus = equippedArmor?.defense ?? 0;
  const equippedArmorStyle = getArmorStyleIndex(equippedArmor);
  const equippedIsHelmet = isHelmetArmor(equippedArmor);
  const artifactDefenseMultiplier = equippedArtifact?.defenseBonusPercent ? 1 + equippedArtifact.defenseBonusPercent / 100 : 1;
  const artifactLuckMultiplier = equippedArtifact?.luckBonusPercent ? 1 + equippedArtifact.luckBonusPercent / 100 : 1;
  const defenseBonus = Math.floor((upgradePower(items.clothes, shopBasePower.clothes) + upgradePower(items.helmet, shopBasePower.helmet) + upgradePower(items.armor, shopBasePower.armor) + armorBonus) * artifactDefenseMultiplier);
  const artifactDamageMultiplier = equippedArtifact ? 1 + equippedArtifact.bonusPercent / 100 : 1;
  const artifactGoldMultiplier = equippedArtifact ? 1 + equippedArtifact.goldBonusPercent / 100 : 1;
  const artifactAttackSpeedMultiplier = equippedArtifact ? 1 + equippedArtifact.attackSpeedPercent / 100 : 1;
  const waterSwordArtifactMultiplier = equippedArtifactId === 'seaPearl' && isAisultanSword(equippedWeapon) ? 11 : 1;
  const equippedWeaponDamage = isAdminNuke(equippedWeapon) ? 1_000_000 : equippedWeapon?.damage ?? 0;
  const reward = enemy ? 120 + chapter * 110 : 0;
  const currentMonsters = isDeathGodBoss || isFinalSpiritBoss || isAdminBoss || isAdminWorldBosses || isAisSharkBoss || isAisGodBoss || isNuraliKingBoss || isBbiBoss || isFinalBoss || isFamilyBoss || isGoblinKingBoss || isFuryKingBoss || isAnuarKingBoss || isMansurKingBoss || isArailmKingBoss ? 0 : isFinalSpiritWorld ? finalSpiritMonstersLeft : isMonsterAvalancheWorld ? monsterAvalancheLeft : isAdminWorld ? adminWorldMonstersLeft : isAisWorld ? aisMonstersLeft : isNuraliWorld ? nuraliMonstersLeft : isBbiWorld ? bbiMonstersLeft : isArailmWorld ? arailmMonstersLeft : isMansurDungeon ? mansurMonstersLeft : isAnuarWorld ? anuarBombsLeft : isFuryDungeon ? furyMonstersLeft : isDungeon ? dungeon.enemiesLeft : cityMonsters[chapter] ?? 0;
  const musicKey = isFinalReveal
    ? 'ending'
    : isAdminBoss || isAdminWorldBosses
      ? 'admin'
    : isAisGodBoss || isAisSharkBoss
      ? 'ais'
    : isNuraliKingBoss
      ? 'nurali'
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
    : isDeathGodBoss
      ? 'death'
    : isFinalBoss || isFinalSpiritBoss || isFinalSpiritWorld
      ? 'final'
    : isAdminWorld
      ? 'admin-world'
    : isAisWorld
      ? 'ais-world'
    : isNuraliWorld
      ? 'nurali-world'
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
  const currentMonsterHp = isFinalSpiritWorld ? finalSpiritMonsterHp : isMonsterAvalancheWorld ? monsterAvalancheHp : isAdminWorld ? adminWorldMonsterHp : isAisWorld ? aisultanMonsterHp : isNuraliWorld ? nuraliMonsterHp : isBbiWorld ? bbiMonsterHp : baseMonsterHp;
  const nearestMonsterDistanceUnits = nearestMonster.alive ? Math.hypot(heroPosition.x - nearestMonster.x, heroPosition.z - nearestMonster.z) : Number.POSITIVE_INFINITY;
  const nearestMonsterDistanceMeters = nearestMonsterDistanceUnits / 1_000;
  const nearestMonsterInAggro = currentMonsters > 0 && nearestMonster.alive && nearestMonsterDistanceUnits <= monsterAggroDistanceUnits;
  const nearestMonsterInPressure = currentMonsters > 0 && nearestMonster.alive && nearestMonsterDistanceUnits <= monsterPressureRangeUnits;
  const nearestMonsterInRange = currentMonsters > 0 && nearestMonster.alive && nearestMonsterDistanceUnits <= meleeRangeUnits;
  const kingDragonHp = scaledDragonPower(baseDragonHp, dragonSons.length + 2);
  const finalSpiritDragonHp = Math.max(1, Math.floor((kingDragonHp * 2) / 100));
  const deathGodHp = kingDragonHp * 2;
  const currentDragonHp = isDeathGodBoss ? deathGodHp : isFinalSpiritBoss ? finalSpiritDragonHp : isAdminBoss ? adminFinalBossHp : isAdminWorldBosses ? adminWorldBossesHp : isAisGodBoss ? aisultanSeaGodHp : isAisSharkBoss ? aisultanSharkHp : isNuraliKingBoss ? nuraliBossHp : isBbiBoss ? bbiBosses[bbiBossStage].power : isArailmKingBoss ? scaledDragonPower(baseDragonHp, 15) : isMansurKingBoss ? scaledDragonPower(baseDragonHp, chapter + 7) : isAnuarKingBoss ? scaledDragonPower(baseDragonHp, chapter + 6) : isFuryKingBoss ? scaledDragonPower(baseDragonHp, 10) : isGoblinKingBoss ? scaledDragonPower(baseDragonHp, chapter + 4) : isFamilyBoss ? kingDragonHp * 2 : isFinalBoss ? kingDragonHp : scaledDragonPower(baseDragonHp, chapter);
  const bbiLegendaryDamage = Math.min(Number.MAX_SAFE_INTEGER, strongestNonBbiWeaponDamage * 100);
  const deathSwordMultiplier = equippedArtifactId === 'godHead' && equippedWeapon?.id.startsWith('death-sword-') ? 7.66 : 1;
  const weaponBonus = Math.floor((isBbiLegendaryWeapon(equippedWeapon) ? bbiLegendaryDamage : equippedWeaponDamage) * deathSwordMultiplier);
  const petBonus = Math.min(20, upgradePower(items.pet, shopBasePower.pet));
  const attackBonus = upgradePower(items.sword, shopBasePower.sword) + petBonus + Math.floor(weaponBonus * waterSwordArtifactMultiplier);
  const isClickDuelActive = !isFinalReveal && currentMonsters === 0 && enemyHp > 0 && heroHp > 0;
  const clickDuelHeroPower = Math.max(1, Math.floor((18 + chapter * 5 + attackBonus) * artifactDamageMultiplier * artifactAttackSpeedMultiplier));
  const clickDuelDragonPower = Math.max(1, Math.floor(currentDragonHp * (enemy?.attackSpeed ?? 1)));
  const playerName = nickname.trim() || 'BBI герой';
  const dragonReaction = enemy?.reaction ?? 'обычная реакция';
  const currentMonsterTotal = isFinalSpiritWorld ? finalSpiritMonsterTotal : isMonsterAvalancheWorld ? monsterAvalancheTotal : isAdminWorld ? adminWorldMonsterTotal : isAisWorld ? aisultanMonsterTotal : isNuraliWorld ? nuraliMonsterTotal : isBbiWorld ? bbiMonsterTotal : isArailmWorld ? arailmEnemiesTotal : isMansurDungeon ? mansurDungeonEnemiesTotal : isAnuarWorld ? anuarBombEnemiesTotal : isFuryDungeon ? furyDungeonEnemiesTotal : isDungeon ? dungeonEnemiesTotal : monstersPerCity;
  const currentEnemyHealthText = currentMonsters > 0
    ? `Враг HP ${formatPower(currentMonsterHp)}`
    : isArailmKingBoss
      ? `Босс HP ${formatPower(currentDragonHp)}`
    : `Дракон HP ${formatPower(enemyHp)}/${formatPower(currentDragonHp)}`;
  const introVoiceText = 'Драконы стали злыми. Они начали уничтожать города. Герой берет меч и идет спасать мир.';
  const endingVoiceText = impossibleEnding
    ? 'Невозможная концовка. Админская ядерка стала бесконечной. Получен медальон невозможности.'
    : bbiBadEnding
    ? 'Би Би Ай концовка. Они лишь дети, ты монстр. Ты мог отказаться, но выбрал сражаться.'
    : secretEnding === 'deathHell'
      ? 'Плохая концовка. Ваша душа попала в ад.'
    : secretEnding === 'deathVictory'
      ? 'Секретная концовка. Победивший смерть. Герой получил голову бога и смертельный меч.'
    : secretEnding === 'adminImpossible'
      ? 'Секретная концовка. Это невозможно пройти. Герой убил админа и стал уж слишком сильным.'
    : secretEnding === 'monsterAvalanche'
      ? 'Секретная концовка. Лавина монстров побеждена. Все бафы стали сильнее на сто процентов.'
    : secretEnding === 'aisultanSea'
      ? 'Секретная концовка. Воденой мир. Бог моря Айсултан побежден, океан стал свободным.'
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
  const cityScene = `scene-city-${chapter % 20}`;
  const forcedCenterLocation = isFinalReveal || secretEnding || impossibleEnding || bbiBadEnding || isDeathGodBoss || isFinalSpiritBoss || isFinalBoss || isFamilyBoss;
  const mapSceneKey = isFinalReveal
    ? `ending-${endingChoice ?? 'choice'}`
    : secretEnding
      ? `ending-${secretEnding}`
      : impossibleEnding
        ? 'ending-impossible'
        : bbiBadEnding
          ? 'ending-bbi'
          : isDeathGodBoss
            ? 'death-god'
            : isFinalSpiritBoss || finalSpiritWorldOpen
              ? 'final-spirit'
              : isAdminWorld || isAdminWorldBosses || isAdminBoss || adminFinalChoiceOpen
                ? 'admin-city'
                : isAisWorld || isAisSharkBoss || isAisGodBoss || aisFinalChoiceOpen
                  ? 'sea-city'
                : isDungeon
                    ? `dungeon-${chapter}`
                    : `city-${chapter}`;
  const useCityGoblinModel = mapSceneKey.startsWith('city-') && !isDungeon;
  const collisionContextRef = useRef({ chapter, mapLocationIndex, mapSceneKey });

  useEffect(() => {
    collisionContextRef.current = { chapter, mapLocationIndex, mapSceneKey };
  }, [chapter, mapLocationIndex, mapSceneKey]);

  useEffect(() => {
    if (forcedCenterLocation) setMapLocationIndex(1);
  }, [forcedCenterLocation]);
  const battleScene = isDeathGodBoss
    ? 'scene-death-god'
    : isFinalSpiritBoss || finalSpiritWorldOpen
    ? 'scene-underground-spirit'
    : isAdminWorld || isAdminWorldBosses || isAdminBoss || adminFinalChoiceOpen
    ? 'scene-admin'
    : isAisWorld || isAisSharkBoss || isAisGodBoss || aisFinalChoiceOpen
    ? 'scene-ais'
    : isDungeon
    ? 'scene-dungeon'
    : isNuraliWorld || isNuraliKingBoss
      ? 'scene-nurali'
    : isNuraliWorld || isNuraliKingBoss || nuraliChoiceOpen
      ? 'scene-nurali'
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
  const dragonClass = isDeathGodBoss
    ? 'dragon-death-god'
    : isFinalSpiritBoss
    ? 'dragon-spirit'
    : isAdminBoss || isAdminWorldBosses
    ? 'dragon-admin'
    : isAisGodBoss
    ? 'dragon-ais-god'
    : isAisSharkBoss
      ? 'dragon-ais-shark'
    : isBbiBoss
    ? 'dragon-bbi'
    : isNuraliKingBoss
      ? 'dragon-nurali'
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
    'защити ворота', 'найди тайный сундук', 'почини мост', 'спаси караван', 'победи ночной отряд',
    'собери кристаллы', 'проверь катакомбы', 'сними проклятие', 'открой древний алтарь', 'найди карту босса',
    'победи элитного монстра', 'усиль меч', 'усиль броню', 'зачисти рынок', 'верни свет маяку',
    'найди руну', 'разбей цепи ада', 'победи огненную стражу', 'закрой портал', 'собери души врагов',
    'найди след дракона', 'переживи засаду', 'выбей редкий предмет', 'помоги кузнецу', 'победи капитана',
    'очисти храм', 'найди древний ключ', 'сними печать', 'победи теней', 'зажги башню',
    'пройди испытание силы', 'пройди испытание скорости', 'пройди испытание удачи', 'забери трофей', 'укрепи город',
  ];
  const generatedQuests: Quest[] = Array.from({ length: 497 }, (_, index) => {
    const questNumber = index + 1;
    const cityIndex = index % dragonSons.length;
    const stepIndex = index % cityQuestNames.length;
    const loop = Math.floor(index / cityQuestNames.length);
    const son = dragonSons[cityIndex];
    const difficulty = cityIndex + 1 + loop * 0.7 + stepIndex / 8;
    const reward =
      questNumber % 25 === 0 ? 'деньги + секретное оружие'
      : questNumber % 15 === 0 ? 'деньги + броня'
      : questNumber % 10 === 0 ? 'деньги + 3D меч'
      : 'деньги';
    return {
      id: questNumber,
      title: `Квест ${questNumber}: ${son.city}`,
      text: `${cityQuestNames[stepIndex]} в городе ${son.city}. Серия ${loop + 1} ведет героя ближе к логову: ${son.lair}.`,
      done: storyProgress >= questNumber || savedCities.length > cityIndex + loop,
      progress: `${Math.min(Math.max(storyProgress - loop * 50, 0), 50)} / 50 шагов серии`,
      money: Math.round(35 * difficulty * difficulty + questNumber * 9),
      reward,
    };
  });
  const quests: Quest[] = [
    ...generatedQuests,
    {
      id: 498,
      title: 'Квест 498: Семь сыновей',
      text: 'Победи всех сыновей дракона. Каждый следующий сильнее прошлого в 1000 раз.',
      done: savedCities.length >= dragonSons.length,
      progress: `${savedCities.length} / ${dragonSons.length} сыновей`,
      money: 12_000,
      reward: 'деньги + легендарный меч',
    },
    {
      id: 499,
      title: 'Квест 499: Правда главного дракона',
      text: 'Дойди до финала и узнай, почему дракон сжег мир.',
      done: isFinalReveal && endingChoice !== null,
      progress: isEndingChoice ? 'сделай последний выбор' : isFinalReveal ? 'правда раскрыта' : 'финал еще впереди',
      money: 50_000,
      reward: 'деньги + секретное оружие',
    },
    {
      id: 500,
      title: 'Квест 500: Король гоблинов',
      text: 'Очисти пещеру на 10000 врагов и узнай тайну короля гоблинов.',
      done: secretEnding === 'goblinKing',
      progress: secretEnding === 'goblinKing' ? 'секрет раскрыт' : goblinKingReady ? 'король гоблинов ждет' : 'найди пещеру',
      money: 77_777,
      reward: 'деньги + секретная концовка',
    },
  ];
  const activeQuest = quests.find((quest) => !quest.done) ?? quests[quests.length - 1];
  const visibleQuests = quests.filter((quest) => quest.done).slice(-3).concat(activeQuest).filter((quest, index, list) => list.findIndex((item) => item.title === quest.title) === index);
  const inventoryPreviewLimit = 80;
  const visibleWeapons = showFullInventory ? weapons : weapons.slice(-inventoryPreviewLimit);
  const magicWeapons = weapons.filter(isArcaneWeapon);
  const visibleMagicWeapons = showFullInventory ? magicWeapons : magicWeapons.slice(-inventoryPreviewLimit);
  const visibleArmors = showFullInventory ? armors : armors.slice(-inventoryPreviewLimit);
  const currentPlayerPower = Math.max(1_000, attackBonus + defenseBonus + currentHeroMaxHp);
  const hasArcaneWeapon = isArcaneWeapon(equippedWeapon);
  const selectedSpell = arcaneSpells[selectedArcaneSpell % arcaneSpells.length];
  const selectedSpellRadiusMeters = arcaneSpellRadiusMeters;
  const selectedSpellSpeedKmh = arcaneSpellSpeedKmh;
  const arcaneSkillCooldownMs = arcaneSpellCooldownMs;
  const arcaneSkillManaCost = selectedSpell.mana;
  const arcaneSkillRemainingMs = Math.max(0, arcaneSkillReadyAt - arcaneCooldownNow);
  const arcaneSkillReady = hasArcaneWeapon && arcaneSkillRemainingMs === 0 && heroMana >= arcaneSkillManaCost;
  const arcaneSkillDamage = Math.max(1, Math.floor((attackBonus + equippedWeaponDamage + 2_500) * artifactDamageMultiplier * selectedSpell.power));
  const allAchievementsUnlocked = achievements.every((achievement) => unlockedAchievements.includes(achievement.id));

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
      'nurali-world': { notes: [196, 247, 330, 247], beat: 0.4, wave: 'triangle', gain: 0.024 },
      'fury-world': { notes: [146, 196, 233, 196], beat: 0.34, wave: 'triangle', gain: 0.026 },
      'anuar-world': { notes: [123, 165, 247, 165], beat: 0.36, wave: 'square', gain: 0.024 },
      'mansur-world': { notes: [147, 196, 247, 196], beat: 0.46, wave: 'triangle', gain: 0.024 },
      'arailm-world': { notes: [98, 131, 175, 131], beat: 0.28, wave: 'sawtooth', gain: 0.022 },
      'ais-world': { notes: [110, 147, 196, 247], beat: 0.42, wave: 'sine', gain: 0.025 },
      'admin-world': { notes: [41, 55, 82, 110], beat: 0.24, wave: 'square', gain: 0.03 },
      goblin: { notes: [98, 196, 233, 196, 87], beat: 0.13, wave: 'square', gain: 0.07 },
      fury: { notes: [55, 110, 146, 196, 220], beat: 0.11, wave: 'sawtooth', gain: 0.065 },
      anuar: { notes: [41, 82, 123, 165, 247], beat: 0.14, wave: 'square', gain: 0.075 },
      mansur: { notes: [73, 147, 196, 247, 294], beat: 0.16, wave: 'sawtooth', gain: 0.068 },
      arailm: { notes: [49, 98, 131, 98, 175, 208], beat: 0.1, wave: 'sawtooth', gain: 0.06 },
      ais: { notes: [55, 110, 165, 220, 330], beat: 0.18, wave: 'triangle', gain: 0.065 },
      admin: { notes: [33, 66, 99, 132, 198], beat: 0.08, wave: 'sawtooth', gain: 0.08 },
      bbi: { notes: [131, 262, 330, 392, 523], beat: 0.1, wave: 'square', gain: 0.07 },
      nurali: { notes: [55, 110, 165, 220, 330], beat: 0.12, wave: 'sawtooth', gain: 0.072 },
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
    setGold((currentGold) => Math.min(Number.MAX_SAFE_INTEGER, currentGold + amount * goldMultiplier * artifactGoldMultiplier));
  }

  function addWinStreak(reason: string) {
    const nextCurrent = winStreakState.current + 1;
    const nextState = {
      current: nextCurrent,
      best: Math.max(winStreakState.best, nextCurrent),
      totalWins: winStreakState.totalWins + 1,
    };
    const bonusGold = Math.min(Number.MAX_SAFE_INTEGER, Math.max(100, nextCurrent * nextCurrent * (chapter + 1) * 150));
    addGold(bonusGold);

    let rewardText = `Винстрик x${nextCurrent}: ${reason}. Бонус ${formatPower(bonusGold)} золота.`;
    if (nextCurrent % 10 === 0) {
      const weapon = createWeapon('Легендарка', Math.max(chapter + 2, Math.floor(nextCurrent / 2)));
      setWeapons((currentWeapons) => [...currentWeapons, weapon]);
      setEquippedWeapon(weapon);
      rewardText += ` За серию ${nextCurrent} получено оружие ${getWeaponDisplayName(weapon)}.`;
    } else if (nextCurrent % 5 === 0) {
      setShopLevels((levels) => ({ ...levels, sword: levels.sword + 1, health: levels.health + 1 }));
      setItems((items) => ({ ...items, sword: items.sword + 1, health: items.health + 1 }));
      setHealthLevel((level) => level + 1);
      setHeroHp((hp) => Math.min(currentHeroMaxHp, hp + 250));
      rewardText += ` За серию ${nextCurrent}: +1 урон и +1 здоровье.`;
    }

    setWinStreakState(nextState);
    saveWinStreakState(nextState);
    setWinStreakText(rewardText);
    return rewardText;
  }

  function resetWinStreak(reason: string) {
    if (winStreakState.current === 0) return;
    const nextState = { ...winStreakState, current: 0 };
    setWinStreakState(nextState);
    saveWinStreakState(nextState);
    setWinStreakText(`Винстрик сброшен: ${reason}. Лучший рекорд ${nextState.best}.`);
  }

  function grantDailyReward(day: number) {
    // Замечание: здесь лежат награды за рекорд дней захода, меняй этот список если нужны новые подарки.
    if (day === 1) {
      addGold(25_000);
      setShopLevels((levels) => ({ ...levels, sword: levels.sword + 3, health: levels.health + 2 }));
      setItems((items) => ({ ...items, sword: items.sword + 3, health: items.health + 2 }));
      setHealthLevel((level) => level + 2);
      setHeroHp((hp) => Math.min(currentHeroMaxHp, hp + 500));
      return 'День 1: получено 25к монет, +3 урона меча и +2 здоровья.';
    }

    if (day === 2) {
      const weapon = createWeapon('Эпик', Math.max(2, chapter + 2));
      setWeapons((currentWeapons) => [...currentWeapons, weapon]);
      setEquippedWeapon(weapon);
      addGold(75_000);
      return `День 2: 75к монет и эпический меч ${getWeaponDisplayName(weapon)}.`;
    }

    if (day === 3) {
      const armor = rollArmor(100, Math.max(4, chapter + 4));
      if (armor) {
        setArmors((currentArmors) => [...currentArmors, armor]);
        setEquippedArmor(armor);
      }
      setShopLevels((levels) => ({ ...levels, doubleStrike: levels.doubleStrike + 2 }));
      setItems((items) => ({ ...items, doubleStrike: items.doubleStrike + 2 }));
      return `День 3: +2 мультиудара${armor ? ` и броня ${armor.name}` : ''}. Код BBI: bbi.`;
    }

    if (day === 4) {
      const weapon = createWeapon('Легендарка', Math.max(4, chapter + 4));
      setWeapons((currentWeapons) => [...currentWeapons, weapon]);
      setEquippedWeapon(weapon);
      addGold(250_000);
      return `День 4: 250к монет и легендарный меч ${getWeaponDisplayName(weapon)}.`;
    }

    if (day === 5) {
      const weapon = createSecretWeapon(Math.max(5, chapter + 5));
      setWeapons((currentWeapons) => [...currentWeapons, weapon]);
      setEquippedWeapon(weapon);
      addGold(1_000_000);
      return `День 5: 1 миллион монет и секретный меч ${getWeaponDisplayName(weapon)}.`;
    }

    const bonusGold = Math.min(Number.MAX_SAFE_INTEGER, day * day * 100_000);
    const weapon = day % 3 === 0 ? createSecretWeapon(Math.max(day, chapter + day)) : createWeapon(day % 2 === 0 ? 'Легендарка' : 'Эпик', Math.max(day, chapter + day));
    addGold(bonusGold);
    setWeapons((currentWeapons) => [...currentWeapons, weapon]);
    setEquippedWeapon(weapon);
    return `День ${day}: ${formatPower(bonusGold)} монет и оружие серии ${getWeaponDisplayName(weapon)}.`;
  }

  function sellWeapon(weapon: Weapon) {
    const sellPrice = weaponSellPrice[weapon.rarity];
    setWeapons((currentWeapons) => currentWeapons.filter((item) => item.id !== weapon.id));
    if (equippedWeapon?.id === weapon.id) setEquippedWeapon(null);
    addGold(sellPrice);
    setMessage(`Продано оружие: ${getWeaponDisplayName(weapon)}. Получено ${formatPower(sellPrice * goldMultiplier)} золота.`);
  }

  function claimMagicStaffs() {
    const staffNames = ['Посох огненного вихря', 'Посох ветра', 'Посох ледяного дождя', 'Посох окаменения', 'Посох громового разлома'];
    const ownedNames = new Set(weapons.filter(isArcaneWeapon).map((weapon) => weapon.name));
    const newStaffs = staffNames
      .filter((name) => !ownedNames.has(name))
      .map((name, index) => createMagicStaff(name, Math.max(3, chapter + 3 + index), 1 + index * 0.18));
    if (newStaffs.length === 0) {
      setMessage('Все магические посохи уже есть в инвентаре.');
      return;
    }
    setWeapons((currentWeapons) => [...currentWeapons, ...newStaffs]);
    setEquippedWeapon(newStaffs[0]);
    setMessage(`Получено магическое оружие: ${newStaffs.map((staff) => staff.name).join(', ')}.`);
  }

  function sellArmor(armor: Armor) {
    setArmors((currentArmors) => currentArmors.filter((item) => item.id !== armor.id));
    if (equippedArmor?.id === armor.id) setEquippedArmor(null);
    addGold(armor.price);
    setMessage(`Продана броня: ${armor.name}. Получено ${formatPower(armor.price * goldMultiplier)} золота.`);
  }

  function teleportToAchievement(id: AchievementId) {
    if (!achievementCheatActive) return;

    const markSavedThrough = (lastIndex: number) => {
      setSavedCities(dragonSons.slice(0, Math.max(0, lastIndex + 1)).map((city) => `${city.city}, ${city.country}`));
      setCityMonsters(dragonSons.map((_, index) => (index <= lastIndex ? 0 : monstersPerCity)));
    };

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
    setAisGateOpen(false);
    setAisWorldEntered(false);
    setAisMonstersLeft(aisultanMonsterTotal);
    setAisSharkFightStarted(false);
    setAisFinalChoiceOpen(false);
    setAisGodFightStarted(false);
    setAdminWorldGateOpen(false);
    setAdminWorldEntered(false);
    setAdminWorldMonstersLeft(adminWorldMonsterTotal);
    setAdminWorldBossesStarted(false);
    setAdminFinalChoiceOpen(false);
    setAdminBossFightStarted(false);
    setBbiGateOpen(false);
    setBbiWorldEntered(false);
    setBbiMonstersLeft(bbiMonsterTotal);
    setBbiBossStage(null);
    setBbiFinalChoiceOpen(false);
    setBbiCityReward(false);
    setBbiBadEnding(false);
    setNuraliGateOpen(false);
    setNuraliWorldEntered(false);
    setNuraliMonstersLeft(nuraliMonsterTotal);
    setNuraliChoiceOpen(false);
    setNuraliBossFightStarted(false);
    setMonsterAvalancheEntered(false);
    setMonsterAvalancheLeft(monsterAvalancheTotal);
    setMonsterAvalancheEnding(false);
    setFinalSpiritWorldOpen(false);
    setFinalSpiritMonstersLeft(finalSpiritMonsterTotal);
    setFinalSpiritFightStarted(false);
    setDeathGodFightStarted(false);
    setImpossibleEnding(false);
    setHeroHp(currentHeroMaxHp);
    setHeroPosition({ x: -18_000, z: 0 });
    setHeroHeight(0);
    verticalVelocity.current = 0;
    setEnemyBurning(false);
    setMonsterAttackCount(0);

    if (id === 'dragonPeace') {
      setVictory(true);
      setChapter(dragonSons.length + 1);
      markSavedThrough(dragonSons.length - 1);
      setEnemyHp(kingDragonHp);
      setEndingChoice(null);
      setMessage('Телепорт: финальный выбор после Великого дракона.');
      navigate('/world');
      return;
    }

    if (id === 'dragonWar') {
      setChapter(dragonSons.length + 1);
      markSavedThrough(dragonSons.length - 1);
      setEndingChoice('family');
      setEnemyHp(kingDragonHp * 100);
      setMessage('Телепорт: битва с семьей драконов.');
      navigate('/');
      return;
    }

    if (id === 'monsterAvalanche') {
      setChapter(monsterAvalancheStartChapter);
      markSavedThrough(monsterAvalancheStartChapter - 1);
      setMonsterAvalancheEntered(true);
      setMonsterAvalancheLeft(monsterAvalancheTotal);
      setHeroHp(currentHeroMaxHp);
      setMessage('Телепорт: 5 мир. Лавина из 10 миллиардов монстров уже несется.');
      navigate('/');
      return;
    }

    if (id === 'goblinKing') {
      setChapter(0);
      setSavedCities([]);
      setCityMonsters(dragonSons.map(() => monstersPerCity));
      setGoblinKingReady(true);
      setGoblinKingFightStarted(true);
      setEnemyHp(scaledDragonPower(baseDragonHp, 4));
      setMessage('Телепорт: Король гоблинов вышел на бой.');
      navigate('/');
      return;
    }

    if (id === 'furyKing') {
      setChapter(4);
      markSavedThrough(4);
      setFuryKingFightStarted(true);
      setEnemyHp(scaledDragonPower(baseDragonHp, 10));
      setMessage('Телепорт: Король фури вышел на бой.');
      navigate('/');
      return;
    }

    if (id === 'anuarKing') {
      setChapter(6);
      markSavedThrough(6);
      setAnuarKingFightStarted(true);
      setEnemyHp(scaledDragonPower(baseDragonHp, 12));
      setMessage('Телепорт: Ануар вышел на финальный бой.');
      navigate('/');
      return;
    }

    if (id === 'mansurKing') {
      setChapter(7);
      markSavedThrough(7);
      setMansurKingFightStarted(true);
      setEnemyHp(scaledDragonPower(baseDragonHp, 14));
      setMessage('Телепорт: Король Мансур вышел с короной.');
      navigate('/');
      return;
    }

    if (id === 'arailmKing') {
      setChapter(8);
      markSavedThrough(8);
      setArailmKingFightStarted(true);
      setEnemyHp(scaledDragonPower(baseDragonHp, 15));
      setMessage(`Телепорт: босс Арайлым вышла на бой. HP: ${formatPower(scaledDragonPower(baseDragonHp, 15))}.`);
      navigate('/');
      return;
    }

    if (id === 'aisultanSea') {
      setChapter(9);
      markSavedThrough(9);
      setAisGateOpen(true);
      setAisWorldEntered(false);
      setAisMonstersLeft(0);
      setAisSharkFightStarted(false);
      setAisFinalChoiceOpen(false);
      setAisGodFightStarted(true);
      setEnemyHp(aisultanSeaGodHp);
      setMessage(`Телепорт: 10 водный мир. Бог моря Айсултан вышел на бой. HP: ${formatPower(aisultanSeaGodHp)}.`);
      navigate('/');
      return;
    }

    if (id === 'adminImpossible') {
      setChapter(10);
      markSavedThrough(dragonSons.length - 1);
      setAdminWorldGateOpen(true);
      setAdminBossFightStarted(true);
      setEnemyHp(adminFinalBossHp);
      setMessage('Телепорт: 11 мир. Админ вышел на финальный бой.');
      navigate('/');
      return;
    }

    if (id === 'bbiBadEnding') {
      setChapter(11);
      markSavedThrough(dragonSons.length - 1);
      setBbiFinalChoiceOpen(true);
      setEnemyHp(bbiFinalBossHp);
      setMessage('Телепорт: BBI финальный выбор. Можно сражаться или отказаться.');
      navigate('/');
      return;
    }

    if (id === 'impossibleEnding') {
      setChapter(12);
      markSavedThrough(dragonSons.length - 1);
      setNuraliBossFightStarted(true);
      setEnemyHp(nuraliBossHp);
      setMessage(`Телепорт: Нурали вышел на бой за невозможную концовку. HP босса: ${formatPower(nuraliBossHp)}.`);
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

  function applyGameSave(save: Partial<GameSaveState>) {
    setChapter(save.chapter ?? 0);
    setHealthLevel(save.healthLevel ?? 0);
    setHeroHp(Math.min(save.heroHp ?? heroMaxHp, currentHeroMaxHp));
    setEnemyHp(save.enemyHp ?? baseDragonHp);
    setMessage(save.message ?? 'Сейв загружен из Supabase.');
    setSavedCities(save.savedCities ?? []);
    setVictory(save.victory ?? false);
    setEndingChoice(save.endingChoice ?? null);
    setSecretEnding(save.secretEnding ?? null);
    setGoblinKingReady(save.goblinKingReady ?? false);
    setGoblinKingFightStarted(save.goblinKingFightStarted ?? false);
    setFuryGateOpen(save.furyGateOpen ?? false);
    setFuryDungeonEntered(save.furyDungeonEntered ?? false);
    setFuryMonstersLeft(save.furyMonstersLeft ?? furyDungeonEnemiesTotal);
    setFuryChoiceOpen(save.furyChoiceOpen ?? false);
    setFuryKingFightStarted(save.furyKingFightStarted ?? false);
    setAnuarGateOpen(save.anuarGateOpen ?? false);
    setAnuarWorldEntered(save.anuarWorldEntered ?? false);
    setAnuarBombsLeft(save.anuarBombsLeft ?? anuarBombEnemiesTotal);
    setAnuarKingFightStarted(save.anuarKingFightStarted ?? false);
    setMansurGateOpen(save.mansurGateOpen ?? false);
    setMansurDungeonEntered(save.mansurDungeonEntered ?? false);
    setMansurMonstersLeft(save.mansurMonstersLeft ?? mansurDungeonEnemiesTotal);
    setMansurKingFightStarted(save.mansurKingFightStarted ?? false);
    setArailmGateOpen(save.arailmGateOpen ?? false);
    setArailmWorldEntered(save.arailmWorldEntered ?? false);
    setArailmMonstersLeft(save.arailmMonstersLeft ?? arailmEnemiesTotal);
    setArailmChoiceOpen(save.arailmChoiceOpen ?? false);
    setArailmKingFightStarted(save.arailmKingFightStarted ?? false);
    setAisGateOpen(save.aisGateOpen ?? false);
    setAisWorldEntered(save.aisWorldEntered ?? false);
    setAisMonstersLeft(save.aisMonstersLeft ?? aisultanMonsterTotal);
    setAisSharkFightStarted(save.aisSharkFightStarted ?? false);
    setAisFinalChoiceOpen(save.aisFinalChoiceOpen ?? false);
    setAisGodFightStarted(save.aisGodFightStarted ?? false);
    setAdminWorldGateOpen(save.adminWorldGateOpen ?? false);
    setAdminWorldEntered(save.adminWorldEntered ?? false);
    setAdminWorldMonstersLeft(save.adminWorldMonstersLeft ?? adminWorldMonsterTotal);
    setAdminWorldBossesStarted(save.adminWorldBossesStarted ?? false);
    setAdminFinalChoiceOpen(save.adminFinalChoiceOpen ?? false);
    setAdminBossFightStarted(save.adminBossFightStarted ?? false);
    setBbiGateOpen(save.bbiGateOpen ?? false);
    setBbiWorldEntered(save.bbiWorldEntered ?? false);
    setBbiMonstersLeft(save.bbiMonstersLeft ?? bbiMonsterTotal);
    setBbiBossStage(save.bbiBossStage ?? null);
    setBbiFinalChoiceOpen(save.bbiFinalChoiceOpen ?? false);
    setBbiCityReward(save.bbiCityReward ?? false);
    setBbiBadEnding(save.bbiBadEnding ?? false);
    setImpossibleEnding(save.impossibleEnding ?? false);
    setNuraliGateOpen(save.nuraliGateOpen ?? false);
    setNuraliWorldEntered(save.nuraliWorldEntered ?? false);
    setNuraliMonstersLeft(save.nuraliMonstersLeft ?? nuraliMonsterTotal);
    setNuraliChoiceOpen(save.nuraliChoiceOpen ?? false);
    setNuraliBossFightStarted(save.nuraliBossFightStarted ?? false);
    setMonsterAvalancheEntered(save.monsterAvalancheEntered ?? false);
    setMonsterAvalancheLeft(save.monsterAvalancheLeft ?? monsterAvalancheTotal);
    setMonsterAvalancheEnding(save.monsterAvalancheEnding ?? false);
    setFinalSpiritWorldOpen(save.finalSpiritWorldOpen ?? false);
    setFinalSpiritMonstersLeft(save.finalSpiritMonstersLeft ?? finalSpiritMonsterTotal);
    setFinalSpiritFightStarted(save.finalSpiritFightStarted ?? false);
    setDeathGodFightStarted(save.deathGodFightStarted ?? false);
    setGold(save.gold ?? 0);
    setGoldMultiplier(save.goldMultiplier ?? 1);
    setInfiniteGold(save.infiniteGold ?? false);
    setDungeon(save.dungeon ?? null);
    setRelics(save.relics ?? []);
    setWeapons(save.weapons ?? []);
    setEquippedWeapon(save.equippedWeapon ?? null);
    setArmors(save.armors ?? []);
    setEquippedArmor(save.equippedArmor ?? null);
    setEquippedArtifactId(save.equippedArtifactId ?? null);
    setHeroMana(save.heroMana ?? heroMaxMana);
    setHeroPosition(save.heroPosition ?? { x: -18_000, z: 0 });
    setHeroDirection(save.heroDirection ?? { x: 0, z: -1 });
    setMapLocationIndex(save.mapLocationIndex ?? 0);
    setCityMonsters(save.cityMonsters ?? dragonSons.map(() => monstersPerCity));
    setDuelWins(save.duelWins ?? 0);
    setItems(save.items ?? { sword: 0, pet: 0, clothes: 0, helmet: 0, armor: 0, mana: 0, health: 0, doubleStrike: 0 });
    setShopLevels(save.shopLevels ?? { sword: 0, pet: 0, clothes: 0, helmet: 0, armor: 0, mana: 0, health: 0, doubleStrike: 0 });
    setIntroSkipped(save.introSkipped ?? false);
    paidQuestIds.current = new Set(save.paidQuestIds ?? []);
  }

  useEffect(() => {
    if (!isSupabaseConfigured || !authUser) {
      supabaseSaveLoadedRef.current = false;
      return;
    }

    let cancelled = false;
    supabaseSaveLoadedRef.current = false;

    supabase
      .from('game_saves')
      .select('save_data, updated_at')
      .eq('user_id', authUser.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn('Supabase save load failed', error);
          return;
        }

        const remoteSave = data?.save_data as Partial<GameSaveState> | null | undefined;
        if (!remoteSave || remoteSave.version !== 1) return;

        const remoteSavedAt = remoteSave.savedAt ?? (data?.updated_at ? Date.parse(data.updated_at) : 0);
        const localSavedAt = savedGameRef.current?.savedAt ?? 0;
        if (remoteSavedAt <= localSavedAt) return;

        const normalizedSave = { ...remoteSave, savedAt: remoteSavedAt };
        savedGameRef.current = normalizedSave;
        window.localStorage.setItem(gameSaveStorageKey, JSON.stringify(normalizedSave));
        applyGameSave(normalizedSave);
        setMessage('Сейв загружен из Supabase.');
      }, (error) => {
        if (!cancelled) console.warn('Supabase save load failed', error);
      })
      .then(() => {
        if (!cancelled) supabaseSaveLoadedRef.current = true;
      });

    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  useEffect(() => {
    const saveState: GameSaveState = {
      version: 1,
      savedAt: Date.now(),
      chapter,
      healthLevel,
      heroHp,
      enemyHp,
      message,
      savedCities,
      victory,
      endingChoice,
      secretEnding,
      goblinKingReady,
      goblinKingFightStarted,
      furyGateOpen,
      furyDungeonEntered,
      furyMonstersLeft,
      furyChoiceOpen,
      furyKingFightStarted,
      anuarGateOpen,
      anuarWorldEntered,
      anuarBombsLeft,
      anuarKingFightStarted,
      mansurGateOpen,
      mansurDungeonEntered,
      mansurMonstersLeft,
      mansurKingFightStarted,
      arailmGateOpen,
      arailmWorldEntered,
      arailmMonstersLeft,
      arailmChoiceOpen,
      arailmKingFightStarted,
      aisGateOpen,
      aisWorldEntered,
      aisMonstersLeft,
      aisSharkFightStarted,
      aisFinalChoiceOpen,
      aisGodFightStarted,
      adminWorldGateOpen,
      adminWorldEntered,
      adminWorldMonstersLeft,
      adminWorldBossesStarted,
      adminFinalChoiceOpen,
      adminBossFightStarted,
      bbiGateOpen,
      bbiWorldEntered,
      bbiMonstersLeft,
      bbiBossStage,
      bbiFinalChoiceOpen,
      bbiCityReward,
      bbiBadEnding,
      impossibleEnding,
      nuraliGateOpen,
      nuraliWorldEntered,
      nuraliMonstersLeft,
      nuraliChoiceOpen,
      nuraliBossFightStarted,
      monsterAvalancheEntered,
      monsterAvalancheLeft,
      monsterAvalancheEnding,
      finalSpiritWorldOpen,
      finalSpiritMonstersLeft,
      finalSpiritFightStarted,
      deathGodFightStarted,
      gold,
      goldMultiplier,
      infiniteGold,
      dungeon,
      relics,
      weapons,
      equippedWeapon,
      armors,
      equippedArmor,
      equippedArtifactId,
      heroMana,
      heroPosition,
      heroDirection,
      mapLocationIndex,
      cityMonsters,
      duelWins,
      items,
      shopLevels,
      introSkipped,
      paidQuestIds: Array.from(paidQuestIds.current),
    };
    window.localStorage.setItem(gameSaveStorageKey, JSON.stringify(saveState));
    savedGameRef.current = saveState;

    if (isSupabaseConfigured && authUser && supabaseSaveLoadedRef.current) {
      if (supabaseSaveTimer.current !== null) window.clearTimeout(supabaseSaveTimer.current);
      supabaseSaveTimer.current = window.setTimeout(() => {
        void supabase
          .from('game_saves')
          .upsert({
            user_id: authUser.id,
            save_data: saveState,
            updated_at: new Date(saveState.savedAt).toISOString(),
          }, { onConflict: 'user_id' })
          .then(({ error }) => {
            if (error) console.warn('Supabase save failed', error);
          });
        supabaseSaveTimer.current = null;
      }, 900);
    }
  }, [
    chapter, healthLevel, heroHp, enemyHp, message, savedCities, victory, endingChoice, secretEnding,
    goblinKingReady, goblinKingFightStarted, furyGateOpen, furyDungeonEntered, furyMonstersLeft, furyChoiceOpen, furyKingFightStarted,
    anuarGateOpen, anuarWorldEntered, anuarBombsLeft, anuarKingFightStarted, mansurGateOpen, mansurDungeonEntered, mansurMonstersLeft, mansurKingFightStarted,
    arailmGateOpen, arailmWorldEntered, arailmMonstersLeft, arailmChoiceOpen, arailmKingFightStarted, aisGateOpen, aisWorldEntered, aisMonstersLeft,
    aisSharkFightStarted, aisFinalChoiceOpen, aisGodFightStarted, adminWorldGateOpen, adminWorldEntered, adminWorldMonstersLeft, adminWorldBossesStarted,
    adminFinalChoiceOpen, adminBossFightStarted, bbiGateOpen, bbiWorldEntered, bbiMonstersLeft, bbiBossStage, bbiFinalChoiceOpen, bbiCityReward,
    bbiBadEnding, impossibleEnding, nuraliGateOpen, nuraliWorldEntered, nuraliMonstersLeft, nuraliChoiceOpen, nuraliBossFightStarted,
    monsterAvalancheEntered, monsterAvalancheLeft, monsterAvalancheEnding, finalSpiritWorldOpen, finalSpiritMonstersLeft, finalSpiritFightStarted,
    deathGodFightStarted, gold, goldMultiplier, infiniteGold, dungeon, relics, weapons, equippedWeapon, armors, equippedArmor, equippedArtifactId,
    heroMana, heroPosition, heroDirection, mapLocationIndex, cityMonsters, duelWins, items, shopLevels, introSkipped, authUser,
  ]);

  useEffect(() => {
    if (!allAchievementsUnlocked || creatorCreditsOpen) return;
    if (window.localStorage.getItem('dragon-game-creator-credits-seen') === 'yes') return;
    window.localStorage.setItem('dragon-game-creator-credits-seen', 'yes');
    setCreatorCreditsOpen(true);
  }, [allAchievementsUnlocked, creatorCreditsOpen]);

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
  }, [endingVoiceText, impossibleEnding, bbiBadEnding, secretEnding, endingChoice]);

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
    if (!isSupabaseConfigured || guestMode || !authOpen) return;

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
  }, [authOpen, guestMode]);

  useEffect(() => {
    const completedUnpaid = quests.filter((quest) => quest.done && !paidQuestIds.current.has(quest.id));
    if (completedUnpaid.length === 0) return;

    const money = completedUnpaid.reduce((sum, quest) => sum + quest.money, 0);
    const rewardWeapons = completedUnpaid.flatMap((quest) => {
      if (quest.id % 25 === 0 || quest.id === 499) return [createSecretWeapon(Math.max(quest.id / 10, chapter + 1))];
      if (quest.id % 10 === 0 || quest.id === 498) return [createWeapon(quest.id % 50 === 0 ? 'Легендарка' : 'Эпик', Math.max(quest.id / 12, chapter + 1))];
      return [];
    });
    const rewardArmors = completedUnpaid.flatMap((quest) => (
      quest.id % 15 === 0 ? [createArmor(quest.id % 45 === 0 ? 'Легендарка' : 'Эпик', Math.max(quest.id / 15, chapter + 1))] : []
    ));
    completedUnpaid.forEach((quest) => paidQuestIds.current.add(quest.id));
    addGold(money);
    if (rewardWeapons.length > 0) {
      setWeapons((currentWeapons) => [...currentWeapons, ...rewardWeapons]);
      setEquippedWeapon(rewardWeapons[rewardWeapons.length - 1]);
    }
    if (rewardArmors.length > 0) {
      setArmors((currentArmors) => [...currentArmors, ...rewardArmors]);
      setEquippedArmor(rewardArmors[rewardArmors.length - 1]);
    }
    const itemText = [
      rewardWeapons.length > 0 ? `${rewardWeapons.length} оружия` : '',
      rewardArmors.length > 0 ? `${rewardArmors.length} брони` : '',
    ].filter(Boolean).join(', ');
    setMessage(`Квест выполнен! Получено денег: ${formatPower(money)}${itemText ? ` и ${itemText}` : ''}. Всего квестов: ${quests.filter((quest) => quest.done).length} / 500.`);
  }, [storyProgress, savedCities.length, isFinalReveal, endingChoice, secretEnding]);

  useEffect(() => {
    if (heroHp > 0 || isFinalReveal || isMonsterAvalancheWorld || isFinalSpiritWorld || isFinalSpiritBoss) return;

    window.setTimeout(() => {
      resetWinStreak('герой погиб');
      restart();
      setMessage('Здоровье героя упало до 0. Игра началась заново.');
    }, 700);
  }, [heroHp, isFinalReveal, isMonsterAvalancheWorld, isFinalSpiritWorld, isFinalSpiritBoss]);

  useEffect(() => {
    if (heroHp > 0 || (!isFinalSpiritWorld && !isFinalSpiritBoss)) return;

    const timer = window.setTimeout(() => {
      setHeroHp(currentHeroMaxHp);
      setMessage('В подземном мире герой не пропадает. Душа вернула HP, можно спокойно продолжать бой.');
    }, 700);

    return () => window.clearTimeout(timer);
  }, [heroHp, isFinalSpiritWorld, isFinalSpiritBoss, currentHeroMaxHp]);

  useEffect(() => {
    if (dailyRewardCheckedRef.current) return;
    dailyRewardCheckedRef.current = true;

    const today = getLocalDateKey();
    const saved = readDailyRewardState();
    if (saved.lastRewardDate === today) {
      setDailyRewardState(saved);
      setDailyRewardText(`Сегодня награда уже получена. Рекорд дней: ${saved.bestStreak}.`);
      return;
    }

    const nextStreak = saved.lastVisitDate === getYesterdayDateKey() ? saved.streak + 1 : 1;
    const nextState: DailyRewardState = {
      lastVisitDate: today,
      lastRewardDate: today,
      streak: nextStreak,
      bestStreak: Math.max(saved.bestStreak, nextStreak),
    };
    saveDailyRewardState(nextState);
    setDailyRewardState(nextState);

    const rewardText = grantDailyReward(nextStreak);
    setDailyRewardText(`${rewardText} Рекорд дней: ${nextState.bestStreak}.`);
    setMessage(`${rewardText} Заходи завтра, чтобы получить следующую награду.`);
  }, []);

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
      setHeroHp((hp) => Math.min(currentHeroMaxHp + nextUpgradePower(level, shopBasePower.health), hp + nextUpgradePower(level, shopBasePower.health)));
    }
    if (item.id === 'mana') {
      const manaBonus = nextUpgradePower(level, shopBasePower.mana);
      setHeroMana((mana) => Math.min(currentHeroMaxMana + manaBonus, mana + manaBonus));
    }
    setMessage(`${item.name} куплен. ${bonusText}, следующий раз будет дороже и сильнее.`);
  }

  function playHeroAnimation(animation: HeroAnimation, duration = 520) {
    if (animation === 'step' && (heroAnimation === 'step' || heroAnimation === 'strike' || heroAnimation === 'heal')) return;
    if (heroAnimationTimer.current !== null) {
      window.clearTimeout(heroAnimationTimer.current);
    }
    setHeroAnimation(animation);
    heroAnimationTimer.current = window.setTimeout(() => {
      setHeroAnimation('idle');
      heroAnimationTimer.current = null;
    }, duration);
  }

  function closeTutorial() {
    setTutorialOpen(false);
  }

  function setCurrentMonsterCount(nextMonsters: number) {
    if (isAdminWorld) {
      setAdminWorldMonstersLeft(nextMonsters);
    } else if (isFinalSpiritWorld) {
      setFinalSpiritMonstersLeft(nextMonsters);
    } else if (isMonsterAvalancheWorld) {
      setMonsterAvalancheLeft(nextMonsters);
    } else if (isBbiWorld) {
      setBbiMonstersLeft(nextMonsters);
    } else if (isNuraliWorld) {
      setNuraliMonstersLeft(nextMonsters);
    } else if (isAisWorld) {
      setAisMonstersLeft(nextMonsters);
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
      setCityMonsters(cityMonsters.map((count, index) => (index === chapter ? nextMonsters : count)));
    }
  }

  function equipArtifact(artifact: Artifact) {
    const healingPercent = 20 * (1 + (artifact.healingBonusPercent ?? 0) / 100);
    const healingAmount = Math.max(1, Math.floor(currentHeroMaxHp * (healingPercent / 100)));
    setEquippedArtifactId(artifact.id);
    setHeroHp((hp) => Math.min(currentHeroMaxHp, hp + healingAmount));
    playHeroAnimation('heal', 720);
    setMessage(`${artifact.name} надет. Амулет исцелил героя на ${formatPower(healingAmount)} HP${artifact.healingBonusPercent ? `, бонус к исцелению +${artifact.healingBonusPercent}%` : ''}.`);
  }

  function moveHero(dx: number, dz: number) {
    setHeroPosition((position) => {
      const clampPosition = (nextPosition: { x: number; z: number }) => ({
        x: Math.max(-cityHalfSize, Math.min(cityHalfSize, nextPosition.x)),
        z: Math.max(-cityHalfSize, Math.min(cityHalfSize, nextPosition.z)),
      });
      const collisionContext = collisionContextRef.current;
      const nextPosition = clampPosition({ x: position.x + dx, z: position.z + dz });
      if (!isWorldBlockedAt(nextPosition, collisionContext.chapter, collisionContext.mapLocationIndex, collisionContext.mapSceneKey, 0.62)) return nextPosition;

      const slideX = clampPosition({ x: position.x + dx, z: position.z });
      if (!isWorldBlockedAt(slideX, collisionContext.chapter, collisionContext.mapLocationIndex, collisionContext.mapSceneKey, 0.62)) return slideX;

      const slideZ = clampPosition({ x: position.x, z: position.z + dz });
      if (!isWorldBlockedAt(slideZ, collisionContext.chapter, collisionContext.mapLocationIndex, collisionContext.mapSceneKey, 0.62)) return slideZ;

      return position;
    });
  }

  function moveMonsterAroundObjects(monster: NearestMonsterState, dx: number, dz: number) {
    const clampPosition = (nextPosition: { x: number; z: number }) => ({
      x: Math.max(-cityHalfSize, Math.min(cityHalfSize, nextPosition.x)),
      z: Math.max(-cityHalfSize, Math.min(cityHalfSize, nextPosition.z)),
    });
    const collisionContext = collisionContextRef.current;
    const canStand = (position: { x: number; z: number }) =>
      !isWorldBlockedAt(position, collisionContext.chapter, collisionContext.mapLocationIndex, collisionContext.mapSceneKey, 0.74);
    const nextPosition = clampPosition({ x: monster.x + dx, z: monster.z + dz });
    if (canStand(nextPosition)) return { ...monster, ...nextPosition };

    const slideX = clampPosition({ x: monster.x + dx, z: monster.z });
    if (canStand(slideX)) return { ...monster, ...slideX };

    const slideZ = clampPosition({ x: monster.x, z: monster.z + dz });
    if (canStand(slideZ)) return { ...monster, ...slideZ };

    const sidestepLength = Math.max(1, Math.hypot(dx, dz));
    const sideStep = {
      x: monster.x - (dz / sidestepLength) * sidestepLength * 0.75,
      z: monster.z + (dx / sidestepLength) * sidestepLength * 0.75,
    };
    const sidePosition = clampPosition(sideStep);
    if (canStand(sidePosition)) return { ...monster, ...sidePosition };

    const otherSidePosition = clampPosition({
      x: monster.x + (dz / sidestepLength) * sidestepLength * 0.75,
      z: monster.z - (dx / sidestepLength) * sidestepLength * 0.75,
    });
    if (canStand(otherSidePosition)) return { ...monster, ...otherSidePosition };

    return monster;
  }

  function updateJoystick(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rawX = event.clientX - centerX;
    const rawY = event.clientY - centerY;
    const maxRadius = rect.width * 0.36;
    const distance = Math.hypot(rawX, rawY);
    const strength = Math.min(1, distance / maxRadius);
    const angle = Math.atan2(rawY, rawX);
    const thumbX = Math.cos(angle) * strength * maxRadius;
    const thumbY = Math.sin(angle) * strength * maxRadius;
    joystickVector.current = {
      x: Math.cos(angle) * strength,
      z: Math.sin(angle) * strength,
    };
    setJoystickThumb({ x: thumbX, y: thumbY });
  }

  function startJoystick(event: ReactPointerEvent<HTMLDivElement>) {
    joystickPointerId.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateJoystick(event);
  }

  function moveJoystick(event: ReactPointerEvent<HTMLDivElement>) {
    if (joystickPointerId.current !== event.pointerId) return;
    updateJoystick(event);
  }

  function stopJoystick(event: ReactPointerEvent<HTMLDivElement>) {
    if (joystickPointerId.current !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    joystickPointerId.current = null;
    joystickVector.current = { x: 0, z: 0 };
    setJoystickThumb({ x: 0, y: 0 });
    setHeroMoving(false);
  }

  function updateCameraYaw(nextYaw: number) {
    cameraYawRef.current = nextYaw;
    setCameraYaw(nextYaw);
  }

  function startCameraDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('button, a, input, textarea, select, .mobile-joystick, .arcane-spell-panel')) return;
    cameraPointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveCameraDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const pointer = cameraPointer.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (Math.hypot(dx, dy) > 3) pointer.moved = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    updateCameraYaw(cameraYawRef.current - dx * 0.006);
    event.preventDefault();
  }

  function stopCameraDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const pointer = cameraPointer.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    blockNextStageClick.current = pointer.moved;
    cameraPointer.current = null;
  }

  function attackFromStageClick() {
    if (blockNextStageClick.current) {
      blockNextStageClick.current = false;
      return;
    }
    if (currentMonsters > 0) fightMonster();
    else strike();
  }

  useEffect(() => {
    let frame = 0;
    const tickMovement = () => {
      const now = performance.now();
      const deltaSeconds = lastMoveAt.current === null ? 0.016 : Math.min(0.05, (now - lastMoveAt.current) / 1000);
      lastMoveAt.current = now;
      const keys = pressedKeys.current;
      let dx = 0;
      let dz = 0;
      if (keys.has('w') || keys.has('keyw') || keys.has('arrowup')) dz -= 1;
      if (keys.has('s') || keys.has('keys') || keys.has('arrowdown')) dz += 1;
      if (keys.has('a') || keys.has('keya') || keys.has('arrowleft')) dx -= 1;
      if (keys.has('d') || keys.has('keyd') || keys.has('arrowright')) dx += 1;
      dx += joystickVector.current.x;
      dz += joystickVector.current.z;
      const inputLength = Math.hypot(dx, dz);
      const hasInput = inputLength > 0.05;
      const localX = hasInput ? dx / inputLength : 0;
      const localZ = hasInput ? dz / inputLength : 0;
      const yaw = cameraYawRef.current;
      const targetDirection = hasInput
        ? {
          x: Math.cos(yaw) * localX + Math.sin(yaw) * localZ,
          z: -Math.sin(yaw) * localX + Math.cos(yaw) * localZ,
        }
        : { x: 0, z: 0 };
      const isSprinting = keys.has('shift') || keys.has('shiftleft') || keys.has('shiftright');
      const targetSpeed = hasInput ? (isSprinting ? heroRunSpeedPerSecond : heroMoveSpeedPerSecond) : 0;
      const currentVelocity = movementVelocity.current;
      const acceleration = hasInput ? 9.5 : 12.5;
      const blend = 1 - Math.exp(-deltaSeconds * acceleration);
      const nextVelocity = {
        x: currentVelocity.x + (targetDirection.x * targetSpeed - currentVelocity.x) * blend,
        z: currentVelocity.z + (targetDirection.z * targetSpeed - currentVelocity.z) * blend,
      };
      if (!hasInput && Math.hypot(nextVelocity.x, nextVelocity.z) < heroMoveSpeedPerSecond * 0.025) {
        nextVelocity.x = 0;
        nextVelocity.z = 0;
      }
      movementVelocity.current = nextVelocity;
      const nextSpeed = Math.hypot(nextVelocity.x, nextVelocity.z);
      const moving = hasInput || nextSpeed > heroMoveSpeedPerSecond * 0.035;
      setHeroMoving(moving);
      if (nextSpeed > heroMoveSpeedPerSecond * 0.02) {
        const direction = { x: nextVelocity.x / Math.max(1, nextSpeed), z: nextVelocity.z / Math.max(1, nextSpeed) };
        setHeroDirection(direction);
        moveHero(nextVelocity.x * deltaSeconds, nextVelocity.z * deltaSeconds);
      }
      frame = window.requestAnimationFrame(tickMovement);
    };

    frame = window.requestAnimationFrame(tickMovement);

    return () => {
      window.cancelAnimationFrame(frame);
      lastMoveAt.current = null;
      movementVelocity.current = { x: 0, z: 0 };
      setHeroMoving(false);
    };
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

  function makeNearestMonsterSpawn(hp = currentMonsterHp): NearestMonsterState {
    const directionLength = Math.max(1, Math.hypot(heroDirection.x, heroDirection.z));
    const forward = {
      x: heroDirection.x / directionLength,
      z: heroDirection.z / directionLength,
    };
    const collisionContext = collisionContextRef.current;
    const baseAngle = Math.atan2(forward.x, forward.z);
    for (let attempt = 0; attempt < 16; attempt += 1) {
      const angle = baseAngle + (attempt % 2 ? -1 : 1) * Math.ceil(attempt / 2) * 0.42;
      const distance = monsterSpawnDistanceUnits + Math.floor(attempt / 4) * 5_000;
      const position = {
        x: Math.max(-cityHalfSize, Math.min(cityHalfSize, heroPosition.x + Math.sin(angle) * distance)),
        z: Math.max(-cityHalfSize, Math.min(cityHalfSize, heroPosition.z + Math.cos(angle) * distance)),
      };
      if (!isWorldBlockedAt(position, collisionContext.chapter, collisionContext.mapLocationIndex, collisionContext.mapSceneKey, 0.74)) {
        return {
          ...position,
          hp,
          alive: currentMonsters > 0,
        };
      }
    }
    return {
      x: heroPosition.x + forward.x * monsterSpawnDistanceUnits,
      z: heroPosition.z + forward.z * monsterSpawnDistanceUnits,
      hp,
      alive: currentMonsters > 0,
    };
  }

  function fightMonster() {
    if (isFinalReveal || heroHp === 0 || currentMonsters <= 0) {
      setMessage(currentMonsters <= 0 ? `В этом городе все ${formatPower(monstersPerCity)} монстров уже побеждены.` : 'Сначала восстанови героя.');
      return;
    }
    playHeroAnimation('strike', 420);
    setBattlePulse((pulse) => pulse + 1);
    if (isAisultanSword(equippedWeapon)) {
      setWaterWavePulse((pulse) => pulse + 1);
    }

    if (equippedWeapon?.id.startsWith('admin-nuke-')) {
      setNukePulse((pulse) => pulse + 1);
      if (isBbiWorld) {
        setBbiMonstersLeft(0);
        setBbiWorldEntered(false);
        setBbiBossStage('manager');
        setEnemyHp(bbiManagerHp);
        setMessage('100 BBI монстров уничтожены. Появился босс Управляющий.');
        return;
      }
      if (isNuraliWorld) {
        setNuraliMonstersLeft(0);
        setNuraliWorldEntered(false);
        setNuraliChoiceOpen(true);
        setMessage('100 монстров Нурали уничтожены. На весь экран вышла надпись: драться с Нурали или нет.');
        return;
      }
      if (isMonsterAvalancheWorld) {
        finishMonsterAvalanche();
        return;
      }
      if (isFinalSpiritWorld) {
        setFinalSpiritMonstersLeft(0);
        setFinalSpiritFightStarted(true);
        setEnemyHp(finalSpiritDragonHp);
        setHeroHp(currentHeroMaxHp);
        setMessage(`Подземные монстры уничтожены ядеркой. Души финального босса собрались в бой: ${formatPower(finalSpiritDragonHp)} HP.`);
        return;
      }
      if (isArailmWorld) {
        setArailmMonstersLeft(0);
        setArailmWorldEntered(false);
        setArailmChoiceOpen(true);
        setMessage(`${formatPower(arailmEnemiesTotal)} код-монстров уничтожены. Теперь выбери: не сражаться или сражаться.`);
        return;
      }
      if (isAisWorld) {
        setAisMonstersLeft(0);
        setAisWorldEntered(false);
        setAisSharkFightStarted(true);
        setEnemyHp(aisultanSharkHp);
        setMessage(`1 млрд рыб-монстров уничтожены. Промежуточный босс Акула вышла на бой: ${formatPower(aisultanSharkHp)} HP.`);
        return;
      }
      if (isAdminWorld) {
        setAdminWorldMonstersLeft(0);
        setAdminWorldEntered(false);
        setAdminWorldBossesStarted(true);
        setEnemyHp(adminWorldBossesHp);
        setMessage('1 млрд админских монстров уничтожен. Этап 2: все боссы концовок вышли вместе.');
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

    const monsterDistance = Math.hypot(heroPosition.x - nearestMonsterRef.current.x, heroPosition.z - nearestMonsterRef.current.z);
    if (!nearestMonsterRef.current.alive || monsterDistance > meleeRangeUnits) {
      setMessage(`Подойди ближе к гоблину: сейчас ${Math.ceil(monsterDistance / 1_000)}м, удар работает в радиусе ${meleeRangeMeters}м.`);
      return;
    }

    const baseMonstersPerHit = items.doubleStrike > 0 ? 2 + Math.max(0, shopLevels.doubleStrike - 1) : 1;
    const monstersPerHit = Math.max(1, Math.floor(baseMonstersPerHit * artifactAttackSpeedMultiplier));
    const heroMonsterDamage = Math.max(1, Math.floor((18 + chapter * 5 + attackBonus) * artifactDamageMultiplier));
    const nextMonsterHp = nearestMonsterRef.current.hp - heroMonsterDamage;
    if (nextMonsterHp > 0) {
      setNearestMonster((monster) => ({ ...monster, hp: Math.min(monster.hp, nextMonsterHp), alive: true }));
      setMessage(`Удар по гоблину: -${formatPower(heroMonsterDamage)} HP. Осталось ${formatPower(nextMonsterHp)} HP. Дистанция ${nearestMonsterDistanceMeters.toFixed(1)}м.`);
      return;
    }

    const nextMonsters = Math.max(0, currentMonsters - monstersPerHit);
    const monsterWeapon = isAdminWorld ? rollDungeonWeapon((chapter + 30) * artifactLuckMultiplier) : isNuraliWorld ? rollDungeonWeapon(chapter + 18) : isBbiWorld ? rollDungeonWeapon(chapter + 12) : isArailmWorld ? rollDungeonWeapon(chapter + 16) : isMansurDungeon ? rollDungeonWeapon(chapter + 14) : isAnuarWorld ? rollDungeonWeapon(chapter + 12) : isFuryDungeon ? rollDungeonWeapon(chapter + 10) : isDungeon ? rollDungeonWeapon(chapter + 1) : rollWeapon(2 * artifactLuckMultiplier, chapter + 1);
    const monsterArmor = isAdminWorld ? rollArmor((chapter + 30) * artifactLuckMultiplier, chapter + 30) : isNuraliWorld ? rollArmor(18, chapter + 18) : isBbiWorld ? rollArmor(12, chapter + 12) : isArailmWorld ? rollArmor(16, chapter + 16) : isMansurDungeon ? rollArmor(14, chapter + 14) : isAnuarWorld ? rollArmor(12, chapter + 12) : isFuryDungeon ? rollArmor(10, chapter + 10) : isDungeon ? rollArmor(10, chapter + 1) : rollArmor(2 * artifactLuckMultiplier, chapter + 1);
    const nextCityMonsters = cityMonsters.map((count, index) => (index === chapter ? nextMonsters : count));

    if (isAdminWorld) {
      setAdminWorldMonstersLeft(nextMonsters);
    } else if (isFinalSpiritWorld) {
      setFinalSpiritMonstersLeft(nextMonsters);
    } else if (isMonsterAvalancheWorld) {
      setMonsterAvalancheLeft(nextMonsters);
    } else if (isBbiWorld) {
      setBbiMonstersLeft(nextMonsters);
    } else if (isNuraliWorld) {
      setNuraliMonstersLeft(nextMonsters);
    } else if (isAisWorld) {
      setAisMonstersLeft(nextMonsters);
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
    setNearestMonster(nextMonsters > 0 ? makeNearestMonsterSpawn(currentMonsterHp) : { ...nearestMonsterRef.current, hp: 0, alive: false });
    addGold(2 + chapter);
    const streakRewardText = addWinStreak('монстр побежден');

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

    setMessage(
      monsterWeapon
        ? `Удар задел ${monstersPerHit} враг. Осталось ${nextMonsters} из ${currentMonsterTotal}. Выпало оружие: ${getWeaponDisplayName(monsterWeapon)} (${monsterWeapon.rarity}).`
        : monsterArmor
          ? `Удар задел ${monstersPerHit} враг. Осталось ${nextMonsters} из ${currentMonsterTotal}. Выпала броня: ${monsterArmor.name} (${monsterArmor.rarity}).`
        : `Удар задел ${monstersPerHit} враг. Осталось ${nextMonsters} из ${currentMonsterTotal}. Получено золото. ${streakRewardText}`
    );

    if (nextMonsters === 0) {
      if (isMonsterAvalancheWorld) {
        finishMonsterAvalanche();
        return;
      }
      if (isFinalSpiritWorld) {
        setFinalSpiritMonstersLeft(0);
        setFinalSpiritFightStarted(true);
        setEnemyHp(finalSpiritDragonHp);
        setHeroHp(currentHeroMaxHp);
        setMessage(`Монстры подземного мира побеждены. Теперь появились души финального босса: ${formatPower(finalSpiritDragonHp)} HP.`);
        return;
      }
      if (isBbiWorld) {
        setBbiWorldEntered(false);
        setBbiBossStage('manager');
        setEnemyHp(bbiManagerHp);
        setMessage('100 BBI монстров побеждены. Появился босс Управляющий.');
        return;
      }
      if (isNuraliWorld) {
        setNuraliWorldEntered(false);
        setNuraliChoiceOpen(true);
        setMessage('100 монстров Нурали побеждены. Появилась надпись: драться с Нурали или нет.');
        return;
      }
      if (isArailmWorld) {
        setArailmWorldEntered(false);
        setArailmChoiceOpen(true);
        setMessage(`${formatPower(arailmEnemiesTotal)} код-монстров побеждены. На экране выбор: не сражаться или сражаться.`);
        return;
      }
      if (isAisWorld) {
        setAisWorldEntered(false);
        setAisSharkFightStarted(true);
        setEnemyHp(aisultanSharkHp);
        setMessage(`1 млрд рыб-монстров побежден. Вышел промежуточный босс Акула: ${formatPower(aisultanSharkHp)} HP.`);
        return;
      }
      if (isAdminWorld) {
        setAdminWorldEntered(false);
        setAdminWorldBossesStarted(true);
        setEnemyHp(adminWorldBossesHp);
        setMessage('1 млрд админских монстров побежден. Этап 2: все боссы концовок вышли вместе и бьют героя.');
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
      setMessage(`Все монстры побеждены. Появился дракон: ${formatPower(currentDragonHp)} HP.`);
    }
  }

  function finishMonsterAvalanche() {
    setMonsterAvalancheEntered(false);
    setMonsterAvalancheLeft(0);
    setMonsterAvalancheEnding(true);
    setSecretEnding('monsterAvalanche');
    setVictory(true);
    setChapter(dragonSons.length + 1);
    setSavedCities(dragonSons.slice(0, monsterAvalancheStartChapter + 1).map((city) => `${city.city}, ${city.country}`));
    setHeroHp(currentHeroMaxHp);
    unlockAchievement('monsterAvalanche');
    addGold(10_000_000_000);
    setMessage('Лавина из 10 миллиардов монстров побеждена. Открыта концовка лавины и 100% баф ко всем силам.');
    navigate('/world');
  }

  function clearCity() {
    if (!enemy) return;
    setEnemyBurning(false);
    addWinStreak(currentMonsters === 0 ? 'дракон или босс побежден' : 'город очищен');

    if (isDeathGodBoss) {
      const deathSword = createDeathSword();
      setDeathGodFightStarted(false);
      setVictory(true);
      setSecretEnding('deathVictory');
      unlockAchievement('deathVictory');
      setChapter(dragonSons.length + 1);
      setWeapons((currentWeapons) => [...currentWeapons, deathSword]);
      setEquippedWeapon(deathSword);
      setEquippedArtifactId('godHead');
      addGold(666_666_666);
      setMessage('Король ада побежден. Концовка: победивший смерть. Получены Голова бога и смертельный секретный меч.');
      navigate('/world');
      return;
    }

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

    if (isNuraliKingBoss) {
      setNuraliGateOpen(false);
      setNuraliWorldEntered(false);
      setNuraliChoiceOpen(false);
      setNuraliBossFightStarted(false);
      setImpossibleEnding(true);
      setVictory(true);
      setChapter(dragonSons.length + 1);
      unlockAchievement('impossibleEnding');
      addGold(2_281_000);
      setMessage('Босс Нурали побежден. Открыта невозможная концовка и артефакт Медальон невозможности.');
      navigate('/world');
      return;
    }

    if (isAisSharkBoss) {
      setAisSharkFightStarted(false);
      setAisFinalChoiceOpen(true);
      setMessage('Акула побеждена. Появилась надпись: сразиться с богом моря Айсултаном? Да или нет.');
      navigate('/world');
      return;
    }

    if (isAisGodBoss) {
      setVictory(true);
      setSecretEnding('aisultanSea');
      unlockAchievement('aisultanSea');
      setAisGateOpen(false);
      setAisWorldEntered(false);
      setAisSharkFightStarted(false);
      setAisFinalChoiceOpen(false);
      setAisGodFightStarted(false);
      setChapter(dragonSons.length + 1);
      addGold(10_000_000);
      setMessage('Воденой мир открыт: бог моря Айсултан побежден.');
      navigate('/world');
      return;
    }

    if (isAdminWorldBosses) {
      setAdminWorldBossesStarted(false);
      setAdminFinalChoiceOpen(true);
      setMessage('Все боссы концовок побеждены. На экране надпись: ты готов или не готов сразиться с админом?');
      navigate('/world');
      return;
    }

    if (isAdminBoss) {
      setVictory(true);
      setSecretEnding('adminImpossible');
      unlockAchievement('adminImpossible');
      setAdminWorldGateOpen(false);
      setAdminWorldEntered(false);
      setAdminWorldBossesStarted(false);
      setAdminFinalChoiceOpen(false);
      setAdminBossFightStarted(false);
      setChapter(dragonSons.length + 1);
      addGold(100_000_000);
      setMessage('Концовка открыта: это невозможно пройти. Герой убил админа и стал уж слишком сильным.');
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

    if (isFinalSpiritBoss) {
      setFinalSpiritWorldOpen(false);
      setFinalSpiritMonstersLeft(finalSpiritMonsterTotal);
      setFinalSpiritFightStarted(false);
      setDeathGodFightStarted(true);
      setEnemyHp(deathGodHp);
      setHeroHp(currentHeroMaxHp);
      setMessage(`Души финального босса умерли. Из ада вышел Король ада: ${formatPower(deathGodHp)} HP.`);
      navigate('/');
      return;
    }

    if (isFinalBoss) {
      if (Math.random() >= 0.1) {
        setVictory(true);
        setChapter(dragonSons.length + 1);
        setHeroHp(currentHeroMaxHp);
        setMessage('Финальный босс побежден. Душа короля драконов не появилась: шанс был 10%. Открылся финальный выбор.');
        navigate('/world');
        return;
      }
      setFinalSpiritWorldOpen(true);
      setFinalSpiritFightStarted(false);
      setFinalSpiritMonstersLeft(finalSpiritMonsterTotal);
      setEnemyHp(finalSpiritDragonHp);
      setHeroHp(currentHeroMaxHp);
      setMessage(`Финальный босс побежден. Сработал шанс 10%: открылся подземный мир. Сначала победи ${formatPower(finalSpiritMonsterTotal)} темных монстров, потом появятся души.`);
      navigate('/');
      return;
    }

    const clearedCity = `${enemy.city}, ${enemy.country}`;
    const nextSavedCities = savedCities.includes(clearedCity) ? savedCities : [...savedCities, clearedCity];
    const prize = reward;
    const droppedWeapon = rollWeapon(1, chapter + 1);
    const droppedArmor = rollArmor(1, chapter + 1);

    if (chapter === 4 && Math.random() < 0.4) {
      setMonsterAvalancheEntered(true);
      setMonsterAvalancheLeft(monsterAvalancheTotal);
      setHeroHp(currentHeroMaxHp);
      setMessage('5-й дракон умер, и с шансом 40% открылся 5 мир: тебя унесло в лавину из 10 миллиардов монстров.');
      navigate('/');
      return;
    }

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
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (isTyping) return;
      const key = event.key.toLowerCase();
      const code = event.code.toLowerCase();
      if (['w', 'a', 's', 'd', 'shift', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key) || ['keyw', 'keya', 'keys', 'keyd', 'shiftleft', 'shiftright'].includes(code)) {
        pressedKeys.current.add(key);
        pressedKeys.current.add(code);
        event.preventDefault();
      }
      if (event.code === 'Space' && verticalVelocity.current === 0) {
        verticalVelocity.current = 24;
        playHeroAnimation('step', 360);
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      pressedKeys.current.delete(event.key.toLowerCase());
      pressedKeys.current.delete(event.code.toLowerCase());
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    function onAttackKey(event: KeyboardEvent) {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (event.repeat || isTyping || event.code !== 'KeyF') return;
      event.preventDefault();
      if (currentMonsters > 0) fightMonster();
      else strike();
    }

    window.addEventListener('keydown', onAttackKey);
    return () => window.removeEventListener('keydown', onAttackKey);
  }, [currentMonsters, heroHp, heroPosition, enemyHp, equippedWeapon, equippedArtifactId, items, shopLevels]);

  useEffect(() => {
    setMonsterAttackCount(0);
    monsterChaseStartedAt.current = Date.now();
    setNearestMonster(currentMonsters > 0 ? makeNearestMonsterSpawn(currentMonsterHp) : { ...nearestMonsterRef.current, hp: 0, alive: false });
  }, [chapter, currentMonsters]);

  useEffect(() => {
    nearestMonsterRef.current = nearestMonster;
  }, [nearestMonster]);

  useEffect(() => {
    const chaseTimer = window.setInterval(() => {
      setNearestMonster((monster) => {
        if (!monster.alive || currentMonsters <= 0 || heroHp <= 0 || isFinalReveal) return monster;
        const dx = heroPosition.x - monster.x;
        const dz = heroPosition.z - monster.z;
        const distance = Math.hypot(dx, dz);
        const stopDistance = meleeRangeUnits * 0.92;
        if (distance > monsterAggroDistanceUnits || distance <= stopDistance) return monster;
        const step = Math.min(distance - stopDistance, monsterRunSpeedPerSecond * 0.04);
        const length = Math.max(1, distance);
        return moveMonsterAroundObjects(monster, (dx / length) * step, (dz / length) * step);
      });
    }, 40);

    return () => window.clearInterval(chaseTimer);
  }, [currentMonsters, heroHp, heroPosition, isFinalReveal]);

  useEffect(() => {
    monsterBotRef.current = {
      chapter,
      currentMonsters,
      currentMonsterTotal,
      defenseBonus,
      hasAdminHelmet,
      heroHp,
      heroPosition,
      isFinalReveal,
      nearestMonsterInAggro,
      nearestMonsterInPressure,
      nearestMonsterInRange,
    };
  }, [chapter, currentMonsters, currentMonsterTotal, defenseBonus, hasAdminHelmet, heroHp, heroPosition, isFinalReveal, nearestMonsterInAggro, nearestMonsterInPressure, nearestMonsterInRange]);

  useEffect(() => {
    const attackTimer = window.setInterval(() => {
      const state = monsterBotRef.current;
      if (state.isFinalReveal || state.currentMonsters <= 0 || state.heroHp <= 0 || state.hasAdminHelmet) return;
      if (!state.nearestMonsterInAggro) return;
      if (Date.now() - monsterChaseStartedAt.current < monsterChaseCatchTimeMs) return;
      if (!state.nearestMonsterInRange) return;

      const hunterBots = Math.max(1, Math.ceil(Math.min(state.currentMonsters, state.currentMonsterTotal) / Math.max(1, state.currentMonsterTotal / 10)));
      const rawDamage = Math.ceil(monsterBotAttackDamage + state.chapter * 4 + hunterBots * 3);
      const damage = Math.max(1, rawDamage - Math.floor(state.defenseBonus * 0.08));
      setBattlePulse((pulse) => pulse + 1);
      setMonsterAttackCount((count) => count + 1);
      setHeroHp((hp) => {
        const nextHp = Math.max(0, hp - damage);
        if (nextHp === 0) {
          setMessage(`${formatPower(hunterBots)} гоблинов добежали до радиуса ${meleeRangeMeters}м и нанесли ${formatPower(damage)} урона. Герой упал, восстанови HP.`);
        }
        return nextHp;
      });
    }, monsterBotAttackCooldownMs);

    return () => window.clearInterval(attackTimer);
  }, []);

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

  useEffect(() => {
    if (!isClickDuelActive) {
      setClickDuelPower(50);
      setClicksPerSecond(0);
      clickTimesRef.current = [];
      return;
    }

    const duelTimer = window.setInterval(() => {
      const now = Date.now();
      clickTimesRef.current = clickTimesRef.current.filter((time) => now - time < 1000);
      setClicksPerSecond(clickTimesRef.current.length);
      setClickDuelPower((power) => Math.max(0, power - Math.max(0.18, (enemy?.attackSpeed ?? 1) * 0.42)));
    }, 180);

    return () => window.clearInterval(duelTimer);
  }, [isClickDuelActive, enemy?.attackSpeed]);

  useEffect(() => {
    if (!hasArcaneWeapon || arcaneSkillRemainingMs === 0) return;
    const cooldownTimer = window.setInterval(() => {
      setArcaneCooldownNow(Date.now());
    }, 250);

    return () => window.clearInterval(cooldownTimer);
  }, [hasArcaneWeapon, arcaneSkillRemainingMs]);

  useEffect(() => {
    const manaTimer = window.setInterval(() => {
      setHeroMana((mana) => Math.min(currentHeroMaxMana, mana + 2));
    }, 1000);

    return () => window.clearInterval(manaTimer);
  }, [currentHeroMaxMana]);

  useEffect(() => {
    setHeroMana((mana) => Math.min(currentHeroMaxMana, mana));
  }, [currentHeroMaxMana]);

  function castArcaneSkill() {
    if (!hasArcaneWeapon || isFinalReveal || !enemy || !arcaneSkillReady) return;
    playHeroAnimation('cast', 760);
    setBattlePulse((pulse) => pulse + 1);
    setArcanePulse((pulse) => pulse + 1);
    if (selectedSpell.targets >= 8 || selectedSpell.power >= 12) setArcaneBurstPulse((pulse) => pulse + 1);
    setHeroMana((mana) => Math.max(0, mana - arcaneSkillManaCost));
    setArcaneSkillReadyAt(Date.now() + arcaneSkillCooldownMs);
    setArcaneCooldownNow(Date.now());

    if (currentMonsters > 0) {
      const radiusBonusKills = Math.floor(selectedSpellRadiusMeters / 10);
      const speedBonusKills = Math.floor(selectedSpellSpeedKmh / 10);
      const spellKills = Math.min(currentMonsters, Math.max(1, selectedSpell.targets + radiusBonusKills + speedBonusKills + Math.floor(arcaneSkillDamage / Math.max(1, currentMonsterHp * 2))));
      const nextMonsters = Math.max(0, currentMonsters - spellKills);
      setCurrentMonsterCount(nextMonsters);
      setNearestMonster(nextMonsters > 0 ? makeNearestMonsterSpawn(currentMonsterHp) : { ...nearestMonsterRef.current, hp: 0, alive: false });
      addGold(spellKills * Math.max(2, chapter + 1));
      const streakRewardText = addWinStreak(`${selectedSpell.name} x${spellKills}`);
      if (nextMonsters === 0) {
        setEnemyHp(currentDragonHp);
        setMessage(`${selectedSpell.name}: магия уничтожила ${formatPower(spellKills)} монстров. Теперь появился босс: ${formatPower(currentDragonHp)} HP.${streakRewardText ? ` ${streakRewardText}` : ''}`);
        return;
      }
      setMessage(`${selectedSpell.name}: радиус ${selectedSpellRadiusMeters}м, скорость ${selectedSpellSpeedKmh} км/ч, уничтожено ${formatPower(spellKills)} монстров. Осталось ${formatPower(nextMonsters)}. Мана -${arcaneSkillManaCost}.${streakRewardText ? ` ${streakRewardText}` : ''}`);
      return;
    }

    if (enemyHp <= 0) return;
    const nextEnemyHp = Math.max(0, enemyHp - arcaneSkillDamage);
    setEnemyHp(nextEnemyHp);
    if (nextEnemyHp === 0) {
      setMessage(`${selectedSpell.name}: -${formatPower(arcaneSkillDamage)} HP. Враг уничтожен.`);
      clearCity();
      return;
    }
    setMessage(`${selectedSpell.name}: радиус ${selectedSpellRadiusMeters}м, скорость ${selectedSpellSpeedKmh} км/ч, удар -${formatPower(arcaneSkillDamage)} HP. Мана -${arcaneSkillManaCost}, перезарядка ${Math.ceil(arcaneSkillCooldownMs / 1000)} сек.`);
  }

  function strike() {
    if (isFinalReveal || !enemy) return;
    if (currentMonsters > 0) {
      setMessage(`Сначала победи всех монстров. Осталось: ${formatPower(currentMonsters)}.`);
      return;
    }
    playHeroAnimation('strike', 420);
    setBattlePulse((pulse) => pulse + 1);
    const clickNow = Date.now();
    clickTimesRef.current = [...clickTimesRef.current.filter((time) => clickNow - time < 1000), clickNow];
    setClicksPerSecond(clickTimesRef.current.length);
    setClickDuelPower((power) => {
      const powerRatio = Math.log10(clickDuelHeroPower + 10) / Math.max(1, Math.log10(clickDuelDragonPower + 10));
      return Math.min(100, power + 4.5 + powerRatio * 9);
    });
    if (isBbiLegendaryWeapon(equippedWeapon)) {
      setFireWavePulse((pulse) => pulse + 1);
      setEnemyBurning(true);
    }
    if (isAisultanSword(equippedWeapon)) {
      setWaterWavePulse((pulse) => pulse + 1);
    }
    if (hasArcaneWeapon) {
      setArcanePulse((pulse) => pulse + 1);
    }
    if (isDeathSword(equippedWeapon)) {
      const soulDamage = Math.max(1, Math.floor(enemyHp * 0.66));
      const soulHeal = Math.max(1, Math.floor(enemyHp * 0.01));
      const nextEnemyHp = Math.max(0, enemyHp - soulDamage);
      setSoulFirePulse((pulse) => pulse + 1);
      setHeroHp((hp) => Math.min(currentHeroMaxHp, hp + soulHeal));
      setEnemyHp(nextEnemyHp);
      if (nextEnemyHp === 0) {
        setMessage(`Меч смерти выпустил огонь души, забрал 66% души и украл ${formatPower(soulHeal)} HP. Враг уничтожен.`);
        clearCity();
        return;
      }
      setMessage(`Меч смерти выпустил огонь души: -${formatPower(soulDamage)} HP врагу, герой забрал себе ${formatPower(soulHeal)} HP.`);
      return;
    }
    if (isAdminNuke(equippedWeapon)) {
      setNukePulse((pulse) => pulse + 1);
      setEnemyHp(0);
      setMessage(`Админская ядерка ударила силой ${adminNukeDamageText} и уничтожила ${isBbiBoss ? 'босса' : 'дракона'} сразу.`);
      clearCity();
      return;
    }

    const manaDamage = upgradePower(shopLevels.mana, shopBasePower.mana);
    const arcaneSwingDamage = hasArcaneWeapon ? Math.max(1, Math.floor(equippedWeaponDamage * 1.35)) : 0;
    const heroDamage = Math.floor((18 + chapter * 5 + attackBonus + manaDamage + arcaneSwingDamage) * artifactDamageMultiplier * artifactAttackSpeedMultiplier);
    const nextEnemyHp = Math.max(0, enemyHp - heroDamage);

    if (nextEnemyHp === 0) {
      setEnemyHp(0);
      clearCity();
      return;
    }

    setEnemyHp(nextEnemyHp);

    setMessage(`Удар по ${isBbiBoss ? 'боссу' : 'дракону'}: -${formatPower(heroDamage)} HP. Осталось ${formatPower(nextEnemyHp)} HP. Реакция: ${dragonReaction}.`);
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
      navigate('/world');
      return;
    }

    if (code === 'anuar') {
      setAnuarGateOpen(true);
      setAnuarWorldEntered(false);
      setAnuarBombsLeft(anuarBombEnemiesTotal);
      setAnuarKingFightStarted(false);
      setAdminCode('');
      setMessage('Код Anuar открыл секретный мир города бомб. Выбери: войти или выйти.');
      navigate('/world');
      return;
    }

    if (code === 'mansur') {
      setMansurGateOpen(true);
      setMansurDungeonEntered(false);
      setMansurMonstersLeft(mansurDungeonEnemiesTotal);
      setMansurKingFightStarted(false);
      setAdminCode('');
      setMessage('Код mansur открыл секретное подземелье Мансура для братишки.');
      navigate('/world');
      return;
    }

    if (code === 'nurali2281') {
      setNuraliGateOpen(true);
      setNuraliWorldEntered(false);
      setNuraliMonstersLeft(nuraliMonsterTotal);
      setNuraliChoiceOpen(false);
      setNuraliBossFightStarted(false);
      setAdminCode('');
      setMessage('Код nurali2281 открыл новый мир Нурали. Выбери: войти или выйти.');
      navigate('/world');
      return;
    }

    if (code === 'arailm' || code === 'arailym') {
      openArailmWorld();
      return;
    }

    if (code === 'ais228198') {
      setAisGateOpen(true);
      setAisWorldEntered(false);
      setAisMonstersLeft(aisultanMonsterTotal);
      setAisSharkFightStarted(false);
      setAisFinalChoiceOpen(false);
      setAisGodFightStarted(false);
      setAdminCode('');
      setMessage('Код ais228198 открыл 10 мир: водный мир Айсултана. Выбери: войти или выйти.');
      navigate('/world');
      return;
    }

    if (code === 'magic') {
      const arcaneWeapon = createArcaneScepter(Math.max(3, chapter + 3));
      setWeapons((currentWeapons) => [...currentWeapons, arcaneWeapon]);
      setEquippedWeapon(arcaneWeapon);
      setAdminCode('');
      setMessage(`Код magic дал ${getWeaponDisplayName(arcaneWeapon)}. Каждый взмах выпускает магию, навык дает много магии с перезарядкой.`);
      return;
    }

    if (code === 'admin2281') {
      setAdminWorldGateOpen(true);
      setAdminWorldEntered(false);
      setAdminWorldMonstersLeft(adminWorldMonsterTotal);
      setAdminWorldBossesStarted(false);
      setAdminFinalChoiceOpen(false);
      setAdminBossFightStarted(false);
      setAdminCode('');
      setMessage('Код ADMIN2281 открыл 11 мир: админская сложность.');
      navigate('/world');
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
      navigate('/world');
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
      ? 'Код ццтгкшлцц принят. Ядерка усилена до ∞, получены шлем, бесконечные деньги и множитель денег x100.'
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
    setAisGateOpen(false);
    setAisWorldEntered(false);
    setAisMonstersLeft(aisultanMonsterTotal);
    setAisSharkFightStarted(false);
    setAisFinalChoiceOpen(false);
    setAisGodFightStarted(false);
    setAdminCode('');
    setMessage(`Код arailm открыл красную программу. Войди и зачисти ${formatPower(arailmEnemiesTotal)} код-монстров.`);
    navigate('/world');
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
    const requestedId = normalizePlayerId(duelTargetId);
    setDuelTargetId(requestedId);
    if (requestedId === playerId) {
      setMessage('Это твой ID. Впиши ID другого игрока, чтобы вызвать его.');
      return;
    }
    const requestedPlayer = requestedId ? onlinePlayers.find((player) => player.id === requestedId) : null;
    if (requestedId && !requestedPlayer) {
      setMessage(`Игрок с ID ${requestedId} не найден онлайн. Если список пустой, реальных игроков в сети сейчас нет.`);
      return;
    }
    if (!requestedId && onlinePlayers.length === 0) {
      setMessage('Реальных игроков онлайн сейчас нет. Список пустой.');
      setDuelStatus('searching');
      return;
    }
    setDuelOpponent(null);
    setDuelChatMessages([]);
    setDuelStatus('searching');
    if (requestedPlayer) {
      saveDuelRequests([
        ...readDuelRequests().filter((request) => request.id !== `fight-${playerId}-${requestedPlayer.id}`),
        {
          id: `fight-${playerId}-${requestedPlayer.id}`,
          kind: 'fight',
          fromId: playerId,
          fromName: playerName,
          toId: requestedPlayer.id,
          createdAt: Date.now(),
        },
      ]);
      setDuelOpponent(requestedPlayer);
      setDuelChatMessages([
        { id: `system-${Date.now()}`, from: 'Система', text: `Чат открыт: ${playerName} ID ${playerId} и ${requestedPlayer.name} ID ${requestedPlayer.id}.` },
      ]);
      setDuelStatus('challenge');
      setMessage(`${playerName} вызвал игрока ${requestedPlayer.name} по ID ${requestedPlayer.id}. У него появятся кнопки Принять / Отвергнуть.`);
      return;
    }
    setMessage(`${playerName} ищет игроков в сети для дуэли...`);
  }

  function selectDuelPlayer(player: DuelPlayer) {
    setDuelTargetId(player.id);
    setDuelOpponent(player);
    setDuelTradeOpen(false);
    setDuelTradeOffer(null);
    setDuelStatus('challenge');
    setDuelChatMessages([
      { id: `system-${Date.now()}`, from: 'Система', text: `Выбран игрок онлайн: ${player.name} ID ${player.id}.` },
    ]);
    setMessage(`${player.name} выбран из списка онлайн игроков.`);
  }

  function closeDuelList() {
    setDuelStatus('idle');
    setDuelOpponent(null);
    setDuelTradeOpen(false);
    setDuelTradeOffer(null);
    setDuelChatMessages([]);
    setDuelChatText('');
    setMessage('Список игроков закрыт. Можно играть дальше.');
  }

  function scheduleOnlineListReturn() {
    if (onlinePlayerScrollTimer.current) {
      window.clearTimeout(onlinePlayerScrollTimer.current);
    }
    onlinePlayerScrollTimer.current = window.setTimeout(() => {
      onlinePlayerListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1600);
  }

  function declineDuel() {
    setDuelStatus('declined');
    setDuelTradeOpen(false);
    setDuelTradeOffer(null);
    setMessage('Ты отказался от дуэли. Вызов закрыт.');
  }

  function clearIncomingDuelRequest() {
    if (!incomingDuelRequest) return;
    saveDuelRequests(readDuelRequests().filter((request) => request.id !== incomingDuelRequest.id));
    setIncomingDuelRequest(null);
  }

  function acceptIncomingDuelRequest() {
    if (!incomingDuelRequest) return;
    const challenger = onlinePlayers.find((player) => player.id === incomingDuelRequest.fromId) ?? {
      id: incomingDuelRequest.fromId,
      name: incomingDuelRequest.fromName,
      power: Math.max(1_000, currentPlayerPower),
      title: 'игрок онлайн',
      weapon: makePresenceFallbackWeapon(currentPlayerPower),
      armor: makePresenceFallbackArmor(currentPlayerPower),
    };
    setDuelOpponent(challenger);
    setDuelTargetId(challenger.id);
    setDuelChatMessages([
      { id: `system-${Date.now()}`, from: 'Система', text: `${incomingDuelRequest.fromName} отправил ${incomingDuelRequest.kind === 'trade' ? 'обмен' : 'дуэль'}.` },
    ]);
    if (incomingDuelRequest.kind === 'trade') {
      setDuelStatus('challenge');
      setDuelTradeOpen(true);
      setMessage(`Обмен принят. Выбери предмет для обмена с ${challenger.name}.`);
    } else {
      setDuelStatus('fighting');
      setDuelTradeOpen(false);
      setDuelHeroHp(Math.max(currentHeroMaxHp, 1_000 + defenseBonus + attackBonus));
      setDuelOpponentHp(challenger.power * 4);
      setMessage(`Ты принял дуэль от ${challenger.name}. Бой начался на арене.`);
    }
    clearIncomingDuelRequest();
  }

  function rejectIncomingDuelRequest() {
    if (!incomingDuelRequest) return;
    const kindText = incomingDuelRequest.kind === 'trade' ? 'обмен' : 'дуэль';
    const fromName = incomingDuelRequest.fromName;
    clearIncomingDuelRequest();
    setMessage(`${kindText} от ${fromName} отвергнут.`);
  }

  function acceptDuel() {
    if (!duelOpponent) return;
    saveDuelRequests([
      ...readDuelRequests().filter((request) => request.id !== `fight-${playerId}-${duelOpponent.id}`),
      {
        id: `fight-${playerId}-${duelOpponent.id}`,
        kind: 'fight',
        fromId: playerId,
        fromName: playerName,
        toId: duelOpponent.id,
        createdAt: Date.now(),
      },
    ]);
    setDuelStatus('fighting');
    setDuelTradeOpen(false);
    setDuelTradeOffer(null);
    setDuelHeroHp(Math.max(currentHeroMaxHp, 1_000 + defenseBonus + attackBonus));
    setDuelOpponentHp(duelOpponent.power * 4);
    setBattlePulse((pulse) => pulse + 1);
    playHeroAnimation('strike', 500);
    setMessage(`Дуэль началась: ${playerName} против ${duelOpponent.name}. Бей соперника кнопкой удара.`);
  }

  function duelHit() {
    if (!duelOpponent || duelStatus !== 'fighting') return;

    const heroDuelDamage = Math.max(50, Math.floor((attackBonus + 100 + weapons.length * 30) * artifactDamageMultiplier));
    const opponentDuelDamage = Math.max(1, Math.floor(duelOpponent.power / 12 - defenseBonus));
    const nextOpponentHp = Math.max(0, duelOpponentHp - heroDuelDamage);
    setBattlePulse((pulse) => pulse + 1);
    playHeroAnimation('strike', 420);
    setDuelOpponentHp(nextOpponentHp);

    if (nextOpponentHp === 0) {
      const duelReward = Math.min(Number.MAX_SAFE_INTEGER, Math.max(1_000, 1_000 + Math.floor(duelOpponent.power / 10)));
      setDuelWins((wins) => wins + 1);
      addGold(duelReward);
      const streakRewardText = addWinStreak('дуэль выиграна');
      setDuelStatus('won');
      setMessage(`${playerName} победил ${duelOpponent.name} в настоящей дуэли. Награда: ${formatPower(duelReward)} золота. ${streakRewardText}`);
      return;
    }

    const nextHeroDuelHp = Math.max(0, duelHeroHp - opponentDuelDamage);
    setDuelHeroHp(nextHeroDuelHp);
    if (nextHeroDuelHp === 0) {
      setDuelStatus('declined');
      resetWinStreak('поражение в дуэли');
      setMessage(`${duelOpponent.name} победил в дуэли. Можно найти другого игрока.`);
      return;
    }

    setMessage(`${playerName} ударил: -${formatPower(heroDuelDamage)} HP. ${duelOpponent.name} ответил: -${formatPower(opponentDuelDamage)} HP.`);
  }

  function rejectDuelTrade() {
    setDuelTradeOffer(null);
    setDuelTradeOpen(false);
    setMessage('Обмен отвергнут.');
  }

  function acceptDuelTrade() {
    if (!duelOpponent || !duelTradeOffer) {
      setMessage('Сначала выбери предмет для обмена.');
      return;
    }

    if (duelTradeOffer.kind === 'weapon') {
      const offeredWeapon = duelTradeOffer.item;
      const receivedWeapon = { ...duelOpponent.weapon, id: `${duelOpponent.weapon.id}-${Date.now()}` };
      setWeapons((currentWeapons) => [...currentWeapons.filter((weapon) => weapon.id !== offeredWeapon.id), receivedWeapon]);
      if (equippedWeapon?.id === offeredWeapon.id) setEquippedWeapon(receivedWeapon);
      setDuelTradeOffer(null);
      setDuelTradeOpen(false);
      setMessage(`Обмен принят: ты отдал ${getWeaponDisplayName(offeredWeapon)} и получил ${getWeaponDisplayName(receivedWeapon)} от ${duelOpponent.name}.`);
      return;
    }

    const offeredArmor = duelTradeOffer.item;
    const receivedArmor = { ...duelOpponent.armor, id: `${duelOpponent.armor.id}-${Date.now()}` };
    setArmors((currentArmors) => [...currentArmors.filter((armor) => armor.id !== offeredArmor.id), receivedArmor]);
    if (equippedArmor?.id === offeredArmor.id) setEquippedArmor(receivedArmor);
    setDuelTradeOffer(null);
    setDuelTradeOpen(false);
    setMessage(`Обмен принят: ты отдал ${offeredArmor.name} и получил ${receivedArmor.name} от ${duelOpponent.name}.`);
  }

  function openDuelTrade() {
    if (!duelOpponent) {
      setMessage('Сначала найди игрока для обмена.');
      return;
    }
    saveDuelRequests([
      ...readDuelRequests().filter((request) => request.id !== `trade-${playerId}-${duelOpponent.id}`),
      {
        id: `trade-${playerId}-${duelOpponent.id}`,
        kind: 'trade',
        fromId: playerId,
        fromName: playerName,
        toId: duelOpponent.id,
        createdAt: Date.now(),
      },
    ]);
    setDuelTradeOpen((open) => !open);
    setDuelTradeOffer(null);
    setMessage(`Игроку ${duelOpponent.name} отправлена надпись: Обмен или нет.`);
  }

  function sendDuelChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!duelOpponent) {
      setMessage('Сначала найди игрока по ID или нажми дуэль.');
      return;
    }
    const text = duelChatText.trim();
    if (!text) return;

    setDuelChatMessages((messages) => [
      ...messages,
      { id: `you-${Date.now()}`, from: `${playerName} ID ${playerId}`, text },
    ].slice(-12));
    setDuelChatText('');
  }

  useEffect(() => {
    if (duelStatus !== 'searching') return;
    if (onlinePlayers.length === 0) return;

    const searchTimer = window.setTimeout(() => {
      const player = onlinePlayers[(duelWins + chapter + weapons.length + armors.length) % onlinePlayers.length];
      setDuelOpponent(player);
      setDuelChatMessages([
        { id: `system-${Date.now()}`, from: 'Система', text: `Найден игрок ${player.name} ID ${player.id}.` },
      ]);
      setDuelStatus('challenge');
      setMessage(`${player.name} найден в сети. ID ${player.id}. Он кинул вызов на дуэль.`);
    }, 1100);

    return () => window.clearTimeout(searchTimer);
  }, [armors.length, chapter, duelStatus, duelWins, onlinePlayers, weapons.length]);

  useEffect(() => {
    window.localStorage.setItem('hero-nickname', playerName);
  }, [playerName]);

  useEffect(() => {
    if (!authUser && !guestMode) return;

    const presence: OnlinePresence = {
      id: playerId,
      name: playerName,
      power: currentPlayerPower,
      weapon: equippedWeapon,
      armor: equippedArmor,
      updatedAt: Date.now(),
    };
    const rememberPlayers = (players: OnlinePresence[]) => {
      setLeaderboardPlayers(saveLeaderboardPresences([
        ...readLeaderboardPresences(),
        ...players,
        {
          ...presence,
          updatedAt: Date.now(),
        },
      ]));
    };

    rememberPlayers([]);

    if (isSupabaseConfigured && !guestMode) {
      const channel = supabase.channel('dragon-game-online-presence', {
        config: {
          presence: {
            key: playerId,
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const realtimePresences = readRealtimePresenceEntries(channel.presenceState());
          setOnlinePlayers(realtimePresences
            .filter((player) => player.id !== playerId)
            .map(toDuelPlayer));
          rememberPlayers(realtimePresences);
        })
        .subscribe(async (status) => {
          if (status !== 'SUBSCRIBED') return;
          await channel.track({
            ...presence,
            updatedAt: Date.now(),
          });
        });

      return () => {
        channel.untrack();
        supabase.removeChannel(channel);
      };
    }

    function refreshOnlinePlayers() {
      const onlinePresences = readOnlinePresences();
      setOnlinePlayers(onlinePresences
        .filter((player) => player.id !== playerId)
        .map(toDuelPlayer));
      rememberPlayers(onlinePresences);
    }

    function writePresence() {
      const others = readOnlinePresences().filter((player) => player.id !== playerId);
      window.localStorage.setItem(presenceStorageKey, JSON.stringify([
        ...others,
        {
          ...presence,
          updatedAt: Date.now(),
        },
      ]));
      refreshOnlinePlayers();
    }

    writePresence();
    const interval = window.setInterval(writePresence, 5_000);
    const onStorage = (event: StorageEvent) => {
      if (event.key === presenceStorageKey) refreshOnlinePlayers();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', onStorage);
    };
  }, [authUser, currentPlayerPower, equippedArmor, equippedWeapon, guestMode, playerId, playerName]);

  useEffect(() => {
    const refreshDuelRequests = () => {
      const requests = readDuelRequests();
      saveDuelRequests(requests);
      setIncomingDuelRequest(requests.find((request) => request.toId === playerId && request.fromId !== playerId) ?? null);
    };

    refreshDuelRequests();
    const interval = window.setInterval(refreshDuelRequests, 1_500);
    const onStorage = (event: StorageEvent) => {
      if (event.key === duelRequestsStorageKey) refreshDuelRequests();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', onStorage);
    };
  }, [playerId]);

  function restart() {
    window.localStorage.removeItem(gameSaveStorageKey);
    const avalancheCompleted = unlockedAchievements.includes('monsterAvalanche');
    setChapter(avalancheCompleted ? monsterAvalancheStartChapter : 0);
    setHealthLevel(0);
    setHeroHp(heroMaxHp);
    setEnemyHp(avalancheCompleted ? scaledDragonPower(baseDragonHp, monsterAvalancheStartChapter) : baseDragonHp);
    setMessage(avalancheCompleted ? 'После концовки лавины новый поход начинается сразу с 8-го города.' : 'Мир снова в огне. Начинается новый поход за спасение городов.');
    setSavedCities(avalancheCompleted ? dragonSons.slice(0, monsterAvalancheStartChapter).map((city) => `${city.city}, ${city.country}`) : []);
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
    setAisGateOpen(false);
    setAisWorldEntered(false);
    setAisMonstersLeft(aisultanMonsterTotal);
    setAisSharkFightStarted(false);
    setAisFinalChoiceOpen(false);
    setAisGodFightStarted(false);
    setAdminWorldGateOpen(false);
    setAdminWorldEntered(false);
    setAdminWorldMonstersLeft(adminWorldMonsterTotal);
    setAdminWorldBossesStarted(false);
    setAdminFinalChoiceOpen(false);
    setAdminBossFightStarted(false);
    setBbiGateOpen(false);
    setBbiWorldEntered(false);
    setBbiMonstersLeft(bbiMonsterTotal);
    setBbiBossStage(null);
    setBbiFinalChoiceOpen(false);
    setBbiCityReward(false);
    setBbiBadEnding(false);
    setNuraliGateOpen(false);
    setNuraliWorldEntered(false);
    setNuraliMonstersLeft(nuraliMonsterTotal);
    setNuraliChoiceOpen(false);
    setNuraliBossFightStarted(false);
    setMonsterAvalancheEntered(false);
    setMonsterAvalancheLeft(monsterAvalancheTotal);
    setMonsterAvalancheEnding(false);
    setFinalSpiritWorldOpen(false);
    setFinalSpiritMonstersLeft(finalSpiritMonsterTotal);
    setFinalSpiritFightStarted(false);
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
    setHeroAnimation('idle');
    setHeroPosition({ x: -18_000, z: 0 });
    setHeroHeight(0);
    verticalVelocity.current = 0;
    setCityMonsters(dragonSons.map((_, index) => avalancheCompleted && index < monsterAvalancheStartChapter ? 0 : monstersPerCity));
    setMonsterAttackCount(0);
    setBattlePulse(0);
    setFireWavePulse(0);
    setWaterWavePulse(0);
    setEnemyBurning(false);
    setDuelStatus('idle');
    setDuelOpponent(null);
    setDuelWins(0);
    setDuelHeroHp(0);
    setDuelOpponentHp(0);
    setDuelTradeOpen(false);
    setDuelChatMessages([]);
    setDuelChatText('');
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

    const email = authEmail.trim();
    const password = authPassword.trim();
    if (!email || !password) {
      setAuthMessage('Напиши почту и пароль.');
      return;
    }
    if (password.length < 6) {
      setAuthMessage('Пароль должен быть минимум 6 символов.');
      return;
    }

    setAuthBusy(true);
    setAuthMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthMessage(error.message);
      } else if (data.user) {
        window.localStorage.removeItem('dragon-game-guest-mode');
        setGuestMode(false);
        setAuthUser(data.user);
        setAuthMessage('');
        setMessage('Ты вошел в аккаунт.');
      }
    } catch {
      setAuthMessage('Не получилось войти. Проверь интернет и попробуй еще раз.');
    } finally {
      setAuthBusy(false);
    }
  }

  async function createAccount() {
    if (!isSupabaseConfigured) {
      setAuthMessage('Supabase не настроен в .env');
      return;
    }

    const email = authEmail.trim();
    const password = authPassword.trim();
    if (!email || !password) {
      setAuthMessage('Напиши почту и пароль для регистрации.');
      return;
    }
    if (password.length < 6) {
      setAuthMessage('Пароль должен быть минимум 6 символов.');
      return;
    }

    setAuthBusy(true);
    setAuthMessage('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });

      if (error) {
        setAuthMessage(error.message);
      } else if (data.session && data.user) {
        window.localStorage.removeItem('dragon-game-guest-mode');
        setGuestMode(false);
        setAuthUser(data.user);
        setAuthMessage('');
        setMessage('Аккаунт создан. Ты вошел в игру.');
      } else {
        setAuthMessage('Аккаунт создан. Если Supabase попросит, подтверди почту и потом нажми Войти.');
      }
    } catch {
      setAuthMessage('Не получилось создать аккаунт. Проверь интернет и попробуй еще раз.');
    } finally {
      setAuthBusy(false);
    }
  }

  async function signInWithGoogle() {
    if (!isSupabaseConfigured) {
      setAuthMessage('Supabase не настроен в .env');
      return;
    }

    setAuthBusy(true);
    setAuthMessage('Открываю вход Google...');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        setAuthMessage(error.message);
        setAuthBusy(false);
        return;
      }

      if (data.url) {
        window.location.assign(data.url);
        return;
      }

      setAuthMessage('Google не вернул ссылку входа. Проверь настройки Google OAuth в Supabase.');
    } catch {
      setAuthMessage('Не получилось открыть Google. Проверь интернет и настройки Supabase.');
    } finally {
      setAuthBusy(false);
    }
  }

  if (!authUser && !guestMode) {
    return (
      <main className="landing-page">
        <section className="landing-hero" aria-label="Вход в игру">
          <div className="landing-copy">
            <p className="landing-kicker">3D RPG battle game</p>
            <h1>Меч против сыновей дракона</h1>
            <p>
              Спасай города, бей монстров, выбивай оружие и сражайся с драконами,
              которые становятся сильнее после каждой победы.
            </p>
            <div className="landing-features">
              <span>1000 монстров в городе</span>
              <span>Редкое оружие и броня</span>
              <span>Пещеры, боссы и концовки</span>
            </div>
          </div>

          <div className="landing-auth">
            <h2>Войти в игру</h2>
            <button className="google-button" onClick={signInWithGoogle} disabled={authBusy} type="button">
              <span>G</span>
              Войти через аккаунт
            </button>
            <div className="auth-divider">или почта</div>
            <form className="landing-form" onSubmit={submitLogin}>
              <input
                aria-label="Почта"
                onChange={(event) => setAuthEmail(event.target.value)}
                placeholder="почта"
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

  if (creatorCreditsOpen) {
    return (
      <main className="creator-credits-page" aria-label="Создатель">
        <section className="creator-credits">
          <div className="creator-scroll">
            <p>Все концовки пройдены</p>
            <h1>Спасибо за игру</h1>
            <p>Помогавшие в разработке</p>
            <strong>Нурали</strong>
            <strong>Айсултан</strong>
            <strong>Мансур</strong>
            <strong>Арайлым</strong>
            <strong>Ануар</strong>
            <strong>Димаш</strong>
            <strong>Нурдаулет</strong>
            <p>Эти люди и мои учителя по поаити лагерю помогали, вдохновляли и были рядом.</p>
            <p>Примечание: создатель создал игру за 4 дня.</p>
            <h2>Нурдаулет</h2>
            <h3>создатель</h3>
          </div>
          <button onClick={() => {
            setCreatorCreditsOpen(false);
            navigate('/achievements');
          }} type="button">
            Выйти
          </button>
        </section>
      </main>
    );
  }

  const incomingRequestPlayer = incomingDuelRequest
    ? onlinePlayers.find((player) => player.id === incomingDuelRequest.fromId) ?? {
      id: incomingDuelRequest.fromId,
      name: incomingDuelRequest.fromName,
      power: Math.max(1_000, currentPlayerPower),
      title: 'игрок онлайн',
      weapon: makePresenceFallbackWeapon(currentPlayerPower),
      armor: makePresenceFallbackArmor(currentPlayerPower),
    }
    : null;

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
          <button
            className="creator-button"
            disabled={!allAchievementsUnlocked}
            onClick={() => setCreatorCreditsOpen(true)}
            type="button"
          >
            Показать создателя
          </button>
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

  if (nuraliGateOpen && !nuraliWorldEntered && !nuraliChoiceOpen && !nuraliBossFightStarted) {
    return (
      <main className="nurali-choice-page">
        <section className="cave-choice nurali-choice" aria-label="Новый мир Нурали">
          <p className="intro-kicker">Код nurali2281</p>
          <h1>Новый мир Нурали</h1>
          <p>
            На фоне появился дом с красной крышей и зеленым двором.
            Внутри ждут {formatPower(nuraliMonsterTotal)} монстров.
          </p>
          <p>
            У каждого монстра {formatPower(nuraliMonsterHp)} HP. После победы над всеми
            появится надпись: драться с Нурали или нет.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setNuraliWorldEntered(true);
              setNuraliMonstersLeft(nuraliMonsterTotal);
              setMessage(`Ты вошел в мир Нурали. Внутри ${formatPower(nuraliMonsterTotal)} монстров по ${formatPower(nuraliMonsterHp)} HP.`);
              navigate('/');
            }} type="button">
              Войти
            </button>
            <button className="secondary" onClick={() => {
              setNuraliGateOpen(false);
              setMessage('Ты вышел из мира Нурали.');
              navigate('/');
            }} type="button">
              Выйти
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (nuraliChoiceOpen) {
    return (
      <main className="nurali-choice-page final">
        <section className="cave-choice nurali-choice" aria-label="Выбор Нурали">
          <p className="intro-kicker">100 монстров побеждены</p>
          <h1>Драться с Нурали?</h1>
          <p>
            После смерти 100 монстров на весь экран вышла надпись: драться с Нурали или нет.
          </p>
          <p>
            Нурали главный босс. У него {formatPower(nuraliBossHp)} HP.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setNuraliChoiceOpen(false);
              setNuraliBossFightStarted(true);
              setEnemyHp(nuraliBossHp);
              setMessage(`Нурали вышел на бой. HP босса: ${formatPower(nuraliBossHp)}.`);
              navigate('/');
            }} type="button">
              Драться
            </button>
            <button className="secondary" onClick={() => {
              setNuraliChoiceOpen(false);
              setNuraliGateOpen(false);
              setMessage('Ты отказался драться с Нурали. Новый мир закрылся.');
              navigate('/');
            }} type="button">
              Нет
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (aisGateOpen && !aisWorldEntered && !aisSharkFightStarted && !aisFinalChoiceOpen && !aisGodFightStarted) {
    return (
      <main className="ais-choice-page">
        <section className="cave-choice ais-choice" aria-label="10 водный мир ais228198">
          <p className="intro-kicker">Код ais228198</p>
          <h1>10 мир: водный мир</h1>
          <p>
            Открылся океанский фон. Внутри {formatPower(aisultanMonsterTotal)}
            рыб-монстров, у каждого {formatPower(aisultanMonsterHp)} HP.
          </p>
          <p>
            После смерти монстров выйдет промежуточный босс Акула с HP в 10 раз больше.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setAisWorldEntered(true);
              setAisMonstersLeft(aisultanMonsterTotal);
              setMessage(`Ты вошел в 10 водный мир. Внутри ${formatPower(aisultanMonsterTotal)} рыб-монстров по ${formatPower(aisultanMonsterHp)} HP.`);
              navigate('/');
            }} type="button">
              Войти
            </button>
            <button className="secondary" onClick={() => {
              setAisGateOpen(false);
              setMessage('Ты вышел из 10 водного мира.');
              navigate('/');
            }} type="button">
              Выйти
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (aisFinalChoiceOpen) {
    return (
      <main className="ais-choice-page final">
        <section className="cave-choice ais-choice" aria-label="Выбор бога моря Айсултана">
          <p className="intro-kicker">Акула побеждена</p>
          <h1>Сразиться с богом моря Айсултаном?</h1>
          <p>
            Если победишь, получишь концовку: воденой мир.
          </p>
          <p>
            Если откажешься, тебя отправит в 6 город и даст меч сильнее твоего лучшего оружия на 100000%.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setAisFinalChoiceOpen(false);
              setAisGodFightStarted(true);
              setEnemyHp(aisultanSeaGodHp);
              setMessage(`Бог моря Айсултан вышел на бой. HP: ${formatPower(aisultanSeaGodHp)}.`);
              navigate('/');
            }} type="button">
              Да
            </button>
            <button className="secondary" onClick={() => {
              const bestDamage = Math.max(1, ...weapons.map((weapon) => weapon.damage));
              const seaSword = createAisultanSword(bestDamage);
              setAisFinalChoiceOpen(false);
              setAisGateOpen(false);
              setWeapons((currentWeapons) => [...currentWeapons, seaSword]);
              setEquippedWeapon(seaSword);
              setSavedCities(dragonSons.slice(0, 5).map((city) => `${city.city}, ${city.country}`));
              setChapter(5);
              setEnemyHp(scaledDragonPower(baseDragonHp, 5));
              setMessage('Ты отказался сражаться с Айсултаном. Перенос в 6 город: получен воденой меч сильнее лучшего оружия на 100000%.');
              navigate('/');
            }} type="button">
              Нет
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (adminWorldGateOpen && !adminWorldEntered && !adminWorldBossesStarted && !adminFinalChoiceOpen && !adminBossFightStarted) {
    return (
      <main className="admin-choice-page">
        <section className="cave-choice admin-choice" aria-label="11 мир админская сложность">
          <p className="intro-kicker">Код ADMIN2281</p>
          <h1>11 мир: админская сложность</h1>
          <p>
            Внутри {formatPower(adminWorldMonsterTotal)} монстров. Здоровье каждого как у невозможного босса:
            {formatPower(adminWorldMonsterHp)} HP.
          </p>
          <p>
            После смерти монстров появятся все боссы концовок вместе.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setAdminWorldEntered(true);
              setAdminWorldMonstersLeft(adminWorldMonsterTotal);
              setMessage(`Ты вошел в 11 мир. Админская сложность: ${formatPower(adminWorldMonsterTotal)} монстров по ${formatPower(adminWorldMonsterHp)} HP.`);
              navigate('/');
            }} type="button">
              Войти
            </button>
            <button className="secondary" onClick={() => {
              setAdminWorldGateOpen(false);
              setMessage('Ты вышел из 11 мира.');
              navigate('/');
            }} type="button">
              Выйти
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (adminFinalChoiceOpen) {
    return (
      <main className="admin-choice-page final">
        <section className="cave-choice admin-choice" aria-label="Финальный выбор админа">
          <p className="intro-kicker">Этап 2 побежден</p>
          <h1>Ты готов сразиться с админом?</h1>
          <p>
            У админа HP в 10 раз больше, чем у второго этапа.
          </p>
          <p>
            После победы откроется концовка: это невозможно пройти.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setAdminFinalChoiceOpen(false);
              setAdminBossFightStarted(true);
              setEnemyHp(adminFinalBossHp);
              setMessage('Админ вышел на бой. У него HP больше второго этапа в 10 раз.');
              navigate('/');
            }} type="button">
              Готов
            </button>
            <button className="secondary" onClick={() => {
              setAdminFinalChoiceOpen(false);
              setAdminWorldGateOpen(false);
              setMessage('Ты не готов сразиться с админом. 11 мир закрылся.');
              navigate('/');
            }} type="button">
              Не готов
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
          <p className="intro-kicker">{formatPower(arailmEnemiesTotal)} монстров побеждены</p>
          <h1>Сражаться или не сражаться</h1>
          <p>
            Если не сражаться, герой получит меч програм с уроном {formatHugeText(programSwordDamageText)}
            и сразу окажется на 5-м городе, будто 5 городов уже зачищены.
          </p>
          <p>
            Если сражаться, у босса будет {formatPower(scaledDragonPower(baseDragonHp, 15))} HP.
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
              setEnemyHp(scaledDragonPower(baseDragonHp, 15));
              setMessage(`Босс Арайлым вышла на бой. HP: ${formatPower(scaledDragonPower(baseDragonHp, 15))}.`);
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
      {!isWorldPage && (
      <div className="auth-panel">
        <label className="nickname-field">
          <span>Ник</span>
          <input
            aria-label="Ник игрока"
            className="admin-nick-input"
            maxLength={18}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="Твой ник"
            value={nickname}
          />
        </label>
        {!authUser && !guestMode && (
          <>
            <button onClick={() => setAuthOpen((open) => !open)} type="button">
              {authOpen ? 'Закрыть' : 'Войти'}
            </button>
            {authOpen && (
              <form className="login-form" onSubmit={submitLogin}>
                <input
                  aria-label="Почта"
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="почта"
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
                  Аккаунт
                </button>
              {authMessage && <p>{authMessage}</p>}
            </form>
          )}
        </>
        )}
      </div>
      )}
      {tutorialOpen && (
        <div className="tutorial-overlay" role="dialog" aria-label="Обучение игре">
          <div className="tutorial-card tutorial-main">
            <p className="eyebrow">Обучение</p>
            <h2>Гайд и версии</h2>
            <div className="guide-scroll">
              <div className="guide-current-version">
                <strong>Текущая версия: vMagicStaffs70</strong>
                <span>Добавлен раздел магического оружия, посохи и быстрые способности радиусом 70 метров.</span>
              </div>
              <p>Ходи по захваченному городу, ищи монстров, бей их рядом или магией, собирай золото, покупай улучшения и открывай новых боссов. Монстров можно зачищать мечом или заклинаниями; когда город очищен, появляется дракон.</p>
              <div className="guide-columns">
                <div>
                  <strong>Управление</strong>
                  <span>WASD: свободно ходить по карте от третьего лица</span>
                  <span>Мышь или тап по сцене: ударить рядом</span>
                  <span>Пробел: прыгнуть</span>
                  <span>F: быстрый удар</span>
                  <span>На телефоне: джойстик для движения, тап по сцене для удара</span>
                  <span>Кнопка Гайд открывает эту подсказку в любой момент</span>
                  <span>Повороты героя, камеры, монстров и боссов стали плавными</span>
                </div>
                <div>
                  <strong>Бой</strong>
                  <span>Монстры замечают героя в радиусе 100 метров</span>
                  <span>На 12 метрах начинается опасное давление</span>
                  <span>На 5 метрах начинается сильная ближняя атака</span>
                  <span>После всех монстров появляется дракон или особый босс</span>
                  <span>Двуручные мечи бьют тяжелой анимацией с большим замахом</span>
                  <span>Магия теперь может уничтожать группы монстров в городе</span>
                  <span>Магазин качает меч, броню, HP, ману и питомца</span>
                  <span>Удар рядом бьет ближайшего монстра</span>
                </div>
                <div>
                  <strong>Магия и мана</strong>
                  <span>У героя есть мана: 100 в начале игры</span>
                  <span>Кристалл маны в магазине повышает максимум маны</span>
                  <span>Артефакты дают процент к максимуму маны</span>
                  <span>Заклинания бьют в радиусе 70м, летят 100 км/ч и перезаряжаются 3 сек</span>
                  <span>18 заклинаний: огонь, лед, молния, вода, свет, тьма, яд, метеор, комета, шторм, солнце и другие</span>
                  <span>При магии герой делает отдельную каст-анимацию</span>
                  <span>Мана постепенно восстанавливается во время игры</span>
                </div>
                <div>
                  <strong>Монстры</strong>
                  <span>Боты-охотники бегут к герою, когда он входит в радиус обнаружения</span>
                  <span>Урон больше не идет из воздуха: сначала монстр должен приблизиться</span>
                  <span>Гоблины: прыгают и бьют ножом или дубиной</span>
                  <span>Пауки: перебирают лапами и кусают</span>
                  <span>Орки: топают и бьют топором</span>
                  <span>Каменные и великаны: медленно, но тяжело атакуют</span>
                  <span>Ящеры: бегут с хвостом и рывком</span>
                  <span>Сетчатые: пульсируют и светятся</span>
                </div>
                <div>
                  <strong>Миры</strong>
                  <span>Пылающий мир: карта городов</span>
                  <span>Если монстры живы, город выглядит захваченным</span>
                  <span>В захваченном городе есть улицы, руины, дым, огни и следы монстров</span>
                  <span>Герой может спокойно исследовать большую карту</span>
                  <span>Есть пещеры, особые миры, водный мир и секретные боссы</span>
                  <span>Достижения дают коды и бонусы</span>
                </div>
                <div>
                  <strong>Коды и секреты</strong>
                  <span>wwfuri: секретный фури-мир</span>
                  <span>Anuar: город бомб</span>
                  <span>mansur: подземелье Мансура</span>
                  <span>arailm: красная программа</span>
                  <span>ais228198: водный мир</span>
                  <span>ADMIN2281: 11 мир админа</span>
                  <span>nurali2281: новый мир Нурали</span>
                </div>
                <div>
                  <strong>Боссы</strong>
                  <span>После городов: Великий дракон</span>
                  <span>После финала может открыться подземный мир</span>
                  <span>После темных монстров появляются души финального босса</span>
                  <span>После душ выходит Король ада</span>
                  <span>Дракон стал крупнее, темнее, с аурой, шипами и огненным дыханием</span>
                  <span>Секретные боссы дают концовки, артефакты и оружие</span>
                </div>
                <div>
                  <strong>Предметы</strong>
                  <span>Оружие повышает урон</span>
                  <span>Броня повышает защиту</span>
                  <span>Огненный питомец дает до 20 урона</span>
                  <span>Артефакты дают урон, деньги, скорость, HP и процент маны</span>
                  <span>Магический посох открывает выбор заклинаний</span>
                  <span>Секретные мечи появляются после особых концовок</span>
                  <span>Предмет можно продать в инвентаре</span>
                </div>
                <div>
                  <strong>Сохранение</strong>
                  <span>Игра сохраняет HP героя и босса</span>
                  <span>Сохраняются деньги, вещи, броня и оружие</span>
                  <span>Сохраняется мана и максимум маны</span>
                  <span>Сохраняются города, монстры и секретные миры</span>
                  <span>Сохраняются позиция героя, улучшения и концовки</span>
                  <span>Кнопка Начать повторно очищает сохранение</span>
                </div>
                <div>
                  <strong>Версии</strong>
                  <span>v1: города, монстры, магазин и драконы</span>
                  <span>v2: секретные миры, коды, дуэли и достижения</span>
                  <span>v3D: камера от третьего лица и 3D герой</span>
                  <span>v3D+: 3D монстры бегут, атакуют и отходят</span>
                  <span>vBoss: разные 3D модели для боссов концовок</span>
                  <span>vDragon: новый дракон с анимациями и огненным дыханием</span>
                  <span>vSave: автосохранение всего прогресса</span>
                  <span>vMonster: каждому виду монстра своя анимация</span>
                  <span>vAllAnimation: боссы, эффекты и окружение двигаются</span>
                  <span>vGuide: полный гайд и список версий</span>
                  <span>vQuest500: 500 квестов с деньгами, мечами и броней</span>
                  <span>v3DInventory: 3D-фото всех видов оружия в инвентаре</span>
                  <span>vFlyingArtifact: надетый артефакт летает рядом с героем в 3D</span>
                  <span>vEquippedSword3D: надетый меч виден у героя в 3D-бою</span>
                  <span>vWeaponWorld100: оружие каждого мира сильнее прошлого в 100 раз</span>
                  <span>vFreeMap: свободное исследование большой карты</span>
                  <span>vManaMagic: мана, магазин маны и много заклинаний</span>
                  <span>vThreatDragon: дракон стал угрожающим с аурой и огнем</span>
                  <span>vHeroMotion: ходьба и атака двуручным мечом стали живее</span>
                  <span>vCapturedCityMagic: захваченный город и полный гайд</span>
                  <span>vBetterMagic: 18 заклинаний, разная мана, кулдауны и массовая зачистка</span>
                  <span>vSmoothTurns: плавные повороты героя, камеры, монстров и боссов</span>
                  <span>vManaArtifacts: артефакты дают процент к максимуму маны</span>
                  <span>vSmoothManaArtifacts: полный гайд обновлен под все новые версии</span>
                  <span>vMonsterBots100: монстры-боты охотятся на героя в радиусе 100 метров</span>
                  <span>vRealMonsterHunt: реалистичная погоня, давление на 12 м и ближний урон на 5 м</span>
                  <span>vRealActors: герой, монстры и дракон получили больше живых 3D-анимаций</span>
                  <span>vLessCrowd: на карте меньше видимых монстров, чтобы свободнее ходить</span>
                  <span>vWorldManaBalance: в Пылающем мире есть полоса маны, ник и гость скрыты, урон магазина уменьшен</span>
                  <span>vCityGoblinOnly: новая goblin-модель появляется только в обычных городах</span>
                  <span>vMobileCityModels: мобильные кнопки, HUD и джойстик стали компактнее</span>
                  <span>vNukeScreenFix: ядерка больше не ломает экран, огромный урон считается безопасно</span>
                  <span>v3DLoadGuard: если модель долго грузится, игра всё равно запускает карту</span>
                  <span>vMagicStaffs70: отдельный раздел магического оружия, посохи и способности снизу</span>
                  <span>vFastSpells100: все заклинания летят 100 км/ч, бьют в радиусе 70 м и перезаряжаются 3 сек</span>
                </div>
              </div>
            </div>
            <button className="guide-primary-button" onClick={closeTutorial} type="button">Понял, играть</button>
          </div>
          <div className="tutorial-tip tutorial-goblin">
            <span className="tutorial-arrow tutorial-arrow-down" />
            <b>1</b>
            <p>Иди к монстру и убей его. Двигайся WASD, бей кликом, тапом или F.</p>
          </div>
          <div className="tutorial-tip tutorial-world">
            <span className="tutorial-arrow tutorial-arrow-up" />
            <b>2</b>
            <p>Нажми “Пылающий мир”, чтобы открыть карту и мир игры.</p>
          </div>
          <div className="tutorial-tip tutorial-upgrade">
            <span className="tutorial-arrow tutorial-arrow-right" />
            <b>3</b>
            <p>Улучшай урон в магазине, чтобы быстрее убивать монстров и драконов.</p>
          </div>
          <div className="tutorial-tip tutorial-play">
            <span className="tutorial-arrow tutorial-arrow-up" />
            <b>4</b>
            <p>Нажми “Играть”, чтобы вернуться в бой.</p>
          </div>
        </div>
      )}
      <section className="stage" aria-label="Поле битвы">
        <Link className="page-switch world-link" href="/world">Пылающий мир</Link>
        <Link className="page-switch achievements-link" href="/achievements">Достижения</Link>
        <button className="guide-button" onClick={() => setTutorialOpen(true)} type="button">Гайд</button>
        <div
          className={`sky battle-2d ${battleScene} ${battlePulse % 2 ? 'hit' : ''}`}
          onClick={attackFromStageClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              if (currentMonsters > 0) fightMonster();
              else strike();
            }
          }}
          onPointerDown={startCameraDrag}
          onPointerMove={moveCameraDrag}
          onPointerUp={stopCameraDrag}
          onPointerCancel={stopCameraDrag}
          role="button"
          tabIndex={0}
        >
          <div className="battle-3d-layer">
            <BattleScene3D
              key={mapSceneKey}
              dragonColor={enemy?.color ?? '#ffb703'}
              heroAnimation={heroAnimation}
              isHeroMoving={heroMoving}
              isFinalReveal={isFinalReveal}
              burn={worldBurn}
              heroPosition={heroPosition}
              heroHeight={heroHeight}
              heroDirection={heroDirection}
              cameraYaw={cameraYaw}
              nearestMonster={nearestMonster}
              monstersLeft={currentMonsterTotal > 0 ? Math.min(100, (currentMonsters / currentMonsterTotal) * 100) : 0}
              battlePulse={battlePulse}
              cameraMode="third"
              monsterKind={enemy?.monsterKind ?? 'goblin'}
              viewDistance={1_000}
              sceneKey={mapSceneKey}
              useCityGoblinModel={useCityGoblinModel}
              chapter={chapter}
              locationIndex={mapLocationIndex}
              equippedArtifactIcon={equippedArtifact?.icon ?? null}
              equippedWeaponStyle={equippedWeaponStyle}
              hasArcaneWeapon={hasArcaneWeapon}
              arcaneSpellKind={selectedArcaneSpell}
              arcanePulse={arcanePulse}
              arcaneBurstPulse={arcaneBurstPulse}
            />
          </div>
          {isClickDuelActive && (
            <div className={`click-duel ${battlePulse % 2 ? 'hero-hit' : 'dragon-hit'}`} aria-label="Клик битва">
              <div className="click-duel-side hero-side">
                <span className="duel-avatar">Я</span>
                <strong>{formatPower(clickDuelHeroPower)}</strong>
              </div>
              <div className="click-duel-core">
                <div className="click-duel-tip">
                  <span>{clicksPerSecond > 0 ? `${clicksPerSecond}.0/с` : 'Начни кликать'}</span>
                  <b>{clickDuelPower >= 50 ? 'Ты давишь' : 'Дракон давит'}</b>
                </div>
                <div className="click-duel-bar">
                  <span className="hero-fill" style={{ width: `${clickDuelPower}%` }} />
                  <i style={{ left: `${clickDuelPower}%` }} />
                </div>
                <button
                  className="click-duel-button"
                  disabled={heroHp === 0}
                  onClick={(event) => {
                    event.stopPropagation();
                    strike();
                  }}
                  type="button"
                >
                  Нажимайте!
                </button>
              </div>
              <div className="click-duel-side dragon-side">
                <span className="duel-avatar">Д</span>
                <strong>{formatPower(clickDuelDragonPower)}</strong>
              </div>
              <span className="click-slash" />
              <span className="dragon-fire-burst" />
            </div>
          )}
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
            {Array.from({ length: Math.max(0, Math.min(3, Math.ceil(currentMonsters / 700))) }).map((_, index) => {
              const mixedMonster = monsterKinds[(chapter + index) % monsterKinds.length];
              const monsterKind = isFinalSpiritWorld ? 'shadow' : isAdminWorld ? 'admin' : isAisWorld ? 'fish' : isNuraliWorld ? 'nurali' : isBbiWorld ? 'shadow' : isArailmWorld ? 'arailm' : isMansurDungeon ? 'mansur' : isAnuarWorld ? 'bomb' : isFuryDungeon ? 'fury' : enemy?.monsterKind ?? mixedMonster[0];
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
          {nukePulse > 0 && (
            <div className="nuke-explosion" key={nukePulse}>
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
          {waterWavePulse > 0 && (
            <div className="ais-water-wave" key={waterWavePulse}>
              <span />
              <span />
              <span />
            </div>
          )}
          {soulFirePulse > 0 && (
            <div className="soul-fire-wave" key={soulFirePulse}>
              <span />
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
          {!isFinalReveal && enemy && currentMonsters === 0 && isAisSharkBoss && (
            <div className="ais-shark-boss">
              <span />
              <i />
              <b />
            </div>
          )}
          {!isFinalReveal && enemy && currentMonsters === 0 && isAisGodBoss && (
            <div className="ais-god-boss">
              <span className="ais-crown" />
              <span className="ais-head" />
              <span className="ais-body" />
              <span className="ais-tail" />
              <span className="ais-trident" />
            </div>
          )}
          {!isFinalReveal && enemy && currentMonsters === 0 && (isAdminWorldBosses || isAdminBoss) && (
            <div className={`admin-boss ${isAdminWorldBosses ? 'all-bosses' : ''}`}>
              <span className="admin-head" />
              <span className="admin-body" />
              <span className="admin-arm left" />
              <span className="admin-arm right" />
              <span className="admin-leg left" />
              <span className="admin-leg right" />
              {isAdminWorldBosses && <b>ALL BOSSES</b>}
            </div>
          )}
          {!isFinalReveal && enemy && currentMonsters === 0 && isDeathGodBoss && (
            <div className="death-god-boss">
              <span className="death-crown" />
              <span className="death-head" />
              <span className="death-body" />
              <span className="death-hound" />
              <span className="death-scythe" />
            </div>
          )}
          {!isFinalReveal && enemy && currentMonsters === 0 && isFinalSpiritBoss && (
            <div className="final-spirit-boss">
              <span />
            </div>
          )}
          {!isFinalReveal && enemy && currentMonsters === 0 && !isDeathGodBoss && !isFinalSpiritBoss && !isGoblinKingBoss && !isFuryKingBoss && !isAnuarKingBoss && !isMansurKingBoss && !isArailmKingBoss && !isAisSharkBoss && !isAisGodBoss && !isAdminWorldBosses && !isAdminBoss && (
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
          <div
            className="mobile-joystick"
            onPointerDown={startJoystick}
            onPointerMove={moveJoystick}
            onPointerUp={stopJoystick}
            onPointerCancel={stopJoystick}
            role="application"
            aria-label="Джойстик движения"
          >
            <span style={{ transform: `translate(${joystickThumb.x}px, ${joystickThumb.y}px)` }} />
          </div>
          {hasArcaneWeapon && (
            <div className="arcane-spell-panel" aria-label="Заклинания">
              <div className="arcane-spell-grid">
                {arcaneSpells.map((spell, index) => (
                  <button
                    aria-label={spell.name}
                    className={selectedArcaneSpell === index ? 'selected' : ''}
                    key={spell.name}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedArcaneSpell(index);
                    }}
                    title={`${spell.name}: ${spell.mana} маны`}
                    type="button"
                  >
                    {spell.icon}
                    <small>{spell.mana}</small>
                  </button>
                ))}
              </div>
              <div className="arcane-spell-info">
                <strong>{selectedSpell.name}</strong>
                <span>радиус {selectedSpellRadiusMeters}м | скорость {selectedSpellSpeedKmh} км/ч | перезарядка 3с</span>
              </div>
              <button
                className={`arcane-skill-button ${arcaneSkillReady ? 'ready' : 'cooldown'}`}
                disabled={!arcaneSkillReady || heroHp === 0}
                onClick={(event) => {
                  event.stopPropagation();
                  castArcaneSkill();
                }}
                type="button"
              >
                {heroMana < arcaneSkillManaCost ? `${arcaneSkillManaCost} маны` : arcaneSkillReady ? selectedSpell.name : `${Math.ceil(arcaneSkillRemainingMs / 1000)}с`}
              </button>
            </div>
          )}
        </div>
      </section>

      {(duelStatus === 'searching' || duelStatus === 'challenge' || duelStatus === 'fighting' || duelStatus === 'won') && (
        <div className={`duel-overlay ${duelStatus}`} role="dialog" aria-modal="true" aria-label="Дуэль">
          <div className="duel-card">
            <p className="eyebrow">Дуэль онлайн</p>
            {duelStatus === 'searching' ? (
              <>
                <h2><span className="admin-nick">{playerName}</span> ищет игроков в сети...</h2>
                <div className="duel-scanner"><span /></div>
                <button className="secondary" onClick={() => setDuelStatus('idle')} type="button">Отмена</button>
              </>
            ) : duelStatus === 'challenge' && duelOpponent ? (
              <>
                <h2>{duelOpponent.name} кинул вызов</h2>
                <p><span className="admin-nick">{playerName}</span> ID {playerId} против {duelOpponent.name} ID {duelOpponent.id}. {duelOpponent.title}. Сила: {formatPower(duelOpponent.power)}.</p>
                <div className="duel-loot">
                  <span>Оружие: {getWeaponDisplayName(duelOpponent.weapon)} +{formatPower(duelOpponent.weapon.damage)}</span>
                  <span>Броня: {duelOpponent.armor.name} +{formatPower(duelOpponent.armor.defense)}</span>
                </div>
                <strong>Драться?</strong>
                <div className="duel-actions">
                  <button onClick={acceptDuel} type="button">Драться</button>
                  <button className="secondary" onClick={declineDuel} type="button">Нет</button>
                  <button className="secondary" onClick={openDuelTrade} type="button">Обмен</button>
                </div>
              </>
            ) : duelStatus === 'fighting' && duelOpponent ? (
              <>
                <h2>Дуэль началась</h2>
                <p><span className="admin-nick">{playerName}</span> сражается против {duelOpponent.name}.</p>
                <div className="duel-arena" aria-hidden="true">
                  <span className={`arena-fighter hero-side ${battlePulse % 2 ? 'strike' : ''}`} />
                  <span className="arena-magic" />
                  <span className={`arena-fighter opponent-side ${battlePulse % 2 ? '' : 'strike'}`} />
                </div>
                <div className="duel-fighters">
                  <div>
                    <strong className="admin-nick">{playerName}</strong>
                    <div className="bar"><span style={{ width: `${Math.max(0, Math.min(100, (duelHeroHp / Math.max(1, currentHeroMaxHp + defenseBonus + attackBonus)) * 100))}%` }} /></div>
                    <small>HP {formatPower(duelHeroHp)}</small>
                  </div>
                  <div>
                    <strong>{duelOpponent.name}</strong>
                    <div className="bar enemy"><span style={{ width: `${Math.max(0, Math.min(100, (duelOpponentHp / Math.max(1, duelOpponent.power * 4)) * 100))}%` }} /></div>
                    <small>HP {formatPower(duelOpponentHp)}</small>
                  </div>
                </div>
                <div className="duel-clash"><span /><span /></div>
                <div className="duel-actions">
                  <button onClick={duelHit} type="button">Удар</button>
                  <button className="secondary" onClick={openDuelTrade} type="button">Обмен</button>
                  <button className="secondary" onClick={declineDuel} type="button">Выйти</button>
                </div>
              </>
            ) : (
              <>
                <h2>Победа в дуэли</h2>
                <p><span className="admin-nick">{playerName}</span>, счет побед: {duelWins}. Можно искать следующего игрока.</p>
                <div className="duel-actions">
                  <button onClick={startDuelSearch} type="button">Еще дуэль</button>
                  <button className="secondary" onClick={() => setDuelStatus('idle')} type="button">Закрыть</button>
                </div>
              </>
            )}
            {duelTradeOpen && duelOpponent && (
              <div className="duel-trade">
                <strong>Обмен или нет</strong>
                <p>Сверху вещи другого игрока, ниже твой инвентарь. Выбери предмет и нажми готово.</p>
                <div className="duel-trade-label">У него есть</div>
                <div className="duel-trade-target">
                  <div className="weapon weapon-card rare">
                    <span className="weapon-picture" aria-hidden="true"><i /></span>
                    <span className="weapon-name">{getWeaponDisplayName(duelOpponent.weapon)}</span>
                    <small>Получишь меч соперника +{formatPower(duelOpponent.weapon.damage)}</small>
                  </div>
                  <div className="weapon armor-card rare body-card">
                    <span className="armor-picture" aria-hidden="true"><i /></span>
                    <span>{duelOpponent.armor.name}</span>
                    <small>Получишь броню соперника +{formatPower(duelOpponent.armor.defense)}</small>
                  </div>
                </div>
                <div className="duel-trade-label">У тебя есть</div>
                <div className="duel-trade-inventory">
                  {weapons.length === 0 && armors.length === 0 ? (
                    <p className="online-empty">Инвентарь пуст. Для обмена нужен меч или броня.</p>
                  ) : (
                    <>
                      {weapons.map((weapon) => (
                        <button
                          className={`weapon weapon-card ${rarityClass[weapon.rarity]} weapon-style-${getWeaponStyleIndex(weapon)} ${duelTradeOffer?.kind === 'weapon' && duelTradeOffer.item.id === weapon.id ? 'selected' : ''}`}
                          key={weapon.id}
                          onClick={() => setDuelTradeOffer({ kind: 'weapon', item: weapon })}
                          type="button"
                        >
                          <span className="weapon-picture" aria-hidden="true"><i /></span>
                          <span className="weapon-name">{getWeaponDisplayName(weapon)}</span>
                          <small>{weapon.rarity} +{weapon.displayDamage ? formatHugeText(weapon.displayDamage) : formatPower(weapon.damage)}</small>
                        </button>
                      ))}
                      {armors.map((armor) => (
                        <button
                          className={`weapon armor-card ${rarityClass[armor.rarity]} armor-style-${getArmorStyleIndex(armor)} ${isHelmetArmor(armor) ? 'helmet-card' : 'body-card'} ${duelTradeOffer?.kind === 'armor' && duelTradeOffer.item.id === armor.id ? 'selected' : ''}`}
                          key={armor.id}
                          onClick={() => setDuelTradeOffer({ kind: 'armor', item: armor })}
                          type="button"
                        >
                          <span className="armor-picture" aria-hidden="true"><i /></span>
                          <span>{armor.name}</span>
                          <small>{armor.rarity} +{armor.displayDefense ?? formatPower(armor.defense)} защиты</small>
                        </button>
                      ))}
                    </>
                  )}
                </div>
                <div className="duel-actions">
                  <button onClick={acceptDuelTrade} disabled={!duelTradeOffer} type="button">Готово</button>
                  <button className="secondary" onClick={rejectDuelTrade} type="button">Отказаться</button>
                </div>
              </div>
            )}
            <div className="online-players">
              <div className="online-players-head">
                <strong>Люди в сети</strong>
                <button className="secondary" onClick={closeDuelList} type="button">Выйти из списка и играть</button>
              </div>
              <div
                className="online-player-list"
                onScroll={scheduleOnlineListReturn}
                ref={onlinePlayerListRef}
              >
                {onlinePlayers.length === 0 ? (
                  <p className="online-empty">Список пуст. Реальных игроков онлайн нет.</p>
                ) : onlinePlayers.map((player) => (
                  <button
                    className={duelOpponent?.id === player.id ? 'selected' : ''}
                    key={player.id}
                    onClick={() => selectDuelPlayer(player)}
                    type="button"
                  >
                    <span>{player.name}</span>
                    <small>ID {player.id} | сила {formatPower(player.power)}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="online-players leaderboard">
              <div className="online-players-head">
                <strong>Лидерборд силы</strong>
                <span>{leaderboardPlayers.length} игроков</span>
              </div>
              <div className="online-player-list leaderboard-list">
                {leaderboardPlayers.length === 0 ? (
                  <p className="online-empty">Лидерборд пуст. Первый игрок появится после захода в игру.</p>
                ) : leaderboardPlayers.map((player, index) => (
                  <button
                    className={player.id === playerId ? 'selected' : ''}
                    key={player.id}
                    onClick={() => {
                      if (player.id === playerId) return;
                      selectDuelPlayer(toDuelPlayer(player));
                    }}
                    type="button"
                  >
                    <span>#{index + 1} {player.name}</span>
                    <small>ID {player.id} | сила {formatPower(player.power)} | заходил {new Date(player.updatedAt).toLocaleDateString()}</small>
                  </button>
                ))}
              </div>
            </div>
            {duelOpponent && (
              <div className="duel-chat">
                <strong>Магический чат с {duelOpponent.name} ID {duelOpponent.id}</strong>
                <div className="duel-chat-log">
                  {duelChatMessages.length === 0 ? (
                    <span>Напиши сообщение игроку.</span>
                  ) : duelChatMessages.map((chatMessage) => (
                    <p key={chatMessage.id}>
                      <b>{chatMessage.from}:</b> {chatMessage.text}
                    </p>
                  ))}
                </div>
                <form className="duel-chat-form" onSubmit={sendDuelChat}>
                  <input
                    aria-label="Сообщение в дуэльный чат"
                    onChange={(event) => setDuelChatText(event.target.value)}
                    placeholder="Написать в чат"
                    value={duelChatText}
                  />
                  <button type="submit">Отпр</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {incomingDuelRequest && incomingRequestPlayer && (
        <div className="duel-request-screen" role="dialog" aria-modal="true" aria-live="polite" aria-label="Входящий вызов">
          <div className={`duel-request-box ${incomingDuelRequest.kind === 'trade' ? 'trade-request-box' : ''}`}>
            <p className="eyebrow">{incomingDuelRequest.kind === 'trade' ? 'Входящий обмен' : 'Входящая дуэль'}</p>
            <h2>{incomingDuelRequest.kind === 'trade' ? 'Трейд кинул' : 'Игрок хочет драться'}</h2>
            <strong className="trade-request-nick">{incomingRequestPlayer.name}</strong>
            <p>{incomingDuelRequest.kind === 'trade' ? 'Принять трейд или нет?' : 'Принять бой на арене или отказаться?'}</p>
            {incomingDuelRequest.kind === 'trade' && (
              <div className="trade-request-abilities" aria-label="Способности игрока">
                <div>
                  <span>Сила</span>
                  <b>{formatPower(incomingRequestPlayer.power)}</b>
                </div>
                <div>
                  <span>Титул</span>
                  <b>{incomingRequestPlayer.title}</b>
                </div>
                <div>
                  <span>Меч</span>
                  <b>{getWeaponDisplayName(incomingRequestPlayer.weapon)} +{formatPower(incomingRequestPlayer.weapon.damage)}</b>
                </div>
                <div>
                  <span>Броня</span>
                  <b>{incomingRequestPlayer.armor.name} +{formatPower(incomingRequestPlayer.armor.defense)}</b>
                </div>
              </div>
            )}
            <div className="duel-actions">
              <button onClick={acceptIncomingDuelRequest} type="button">
                Принять
              </button>
              <button className="secondary" onClick={rejectIncomingDuelRequest} type="button">Нет</button>
            </div>
          </div>
        </div>
      )}

      {!isWorldPage && !isFinalReveal && enemy && (
        <div className="quick-hud" aria-label="Быстрое состояние игры">
          <div>
            <strong><span className="admin-nick">{playerName}</span> | {enemy.city}</strong>
            <span>Здоровье {heroHealthText}</span>
            <span>Мана {Math.floor(heroMana)} / {currentHeroMaxMana}</span>
            <span>{currentEnemyHealthText}</span>
            <span>{isFinalSpiritWorld ? 'Подземные монстры' : isDungeon ? 'Пещера' : 'Монстры'}: {formatPower(currentMonsters)}</span>
            <span>Винстрик x{winStreakState.current} | рекорд {winStreakState.best}</span>
          </div>
          {currentMonsters === 0 && (
            <button onClick={strike} disabled={heroHp === 0}>{isFinalSpiritBoss ? 'Бить души' : 'Бить дракона'}</button>
          )}
        </div>
      )}

      {isWorldPage && (
      <section className="hud" aria-label="Состояние игры">
        <div className="world-nav">
          <Link className="page-switch play-link" href="/">Играть</Link>
          <Link className="page-switch play-link" href="/achievements">Достижения</Link>
          <button className="page-switch play-link guide-world-button" onClick={() => setTutorialOpen(true)} type="button">Гайд</button>
        </div>
        <div className="story">
          <p className="eyebrow">Пылающий мир</p>
          <h1>Меч против сыновей дракона</h1>
          <p>{message}</p>
        </div>
        <div className="world-mana-panel" aria-label="Мана героя">
          <div>
            <strong>Мана</strong>
            <span>{Math.floor(heroMana)} / {currentHeroMaxMana}</span>
          </div>
          <div className="world-mana-bar">
            <span style={{ width: `${Math.max(0, Math.min(100, (heroMana / currentHeroMaxMana) * 100))}%` }} />
          </div>
        </div>

        {dailyRewardText && (
          <div className="dungeon">
            <div>
              <p className="label">Рекорд дней</p>
              <strong>{dailyRewardState.streak} день подряд | лучший рекорд {dailyRewardState.bestStreak}</strong>
              <p>{dailyRewardText}</p>
            </div>
          </div>
        )}

        <div className="dungeon win-streak-panel">
          <div>
            <p className="label">Винстрик</p>
            <strong>x{winStreakState.current} сейчас | рекорд x{winStreakState.best} | побед всего {winStreakState.totalWins}</strong>
            <p>{winStreakText || 'Побеждай монстров, драконов и игроков подряд. За серию 5 дается прокачка, за серию 10 оружие.'}</p>
          </div>
        </div>

        {impossibleEnding ? (
          <div className="reveal impossible-ending">
            <p className="eyebrow">Невозможная концовка</p>
            <h2>Символ бесконечности</h2>
            <p>
              В мире nurali2281 Нурали был побежден. Админская ядерка стала сильнее:
              {adminNukeDamageText}.
            </p>
            <p>
              Получен артефакт: Медальон невозможности. Он дает +1000% урон,
              +1000% деньги и +1000% скорость атаки.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : bbiBadEnding ? (
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
        ) : secretEnding === 'deathHell' ? (
          <div className="reveal death-ending">
            <p className="eyebrow">Адская концовка</p>
            <h2>Ваша душа попала в ад</h2>
            <p>
              После душ финального босса герой встретил Короля ада. Он вышел из черного трона и забрал душу героя.
            </p>
            <p>
              HP героя осталось, но душа уже не вернулась в мир живых.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : secretEnding === 'deathVictory' ? (
          <div className="reveal death-ending">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Победивший смерть</h2>
            <p>
              Герой победил Короля ада с HP в 10 раз больше финального босса.
            </p>
            <p>
              Получены Голова бога: +666% ко всем бафам, и смертельный секретный меч с уроном {formatHugeText(deathSwordDamageText)}.
              Голова бога усиливает меч смерти.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : secretEnding === 'adminImpossible' ? (
          <div className="reveal admin-ending">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Это невозможно пройти</h2>
            <p>
              Герой прошел 11 мир, пережил всех боссов концовок вместе и убил админа.
            </p>
            <p>
              Герой стал уж слишком сильный. Админская сила заключена в кулоне смерти.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : secretEnding === 'monsterAvalanche' ? (
          <div className="reveal admin-ending">
            <p className="eyebrow">Секретная концовка 5 мира</p>
            <h2>Лавина монстров</h2>
            <p>
              После смерти от 5-го дракона герой попал в 5 мир и победил
              {formatPower(monsterAvalancheTotal)} монстров.
            </p>
            <p>
              Каждый монстр имел {formatPower(monsterAvalancheHp)} HP и бил на
              {formatPower(monsterAvalancheDamage)} урона. Получена Корона лавины:
              +100% ко всем бафам.
            </p>
            <p>
              После этой концовки новый поход начинается с 8-го города.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/">Продолжать</Link>
              <button onClick={restart}>Начать с 8-го города</button>
            </div>
          </div>
        ) : secretEnding === 'aisultanSea' ? (
          <div className="reveal ais-ending">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Воденой мир</h2>
            <p>
              Герой победил бога моря Айсултана после {formatPower(aisultanMonsterTotal)}
              рыб-монстров и промежуточного босса Акулы.
            </p>
            <p>
              Океан стал свободным, а 10 мир больше не топит города волнами.
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
                <strong className="admin-nick">{playerName}</strong>
                <div className="bar">
                  <span style={{ width: `${heroHealthPercent}%` }} />
                </div>
                <strong>{heroHealthText}</strong>
              </div>
              <div>
                <p className="label">{currentMonsters === 0 ? (isFinalSpiritBoss ? 'Души босса' : isBbiBoss ? 'BBI босс' : 'Дракон-босс') : (isFinalSpiritWorld ? 'Подземный мир' : isBbiWorld ? 'BBI новый мир' : 'Город')}</p>
                <div className="bar enemy">
                  <span style={{ width: `${currentMonsters === 0 ? Math.min(100, (enemyHp / currentDragonHp) * 100) : Math.max(0, 100 - (currentMonsters / currentMonsterTotal) * 100)}%` }} />
                </div>
                <strong>{currentMonsters === 0 ? enemy.name : enemy.city}</strong>
                {currentMonsters === 0 ? (
                  <>
                    <strong>HP: {formatPower(enemyHp)} / {formatPower(currentDragonHp)}</strong>
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
                <strong>Артефакт: {equippedArtifact ? `+${equippedArtifact.bonusPercent}% урон, +${equippedArtifact.goldBonusPercent}% деньги, +${equippedArtifact.attackSpeedPercent}% скорость, +${equippedArtifact.manaBonusPercent ?? 0}% мана` : 'нет'}</strong>
                <strong>Защита: -{hasAdminHelmet ? '∞' : formatPower(defenseBonus)}</strong>
                <strong>Деньги за босса: {formatPower(reward)}</strong>
                <strong>Монстры: {formatPower(currentMonsters)}</strong>
                <strong>Здоровье ур.: {healthLevel}</strong>
                <strong>HP монстра: {formatPower(currentMonsterHp)}</strong>
              </div>
              <div className="weapon-summary">
                <p className="label">Оружие 12 500 видов</p>
                <strong>{equippedWeapon ? getWeaponDisplayName(equippedWeapon) : 'Пока нет оружия'}</strong>
                <span>{equippedWeapon ? `${equippedWeapon.rarity}, +${isBbiLegendaryWeapon(equippedWeapon) ? `${formatPower(bbiLegendaryDamage)} (+10000%)` : equippedWeapon.displayDamage ? formatHugeText(equippedWeapon.displayDamage) : formatPower(equippedWeapon.damage)} урона, цена ${formatPower(equippedWeapon.price)}` : 'Выбивается с врагов и в подземельях'}</span>
              </div>
              <div className="weapon-summary armor-summary">
                <p className="label">Броня 3375 видов</p>
                <strong>{equippedArmor ? equippedArmor.name : 'Пока нет брони'}</strong>
                <span>{equippedArmor ? `${equippedArmor.rarity}, +${equippedArmor.displayDefense ?? formatPower(equippedArmor.defense)} защиты, цена ${formatPower(equippedArmor.price)}` : 'Выбивается с врагов и в подземельях'}</span>
              </div>
            </div>

            <div className="actions">
              <button onClick={strike} disabled={heroHp === 0 || currentMonsters > 0}>{isFinalSpiritBoss ? 'Бить души' : 'Бить дракона'}</button>
            </div>

            <div className="monster-panel">
              <div>
                <p className="label">{isFinalSpiritWorld ? 'Монстры подземного мира' : 'Монстры города'}</p>
                <strong>{enemy.city}: разные монстры {formatPower(currentMonsters)} / {formatPower(currentMonsterTotal)}</strong>
                <p>{currentMonsters === 0 ? `Все монстры побеждены. Теперь бей ${isFinalSpiritBoss ? 'души' : isBbiBoss ? 'босса' : 'дракона'}.` : `Победи ${formatPower(currentMonsterTotal)} монстров, чтобы появился ${isFinalSpiritWorld ? 'рой душ' : isBbiWorld ? 'Управляющий' : 'дракон'}.`}</p>
                <p>{isNuraliWorld ? `Монстр Нурали: ${formatPower(nuraliMonsterHp)} HP. Всего монстров: ${formatPower(nuraliMonsterTotal)}.` : isBbiWorld ? `BBI монстр: ${formatPower(bbiMonsterHp)} HP. Всего монстров: ${formatPower(bbiMonsterTotal)}.` : 'Первый город: 100 HP и 10 урона. Каждый следующий город сильнее в 100 раз.'}</p>
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
                  <strong>После 1000 врагов открылся трон гоблинов</strong>
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
                <strong>
                  {shopTab === 'upgrades'
                    ? `${infiniteGold ? '∞' : formatPower(gold)} золота`
                    : shopTab === 'artifacts'
                      ? `${unlockedArtifacts.length} / ${endingArtifacts.length} артефактов`
                      : shopTab === 'players'
                        ? `${onlinePlayers.length} игроков`
                        : shopTab === 'id'
                          ? `ID ${playerId}`
                          : 'онлайн'}
                </strong>
              </div>
              <div className="shop-tabs" role="tablist" aria-label="Вкладки магазина">
                <button className={shopTab === 'upgrades' ? 'selected' : ''} onClick={() => setShopTab('upgrades')} type="button">Улучшения</button>
                <button className={shopTab === 'artifacts' ? 'selected' : ''} onClick={() => setShopTab('artifacts')} type="button">Артефакты</button>
                <button className={shopTab === 'code' ? 'selected' : ''} onClick={() => setShopTab('code')} type="button">Код</button>
                <button className={shopTab === 'duel' ? 'selected' : ''} onClick={() => setShopTab('duel')} type="button">Дуэль</button>
                <button className={shopTab === 'players' ? 'selected' : ''} onClick={() => setShopTab('players')} type="button">Игроки</button>
                <button className={shopTab === 'id' ? 'selected' : ''} onClick={() => setShopTab('id')} type="button">ID</button>
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
              ) : shopTab === 'artifacts' ? (
                <div className="artifact-grid">
                  {endingArtifacts.map((artifact) => {
                    const unlocked = unlockedAchievements.includes(artifact.ending);
                    const equipped = equippedArtifactId === artifact.id;
                    return (
                      <button
                        className={`artifact-card ${unlocked ? 'unlocked' : 'locked'} ${equipped ? 'equipped' : ''}`}
                        disabled={!unlocked}
                        key={artifact.id}
                        onClick={() => equipArtifact(artifact)}
                        type="button"
                      >
                        <span className={`artifact-icon ${artifact.icon}`}><span /></span>
                        <strong>{artifact.name}</strong>
                        <small>{unlocked ? artifact.text : 'Открой концовку'}</small>
                        <b>{unlocked ? `${equipped ? 'Надет: ' : ''}+${artifact.bonusPercent}% урон, +${artifact.goldBonusPercent}% деньги, +${artifact.attackSpeedPercent}% скорость, +${artifact.manaBonusPercent ?? 0}% мана, лечит 20% HP${artifact.healingBonusPercent ? `, +${artifact.healingBonusPercent}% к исцелению` : ''}${artifact.healthBonusPercent ? `, +${artifact.healthBonusPercent}% здоровье` : ''}${artifact.defenseBonusPercent ? `, +${artifact.defenseBonusPercent}% защита` : ''}${artifact.luckBonusPercent ? `, +${artifact.luckBonusPercent}% удача` : ''}${artifact.id === 'seaPearl' ? ', воденой меч +1000%' : ''}` : 'Закрыт'}</b>
                      </button>
                    );
                  })}
                </div>
              ) : shopTab === 'code' ? (
                <form className="code-form shop-code-form shop-panel" onSubmit={submitAdminCode}>
                  <input
                    aria-label="Код магазина"
                    onChange={(event) => setAdminCode(event.target.value)}
                    placeholder="Код"
                    value={adminCode}
                  />
                  <button className="nuclear-button" type="submit">OK</button>
                </form>
              ) : shopTab === 'duel' ? (
                <div className="shop-panel shop-duel-panel">
                  <button className="duel-button" onClick={startDuelSearch} type="button">Искать дуэль</button>
                  <form className="duel-id-box" onSubmit={(event) => {
                    event.preventDefault();
                    startDuelSearch();
                  }}>
                    <input
                      aria-label="ID игрока для дуэли"
                      maxLength={6}
                      onChange={(event) => setDuelTargetId(normalizePlayerId(event.target.value))}
                      placeholder="ID игрока"
                      value={duelTargetId}
                    />
                    <button type="submit">OK</button>
                  </form>
                  <p>Побед в дуэлях: {duelWins}. Введи ID игрока или ищи случайного онлайн.</p>
                </div>
              ) : shopTab === 'players' ? (
                <div className="online-players shop-online-players">
                  <div className="online-players-head">
                    <strong>Игроки онлайн</strong>
                    <button onClick={startDuelSearch} type="button">Дуэль</button>
                  </div>
                  <div className="online-player-list">
                    {onlinePlayers.length === 0 ? (
                      <p className="online-empty">Список пуст. Реальных игроков онлайн нет.</p>
                    ) : onlinePlayers.map((player) => (
                      <button
                        className={duelTargetId === player.id ? 'selected' : ''}
                        key={player.id}
                        onClick={() => {
                          setDuelTargetId(player.id);
                          setShopTab('duel');
                        }}
                        type="button"
                      >
                        <span>{player.name} ID {player.id}</span>
                        <small>{player.title} | сила {formatPower(player.power)}</small>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="shop-panel shop-id-panel">
                  <strong className="player-id">ID {playerId}</strong>
                  <p>Твой ID теперь показывается только в магазине. Другой игрок может ввести его во вкладке Дуэль.</p>
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
                  <small>Награда: {quest.reward}</small>
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

        <div className="weapons magic-weapons">
          <div className="inventory-head">
            <div>
              <p className="label">Магическое оружие</p>
              <strong>{magicWeapons.length > 0 ? `Посохи: ${magicWeapons.length}` : 'Посохи и способности'}</strong>
            </div>
            <button onClick={claimMagicStaffs} type="button">
              Получить посохи
            </button>
          </div>
          <div className={showFullInventory ? 'inventory-list full' : 'inventory-list'}>
            {visibleMagicWeapons.map((weapon) => (
              <button
                className={`weapon weapon-card magic-staff ${rarityClass[weapon.rarity]} weapon-style-${getWeaponStyleIndex(weapon)} ${equippedWeapon?.id === weapon.id ? 'equipped' : ''}`}
                onClick={() => setEquippedWeapon(weapon)}
                key={weapon.id}
              >
                <span className="weapon-picture" aria-hidden="true">
                  <i />
                </span>
                <span className="weapon-name">{weapon.name}</span>
                <small>{weapon.displayDamage ? formatHugeText(weapon.displayDamage) : formatPower(weapon.damage)} | способности снизу</small>
                <small className="weapon-model-label">70м радиус | 100 км/ч | 3с перезарядка</small>
              </button>
            ))}
            {visibleMagicWeapons.length === 0 && (
              <div className="magic-empty">
                <strong>Магические посохи ещё не взяты</strong>
                <span>Нажми “Получить посохи”, потом выбери способность внизу боя.</span>
              </div>
            )}
          </div>
        </div>

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
                  <small>{weapon.rarity} +{isBbiLegendaryWeapon(weapon) ? `${formatPower(bbiLegendaryDamage)} +10000%` : weapon.displayDamage ? formatHugeText(weapon.displayDamage) : formatPower(weapon.damage)} | продажа {formatPower(weaponSellPrice[weapon.rarity])}</small>
                  <small className="weapon-model-label">3D фото: {getWeaponModelName(weapon)}</small>
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

        <div className="adventure-map">
          <div className="map-header">
            <div>
              <p className="label">Карта похода</p>
              <strong>{savedCities.length} / {dragonSons.length} мест пройдено</strong>
            </div>
            <span>{enemy.city}</span>
          </div>
          <div className="map-art" aria-label="Карта пройденных мест">
            <span className="map-sea" />
            <span className="map-river" />
            <span className="map-lake" />
            <span className="map-road main" />
            <span className="map-road branch-one" />
            <span className="map-road branch-two" />
            <span className="map-road branch-three" />
            <span className="map-mountains" />
            <span className="map-hills" />
            <span className="map-forest left" />
            <span className="map-forest middle" />
            <span className="map-forest right" />
            <span className="map-castle" />
            <span className="map-compass">N</span>
            {Array.from({ length: 18 }).map((_, index) => (
              <span className={`map-trail-dot dot-${index}`} key={`trail-${index}`} />
            ))}
            {dragonSons.map((son, index) => {
              const mapPoints = [
                { x: 14, y: 69 },
                { x: 24, y: 45 },
                { x: 40, y: 63 },
                { x: 48, y: 33 },
                { x: 61, y: 73 },
                { x: 70, y: 45 },
                { x: 84, y: 59 },
                { x: 33, y: 82 },
                { x: 57, y: 51 },
                { x: 76, y: 23 },
              ];
              const point = mapPoints[index % mapPoints.length];
              const status = index < savedCities.length ? 'saved' : index === chapter ? 'active' : 'locked';
              return (
                <div
                  className={`map-place ${status}`}
                  key={son.name}
                  style={{ '--x': `${point.x}%`, '--y': `${point.y}%` } as CSSProperties}
                >
                  <span>{index + 1}</span>
                  <strong>{son.city}</strong>
                  <small>{status === 'saved' ? 'Пройдено' : status === 'active' ? 'Сейчас тут' : son.monsterName}</small>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cities" hidden>
          {dragonSons.map((son, index) => (
            <div className={`city ${index < savedCities.length ? 'saved' : index === chapter ? 'active' : ''}`} key={son.name}>
              <span>{index + 1}</span>
              <div>
                <strong>{son.city}</strong>
                <p>{son.country}</p>
                <small>{son.lair}</small>
                <small>Монстры: {son.monsterName} {formatPower(cityMonsters[index])} / {formatPower(monstersPerCity)}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}
    </main>
  );
}

