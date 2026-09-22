import { arcaneSpellCooldownMs,arcaneSpellRadiusMeters,arcaneSpells,arcaneSpellSpeedKmh,dragonSons } from '../data/arcaneSpells';
import { type AchievementId,type Armor,type EndingChoice,type Quest,type SecretEnding,type Weapon } from '../data/dragonSon';
import { achievements } from '../data/getLocalDateKey';
import { isArcaneWeapon } from '../data/isDeathSword';
import { getPlayerLevelFromKills } from '../data/loadUnlockedAchievements';

type Input = {
  generatedQuests: Quest[];
  savedCities: string[];
  isFinalReveal: boolean;
  endingChoice: EndingChoice;
  isEndingChoice: boolean;
  secretEnding: SecretEnding;
  goblinKingReady: boolean;
  defeatedMonsters: number;
  showFullInventory: boolean;
  weapons: Weapon[];
  armors: Armor[];
  relics: string[];
  attackBonus: number;
  defenseBonus: number;
  currentHeroMaxHp: number;
  equippedWeapon: Weapon | null;
  selectedArcaneSpell: number;
  arcaneSkillReadyAt: number;
  arcaneCooldownNow: number;
  heroMana: number;
  equippedWeaponDamage: number;
  artifactDamageMultiplier: number;
  unlockedAchievements: AchievementId[];
};
type State = {
  quests: Quest[];
  activeQuest: Quest;
  visibleQuests: Quest[];
  completedQuestCount: number;
  playerLevelState: { level: number; killsOnLevel: number; killsNeeded: number; progress: number; };
  playerLevel: number;
  playerLevelProgress: number;
  expectedLevelStatMultiplier: number;
  inventoryPreviewLimit: 80;
  visibleWeapons: Weapon[];
  magicWeapons: Weapon[];
  visibleMagicWeapons: Weapon[];
  visibleArmors: Armor[];
  visibleRelics: string[];
  currentPlayerPower: number;
  hasArcaneWeapon: boolean;
  selectedSpell: (typeof arcaneSpells)[number];
  selectedSpellRadiusMeters: 70;
  selectedSpellSpeedKmh: 100;
  arcaneSkillCooldownMs: 3000;
  arcaneSkillManaCost: 36 | 13 | 18 | 12 | 20 | 32 | 28 | 24 | 26 | 16 | 22 | 34 | 30 | 14 | 21 | 38;
  arcaneSkillRemainingMs: number;
  arcaneSkillReady: boolean;
  arcaneSkillDamage: number;
  allAchievementsUnlocked: boolean;
};

export function useQuestsState(input: Input): State {
  const { generatedQuests, savedCities, isFinalReveal, endingChoice, isEndingChoice, secretEnding, goblinKingReady, defeatedMonsters, showFullInventory, weapons, armors, relics, attackBonus, defenseBonus, currentHeroMaxHp, equippedWeapon, selectedArcaneSpell, arcaneSkillReadyAt, arcaneCooldownNow, heroMana, equippedWeaponDamage, artifactDamageMultiplier, unlockedAchievements } = input;

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
  const completedQuestCount = quests.filter((quest) => quest.done).length;
  const playerLevelState = getPlayerLevelFromKills(defeatedMonsters);
  const playerLevel = playerLevelState.level;
  const playerLevelProgress = playerLevelState.progress;
  const expectedLevelStatMultiplier = 1.1 ** (playerLevel - 1);
  const inventoryPreviewLimit = 80;
  const visibleWeapons = showFullInventory ? weapons : weapons.slice(-inventoryPreviewLimit);
  const magicWeapons = weapons.filter(isArcaneWeapon);
  const visibleMagicWeapons = showFullInventory ? magicWeapons : magicWeapons.slice(-inventoryPreviewLimit);
  const visibleArmors = showFullInventory ? armors : armors.slice(-inventoryPreviewLimit);
  const visibleRelics = showFullInventory ? relics : relics.slice(-inventoryPreviewLimit);
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
  return {
    quests, activeQuest, visibleQuests, completedQuestCount, playerLevelState,
    playerLevel, playerLevelProgress, expectedLevelStatMultiplier, inventoryPreviewLimit, visibleWeapons,
    magicWeapons, visibleMagicWeapons, visibleArmors, visibleRelics, currentPlayerPower,
    hasArcaneWeapon, selectedSpell, selectedSpellRadiusMeters, selectedSpellSpeedKmh, arcaneSkillCooldownMs,
    arcaneSkillManaCost, arcaneSkillRemainingMs, arcaneSkillReady, arcaneSkillDamage, allAchievementsUnlocked
  };
}
