export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

// Kept outside village streets; shared with movement collision checks.
export const forestTrees = Array.from({ length: 96 }, (_, index) => {
  const random = seededRandom(index * 19 + 753);
  const angle = random() * Math.PI * 2;
  const radius = 86 + random() * 115;
  return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius,
    height: 7 + random() * 8, rotation: random() * Math.PI * 2 };
});
