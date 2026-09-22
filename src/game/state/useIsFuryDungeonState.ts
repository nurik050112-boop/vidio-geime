import { useMemo } from 'react';
import { adminBoss,adminHelmetHealthText,heroMaxHp } from '../data/adminBoss';
import { dragonSons,finalDragon,finalDragonSpirit } from '../data/arcaneSpells';
import { aisultanSeaGod,anuarKing,arailmKing,deathGod,dragonFamily,furyKing,goblinKing,mansurKing,seaShark } from '../data/deathGod';
import { type AchievementId,type Armor,type Artifact,type ArtifactId,type BbiBossStage,type Dungeon,type EndingChoice,type Weapon } from '../data/dragonSon';
import { heroMaxMana } from '../data/gameSaveState';
import { bbiBosses } from '../data/getLocalDateKey';
import { getArmorStyleIndex } from '../data/isDeathSword';
import { monsterAvalancheWorld,nuraliBoss } from '../data/isWorldBlockedAt';
import { endingArtifacts,shopBasePower,upgradePower } from '../data/loadUnlockedAchievements';
import { getWeaponStyleIndex,isBbiLegendaryWeapon } from '../data/rarityDamage';

type Input = {
  furyDungeonEntered: boolean;
  furyChoiceOpen: boolean;
  furyKingFightStarted: boolean;
  anuarWorldEntered: boolean;
  anuarKingFightStarted: boolean;
  mansurDungeonEntered: boolean;
  mansurKingFightStarted: boolean;
  arailmWorldEntered: boolean;
  arailmChoiceOpen: boolean;
  arailmKingFightStarted: boolean;
  aisWorldEntered: boolean;
  aisSharkFightStarted: boolean;
  aisFinalChoiceOpen: boolean;
  aisGodFightStarted: boolean;
  adminWorldEntered: boolean;
  adminWorldBossesStarted: boolean;
  adminFinalChoiceOpen: boolean;
  adminBossFightStarted: boolean;
  nuraliWorldEntered: boolean;
  nuraliChoiceOpen: boolean;
  nuraliBossFightStarted: boolean;
  bbiBossStage: BbiBossStage;
  bbiWorldEntered: boolean;
  bbiFinalChoiceOpen: boolean;
  monsterAvalancheEntered: boolean;
  monsterAvalancheEnding: boolean;
  deathGodFightStarted: boolean;
  chapter: number;
  isFinalSpiritBoss: boolean;
  isFinalSpiritWorld: boolean;
  isAdminBoss: boolean;
  isAdminWorldBosses: boolean;
  isAisGodBoss: boolean;
  isAisSharkBoss: boolean;
  isNuraliKingBoss: boolean;
  isArailmKingBoss: boolean;
  isMansurKingBoss: boolean;
  isAnuarKingBoss: boolean;
  isFuryKingBoss: boolean;
  isGoblinKingBoss: boolean;
  isFamilyBoss: boolean;
  isFinalBoss: boolean;
  victory: boolean;
  endingChoice: EndingChoice;
  dungeon: Dungeon | null;
  equippedArmor: Armor | null;
  unlockedAchievements: AchievementId[];
  equippedArtifactId: ArtifactId | null;
  healthLevel: number;
  levelStatMultiplier: number;
  shopLevels: Record<"sword" | "pet" | "clothes" | "helmet" | "armor" | "mana" | "health" | "doubleStrike", number>;
  heroHp: number;
  savedCities: string[];
  equippedWeapon: Weapon | null;
  weapons: Weapon[];
};
type State = {
  isFuryDungeon: boolean;
  isAnuarWorld: boolean;
  isMansurDungeon: boolean;
  isArailmWorld: boolean;
  isAisWorld: boolean;
  isAdminWorld: boolean;
  isNuraliWorld: boolean;
  isBbiBoss: boolean;
  isBbiWorld: boolean;
  isMonsterAvalancheWorld: boolean;
  isDeathGodBoss: boolean;
  currentCityStage: import("../data/dragonSon").DragonSon;
  enemy: import("../data/dragonSon").DragonSon;
  isFinalReveal: boolean;
  isEndingChoice: boolean;
  isDungeon: boolean | undefined;
  hasAdminHelmet: boolean;
  unlockedArtifacts: Artifact[];
  equippedArtifact: Artifact | null;
  artifactHealthMultiplier: number;
  currentHeroMaxHp: number;
  artifactManaMultiplier: number;
  currentHeroMaxMana: number;
  heroHealthText: string;
  heroHealthPercent: number;
  worldBurn: number;
  equippedWeaponStyle: number;
  strongestNonBbiWeaponDamage: number;
  armorBonus: number;
  equippedArmorStyle: number;
};

export function useIsFuryDungeonState(input: Input): State {
  const { furyDungeonEntered, furyChoiceOpen, furyKingFightStarted, anuarWorldEntered, anuarKingFightStarted, mansurDungeonEntered, mansurKingFightStarted, arailmWorldEntered, arailmChoiceOpen, arailmKingFightStarted, aisWorldEntered, aisSharkFightStarted, aisFinalChoiceOpen, aisGodFightStarted, adminWorldEntered, adminWorldBossesStarted, adminFinalChoiceOpen, adminBossFightStarted, nuraliWorldEntered, nuraliChoiceOpen, nuraliBossFightStarted, bbiBossStage, bbiWorldEntered, bbiFinalChoiceOpen, monsterAvalancheEntered, monsterAvalancheEnding, deathGodFightStarted, chapter, isFinalSpiritBoss, isFinalSpiritWorld, isAdminBoss, isAdminWorldBosses, isAisGodBoss, isAisSharkBoss, isNuraliKingBoss, isArailmKingBoss, isMansurKingBoss, isAnuarKingBoss, isFuryKingBoss, isGoblinKingBoss, isFamilyBoss, isFinalBoss, victory, endingChoice, dungeon, equippedArmor, unlockedAchievements, equippedArtifactId, healthLevel, levelStatMultiplier, shopLevels, heroHp, savedCities, equippedWeapon, weapons } = input;

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
  const currentCityStage = dragonSons[Math.max(0, Math.min(chapter, dragonSons.length - 1))] ?? finalDragon;
  const enemy = isDeathGodBoss ? deathGod : isFinalSpiritBoss || isFinalSpiritWorld ? finalDragonSpirit : isMonsterAvalancheWorld ? monsterAvalancheWorld : isAdminBoss ? adminBoss : isAdminWorldBosses ? adminBoss : isAisGodBoss ? aisultanSeaGod : isAisSharkBoss ? seaShark : isNuraliKingBoss ? nuraliBoss : isBbiBoss && bbiBossStage ? bbiBosses[bbiBossStage] : isArailmKingBoss ? arailmKing : isMansurKingBoss ? mansurKing : isAnuarKingBoss ? anuarKing : isFuryKingBoss ? furyKing : isGoblinKingBoss ? goblinKing : isFamilyBoss ? dragonFamily : isFinalBoss ? finalDragon : currentCityStage;
  const isFinalReveal = victory && chapter > dragonSons.length && !isFamilyBoss;
  const isEndingChoice = isFinalReveal && endingChoice === null;
  const isDungeon = dungeon?.entered && !dungeon.cleared;
  const hasAdminHelmet = equippedArmor?.id.startsWith('admin-helmet-') ?? false;
  const unlockedArtifacts = endingArtifacts.filter((artifact) => unlockedAchievements.includes(artifact.ending));
  const equippedArtifact = unlockedArtifacts.find((artifact) => artifact.id === equippedArtifactId) ?? null;
  const artifactHealthMultiplier = equippedArtifact?.healthBonusPercent ? 1 + equippedArtifact.healthBonusPercent / 100 : 1;
  const currentHeroMaxHp = hasAdminHelmet ? Number.MAX_SAFE_INTEGER : Math.floor((heroMaxHp + upgradePower(healthLevel, shopBasePower.health)) * artifactHealthMultiplier * levelStatMultiplier);
  const artifactManaMultiplier = equippedArtifact?.manaBonusPercent ? 1 + equippedArtifact.manaBonusPercent / 100 : 1;
  const currentHeroMaxMana = Math.floor((heroMaxMana + upgradePower(shopLevels.mana, shopBasePower.mana)) * artifactManaMultiplier * levelStatMultiplier);
  const heroHealthText = hasAdminHelmet ? `${adminHelmetHealthText} / ${adminHelmetHealthText}` : `${heroHp} / ${currentHeroMaxHp}`;
  const heroHealthPercent = Math.max(0, Math.min(100, (heroHp / currentHeroMaxHp) * 100));

  const worldBurn = useMemo(() => Math.max(0, 100 - savedCities.length * 13), [savedCities.length]);
  const equippedWeaponStyle = getWeaponStyleIndex(equippedWeapon);
  const strongestNonBbiWeaponDamage = Math.max(1, ...weapons.filter((weapon) => !isBbiLegendaryWeapon(weapon)).map((weapon) => weapon.damage));
  const armorBonus = equippedArmor?.defense ?? 0;
  const equippedArmorStyle = getArmorStyleIndex(equippedArmor);
  return {
    isFuryDungeon, isAnuarWorld, isMansurDungeon, isArailmWorld, isAisWorld,
    isAdminWorld, isNuraliWorld, isBbiBoss, isBbiWorld, isMonsterAvalancheWorld,
    isDeathGodBoss, currentCityStage, enemy, isFinalReveal, isEndingChoice,
    isDungeon, hasAdminHelmet, unlockedArtifacts, equippedArtifact, artifactHealthMultiplier,
    currentHeroMaxHp, artifactManaMultiplier, currentHeroMaxMana, heroHealthText, heroHealthPercent,
    worldBurn, equippedWeaponStyle, strongestNonBbiWeaponDamage, armorBonus, equippedArmorStyle
  };
}
