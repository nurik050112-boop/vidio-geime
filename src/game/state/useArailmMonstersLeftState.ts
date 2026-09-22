import type * as React from 'react';
import { useState } from 'react';
import { adminWorldMonsterTotal,aisultanMonsterTotal,arailmEnemiesTotal } from '../data/adminBoss';
import { type GameSaveState } from '../data/gameSaveState';

type Input = {
  savedGameRef: React.MutableRefObject<Partial<GameSaveState> | null>;
};
type State = {
  arailmMonstersLeft: number;
  setArailmMonstersLeft: React.Dispatch<React.SetStateAction<number>>;
  arailmChoiceOpen: boolean;
  setArailmChoiceOpen: React.Dispatch<React.SetStateAction<boolean>>;
  arailmKingFightStarted: boolean;
  setArailmKingFightStarted: React.Dispatch<React.SetStateAction<boolean>>;
  aisGateOpen: boolean;
  setAisGateOpen: React.Dispatch<React.SetStateAction<boolean>>;
  aisWorldEntered: boolean;
  setAisWorldEntered: React.Dispatch<React.SetStateAction<boolean>>;
  aisMonstersLeft: number;
  setAisMonstersLeft: React.Dispatch<React.SetStateAction<number>>;
  aisSharkFightStarted: boolean;
  setAisSharkFightStarted: React.Dispatch<React.SetStateAction<boolean>>;
  aisFinalChoiceOpen: boolean;
  setAisFinalChoiceOpen: React.Dispatch<React.SetStateAction<boolean>>;
  aisGodFightStarted: boolean;
  setAisGodFightStarted: React.Dispatch<React.SetStateAction<boolean>>;
  adminWorldGateOpen: boolean;
  setAdminWorldGateOpen: React.Dispatch<React.SetStateAction<boolean>>;
  adminWorldEntered: boolean;
  setAdminWorldEntered: React.Dispatch<React.SetStateAction<boolean>>;
  adminWorldMonstersLeft: number;
  setAdminWorldMonstersLeft: React.Dispatch<React.SetStateAction<number>>;
  adminWorldBossesStarted: boolean;
  setAdminWorldBossesStarted: React.Dispatch<React.SetStateAction<boolean>>;
  adminFinalChoiceOpen: boolean;
  setAdminFinalChoiceOpen: React.Dispatch<React.SetStateAction<boolean>>;
  adminBossFightStarted: boolean;
  setAdminBossFightStarted: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useArailmMonstersLeftState(input: Input): State {
  const { savedGameRef } = input;

  const [arailmMonstersLeft, setArailmMonstersLeft] = useState(savedGameRef.current?.arailmMonstersLeft ?? arailmEnemiesTotal);
  const [arailmChoiceOpen, setArailmChoiceOpen] = useState(savedGameRef.current?.arailmChoiceOpen ?? false);
  const [arailmKingFightStarted, setArailmKingFightStarted] = useState(savedGameRef.current?.arailmKingFightStarted ?? false);
  const [aisGateOpen, setAisGateOpen] = useState(savedGameRef.current?.aisGateOpen ?? false);
  const [aisWorldEntered, setAisWorldEntered] = useState(savedGameRef.current?.aisWorldEntered ?? false);
  const [aisMonstersLeft, setAisMonstersLeft] = useState(savedGameRef.current?.aisMonstersLeft ?? aisultanMonsterTotal);
  const [aisSharkFightStarted, setAisSharkFightStarted] = useState(savedGameRef.current?.aisSharkFightStarted ?? false);
  const [aisFinalChoiceOpen, setAisFinalChoiceOpen] = useState(savedGameRef.current?.aisFinalChoiceOpen ?? false);
  const [aisGodFightStarted, setAisGodFightStarted] = useState(savedGameRef.current?.aisGodFightStarted ?? false);
  const [adminWorldGateOpen, setAdminWorldGateOpen] = useState(savedGameRef.current?.adminWorldGateOpen ?? false);
  const [adminWorldEntered, setAdminWorldEntered] = useState(savedGameRef.current?.adminWorldEntered ?? false);
  const [adminWorldMonstersLeft, setAdminWorldMonstersLeft] = useState(savedGameRef.current?.adminWorldMonstersLeft ?? adminWorldMonsterTotal);
  const [adminWorldBossesStarted, setAdminWorldBossesStarted] = useState(savedGameRef.current?.adminWorldBossesStarted ?? false);
  const [adminFinalChoiceOpen, setAdminFinalChoiceOpen] = useState(savedGameRef.current?.adminFinalChoiceOpen ?? false);
  const [adminBossFightStarted, setAdminBossFightStarted] = useState(savedGameRef.current?.adminBossFightStarted ?? false);
  return {
    arailmMonstersLeft, setArailmMonstersLeft, arailmChoiceOpen, setArailmChoiceOpen, arailmKingFightStarted,
    setArailmKingFightStarted, aisGateOpen, setAisGateOpen, aisWorldEntered, setAisWorldEntered,
    aisMonstersLeft, setAisMonstersLeft, aisSharkFightStarted, setAisSharkFightStarted, aisFinalChoiceOpen,
    setAisFinalChoiceOpen, aisGodFightStarted, setAisGodFightStarted, adminWorldGateOpen, setAdminWorldGateOpen,
    adminWorldEntered, setAdminWorldEntered, adminWorldMonstersLeft, setAdminWorldMonstersLeft, adminWorldBossesStarted,
    setAdminWorldBossesStarted, adminFinalChoiceOpen, setAdminFinalChoiceOpen, adminBossFightStarted, setAdminBossFightStarted
  };
}
