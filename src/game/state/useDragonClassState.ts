import { monstersPerCity } from '../data/adminBoss';
import { dragonSons } from '../data/arcaneSpells';
import { type Quest,type Weapon } from '../data/dragonSon';

type Input = {
  isDeathGodBoss: boolean;
  isFinalSpiritBoss: boolean;
  isAdminBoss: boolean;
  isAdminWorldBosses: boolean;
  isAisGodBoss: boolean;
  isAisSharkBoss: boolean;
  isBbiBoss: boolean;
  isNuraliKingBoss: boolean;
  isFamilyBoss: boolean;
  isArailmKingBoss: boolean;
  isMansurKingBoss: boolean;
  isAnuarKingBoss: boolean;
  isFuryKingBoss: boolean;
  isGoblinKingBoss: boolean;
  isFinalBoss: boolean;
  chapter: number;
  cityMonsters: number[];
  savedCities: string[];
  weapons: Weapon[];
  relics: string[];
};
type State = {
  dragonClass: string;
  defeatedMonsters: number;
  storyProgress: number;
  cityQuestNames: string[];
  generatedQuests: Quest[];
};

export function useDragonClassState(input: Input): State {
  const { isDeathGodBoss, isFinalSpiritBoss, isAdminBoss, isAdminWorldBosses, isAisGodBoss, isAisSharkBoss, isBbiBoss, isNuraliKingBoss, isFamilyBoss, isArailmKingBoss, isMansurKingBoss, isAnuarKingBoss, isFuryKingBoss, isGoblinKingBoss, isFinalBoss, chapter, cityMonsters, savedCities, weapons, relics } = input;

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
  return {
    dragonClass, defeatedMonsters, storyProgress, cityQuestNames, generatedQuests
  };
}
