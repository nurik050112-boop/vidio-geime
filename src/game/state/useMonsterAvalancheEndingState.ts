import type * as React from 'react';
import { useState } from 'react';
import { finalSpiritMonsterTotal } from '../data/adminBoss';
import { type AchievementId,type Armor,type Dungeon,type Weapon } from '../data/dragonSon';
import { type GameSaveState } from '../data/gameSaveState';
import { loadUnlockedAchievements } from '../data/loadUnlockedAchievements';

type Input = {
  savedGameRef: React.MutableRefObject<Partial<GameSaveState> | null>;
};
type State = {
  monsterAvalancheEnding: boolean;
  setMonsterAvalancheEnding: React.Dispatch<React.SetStateAction<boolean>>;
  finalSpiritWorldOpen: boolean;
  setFinalSpiritWorldOpen: React.Dispatch<React.SetStateAction<boolean>>;
  finalSpiritMonstersLeft: number;
  setFinalSpiritMonstersLeft: React.Dispatch<React.SetStateAction<number>>;
  finalSpiritFightStarted: boolean;
  setFinalSpiritFightStarted: React.Dispatch<React.SetStateAction<boolean>>;
  deathGodFightStarted: boolean;
  setDeathGodFightStarted: React.Dispatch<React.SetStateAction<boolean>>;
  unlockedAchievements: AchievementId[];
  setUnlockedAchievements: React.Dispatch<React.SetStateAction<AchievementId[]>>;
  gold: number;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  goldMultiplier: number;
  setGoldMultiplier: React.Dispatch<React.SetStateAction<number>>;
  infiniteGold: boolean;
  setInfiniteGold: React.Dispatch<React.SetStateAction<boolean>>;
  dungeon: Dungeon | null;
  setDungeon: React.Dispatch<React.SetStateAction<Dungeon | null>>;
  relics: string[];
  setRelics: React.Dispatch<React.SetStateAction<string[]>>;
  weapons: Weapon[];
  setWeapons: React.Dispatch<React.SetStateAction<Weapon[]>>;
  equippedWeapon: Weapon | null;
  setEquippedWeapon: React.Dispatch<React.SetStateAction<Weapon | null>>;
  armors: Armor[];
  setArmors: React.Dispatch<React.SetStateAction<Armor[]>>;
  equippedArmor: Armor | null;
  setEquippedArmor: React.Dispatch<React.SetStateAction<Armor | null>>;
};

export function useMonsterAvalancheEndingState(input: Input): State {
  const { savedGameRef } = input;

  const [monsterAvalancheEnding, setMonsterAvalancheEnding] = useState(savedGameRef.current?.monsterAvalancheEnding ?? false);
  const [finalSpiritWorldOpen, setFinalSpiritWorldOpen] = useState(savedGameRef.current?.finalSpiritWorldOpen ?? false);
  const [finalSpiritMonstersLeft, setFinalSpiritMonstersLeft] = useState(savedGameRef.current?.finalSpiritMonstersLeft ?? finalSpiritMonsterTotal);
  const [finalSpiritFightStarted, setFinalSpiritFightStarted] = useState(savedGameRef.current?.finalSpiritFightStarted ?? false);
  const [deathGodFightStarted, setDeathGodFightStarted] = useState(savedGameRef.current?.deathGodFightStarted ?? false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<AchievementId[]>(loadUnlockedAchievements);
  const [gold, setGold] = useState(savedGameRef.current?.gold ?? 0);
  const [goldMultiplier, setGoldMultiplier] = useState(savedGameRef.current?.goldMultiplier ?? 1);
  const [infiniteGold, setInfiniteGold] = useState(savedGameRef.current?.infiniteGold ?? false);
  const [dungeon, setDungeon] = useState<Dungeon | null>(savedGameRef.current?.dungeon ?? null);
  const [relics, setRelics] = useState<string[]>(savedGameRef.current?.relics ?? []);
  const [weapons, setWeapons] = useState<Weapon[]>(savedGameRef.current?.weapons ?? []);
  const [equippedWeapon, setEquippedWeapon] = useState<Weapon | null>(savedGameRef.current?.equippedWeapon ?? null);
  const [armors, setArmors] = useState<Armor[]>(savedGameRef.current?.armors ?? []);
  const [equippedArmor, setEquippedArmor] = useState<Armor | null>(savedGameRef.current?.equippedArmor ?? null);
  return {
    monsterAvalancheEnding, setMonsterAvalancheEnding, finalSpiritWorldOpen, setFinalSpiritWorldOpen, finalSpiritMonstersLeft,
    setFinalSpiritMonstersLeft, finalSpiritFightStarted, setFinalSpiritFightStarted, deathGodFightStarted, setDeathGodFightStarted,
    unlockedAchievements, setUnlockedAchievements, gold, setGold, goldMultiplier,
    setGoldMultiplier, infiniteGold, setInfiniteGold, dungeon, setDungeon,
    relics, setRelics, weapons, setWeapons, equippedWeapon,
    setEquippedWeapon, armors, setArmors, equippedArmor, setEquippedArmor
  };
}
