import { type PointerEvent as ReactPointerEvent } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'gameActiveRef' | 'cameraPointer'>;

export function runStartCameraDrag(context: Context, event: ReactPointerEvent<HTMLDivElement>): void {
  const { gameActiveRef, cameraPointer } = context;
    if (!gameActiveRef.current) return;
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('button, a, input, textarea, select, .mobile-joystick, .arcane-spell-panel')) return;
    cameraPointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  
}
