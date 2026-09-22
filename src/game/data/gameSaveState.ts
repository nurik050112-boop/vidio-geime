import { browserStorage } from '../../lib/browserStorage';
import { validateGameSave } from '../../lib/validateGameSave';
import { type CollisionBox } from './adminBoss';
import { type Armor,type ArtifactId,type BbiBossStage,type Dungeon,type EndingChoice,type SecretEnding,type ShopItem,type Weapon } from './dragonSon';

export type GameSaveState = {
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

export const gameSaveStorageKey = 'dragon-game-save-v1';

export const heroMaxMana = 100;

export function readGameSave(storageKey = gameSaveStorageKey) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = browserStorage.getItem(storageKey);
    const saved = validateGameSave(JSON.parse(raw ?? 'null'));
    if (raw && !saved) browserStorage.setItem(`${storageKey}-recovery`, raw);
    return saved;
  } catch {
    return null;
  }
}

export function collidesWithBox(x: number, z: number, box: CollisionBox, radius = 0.72) {
  return Math.abs(x - box.x) < box.halfX + radius && Math.abs(z - box.z) < box.halfZ + radius;
}

export function hashSceneKey(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 997;
  }
  return hash;
}

export function getLocationStyle(chapter: number, locationIndex: number, sceneKey: string) {
  return Math.abs(chapter * 3 + locationIndex * 5 + hashSceneKey(sceneKey)) % 14;
}
