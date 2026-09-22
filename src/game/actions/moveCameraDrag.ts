import { type PointerEvent as ReactPointerEvent } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'cameraPointer' | 'updateCameraYaw' | 'cameraYawRef'>;

export function runMoveCameraDrag(context: Context, event: ReactPointerEvent<HTMLDivElement>): void {
  const { cameraPointer, updateCameraYaw, cameraYawRef } = context;
    const pointer = cameraPointer.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (Math.hypot(dx, dy) > 3) pointer.moved = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    updateCameraYaw(cameraYawRef.current - dx * 0.006);
    event.preventDefault();
  
}
