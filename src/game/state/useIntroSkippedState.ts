import type * as React from 'react';
import { useRef,useState } from 'react';
import { dragonSons } from '../data/arcaneSpells';
import { type EndingChoice,type ShopItem } from '../data/dragonSon';
import { type GameSaveState } from '../data/gameSaveState';

type Input = {
  savedGameRef: React.MutableRefObject<Partial<GameSaveState> | null>;
  chapter: number;
  victory: boolean;
  finalSpiritFightStarted: boolean;
  finalSpiritWorldOpen: boolean;
  endingChoice: EndingChoice;
  goblinKingReady: boolean;
  goblinKingFightStarted: boolean;
  furyKingFightStarted: boolean;
  anuarKingFightStarted: boolean;
  mansurKingFightStarted: boolean;
  arailmKingFightStarted: boolean;
  aisSharkFightStarted: boolean;
  aisGodFightStarted: boolean;
  adminWorldBossesStarted: boolean;
  adminBossFightStarted: boolean;
  nuraliBossFightStarted: boolean;
};
type State = {
  introSkipped: boolean;
  setIntroSkipped: React.Dispatch<React.SetStateAction<boolean>>;
  creatorCreditsOpen: boolean;
  setCreatorCreditsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  paidQuestIds: React.MutableRefObject<Set<number>>;
  audioContextRef: React.MutableRefObject<AudioContext | null>;
  bossMusicStopRef: React.MutableRefObject<(() => void) | null>;
  lastSpokenSceneRef: React.MutableRefObject<string>;
  lastMessageVoiceAtRef: React.MutableRefObject<number>;
  onlinePlayerListRef: React.MutableRefObject<HTMLDivElement | null>;
  onlinePlayerScrollTimer: React.MutableRefObject<number | null>;
  dailyRewardCheckedRef: React.MutableRefObject<boolean>;
  items: Record<"sword" | "pet" | "clothes" | "helmet" | "armor" | "mana" | "health" | "doubleStrike", number>;
  setItems: React.Dispatch<React.SetStateAction<Record<"sword" | "pet" | "clothes" | "helmet" | "armor" | "mana" | "health" | "doubleStrike", number>>>;
  shopLevels: Record<"sword" | "pet" | "clothes" | "helmet" | "armor" | "mana" | "health" | "doubleStrike", number>;
  setShopLevels: React.Dispatch<React.SetStateAction<Record<"sword" | "pet" | "clothes" | "helmet" | "armor" | "mana" | "health" | "doubleStrike", number>>>;
  isFinalBoss: boolean;
  isFinalSpiritBoss: boolean;
  isFinalSpiritWorld: boolean;
  isFamilyBoss: boolean;
  isGoblinKingBoss: boolean;
  isFuryKingBoss: boolean;
  isAnuarKingBoss: boolean;
  isMansurKingBoss: boolean;
  isArailmKingBoss: boolean;
  isAisSharkBoss: boolean;
  isAisGodBoss: boolean;
  isAdminWorldBosses: boolean;
  isAdminBoss: boolean;
  isNuraliKingBoss: boolean;
};

export function useIntroSkippedState(input: Input): State {
  const { savedGameRef, chapter, victory, finalSpiritFightStarted, finalSpiritWorldOpen, endingChoice, goblinKingReady, goblinKingFightStarted, furyKingFightStarted, anuarKingFightStarted, mansurKingFightStarted, arailmKingFightStarted, aisSharkFightStarted, aisGodFightStarted, adminWorldBossesStarted, adminBossFightStarted, nuraliBossFightStarted } = input;

  const [introSkipped, setIntroSkipped] = useState(savedGameRef.current?.introSkipped ?? false);
  const [creatorCreditsOpen, setCreatorCreditsOpen] = useState(false);
  const paidQuestIds = useRef<Set<number>>(new Set(savedGameRef.current?.paidQuestIds ?? []));
  const audioContextRef = useRef<AudioContext | null>(null);
  const bossMusicStopRef = useRef<(() => void) | null>(null);
  const lastSpokenSceneRef = useRef('');
  const lastMessageVoiceAtRef = useRef(0);
  const onlinePlayerListRef = useRef<HTMLDivElement | null>(null);
  const onlinePlayerScrollTimer = useRef<number | null>(null);
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

  const isFinalBoss = chapter >= dragonSons.length && !victory;
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
  return {
    introSkipped, setIntroSkipped, creatorCreditsOpen, setCreatorCreditsOpen, paidQuestIds,
    audioContextRef, bossMusicStopRef, lastSpokenSceneRef, lastMessageVoiceAtRef, onlinePlayerListRef,
    onlinePlayerScrollTimer, dailyRewardCheckedRef, items, setItems, shopLevels,
    setShopLevels, isFinalBoss, isFinalSpiritBoss, isFinalSpiritWorld, isFamilyBoss,
    isGoblinKingBoss, isFuryKingBoss, isAnuarKingBoss, isMansurKingBoss, isArailmKingBoss,
    isAisSharkBoss, isAisGodBoss, isAdminWorldBosses, isAdminBoss, isNuraliKingBoss
  };
}
