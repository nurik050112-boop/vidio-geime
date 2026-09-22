import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'gameActiveRef' | 'setHeroHeight' | 'verticalVelocity'>;

export function useGravity(context: Context): void {
  const { gameActiveRef, setHeroHeight, verticalVelocity } = context;
  useEffect(() => {
    const gravityTimer = window.setInterval(() => {
      if (!gameActiveRef.current) return;
      setHeroHeight((height) => {
        if (height === 0 && verticalVelocity.current <= 0) return 0;

        verticalVelocity.current -= 2.2;
        const nextHeight = Math.max(0, height + verticalVelocity.current);
        if (nextHeight === 0) {
          verticalVelocity.current = 0;
        }
        return nextHeight;
      });
    }, 24);

    return () => window.clearInterval(gravityTimer);
  }, []);
}
