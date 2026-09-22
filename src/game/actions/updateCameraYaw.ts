import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'cameraYawRef' | 'setCameraYaw'>;

export function runUpdateCameraYaw(context: Context, nextYaw: number): void {
  const { cameraYawRef, setCameraYaw } = context;
    cameraYawRef.current = nextYaw;
    setCameraYaw(nextYaw);
  
}
