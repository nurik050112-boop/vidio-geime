import { adminFinalBossHp,adminWorldBossesHp,adminWorldMonsterHp,aisultanMonsterHp,aisultanSeaGodHp,aisultanSharkHp,baseDragonHp,baseMonsterHp,bbiMonsterHp,finalSpiritMonsterHp,meleeRangeUnits,monsterAggroDistanceUnits,monsterAvalancheHp,monsterPressureRangeUnits,nuraliBossHp,nuraliMonsterHp,type NearestMonsterState } from '../data/adminBoss';
import { dragonSons } from '../data/arcaneSpells';
import { type Armor,type Artifact,type ArtifactId,type BbiBossStage,type Dungeon,type Weapon } from '../data/dragonSon';
import { bbiBosses } from '../data/getLocalDateKey';
import { isHelmetArmor,scaledDragonPower } from '../data/isDeathSword';
import { shopBasePower,upgradePower } from '../data/loadUnlockedAchievements';
import { isAdminNuke,isAisultanSword } from '../data/rarityDamage';

type Input = {
  equippedArmor: Armor | null;
  equippedArtifact: Artifact | null;
  items: Record<"sword" | "pet" | "clothes" | "helmet" | "armor" | "mana" | "health" | "doubleStrike", number>;
  armorBonus: number;
  levelStatMultiplier: number;
  equippedArtifactId: ArtifactId | null;
  equippedWeapon: Weapon | null;
  enemy: import("../data/dragonSon").DragonSon;
  chapter: number;
  isDeathGodBoss: boolean;
  isFinalSpiritBoss: boolean;
  isAdminBoss: boolean;
  isAdminWorldBosses: boolean;
  isAisSharkBoss: boolean;
  isAisGodBoss: boolean;
  isNuraliKingBoss: boolean;
  isBbiBoss: boolean;
  isFinalBoss: boolean;
  isFamilyBoss: boolean;
  isGoblinKingBoss: boolean;
  isFuryKingBoss: boolean;
  isAnuarKingBoss: boolean;
  isMansurKingBoss: boolean;
  isArailmKingBoss: boolean;
  isFinalSpiritWorld: boolean;
  finalSpiritMonstersLeft: number;
  isMonsterAvalancheWorld: boolean;
  monsterAvalancheLeft: number;
  isAdminWorld: boolean;
  adminWorldMonstersLeft: number;
  isAisWorld: boolean;
  aisMonstersLeft: number;
  isNuraliWorld: boolean;
  nuraliMonstersLeft: number;
  isBbiWorld: boolean;
  bbiMonstersLeft: number;
  isArailmWorld: boolean;
  arailmMonstersLeft: number;
  isMansurDungeon: boolean;
  mansurMonstersLeft: number;
  isAnuarWorld: boolean;
  anuarBombsLeft: number;
  isFuryDungeon: boolean;
  furyMonstersLeft: number;
  isDungeon: boolean | undefined;
  dungeon: Dungeon | null;
  cityMonsters: number[];
  isFinalReveal: boolean;
  nearestMonster: NearestMonsterState;
  heroPosition: { x: number; z: number; };
  bbiBossStage: BbiBossStage;
  strongestNonBbiWeaponDamage: number;
};
type State = {
  equippedIsHelmet: boolean;
  artifactDefenseMultiplier: number;
  artifactLuckMultiplier: number;
  defenseBonus: number;
  artifactDamageMultiplier: number;
  artifactGoldMultiplier: number;
  artifactAttackSpeedMultiplier: number;
  waterSwordArtifactMultiplier: 1 | 11;
  equippedWeaponDamage: number;
  reward: number;
  currentMonsters: number;
  musicKey: "family" | "final" | "ending" | "admin" | "ais" | "nurali" | "bbi" | "arailm" | "mansur" | "anuar" | "fury" | "goblin" | "death" | "admin-world" | "ais-world" | "nurali-world" | "bbi-world" | "arailm-world" | "mansur-world" | "anuar-world" | "fury-world" | "dungeon" | "world";
  currentMonsterHp: 1000;
  nearestMonsterDistanceUnits: number;
  nearestMonsterDistanceMeters: number;
  nearestMonsterInAggro: boolean;
  nearestMonsterInPressure: boolean;
  nearestMonsterInRange: boolean;
  kingDragonHp: number;
  finalSpiritDragonHp: number;
  deathGodHp: number;
  currentDragonHp: number;
  bbiLegendaryDamage: number;
  deathSwordMultiplier: 1 | 7.66;
};

export function useEquippedIsHelmetState(input: Input): State {
  const { equippedArmor, equippedArtifact, items, armorBonus, levelStatMultiplier, equippedArtifactId, equippedWeapon, enemy, chapter, isDeathGodBoss, isFinalSpiritBoss, isAdminBoss, isAdminWorldBosses, isAisSharkBoss, isAisGodBoss, isNuraliKingBoss, isBbiBoss, isFinalBoss, isFamilyBoss, isGoblinKingBoss, isFuryKingBoss, isAnuarKingBoss, isMansurKingBoss, isArailmKingBoss, isFinalSpiritWorld, finalSpiritMonstersLeft, isMonsterAvalancheWorld, monsterAvalancheLeft, isAdminWorld, adminWorldMonstersLeft, isAisWorld, aisMonstersLeft, isNuraliWorld, nuraliMonstersLeft, isBbiWorld, bbiMonstersLeft, isArailmWorld, arailmMonstersLeft, isMansurDungeon, mansurMonstersLeft, isAnuarWorld, anuarBombsLeft, isFuryDungeon, furyMonstersLeft, isDungeon, dungeon, cityMonsters, isFinalReveal, nearestMonster, heroPosition, bbiBossStage, strongestNonBbiWeaponDamage } = input;

  const equippedIsHelmet = isHelmetArmor(equippedArmor);
  const artifactDefenseMultiplier = equippedArtifact?.defenseBonusPercent ? 1 + equippedArtifact.defenseBonusPercent / 100 : 1;
  const artifactLuckMultiplier = equippedArtifact?.luckBonusPercent ? 1 + equippedArtifact.luckBonusPercent / 100 : 1;
  const defenseBonus = Math.floor((upgradePower(items.clothes, shopBasePower.clothes) + upgradePower(items.helmet, shopBasePower.helmet) + upgradePower(items.armor, shopBasePower.armor) + armorBonus) * artifactDefenseMultiplier * levelStatMultiplier);
  const artifactDamageMultiplier = (equippedArtifact ? 1 + equippedArtifact.bonusPercent / 100 : 1) * levelStatMultiplier;
  const artifactGoldMultiplier = equippedArtifact ? 1 + equippedArtifact.goldBonusPercent / 100 : 1;
  const artifactAttackSpeedMultiplier = equippedArtifact ? 1 + equippedArtifact.attackSpeedPercent / 100 : 1;
  const waterSwordArtifactMultiplier = equippedArtifactId === 'seaPearl' && isAisultanSword(equippedWeapon) ? 11 : 1;
  const equippedWeaponDamage = isAdminNuke(equippedWeapon) ? 1_000_000 : equippedWeapon?.damage ?? 0;
  const reward = enemy ? 120 + chapter * 110 : 0;
  const currentMonsters = isDeathGodBoss || isFinalSpiritBoss || isAdminBoss || isAdminWorldBosses || isAisSharkBoss || isAisGodBoss || isNuraliKingBoss || isBbiBoss || isFinalBoss || isFamilyBoss || isGoblinKingBoss || isFuryKingBoss || isAnuarKingBoss || isMansurKingBoss || isArailmKingBoss ? 0 : isFinalSpiritWorld ? finalSpiritMonstersLeft : isMonsterAvalancheWorld ? monsterAvalancheLeft : isAdminWorld ? adminWorldMonstersLeft : isAisWorld ? aisMonstersLeft : isNuraliWorld ? nuraliMonstersLeft : isBbiWorld ? bbiMonstersLeft : isArailmWorld ? arailmMonstersLeft : isMansurDungeon ? mansurMonstersLeft : isAnuarWorld ? anuarBombsLeft : isFuryDungeon ? furyMonstersLeft : isDungeon && dungeon ? dungeon.enemiesLeft : cityMonsters[chapter] ?? 0;
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
  const currentDragonHp = isDeathGodBoss ? deathGodHp : isFinalSpiritBoss ? finalSpiritDragonHp : isAdminBoss ? adminFinalBossHp : isAdminWorldBosses ? adminWorldBossesHp : isAisGodBoss ? aisultanSeaGodHp : isAisSharkBoss ? aisultanSharkHp : isNuraliKingBoss ? nuraliBossHp : isBbiBoss && bbiBossStage ? bbiBosses[bbiBossStage].power : isArailmKingBoss ? scaledDragonPower(baseDragonHp, 15) : isMansurKingBoss ? scaledDragonPower(baseDragonHp, chapter + 7) : isAnuarKingBoss ? scaledDragonPower(baseDragonHp, chapter + 6) : isFuryKingBoss ? scaledDragonPower(baseDragonHp, 10) : isGoblinKingBoss ? scaledDragonPower(baseDragonHp, chapter + 4) : isFamilyBoss ? kingDragonHp * 2 : isFinalBoss ? kingDragonHp : scaledDragonPower(baseDragonHp, chapter);
  const bbiLegendaryDamage = Math.min(Number.MAX_SAFE_INTEGER, strongestNonBbiWeaponDamage * 100);
  const deathSwordMultiplier = equippedArtifactId === 'godHead' && equippedWeapon?.id.startsWith('death-sword-') ? 7.66 : 1;
  return {
    equippedIsHelmet, artifactDefenseMultiplier, artifactLuckMultiplier, defenseBonus, artifactDamageMultiplier,
    artifactGoldMultiplier, artifactAttackSpeedMultiplier, waterSwordArtifactMultiplier, equippedWeaponDamage, reward,
    currentMonsters, musicKey, currentMonsterHp, nearestMonsterDistanceUnits, nearestMonsterDistanceMeters,
    nearestMonsterInAggro, nearestMonsterInPressure, nearestMonsterInRange, kingDragonHp, finalSpiritDragonHp,
    deathGodHp, currentDragonHp, bbiLegendaryDamage, deathSwordMultiplier
  };
}
