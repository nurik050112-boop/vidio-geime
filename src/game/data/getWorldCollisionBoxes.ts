import { type CollisionBox } from './adminBoss';
import { getLocationStyle } from './gameSaveState';

export function getWorldCollisionBoxes(chapter: number, locationIndex: number, sceneKey: string) {
  const boxes: CollisionBox[] = [];

  const isEnding = sceneKey.startsWith('ending') || sceneKey.includes('final') || sceneKey.includes('death') || sceneKey.includes('admin');
  const captured = sceneKey.startsWith('captured');
  const locationStyle = getLocationStyle(chapter, locationIndex, sceneKey);

  if (captured) {
    for (let i = 0; i < 46; i += 1) {
      const lane = i % 4;
      const row = Math.floor(i / 4);
      const x = lane < 2 ? -28 - lane * 16 + Math.sin(i) * 1.2 : 28 + (lane - 2) * 16 + Math.sin(i) * 1.2;
      const z = -58 + row * 10.4 + Math.cos(i * 0.7) * 1.6;
      boxes.push({ x, z, halfX: 3.2, halfZ: 2.8 });
    }
  }

  if (locationStyle === 0) {
    for (let i = 0; i < 28; i += 1) {
      boxes.push({
        x: -42 + (i % 7) * 13.4,
        z: -27 + Math.floor(i / 7) * 15.5,
        halfX: 1.7 + (i % 3) * 0.5,
        halfZ: 1.35,
      });
    }
  } else if (locationStyle === 1) {
    for (let i = 0; i < 18; i += 1) {
      boxes.push({
        x: -38 + (i % 6) * 15,
        z: -24 + Math.floor(i / 6) * 20,
        halfX: 1.05,
        halfZ: 1.05,
      });
    }
    boxes.push({ x: 0, z: -18, halfX: 6.8, halfZ: 6.8 });
  } else if (locationStyle === 2) {
    for (let i = 0; i < 46; i += 1) {
      boxes.push({
        x: -50 + (i % 12) * 9.2 + Math.sin(i) * 1.4,
        z: -34 + Math.floor(i / 12) * 18 + Math.cos(i) * 1.8,
        halfX: 0.7,
        halfZ: 0.7,
      });
    }
  } else if (locationStyle === 3) {
    for (let i = 0; i < 24; i += 1) {
      const x = -42 + (i % 8) * 12;
      const z = -30 + Math.floor(i / 8) * 24;
      boxes.push({ x, z, halfX: 1.55, halfZ: 1.45 });
      boxes.push({ x: x + 3.4, z: z + 1.8, halfX: 0.5, halfZ: 0.5 });
    }
  } else if (locationStyle === 4) {
    for (let i = 0; i < 18; i += 1) {
      const x = -44 + (i % 6) * 17;
      const z = -30 + Math.floor(i / 6) * 24;
      boxes.push({ x, z, halfX: 4.25, halfZ: 0.85 });
      boxes.push({ x: x + 3.9, z, halfX: 1.35, halfZ: 1.35 });
    }
  } else if (locationStyle === 5) {
    for (let i = 0; i < 30; i += 1) {
      const x = -48 + (i % 10) * 10.5;
      const z = -33 + Math.floor(i / 10) * 27;
      boxes.push({ x, z, halfX: 1.15 + (i % 3) * 0.45, halfZ: 0.75 });
      boxes.push({ x: x + 2.2, z: z + 1.4, halfX: 0.7, halfZ: 0.7 });
    }
  } else if (locationStyle === 7) {
    for (let i = 0; i < 34; i += 1) {
      boxes.push({
        x: -46 + (i % 9) * 11.5,
        z: -34 + Math.floor(i / 9) * 22,
        halfX: 1.35,
        halfZ: 1.35,
      });
    }
  } else if (locationStyle === 8) {
    for (let i = 0; i < 20; i += 1) {
      boxes.push({
        x: -44 + (i % 5) * 21,
        z: -31 + Math.floor(i / 5) * 19,
        halfX: 1.05,
        halfZ: 1.05,
      });
    }
  } else if (locationStyle === 10) {
    for (let i = 0; i < 32; i += 1) {
      boxes.push({
        x: -48 + (i % 8) * 13.6,
        z: -34 + Math.floor(i / 8) * 22,
        halfX: 0.8,
        halfZ: 0.8,
      });
    }
  } else if (locationStyle === 11) {
    for (let i = 0; i < 22; i += 1) {
      boxes.push({
        x: -42 + (i % 7) * 14,
        z: -30 + Math.floor(i / 7) * 22,
        halfX: 2.2,
        halfZ: 2.2,
      });
    }
  } else if (locationStyle === 12) {
    for (let i = 0; i < 30; i += 1) {
      boxes.push({
        x: -48 + (i % 10) * 10.5,
        z: -34 + Math.floor(i / 10) * 26,
        halfX: 1.1,
        halfZ: 1.1,
      });
    }
  } else if (locationStyle === 13) {
    for (let i = 0; i < 34; i += 1) {
      boxes.push({
        x: -50 + (i % 9) * 12.3,
        z: -34 + Math.floor(i / 9) * 23,
        halfX: 1.15,
        halfZ: 1.15,
      });
    }
  } else {
    for (let i = 0; i < 24; i += 1) {
      boxes.push({
        x: -46 + (i % 8) * 12.8,
        z: -32 + Math.floor(i / 8) * 25,
        halfX: 1.45,
        halfZ: 1.45,
      });
    }
  }

  if (isEnding) {
    for (let i = 0; i < 7; i += 1) {
      boxes.push({ x: -30 + i * 10, z: -34 + Math.sin(i) * 7, halfX: 1.05, halfZ: 1.05 });
    }
  }

  return boxes.map((box) => ({
    ...box,
    x: box.x + Math.sin(locationIndex + box.z) * 0,
  }));
}
