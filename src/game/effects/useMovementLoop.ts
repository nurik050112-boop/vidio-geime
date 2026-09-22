import { useEffect } from 'react';
import { backwardKeys,cameraRelativeDirection,forwardKeys,leftKeys,rightKeys,sprintKeys } from '../controls';
import { heroMoveSpeedPerSecond,heroRunSpeedPerSecond } from '../data/adminBoss';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'gameActiveRef' | 'lastMoveAt' | 'pressedKeys' | 'joystickVector' | 'cameraYawRef' | 'movementVelocity' | 'setHeroMoving' | 'setHeroDirection' | 'moveHero'>;

export function useMovementLoop(context: Context): void {
  const { gameActiveRef, lastMoveAt, pressedKeys, joystickVector, cameraYawRef, movementVelocity, setHeroMoving, setHeroDirection, moveHero } = context;
  useEffect(() => {
    let frame = 0;
    const tickMovement = () => {
      if (!gameActiveRef.current) {
        lastMoveAt.current = null;
        frame = window.requestAnimationFrame(tickMovement);
        return;
      }
      const now = performance.now();
      const deltaSeconds = lastMoveAt.current === null ? 0.016 : Math.min(0.05, (now - lastMoveAt.current) / 1000);
      lastMoveAt.current = now;
      const keys = pressedKeys.current;
      let keyboardX = 0;
      let keyboardZ = 0;
      if (forwardKeys.some((key) => keys.has(key))) keyboardZ += 1;
      if (backwardKeys.some((key) => keys.has(key))) keyboardZ -= 1;
      if (leftKeys.some((key) => keys.has(key))) keyboardX -= 1;
      if (rightKeys.some((key) => keys.has(key))) keyboardX += 1;
      const keyboardLength = Math.hypot(keyboardX, keyboardZ);
      if (keyboardLength > 1) {
        keyboardX /= keyboardLength;
        keyboardZ /= keyboardLength;
      }
      const rawInputX = keyboardX + joystickVector.current.x;
      const rawInputZ = keyboardZ + joystickVector.current.z;
      const rawInputLength = Math.hypot(rawInputX, rawInputZ);
      const inputStrength = Math.min(1, rawInputLength);
      const hasInput = inputStrength > 0.05;
      const localX = hasInput ? rawInputX / rawInputLength : 0;
      const localZ = hasInput ? rawInputZ / rawInputLength : 0;
      const yaw = cameraYawRef.current;
      const targetDirection = hasInput
        ? cameraRelativeDirection(localX, localZ, yaw)
        : { x: 0, z: 0 };
      const isSprinting = sprintKeys.some((key) => keys.has(key));
      const targetSpeed = hasInput ? (isSprinting ? heroRunSpeedPerSecond : heroMoveSpeedPerSecond) * inputStrength : 0;
      const currentVelocity = movementVelocity.current;
      const acceleration = hasInput ? 7.5 : 10.5;
      const blend = 1 - Math.exp(-deltaSeconds * acceleration);
      const nextVelocity = {
        x: currentVelocity.x + (targetDirection.x * targetSpeed - currentVelocity.x) * blend,
        z: currentVelocity.z + (targetDirection.z * targetSpeed - currentVelocity.z) * blend,
      };
      if (!hasInput && Math.hypot(nextVelocity.x, nextVelocity.z) < heroMoveSpeedPerSecond * 0.025) {
        nextVelocity.x = 0;
        nextVelocity.z = 0;
      }
      movementVelocity.current = nextVelocity;
      const nextSpeed = Math.hypot(nextVelocity.x, nextVelocity.z);
      const moving = hasInput || nextSpeed > heroMoveSpeedPerSecond * 0.035;
      setHeroMoving(moving);
      if (nextSpeed > heroMoveSpeedPerSecond * 0.02) {
        const direction = { x: nextVelocity.x / Math.max(1, nextSpeed), z: nextVelocity.z / Math.max(1, nextSpeed) };
        setHeroDirection(direction);
        moveHero(nextVelocity.x * deltaSeconds, nextVelocity.z * deltaSeconds);
      }
      frame = window.requestAnimationFrame(tickMovement);
    };

    frame = window.requestAnimationFrame(tickMovement);

    return () => {
      window.cancelAnimationFrame(frame);
      lastMoveAt.current = null;
      movementVelocity.current = { x: 0, z: 0 };
      setHeroMoving(false);
    };
  }, []);
}
