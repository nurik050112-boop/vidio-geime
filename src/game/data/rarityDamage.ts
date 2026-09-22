import { type Rarity,type Weapon } from './dragonSon';
import { isArcaneWeapon } from './isDeathSword';

export const rarityDamage: Record<Rarity, number> = {
  'Обычный': 8,
  'Необычный': 18,
  'Редкий': 42,
  'Эпик': 120,
  'Легендарка': 900,
  'Секретное': 1_000_000,
  'Эксклюзив': Number.MAX_SAFE_INTEGER,
};

export const rarityPrice: Record<Rarity, number> = {
  'Обычный': 40,
  'Необычный': 120,
  'Редкий': 450,
  'Эпик': 3_000,
  'Легендарка': 200_000,
  'Секретное': 999_999_999,
  'Эксклюзив': Number.MAX_SAFE_INTEGER,
};

export const weaponSellPrice: Record<Rarity, number> = {
  'Обычный': 100,
  'Необычный': 500,
  'Редкий': 2_000,
  'Эпик': 10_000,
  'Легендарка': 100_000,
  'Секретное': 1_000_000,
  'Эксклюзив': Number.MAX_SAFE_INTEGER,
};

export const rarityClass: Record<Rarity, string> = {
  'Обычный': 'common',
  'Необычный': 'uncommon',
  'Редкий': 'rare',
  'Эпик': 'epic',
  'Легендарка': 'legendary',
  'Секретное': 'secret',
  'Эксклюзив': 'exclusive',
};

export function formatPower(value: number) {
  if (value >= Number.MAX_SAFE_INTEGER) return '1оерн';

  const tiers = [
    { value: 1e42, suffix: 'уу' },
    { value: 1e39, suffix: 'бб' },
    { value: 1e36, suffix: 'аа' },
    { value: 1e33, suffix: 'сс' },
    { value: 1e30, suffix: 'дк' },
    { value: 1e27, suffix: 'ок' },
    { value: 1e24, suffix: 'сп' },
    { value: 1e21, suffix: 'ск' },
    { value: 1e18, suffix: 'кс' },
    { value: 1e15, suffix: 'кв' },
    { value: 1e12, suffix: 'т' },
    { value: 1e9, suffix: 'в' },
    { value: 1e6, suffix: 'м' },
    { value: 1e3, suffix: 'к' },
  ];

  const tier = tiers.find((item) => Math.abs(value) >= item.value);
  if (!tier) return value.toLocaleString('ru-RU');

  const shortValue = value / tier.value;
  const rounded = shortValue >= 100 ? Math.round(shortValue) : Math.round(shortValue * 10) / 10;
  return `${rounded.toLocaleString('ru-RU')}${tier.suffix}`;
}

export function formatHugeText(value: string) {
  if (value.length > 1000) return '1qghe';
  if (value.length > 100) return '1оерн';
  return value;
}

export function getWeaponStyleIndex(weapon: Weapon | null) {
  if (!weapon) return 0;
  if (isArcaneWeapon(weapon)) return 4;
  if (weapon.id.startsWith('admin-nuke-')) return 18;
  if (isBbiLegendaryWeapon(weapon)) return 19;
  const text = `${weapon.id}-${weapon.name}-${weapon.rarity}`;
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 12_345;
  }
  return hash % 18;
}

export const weaponVisualNames = [
  'Рыцарский меч',
  'Золотая сабля',
  'Тонкая рапира',
  'Двуручный меч',
  'Магический клинок',
  'Серебряный меч',
  'Длинное копье',
  'Боевой шест',
  'Черная катана',
  'Золотой палаш',
  'Боевой лук',
  'Боевой топор',
  'Кривой ятаган',
  'Огненная алебарда',
  'Темная булава',
  'Световой меч',
  'Красный молот',
  'Стальной кинжал',
  'Админская ядерка',
  'BBI огненный легендарный меч',
];

export function getWeaponDisplayName(weapon: Weapon) {
  if (isBbiLegendaryWeapon(weapon)) return 'BBI огненный легендарный меч';
  if (weapon.id.startsWith('admin-nuke-')) return 'Админская ядерка';
  const visualName = weaponVisualNames[getWeaponStyleIndex(weapon)] ?? 'Меч';
  const rarityPrefix = weapon.rarity === 'Обычный' ? '' : `${weapon.rarity} `;
  return `${rarityPrefix}${visualName}`;
}

export function getWeaponModelName(weapon: Weapon) {
  const styleIndex = getWeaponStyleIndex(weapon);
  if (styleIndex === 6 || styleIndex === 13) return 'магический посох с длинной рукоятью';
  if (styleIndex === 10) return 'боевой арбалет для двух рук';
  if (styleIndex === 11 || styleIndex === 16) return 'тяжёлый двуручный топор';
  if (styleIndex === 17) return 'короткий быстрый кинжал';
  if (styleIndex === 3 || styleIndex === 19) return 'большой двуручный меч';
  return 'одноручный клинок с гардой';
}

export function isBbiLegendaryWeapon(weapon: Weapon | null) {
  return weapon?.id.startsWith('bbi-legendary-sword-') ?? false;
}

export function isAdminNuke(weapon: Weapon | null) {
  return weapon?.id.startsWith('admin-nuke-') ?? false;
}

export function isAisultanSword(weapon: Weapon | null) {
  return weapon?.id.startsWith('aisultan-sea-sword-') ?? false;
}
