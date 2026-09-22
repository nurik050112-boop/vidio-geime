import type { GameSaveState } from '../game/data/gameSaveState';

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const rarities = ['Обычный', 'Необычный', 'Редкий', 'Эпик', 'Легендарка', 'Секретное', 'Эксклюзив'];
const equipment = (value: unknown, stat: string) => object(value) && typeof value.id === 'string'
  && typeof value.name === 'string' && rarities.includes(String(value.rarity)) && number(value[stat]) && number(value.price);
const upgrades = (value: unknown) => object(value) && ['sword', 'pet', 'clothes', 'helmet', 'armor', 'mana', 'health', 'doubleStrike']
  .every(key => Number.isSafeInteger(value[key]) && number(value[key]));
const point = (value: unknown) => object(value) && ['x', 'z'].every(key => typeof value[key] === 'number' && Number.isFinite(value[key]));

export function validateGameSave(value: unknown): Partial<GameSaveState> | null {
  if (!object(value) || value.version !== 1) return null;
  const stringArrays = ['savedCities', 'relics'];
  const numberArrays = ['cityMonsters', 'paidQuestIds'];
  const nullableStrings = ['endingChoice', 'secretEnding', 'bbiBossStage', 'equippedArtifactId'];
  for (const [key, entry] of Object.entries(value)) {
    if (entry === undefined) continue;
    if (stringArrays.includes(key)) { if (!Array.isArray(entry) || !entry.every(item => typeof item === 'string')) return null; }
    else if (numberArrays.includes(key)) { if (!Array.isArray(entry) || !entry.every(number)) return null; }
    else if (key === 'weapons' || key === 'armors') {
      if (!Array.isArray(entry) || !entry.every(item => equipment(item, key === 'weapons' ? 'damage' : 'defense'))) return null;
    } else if (key === 'equippedWeapon' || key === 'equippedArmor') {
      if (entry !== null && !equipment(entry, key === 'equippedWeapon' ? 'damage' : 'defense')) return null;
    } else if (key === 'items' || key === 'shopLevels') { if (!upgrades(entry)) return null; }
    else if (key === 'heroPosition' || key === 'heroDirection') { if (!point(entry)) return null; }
    else if (key === 'dungeon') {
      if (entry !== null && (!object(entry) || typeof entry.city !== 'string' || !number(entry.danger) || !number(entry.enemiesLeft)
        || !['cleared', 'entered', 'declined'].every(flag => typeof entry[flag] === 'boolean'))) return null;
    } else if (nullableStrings.includes(key)) { if (entry !== null && typeof entry !== 'string') return null; }
    else if (key === 'message') { if (typeof entry !== 'string') return null; }
    else if (['chapter', 'healthLevel', 'heroHp', 'enemyHp', 'savedAt', 'version', 'gold', 'goldMultiplier', 'heroMana', 'mapLocationIndex', 'duelWins'].includes(key)
      || key.endsWith('Left')) { if (!number(entry)) return null; }
    else if (typeof entry !== 'boolean') return null;
  }
  if (value.chapter !== undefined && (!Number.isSafeInteger(value.chapter) || Number(value.chapter) > 1000)) return null;
  if (value.bbiBossStage != null && !['manager', 'director', 'final'].includes(String(value.bbiBossStage))) return null;
  return value as Partial<GameSaveState>;
}
