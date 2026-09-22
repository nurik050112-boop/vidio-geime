import type * as React from 'react';
import { useState } from 'react';
import { baseMonsterHp,monsterSpawnDistanceUnits,type NearestMonsterState } from '../data/adminBoss';
import { type ArtifactId,type HeroAnimation } from '../data/dragonSon';
import { heroMaxMana,type GameSaveState } from '../data/gameSaveState';

type Input = {
  savedGameRef: React.MutableRefObject<Partial<GameSaveState> | null>;
};
type State = {
  shopTab: "id" | "upgrades" | "artifacts" | "code" | "duel" | "players";
  setShopTab: React.Dispatch<React.SetStateAction<"id" | "upgrades" | "artifacts" | "code" | "duel" | "players">>;
  shopOpen: boolean;
  setShopOpen: React.Dispatch<React.SetStateAction<boolean>>;
  equippedArtifactId: ArtifactId | null;
  setEquippedArtifactId: React.Dispatch<React.SetStateAction<ArtifactId | null>>;
  heroMana: number;
  setHeroMana: React.Dispatch<React.SetStateAction<number>>;
  showFullInventory: boolean;
  setShowFullInventory: React.Dispatch<React.SetStateAction<boolean>>;
  questPanelOpen: boolean;
  setQuestPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  inventoryPanelOpen: boolean;
  setInventoryPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  heroAnimation: HeroAnimation;
  setHeroAnimation: React.Dispatch<React.SetStateAction<HeroAnimation>>;
  heroPosition: { x: number; z: number; };
  setHeroPosition: React.Dispatch<React.SetStateAction<{ x: number; z: number; }>>;
  heroHeight: number;
  setHeroHeight: React.Dispatch<React.SetStateAction<number>>;
  heroMoving: boolean;
  setHeroMoving: React.Dispatch<React.SetStateAction<boolean>>;
  heroDirection: { x: number; z: number; };
  setHeroDirection: React.Dispatch<React.SetStateAction<{ x: number; z: number; }>>;
  cameraYaw: number;
  setCameraYaw: React.Dispatch<React.SetStateAction<number>>;
  nearestMonster: NearestMonsterState;
  setNearestMonster: React.Dispatch<React.SetStateAction<NearestMonsterState>>;
  mapLocationIndex: number;
  setMapLocationIndex: React.Dispatch<React.SetStateAction<number>>;
  joystickThumb: { x: number; y: number; };
  setJoystickThumb: React.Dispatch<React.SetStateAction<{ x: number; y: number; }>>;
};

export function useShopTabState(input: Input): State {
  const { savedGameRef } = input;

  const [shopTab, setShopTab] = useState<'upgrades' | 'artifacts' | 'code' | 'duel' | 'players' | 'id'>('upgrades');
  const [shopOpen, setShopOpen] = useState(false);
  const [equippedArtifactId, setEquippedArtifactId] = useState<ArtifactId | null>(savedGameRef.current?.equippedArtifactId ?? null);
  const [heroMana, setHeroMana] = useState(savedGameRef.current?.heroMana ?? heroMaxMana);
  const [showFullInventory, setShowFullInventory] = useState(false);
  const [questPanelOpen, setQuestPanelOpen] = useState(false);
  const [inventoryPanelOpen, setInventoryPanelOpen] = useState(false);
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
  return {
    shopTab, setShopTab, shopOpen, setShopOpen, equippedArtifactId, setEquippedArtifactId, heroMana,
    setHeroMana, showFullInventory, setShowFullInventory, questPanelOpen, setQuestPanelOpen,
    inventoryPanelOpen, setInventoryPanelOpen, heroAnimation, setHeroAnimation, heroPosition,
    setHeroPosition, heroHeight, setHeroHeight, heroMoving, setHeroMoving,
    heroDirection, setHeroDirection, cameraYaw, setCameraYaw, nearestMonster,
    setNearestMonster, mapLocationIndex, setMapLocationIndex, joystickThumb, setJoystickThumb
  };
}
