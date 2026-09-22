import { type PointerEvent as ReactPointerEvent } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'cameraPointer' | 'blockNextStageClick'>;

export function runStopCameraDrag(context: Context, event: ReactPointerEvent<HTMLDivElement>): void {
  const { cameraPointer, blockNextStageClick } = context;
    const pointer = cameraPointer.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    blockNextStageClick.current = pointer.moved;
    cameraPointer.current = null;
  
}
