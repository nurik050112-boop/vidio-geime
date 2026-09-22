import type * as React from 'react';
import { type User } from '@supabase/supabase-js';
import { useRef,useState } from 'react';
import { baseDragonHp,heroMaxHp } from '../data/adminBoss';
import { type EndingChoice,type SecretEnding } from '../data/dragonSon';
import { gameSaveStorageKey,readGameSave,type GameSaveState } from '../data/gameSaveState';

type Input = {
  location: string;
  authUser: User | null;
};
type State = {
  isWorldPage: boolean;
  isAchievementsPage: boolean;
  saveStorageKey: string;
  initialSave: Partial<GameSaveState> | null;
  savedGameRef: React.MutableRefObject<Partial<GameSaveState> | null>;
  tutorialOpen: boolean;
  setTutorialOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chapter: number;
  setChapter: React.Dispatch<React.SetStateAction<number>>;
  healthLevel: number;
  setHealthLevel: React.Dispatch<React.SetStateAction<number>>;
  heroHp: number;
  setHeroHp: React.Dispatch<React.SetStateAction<number>>;
  enemyHp: number;
  setEnemyHp: React.Dispatch<React.SetStateAction<number>>;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  savedCities: string[];
  setSavedCities: React.Dispatch<React.SetStateAction<string[]>>;
  victory: boolean;
  setVictory: React.Dispatch<React.SetStateAction<boolean>>;
  endingChoice: EndingChoice;
  setEndingChoice: React.Dispatch<React.SetStateAction<EndingChoice>>;
  secretEnding: SecretEnding;
  setSecretEnding: React.Dispatch<React.SetStateAction<SecretEnding>>;
  goblinKingReady: boolean;
  setGoblinKingReady: React.Dispatch<React.SetStateAction<boolean>>;
  goblinKingFightStarted: boolean;
  setGoblinKingFightStarted: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useIsWorldPageState(input: Input): State {
  const { location, authUser } = input;

  const isWorldPage = location === '/world';
  const isAchievementsPage = location === '/achievements';
  const saveStorageKey = authUser ? `${gameSaveStorageKey}-${authUser.id}` : gameSaveStorageKey;
  const [initialSave] = useState(() => readGameSave(saveStorageKey));
  const savedGameRef = useRef(initialSave);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [chapter, setChapter] = useState(savedGameRef.current?.chapter ?? 0);
  const [healthLevel, setHealthLevel] = useState(savedGameRef.current?.healthLevel ?? 0);
  const [heroHp, setHeroHp] = useState(savedGameRef.current?.heroHp ?? heroMaxHp);
  const [enemyHp, setEnemyHp] = useState(savedGameRef.current?.enemyHp ?? baseDragonHp);
  const [message, setMessage] = useState(savedGameRef.current?.message ?? 'Мир горит. Нажимай удар мечом, чтобы очистить первый город.');
  const [savedCities, setSavedCities] = useState<string[]>(savedGameRef.current?.savedCities ?? []);
  const [victory, setVictory] = useState(savedGameRef.current?.victory ?? false);
  const [endingChoice, setEndingChoice] = useState<EndingChoice>(savedGameRef.current?.endingChoice ?? null);
  const [secretEnding, setSecretEnding] = useState<SecretEnding>(savedGameRef.current?.secretEnding ?? null);
  const [goblinKingReady, setGoblinKingReady] = useState(savedGameRef.current?.goblinKingReady ?? false);
  const [goblinKingFightStarted, setGoblinKingFightStarted] = useState(savedGameRef.current?.goblinKingFightStarted ?? false);
  return {
    isWorldPage, isAchievementsPage, saveStorageKey, initialSave, savedGameRef,
    tutorialOpen, setTutorialOpen, chapter, setChapter, healthLevel,
    setHealthLevel, heroHp, setHeroHp, enemyHp, setEnemyHp,
    message, setMessage, savedCities, setSavedCities, victory,
    setVictory, endingChoice, setEndingChoice, secretEnding, setSecretEnding,
    goblinKingReady, setGoblinKingReady, goblinKingFightStarted, setGoblinKingFightStarted
  };
}
