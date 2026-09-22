import { adminHelmetHealthText,deathSwordDamageText,furySwordDamageText,mansurBladeDamageText,programSwordDamageText } from './adminBoss';
import { type Armor,type Weapon } from './dragonSon';
import { worldWeaponMultiplier } from './isDeathSword';
import { formatPower } from './rarityDamage';

export function createFurySword(): Weapon {
  return {
    id: `fury-sword-${Date.now()}-${Math.random()}`,
    name: 'Фури меч',
    rarity: 'Секретное',
    damage: Number.MAX_SAFE_INTEGER,
    displayDamage: furySwordDamageText,
    price: 0,
  };
}

export function createMansurBlade(): Weapon {
  return {
    id: `mansur-blade-${Date.now()}-${Math.random()}`,
    name: 'Мансур секретный клинок',
    rarity: 'Секретное',
    damage: Number.MAX_SAFE_INTEGER,
    displayDamage: mansurBladeDamageText,
    price: 0,
  };
}

export function createDeathSword(): Weapon {
  return {
    id: `death-sword-${Date.now()}-${Math.random()}`,
    name: 'Смертельный секретный меч',
    rarity: 'Секретное',
    damage: Number.MAX_SAFE_INTEGER,
    displayDamage: deathSwordDamageText,
    price: 0,
  };
}

export function createProgramSword(): Weapon {
  return {
    id: `program-sword-${Date.now()}-${Math.random()}`,
    name: 'Меч програм',
    rarity: 'Секретное',
    damage: Number.MAX_SAFE_INTEGER,
    displayDamage: programSwordDamageText,
    price: 0,
  };
}

export function createBbiLegendarySword(): Weapon {
  return {
    id: `bbi-legendary-sword-${Date.now()}-${Math.random()}`,
    name: 'BBI легендарный меч 3-го города',
    rarity: 'Легендарка',
    damage: Number.MAX_SAFE_INTEGER,
    displayDamage: 'легендарный урон',
    price: 0,
  };
}

export function createAisultanSword(bestDamage: number): Weapon {
  const boostedDamage = Math.min(Number.MAX_SAFE_INTEGER, bestDamage * 1001);
  return {
    id: `aisultan-sea-sword-${Date.now()}-${Math.random()}`,
    name: 'Воденой меч Айсултана',
    rarity: 'Секретное',
    damage: boostedDamage,
    displayDamage: `${formatPower(bestDamage)} +100000%`,
    price: 0,
  };
}

export function createArcaneScepter(): Weapon {
  const damage = Number.MAX_SAFE_INTEGER;
  return {
    id: `arcane-scepter-${Date.now()}-${Math.random()}`,
    name: 'Секретный посох огня',
    rarity: 'Секретное',
    damage,
    displayDamage: '999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999 + все магические атаки x100',
    allMagicSpells: true,
    price: 0,
  };
}

export function createMagicStaff(name: string, level = 1, bonus = 1, magicSpellIndex = 0): Weapon {
  const damage = Math.min(Number.MAX_SAFE_INTEGER, (180_000 + level * 120_000) * worldWeaponMultiplier(Math.max(1, level)) * bonus);
  return {
    id: `arcane-scepter-${name}-${Date.now()}-${Math.random()}`,
    name,
    rarity: 'Секретное',
    damage,
    displayDamage: `${formatPower(damage)} + радиус 70м`,
    magicSpellIndex,
    price: 0,
  };
}

export function createAdminHelmet(): Armor {
  return {
    id: `admin-helmet-${Date.now()}-${Math.random()}`,
    name: 'Админский шлем здоровья',
    rarity: 'Секретное',
    defense: 0,
    displayDefense: `здоровье +${adminHelmetHealthText}`,
    price: 0,
  };
}

export function shouldEquipArmor(currentArmor: Armor | null, nextArmor: Armor) {
  if (currentArmor?.id.startsWith('admin-helmet-')) return false;
  return !currentArmor || nextArmor.defense > currentArmor.defense;
}
