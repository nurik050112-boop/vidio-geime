import type * as React from 'react';
import { useState } from 'react';
import { bbiMonsterTotal,monsterAvalancheTotal,nuraliMonsterTotal } from '../data/adminBoss';
import { type BbiBossStage } from '../data/dragonSon';
import { type GameSaveState } from '../data/gameSaveState';

type Input = {
  savedGameRef: React.MutableRefObject<Partial<GameSaveState> | null>;
};
type State = {
  bbiGateOpen: boolean;
  setBbiGateOpen: React.Dispatch<React.SetStateAction<boolean>>;
  bbiWorldEntered: boolean;
  setBbiWorldEntered: React.Dispatch<React.SetStateAction<boolean>>;
  bbiMonstersLeft: number;
  setBbiMonstersLeft: React.Dispatch<React.SetStateAction<number>>;
  bbiBossStage: BbiBossStage;
  setBbiBossStage: React.Dispatch<React.SetStateAction<BbiBossStage>>;
  bbiFinalChoiceOpen: boolean;
  setBbiFinalChoiceOpen: React.Dispatch<React.SetStateAction<boolean>>;
  bbiCityReward: boolean;
  setBbiCityReward: React.Dispatch<React.SetStateAction<boolean>>;
  bbiBadEnding: boolean;
  setBbiBadEnding: React.Dispatch<React.SetStateAction<boolean>>;
  impossibleEnding: boolean;
  setImpossibleEnding: React.Dispatch<React.SetStateAction<boolean>>;
  nuraliGateOpen: boolean;
  setNuraliGateOpen: React.Dispatch<React.SetStateAction<boolean>>;
  nuraliWorldEntered: boolean;
  setNuraliWorldEntered: React.Dispatch<React.SetStateAction<boolean>>;
  nuraliMonstersLeft: number;
  setNuraliMonstersLeft: React.Dispatch<React.SetStateAction<number>>;
  nuraliChoiceOpen: boolean;
  setNuraliChoiceOpen: React.Dispatch<React.SetStateAction<boolean>>;
  nuraliBossFightStarted: boolean;
  setNuraliBossFightStarted: React.Dispatch<React.SetStateAction<boolean>>;
  monsterAvalancheEntered: boolean;
  setMonsterAvalancheEntered: React.Dispatch<React.SetStateAction<boolean>>;
  monsterAvalancheLeft: number;
  setMonsterAvalancheLeft: React.Dispatch<React.SetStateAction<number>>;
};

export function useBbiGateOpenState(input: Input): State {
  const { savedGameRef } = input;

  const [bbiGateOpen, setBbiGateOpen] = useState(savedGameRef.current?.bbiGateOpen ?? false);
  const [bbiWorldEntered, setBbiWorldEntered] = useState(savedGameRef.current?.bbiWorldEntered ?? false);
  const [bbiMonstersLeft, setBbiMonstersLeft] = useState(savedGameRef.current?.bbiMonstersLeft ?? bbiMonsterTotal);
  const [bbiBossStage, setBbiBossStage] = useState<BbiBossStage>(savedGameRef.current?.bbiBossStage ?? null);
  const [bbiFinalChoiceOpen, setBbiFinalChoiceOpen] = useState(savedGameRef.current?.bbiFinalChoiceOpen ?? false);
  const [bbiCityReward, setBbiCityReward] = useState(savedGameRef.current?.bbiCityReward ?? false);
  const [bbiBadEnding, setBbiBadEnding] = useState(savedGameRef.current?.bbiBadEnding ?? false);
  const [impossibleEnding, setImpossibleEnding] = useState(savedGameRef.current?.impossibleEnding ?? false);
  const [nuraliGateOpen, setNuraliGateOpen] = useState(savedGameRef.current?.nuraliGateOpen ?? false);
  const [nuraliWorldEntered, setNuraliWorldEntered] = useState(savedGameRef.current?.nuraliWorldEntered ?? false);
  const [nuraliMonstersLeft, setNuraliMonstersLeft] = useState(savedGameRef.current?.nuraliMonstersLeft ?? nuraliMonsterTotal);
  const [nuraliChoiceOpen, setNuraliChoiceOpen] = useState(savedGameRef.current?.nuraliChoiceOpen ?? false);
  const [nuraliBossFightStarted, setNuraliBossFightStarted] = useState(savedGameRef.current?.nuraliBossFightStarted ?? false);
  const [monsterAvalancheEntered, setMonsterAvalancheEntered] = useState(savedGameRef.current?.monsterAvalancheEntered ?? false);
  const [monsterAvalancheLeft, setMonsterAvalancheLeft] = useState(savedGameRef.current?.monsterAvalancheLeft ?? monsterAvalancheTotal);
  return {
    bbiGateOpen, setBbiGateOpen, bbiWorldEntered, setBbiWorldEntered, bbiMonstersLeft,
    setBbiMonstersLeft, bbiBossStage, setBbiBossStage, bbiFinalChoiceOpen, setBbiFinalChoiceOpen,
    bbiCityReward, setBbiCityReward, bbiBadEnding, setBbiBadEnding, impossibleEnding,
    setImpossibleEnding, nuraliGateOpen, setNuraliGateOpen, nuraliWorldEntered, setNuraliWorldEntered,
    nuraliMonstersLeft, setNuraliMonstersLeft, nuraliChoiceOpen, setNuraliChoiceOpen, nuraliBossFightStarted,
    setNuraliBossFightStarted, monsterAvalancheEntered, setMonsterAvalancheEntered, monsterAvalancheLeft, setMonsterAvalancheLeft
  };
}
