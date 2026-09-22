import { type PointerEvent as ReactPointerEvent } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'joystickVector' | 'setJoystickThumb'>;

export function runUpdateJoystick(context: Context, event: ReactPointerEvent<HTMLDivElement>): void {
  const { joystickVector, setJoystickThumb } = context;
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rawX = event.clientX - centerX;
    const rawY = event.clientY - centerY;
    const maxRadius = rect.width * 0.36;
    const distance = Math.hypot(rawX, rawY);
    const strength = Math.min(1, distance / maxRadius);
    const angle = Math.atan2(rawY, rawX);
    const thumbX = Math.cos(angle) * strength * maxRadius;
    const thumbY = Math.sin(angle) * strength * maxRadius;
    joystickVector.current = {
      x: Math.cos(angle) * strength,
      z: -Math.sin(angle) * strength,
    };
    setJoystickThumb({ x: thumbX, y: thumbY });
  
}
