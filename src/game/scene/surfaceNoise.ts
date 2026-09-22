export type SurfaceKind = 'earth' | 'stone' | 'wood' | 'roof';

function hash(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

// Periodic noise keeps the edges seamless when a small texture repeats.
function noise(x: number, y: number, period: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const sample = (dx: number, dy: number) => hash((ix + dx) % period, (iy + dy) % period);
  return (sample(0, 0) * (1 - u) + sample(1, 0) * u) * (1 - v)
    + (sample(0, 1) * (1 - u) + sample(1, 1) * u) * v;
}

export function surfaceHeight(kind: SurfaceKind, u: number, v: number) {
  const grain = noise(u * 128, v * 128, 128);
  const broad = noise(u * 8, v * 8, 8);
  const detail = noise(u * 32, v * 32, 32);
  if (kind === 'earth') return broad * 0.35 + detail * 0.4 + grain * 0.25;
  if (kind === 'wood') {
    const rings = Math.sin(u * Math.PI * 48 + Math.sin(v * Math.PI * 4) * 2);
    const joint = Math.min((u * 4) % 1, 1 - (u * 4) % 1);
    return joint < 0.024 ? 0.12 : 0.5 + rings * 0.12 + grain * 0.12;
  }
  const rows = kind === 'roof' ? 12 : 8;
  const columns = kind === 'roof' ? 8 : 4;
  const row = Math.floor(v * rows);
  const x = (u * columns + (row % 2) * 0.5) % 1;
  const y = (v * rows) % 1;
  const edge = Math.min(x, 1 - x, y, 1 - y);
  const mortar = Math.min(1, edge / 0.055);
  const block = hash(Math.floor(u * columns + (row % 2) * 0.5) % columns, row);
  return (0.38 + block * 0.23 + detail * 0.15 + grain * 0.1) * mortar;
}
