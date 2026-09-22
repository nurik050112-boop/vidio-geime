import { type Weapon } from '../data/dragonSon';
import { formatPower,getWeaponDisplayName,weaponSellPrice } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setWeapons' | 'equippedWeapon' | 'setEquippedWeapon' | 'addGold' | 'setMessage' | 'goldMultiplier'>;

export function runSellWeapon(context: Context, weapon: Weapon): void {
  const { setWeapons, equippedWeapon, setEquippedWeapon, addGold, setMessage, goldMultiplier } = context;
    const sellPrice = weaponSellPrice[weapon.rarity];
    setWeapons((currentWeapons) => currentWeapons.filter((item) => item.id !== weapon.id));
    if (equippedWeapon?.id === weapon.id) setEquippedWeapon(null);
    addGold(sellPrice);
    setMessage(`Продано оружие: ${getWeaponDisplayName(weapon)}. Получено ${formatPower(sellPrice * goldMultiplier)} золота.`);
  
}
