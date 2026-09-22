import type * as React from 'react';
import { type Armor,type ArtifactId,type BbiBossStage,type Dungeon,type EndingChoice,type SecretEnding,type Weapon } from '../data/dragonSon';
import { type GameSaveState } from '../data/gameSaveState';

type Input = {
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
  heroPosition: { x: number; z: number; };
  heroDirection: { x: number; z: number; };
  mapLocationIndex: number;
  cityMonsters: number[];
  duelWins: number;
  items: Record<"sword" | "pet" | "clothes" | "helmet" | "armor" | "mana" | "health" | "doubleStrike", number>;
  shopLevels: Record<"sword" | "pet" | "clothes" | "helmet" | "armor" | "mana" | "health" | "doubleStrike", number>;
  introSkipped: boolean;
  paidQuestIds: React.MutableRefObject<Set<number>>;
};
type State = {
  saveState: GameSaveState;
};

export function useSaveStateState(input: Input): State {
  const { chapter, healthLevel, heroHp, enemyHp, message, savedCities, victory, endingChoice, secretEnding, goblinKingReady, goblinKingFightStarted, furyGateOpen, furyDungeonEntered, furyMonstersLeft, furyChoiceOpen, furyKingFightStarted, anuarGateOpen, anuarWorldEntered, anuarBombsLeft, anuarKingFightStarted, mansurGateOpen, mansurDungeonEntered, mansurMonstersLeft, mansurKingFightStarted, arailmGateOpen, arailmWorldEntered, arailmMonstersLeft, arailmChoiceOpen, arailmKingFightStarted, aisGateOpen, aisWorldEntered, aisMonstersLeft, aisSharkFightStarted, aisFinalChoiceOpen, aisGodFightStarted, adminWorldGateOpen, adminWorldEntered, adminWorldMonstersLeft, adminWorldBossesStarted, adminFinalChoiceOpen, adminBossFightStarted, bbiGateOpen, bbiWorldEntered, bbiMonstersLeft, bbiBossStage, bbiFinalChoiceOpen, bbiCityReward, bbiBadEnding, impossibleEnding, nuraliGateOpen, nuraliWorldEntered, nuraliMonstersLeft, nuraliChoiceOpen, nuraliBossFightStarted, monsterAvalancheEntered, monsterAvalancheLeft, monsterAvalancheEnding, finalSpiritWorldOpen, finalSpiritMonstersLeft, finalSpiritFightStarted, deathGodFightStarted, gold, goldMultiplier, infiniteGold, dungeon, relics, weapons, equippedWeapon, armors, equippedArmor, equippedArtifactId, heroMana, heroPosition, heroDirection, mapLocationIndex, cityMonsters, duelWins, items, shopLevels, introSkipped, paidQuestIds } = input;


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
  return {
    saveState
  };
}
