export const forwardKeys = ['w', 'ц', 'keyw', 'arrowup'];
export const backwardKeys = ['s', 'ы', 'keys', 'arrowdown'];
export const leftKeys = ['a', 'ф', 'keya', 'arrowleft'];
export const rightKeys = ['d', 'в', 'keyd', 'arrowright'];
export const sprintKeys = ['shift', 'shiftleft', 'shiftright'];
export const movementKeys = [...forwardKeys, ...backwardKeys, ...leftKeys, ...rightKeys, ...sprintKeys];

// Camera looks along +Z; screen-right is the opposite of its local X axis.
export function cameraRelativeDirection(x: number, forward: number, yaw: number) {
  return {
    x: -Math.cos(yaw) * x + Math.sin(yaw) * forward,
    z: Math.sin(yaw) * x + Math.cos(yaw) * forward,
  };
}

export function isTypingTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}
