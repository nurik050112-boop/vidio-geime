import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'joystickPointerId' | 'joystickVector' | 'setJoystickThumb' | 'setHeroMoving'>;

export function runResetJoystick(context: Context): void {
  const { joystickPointerId, joystickVector, setJoystickThumb, setHeroMoving } = context;
    joystickPointerId.current = null;
    joystickVector.current = { x: 0, z: 0 };
    setJoystickThumb({ x: 0, y: 0 });
    setHeroMoving(false);
  
}
