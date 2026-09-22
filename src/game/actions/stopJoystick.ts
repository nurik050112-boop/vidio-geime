import { type PointerEvent as ReactPointerEvent } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'joystickPointerId' | 'resetJoystick'>;

export function runStopJoystick(context: Context, event: ReactPointerEvent<HTMLDivElement>): void {
  const { joystickPointerId, resetJoystick } = context;
    if (joystickPointerId.current !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    resetJoystick();
  
}
