import { type CityStage } from './dragonSon';

export const arcaneSpells = [
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

export const firstDragonCities: CityStage[] = [
  { name: 'Игнис', city: 'Клинковая Нора', country: 'Подземное королевство', lair: 'Площадь ржавых ножей под первым городом', monsterKind: 'goblin', monsterName: 'ножевые гоблины', title: 'сын искры', power: 1_000, color: '#ffb703', attackSpeed: 0.85, reaction: 'бьет очень быстро' },
  { name: 'Рубор', city: 'Орочий Вал', country: 'Земли тяжелых племен', lair: 'Крепость наплечников и костяных трофеев', monsterKind: 'orc', monsterName: 'броневые орки', title: 'сын пепла', power: 1_000_000, color: '#fb5607', attackSpeed: 1.3, reaction: 'бьет тяжелее и медленнее' },
  { name: 'Каэрн', city: 'Серый Исполин', country: 'Пепельные холмы', lair: 'Арена каменных великанов с длинными руками', monsterKind: 'giant', monsterName: 'серые великаны', title: 'сын лавы', power: 1_000_000_000, color: '#d00000', attackSpeed: 0.65, reaction: 'молниеносная реакция' },
  { name: 'Сольвар', city: 'Громовая Утесина', country: 'Горные глубины', lair: 'Разлом, где ходят голые пещерные титаны', monsterKind: 'cave-titan', monsterName: 'пещерные титаны', title: 'сын дымного неба', power: 1_000_000_000_000, color: '#8ecae6', attackSpeed: 1.65, reaction: 'выжидает и бьет медленно' },
  { name: 'Мэйдзин', city: 'Камнебрюх', country: 'Серые рудники', lair: 'Шахта круглых каменных громил', monsterKind: 'stone-brute', monsterName: 'каменные громилы', title: 'сын черного огня', power: 1_000_000_000_000_000, color: '#8338ec', attackSpeed: 0.75, reaction: 'атакует рывками' },
  { name: 'Аурокс', city: 'Проволочный Разлом', country: 'Мир пустой кожи', lair: 'Темный зал прозрачных сетчатых монстров', monsterKind: 'wire', monsterName: 'сетчатые твари', title: 'сын раскаленного ветра', power: 1_000_000_000_000_000_000, color: '#3a86ff', attackSpeed: 1.1, reaction: 'держит ровный темп' },
  { name: 'Ноктар', city: 'Белый Слизень', country: 'Холодные болота', lair: 'Скользкая тропа бледных пузатых существ', monsterKind: 'pale', monsterName: 'бледные ходоки', title: 'последний сын дракона', power: 1_000_000_000_000_000_000_000, color: '#06d6a0', attackSpeed: 1.9, reaction: 'медленно готовит ледяной удар' },
];

export const arcaneSpellCooldownMs = 3_000;

export const arcaneSpellRadiusMeters = 70;

export const arcaneSpellSpeedKmh = 100;

export const extraDragonCities = [
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

export const monsterKinds = [
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

export const extraCityStages = [
  { city: 'Зеленая Чешуя', country: 'Болотная империя', lair: 'Лагерь ящеров-громил с железными наплечниками', monsterKind: 'lizard-brute', monsterName: 'ящеры-громилы' },
  { city: 'Пила Черепа', country: 'Черный арсенал', lair: 'Кузница воинов с зубчатыми клинками', monsterKind: 'saw-warrior', monsterName: 'воины с пилой' },
  { city: 'Паучий Фонарь', country: 'Светящаяся паутина', lair: 'Гнездо огромных пещерных пауков', monsterKind: 'spider', monsterName: 'пещерные пауки' },
] as const;

export const dragonColors = ['#ffb703', '#fb5607', '#d00000', '#8ecae6', '#8338ec', '#3a86ff', '#06d6a0'];

export const dragonSons: CityStage[] = [
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

export const finalDragon: CityStage = {
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

export const finalDragonSpirit: CityStage = {
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
