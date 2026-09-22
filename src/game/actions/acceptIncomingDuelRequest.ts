import { makePresenceFallbackArmor,makePresenceFallbackWeapon } from '../data/isWorldBlockedAt';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'incomingDuelRequest' | 'onlinePlayers' | 'currentPlayerPower' | 'setDuelOpponent' | 'setDuelTargetId' | 'setDuelChatMessages' | 'setDuelStatus' | 'setDuelTradeOpen' | 'setMessage' | 'setDuelHeroHp' | 'currentHeroMaxHp' | 'defenseBonus' | 'attackBonus' | 'setDuelOpponentHp' | 'clearIncomingDuelRequest'>;

export function runAcceptIncomingDuelRequest(context: Context): void {
  const { incomingDuelRequest, onlinePlayers, currentPlayerPower, setDuelOpponent, setDuelTargetId, setDuelChatMessages, setDuelStatus, setDuelTradeOpen, setMessage, setDuelHeroHp, currentHeroMaxHp, defenseBonus, attackBonus, setDuelOpponentHp, clearIncomingDuelRequest } = context;
    if (!incomingDuelRequest) return;
    const challenger = onlinePlayers.find((player) => player.id === incomingDuelRequest.fromId) ?? {
      id: incomingDuelRequest.fromId,
      name: incomingDuelRequest.fromName,
      power: Math.max(1_000, currentPlayerPower),
      title: 'игрок онлайн',
      weapon: makePresenceFallbackWeapon(currentPlayerPower),
      armor: makePresenceFallbackArmor(currentPlayerPower),
    };
    setDuelOpponent(challenger);
    setDuelTargetId(challenger.id);
    setDuelChatMessages([
      { id: `system-${Date.now()}`, from: 'Система', text: `${incomingDuelRequest.fromName} отправил ${incomingDuelRequest.kind === 'trade' ? 'обмен' : 'дуэль'}.` },
    ]);
    if (incomingDuelRequest.kind === 'trade') {
      setDuelStatus('challenge');
      setDuelTradeOpen(true);
      setMessage(`Обмен принят. Выбери предмет для обмена с ${challenger.name}.`);
    } else {
      setDuelStatus('fighting');
      setDuelTradeOpen(false);
      setDuelHeroHp(Math.max(currentHeroMaxHp, 1_000 + defenseBonus + attackBonus));
      setDuelOpponentHp(challenger.power * 4);
      setMessage(`Ты принял дуэль от ${challenger.name}. Бой начался на арене.`);
    }
    clearIncomingDuelRequest();
  
}
