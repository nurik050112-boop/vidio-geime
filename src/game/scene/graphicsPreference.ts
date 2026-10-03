import { browserStorage } from '../../lib/browserStorage';

export type GraphicsMode = 'quality' | 'optimization';

const preferenceKey = 'dragon-game-graphics-mode';
let memoryPreference: GraphicsMode | null = null;

export function getGraphicsMode(): GraphicsMode {
  const saved = browserStorage.getItem(preferenceKey);
  if (saved === 'quality' || saved === 'optimization') return saved;
  if (memoryPreference) return memoryPreference;
  return window.matchMedia('(pointer: coarse), (max-width: 800px)').matches ? 'optimization' : 'quality';
}

export function setGraphicsMode(mode: GraphicsMode) {
  memoryPreference = mode;
  browserStorage.setItem(preferenceKey, mode);
}
