import { useEffect } from 'react';
import { movementKeys } from '../controls';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'gameActiveRef' | 'pressedKeys' | 'verticalVelocity' | 'playHeroAnimation' | 'resetJoystick' | 'movementVelocity' | 'setHeroMoving'>;

export function useKeyboardMovement(context: Context): void {
  const { gameActiveRef, pressedKeys, verticalVelocity, playHeroAnimation, resetJoystick, movementVelocity, setHeroMoving } = context;
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!gameActiveRef.current) return;
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (isTyping) return;
      const key = event.key.toLowerCase();
      const code = event.code.toLowerCase();
      if (movementKeys.includes(key) || movementKeys.includes(code)) {
        pressedKeys.current.add(key);
        pressedKeys.current.add(code);
        event.preventDefault();
      }
      if (event.code === 'Space' && !event.repeat && verticalVelocity.current === 0) {
        if (target instanceof HTMLElement && target.closest('button, a')) return;
        event.preventDefault();
        verticalVelocity.current = 24;
        playHeroAnimation('step', 360);
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      pressedKeys.current.delete(event.key.toLowerCase());
      pressedKeys.current.delete(event.code.toLowerCase());
    }

    function resetMovementInput() {
      resetJoystick();
      pressedKeys.current.clear();
      movementVelocity.current = { x: 0, z: 0 };
      setHeroMoving(false);
    }

    function onVisibilityChange() {
      if (document.hidden) resetMovementInput();
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', resetMovementInput);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', resetMovementInput);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);
}
