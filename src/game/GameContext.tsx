import { createContext,useContext } from 'react';
import type { GameViewModel } from './useGameController';

const GameContext = createContext<GameViewModel | null>(null);
export const GameModelProvider = GameContext.Provider;

export function useGameModel() {
  const model = useContext(GameContext);
  if (!model) throw new Error('GameModelProvider is missing');
  return model;
}
