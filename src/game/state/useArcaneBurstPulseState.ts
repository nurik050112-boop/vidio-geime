import type * as React from 'react';
import { useState } from 'react';
import { type DuelPlayer,type DuelRequest,type DuelStatus,type DuelTradeOffer } from '../data/dragonSon';
import { type GameSaveState } from '../data/gameSaveState';

type Input = {
  savedGameRef: React.MutableRefObject<Partial<GameSaveState> | null>;
};
type State = {
  arcaneBurstPulse: number;
  setArcaneBurstPulse: React.Dispatch<React.SetStateAction<number>>;
  selectedArcaneSpell: number;
  setSelectedArcaneSpell: React.Dispatch<React.SetStateAction<number>>;
  arcaneSkillReadyAt: number;
  setArcaneSkillReadyAt: React.Dispatch<React.SetStateAction<number>>;
  arcaneCooldownNow: number;
  setArcaneCooldownNow: React.Dispatch<React.SetStateAction<number>>;
  clickDuelPower: number;
  setClickDuelPower: React.Dispatch<React.SetStateAction<number>>;
  clicksPerSecond: number;
  setClicksPerSecond: React.Dispatch<React.SetStateAction<number>>;
  enemyBurning: boolean;
  setEnemyBurning: React.Dispatch<React.SetStateAction<boolean>>;
  duelStatus: DuelStatus;
  setDuelStatus: React.Dispatch<React.SetStateAction<DuelStatus>>;
  duelOpponent: DuelPlayer | null;
  setDuelOpponent: React.Dispatch<React.SetStateAction<DuelPlayer | null>>;
  duelWins: number;
  setDuelWins: React.Dispatch<React.SetStateAction<number>>;
  duelHeroHp: number;
  setDuelHeroHp: React.Dispatch<React.SetStateAction<number>>;
  duelOpponentHp: number;
  setDuelOpponentHp: React.Dispatch<React.SetStateAction<number>>;
  duelTradeOpen: boolean;
  setDuelTradeOpen: React.Dispatch<React.SetStateAction<boolean>>;
  duelTradeOffer: DuelTradeOffer;
  setDuelTradeOffer: React.Dispatch<React.SetStateAction<DuelTradeOffer>>;
  incomingDuelRequest: DuelRequest | null;
  setIncomingDuelRequest: React.Dispatch<React.SetStateAction<DuelRequest | null>>;
};

export function useArcaneBurstPulseState(input: Input): State {
  const { savedGameRef } = input;

  const [arcaneBurstPulse, setArcaneBurstPulse] = useState(0);
  const [selectedArcaneSpell, setSelectedArcaneSpell] = useState(0);
  const [arcaneSkillReadyAt, setArcaneSkillReadyAt] = useState(0);
  const [arcaneCooldownNow, setArcaneCooldownNow] = useState(Date.now());
  const [clickDuelPower, setClickDuelPower] = useState(50);
  const [clicksPerSecond, setClicksPerSecond] = useState(0);
  const [enemyBurning, setEnemyBurning] = useState(false);
  const [duelStatus, setDuelStatus] = useState<DuelStatus>('idle');
  const [duelOpponent, setDuelOpponent] = useState<DuelPlayer | null>(null);
  const [duelWins, setDuelWins] = useState(savedGameRef.current?.duelWins ?? 0);
  const [duelHeroHp, setDuelHeroHp] = useState(0);
  const [duelOpponentHp, setDuelOpponentHp] = useState(0);
  const [duelTradeOpen, setDuelTradeOpen] = useState(false);
  const [duelTradeOffer, setDuelTradeOffer] = useState<DuelTradeOffer>(null);
  const [incomingDuelRequest, setIncomingDuelRequest] = useState<DuelRequest | null>(null);
  return {
    arcaneBurstPulse, setArcaneBurstPulse, selectedArcaneSpell, setSelectedArcaneSpell, arcaneSkillReadyAt,
    setArcaneSkillReadyAt, arcaneCooldownNow, setArcaneCooldownNow, clickDuelPower, setClickDuelPower,
    clicksPerSecond, setClicksPerSecond, enemyBurning, setEnemyBurning, duelStatus,
    setDuelStatus, duelOpponent, setDuelOpponent, duelWins, setDuelWins,
    duelHeroHp, setDuelHeroHp, duelOpponentHp, setDuelOpponentHp, duelTradeOpen,
    setDuelTradeOpen, duelTradeOffer, setDuelTradeOffer, incomingDuelRequest, setIncomingDuelRequest
  };
}
