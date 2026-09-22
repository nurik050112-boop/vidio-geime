import { type DuelPlayer,type DuelRequest } from '../data/dragonSon';
import { makePresenceFallbackArmor,makePresenceFallbackWeapon } from '../data/isWorldBlockedAt';

type Input = {
  incomingDuelRequest: DuelRequest | null;
  onlinePlayers: DuelPlayer[];
  currentPlayerPower: number;
};
type State = {
  incomingRequestPlayer: DuelPlayer | null;
};

export function useIncomingRequestPlayerState(input: Input): State {
  const { incomingDuelRequest, onlinePlayers, currentPlayerPower } = input;


  const incomingRequestPlayer = incomingDuelRequest
    ? onlinePlayers.find((player) => player.id === incomingDuelRequest.fromId) ?? {
      id: incomingDuelRequest.fromId,
      name: incomingDuelRequest.fromName,
      power: Math.max(1_000, currentPlayerPower),
      title: 'игрок онлайн',
      weapon: makePresenceFallbackWeapon(currentPlayerPower),
      armor: makePresenceFallbackArmor(currentPlayerPower),
    }
    : null;
  return {
    incomingRequestPlayer
  };
}
