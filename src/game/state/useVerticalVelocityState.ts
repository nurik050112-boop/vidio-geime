import type * as React from 'react';
import { useRef,useState } from 'react';
import { baseMonsterHp,heroMaxHp,monsterSpawnDistanceUnits,monstersPerCity,type NearestMonsterState } from '../data/adminBoss';
import { dragonSons } from '../data/arcaneSpells';
import { type GameSaveState } from '../data/gameSaveState';

type Input = {
  cameraYaw: number;
  savedGameRef: React.MutableRefObject<Partial<GameSaveState> | null>;
};
type State = {
  verticalVelocity: React.MutableRefObject<number>;
  heroAnimationTimer: React.MutableRefObject<number | null>;
  pressedKeys: React.MutableRefObject<Set<string>>;
  joystickVector: React.MutableRefObject<{ x: number; z: number; }>;
  movementVelocity: React.MutableRefObject<{ x: number; z: number; }>;
  joystickPointerId: React.MutableRefObject<number | null>;
  cameraYawRef: React.MutableRefObject<number>;
  cameraPointer: React.MutableRefObject<{ id: number; x: number; y: number; moved: boolean; } | null>;
  blockNextStageClick: React.MutableRefObject<boolean>;
  lastMoveAt: React.MutableRefObject<number | null>;
  clickTimesRef: React.MutableRefObject<number[]>;
  monsterChaseStartedAt: React.MutableRefObject<number>;
  nearestMonsterRef: React.MutableRefObject<NearestMonsterState>;
  monsterBotRef: React.MutableRefObject<{ chapter: number; currentMonsters: number; currentMonsterTotal: number; defenseBonus: number; hasAdminHelmet: boolean; heroHp: number; heroPosition: { x: number; z: number; }; isFinalReveal: boolean; nearestMonsterInAggro: boolean; nearestMonsterInPressure: boolean; nearestMonsterInRange: boolean; }>;
  cityMonsters: number[];
  setCityMonsters: React.Dispatch<React.SetStateAction<number[]>>;
  setMonsterAttackCount: React.Dispatch<React.SetStateAction<number>>;
  battlePulse: number;
  setBattlePulse: React.Dispatch<React.SetStateAction<number>>;
  nukePulse: number;
  setNukePulse: React.Dispatch<React.SetStateAction<number>>;
  fireWavePulse: number;
  setFireWavePulse: React.Dispatch<React.SetStateAction<number>>;
  waterWavePulse: number;
  setWaterWavePulse: React.Dispatch<React.SetStateAction<number>>;
  soulFirePulse: number;
  setSoulFirePulse: React.Dispatch<React.SetStateAction<number>>;
  arcanePulse: number;
  setArcanePulse: React.Dispatch<React.SetStateAction<number>>;
};

export function useVerticalVelocityState(input: Input): State {
  const { cameraYaw, savedGameRef } = input;

  const verticalVelocity = useRef(0);
  const heroAnimationTimer = useRef<number | null>(null);
  const pressedKeys = useRef<Set<string>>(new Set());
  const joystickVector = useRef({ x: 0, z: 0 });
  const movementVelocity = useRef({ x: 0, z: 0 });
  const joystickPointerId = useRef<number | null>(null);
  const cameraYawRef = useRef(cameraYaw);
  const cameraPointer = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const blockNextStageClick = useRef(false);
  const lastMoveAt = useRef<number | null>(null);
  const clickTimesRef = useRef<number[]>([]);
  const monsterChaseStartedAt = useRef(Date.now());
  const nearestMonsterRef = useRef<NearestMonsterState>({
    x: -18_000,
    z: -monsterSpawnDistanceUnits,
    hp: baseMonsterHp,
    alive: true,
  });
  const monsterBotRef = useRef({
    chapter: 0,
    currentMonsters: 0,
    currentMonsterTotal: monstersPerCity,
    defenseBonus: 0,
    hasAdminHelmet: false,
    heroHp: heroMaxHp,
    heroPosition: { x: -18_000, z: 0 },
    isFinalReveal: false,
    nearestMonsterInAggro: false,
    nearestMonsterInPressure: false,
    nearestMonsterInRange: false,
  });
  const [cityMonsters, setCityMonsters] = useState(() => savedGameRef.current?.cityMonsters ?? dragonSons.map(() => monstersPerCity));
  const [, setMonsterAttackCount] = useState(0);
  const [battlePulse, setBattlePulse] = useState(0);
  const [nukePulse, setNukePulse] = useState(0);
  const [fireWavePulse, setFireWavePulse] = useState(0);
  const [waterWavePulse, setWaterWavePulse] = useState(0);
  const [soulFirePulse, setSoulFirePulse] = useState(0);
  const [arcanePulse, setArcanePulse] = useState(0);
  return {
    verticalVelocity, heroAnimationTimer, pressedKeys, joystickVector, movementVelocity,
    joystickPointerId, cameraYawRef, cameraPointer, blockNextStageClick, lastMoveAt,
    clickTimesRef, monsterChaseStartedAt, nearestMonsterRef, monsterBotRef, cityMonsters,
    setCityMonsters, setMonsterAttackCount, battlePulse, setBattlePulse, nukePulse,
    setNukePulse, fireWavePulse, setFireWavePulse, waterWavePulse, setWaterWavePulse,
    soulFirePulse, setSoulFirePulse, arcanePulse, setArcanePulse
  };
}
