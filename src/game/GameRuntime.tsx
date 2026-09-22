import type { User } from '@supabase/supabase-js';
import { GameModelProvider } from './GameContext';
import { GameView } from './GameView';
import { useGameController } from './useGameController';

export function GameRuntime(props: { authUser: User | null; guestMode: boolean }) {
  const model = useGameController(props);
  return <GameModelProvider value={model}><GameView /></GameModelProvider>;
}
