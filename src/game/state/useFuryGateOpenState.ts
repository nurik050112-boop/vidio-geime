import type * as React from 'react';
import { useState } from 'react';
import { anuarBombEnemiesTotal,furyDungeonEnemiesTotal,mansurDungeonEnemiesTotal } from '../data/adminBoss';
import { type GameSaveState } from '../data/gameSaveState';

type Input = {
  savedGameRef: React.MutableRefObject<Partial<GameSaveState> | null>;
};
type State = {
  furyGateOpen: boolean;
  setFuryGateOpen: React.Dispatch<React.SetStateAction<boolean>>;
  furyDungeonEntered: boolean;
  setFuryDungeonEntered: React.Dispatch<React.SetStateAction<boolean>>;
  furyMonstersLeft: number;
  setFuryMonstersLeft: React.Dispatch<React.SetStateAction<number>>;
  furyChoiceOpen: boolean;
  setFuryChoiceOpen: React.Dispatch<React.SetStateAction<boolean>>;
  furyKingFightStarted: boolean;
  setFuryKingFightStarted: React.Dispatch<React.SetStateAction<boolean>>;
  anuarGateOpen: boolean;
  setAnuarGateOpen: React.Dispatch<React.SetStateAction<boolean>>;
  anuarWorldEntered: boolean;
  setAnuarWorldEntered: React.Dispatch<React.SetStateAction<boolean>>;
  anuarBombsLeft: number;
  setAnuarBombsLeft: React.Dispatch<React.SetStateAction<number>>;
  anuarKingFightStarted: boolean;
  setAnuarKingFightStarted: React.Dispatch<React.SetStateAction<boolean>>;
  mansurGateOpen: boolean;
  setMansurGateOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mansurDungeonEntered: boolean;
  setMansurDungeonEntered: React.Dispatch<React.SetStateAction<boolean>>;
  mansurMonstersLeft: number;
  setMansurMonstersLeft: React.Dispatch<React.SetStateAction<number>>;
  mansurKingFightStarted: boolean;
  setMansurKingFightStarted: React.Dispatch<React.SetStateAction<boolean>>;
  arailmGateOpen: boolean;
  setArailmGateOpen: React.Dispatch<React.SetStateAction<boolean>>;
  arailmWorldEntered: boolean;
  setArailmWorldEntered: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useFuryGateOpenState(input: Input): State {
  const { savedGameRef } = input;

  const [furyGateOpen, setFuryGateOpen] = useState(savedGameRef.current?.furyGateOpen ?? false);
  const [furyDungeonEntered, setFuryDungeonEntered] = useState(savedGameRef.current?.furyDungeonEntered ?? false);
  const [furyMonstersLeft, setFuryMonstersLeft] = useState(savedGameRef.current?.furyMonstersLeft ?? furyDungeonEnemiesTotal);
  const [furyChoiceOpen, setFuryChoiceOpen] = useState(savedGameRef.current?.furyChoiceOpen ?? false);
  const [furyKingFightStarted, setFuryKingFightStarted] = useState(savedGameRef.current?.furyKingFightStarted ?? false);
  const [anuarGateOpen, setAnuarGateOpen] = useState(savedGameRef.current?.anuarGateOpen ?? false);
  const [anuarWorldEntered, setAnuarWorldEntered] = useState(savedGameRef.current?.anuarWorldEntered ?? false);
  const [anuarBombsLeft, setAnuarBombsLeft] = useState(savedGameRef.current?.anuarBombsLeft ?? anuarBombEnemiesTotal);
  const [anuarKingFightStarted, setAnuarKingFightStarted] = useState(savedGameRef.current?.anuarKingFightStarted ?? false);
  const [mansurGateOpen, setMansurGateOpen] = useState(savedGameRef.current?.mansurGateOpen ?? false);
  const [mansurDungeonEntered, setMansurDungeonEntered] = useState(savedGameRef.current?.mansurDungeonEntered ?? false);
  const [mansurMonstersLeft, setMansurMonstersLeft] = useState(savedGameRef.current?.mansurMonstersLeft ?? mansurDungeonEnemiesTotal);
  const [mansurKingFightStarted, setMansurKingFightStarted] = useState(savedGameRef.current?.mansurKingFightStarted ?? false);
  const [arailmGateOpen, setArailmGateOpen] = useState(savedGameRef.current?.arailmGateOpen ?? false);
  const [arailmWorldEntered, setArailmWorldEntered] = useState(savedGameRef.current?.arailmWorldEntered ?? false);
  return {
    furyGateOpen, setFuryGateOpen, furyDungeonEntered, setFuryDungeonEntered, furyMonstersLeft,
    setFuryMonstersLeft, furyChoiceOpen, setFuryChoiceOpen, furyKingFightStarted, setFuryKingFightStarted,
    anuarGateOpen, setAnuarGateOpen, anuarWorldEntered, setAnuarWorldEntered, anuarBombsLeft,
    setAnuarBombsLeft, anuarKingFightStarted, setAnuarKingFightStarted, mansurGateOpen, setMansurGateOpen,
    mansurDungeonEntered, setMansurDungeonEntered, mansurMonstersLeft, setMansurMonstersLeft, mansurKingFightStarted,
    setMansurKingFightStarted, arailmGateOpen, setArailmGateOpen, arailmWorldEntered, setArailmWorldEntered
  };
}
