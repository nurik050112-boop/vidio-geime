import { getWeaponDisplayName } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'duelOpponent' | 'duelTradeOffer' | 'setMessage' | 'setWeapons' | 'equippedWeapon' | 'setEquippedWeapon' | 'setDuelTradeOffer' | 'setDuelTradeOpen' | 'setArmors' | 'equippedArmor' | 'setEquippedArmor'>;

export function runAcceptDuelTrade(context: Context): void {
  const { duelOpponent, duelTradeOffer, setMessage, setWeapons, equippedWeapon, setEquippedWeapon, setDuelTradeOffer, setDuelTradeOpen, setArmors, equippedArmor, setEquippedArmor } = context;
    if (!duelOpponent || !duelTradeOffer) {
      setMessage('Сначала выбери предмет для обмена.');
      return;
    }

    if (duelTradeOffer.kind === 'weapon') {
      const offeredWeapon = duelTradeOffer.item;
      const receivedWeapon = { ...duelOpponent.weapon, id: `${duelOpponent.weapon.id}-${Date.now()}` };
      setWeapons((currentWeapons) => [...currentWeapons.filter((weapon) => weapon.id !== offeredWeapon.id), receivedWeapon]);
      if (equippedWeapon?.id === offeredWeapon.id) setEquippedWeapon(receivedWeapon);
      setDuelTradeOffer(null);
      setDuelTradeOpen(false);
      setMessage(`Обмен принят: ты отдал ${getWeaponDisplayName(offeredWeapon)} и получил ${getWeaponDisplayName(receivedWeapon)} от ${duelOpponent.name}.`);
      return;
    }

    const offeredArmor = duelTradeOffer.item;
    const receivedArmor = { ...duelOpponent.armor, id: `${duelOpponent.armor.id}-${Date.now()}` };
    setArmors((currentArmors) => [...currentArmors.filter((armor) => armor.id !== offeredArmor.id), receivedArmor]);
    if (equippedArmor?.id === offeredArmor.id) setEquippedArmor(receivedArmor);
    setDuelTradeOffer(null);
    setDuelTradeOpen(false);
    setMessage(`Обмен принят: ты отдал ${offeredArmor.name} и получил ${receivedArmor.name} от ${duelOpponent.name}.`);
  
}
