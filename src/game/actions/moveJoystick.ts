import { type PointerEvent as ReactPointerEvent } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'joystickPointerId' | 'updateJoystick'>;

export function runMoveJoystick(context: Context, event: ReactPointerEvent<HTMLDivElement>): void {
  const { joystickPointerId, updateJoystick } = context;
    if (joystickPointerId.current !== event.pointerId) return;
    updateJoystick(event);
  
}
