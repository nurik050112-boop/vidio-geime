import { createSecretWeapon,createWeapon,rollArmor } from '../data/isDeathSword';
import { formatPower,getWeaponDisplayName } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'addGold' | 'setShopLevels' | 'setItems' | 'setHealthLevel' | 'setHeroHp' | 'currentHeroMaxHp' | 'chapter' | 'setWeapons' | 'setEquippedWeapon' | 'setArmors' | 'setEquippedArmor'>;

export function runGrantDailyReward(context: Context, day: number): string {
  const { addGold, setShopLevels, setItems, setHealthLevel, setHeroHp, currentHeroMaxHp, chapter, setWeapons, setEquippedWeapon, setArmors, setEquippedArmor } = context;
    // Замечание: здесь лежат награды за рекорд дней захода, меняй этот список если нужны новые подарки.
    if (day === 1) {
      addGold(25_000);
      setShopLevels((levels) => ({ ...levels, sword: levels.sword + 3, health: levels.health + 2 }));
      setItems((items) => ({ ...items, sword: items.sword + 3, health: items.health + 2 }));
      setHealthLevel((level) => level + 2);
      setHeroHp((hp) => Math.min(currentHeroMaxHp, hp + 500));
      return 'День 1: получено 25к монет, +3 урона меча и +2 здоровья.';
    }

    if (day === 2) {
      const weapon = createWeapon('Эпик', Math.max(2, chapter + 2));
      setWeapons((currentWeapons) => [...currentWeapons, weapon]);
      setEquippedWeapon(weapon);
      addGold(75_000);
      return `День 2: 75к монет и эпический меч ${getWeaponDisplayName(weapon)}.`;
    }

    if (day === 3) {
      const armor = rollArmor(100, Math.max(4, chapter + 4));
      if (armor) {
        setArmors((currentArmors) => [...currentArmors, armor]);
        setEquippedArmor(armor);
      }
      setShopLevels((levels) => ({ ...levels, doubleStrike: levels.doubleStrike + 2 }));
      setItems((items) => ({ ...items, doubleStrike: items.doubleStrike + 2 }));
      return `День 3: +2 мультиудара${armor ? ` и броня ${armor.name}` : ''}. Код BBI: bbi.`;
    }

    if (day === 4) {
      const weapon = createWeapon('Легендарка', Math.max(4, chapter + 4));
      setWeapons((currentWeapons) => [...currentWeapons, weapon]);
      setEquippedWeapon(weapon);
      addGold(250_000);
      return `День 4: 250к монет и легендарный меч ${getWeaponDisplayName(weapon)}.`;
    }

    if (day === 5) {
      const weapon = createSecretWeapon(Math.max(5, chapter + 5));
      setWeapons((currentWeapons) => [...currentWeapons, weapon]);
      setEquippedWeapon(weapon);
      addGold(1_000_000);
      return `День 5: 1 миллион монет и секретный меч ${getWeaponDisplayName(weapon)}.`;
    }

    const bonusGold = Math.min(Number.MAX_SAFE_INTEGER, day * day * 100_000);
    const weapon = day % 3 === 0 ? createSecretWeapon(Math.max(day, chapter + day)) : createWeapon(day % 2 === 0 ? 'Легендарка' : 'Эпик', Math.max(day, chapter + day));
    addGold(bonusGold);
    setWeapons((currentWeapons) => [...currentWeapons, weapon]);
    setEquippedWeapon(weapon);
    return `День ${day}: ${formatPower(bonusGold)} монет и оружие серии ${getWeaponDisplayName(weapon)}.`;
  
}
