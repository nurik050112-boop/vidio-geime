import { type Armor } from '../data/dragonSon';
import { formatPower } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setArmors' | 'equippedArmor' | 'setEquippedArmor' | 'addGold' | 'setMessage' | 'goldMultiplier'>;

export function runSellArmor(context: Context, armor: Armor): void {
  const { setArmors, equippedArmor, setEquippedArmor, addGold, setMessage, goldMultiplier } = context;
    setArmors((currentArmors) => currentArmors.filter((item) => item.id !== armor.id));
    if (equippedArmor?.id === armor.id) setEquippedArmor(null);
    addGold(armor.price);
    setMessage(`Продана броня: ${armor.name}. Получено ${formatPower(armor.price * goldMultiplier)} золота.`);
  
}
