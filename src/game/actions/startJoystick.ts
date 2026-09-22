import { type PointerEvent as ReactPointerEvent } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'gameActiveRef' | 'joystickPointerId' | 'updateJoystick'>;

export function runStartJoystick(context: Context, event: ReactPointerEvent<HTMLDivElement>): void {
  const { gameActiveRef, joystickPointerId, updateJoystick } = context;
    if (!gameActiveRef.current) return;
    if (joystickPointerId.current !== null) return;
    joystickPointerId.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateJoystick(event);
  
}
