import type * as React from 'react';
import { useState } from 'react';
import { browserStorage } from '../../lib/browserStorage';
import { type DuelChatMessage,type DuelPlayer,type OnlinePresence } from '../data/dragonSon';
import { readDailyRewardState,readWinStreakState } from '../data/getLocalDateKey';
import { makePlayerId,normalizePlayerId,readLeaderboardPresences,type DailyRewardState,type WinStreakState } from '../data/isWorldBlockedAt';

type State = {
  duelChatMessages: DuelChatMessage[];
  setDuelChatMessages: React.Dispatch<React.SetStateAction<DuelChatMessage[]>>;
  duelChatText: string;
  setDuelChatText: React.Dispatch<React.SetStateAction<string>>;
  onlinePlayers: DuelPlayer[];
  setOnlinePlayers: React.Dispatch<React.SetStateAction<DuelPlayer[]>>;
  leaderboardPlayers: OnlinePresence[];
  setLeaderboardPlayers: React.Dispatch<React.SetStateAction<OnlinePresence[]>>;
  dailyRewardState: DailyRewardState;
  setDailyRewardState: React.Dispatch<React.SetStateAction<DailyRewardState>>;
  dailyRewardText: string;
  setDailyRewardText: React.Dispatch<React.SetStateAction<string>>;
  winStreakState: WinStreakState;
  setWinStreakState: React.Dispatch<React.SetStateAction<WinStreakState>>;
  winStreakText: string;
  setWinStreakText: React.Dispatch<React.SetStateAction<string>>;
  nickname: string;
  playerId: string;
  duelTargetId: string;
  setDuelTargetId: React.Dispatch<React.SetStateAction<string>>;
  levelStatMultiplier: number;
  setLevelStatMultiplier: React.Dispatch<React.SetStateAction<number>>;
  adminCode: string;
  setAdminCode: React.Dispatch<React.SetStateAction<string>>;
  achievementCode: string;
  setAchievementCode: React.Dispatch<React.SetStateAction<string>>;
  achievementCheatActive: boolean;
  setAchievementCheatActive: React.Dispatch<React.SetStateAction<boolean>>;
  achievementMessage: string;
  setAchievementMessage: React.Dispatch<React.SetStateAction<string>>;
};

export function useDuelChatMessagesState(): State {

  const [duelChatMessages, setDuelChatMessages] = useState<DuelChatMessage[]>([]);
  const [duelChatText, setDuelChatText] = useState('');
  const [onlinePlayers, setOnlinePlayers] = useState<DuelPlayer[]>([]);
  const [leaderboardPlayers, setLeaderboardPlayers] = useState<OnlinePresence[]>(() => readLeaderboardPresences());
  const [dailyRewardState, setDailyRewardState] = useState<DailyRewardState>(() => readDailyRewardState());
  const [dailyRewardText, setDailyRewardText] = useState('');
  const [winStreakState, setWinStreakState] = useState<WinStreakState>(() => readWinStreakState());
  const [winStreakText, setWinStreakText] = useState('');
  const nickname = browserStorage.getItem('hero-nickname') ?? 'BBI герой';
  const [playerId] = useState(() => {
    const savedId = browserStorage.getItem('hero-player-id');
    if (savedId) {
      const normalizedId = normalizePlayerId(savedId);
      if (normalizedId.length === 6) {
        browserStorage.setItem('hero-player-id', normalizedId);
        return normalizedId;
      }
    }
    const nextId = makePlayerId();
    browserStorage.setItem('hero-player-id', nextId);
    return nextId;
  });
  const [duelTargetId, setDuelTargetId] = useState('');
  const [levelStatMultiplier, setLevelStatMultiplier] = useState(1);
  const [adminCode, setAdminCode] = useState('');
  const [achievementCode, setAchievementCode] = useState('');
  const [achievementCheatActive, setAchievementCheatActive] = useState(false);
  const [achievementMessage, setAchievementMessage] = useState('');
  return {
    duelChatMessages, setDuelChatMessages, duelChatText, setDuelChatText, onlinePlayers,
    setOnlinePlayers, leaderboardPlayers, setLeaderboardPlayers, dailyRewardState, setDailyRewardState,
    dailyRewardText, setDailyRewardText, winStreakState, setWinStreakState, winStreakText,
    setWinStreakText, nickname, playerId, duelTargetId, setDuelTargetId,
    levelStatMultiplier, setLevelStatMultiplier, adminCode, setAdminCode, achievementCode,
    setAchievementCode, achievementCheatActive, setAchievementCheatActive, achievementMessage, setAchievementMessage
  };
}
