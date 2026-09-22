import { useEffect } from 'react';
import { browserStorage } from '../../lib/browserStorage';
import { isSupabaseConfigured,supabase } from '../../lib/supabase';
import { type OnlinePresence } from '../data/dragonSon';
import { readRealtimePresenceEntries,toDuelPlayer } from '../data/getLocalDateKey';
import { presenceStorageKey,readLeaderboardPresences,readOnlinePresences,saveLeaderboardPresences } from '../data/isWorldBlockedAt';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'authUser' | 'guestMode' | 'playerId' | 'playerName' | 'currentPlayerPower' | 'equippedWeapon' | 'equippedArmor' | 'setLeaderboardPlayers' | 'setOnlinePlayers'>;

export function useOnlinePresence(context: Context): void {
  const { authUser, guestMode, playerId, playerName, currentPlayerPower, equippedWeapon, equippedArmor, setLeaderboardPlayers, setOnlinePlayers } = context;
  useEffect(() => {
    if (!authUser && !guestMode) return;

    const presence: OnlinePresence = {
      id: playerId,
      name: playerName,
      power: currentPlayerPower,
      weapon: equippedWeapon,
      armor: equippedArmor,
      updatedAt: Date.now(),
    };
    const rememberPlayers = (players: OnlinePresence[]) => {
      setLeaderboardPlayers(saveLeaderboardPresences([
        ...readLeaderboardPresences(),
        ...players,
        {
          ...presence,
          updatedAt: Date.now(),
        },
      ]));
    };

    rememberPlayers([]);

    if (isSupabaseConfigured && !guestMode) {
      const channel = supabase.channel('dragon-game-online-presence', {
        config: {
          presence: {
            key: playerId,
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const realtimePresences = readRealtimePresenceEntries(channel.presenceState());
          setOnlinePlayers(realtimePresences
            .filter((player) => player.id !== playerId)
            .map(toDuelPlayer));
          rememberPlayers(realtimePresences);
        })
        .subscribe(async (status) => {
          if (status !== 'SUBSCRIBED') return;
          await channel.track({
            ...presence,
            updatedAt: Date.now(),
          });
        });

      return () => {
        channel.untrack();
        supabase.removeChannel(channel);
      };
    }

    function refreshOnlinePlayers() {
      const onlinePresences = readOnlinePresences();
      setOnlinePlayers(onlinePresences
        .filter((player) => player.id !== playerId)
        .map(toDuelPlayer));
      rememberPlayers(onlinePresences);
    }

    function writePresence() {
      const others = readOnlinePresences().filter((player) => player.id !== playerId);
      browserStorage.setItem(presenceStorageKey, JSON.stringify([
        ...others,
        {
          ...presence,
          updatedAt: Date.now(),
        },
      ]));
      refreshOnlinePlayers();
    }

    writePresence();
    const interval = window.setInterval(writePresence, 5_000);
    const onStorage = (event: StorageEvent) => {
      if (event.key === presenceStorageKey) refreshOnlinePlayers();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', onStorage);
    };
  }, [authUser, currentPlayerPower, equippedArmor, equippedWeapon, guestMode, playerId, playerName]);
}
