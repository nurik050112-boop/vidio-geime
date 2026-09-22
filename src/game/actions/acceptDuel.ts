import { readDuelRequests,saveDuelRequests } from '../data/isWorldBlockedAt';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'duelOpponent' | 'playerId' | 'playerName' | 'setDuelStatus' | 'setDuelTradeOpen' | 'setDuelTradeOffer' | 'setDuelHeroHp' | 'currentHeroMaxHp' | 'defenseBonus' | 'attackBonus' | 'setDuelOpponentHp' | 'setBattlePulse' | 'playHeroAnimation' | 'setMessage'>;

export function runAcceptDuel(context: Context): void {
  const { duelOpponent, playerId, playerName, setDuelStatus, setDuelTradeOpen, setDuelTradeOffer, setDuelHeroHp, currentHeroMaxHp, defenseBonus, attackBonus, setDuelOpponentHp, setBattlePulse, playHeroAnimation, setMessage } = context;
    if (!duelOpponent) return;
    saveDuelRequests([
      ...readDuelRequests().filter((request) => request.id !== `fight-${playerId}-${duelOpponent.id}`),
      {
        id: `fight-${playerId}-${duelOpponent.id}`,
        kind: 'fight',
        fromId: playerId,
        fromName: playerName,
        toId: duelOpponent.id,
        createdAt: Date.now(),
      },
    ]);
    setDuelStatus('fighting');
    setDuelTradeOpen(false);
    setDuelTradeOffer(null);
    setDuelHeroHp(Math.max(currentHeroMaxHp, 1_000 + defenseBonus + attackBonus));
    setDuelOpponentHp(duelOpponent.power * 4);
    setBattlePulse((pulse) => pulse + 1);
    playHeroAnimation('strike', 500);
    setMessage(`Дуэль началась: ${playerName} против ${duelOpponent.name}. Бей соперника кнопкой удара.`);
  
}
