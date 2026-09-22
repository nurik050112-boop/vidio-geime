import { adminNukeDamageText,adminNukeHiddenDamageText } from './adminBoss';
import { type Armor,type Rarity,type Weapon } from './dragonSon';
import { armorEnchants,armorMaterials,armorParts,rarityDefense,weaponBases,weaponEnchants,weaponMaterials,weaponRunes } from './loadUnlockedAchievements';
import { rarityDamage,rarityPrice } from './rarityDamage';

export function isDeathSword(weapon: Weapon | null) {
  return weapon?.id.startsWith('death-sword-') ?? false;
}

export function isArcaneWeapon(weapon: Weapon | null) {
  return weapon?.id.startsWith('arcane-scepter-') ?? false;
}

export function getArmorStyleIndex(armor: Armor | null) {
  if (!armor) return 0;
  const text = `${armor.id}-${armor.name}-${armor.rarity}`;
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 29 + text.charCodeAt(index)) % 12_345;
  }
  return hash % 12;
}

export function isHelmetArmor(armor: Armor | null) {
  if (!armor) return false;
  return /шлем|маска|корона/i.test(armor.name);
}

export function normalizeCode(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}

export function scaledDragonPower(base: number, chapter: number) {
  const value = base * 10 ** chapter;
  return Number.isFinite(value) ? Math.min(value, Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
}

export function worldWeaponMultiplier(level: number) {
  const exponent = Math.max(0, Math.floor(level) - 1);
  const value = 100 ** exponent;
  return Number.isFinite(value) ? Math.min(value, Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
}

export function rollRarity(multiplier = 1): Rarity | null {
  const roll = Math.random() * 100;
  if (roll < 0.01 * multiplier) return 'Легендарка';
  if (roll < 1 * multiplier) return 'Эпик';
  if (roll < 10 * multiplier) return 'Редкий';
  if (roll < 40 * multiplier) return 'Необычный';
  if (roll < 80 * multiplier) return 'Обычный';
  return null;
}

export function createWeapon(rarity: Rarity, level: number): Weapon {
  const base = weaponBases[Math.floor(Math.random() * weaponBases.length)];
  const material = weaponMaterials[Math.floor(Math.random() * weaponMaterials.length)];
  const enchant = weaponEnchants[Math.floor(Math.random() * weaponEnchants.length)];
  const rune = weaponRunes[Math.floor(Math.random() * weaponRunes.length)];
  const cityMultiplier = worldWeaponMultiplier(level);
  const baseDamage = rarityDamage[rarity] + level * 6 + Math.floor(Math.random() * 12);
  const damage = Math.min(Number.MAX_SAFE_INTEGER, baseDamage * cityMultiplier);

  return {
    id: `${Date.now()}-${Math.random()}`,
    name: `${base} ${material} ${enchant} ${rune}`,
    rarity,
    damage,
    price: Math.min(Number.MAX_SAFE_INTEGER, rarityPrice[rarity] + damage * 10 + level * 35),
  };
}

export function rollWeapon(multiplier: number, level: number) {
  if (Math.random() < 0.000001 * multiplier) {
    return createSecretWeapon(level);
  }

  const rarity = rollRarity(multiplier);
  return rarity ? createWeapon(rarity, level) : null;
}

export function createArmor(rarity: Rarity, level: number): Armor {
  const part = armorParts[Math.floor(Math.random() * armorParts.length)];
  const material = armorMaterials[Math.floor(Math.random() * armorMaterials.length)];
  const enchant = armorEnchants[Math.floor(Math.random() * armorEnchants.length)];
  const defense = rarityDefense[rarity] + level * 5 + Math.floor(Math.random() * 10);

  return {
    id: `armor-${Date.now()}-${Math.random()}`,
    name: `${part} ${material} ${enchant}`,
    rarity,
    defense,
    price: rarityPrice[rarity] + defense * defense * 2 + level * 40,
  };
}

export function rollArmor(multiplier: number, level: number) {
  const rarity = rollRarity(multiplier);
  return rarity ? createArmor(rarity, level) : null;
}

export function rollDungeonWeapon(level: number) {
  const roll = Math.random() * 100;
  if (roll < 0.1) return createSecretWeapon(level + 20);
  if (roll < 5.1) return createWeapon('Легендарка', level + 12);
  if (roll < 35.1) return createWeapon('Эпик', level + 8);
  if (roll < 45.1) return createWeapon('Необычный', level + 4);
  if (roll < 55.1) return createWeapon('Обычный', level + 2);
  return null;
}

export function createSecretWeapon(level = 1): Weapon {
  const damage = Math.min(Number.MAX_SAFE_INTEGER, (rarityDamage['Секретное'] + level * 100_000) * worldWeaponMultiplier(level));
  return {
    id: `secret-${Date.now()}-${Math.random()}`,
    name: 'иди нах',
    rarity: 'Секретное',
    damage,
    price: rarityPrice['Секретное'],
  };
}

export function createAdminNuke(): Weapon {
  return {
    id: `admin-nuke-${Date.now()}-${Math.random()}`,
    name: 'Админская ядерка',
    rarity: 'Секретное',
    damage: 1_000_000,
    displayDamage: adminNukeDamageText,
    hiddenDamageText: adminNukeHiddenDamageText,
    price: 0,
  };
}

export function createBillionSword(): Weapon {
  return {
    id: `billion-sword-${Date.now()}-${Math.random()}`,
    name: 'Меч 999999999',
    rarity: 'Секретное',
    damage: 999_999_999,
    price: 0,
  };
}
