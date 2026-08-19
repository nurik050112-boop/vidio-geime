import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type BattleScene3DProps = {
  dragonColor: string;
  heroAnimation: 'idle' | 'strike' | 'step' | 'heal' | 'cast';
  isHeroMoving: boolean;
  isFinalReveal: boolean;
  burn: number;
  heroPosition: { x: number; z: number };
  heroHeight: number;
  heroDirection: { x: number; z: number };
  cameraYaw: number;
  nearestMonster: { x: number; z: number; alive: boolean };
  monstersLeft: number;
  battlePulse: number;
  cameraMode: 'third';
  monsterKind: string;
  viewDistance: number;
  sceneKey: string;
  useCityGoblinModel: boolean;
  chapter: number;
  locationIndex: number;
  equippedArtifactIcon: string | null;
  equippedWeaponStyle: number;
  hasArcaneWeapon: boolean;
  arcaneSpellKind: number;
  arcanePulse: number;
  arcaneBurstPulse: number;
};

const monsterRunSpeedMetersPerSecond = 18 / 3.6;
const monsterHitRangeMeters = 5;
const monsterPressureRangeMeters = 12;
const monsterAggroRangeMeters = 100;
const arcaneProjectileSpeedMetersPerSecond = 100 / 3.6;
const arcaneAttackRadiusMeters = 70;
const worldRadiusMeters = 5_000;
const worldDiameterMeters = worldRadiusMeters * 2;

function material(color: string, options: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.02, ...options });
}

function mesh(geometry: THREE.BufferGeometry, color: string, position: [number, number, number], options: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const item = new THREE.Mesh(geometry, material(color, options));
  item.position.set(...position);
  item.castShadow = true;
  item.receiveShadow = true;
  return item;
}

function capsule(color: string, radius: number, length: number, position: [number, number, number]) {
  return mesh(new THREE.CapsuleGeometry(radius, length, 8, 16), color, position);
}

function cone(color: string, radius: number, height: number, position: [number, number, number]) {
  return mesh(new THREE.ConeGeometry(radius, height, 12), color, position);
}

function makeTorch(x: number, z: number) {
  const torch = new THREE.Group();
  const pole = mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.2, 8), '#2b1a10', [x, 0.65, z]);
  const flame = cone('#ff9f1c', 0.18, 0.58, [x, 1.42, z]);
  flame.material = new THREE.MeshStandardMaterial({ color: '#ff9f1c', emissive: '#ff5a1f', emissiveIntensity: 1.8, roughness: 0.45 });
  const glow = new THREE.PointLight('#ff8a2a', 3.4, 8);
  glow.position.set(x, 1.42, z);
  torch.add(pole, flame, glow);
  torch.userData.flame = flame;
  torch.userData.glow = glow;
  return torch;
}

const cityThemes = [
  { sky: '#14221d', fog: '#14221d', ground: '#2e4026', accent: '#7b4b2a', glow: '#ff9f1c' },
  { sky: '#1b120f', fog: '#1b120f', ground: '#33261f', accent: '#d00000', glow: '#ff3b30' },
  { sky: '#111926', fog: '#111926', ground: '#263241', accent: '#8ecae6', glow: '#73d2de' },
  { sky: '#0d0b14', fog: '#0d0b14', ground: '#2d2436', accent: '#8338ec', glow: '#b56cff' },
  { sky: '#051f28', fog: '#051f28', ground: '#153d46', accent: '#06d6a0', glow: '#75e6da' },
];

function hashSceneKey(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 997;
  }
  return hash;
}

function smoothAngle(current: number, target: number, delta: number, speed: number) {
  const turn = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + turn * (1 - Math.exp(-delta * speed));
}

function addPillar(scene: THREE.Object3D, x: number, z: number, color: string, glow: string) {
  const pillar = new THREE.Group();
  const base = mesh(new THREE.CylinderGeometry(0.62, 0.78, 2.4, 8), color, [x, 1.16, z], { roughness: 0.72 });
  const spike = cone(color, 0.7, 1.9, [x, 3.28, z]);
  const rune = mesh(new THREE.BoxGeometry(0.12, 0.9, 0.06), glow, [x, 2.18, z + 0.64], { emissive: glow, emissiveIntensity: 1.2 });
  const light = new THREE.PointLight(glow, 1.8, 10);
  light.position.set(x, 2.6, z);
  pillar.add(base, spike, rune, light);
  scene.add(pillar);
}

function addCapturedCity(root: THREE.Object3D, palette: { accent: string; glow: string }) {
  const roadMat = material('#3b312b', { roughness: 0.94 });
  const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(9, 148), roadMat);
  mainRoad.position.set(0, -0.018, 0);
  mainRoad.rotation.x = -Math.PI / 2;
  mainRoad.receiveShadow = true;
  const crossRoad = new THREE.Mesh(new THREE.PlaneGeometry(148, 7.5), roadMat);
  crossRoad.position.set(0, -0.016, -2);
  crossRoad.rotation.x = -Math.PI / 2;
  crossRoad.receiveShadow = true;
  root.add(mainRoad, crossRoad);

  for (let i = 0; i < 46; i += 1) {
    const lane = i % 4;
    const row = Math.floor(i / 4);
    const x = lane < 2 ? -28 - lane * 16 + Math.sin(i) * 1.2 : 28 + (lane - 2) * 16 + Math.sin(i) * 1.2;
    const z = -58 + row * 10.4 + Math.cos(i * 0.7) * 1.6;
    const height = 1.6 + (i % 5) * 0.7;
    const ruined = i % 3 === 0;
    const house = mesh(
      new THREE.BoxGeometry(5.2 + (i % 2) * 1.3, ruined ? height * 0.72 : height, 4.4),
      i % 2 ? '#4b3a31' : '#5b4a3d',
      [x, ruined ? height * 0.36 : height * 0.5, z],
      { roughness: 0.88 }
    );
    house.rotation.y = Math.sin(i * 1.4) * 0.08;
    const roof = cone(ruined ? '#241714' : '#2b201b', 3.7, ruined ? 0.72 : 1.3, [x, height + 0.62, z]);
    roof.rotation.y = Math.PI / 4 + Math.sin(i) * 0.12;
    const windowGlow = mesh(new THREE.BoxGeometry(0.72, 0.46, 0.05), i % 4 ? '#1b1010' : palette.glow, [x, Math.max(0.95, height * 0.62), z + 2.24], {
      emissive: i % 4 ? '#160505' : palette.glow,
      emissiveIntensity: i % 4 ? 0.35 : 1.5,
    });
    root.add(house, roof, windowGlow);

    if (ruined) {
      const rubble = mesh(new THREE.DodecahedronGeometry(0.55 + (i % 4) * 0.16), '#2f2a26', [x + 3.4, 0.24, z - 1.8]);
      rubble.scale.y = 0.42;
      const brokenBeam = mesh(new THREE.BoxGeometry(0.28, 3.2, 0.22), '#211611', [x - 2.8, 1.3, z + 1.4]);
      brokenBeam.rotation.z = 0.75 + Math.sin(i) * 0.18;
      root.add(rubble, brokenBeam);
    }
  }

  for (let i = 0; i < 18; i += 1) {
    const x = -42 + (i % 6) * 16.5;
    const z = -48 + Math.floor(i / 6) * 32 + Math.sin(i) * 2;
    const stain = mesh(new THREE.PlaneGeometry(2.4 + (i % 3), 0.42), i % 2 ? '#130909' : '#21100d', [x, 0.012, z], {
      transparent: true,
      opacity: 0.78,
      emissive: '#240500',
      emissiveIntensity: 0.22,
    });
    stain.rotation.x = -Math.PI / 2;
    stain.rotation.z = Math.sin(i) * 1.8;
    root.add(stain);
  }

  for (let i = 0; i < 14; i += 1) {
    const x = -48 + (i % 7) * 16;
    const z = i < 7 ? -64 : 52;
    const post = mesh(new THREE.CylinderGeometry(0.08, 0.11, 2.2, 7), '#1b120e', [x, 1, z]);
    const banner = mesh(new THREE.BoxGeometry(0.08, 1.25, 0.82), i % 2 ? '#5d1515' : '#2a0d0d', [x + 0.08, 1.78, z], {
      emissive: '#2a0505',
      emissiveIntensity: 0.45,
    });
    banner.rotation.y = Math.sin(i) * 0.18;
    root.add(post, banner);
  }

  for (let i = 0; i < 12; i += 1) {
    const x = -36 + (i % 6) * 14.4;
    const z = -30 + Math.floor(i / 6) * 48 + Math.cos(i) * 2;
    const flame = cone('#ff5a1f', 0.26, 0.9, [x, 1.12, z]);
    flame.material = new THREE.MeshStandardMaterial({ color: '#ff5a1f', emissive: '#ff2a1f', emissiveIntensity: 1.7, roughness: 0.38 });
    const smoke = new THREE.Mesh(
      new THREE.SphereGeometry(0.48 + (i % 3) * 0.12, 12, 8),
      new THREE.MeshBasicMaterial({ color: '#151515', transparent: true, opacity: 0.34, depthWrite: false })
    );
    smoke.position.set(x, 2.2, z);
    smoke.scale.set(1, 1.8, 1);
    smoke.userData.smoke = true;
    smoke.userData.seed = i * 0.73;
    const light = new THREE.PointLight('#ff3b30', 1.8, 8);
    light.position.set(x, 1.35, z);
    root.add(flame, smoke, light);
  }

  addPillar(root, -9, -18, '#151010', palette.glow);
  addPillar(root, 9, 14, '#151010', palette.glow);
}

function add3DLocation(scene: THREE.Scene, root: THREE.Object3D, sceneKey: string, chapter: number, locationIndex: number, captured = false) {
  const isEnding = sceneKey.startsWith('ending') || sceneKey.includes('final') || sceneKey.includes('death') || sceneKey.includes('admin');
  const locationStyle = Math.abs(chapter * 3 + locationIndex * 5 + hashSceneKey(sceneKey)) % 14;
  const theme = cityThemes[Math.abs(chapter + locationIndex) % cityThemes.length];
  const palette = captured
    ? { ...theme, sky: '#120d0b', fog: '#160f0d', ground: '#27241f', accent: '#7f1d1d', glow: '#ff3b30' }
    : isEnding
    ? { ...theme, sky: '#080509', fog: '#080509', ground: '#1d1418', accent: '#ff004c', glow: '#ff2a1f' }
    : theme;

  scene.background = new THREE.Color(palette.sky);
  scene.fog = new THREE.Fog(palette.fog, 18, isEnding ? 1_120 : 980);

  const ground = mesh(new THREE.PlaneGeometry(worldDiameterMeters + 160, worldDiameterMeters + 160), palette.ground, [0, -0.055, 0], { roughness: 0.92 });
  ground.rotation.x = -Math.PI / 2;
  root.add(ground);

  if (captured) {
    addCapturedCity(root, palette);
  } else if (locationStyle === 0) {
    for (let i = 0; i < 28; i += 1) {
      const x = -42 + (i % 7) * 13.4;
      const z = -27 + Math.floor(i / 7) * 15.5;
      const building = mesh(new THREE.BoxGeometry(2.6 + (i % 3), 2.2 + (i % 4) * 0.65, 2.2), i % 2 ? '#504238' : '#6b5741', [x, 1.05, z]);
      const roof = cone(palette.accent, 1.9, 1.25, [x, 2.85 + (i % 4) * 0.32, z]);
      roof.rotation.y = Math.PI / 4;
      root.add(building, roof);
    }
  } else if (locationStyle === 1) {
    for (let i = 0; i < 18; i += 1) {
      const x = -38 + (i % 6) * 15;
      const z = -24 + Math.floor(i / 6) * 20;
      addPillar(root, x, z, '#1c1717', palette.glow);
    }
    const citadel = mesh(new THREE.CylinderGeometry(4.8, 6.4, 7.4, 10), '#171112', [0, 3.65, -18], { roughness: 0.6 });
    const citadelTop = cone('#090708', 5.2, 5.8, [0, 10.2, -18]);
    const core = mesh(new THREE.BoxGeometry(0.5, 5.2, 0.18), palette.glow, [0, 5.4, -13.15], { emissive: palette.glow, emissiveIntensity: 1.8 });
    root.add(citadel, citadelTop, core);
  } else if (locationStyle === 2) {
    for (let i = 0; i < 46; i += 1) {
      const x = -50 + (i % 12) * 9.2 + Math.sin(i) * 1.4;
      const z = -34 + Math.floor(i / 12) * 18 + Math.cos(i) * 1.8;
      const deadTree = new THREE.Group();
      const trunk = mesh(new THREE.CylinderGeometry(0.12, 0.28, 2.6 + (i % 4) * 0.55, 6), '#1d1510', [x, 1.2, z]);
      trunk.rotation.z = Math.sin(i) * 0.18;
      const branch = mesh(new THREE.BoxGeometry(0.13, 1.6, 0.12), '#1d1510', [x + 0.28, 2.35, z]);
      branch.rotation.z = 0.9 + Math.sin(i) * 0.2;
      deadTree.add(trunk, branch);
      root.add(deadTree);
    }
    for (let i = 0; i < 16; i += 1) {
      const lava = mesh(new THREE.PlaneGeometry(2.2 + (i % 4), 0.38), palette.glow, [-42 + (i % 8) * 12, -0.01, -18 + Math.floor(i / 8) * 31], {
        emissive: palette.glow,
        emissiveIntensity: 1.4,
      });
      lava.rotation.x = -Math.PI / 2;
      lava.rotation.z = Math.sin(i) * 0.6;
      root.add(lava);
    }
  } else if (locationStyle === 3) {
    for (let i = 0; i < 24; i += 1) {
      const x = -42 + (i % 8) * 12;
      const z = -30 + Math.floor(i / 8) * 24;
      const hut = mesh(new THREE.BoxGeometry(2.4, 1.7, 2.2), i % 2 ? '#4c3a2c' : '#654a33', [x, 0.8, z]);
      const roof = mesh(new THREE.ConeGeometry(1.9, 1.05, 4), '#30352a', [x, 2.15, z]);
      roof.rotation.y = Math.PI / 4;
      const stump = mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.6, 8), '#3a2415', [x + 3.4, 0.26, z + 1.8]);
      root.add(hut, roof, stump);
    }
  } else if (locationStyle === 4) {
    for (let i = 0; i < 18; i += 1) {
      const x = -44 + (i % 6) * 17;
      const z = -30 + Math.floor(i / 6) * 24;
      const wall = mesh(new THREE.BoxGeometry(7.2, 2.4, 0.8), '#7a5a3e', [x, 1.15, z]);
      const tower = mesh(new THREE.CylinderGeometry(0.9, 1.1, 4.2, 10), '#654730', [x + 3.9, 2, z]);
      const flag = mesh(new THREE.BoxGeometry(0.12, 1.3, 1.6), palette.accent, [x + 4.2, 4.2, z], { emissive: palette.accent, emissiveIntensity: 0.35 });
      root.add(wall, tower, flag);
    }
  } else if (locationStyle === 5) {
    for (let i = 0; i < 30; i += 1) {
      const x = -48 + (i % 10) * 10.5;
      const z = -33 + Math.floor(i / 10) * 27;
      const ruin = mesh(new THREE.BoxGeometry(1.4 + (i % 3), 2.5 + (i % 4), 0.7), i % 2 ? '#9b8b72' : '#6f6658', [x, 1.2, z]);
      ruin.rotation.y = Math.sin(i) * 0.25;
      const rubble = mesh(new THREE.DodecahedronGeometry(0.45 + (i % 3) * 0.12), '#4c4942', [x + 2.2, 0.18, z + 1.4]);
      rubble.scale.y = 0.38;
      root.add(ruin, rubble);
    }
  } else if (locationStyle === 6) {
    const water = mesh(new THREE.PlaneGeometry(78, 46), '#116b8c', [10, 0.005, -8], { transparent: true, opacity: 0.72, metalness: 0.15, roughness: 0.2 });
    water.rotation.x = -Math.PI / 2;
    root.add(water);
    for (let i = 0; i < 22; i += 1) {
      const x = -44 + (i % 11) * 8.8;
      const z = i < 11 ? -35 : 24;
      const dock = mesh(new THREE.BoxGeometry(3.8, 0.22, 1.2), '#5b3d28', [x, 0.2, z]);
      dock.rotation.y = Math.sin(i) * 0.35;
      root.add(dock);
    }
  } else if (locationStyle === 7) {
    for (let i = 0; i < 34; i += 1) {
      const x = -46 + (i % 9) * 11.5;
      const z = -34 + Math.floor(i / 9) * 22;
      const mushroom = cone(i % 2 ? '#d00000' : '#8338ec', 1.15 + (i % 3) * 0.2, 1.4, [x, 2.0, z]);
      const stem = mesh(new THREE.CylinderGeometry(0.2, 0.34, 2.2, 8), '#e8d9b8', [x, 0.92, z]);
      root.add(stem, mushroom);
    }
  } else if (locationStyle === 8) {
    for (let i = 0; i < 20; i += 1) {
      const x = -44 + (i % 5) * 21;
      const z = -31 + Math.floor(i / 5) * 19;
      const crystal = cone(i % 2 ? '#75e6da' : '#8ecae6', 0.75, 3.8 + (i % 4) * 0.7, [x, 1.85, z]);
      crystal.rotation.z = Math.sin(i) * 0.18;
      const light = new THREE.PointLight(i % 2 ? '#75e6da' : '#8ecae6', 1.8, 9);
      light.position.set(x, 2.5, z);
      root.add(crystal, light);
    }
  } else if (locationStyle === 10) {
    for (let i = 0; i < 32; i += 1) {
      const x = -48 + (i % 8) * 13.6;
      const z = -34 + Math.floor(i / 8) * 22;
      const iceTree = new THREE.Group();
      const trunk = mesh(new THREE.CylinderGeometry(0.13, 0.2, 2.1 + (i % 3) * 0.5, 7), '#3c4a4f', [x, 0.95, z]);
      const crown = cone(i % 2 ? '#d9f7ff' : '#9ed8e8', 0.9 + (i % 3) * 0.18, 2.2, [x, 2.4, z]);
      iceTree.add(trunk, crown);
      root.add(iceTree);
    }
  } else if (locationStyle === 11) {
    const water = mesh(new THREE.PlaneGeometry(96, 78), '#0c5f7a', [4, 0.004, -7], { transparent: true, opacity: 0.66, metalness: 0.2, roughness: 0.18 });
    water.rotation.x = -Math.PI / 2;
    root.add(water);
    for (let i = 0; i < 22; i += 1) {
      const x = -42 + (i % 7) * 14;
      const z = -30 + Math.floor(i / 7) * 22;
      const island = mesh(new THREE.CylinderGeometry(1.6 + (i % 3) * 0.4, 2.1 + (i % 3) * 0.5, 0.42, 9), '#335334', [x, 0.18, z]);
      const palm = mesh(new THREE.CylinderGeometry(0.09, 0.14, 1.8, 7), '#5b3d28', [x + 0.5, 1.02, z - 0.2]);
      palm.rotation.z = Math.sin(i) * 0.18;
      const leaf = cone('#1f7a4d', 0.72, 0.85, [x + 0.62, 2.0, z - 0.28]);
      leaf.rotation.z = Math.PI;
      root.add(island, palm, leaf);
    }
  } else if (locationStyle === 12) {
    for (let i = 0; i < 30; i += 1) {
      const x = -48 + (i % 10) * 10.5;
      const z = -34 + Math.floor(i / 10) * 26;
      const tower = mesh(new THREE.BoxGeometry(1.2 + (i % 3) * 0.35, 3 + (i % 5) * 0.7, 1.2), i % 2 ? '#101923' : '#1f2933', [x, 1.5, z], { metalness: 0.38, roughness: 0.28 });
      const screen = mesh(new THREE.BoxGeometry(0.08, 0.8, 0.8), palette.glow, [x, 2.2, z + 0.62], { emissive: palette.glow, emissiveIntensity: 1.4 });
      root.add(tower, screen);
    }
  } else if (locationStyle === 13) {
    for (let i = 0; i < 34; i += 1) {
      const x = -50 + (i % 9) * 12.3;
      const z = -34 + Math.floor(i / 9) * 23;
      const basalt = mesh(new THREE.CylinderGeometry(0.65 + (i % 4) * 0.18, 0.9 + (i % 3) * 0.2, 2.4 + (i % 5), 6), '#181311', [x, 1.2, z]);
      basalt.rotation.y = Math.PI / 6;
      const magma = mesh(new THREE.PlaneGeometry(1.4 + (i % 3), 0.28), '#ff3b30', [x + 1.4, 0.02, z - 0.6], { emissive: '#ff3b30', emissiveIntensity: 1.5 });
      magma.rotation.x = -Math.PI / 2;
      magma.rotation.z = Math.sin(i);
      root.add(basalt, magma);
    }
  } else {
    for (let i = 0; i < 24; i += 1) {
      const x = -46 + (i % 8) * 12.8;
      const z = -32 + Math.floor(i / 8) * 25;
      const platform = mesh(new THREE.CylinderGeometry(1.8, 2.1, 0.55, 6), '#63564a', [x, 0.22, z]);
      const obelisk = mesh(new THREE.BoxGeometry(0.72, 4.4, 0.72), '#312a30', [x, 2.35, z], { emissive: palette.glow, emissiveIntensity: 0.18 });
      obelisk.rotation.y = Math.PI / 4;
      root.add(platform, obelisk);
    }
  }

  if (isEnding) {
    for (let i = 0; i < 7; i += 1) {
      addPillar(root, -30 + i * 10, -34 + Math.sin(i) * 7, '#120b0d', palette.glow);
    }
  }
}

function addCaveCity(scene: THREE.Scene) {
  const floor = mesh(new THREE.CircleGeometry(worldRadiusMeters + 120, 160), '#29241f', [0, -0.04, 0]);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const arena = mesh(new THREE.PlaneGeometry(worldDiameterMeters, worldDiameterMeters), '#26331f', [0, -0.035, 0], { roughness: 0.9 });
  arena.rotation.x = -Math.PI / 2;
  scene.add(arena);

  const roadMat = material('#6b5741', { roughness: 0.86 });
  const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(10, worldDiameterMeters * 0.94), roadMat);
  mainRoad.position.set(0, -0.02, 0);
  mainRoad.rotation.x = -Math.PI / 2;
  mainRoad.receiveShadow = true;
  scene.add(mainRoad);

  const crossRoad = new THREE.Mesh(new THREE.PlaneGeometry(worldDiameterMeters * 0.94, 8), roadMat);
  crossRoad.position.set(0, -0.018, -3);
  crossRoad.rotation.x = -Math.PI / 2;
  crossRoad.receiveShadow = true;
  scene.add(crossRoad);

  for (let i = 0; i < 34; i += 1) {
    const x = -42 + (i % 17) * 5.2;
    const z = i < 17 ? -28 : 24;
    const tree = new THREE.Group();
    const trunk = mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.2, 7), '#3a2415', [x, 0.55, z]);
    const top = cone(i % 2 ? '#285431' : '#356b39', 0.9, 2.2, [x, 1.9, z]);
    tree.add(trunk, top);
    scene.add(tree);
  }

  for (let i = 0; i < 26; i += 1) {
    const rock = mesh(new THREE.DodecahedronGeometry(0.35 + (i % 4) * 0.12), i % 2 ? '#596052' : '#45483f', [
      -39 + (i % 13) * 6.3,
      0.18,
      -19 + Math.floor(i / 13) * 36 + Math.sin(i) * 2,
    ]);
    rock.scale.y = 0.55;
    scene.add(rock);
  }

  const water = mesh(new THREE.PlaneGeometry(12, 52, 1, 1), '#143e44', [-18.5, 0.01, -6], {
    transparent: true,
    opacity: 0.72,
    metalness: 0.18,
    roughness: 0.24,
  });
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  const backWall = mesh(new THREE.TorusGeometry(28, 3.2, 18, 96, Math.PI * 1.25), '#302b25', [0, 10.5, -34]);
  backWall.rotation.z = Math.PI * 0.88;
  backWall.scale.set(1.25, 1, 0.55);
  scene.add(backWall);

  for (let i = 0; i < 72; i += 1) {
    const angle = (i / 72) * Math.PI * 2;
    const radius = 36 + (i % 5) * 5.2;
    const height = 2.8 + (i % 7) * 1.8;
    const rock = mesh(new THREE.ConeGeometry(1.2 + (i % 3) * 0.35, height, 7), i % 2 ? '#383229' : '#25231e', [
      Math.cos(angle) * radius,
      height / 2 - 0.1,
      Math.sin(angle) * radius - 4,
    ]);
    rock.rotation.y = angle;
    rock.scale.x = 0.75 + (i % 4) * 0.2;
    scene.add(rock);
  }

  for (let i = 0; i < 34; i += 1) {
    const stalactite = cone('#24211d', 0.55 + (i % 4) * 0.15, 3.8 + (i % 5), [-28 + i * 1.7, 11.5, -26 - (i % 4) * 3.2]);
    stalactite.rotation.x = Math.PI;
    scene.add(stalactite);
  }

  for (let i = 0; i < 42; i += 1) {
    const house = new THREE.Group();
    const x = -24 + (i % 14) * 3.6;
    const z = -11 - Math.floor(i / 10) * 3.1;
    const body = mesh(new THREE.BoxGeometry(1.3, 1 + (i % 4) * 0.3, 1.25), i % 2 ? '#564537' : '#6a513d', [x, 0.6, z]);
    const roof = cone('#30251e', 1.05, 0.8, [x, body.position.y + 0.85, z]);
    roof.rotation.y = Math.PI / 4;
    const windowLight = mesh(new THREE.BoxGeometry(0.34, 0.22, 0.03), '#ffd166', [x, 0.72, z + 0.64], {
      emissive: '#ff9f1c',
      emissiveIntensity: 0.8,
    });
    house.add(body, roof, windowLight);
    scene.add(house);
  }

  const bridge = new THREE.Group();
  for (let i = 0; i < 11; i += 1) {
    const plank = mesh(new THREE.BoxGeometry(0.75, 0.12, 1.25), '#5b3d28', [-8.4, 0.34 + Math.sin(i) * 0.05, -8 + i * 1.15]);
    plank.rotation.y = Math.sin(i * 0.8) * 0.16;
    bridge.add(plank);
  }
  scene.add(bridge);

  [-24, -16, -8, 0, 8, 16, 24].forEach((x, index) => {
    const cage = mesh(new THREE.BoxGeometry(1.1, 1.6, 0.22), '#4a2f20', [x, 1, -25.8]);
    cage.rotation.y = index % 2 ? 0.18 : -0.12;
    scene.add(cage);
  });

  [-28, -20, -12, -4, 4, 12, 20, 28].forEach((x, index) => {
    scene.add(makeTorch(x, -10 - (index % 2) * 8));
  });
}

function makeHero() {
  const hero = new THREE.Group();
  const armor = material('#8f9290', { metalness: 0.9, roughness: 0.18 });
  const darkArmor = material('#3d3d3a', { metalness: 0.72, roughness: 0.24 });
  const leather = material('#2b211d', { roughness: 0.82 });
  const skin = material('#b7835f', { roughness: 0.58 });
  const steelDark = material('#55585a', { metalness: 0.86, roughness: 0.2 });
  const steelLight = material('#c7c8c1', { metalness: 0.94, roughness: 0.14 });

  const body = capsule('#8a8d8a', 0.34, 0.82, [0, 1.1, 0]);
  body.scale.set(0.82, 1.18, 0.52);
  body.material = armor;
  const chestPlate = mesh(new THREE.BoxGeometry(0.72, 0.72, 0.18), '#777a78', [0, 1.22, 0.28], { metalness: 0.86, roughness: 0.18 });
  chestPlate.material = steelDark;
  chestPlate.rotation.x = -0.08;
  const chestRidge = mesh(new THREE.BoxGeometry(0.08, 0.74, 0.05), '#c7c8c1', [0, 1.24, 0.42], { metalness: 0.94, roughness: 0.14 });
  const ribL = mesh(new THREE.BoxGeometry(0.24, 0.05, 0.045), '#b7b8b0', [-0.19, 1.34, 0.42], { metalness: 0.82, roughness: 0.16 });
  const ribR = ribL.clone();
  ribR.position.x = 0.19;
  const chainmail = mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.52, 16), '#3d3d3a', [0, 0.82, 0.02], { metalness: 0.6, roughness: 0.36 });
  chainmail.scale.set(0.9, 1, 0.58);
  const skirt = mesh(new THREE.CylinderGeometry(0.38, 0.5, 0.42, 8), '#2b211d', [0, 0.54, 0.02]);
  skirt.material = leather;
  const belt = mesh(new THREE.BoxGeometry(0.76, 0.11, 0.42), '#3a2415', [0, 0.9, 0.03]);
  const beltBuckle = mesh(new THREE.BoxGeometry(0.12, 0.12, 0.045), '#caa76a', [0, 0.91, 0.27], { metalness: 0.65, roughness: 0.22 });
  const helmet = mesh(new THREE.SphereGeometry(0.34, 28, 18), '#8a8d8a', [0, 1.94, 0], { metalness: 0.82, roughness: 0.18 });
  helmet.scale.set(0.78, 1.18, 0.74);
  helmet.material = steelLight;
  const visor = mesh(new THREE.BoxGeometry(0.36, 0.42, 0.08), '#24282b', [0, 1.86, 0.29], { metalness: 0.72, roughness: 0.2 });
  visor.rotation.x = -0.08;
  const visorSlit = mesh(new THREE.BoxGeometry(0.28, 0.035, 0.025), '#050607', [0, 1.98, 0.35]);
  const noseGuard = mesh(new THREE.BoxGeometry(0.055, 0.5, 0.055), '#b7b8b0', [0, 1.79, 0.36], { metalness: 0.8, roughness: 0.16 });
  const helmetBack = mesh(new THREE.BoxGeometry(0.42, 0.44, 0.08), '#777a78', [0, 1.78, -0.26], { metalness: 0.86, roughness: 0.18 });
  helmetBack.rotation.x = 0.22;
  const neckGuard = mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.18, 12), '#55585a', [0, 1.6, 0], { metalness: 0.8, roughness: 0.22 });
  neckGuard.material = steelDark;
  const plume = mesh(new THREE.BoxGeometry(0.1, 0.42, 0.06), '#8f1d1d', [0, 2.32, -0.05], { roughness: 0.7 });
  plume.rotation.x = 0.22;
  const sword = new THREE.Group();
  const blade = mesh(new THREE.BoxGeometry(0.09, 2.25, 0.04), '#dfe5e3', [0, 0.75, 0], {
    metalness: 0.76,
    emissive: '#9fb6bf',
    emissiveIntensity: 0.18,
  });
  const bladeTip = mesh(new THREE.ConeGeometry(0.075, 0.26, 12), '#dfe5e3', [0, 1.99, 0], { metalness: 0.76, roughness: 0.18 });
  bladeTip.rotation.z = Math.PI;
  const guard = mesh(new THREE.BoxGeometry(0.62, 0.08, 0.09), '#8a5b38', [0, -0.42, 0], { metalness: 0.3, roughness: 0.42 });
  const pommel = mesh(new THREE.SphereGeometry(0.085, 12, 8), '#8a5b38', [0, -0.82, 0], { metalness: 0.34, roughness: 0.38 });
  sword.add(blade, bladeTip, guard, pommel);
  sword.position.set(0.72, 0.68, 0.18);
  sword.rotation.set(0.12, 0, -1.34);

  const leftShoulder = mesh(new THREE.SphereGeometry(0.24, 18, 10), '#8a8d8a', [-0.48, 1.5, 0.02], { metalness: 0.85, roughness: 0.16 });
  leftShoulder.scale.set(1.42, 0.62, 0.92);
  const rightShoulder = leftShoulder.clone();
  rightShoulder.position.x = 0.46;
  const leftArm = capsule('#8a8d8a', 0.082, 0.72, [-0.5, 1.1, 0.02]);
  leftArm.material = skin;
  leftArm.rotation.z = -0.55;
  const rightArm = capsule('#8a8d8a', 0.082, 0.78, [0.52, 1.17, 0.02]);
  rightArm.material = skin;
  rightArm.rotation.z = -1.18;
  rightArm.rotation.x = -0.18;
  const leftElbow = mesh(new THREE.SphereGeometry(0.09, 12, 8), '#b7b8b0', [-0.58, 0.93, 0.08], { metalness: 0.8, roughness: 0.18 });
  const rightElbow = leftElbow.clone();
  rightElbow.position.set(0.72, 1.02, 0.1);
  const leftGauntlet = capsule('#3a3a38', 0.078, 0.36, [-0.62, 0.76, 0.07]);
  leftGauntlet.material = darkArmor;
  const rightGauntlet = capsule('#3a3a38', 0.075, 0.32, [0.88, 1.12, 0.12]);
  rightGauntlet.material = darkArmor;
  const pointingHand = mesh(new THREE.SphereGeometry(0.08, 12, 8), '#3a3a38', [1.04, 1.1, 0.16], { metalness: 0.72, roughness: 0.22 });
  pointingHand.scale.set(1.05, 0.82, 0.72);
  const pointingFinger = capsule('#3a3a38', 0.014, 0.22, [1.16, 1.1, 0.18]);
  pointingFinger.material = darkArmor;
  pointingFinger.rotation.z = Math.PI / 2;
  const leftHand = mesh(new THREE.SphereGeometry(0.07, 12, 8), '#3a3a38', [-0.7, 0.65, 0.08], { metalness: 0.72, roughness: 0.22 });
  leftHand.scale.set(1, 0.8, 0.7);

  const leftLeg = capsule('#8a8d8a', 0.105, 0.78, [-0.18, 0.32, -0.08]);
  leftLeg.material = armor;
  const rightLeg = capsule('#8a8d8a', 0.105, 0.78, [0.18, 0.32, 0.08]);
  rightLeg.material = armor;
  const thighL = mesh(new THREE.CapsuleGeometry(0.11, 0.42, 8, 12), '#777a78', [-0.2, 0.56, -0.02], { metalness: 0.78, roughness: 0.2 });
  thighL.material = steelDark;
  thighL.rotation.x = 0.08;
  const thighR = thighL.clone();
  thighR.position.x = 0.2;
  thighR.position.z = 0.08;
  const leftBoot = mesh(new THREE.BoxGeometry(0.28, 0.16, 0.46), '#2c241f', [-0.2, -0.05, 0.08]);
  leftBoot.rotation.x = -0.06;
  const rightBoot = mesh(new THREE.BoxGeometry(0.28, 0.16, 0.46), '#2c241f', [0.2, -0.05, 0.18]);
  rightBoot.rotation.x = -0.06;
  const kneeL = mesh(new THREE.SphereGeometry(0.11, 12, 8), '#b7b8b0', [-0.18, 0.64, 0.08], { metalness: 0.72, roughness: 0.18 });
  kneeL.scale.set(1.1, 0.65, 0.8);
  const kneeR = kneeL.clone();
  kneeR.position.x = 0.18;
  const cape = mesh(new THREE.BoxGeometry(0.86, 1.22, 0.08), '#491414', [0, 0.95, -0.32], { roughness: 0.82 });
  cape.rotation.x = 0.16;

  hero.add(
    cape,
    body,
    chestPlate,
    chestRidge,
    ribL,
    ribR,
    chainmail,
    skirt,
    belt,
    beltBuckle,
    helmet,
    visor,
    visorSlit,
    noseGuard,
    helmetBack,
    neckGuard,
    plume,
    sword,
    leftShoulder,
    rightShoulder,
    leftArm,
    rightArm,
    leftElbow,
    rightElbow,
    leftGauntlet,
    rightGauntlet,
    pointingHand,
    pointingFinger,
    leftHand,
    thighL,
    thighR,
    leftLeg,
    rightLeg,
    leftBoot,
    rightBoot,
    kneeL,
    kneeR
  );
  hero.userData = {
    cape,
    sword,
    rightArm,
    leftArm,
    leftLeg,
    rightLeg,
    leftShoulder,
    rightShoulder,
    leftGauntlet,
    rightGauntlet,
    leftBoot,
    rightBoot,
    plume,
    head: helmet,
  };
  hero.position.set(-3.4, 0, 1.2);
  return hero;
}

function makeHeroArtifact() {
  const group = new THREE.Group();
  const glowMat = new THREE.MeshStandardMaterial({
    color: '#ffe66d',
    emissive: '#ffb703',
    emissiveIntensity: 1.45,
    roughness: 0.22,
    metalness: 0.42,
  });
  const gemMat = new THREE.MeshStandardMaterial({
    color: '#75e6da',
    emissive: '#3a86ff',
    emissiveIntensity: 1.1,
    roughness: 0.18,
    metalness: 0.18,
    transparent: true,
    opacity: 0.9,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: '#251105',
    emissive: '#8338ec',
    emissiveIntensity: 0.6,
    roughness: 0.5,
    metalness: 0.2,
  });

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.035, 10, 32), glowMat);
  ring.castShadow = true;
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), gemMat);
  core.castShadow = true;
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 12), gemMat);
  orb.position.y = 0.03;
  orb.castShadow = true;
  const pendant = mesh(new THREE.ConeGeometry(0.12, 0.26, 5), '#8338ec', [0, -0.02, 0], { emissive: '#b56cff', emissiveIntensity: 0.8, metalness: 0.25 });
  pendant.rotation.z = Math.PI;
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.012, 8, 30), glowMat);
  halo.rotation.x = Math.PI / 2;
  const trail = new THREE.Mesh(
    new THREE.TorusGeometry(0.52, 0.01, 8, 54, Math.PI * 1.42),
    new THREE.MeshBasicMaterial({ color: '#75e6da', transparent: true, opacity: 0.48, depthWrite: false })
  );
  trail.rotation.x = Math.PI / 2.18;
  const shardMat = new THREE.MeshStandardMaterial({
    color: '#fff8e8',
    emissive: '#75e6da',
    emissiveIntensity: 1.2,
    roughness: 0.24,
    metalness: 0.32,
  });
  const shards = new THREE.Group();
  for (let index = 0; index < 6; index += 1) {
    const shard = new THREE.Mesh(new THREE.TetrahedronGeometry(0.055 + (index % 2) * 0.018, 0), shardMat);
    shard.castShadow = true;
    shard.userData.phase = (index / 6) * Math.PI * 2;
    shards.add(shard);
  }
  const light = new THREE.PointLight('#75e6da', 1.6, 4);
  group.add(trail, shards, ring, core, orb, pendant, halo, light);
  group.userData = { ring, core, orb, pendant, halo, trail, shards, light, glowMat, gemMat, shardMat, darkMat };
  return group;
}

function makeEquippedHeroWeapon() {
  const weapon = new THREE.Group();
  const bladeMat = new THREE.MeshStandardMaterial({
    color: '#d9f7ff',
    emissive: '#75e6da',
    emissiveIntensity: 0.42,
    roughness: 0.18,
    metalness: 0.72,
  });
  const guardMat = new THREE.MeshStandardMaterial({
    color: '#ffd166',
    emissive: '#8f2d1d',
    emissiveIntensity: 0.18,
    roughness: 0.32,
    metalness: 0.44,
  });
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.95, 0.075), bladeMat);
  blade.position.y = 0.72;
  blade.castShadow = true;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.105, 0.28, 4), bladeMat);
  tip.position.y = 1.82;
  tip.rotation.y = Math.PI / 4;
  tip.castShadow = true;
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.1, 0.12), guardMat);
  guard.position.y = -0.36;
  guard.castShadow = true;
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.52, 12), guardMat);
  grip.position.y = -0.66;
  grip.castShadow = true;
  const aura = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.012, 8, 32),
    new THREE.MeshBasicMaterial({ color: '#75e6da', transparent: true, opacity: 0.34, depthWrite: false })
  );
  aura.rotation.x = Math.PI / 2;
  const magicRunes = new THREE.Group();
  for (let index = 0; index < 5; index += 1) {
    const rune = new THREE.Mesh(
      new THREE.TorusGeometry(0.075 + index * 0.006, 0.006, 6, 18),
      new THREE.MeshBasicMaterial({ color: index % 2 ? '#ffe66d' : '#b56cff', transparent: true, opacity: 0, depthWrite: false })
    );
    rune.position.y = 0.04 + index * 0.34;
    rune.rotation.x = Math.PI / 2;
    rune.userData.phase = index * 0.8;
    magicRunes.add(rune);
  }
  weapon.add(blade, tip, guard, grip, aura, magicRunes);
  weapon.userData = { blade, tip, guard, grip, aura, magicRunes, bladeMat, guardMat };
  return weapon;
}

function updateEquippedHeroWeapon(weapon: THREE.Group, styleIndex: number, hasArcaneWeapon: boolean) {
  const data = weapon.userData as {
    blade: THREE.Mesh;
    tip: THREE.Mesh;
    guard: THREE.Mesh;
    grip: THREE.Mesh;
    aura: THREE.Mesh;
    magicRunes: THREE.Group;
    bladeMat: THREE.MeshStandardMaterial;
    guardMat: THREE.MeshStandardMaterial;
  };
  const colors = [
    ['#d9f7ff', '#ffd166'], ['#fff0bd', '#b5651d'], ['#e9fbff', '#3a3230'], ['#c8d0d8', '#1a1022'],
    ['#7dd3fc', '#8338ec'], ['#dce5ed', '#59606b'], ['#fff8e8', '#d69b23'], ['#ffffff', '#f5d54a'],
    ['#111111', '#8f2d1d'], ['#ffd166', '#b88718'], ['#a7f3d0', '#164c9a'], ['#f43f5e', '#8338ec'],
    ['#4338ca', '#3a2415'], ['#22d3ee', '#f97316'], ['#334155', '#7f1d1d'], ['#fef3c7', '#0f766e'],
    ['#ef4444', '#ef4444'], ['#94a3b8', '#92400e'], ['#5f6f55', '#41513d'], ['#ff9f1c', '#8f2d1d'],
  ];
  const [bladeColor, guardColor] = colors[styleIndex % colors.length] ?? colors[0];
  data.bladeMat.color.set(bladeColor);
  data.bladeMat.emissive.set(bladeColor);
  data.bladeMat.emissiveIntensity = hasArcaneWeapon ? 1.15 : 0.42;
  data.guardMat.color.set(guardColor);
  data.guardMat.emissive.set(guardColor);
  (data.aura.material as THREE.MeshBasicMaterial).color.set(bladeColor);
  data.magicRunes.visible = hasArcaneWeapon;
  const isHeavy = [3, 11, 14, 16, 18, 19].includes(styleIndex);
  const isPole = [6, 7, 13].includes(styleIndex);
  const isDagger = styleIndex === 17;
  const isBow = styleIndex === 10;
  data.blade.scale.set(isBow ? 0.42 : isHeavy ? 1.55 : isPole ? 0.55 : isDagger ? 0.62 : 1, isPole ? 1.34 : isDagger ? 0.58 : isHeavy ? 1.16 : 1, isBow ? 0.45 : 1);
  data.tip.visible = !isBow;
  data.guard.scale.set(isBow ? 1.6 : isPole ? 0.62 : isHeavy ? 1.35 : 1, 1, 1);
  data.grip.scale.set(isPole ? 0.9 : isBow ? 1.45 : 1, isPole ? 1.85 : isBow ? 1.4 : 1, 1);
  weapon.scale.setScalar(isHeavy ? 1.08 : isDagger ? 0.82 : 1);
}

function updateHeroArtifactStyle(artifact: THREE.Group, icon: string | null) {
  const data = artifact.userData as {
    ring: THREE.Mesh;
    core: THREE.Mesh;
    orb: THREE.Mesh;
    pendant: THREE.Mesh;
    halo: THREE.Mesh;
    trail: THREE.Mesh;
    shards: THREE.Group;
    light: THREE.PointLight;
    glowMat: THREE.MeshStandardMaterial;
    gemMat: THREE.MeshStandardMaterial;
    shardMat: THREE.MeshStandardMaterial;
  };
  artifact.visible = Boolean(icon);
  if (!icon) return;

  data.ring.visible = icon.includes('ring') || icon.includes('hoop') || icon.includes('medallion');
  data.core.visible = icon.includes('crystal') || icon.includes('relic') || icon.includes('medallion');
  data.orb.visible = icon.includes('orb') || icon.includes('pearl') || icon.includes('globe') || icon.includes('bottle');
  data.pendant.visible = icon.includes('pendant') || icon.includes('head') || icon.includes('crown');
  data.halo.visible = icon.includes('ring') || icon.includes('orb') || icon.includes('pearl');

  const color = icon.includes('death') || icon.includes('god') ? '#ff004c' : icon.includes('sea') ? '#75e6da' : icon.includes('snow') ? '#d9f7ff' : icon.includes('moon') ? '#b56cff' : icon.includes('green') ? '#06d6a0' : icon.includes('sun') || icon.includes('gold') ? '#ffe66d' : '#ffb703';
  data.glowMat.color.set(color);
  data.glowMat.emissive.set(color);
  data.gemMat.color.set(color);
  data.gemMat.emissive.set(color);
  data.shardMat.color.set(color);
  data.shardMat.emissive.set(color);
  (data.trail.material as THREE.MeshBasicMaterial).color.set(color);
  data.light.color.set(color);
}

function makeMonster(kind: string, index: number) {
  const group = new THREE.Group();
  const isSpider = kind === 'spider';
  const isSawWarrior = kind === 'saw-warrior';
  const isStone = kind === 'stone-brute';
  const isWire = kind === 'wire';
  const isPale = kind === 'pale';
  const isGoblin = kind === 'goblin';
  const goblinVariant = index % 4;
  const isLizardBrute = kind === 'lizard-brute';
  const isGiant = kind === 'giant' || kind === 'cave-titan';
  const usesReferenceBody = true;
  const isOrc = kind === 'orc' || kind === 'magma' || kind === 'avalanche';
  const isCrawler = kind === 'lizard' || kind === 'frost' || isLizardBrute;
  const skinColor = isGoblin ? ['#6f8f3a', '#789f42', '#587a32', '#8aa34e'][goblinVariant] : isSpider ? '#d9c882' : isLizardBrute ? '#2f7f3f' : isStone ? '#888883' : isWire ? '#c8b29e' : isPale ? '#b8c5c9' : isGiant ? '#8d8f8c' : isOrc ? '#6f7d35' : isCrawler ? '#8a8f82' : kind === 'shadow' ? '#5c5364' : '#8f958a';
  const dark = kind === 'shadow' ? '#120916' : '#34261d';
  const scale = isGoblin ? 1.02 : isStone ? 1.32 : isGiant ? 1.42 : isOrc || isLizardBrute ? 1.2 : isCrawler ? 1.08 : kind === 'shadow' ? 0.98 : 0.94;

  const body = capsule(skinColor, usesReferenceBody ? 0.22 * scale : 0.34 * scale, isOrc ? 1.08 : 0.8, [0, 0.86 * scale, 0]);
  body.scale.set(isGoblin ? (goblinVariant === 0 ? 0.56 : goblinVariant === 1 ? 0.68 : 0.6) : isSpider ? 1.15 : usesReferenceBody ? 0.72 : isCrawler ? 1.25 : 0.95, isGoblin ? (goblinVariant === 3 ? 0.88 : 1.08) : isStone ? 1.32 : usesReferenceBody ? 1.05 : isOrc ? 1.18 : 0.98, isGoblin ? (goblinVariant === 1 ? 0.82 : 0.62) : isSpider ? 1.45 : isCrawler ? 0.82 : 1);
  const belly = mesh(new THREE.SphereGeometry(0.28 * scale, 22, 14), skinColor, [0, 0.78 * scale, 0.2]);
  belly.scale.set(isGoblin ? (goblinVariant === 1 ? 1.34 : 1.02) : isStone ? 1.45 : isPale ? 1.05 : 1.15, isGoblin ? (goblinVariant === 1 ? 1.22 : 1.05) : isStone ? 1.25 : isPale ? 1.7 : 1.02, isGoblin ? (goblinVariant === 1 ? 1.32 : 1.12) : isSpider ? 1.55 : 0.95);
  belly.visible = usesReferenceBody;
  const ribs = new THREE.Group();
  for (let i = 0; i < 4; i += 1) {
    const rib = mesh(new THREE.BoxGeometry(0.34 * scale, 0.018 * scale, 0.025 * scale), '#6f756c', [0, (1.0 + i * 0.08) * scale, 0.34]);
    rib.visible = usesReferenceBody;
    ribs.add(rib);
  }
  const head = mesh(new THREE.SphereGeometry(0.32 * scale, 22, 14), skinColor, [0, 1.64 * scale, 0.08]);
  head.scale.set(isGoblin ? (goblinVariant === 2 ? 1.26 : 1.12) : isSpider ? 0.58 : usesReferenceBody ? 0.9 : isOrc ? 1.25 : 1.05, isGoblin ? 1.34 : isPale ? 0.78 : usesReferenceBody ? 1.16 : isCrawler ? 0.78 : 1, isGoblin ? 0.9 : isLizardBrute ? 1.55 : usesReferenceBody ? 1.08 : isCrawler ? 1.35 : 1);
  const brow = mesh(new THREE.BoxGeometry(0.34 * scale, 0.06 * scale, 0.08 * scale), '#747a70', [0, 1.7 * scale, 0.38 * scale]);
  brow.scale.set(isGoblin ? 1.32 : 1, isGoblin ? 1.25 : 1, isGoblin ? 1.1 : 1);
  brow.rotation.x = isGoblin ? 0.18 : 0;
  brow.visible = usesReferenceBody;
  const nose = mesh(new THREE.SphereGeometry(0.075 * scale, 10, 8), '#777d73', [0, 1.58 * scale, 0.42 * scale]);
  nose.scale.set(isGoblin ? 1.25 : 0.8, isGoblin ? 0.9 : 1, isGoblin ? 2.25 : 1.35);
  nose.visible = usesReferenceBody;
  const snout = cone(skinColor, usesReferenceBody ? 0.09 * scale : 0.18 * scale, usesReferenceBody ? 0.22 * scale : 0.46 * scale, [0, 1.57 * scale, 0.42 * scale]);
  snout.rotation.x = Math.PI / 2;
  snout.visible = !usesReferenceBody;
  const jaw = mesh(new THREE.BoxGeometry(0.36 * scale, 0.08 * scale, 0.08 * scale), isGoblin ? '#2d170f' : '#1b0908', [0, 1.43 * scale, 0.39 * scale]);
  jaw.scale.set(usesReferenceBody ? (isGoblin ? 0.92 : 0.72) : 1, isGoblin ? 1.7 : 1, isGoblin ? 1.25 : 1);
  const eyeMat = new THREE.MeshBasicMaterial({ color: isGoblin ? '#101010' : kind === 'shadow' ? '#b56cff' : '#ff3b30' });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045 * scale, 8, 6), eyeMat);
  eyeL.position.set(-0.12 * scale, 1.68 * scale, 0.36 * scale);
  const eyeR = eyeL.clone();
  eyeR.position.x *= -1;
  const hood = mesh(new THREE.ConeGeometry(0.5 * scale, 0.62 * scale, 18, 1, true), dark, [0, 1.8 * scale, -0.02]);
  hood.rotation.x = Math.PI;
  hood.visible = kind === 'shadow';
  const rag = mesh(new THREE.BoxGeometry(0.76 * scale, 0.38 * scale, 0.16 * scale), isSawWarrior ? '#111111' : '#65412e', [0, 0.8 * scale, 0.34 * scale]);
  rag.scale.set(0.7, 0.8, 1);

  const hornL = cone('#d9c39b', 0.075 * scale, 0.54 * scale, [-0.28 * scale, 1.93 * scale, 0]);
  hornL.rotation.z = 0.72;
  const hornR = hornL.clone();
  hornR.position.x *= -1;
  hornR.rotation.z = -0.72;
  hornL.visible = isOrc || isSawWarrior;
  hornR.visible = isOrc || isSawWarrior;

  const earL = cone(skinColor, 0.105 * scale, 0.78 * scale, [-0.38 * scale, 1.64 * scale, 0.02]);
  earL.rotation.z = Math.PI / 2;
  earL.rotation.y = -0.36;
  earL.scale.set(isGoblin ? 1.95 : 1, isGoblin ? 0.56 : 1, isGoblin ? 1.06 : 1);
  const earR = earL.clone();
  earR.position.x *= -1;
  earR.rotation.z = -Math.PI / 2;
  earL.visible = !isOrc && !isSpider && !isStone;
  earR.visible = !isOrc && !isSpider && !isStone;

  const armL = capsule(skinColor, 0.055 * scale, 0.82 * scale, [-0.42 * scale, 0.95 * scale, 0.05]);
  armL.rotation.z = -1.05;
  armL.scale.set(isGoblin ? 0.74 : 1, isGoblin ? 1.34 : 1, isGoblin ? 0.74 : 1);
  const armR = capsule(skinColor, 0.055 * scale, 0.82 * scale, [0.42 * scale, 0.95 * scale, 0.05]);
  armR.rotation.z = 1.05;
  armR.scale.copy(armL.scale);
  const handL = new THREE.Group();
  const handR = new THREE.Group();
  for (let i = 0; i < 4; i += 1) {
    const fingerL = capsule(skinColor, 0.012 * scale, 0.18 * scale, [-0.66 * scale - i * 0.025 * scale, 0.55 * scale - i * 0.012 * scale, 0.08]);
    fingerL.rotation.z = -1.3 - i * 0.1;
    const fingerR = capsule(skinColor, 0.012 * scale, 0.18 * scale, [0.66 * scale + i * 0.025 * scale, 0.55 * scale - i * 0.012 * scale, 0.08]);
    fingerR.rotation.z = 1.3 + i * 0.1;
    fingerL.visible = usesReferenceBody;
    fingerR.visible = usesReferenceBody;
    handL.add(fingerL);
    handR.add(fingerR);
  }
  const legL = capsule(skinColor, 0.07 * scale, 0.72 * scale, [-0.17 * scale, 0.27 * scale, 0]);
  const legR = capsule(skinColor, 0.07 * scale, 0.72 * scale, [0.17 * scale, 0.27 * scale, 0.08]);
  legL.rotation.z = 0.12;
  legR.rotation.z = -0.1;
  legL.scale.set(isGoblin ? 0.76 : 1, isGoblin ? (goblinVariant === 3 ? 0.88 : 1.04) : 1, isGoblin ? 0.76 : 1);
  legR.scale.copy(legL.scale);
  const footL = mesh(new THREE.BoxGeometry(0.24 * scale, 0.09 * scale, 0.34 * scale), skinColor, [-0.21 * scale, 0.035 * scale, 0.14]);
  const footR = mesh(new THREE.BoxGeometry(0.24 * scale, 0.09 * scale, 0.34 * scale), skinColor, [0.2 * scale, 0.035 * scale, 0.18]);
  footL.scale.set(isGoblin ? 1.35 : 1, isGoblin ? 0.8 : 1, isGoblin ? 1.45 : 1);
  footR.scale.copy(footL.scale);
  footL.visible = usesReferenceBody;
  footR.visible = usesReferenceBody;
  const club = new THREE.Group();
  const handle = mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.82 * scale, 8), '#2b1d12', [0.65 * scale, 1.05 * scale, 0.22]);
  handle.rotation.z = -0.85;
  const headClub = mesh(new THREE.DodecahedronGeometry(0.18 * scale), '#5a5147', [0.92 * scale, 1.36 * scale, 0.26]);
  club.add(handle, headClub);
  club.visible = false;
  const knife = new THREE.Group();
  const knifeBlade = mesh(new THREE.BoxGeometry(0.08 * scale, 0.42 * scale, 0.035 * scale), '#c9c7bd', [0.7 * scale, 0.85 * scale, 0.22], { metalness: 0.72, roughness: 0.2 });
  knifeBlade.rotation.z = -1.25;
  const knifeGrip = mesh(new THREE.CylinderGeometry(0.025 * scale, 0.025 * scale, 0.22 * scale, 8), '#3a2415', [0.5 * scale, 0.76 * scale, 0.2]);
  knifeGrip.rotation.z = -1.25;
  knife.add(knifeBlade, knifeGrip);
  knife.visible = isGoblin && goblinVariant !== 2;

  const goblinDetails = new THREE.Group();
  const loincloth = mesh(new THREE.BoxGeometry(0.42 * scale, 0.38 * scale, 0.1 * scale), '#3b332d', [0, 0.5 * scale, 0.38]);
  const backCloth = mesh(new THREE.BoxGeometry(0.4 * scale, 0.34 * scale, 0.08 * scale), '#3b332d', [0, 0.5 * scale, -0.25]);
  const pecL = mesh(new THREE.SphereGeometry(0.12 * scale, 12, 8), skinColor, [-0.12 * scale, 1.12 * scale, 0.32 * scale]);
  const pecR = pecL.clone();
  pecR.position.x *= -1;
  pecL.scale.set(1.2, 0.55, 0.45);
  pecR.scale.copy(pecL.scale);
  const shoulderMuscleL = mesh(new THREE.SphereGeometry(0.12 * scale, 12, 8), skinColor, [-0.42 * scale, 1.2 * scale, 0.08]);
  const shoulderMuscleR = shoulderMuscleL.clone();
  shoulderMuscleR.position.x *= -1;
  shoulderMuscleL.scale.set(1.15, 0.85, 0.75);
  shoulderMuscleR.scale.copy(shoulderMuscleL.scale);
  const bicepL = mesh(new THREE.SphereGeometry(0.095 * scale, 12, 8), skinColor, [-0.58 * scale, 0.93 * scale, 0.07]);
  const bicepR = bicepL.clone();
  bicepR.position.x *= -1;
  bicepL.scale.set(0.75, 1.25, 0.75);
  bicepR.scale.copy(bicepL.scale);
  const calfL = mesh(new THREE.SphereGeometry(0.085 * scale, 12, 8), skinColor, [-0.2 * scale, 0.22 * scale, -0.04]);
  const calfR = calfL.clone();
  calfR.position.x *= -1;
  calfR.position.z = 0.06;
  calfL.scale.set(0.85, 1.28, 0.78);
  calfR.scale.copy(calfL.scale);
  const kneeL = mesh(new THREE.SphereGeometry(0.06 * scale, 10, 8), '#c2c2ba', [-0.18 * scale, 0.5 * scale, 0.12]);
  const kneeR = kneeL.clone();
  kneeR.position.x *= -1;
  const toothMat = '#e8d6b8';
  for (let i = 0; i < 4; i += 1) {
    const tooth = cone(toothMat, 0.018 * scale, 0.09 * scale, [(-0.09 + i * 0.06) * scale, 1.39 * scale, 0.45 * scale]);
    tooth.rotation.x = Math.PI;
    goblinDetails.add(tooth);
  }
  for (let side = -1; side <= 1; side += 2) {
    const cheek = mesh(new THREE.SphereGeometry(0.07 * scale, 10, 8), '#6f7f4f', [side * 0.19 * scale, 1.5 * scale, 0.37 * scale]);
    cheek.scale.set(1.25, 0.55, 0.75);
    const browSpike = cone('#5e6c42', 0.035 * scale, 0.18 * scale, [side * 0.18 * scale, 1.78 * scale, 0.34 * scale]);
    browSpike.rotation.z = side * 0.62;
    const toe1 = cone(toothMat, 0.018 * scale, 0.09 * scale, [side * 0.28 * scale, -0.07 * scale, 0.33 * scale]);
    toe1.rotation.x = Math.PI / 2;
    const toe2 = toe1.clone();
    toe2.position.x -= side * 0.07 * scale;
    goblinDetails.add(cheek, browSpike, toe1, toe2);
  }
  const collar = mesh(new THREE.TorusGeometry(0.28 * scale, 0.025 * scale, 8, 20), '#2e2924', [0, 1.27 * scale, 0.02]);
  collar.rotation.x = Math.PI / 2;
  const clothTears = new THREE.Group();
  for (let i = 0; i < 5; i += 1) {
    const tear = cone('#2d2824', 0.035 * scale, (0.14 + (i % 2) * 0.08) * scale, [(-0.18 + i * 0.09) * scale, 0.25 * scale, 0.4 * scale]);
    tear.rotation.x = Math.PI;
    clothTears.add(tear);
  }
  const ribsMark = new THREE.Group();
  for (let i = 0; i < 4; i += 1) {
    const mark = mesh(new THREE.BoxGeometry(0.22 * scale, 0.018 * scale, 0.02 * scale), '#78746d', [0, (0.9 + i * 0.075) * scale, 0.35]);
    mark.rotation.z = (i % 2 ? -0.08 : 0.08);
    ribsMark.add(mark);
  }
  const goblinClub = new THREE.Group();
  const goblinClubHandle = mesh(new THREE.CylinderGeometry(0.035 * scale, 0.045 * scale, 1.15 * scale, 7), '#2b211d', [0.68 * scale, 0.98 * scale, 0.24]);
  goblinClubHandle.rotation.z = -1.05;
  const goblinClubHead = mesh(new THREE.DodecahedronGeometry(0.22 * scale), '#6d6860', [1.02 * scale, 1.36 * scale, 0.26]);
  goblinClub.add(goblinClubHandle, goblinClubHead);
  goblinClub.visible = isGoblin && goblinVariant === 2;
  const goblinShield = mesh(new THREE.CylinderGeometry(0.25 * scale, 0.29 * scale, 0.08 * scale, 7), '#5c554b', [-0.6 * scale, 0.95 * scale, 0.28], { metalness: 0.12, roughness: 0.7 });
  goblinShield.rotation.set(Math.PI / 2, 0, 0.2);
  goblinShield.visible = isGoblin && goblinVariant === 2;
  const mohawk = new THREE.Group();
  for (let i = 0; i < 5; i += 1) {
    const spike = cone('#293017', 0.035 * scale, 0.22 * scale, [0, (1.88 + i * 0.02) * scale, (-0.2 + i * 0.08) * scale]);
    spike.rotation.x = -0.45;
    mohawk.add(spike);
  }
  const bootL = mesh(new THREE.BoxGeometry(0.3 * scale, 0.1 * scale, 0.38 * scale), '#2f2519', [-0.21 * scale, 0.07 * scale, 0.15]);
  const bootR = bootL.clone();
  bootR.position.x = 0.2 * scale;
  bootR.position.z = 0.19;
  goblinDetails.add(loincloth, backCloth, pecL, pecR, shoulderMuscleL, shoulderMuscleR, bicepL, bicepR, calfL, calfR, kneeL, kneeR, collar, clothTears, ribsMark, goblinClub, goblinShield, mohawk, bootL, bootR);
  goblinDetails.visible = isGoblin;

  const armor = new THREE.Group();
  const chestPlate = mesh(new THREE.BoxGeometry(0.48 * scale, 0.34 * scale, 0.08 * scale), '#8d8f88', [0, 1.02 * scale, 0.39], { metalness: 0.62, roughness: 0.28 });
  const shoulderL = mesh(new THREE.SphereGeometry(0.15 * scale, 12, 8), '#9b9c94', [-0.45 * scale, 1.18 * scale, 0.06], { metalness: 0.58, roughness: 0.3 });
  shoulderL.scale.set(1.35, 0.55, 0.85);
  const shoulderR = shoulderL.clone();
  shoulderR.position.x *= -1;
  armor.add(chestPlate, shoulderL, shoulderR);
  armor.visible = isOrc || isLizardBrute || isSawWarrior;

  const saw = new THREE.Group();
  const sawHandle = mesh(new THREE.CylinderGeometry(0.035 * scale, 0.035 * scale, 1.15 * scale, 8), '#1a1412', [0.72 * scale, 0.92 * scale, 0.2]);
  sawHandle.rotation.z = -1.15;
  const sawBlade = mesh(new THREE.BoxGeometry(0.1 * scale, 0.9 * scale, 0.04 * scale), '#cfd0cb', [0.98 * scale, 1.18 * scale, 0.2], { metalness: 0.8, roughness: 0.22 });
  sawBlade.rotation.z = -1.15;
  for (let i = 0; i < 6; i += 1) {
    const tooth = cone('#d8d8d2', 0.035 * scale, 0.11 * scale, [0.74 * scale + i * 0.09 * scale, 1.38 * scale - i * 0.18 * scale, 0.24]);
    tooth.rotation.z = -0.55;
    saw.add(tooth);
  }
  saw.add(sawHandle, sawBlade);
  saw.visible = isSawWarrior;

  const spiderLegs = new THREE.Group();
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 4; i += 1) {
      const leg = capsule(skinColor, 0.035 * scale, 0.9 * scale, [side * (0.38 + i * 0.1) * scale, 0.55 * scale, -0.18 + i * 0.13]);
      leg.rotation.z = side * (1.0 + i * 0.12);
      leg.rotation.x = 0.25 - i * 0.08;
      spiderLegs.add(leg);
    }
  }
  spiderLegs.visible = isSpider;

  const rockNubs = new THREE.Group();
  for (let i = 0; i < 8; i += 1) {
    const nub = mesh(new THREE.DodecahedronGeometry(0.07 * scale), '#777772', [(-0.34 + (i % 4) * 0.22) * scale, (1.08 + Math.floor(i / 4) * 0.2) * scale, 0.38]);
    rockNubs.add(nub);
  }
  rockNubs.visible = isStone;

  const wireFrame = new THREE.Group();
  const wireMat = new THREE.MeshBasicMaterial({ color: '#f0d6b8', wireframe: true, transparent: true, opacity: 0.65 });
  const wireSkin = new THREE.Mesh(new THREE.SphereGeometry(0.42 * scale, 12, 8), wireMat);
  wireSkin.scale.set(0.72, 1.85, 0.72);
  wireSkin.position.set(0, 0.92 * scale, 0.1);
  wireFrame.add(wireSkin);
  wireFrame.visible = isWire;

  const monsterDetails = new THREE.Group();
  const backSpikes = new THREE.Group();
  for (let i = 0; i < 5; i += 1) {
    const spike = cone(isLizardBrute ? '#174d25' : '#6f756c', 0.045 * scale, 0.24 * scale, [0, (0.92 + i * 0.18) * scale, -0.3 * scale]);
    spike.rotation.x = -0.72;
    backSpikes.add(spike);
  }
  backSpikes.visible = isLizardBrute || isStone;

  const lizardTail = new THREE.Group();
  for (let i = 0; i < 4; i += 1) {
    const segment = capsule(skinColor, Math.max(0.04, 0.11 * scale - i * 0.018), 0.34 * scale, [0, 0.42 * scale, (-0.38 - i * 0.26) * scale]);
    segment.rotation.x = 1.22 - i * 0.08;
    lizardTail.add(segment);
  }
  lizardTail.visible = isCrawler || isLizardBrute;

  const orcAxe = new THREE.Group();
  const axeHandle = mesh(new THREE.CylinderGeometry(0.035 * scale, 0.04 * scale, 1.08 * scale, 8), '#28190f', [-0.7 * scale, 1.05 * scale, 0.22]);
  axeHandle.rotation.z = 0.95;
  const axeBlade = mesh(new THREE.BoxGeometry(0.38 * scale, 0.28 * scale, 0.04 * scale), '#c1c4bd', [-0.98 * scale, 1.42 * scale, 0.24], { metalness: 0.78, roughness: 0.2 });
  axeBlade.rotation.z = 0.42;
  orcAxe.add(axeHandle, axeBlade);
  orcAxe.visible = isOrc;

  const giantDetails = new THREE.Group();
  const shoulderStoneL = mesh(new THREE.DodecahedronGeometry(0.22 * scale), '#7f817b', [-0.55 * scale, 1.35 * scale, 0.05]);
  const shoulderStoneR = shoulderStoneL.clone();
  shoulderStoneR.position.x *= -1;
  const jawStone = mesh(new THREE.BoxGeometry(0.44 * scale, 0.16 * scale, 0.1 * scale), '#6c6f69', [0, 1.42 * scale, 0.42]);
  giantDetails.add(shoulderStoneL, shoulderStoneR, jawStone);
  giantDetails.visible = isGiant || isStone;

  const spiderFace = new THREE.Group();
  for (let i = 0; i < 6; i += 1) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035 * scale, 8, 6), eyeMat);
    eye.position.set((-0.16 + (i % 3) * 0.16) * scale, (1.66 + Math.floor(i / 3) * 0.1) * scale, 0.45 * scale);
    spiderFace.add(eye);
  }
  const spiderAbdomen = mesh(new THREE.SphereGeometry(0.38 * scale, 18, 12), skinColor, [0, 0.66 * scale, -0.34 * scale]);
  spiderAbdomen.scale.set(1.05, 0.72, 1.35);
  spiderFace.add(spiderAbdomen);
  spiderFace.visible = isSpider;

  const paleDetails = new THREE.Group();
  const paleBelly = mesh(new THREE.SphereGeometry(0.3 * scale, 18, 12), '#d9e1df', [0, 0.86 * scale, 0.38 * scale], { transparent: true, opacity: 0.76 });
  paleBelly.scale.set(0.84, 1.35, 0.62);
  const drool = mesh(new THREE.CylinderGeometry(0.018 * scale, 0.012 * scale, 0.34 * scale, 6), '#aee9e3', [0.09 * scale, 1.25 * scale, 0.48 * scale], { emissive: '#75e6da', emissiveIntensity: 0.35 });
  paleDetails.add(paleBelly, drool);
  paleDetails.visible = isPale;

  const sawHelmet = new THREE.Group();
  const helmetBand = mesh(new THREE.BoxGeometry(0.56 * scale, 0.14 * scale, 0.16 * scale), '#151515', [0, 1.82 * scale, 0.18], { metalness: 0.65, roughness: 0.25 });
  for (let i = 0; i < 4; i += 1) {
    const tooth = cone('#d8d8d2', 0.035 * scale, 0.14 * scale, [(-0.21 + i * 0.14) * scale, 1.95 * scale, 0.18]);
    tooth.rotation.x = Math.PI;
    sawHelmet.add(tooth);
  }
  sawHelmet.add(helmetBand);
  sawHelmet.visible = isSawWarrior;

  const wireGlow = new THREE.PointLight('#f0d6b8', 1.3, 4);
  wireGlow.position.set(0, 1.2 * scale, 0.1);
  wireGlow.visible = isWire;

  monsterDetails.add(backSpikes, lizardTail, orcAxe, giantDetails, spiderFace, paleDetails, sawHelmet, wireGlow);

  group.add(body, belly, ribs, head, brow, nose, snout, jaw, eyeL, eyeR, hood, rag, hornL, hornR, earL, earR, armL, armR, handL, handR, legL, legR, footL, footR, club, knife, goblinDetails, armor, saw, spiderLegs, rockNubs, wireFrame, monsterDetails);
  group.scale.setScalar(0.86 + (index % 4) * 0.09);
  if (isGoblin && goblinVariant === 3) {
    group.rotation.x = -0.16;
    head.position.y -= 0.08;
    armL.rotation.z = -1.28;
    armR.rotation.z = 1.28;
  }
  group.userData = {
    body,
    head,
    jaw,
    earL,
    earR,
    armL,
    armR,
    club,
    knife,
    goblinClub,
    legL,
    legR,
    footL,
    footR,
    saw,
    spiderLegs,
    spiderFace,
    spiderAbdomen,
    rockNubs,
    wireFrame,
    wireGlow,
    armor,
    orcAxe,
    giantDetails,
    paleDetails,
    lizardTail,
    backSpikes,
    baseY: isGoblin ? 0.18 : 0.08,
    seed: index * 0.7,
    kind,
    isGoblin,
    isSpider,
    isStone,
    isWire,
    isPale,
    isGiant,
    isOrc,
    isLizardBrute,
    isSawWarrior,
    isCrawler,
    goblinVariant,
  };
  return group;
}

function fitHeroModel(model: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  model.position.y += size.y / 2;
  model.scale.setScalar(size.y > 0 ? 2.35 / size.y : 1);
  model.rotation.y = Math.PI;
}

function tuneDownloadedCharacter(model: THREE.Object3D) {
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const tuneMaterial = (entry: THREE.Material) => {
      if (entry instanceof THREE.MeshStandardMaterial) {
        entry.roughness = THREE.MathUtils.clamp(entry.roughness * 0.72, 0.34, 0.82);
        entry.metalness = Math.max(entry.metalness, 0.04);
        entry.envMapIntensity = 1.15;
      }
    };
    if (Array.isArray(object.material)) object.material.forEach(tuneMaterial);
    else tuneMaterial(object.material);
  });
}

function fitGoblinModel(model: THREE.Object3D) {
  model.position.set(0, 0, 0);
  model.rotation.set(0, Math.PI, 0);
  model.scale.setScalar(1);
  model.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = size.y > 0 ? 1.45 / size.y : 1;
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  model.updateMatrixWorld(true);

  const groundedBox = new THREE.Box3().setFromObject(model);
  model.position.y -= groundedBox.min.y;
}

function fitBossModel(model: THREE.Object3D, targetHeight = 6.8) {
  model.position.set(0, 0, 0);
  model.rotation.set(0, 0, 0);
  model.scale.setScalar(1);
  model.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = size.y > 0 ? targetHeight / size.y : 1;
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  model.updateMatrixWorld(true);

  const groundedBox = new THREE.Box3().setFromObject(model);
  model.position.y -= groundedBox.min.y;
}

function fitLocationModel(model: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  model.position.y += size.y / 2;
  const widestSide = Math.max(size.x, size.z, 1);
  model.scale.setScalar(58 / widestSide);
  model.rotation.y = Math.PI;
}

function fitMapPropModel(model: THREE.Object3D, targetSize = 1) {
  model.position.set(0, 0, 0);
  model.rotation.set(0, 0, 0);
  model.scale.setScalar(1);
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const largestSide = Math.max(size.x, size.y, size.z, 0.001);
  const scale = targetSize / largestSide;
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
}

function makeDragon(color: string) {
  {
  const dragon = new THREE.Group();
  const fallback = new THREE.Group();
  const darkScale = 1.82;
  const bodyMat = material('#0b0707', { metalness: 0.18, roughness: 0.34, emissive: '#260500', emissiveIntensity: 0.18 });
  const frostEye = new THREE.MeshBasicMaterial({ color: '#ff1f05' });
  const body = capsule('#15100e', 0.5 * darkScale, 1.8 * darkScale, [0, 1.55 * darkScale, 0]);
  body.material = bodyMat;
  body.scale.set(1.95, 0.98, 0.92);
  const neck = capsule('#15100e', 0.18 * darkScale, 1.0 * darkScale, [0.82 * darkScale, 2.02 * darkScale, 0]);
  neck.material = bodyMat;
  neck.rotation.z = -0.62;
  const head = mesh(new THREE.SphereGeometry(0.34 * darkScale, 22, 14), '#15100e', [1.42 * darkScale, 2.38 * darkScale, 0]);
  head.material = bodyMat;
  head.scale.set(1.35, 0.82, 0.72);
  const jaw = mesh(new THREE.BoxGeometry(0.52 * darkScale, 0.12 * darkScale, 0.14 * darkScale), '#2b1510', [1.68 * darkScale, 2.22 * darkScale, 0]);
  jaw.scale.set(1.18, 1.15, 1.12);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04 * darkScale, 8, 6), frostEye);
  eyeL.position.set(1.6 * darkScale, 2.44 * darkScale, 0.24 * darkScale);
  const eyeR = eyeL.clone();
  eyeR.position.z *= -1;
  const eyeGlowL = new THREE.PointLight('#ff2200', 1.35, 6);
  eyeGlowL.position.copy(eyeL.position);
  const eyeGlowR = eyeGlowL.clone();
  eyeGlowR.position.copy(eyeR.position);
  const wingL = new THREE.Group();
  const wingR = new THREE.Group();
  const makeWing = (side: 1 | -1) => {
    const wing = side === 1 ? wingL : wingR;
    const membrane = new THREE.Mesh(
      new THREE.CircleGeometry(1.25 * darkScale, 4),
      new THREE.MeshStandardMaterial({ color: '#130908', emissive: '#260000', emissiveIntensity: 0.28, side: THREE.DoubleSide, transparent: true, opacity: 0.86, roughness: 0.44 })
    );
    membrane.position.set(-0.35 * darkScale, 2.25 * darkScale, side * 0.8 * darkScale);
    membrane.rotation.set(0.8, side * 0.42, side * -0.78);
    membrane.scale.set(1.62, 0.9, 1);
    wing.add(membrane);
  };
  makeWing(1);
  makeWing(-1);
  const tail = new THREE.Group();
  for (let i = 0; i < 5; i += 1) {
    const segment = capsule('#15100e', (0.18 - i * 0.022) * darkScale, 0.48 * darkScale, [(-0.72 - i * 0.36) * darkScale, (1.08 - i * 0.06) * darkScale, Math.sin(i) * 0.18 * darkScale]);
    segment.material = bodyMat;
    segment.rotation.z = 1.12 - i * 0.12;
    tail.add(segment);
  }
  const spines = new THREE.Group();
  for (let i = 0; i < 11; i += 1) {
    const spine = cone('#f2d08a', Math.max(0.035, 0.078 - i * 0.004) * darkScale, Math.max(0.18, 0.42 - i * 0.014) * darkScale, [(1.02 - i * 0.31) * darkScale, (2.38 - i * 0.105) * darkScale, 0]);
    spine.rotation.z = -0.28 + i * 0.015;
    spines.add(spine);
  }
  const fire = new THREE.Mesh(
    new THREE.ConeGeometry(0.42 * darkScale, 2.15 * darkScale, 16),
    new THREE.MeshBasicMaterial({ color: '#ff3d00', transparent: true, opacity: 0.9, depthWrite: false })
  );
  fire.position.set(2.05 * darkScale, 2.28 * darkScale, 0);
  fire.rotation.z = -Math.PI / 2;
  const aura = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 48),
    new THREE.MeshBasicMaterial({ color: '#b51600', transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide })
  );
  aura.rotation.x = -Math.PI / 2;
  aura.position.set(0.05 * darkScale, 0.035, 0);
  fallback.add(body, neck, head, jaw, eyeL, eyeR, eyeGlowL, eyeGlowR, wingL, wingR, tail, spines, fire, aura);
  dragon.add(fallback);

  const loadedFire = new THREE.Mesh(
    new THREE.ConeGeometry(0.62, 4.8, 22),
    new THREE.MeshBasicMaterial({ color: '#ff2d00', transparent: true, opacity: 0, depthWrite: false })
  );
  loadedFire.position.set(-2.8, 3.5, 0);
  loadedFire.rotation.z = Math.PI / 2;
  loadedFire.visible = false;
  dragon.add(loadedFire);

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    '/models/animated-dragon/dragon.glb',
    (gltf) => {
      fallback.visible = false;
      const model = gltf.scene;
      model.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
          if (object.material instanceof THREE.MeshStandardMaterial) {
            object.material = object.material.clone();
            object.material.color.lerp(new THREE.Color('#120808'), 0.34);
            object.material.emissive = new THREE.Color('#260300');
            object.material.emissiveIntensity = 0.16;
            object.material.roughness = Math.min(0.62, object.material.roughness + 0.08);
          }
        }
      });
      model.rotation.y = Math.PI;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      model.position.y += size.y / 2;
      model.scale.setScalar(size.y > 0 ? 9.2 / size.y : 1);
      dragon.add(model);
      dragon.userData.loadedModel = model;
      if (gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        const actions: Record<string, THREE.AnimationAction> = {};
        gltf.animations.forEach((clip) => {
          actions[clip.name] = mixer.clipAction(clip);
        });
        dragon.userData.loadedMixer = mixer;
        dragon.userData.loadedActions = actions;
        dragon.userData.activeLoadedAction = '';
      }
    },
    undefined,
    () => {
      fallback.visible = true;
    }
  );

  const loadedAura = new THREE.Mesh(
    new THREE.CircleGeometry(4.4, 64),
    new THREE.MeshBasicMaterial({ color: '#c01600', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
  );
  loadedAura.rotation.x = -Math.PI / 2;
  loadedAura.position.set(0, 0.04, 0);
  dragon.add(loadedAura);

  dragon.position.set(4.75, 0, -0.5);
  dragon.userData = { bodyMat, body, head, neck, wingL, wingR, fire, loadedFire, loadedAura, aura, jaw, tail, spines };
  return dragon;
  }

  const dragon = new THREE.Group();
  const bodyMat = material(color, { metalness: 0.05, roughness: 0.42 });
  const bellyMat = material('#d7c5a5', { roughness: 0.5 });
  const hornMat = material('#d8d0bc', { metalness: 0.1, roughness: 0.28 });
  const clawMat = material('#27231f', { metalness: 0.18, roughness: 0.32 });
  const membraneMat = material(color, { transparent: true, opacity: 0.58, side: THREE.DoubleSide, roughness: 0.36 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.92, 32, 20), bodyMat);
  body.scale.set(1.45, 1.18, 0.86);
  body.position.set(0, 1.36, 0);
  body.castShadow = true;
  body.receiveShadow = true;
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.54, 24, 14), bellyMat);
  belly.scale.set(0.72, 1.25, 0.32);
  belly.position.set(0.22, 1.26, 0.55);
  belly.castShadow = true;
  const chestPlate = mesh(new THREE.BoxGeometry(0.58, 0.12, 0.05), '#b8a98e', [0.34, 1.62, 0.86]);
  chestPlate.rotation.x = -0.28;

  const neck = capsule(color, 0.22, 1.18, [0.9, 1.84, 0.08]);
  neck.rotation.z = -0.72;
  neck.rotation.y = -0.08;
  const head = mesh(new THREE.SphereGeometry(0.44, 28, 16), color, [1.62, 2.16, 0.1]);
  head.scale.set(1.15, 0.82, 0.72);
  const snout = cone(color, 0.25, 0.78, [2.06, 2.1, 0.1]);
  snout.rotation.z = -Math.PI / 2;
  snout.scale.y = 0.78;
  const jaw = mesh(new THREE.BoxGeometry(0.42, 0.12, 0.16), '#31241d', [1.95, 1.93, 0.1]);
  jaw.rotation.z = -0.12;
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#ffd166' });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), eyeMat);
  eyeL.position.set(1.77, 2.24, 0.38);
  const eyeR = eyeL.clone();
  eyeR.position.z = -0.18;

  const hornL = cone('#d8d0bc', 0.075, 0.88, [1.38, 2.55, 0.28]);
  hornL.material = hornMat;
  hornL.rotation.z = -0.45;
  hornL.rotation.x = 0.42;
  const hornR = hornL.clone();
  hornR.position.z = -0.08;
  hornR.rotation.x = -0.42;
  const browL = cone(color, 0.08, 0.42, [1.84, 2.3, 0.34]);
  browL.rotation.z = -1.1;
  browL.rotation.x = 0.35;
  const browR = browL.clone();
  browR.position.z = -0.14;
  browR.rotation.x = -0.35;

  const spines = new THREE.Group();
  for (let i = 0; i < 7; i += 1) {
    const spine = cone('#d8d0bc', 0.06 - i * 0.004, 0.34 - i * 0.018, [1.26 - i * 0.36, 2.35 - i * 0.12, 0]);
    spine.material = hornMat;
    spine.rotation.z = -0.25 + i * 0.05;
    spines.add(spine);
  }

  const makeWing = (side: 1 | -1) => {
    const wing = new THREE.Group();
    const root = [0.0, 1.95, side * 0.48] as [number, number, number];
    const upper = capsule('#d8d0bc', 0.035, 1.6, [root[0] - 0.42, root[1] + 0.44, root[2] + side * 0.52]);
    upper.material = hornMat;
    upper.rotation.set(0.25, side * 0.3, side * 0.92);
    const outer = capsule('#d8d0bc', 0.03, 1.5, [root[0] - 0.98, root[1] + 0.1, root[2] + side * 1.02]);
    outer.material = hornMat;
    outer.rotation.set(-0.18, side * 0.18, side * 1.24);
    const membrane = new THREE.Mesh(new THREE.CircleGeometry(1, 4), membraneMat);
    membrane.position.set(root[0] - 0.68, root[1] + 0.18, root[2] + side * 0.75);
    membrane.scale.set(1.25, 0.7, 1);
    membrane.rotation.set(0.75, side * 0.42, side * -0.62);
    membrane.castShadow = true;
    wing.add(upper, outer, membrane);
    return wing;
  };
  const wingL = makeWing(1);
  const wingR = makeWing(-1);

  const makeLeg = (x: number, z: number, front: boolean) => {
    const leg = new THREE.Group();
    const upper = capsule(color, front ? 0.12 : 0.16, front ? 0.58 : 0.72, [x, front ? 0.92 : 0.78, z]);
    upper.material = bodyMat;
    upper.rotation.z = front ? 0.58 : -0.35;
    const foot = mesh(new THREE.BoxGeometry(front ? 0.34 : 0.48, 0.16, 0.36), color, [x + (front ? 0.28 : -0.18), 0.28, z]);
    for (let i = 0; i < 3; i += 1) {
      const claw = cone('#27231f', 0.035, 0.16, [foot.position.x + 0.12 + i * 0.08, 0.29, z + (i - 1) * 0.08]);
      claw.material = clawMat;
      claw.rotation.z = -Math.PI / 2;
      leg.add(claw);
    }
    leg.add(upper, foot);
    return leg;
  };
  const legs = new THREE.Group();
  legs.add(makeLeg(0.72, 0.52, true), makeLeg(0.72, -0.42, true), makeLeg(-0.62, 0.48, false), makeLeg(-0.62, -0.38, false));

  const tail = new THREE.Group();
  for (let i = 0; i < 7; i += 1) {
    const segment = capsule(color, Math.max(0.07, 0.16 - i * 0.014), 0.38, [-1.05 - i * 0.28, 1.0 + Math.sin(i * 0.75) * 0.18, Math.sin(i * 0.8) * 0.38]);
    segment.material = bodyMat;
    segment.rotation.z = 1.12 - i * 0.08;
    segment.rotation.y = Math.sin(i * 0.65) * 0.42;
    tail.add(segment);
  }
  const tailTip = cone('#d8d0bc', 0.09, 0.36, [-2.9, 1.02, -0.12]);
  tailTip.material = hornMat;
  tailTip.rotation.z = Math.PI / 2;
  tail.add(tailTip);

  const fire = new THREE.Mesh(
    new THREE.ConeGeometry(0.34, 1.55, 12),
    new THREE.MeshBasicMaterial({ color: '#ff8a1f', transparent: true, opacity: 0.88 })
  );
  fire.position.set(2.58, 2.04, 0.1);
  fire.rotation.z = -Math.PI / 2;
  dragon.add(body, belly, chestPlate, neck, head, snout, jaw, eyeL, eyeR, hornL, hornR, browL, browR, spines, wingL, wingR, legs, tail, fire);
  dragon.position.set(4.2, 0, -0.5);
  dragon.userData = { bodyMat, body, head, neck, wingL, wingR, fire, jaw, tail, spines };
  return dragon;
}

function makeNightKingFallback() {
  const boss = new THREE.Group();
  const iceSkin = material('#b8c5c9', { roughness: 0.48, metalness: 0.08 });
  const armor = material('#1b2430', { roughness: 0.34, metalness: 0.45 });
  const frost = material('#d9f7ff', { emissive: '#75e6da', emissiveIntensity: 0.45, roughness: 0.26 });

  const body = capsule('#1b2430', 0.56, 2.1, [0, 2.25, 0]);
  body.material = armor;
  body.scale.set(0.82, 1.12, 0.58);
  const bellyArmor = mesh(new THREE.BoxGeometry(0.9, 1.25, 0.18), '#273445', [0, 2.34, 0.42], { metalness: 0.5, roughness: 0.3 });
  const head = mesh(new THREE.SphereGeometry(0.42, 24, 16), '#b8c5c9', [0, 3.75, 0.12]);
  head.material = iceSkin;
  head.scale.set(0.82, 1.22, 0.78);
  const crown = new THREE.Group();
  for (let i = 0; i < 7; i += 1) {
    const spike = cone('#d9f7ff', 0.06, 0.62 + Math.abs(i - 3) * 0.08, [(-0.36 + i * 0.12), 4.18 + Math.abs(i - 3) * 0.04, 0.06]);
    spike.material = frost;
    spike.rotation.z = (i - 3) * 0.18;
    crown.add(spike);
  }
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#9bf6ff' });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), eyeMat);
  eyeL.position.set(-0.13, 3.8, 0.44);
  const eyeR = eyeL.clone();
  eyeR.position.x *= -1;
  const armL = capsule('#b8c5c9', 0.11, 1.75, [-0.78, 2.34, 0.05]);
  armL.material = iceSkin;
  armL.rotation.z = -1.12;
  const armR = armL.clone();
  armR.position.x *= -1;
  armR.rotation.z = 1.12;
  const legL = capsule('#1b2430', 0.14, 1.38, [-0.26, 0.86, 0]);
  legL.material = armor;
  const legR = legL.clone();
  legR.position.x *= -1;
  const cape = mesh(new THREE.BoxGeometry(1.2, 2.5, 0.1), '#090d14', [0, 2.05, -0.36], { roughness: 0.82 });
  cape.rotation.x = 0.12;
  const sword = new THREE.Group();
  const blade = mesh(new THREE.BoxGeometry(0.08, 2.45, 0.04), '#d9f7ff', [0.82, 1.92, 0.3], { emissive: '#75e6da', emissiveIntensity: 0.5, metalness: 0.6 });
  blade.rotation.z = -0.25;
  const guard = mesh(new THREE.BoxGeometry(0.46, 0.08, 0.06), '#6d7b87', [0.62, 0.82, 0.3], { metalness: 0.55 });
  sword.add(blade, guard);

  boss.add(cape, body, bellyArmor, head, crown, eyeL, eyeR, armL, armR, legL, legR, sword);
  boss.userData.head = head;
  return boss;
}

export function BattleScene3D(props: BattleScene3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef(props);
  const [modelsReady, setModelsReady] = useState(false);

  useEffect(() => {
    refs.current = props;
  }, [props]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    setModelsReady(false);
    const requiredModels = new Set(['hero', 'goblin', 'nightKing', 'recRoomMonster', 'recRoomRun']);
    let disposed = false;
    const markModelReady = (key: string) => {
      requiredModels.delete(key);
      if (!disposed && requiredModels.size === 0) setModelsReady(true);
    };
    const modelReadyFallback = window.setTimeout(() => {
      if (!disposed) setModelsReady(true);
    }, 5000);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#081111');
    scene.fog = new THREE.Fog('#081111', 12, 70);

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 900);
    camera.position.set(0, 4.3, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = 'battle-canvas';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight('#c8f4ff', '#21150f', 1.08));
    const fill = new THREE.DirectionalLight('#7fc8ff', 0.9);
    fill.position.set(6, 5, -4);
    scene.add(fill);
    const key = new THREE.DirectionalLight('#fff0c2', 3.15);
    key.position.set(-5.5, 10, 6.5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 60;
    key.shadow.camera.left = -24;
    key.shadow.camera.right = 24;
    key.shadow.camera.top = 24;
    key.shadow.camera.bottom = -24;
    scene.add(key);

    addCaveCity(scene);
    const locationRoot = new THREE.Group();
    scene.add(locationRoot);
    const downloadedMapRoot = new THREE.Group();
    scene.add(downloadedMapRoot);
    const recRoomLocation = new THREE.Group();
    recRoomLocation.position.set(0, 0, -26);
    scene.add(recRoomLocation);
    const recRoomRunLocation = new THREE.Group();
    recRoomRunLocation.position.set(34, 0, -18);
    recRoomRunLocation.rotation.y = -0.38;
    scene.add(recRoomRunLocation);
    const locationLoader = new GLTFLoader();
    const mapPropTemplates = new Map<string, THREE.Object3D>();
    const loadMapProp = (path: string, locationKey: string, position: [number, number, number], scale: number, rotationY = 0) => {
      const placeModel = (template: THREE.Object3D) => {
        if (locationKey !== activeLocationKey) return;
        const model = template.clone(true);
        model.position.set(...position);
        model.rotation.y = rotationY;
        model.scale.setScalar(scale);
        downloadedMapRoot.add(model);
      };

      const template = mapPropTemplates.get(path);
      if (template) {
        placeModel(template);
        return;
      }

      locationLoader.load(path, (gltf) => {
        const model = gltf.scene;
        model.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
          }
        });
        fitMapPropModel(model);
        mapPropTemplates.set(path, model);
        placeModel(model);
      });
    };
    const addDownloadedMapDecor = (locationKey: string, data: BattleScene3DProps) => {
      const natureBase = '/models/map-packs/nature-kit/Models/GLTF%20format';
      const townBase = '/models/map-packs/fantasy-town-kit/Models/GLB%20format';
      const caveBase = '/models/map-packs/modular-cave-kit/Models/GLB%20format';
      const dungeonBase = '/models/map-packs/modular-dungeon-kit/Models/GLB%20format';
      const mapPresets = [
        [`${natureBase}/tree_oak.glb`, `${natureBase}/tree_cone.glb`, `${natureBase}/rock_largeA.glb`, `${natureBase}/plant_bushLarge.glb`, `${natureBase}/bridge_wood.glb`],
        [`${natureBase}/tree_default.glb`, `${natureBase}/tree_fat.glb`, `${natureBase}/rock_smallA.glb`, `${natureBase}/grass_large.glb`, `${natureBase}/campfire_stones.glb`],
        [`${natureBase}/tree_blocks.glb`, `${natureBase}/tree_detailed.glb`, `${natureBase}/rock_tallA.glb`, `${natureBase}/plant_flatTall.glb`, `${natureBase}/bridge_stone.glb`],
        [`${natureBase}/tree_oak_dark.glb`, `${natureBase}/tree_cone_dark.glb`, `${natureBase}/rock_largeB.glb`, `${natureBase}/plant_bushTriangle.glb`, `${natureBase}/bridge_woodRound.glb`],
        [`${natureBase}/tree_default_fall.glb`, `${natureBase}/tree_fat_fall.glb`, `${natureBase}/rock_largeC.glb`, `${natureBase}/plant_bushSmall.glb`, `${natureBase}/campfire_logs.glb`],
        [`${natureBase}/tree_blocks_dark.glb`, `${natureBase}/tree_detailed_dark.glb`, `${natureBase}/rock_tallB.glb`, `${natureBase}/grass_leafsLarge.glb`, `${natureBase}/bridge_stoneRound.glb`],
        [`${natureBase}/tree_oak_fall.glb`, `${natureBase}/tree_cone_fall.glb`, `${natureBase}/rock_smallFlatA.glb`, `${natureBase}/plant_bushDetailed.glb`, `${natureBase}/bridge_woodNarrow.glb`],
        [`${natureBase}/tree_default_dark.glb`, `${natureBase}/tree_fat_darkh.glb`, `${natureBase}/rock_tallC.glb`, `${natureBase}/grass.glb`, `${natureBase}/bridge_stoneNarrow.glb`],
        [`${natureBase}/tree_detailed_fall.glb`, `${natureBase}/tree_blocks_fall.glb`, `${natureBase}/rock_largeD.glb`, `${natureBase}/plant_flatShort.glb`, `${natureBase}/campfire_bricks.glb`],
        [`${natureBase}/tree_cone.glb`, `${natureBase}/tree_oak.glb`, `${natureBase}/rock_tallD.glb`, `${natureBase}/plant_bushLargeTriangle.glb`, `${natureBase}/bridge_woodRoundNarrow.glb`],
        [`${townBase}/wall-arch.glb`, `${townBase}/wall-window-stone.glb`, `${townBase}/road.glb`, `${townBase}/fountain-round.glb`, `${townBase}/stairs-stone.glb`],
        [`${townBase}/wall-door.glb`, `${townBase}/wall-block.glb`, `${townBase}/road-corner.glb`, `${townBase}/rock-large.glb`, `${townBase}/stairs-full.glb`],
        [`${townBase}/wall-broken.glb`, `${townBase}/wall-window-shutters.glb`, `${townBase}/road-bend.glb`, `${townBase}/fountain-square.glb`, `${townBase}/stairs-wide-stone.glb`],
        [`${townBase}/wall-corner.glb`, `${townBase}/wall-doorway-round.glb`, `${townBase}/road-edge.glb`, `${townBase}/rock-wide.glb`, `${townBase}/stairs-wood.glb`],
        [`${townBase}/wall-rounded.glb`, `${townBase}/wall-window-round.glb`, `${townBase}/road-curb.glb`, `${townBase}/fountain-center.glb`, `${townBase}/stairs-stone-round.glb`],
        [`${townBase}/wall-wood-arch.glb`, `${townBase}/wall-wood-block.glb`, `${townBase}/road-slope.glb`, `${townBase}/rock-small.glb`, `${townBase}/stairs-wide-wood.glb`],
        [`${townBase}/wall-detail-cross.glb`, `${townBase}/wall-doorway-square.glb`, `${townBase}/road-curb-end.glb`, `${townBase}/fountain-edge.glb`, `${townBase}/stairs-stone-handrail.glb`],
        [`${townBase}/wall-half.glb`, `${townBase}/wall-window-glass.glb`, `${townBase}/road-corner-inner.glb`, `${townBase}/fountain-curved.glb`, `${townBase}/stairs-wood-handrail.glb`],
        [`${townBase}/wall-diagonal.glb`, `${townBase}/wall-doorway-square-wide.glb`, `${townBase}/road-edge-slope.glb`, `${townBase}/fountain-round-detail.glb`, `${townBase}/stairs-full-corner-outer.glb`],
        [`${townBase}/wall-wood-broken.glb`, `${townBase}/wall-wood-corner.glb`, `${townBase}/road.glb`, `${townBase}/fountain-square-detail.glb`, `${townBase}/stairs-full-corner-inner.glb`],
        [`${caveBase}/room-small.glb`, `${caveBase}/gate-rock.glb`, `${caveBase}/corridor-wide.glb`, `${caveBase}/stairs.glb`],
        [`${caveBase}/room-large.glb`, `${caveBase}/gate.glb`, `${caveBase}/corridor-corner.glb`, `${caveBase}/stairs-wide.glb`],
        [`${caveBase}/room-wide.glb`, `${caveBase}/gate-metal-bars.glb`, `${caveBase}/corridor-junction.glb`, `${caveBase}/corridor-end.glb`],
        [`${caveBase}/room-corner.glb`, `${caveBase}/gate-overhang.glb`, `${caveBase}/corridor-intersection.glb`, `${caveBase}/corridor-transition.glb`],
        [`${caveBase}/room-small-variation.glb`, `${caveBase}/gate-rock.glb`, `${caveBase}/corridor-wide-corner.glb`, `${caveBase}/stairs.glb`],
        [`${caveBase}/room-large-variation.glb`, `${caveBase}/gate.glb`, `${caveBase}/corridor-wide-junction.glb`, `${caveBase}/stairs-wide.glb`],
        [`${caveBase}/room-wide-variation.glb`, `${caveBase}/gate-metal-bars.glb`, `${caveBase}/corridor-wide-end.glb`, `${caveBase}/corridor-wide-intersection.glb`],
        [`${caveBase}/room-small.glb`, `${caveBase}/gate-overhang.glb`, `${caveBase}/corridor.glb`, `${caveBase}/template-wall-stairs.glb`],
        [`${caveBase}/room-large.glb`, `${caveBase}/gate-rock.glb`, `${caveBase}/corridor-wide.glb`, `${caveBase}/corridor-transition.glb`],
        [`${caveBase}/room-wide.glb`, `${caveBase}/gate.glb`, `${caveBase}/corridor-corner.glb`, `${caveBase}/stairs-wide.glb`],
        [`${dungeonBase}/room-small.glb`, `${dungeonBase}/gate.glb`, `${dungeonBase}/corridor.glb`, `${dungeonBase}/stairs-wide.glb`],
        [`${dungeonBase}/room-large.glb`, `${dungeonBase}/gate-metal-bars.glb`, `${dungeonBase}/corridor-corner.glb`, `${dungeonBase}/stairs.glb`],
        [`${dungeonBase}/room-wide.glb`, `${dungeonBase}/gate-door.glb`, `${dungeonBase}/corridor-junction.glb`, `${dungeonBase}/corridor-end.glb`],
        [`${dungeonBase}/room-corner.glb`, `${dungeonBase}/gate.glb`, `${dungeonBase}/corridor-intersection.glb`, `${dungeonBase}/stairs-wide.glb`],
        [`${dungeonBase}/room-small-variation.glb`, `${dungeonBase}/gate-metal-bars.glb`, `${dungeonBase}/corridor-wide.glb`, `${dungeonBase}/stairs.glb`],
        [`${dungeonBase}/room-large-variation.glb`, `${dungeonBase}/gate.glb`, `${dungeonBase}/corridor-wide-corner.glb`, `${dungeonBase}/corridor-transition.glb`],
        [`${dungeonBase}/room-wide-variation.glb`, `${dungeonBase}/gate-door.glb`, `${dungeonBase}/corridor-wide-junction.glb`, `${dungeonBase}/stairs-wide.glb`],
        [`${dungeonBase}/room-small.glb`, `${dungeonBase}/gate-metal-bars.glb`, `${dungeonBase}/corridor-wide-end.glb`, `${dungeonBase}/corridor-wide-intersection.glb`],
        [`${dungeonBase}/room-large.glb`, `${dungeonBase}/gate.glb`, `${dungeonBase}/corridor.glb`, `${dungeonBase}/template-wall-stairs.glb`],
        [`${dungeonBase}/room-wide.glb`, `${dungeonBase}/gate-door.glb`, `${dungeonBase}/corridor-corner.glb`, `${dungeonBase}/stairs.glb`],
      ];
      const presetIndex = Math.abs(data.chapter * 7 + data.locationIndex * 13 + hashSceneKey(data.sceneKey)) % mapPresets.length;
      const positions: Array<[number, number, number]> = [
        [-42, 0, -42],
        [42, 0, -42],
        [-52, 0, -14],
        [52, 0, -14],
        [-42, 0, 34],
        [42, 0, 34],
        [-18, 0, -50],
        [18, 0, 48],
        [-58, 0, 44],
        [58, 0, 44],
      ];
      const selectedPack = mapPresets[presetIndex];
      positions.forEach((position, index) => {
        const path = selectedPack[index % selectedPack.length];
        const family = Math.floor(presetIndex / 10);
        const size = family === 0 ? 0.62 + (index % 3) * 0.12 : family === 1 ? 0.82 : 0.95;
        loadMapProp(path, locationKey, position, size, Math.sin(index + data.chapter) * 0.9);
      });
    };
    locationLoader.load(
      '/models/rec-room-monster/scene.gltf',
      (gltf) => {
        const model = gltf.scene;
        model.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
          }
        });
        fitLocationModel(model);
        recRoomLocation.add(model);
        markModelReady('recRoomMonster');
      }
      ,
      undefined,
      () => markModelReady('recRoomMonster')
    );
    locationLoader.load(
      '/models/rec-room-run-location/scene.gltf',
      (gltf) => {
        const model = gltf.scene;
        model.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
          }
        });
        fitLocationModel(model);
        recRoomRunLocation.add(model);
        markModelReady('recRoomRun');
      },
      undefined,
      () => markModelReady('recRoomRun')
    );
    let activeLocationKey = '';
    const disposeLocationObject = (object: THREE.Object3D) => {
      object.traverse((entry) => {
        if (entry instanceof THREE.Mesh) {
          entry.geometry.dispose();
          const objectMaterial = entry.material;
          if (Array.isArray(objectMaterial)) objectMaterial.forEach((item) => item.dispose());
          else objectMaterial.dispose();
        }
      });
    };
    const rebuildLocation = () => {
      const data = refs.current;
      const nextLocationKey = `${data.sceneKey}-${data.chapter}-${data.locationIndex}-${data.monstersLeft > 0 ? 'captured' : 'free'}`;
      if (nextLocationKey === activeLocationKey) return;
      activeLocationKey = nextLocationKey;
      while (locationRoot.children.length) {
        const child = locationRoot.children.pop();
        if (child) disposeLocationObject(child);
      }
      downloadedMapRoot.clear();
      add3DLocation(scene, locationRoot, data.sceneKey, data.chapter, data.locationIndex, data.monstersLeft > 0 && !data.isFinalReveal);
      addDownloadedMapDecor(nextLocationKey, data);
      const downloadedVariant = Math.abs(data.chapter + data.locationIndex + hashSceneKey(data.sceneKey)) % 3;
      recRoomLocation.visible = downloadedVariant === 1;
      recRoomRunLocation.visible = downloadedVariant === 2;
      recRoomLocation.position.set(-30 + (data.locationIndex % 3) * 10, 0, -28);
      recRoomRunLocation.position.set(28 - (data.locationIndex % 4) * 5, 0, -20);
      recRoomRunLocation.rotation.y = -0.38 + (data.chapter % 5) * 0.12;
    };
    rebuildLocation();

    const hero = makeHero();
    const heroArtifact = makeHeroArtifact();
    const heroEquippedWeapon = makeEquippedHeroWeapon();
    const dragon = makeDragon(refs.current.dragonColor);
    const nightKingBoss = new THREE.Group();
    const nightKingFallback = makeNightKingFallback();
    nightKingBoss.add(nightKingFallback);
    nightKingBoss.position.set(0, 0, -18);
    nightKingBoss.scale.setScalar(3.8);
    const specialBosses = new THREE.Group();
    const specialBossModels: Record<string, THREE.Object3D> = {};
    const specialBossAura = new THREE.Mesh(
      new THREE.TorusGeometry(2.25, 0.055, 8, 72),
      new THREE.MeshBasicMaterial({ color: '#ff2a1f', transparent: true, opacity: 0, depthWrite: false })
    );
    specialBossAura.rotation.x = -Math.PI / 2;
    specialBossAura.visible = false;
    const specialBossBlast = new THREE.Mesh(
      new THREE.ConeGeometry(0.45, 4.8, 18),
      new THREE.MeshBasicMaterial({ color: '#ff5a3d', transparent: true, opacity: 0, depthWrite: false })
    );
    specialBossBlast.visible = false;
    scene.add(hero, heroArtifact, heroEquippedWeapon, dragon, nightKingBoss, specialBosses, specialBossAura, specialBossBlast);

    const gltfLoader = new GLTFLoader();
    const heroMixers: THREE.AnimationMixer[] = [];
    const heroClipActions: Record<string, THREE.AnimationAction> = {};
    let activeHeroClip = '';
    let hasDownloadedHeroAnimations = false;
    const findHeroClip = (...names: string[]) => {
      const availableNames = Object.keys(heroClipActions);
      for (const name of names) {
        if (heroClipActions[name]) return name;
        const lowerName = name.toLowerCase();
        const match = availableNames.find((entry) => entry.toLowerCase().includes(lowerName));
        if (match) return match;
      }
      return '';
    };
    const playHeroClip = (clipName: string, fade = 0.14, once = false, timeScale = 1) => {
      const nextAction = heroClipActions[clipName];
      if (!nextAction) return false;
      nextAction.timeScale = timeScale;
      if (activeHeroClip === clipName && !once) return true;
      const previousAction = heroClipActions[activeHeroClip];
      if (previousAction && previousAction !== nextAction) previousAction.fadeOut(fade);
      nextAction.enabled = true;
      nextAction.reset();
      nextAction.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity);
      nextAction.clampWhenFinished = once;
      nextAction.fadeIn(fade).play();
      activeHeroClip = clipName;
      return true;
    };
    gltfLoader.load(
      '/models/kaykit-knight/Knight.glb',
      (gltf) => {
        hero.children.forEach((child) => {
          child.visible = false;
        });
        const model = gltf.scene;
        tuneDownloadedCharacter(model);
        fitHeroModel(model);
        model.name = 'downloaded-hero-model';
        hero.add(model);
        hero.userData.downloadedModel = model;
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            heroClipActions[clip.name] = mixer.clipAction(clip);
          });
          hasDownloadedHeroAnimations = true;
          playHeroClip(findHeroClip('Idle', 'idle'), 0);
          heroMixers.push(mixer);
          hero.userData.downloadedMixer = mixer;
        }
        markModelReady('hero');
      },
      undefined,
      () => {
        hero.children.forEach((child) => {
          child.visible = true;
        });
        markModelReady('hero');
      }
    );
    gltfLoader.load(
      '/models/night-king/scene.gltf',
      (gltf) => {
        nightKingFallback.visible = false;
        const model = gltf.scene;
        model.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
            const objectMaterial = object.material;
            const tuneMaterial = (item: THREE.Material) => {
              if (item instanceof THREE.MeshStandardMaterial) {
                item.roughness = Math.min(0.72, item.roughness + 0.12);
                item.metalness = Math.max(item.metalness, 0.05);
              }
            };
            if (Array.isArray(objectMaterial)) objectMaterial.forEach(tuneMaterial);
            else tuneMaterial(objectMaterial);
          }
        });
        model.rotation.y = Math.PI;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.position.y += size.y / 2;
        model.scale.setScalar(size.y > 0 ? 14 / size.y : 4.2);
        nightKingBoss.add(model);
        nightKingBoss.userData.loadedModel = model;
        markModelReady('nightKing');
      },
      undefined,
      () => {
        nightKingFallback.visible = true;
        markModelReady('nightKing');
      }
    );

    const loadSpecialBossModel = (key: string, path: string, targetHeight: number, rotationY = Math.PI, tint?: string) => {
      gltfLoader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.castShadow = true;
              object.receiveShadow = true;
              const objectMaterial = object.material;
              const tuneMaterial = (item: THREE.Material) => {
                if (item instanceof THREE.MeshStandardMaterial) {
                  item.roughness = Math.min(0.88, item.roughness + 0.08);
                  item.metalness = Math.max(item.metalness, 0.04);
                  if (tint) {
                    item.color.lerp(new THREE.Color(tint), 0.32);
                    item.emissive.set(tint);
                    item.emissiveIntensity = Math.max(item.emissiveIntensity, 0.08);
                  }
                }
              };
              if (Array.isArray(objectMaterial)) objectMaterial.forEach(tuneMaterial);
              else tuneMaterial(objectMaterial);
            }
          });
          fitBossModel(model, targetHeight);
          model.userData.baseScale = model.scale.x;
          model.userData.baseRotationY = rotationY;
          model.userData.phase = Math.random() * Math.PI * 2;
          model.userData.tint = tint ?? '#ff2a1f';
          model.rotation.y = rotationY;
          model.visible = false;
          specialBosses.add(model);
          specialBossModels[key] = model;
        },
        undefined,
        () => undefined
      );
    };

    loadSpecialBossModel('goblin', '/models/custom-goblin-upload/scene.gltf', 6.2, Math.PI, '#65a832');
    loadSpecialBossModel('fury', '/models/latest-monster/scene.gltf', 7.4, Math.PI, '#111111');
    loadSpecialBossModel('anuar', '/models/monster-replacement/scene.gltf', 7.2, Math.PI, '#ff5a3d');
    loadSpecialBossModel('mansur', '/models/custom-hero/scene.gltf', 6.4, Math.PI, '#9cff00');
    loadSpecialBossModel('arailm', '/models/rec-room-monster/scene.gltf', 7.6, Math.PI, '#ff2a1f');
    loadSpecialBossModel('ais', '/models/fatalis/scene.gltf', 8.2, -Math.PI / 2, '#2f80ed');
    loadSpecialBossModel('admin', '/models/night-king/scene.gltf', 8.2, Math.PI, '#ff2a1f');
    loadSpecialBossModel('death', '/models/night-king/scene.gltf', 8.8, Math.PI, '#8b0000');
    loadSpecialBossModel('spirit', '/models/fatalis/scene.gltf', 7.8, -Math.PI / 2, '#b56cff');
    loadSpecialBossModel('bbi', '/models/latest-monster/scene.gltf', 7.6, Math.PI, '#ffe66d');
    loadSpecialBossModel('nurali', '/models/monster-replacement/scene.gltf', 7.6, Math.PI, '#75e6da');

    const monsterSlashMaterial = new THREE.MeshBasicMaterial({ color: '#ff4d2e', transparent: true, opacity: 0, depthWrite: false });
    const monsters = new THREE.Group();
    const visualMonsterCount = 24;
    for (let i = 0; i < visualMonsterCount; i += 1) {
      const monster = makeMonster(refs.current.monsterKind, i);
      const attackTrail = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.03, 8, 28, Math.PI * 1.12), monsterSlashMaterial.clone());
      attackTrail.visible = false;
      attackTrail.userData.attackTrail = true;
      attackTrail.position.set(0, 1.08, -0.62);
      attackTrail.rotation.set(-0.55, 0, 0.92);
      monster.add(attackTrail);
      const ring = 8 + (i % 6) * 3.7;
      const angle = (i / visualMonsterCount) * Math.PI * 2;
      const homeX = Math.cos(angle) * ring + Math.sin(i * 1.7) * 4;
      const homeZ = Math.sin(angle) * ring - 5 + Math.cos(i * 1.2) * 4;
      monster.position.set(homeX, 0, homeZ);
      monster.rotation.y = Math.PI + Math.sin(i) * 0.35;
      monster.userData.homeX = homeX;
      monster.userData.homeZ = homeZ;
      monster.userData.speed = monsterRunSpeedMetersPerSecond;
      monster.userData.attackFlash = 0;
      monster.userData.attackCycle = (i % 7) * 0.13;
      monster.userData.botState = 'chase';
      monster.userData.botAngle = angle + (i % 3 - 1) * 0.32;
      monster.userData.botOrbit = 0.7 + (i % 5) * 0.18;
      monster.userData.attackCooldown = (i % 6) * 0.18;
      monster.userData.attackTrail = attackTrail;
      monsters.add(monster);
    }
    scene.add(monsters);

    gltfLoader.load(
      '/models/custom-goblin-upload/scene.gltf',
      (gltf) => {
        const template = gltf.scene;
        template.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
          }
        });
        monsters.children.forEach((monster, index) => {
          const current = monster as THREE.Group;
          current.children.forEach((child) => {
            child.visible = child.userData.attackTrail === true;
          });
          const model = template.clone(true);
          fitGoblinModel(model);
          model.name = 'loaded-goblin-model';
          model.rotation.y += (index % 2 ? 0.08 : -0.08);
          current.add(model);
          current.userData.loadedGoblinModel = model;
          current.userData.loadedGoblinBaseRotationY = model.rotation.y;
          current.userData.baseY = 0.02;
        });
        markModelReady('goblin');
      },
      undefined,
      () => {
        monsters.children.forEach((monster) => {
          (monster as THREE.Group).children.forEach((child) => {
            child.visible = true;
          });
        });
        markModelReady('goblin');
      }
    );

    const ashMat = new THREE.MeshBasicMaterial({ color: '#aee9e3', transparent: true, opacity: 0.58 });
    const motes = new THREE.Group();
    for (let i = 0; i < 180; i += 1) {
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.025 + (i % 3) * 0.01, 8, 6), ashMat);
      mote.position.set(-80 + Math.random() * 160, 0.6 + Math.random() * 12, -86 + Math.random() * 170);
      mote.userData.seed = Math.random() * 10;
      motes.add(mote);
    }
    scene.add(motes);

    const slashTrail = new THREE.Mesh(
      new THREE.TorusGeometry(0.92, 0.035, 8, 42, Math.PI * 1.18),
      new THREE.MeshBasicMaterial({ color: '#dff8ff', transparent: true, opacity: 0, depthWrite: false })
    );
    slashTrail.visible = false;
    scene.add(slashTrail);

    const castAura = new THREE.Group();
    const castAuraMaterials = ['#75e6da', '#b56cff', '#ffe66d'].map(
      (color) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
    );
    for (let index = 0; index < 3; index += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7 + index * 0.26, 0.018, 8, 72), castAuraMaterials[index]);
      ring.rotation.x = Math.PI / 2 + index * 0.42;
      ring.userData.phase = index * 0.7;
      castAura.add(ring);
    }
    for (let index = 0; index < 9; index += 1) {
      const rune = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.055 + (index % 3) * 0.012, 0),
        castAuraMaterials[index % castAuraMaterials.length]
      );
      rune.userData.phase = (index / 9) * Math.PI * 2;
      castAura.add(rune);
    }
    castAura.visible = false;
    scene.add(castAura);

    const footDustMaterial = new THREE.MeshBasicMaterial({ color: '#d9c6a3', transparent: true, opacity: 0, depthWrite: false });
    const footDust = new THREE.Group();
    for (let i = 0; i < 8; i += 1) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.12 + (i % 3) * 0.025, 8, 6), footDustMaterial);
      puff.userData.seed = i * 0.73;
      footDust.add(puff);
    }
    scene.add(footDust);

    const arcaneBolts = new THREE.Group();
    const arcaneBoltMaterial = new THREE.MeshBasicMaterial({ color: '#b56cff', transparent: true, opacity: 0, depthWrite: false });
    for (let index = 0; index < 18; index += 1) {
      const bolt = new THREE.Group();
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.11 + (index % 3) * 0.025, 12, 8), arcaneBoltMaterial.clone());
      const trail = new THREE.Mesh(
        new THREE.ConeGeometry(0.11 + (index % 3) * 0.018, 0.9, 12, 1, true),
        new THREE.MeshBasicMaterial({ color: '#b56cff', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
      );
      trail.rotation.x = Math.PI / 2;
      trail.position.z = -0.45;
      bolt.add(core, trail);
      bolt.visible = false;
      bolt.userData.seed = index * 0.53;
      bolt.userData.life = 0;
      bolt.userData.duration = 0.85;
      bolt.userData.core = core;
      bolt.userData.trail = trail;
      arcaneBolts.add(bolt);
    }
    scene.add(arcaneBolts);

    const arcaneBurstRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.35, 0.035, 10, 72),
      new THREE.MeshBasicMaterial({ color: '#b56cff', transparent: true, opacity: 0, depthWrite: false })
    );
    arcaneBurstRing.rotation.x = Math.PI / 2;
    arcaneBurstRing.visible = false;
    arcaneBurstRing.userData.life = 0;
    scene.add(arcaneBurstRing);

    const arcaneBurstLight = new THREE.PointLight('#b56cff', 0, 10);
    scene.add(arcaneBurstLight);

    const elementalFx = new THREE.Group();
    const makeFxMesh = (geometry: THREE.BufferGeometry, color: string, opacity: number) => {
      const fx = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
      fx.visible = false;
      fx.userData.baseOpacity = opacity;
      elementalFx.add(fx);
      return fx;
    };
    const elementalColors = ['#ff6b2b', '#75e6da', '#dff8ff', '#ff9f1c', '#8bd8ff', '#f8fbff', '#fff8e8', '#65ff7a', '#ff4fd8', '#8f5bff', '#ff2a1f', '#66f7ff', '#b7ff5a', '#8b5e34', '#facc15', '#ff7849', '#38bdf8', '#fff176'];
    const elementalMeshes = [
      makeFxMesh(new THREE.TorusGeometry(1.15, 0.08, 10, 72, Math.PI * 1.18), '#ff6b2b', 0.82),
      makeFxMesh(new THREE.CylinderGeometry(1.1, 1.6, 1.1, 24, 1, true), '#75e6da', 0.66),
      makeFxMesh(new THREE.TorusGeometry(1.05, 0.045, 8, 72), '#dff8ff', 0.72),
      makeFxMesh(new THREE.SphereGeometry(0.46, 24, 16), '#ff9f1c', 0.95),
      makeFxMesh(new THREE.TorusGeometry(0.95, 0.035, 8, 64, Math.PI * 1.12), '#8bd8ff', 0.78),
      makeFxMesh(new THREE.TorusGeometry(1.05, 0.026, 8, 64, Math.PI * 1.2), '#f8fbff', 0.68),
      makeFxMesh(new THREE.CylinderGeometry(0.38, 0.72, 7.5, 28, 1, true), '#fff8e8', 0.78),
      makeFxMesh(new THREE.SphereGeometry(0.72, 16, 12), '#65ff7a', 0.72),
      makeFxMesh(new THREE.TorusKnotGeometry(0.58, 0.045, 80, 8), '#ff4fd8', 0.78),
      makeFxMesh(new THREE.ConeGeometry(0.84, 2.7, 7, 1, true), '#8f5bff', 0.76),
      makeFxMesh(new THREE.RingGeometry(0.42, 1.6, 32), '#ff2a1f', 0.84),
      makeFxMesh(new THREE.IcosahedronGeometry(0.7, 1), '#66f7ff', 0.7),
      makeFxMesh(new THREE.TorusGeometry(1.05, 0.055, 8, 72, Math.PI * 1.7), '#b7ff5a', 0.72),
      makeFxMesh(new THREE.ConeGeometry(1.15, 1.9, 6, 1, true), '#8b5e34', 0.76),
      makeFxMesh(new THREE.TorusKnotGeometry(0.72, 0.035, 96, 10), '#facc15', 0.82),
      makeFxMesh(new THREE.DodecahedronGeometry(0.95, 0), '#ff7849', 0.84),
      makeFxMesh(new THREE.CylinderGeometry(0.72, 1.35, 2.2, 18, 1, true), '#38bdf8', 0.76),
      makeFxMesh(new THREE.SphereGeometry(1.05, 24, 16), '#fff176', 0.72),
    ];
    const elementalLight = new THREE.PointLight('#fff8e8', 0, 14);
    scene.add(elementalFx, elementalLight);

    const launchElementalFx = (kind: number, originX: number, originY: number, originZ: number, facing: number, boosted = false) => {
      const fx = elementalMeshes[((kind % elementalMeshes.length) + elementalMeshes.length) % elementalMeshes.length];
      fx.visible = true;
      fx.userData.life = 0.001;
      fx.userData.kind = kind % elementalMeshes.length;
      fx.userData.facing = facing;
      fx.userData.boosted = boosted;
      fx.position.set(originX + Math.sin(facing) * 1.1, originY + 0.85, originZ + Math.cos(facing) * 1.1);
      fx.scale.setScalar(boosted ? 1.35 : 1);
      elementalLight.position.copy(fx.position);
      elementalLight.color.set(elementalColors[kind % elementalColors.length]);
      elementalLight.intensity = boosted ? 6.5 : 4.2;
    };

    const launchArcaneBolts = (count: number, originX: number, originY: number, originZ: number, facing: number, effectKind: number) => {
      launchElementalFx(effectKind, originX, originY, originZ, facing, count > 6);
      let launched = 0;
      arcaneBolts.children.forEach((bolt) => {
        if (launched >= count || bolt.userData.life > 0) return;
        const spread = (launched - (count - 1) / 2) * 0.16;
        bolt.visible = true;
        bolt.position.set(originX + Math.sin(facing + spread) * 0.5, originY + 0.12 + launched * 0.035, originZ + Math.cos(facing + spread) * 0.5);
        bolt.userData.life = 0.001;
        bolt.userData.duration = arcaneAttackRadiusMeters / arcaneProjectileSpeedMetersPerSecond;
        bolt.userData.facing = facing + spread;
        bolt.userData.speed = arcaneProjectileSpeedMetersPerSecond;
        bolt.userData.lane = launched;
        bolt.userData.kind = effectKind;
        launched += 1;
      });
      if (count > 6) {
        arcaneBurstRing.visible = true;
        arcaneBurstRing.position.set(originX + Math.sin(facing) * 3.2, 0.08, originZ + Math.cos(facing) * 3.2);
        arcaneBurstRing.scale.setScalar(0.2);
        arcaneBurstRing.userData.life = 0.001;
        arcaneBurstLight.position.set(arcaneBurstRing.position.x, 1.3, arcaneBurstRing.position.z);
        arcaneBurstLight.intensity = 6.5;
      }
    };

    const clock = new THREE.Clock();
    let frame = 0;
    let lastPulse = refs.current.battlePulse;
    let lastArcanePulse = refs.current.arcanePulse;
    let lastArcaneBurstPulse = refs.current.arcaneBurstPulse;
    let lastHeroAnimation = refs.current.heroAnimation;
    let pulse = 0;
    let lastHeroX = refs.current.heroPosition.x / 1000;
    let lastHeroZ = refs.current.heroPosition.z / 1000;
    const initialFacing = refs.current.cameraYaw;
    let heroFacing = initialFacing;
    let renderFacing = initialFacing;
    let cameraYaw = initialFacing;
    const smoothHeroPosition = new THREE.Vector3(-3.4 + lastHeroX, 0, 1.2 + lastHeroZ);
    const targetHeroPosition = new THREE.Vector3(-3.4 + lastHeroX, 0, 1.2 + lastHeroZ);
    const cameraTarget = new THREE.Vector3(0, 3, 10);
    const lookTarget = new THREE.Vector3(0, 1.5, 0);
    const smoothLookTarget = new THREE.Vector3(0, 1.5, 0);
    let attackSwing = 0;
    let cameraReady = false;
    const heroAttackClips = [
      '1H_Melee_Attack_Slice_Horizontal',
      '1H_Melee_Attack_Slice_Diagonal',
      '1H_Melee_Attack_Chop',
      '1H_Melee_Attack_Stab',
      '2H_Melee_Attack_Slice',
    ];

    const resize = () => {
      const width = container.clientWidth || 640;
      const height = container.clientHeight || 520;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const animate = () => {
      const time = clock.getElapsedTime();
      const data = refs.current;
      const delta = clock.getDelta();
      heroMixers.forEach((mixer) => mixer.update(delta));
      rebuildLocation();
      const startedStrike = lastHeroAnimation !== data.heroAnimation && data.heroAnimation === 'strike';
      lastHeroAnimation = data.heroAnimation;
      if (lastPulse !== data.battlePulse || startedStrike) {
        lastPulse = data.battlePulse;
        pulse = 0.38;
        attackSwing = 1;
        const attackClip = heroAttackClips[Math.abs(data.battlePulse) % heroAttackClips.length];
        playHeroClip(findHeroClip(attackClip, '1H_Melee_Attack_Slice_Horizontal', 'Attack', 'Slice'), 0.06, true, 1.55);
      }
      const hasNewArcanePulse = lastArcanePulse !== data.arcanePulse;
      const hasNewArcaneBurst = lastArcaneBurstPulse !== data.arcaneBurstPulse;
      if (hasNewArcanePulse) lastArcanePulse = data.arcanePulse;
      if (hasNewArcaneBurst) lastArcaneBurstPulse = data.arcaneBurstPulse;
      if (!attackSwing) {
        if (data.heroHeight > 0) playHeroClip(findHeroClip('Jump_Full_Short', 'Jump'), 0.1, false, 1.1);
        else if (data.heroAnimation === 'cast') playHeroClip(findHeroClip('Spellcast_Raise', 'Spellcast', 'Cheer', 'Interact'), 0.08, false, 1.25);
        else if (data.isHeroMoving) playHeroClip(findHeroClip('Running_A', 'Running_B', 'Walking_A', 'Walking_B', 'Walking_C', 'Walking', 'Run'), 0.16, false, 1.18);
        else if (data.heroAnimation === 'heal') playHeroClip(findHeroClip('Cheer'), 0.12, false, 1);
        else playHeroClip(findHeroClip('Idle', 'idle'), 0.24, false, 0.9);
      }
      pulse = Math.max(0, pulse - delta);
      attackSwing = Math.max(0, attackSwing - delta * 2.8);
      const shake = pulse ? Math.sin(pulse * 76) * pulse : 0;
      const heroX = data.heroPosition.x / 1000;
      const heroZ = data.heroPosition.z / 1000;
      const burn = Math.max(0.18, data.burn / 100);
      const heroWorldX = -3.4 + heroX;
      const heroWorldZ = 1.2 + heroZ;
      const jumpHeight = data.heroHeight / 120;
      targetHeroPosition.set(heroWorldX, 0, heroWorldZ);
      smoothHeroPosition.lerp(targetHeroPosition, 1 - Math.exp(-delta * 18));

      scene.fog = new THREE.Fog('#081111', Math.max(18, data.viewDistance * 0.04), Math.max(180, data.viewDistance * 1.05));
      scene.traverse((object) => {
        if (object instanceof THREE.PointLight) object.intensity = 2.2 + burn * 2.8 + Math.sin(time * 8 + object.position.x) * 0.35;
        if (object.userData.flame instanceof THREE.Mesh) object.userData.flame.scale.y = 0.8 + burn * 0.5 + Math.sin(time * 9 + object.position.x) * 0.18;
      });
      downloadedMapRoot.children.forEach((object, index) => {
        object.rotation.y += Math.sin(time * 0.7 + index) * delta * 0.08;
        object.position.y += Math.sin(time * 1.4 + index) * delta * 0.018;
      });
      locationRoot.children.forEach((object, index) => {
        if (object instanceof THREE.Mesh && object.geometry instanceof THREE.PlaneGeometry) return;
        if (object.userData.smoke) {
          const seed = typeof object.userData.seed === 'number' ? object.userData.seed : index;
          object.position.y += Math.sin(time * 0.7 + seed) * delta * 0.14;
          object.position.x += Math.sin(time * 0.45 + seed) * delta * 0.08;
          object.scale.set(
            1 + Math.sin(time * 0.8 + seed) * 0.12,
            1.8 + Math.sin(time * 0.6 + seed) * 0.18,
            1 + Math.cos(time * 0.75 + seed) * 0.1
          );
          if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshBasicMaterial) {
            object.material.opacity = 0.24 + Math.sin(time * 0.9 + seed) * 0.08;
          }
          return;
        }
        object.rotation.y += Math.sin(time * 0.45 + index) * delta * 0.012;
      });

      hero.position.x = smoothHeroPosition.x;
      hero.position.z = smoothHeroPosition.z;
      const moveDX = heroX - lastHeroX;
      const moveDZ = heroZ - lastHeroZ;
      if (Math.hypot(data.heroDirection.x, data.heroDirection.z) > 0.01) {
        heroFacing = Math.atan2(data.heroDirection.x, data.heroDirection.z);
      } else if (Math.hypot(moveDX, moveDZ) > 0.005) {
        heroFacing = Math.atan2(moveDX, moveDZ);
      }
      renderFacing = smoothAngle(renderFacing, heroFacing, delta, data.isHeroMoving ? 4.6 : 3.2);
      cameraYaw = smoothAngle(cameraYaw, data.cameraYaw, delta, data.isHeroMoving ? 5.8 : 7.4);
      lastHeroX = heroX;
      lastHeroZ = heroZ;
      if (hasNewArcanePulse || hasNewArcaneBurst) {
        const effectKind = data.arcaneSpellKind % elementalMeshes.length;
        launchArcaneBolts(hasNewArcaneBurst ? 12 : 3, hero.position.x, hero.position.y + 1.34, hero.position.z, renderFacing, effectKind);
        monsters.children.forEach((monster, index) => {
          if (index > (hasNewArcaneBurst ? 10 : 4)) return;
          const current = monster as THREE.Group;
          current.userData.hitReact = 0.75 - index * 0.035;
        });
      }

      const walkCycle = data.isHeroMoving ? time * 12.5 : time * 4;
      const stride = Math.sin(walkCycle);
      const counterStride = Math.cos(walkCycle);
      const stepLift = Math.abs(Math.sin(walkCycle));
      const runTilt = data.isHeroMoving ? Math.sin(walkCycle * 0.5) * 0.055 : 0;
      const walkPower = data.isHeroMoving ? 0.74 : 0.12;
      const idleBreath = Math.sin(time * 1.8) * 0.018;
      const idleShift = Math.sin(time * 1.15) * 0.012;
      const capeWind = Math.sin(time * 2.4 + hero.position.x * 0.08 + hero.position.z * 0.05);
      const useFallbackHeroRig = !hasDownloadedHeroAnimations;
      const isTwoHandedWeapon = [3, 11, 14, 16, 18, 19].includes(data.equippedWeaponStyle);
      const downloadedHeroModel = hero.userData.downloadedModel as THREE.Object3D | undefined;
      updateEquippedHeroWeapon(heroEquippedWeapon, data.equippedWeaponStyle, data.hasArcaneWeapon);
      hero.scale.set(1 + Math.abs(idleBreath) * 0.018, 1 + idleBreath, 1 - Math.abs(idleBreath) * 0.012);
      hero.position.y =
        jumpHeight +
        Math.sin(time * 2.6) * (useFallbackHeroRig ? 0.035 : 0.022) +
        (data.isHeroMoving ? stepLift * (useFallbackHeroRig ? 0.095 : 0.045) : idleShift);
      hero.rotation.y = renderFacing + Math.sin(time * 1.8) * 0.014;
      hero.rotation.x = data.isHeroMoving ? -0.04 + runTilt * (useFallbackHeroRig ? 1 : 0.55) : 0;
      hero.rotation.z = data.isHeroMoving ? Math.sin(walkCycle) * (useFallbackHeroRig ? 0.055 : 0.024) : 0;
      if (downloadedHeroModel) {
        downloadedHeroModel.rotation.x = data.isHeroMoving ? stride * 0.035 - stepLift * 0.025 : Math.sin(time * 1.2) * 0.006;
        downloadedHeroModel.rotation.y = Math.sin(time * 1.4) * (data.isHeroMoving ? 0.018 : 0.006);
        downloadedHeroModel.rotation.z = data.isHeroMoving ? counterStride * 0.035 : Math.sin(time * 1.7) * 0.006;
        downloadedHeroModel.position.y = data.isHeroMoving ? stepLift * 0.07 : Math.sin(time * 1.6) * 0.012 + idleBreath * 0.35;
      }
      if (useFallbackHeroRig) {
        const runAmount = data.isHeroMoving ? 1 : 0;
        hero.userData.cape.rotation.y = capeWind * 0.08 - stride * 0.18 * runAmount;
        hero.userData.cape.rotation.x = -stepLift * 0.15 * runAmount + Math.sin(time * 1.7) * 0.035 - Math.max(0, capeWind) * 0.04;
        hero.userData.leftLeg.rotation.x = stride * walkPower - jumpHeight * 0.28;
        hero.userData.rightLeg.rotation.x = -stride * walkPower - jumpHeight * 0.28;
        hero.userData.leftLeg.rotation.z = 0.07 + counterStride * 0.08 * runAmount;
        hero.userData.rightLeg.rotation.z = -0.07 - counterStride * 0.08 * runAmount;
        hero.userData.leftArm.rotation.x = -stride * (data.isHeroMoving ? 0.58 : 0.08) - idleBreath * 1.3;
        hero.userData.rightArm.rotation.x = -0.18 + stride * (data.isHeroMoving ? 0.42 : 0.05) - idleBreath * 1.1;
        hero.userData.leftArm.rotation.z = -0.55 + Math.sin(time * 5) * 0.08 + stepLift * 0.14 * runAmount;
        hero.userData.rightArm.rotation.z = -1.18 - Math.sin(time * 5) * 0.05 - stepLift * 0.1 * runAmount;
        hero.userData.leftShoulder.rotation.z = -0.08 + stride * 0.08 * runAmount;
        hero.userData.rightShoulder.rotation.z = 0.08 + stride * 0.08 * runAmount;
        hero.userData.leftGauntlet.rotation.x = -stride * 0.34 * runAmount;
        hero.userData.rightGauntlet.rotation.x = stride * 0.3 * runAmount;
        hero.userData.leftBoot.rotation.x = -0.08 + Math.max(0, -stride) * 0.34 * runAmount;
        hero.userData.rightBoot.rotation.x = -0.08 + Math.max(0, stride) * 0.34 * runAmount;
        hero.userData.head.rotation.x = -0.02 + idleBreath * 1.6 - stepLift * 0.035 * runAmount;
        hero.userData.head.rotation.y = Math.sin(time * 1.25) * 0.035 + stride * 0.035 * runAmount;
        hero.userData.plume.rotation.x = 0.22 + counterStride * 0.08 * runAmount + capeWind * 0.05;
        hero.userData.plume.rotation.z = Math.sin(time * 2.8) * 0.08 + stride * 0.08 * runAmount;
        hero.userData.sword.rotation.set(0.12, 0, -1.34);
      }
      if (data.heroAnimation === 'cast') {
        const castWave = Math.sin(time * 8);
        const castPower = 0.55 + Math.max(0, castWave) * 0.45;
        hero.position.y += 0.05 + Math.max(0, castWave) * 0.08;
        hero.rotation.x = -0.08 + castWave * 0.025;
        hero.rotation.z = Math.sin(time * 5.2) * 0.035;
        if (downloadedHeroModel) {
          downloadedHeroModel.position.y = 0.08 + Math.max(0, castWave) * 0.08;
          downloadedHeroModel.rotation.x = -0.16 + castWave * 0.04;
          downloadedHeroModel.rotation.z = Math.sin(time * 5.8) * 0.06;
        }
        if (useFallbackHeroRig) {
          hero.userData.leftArm.rotation.x = -1.45 + castWave * 0.18;
          hero.userData.rightArm.rotation.x = -1.55 - castWave * 0.14;
          hero.userData.leftArm.rotation.z = -0.18 + Math.sin(time * 6) * 0.12;
          hero.userData.rightArm.rotation.z = 0.25 - Math.sin(time * 6) * 0.12;
          hero.userData.sword.rotation.set(-1.15 + castWave * 0.18, 0.18, -0.35 + Math.sin(time * 7) * 0.08);
        }
        heroEquippedWeapon.position.set(hero.position.x + Math.sin(renderFacing) * 0.42, hero.position.y + 1.88 + Math.max(0, castWave) * 0.12, hero.position.z + Math.cos(renderFacing) * 0.42);
        heroEquippedWeapon.rotation.set(-1.35 + castWave * 0.18, renderFacing, -0.22 + Math.sin(time * 7) * 0.1);
        heroEquippedWeapon.scale.multiplyScalar(1.12 + Math.max(0, castWave) * 0.12);
        slashTrail.visible = true;
        slashTrail.position.set(hero.position.x, hero.position.y + 1.55, hero.position.z);
        slashTrail.rotation.set(Math.PI / 2, 0, time * 4.6);
        slashTrail.scale.setScalar(0.7 + Math.max(0, castWave) * 0.55);
        (slashTrail.material as THREE.MeshBasicMaterial).opacity = 0.32 + Math.max(0, castWave) * 0.3;
        castAura.visible = true;
        castAura.position.set(hero.position.x, hero.position.y + 1.18, hero.position.z);
        castAura.rotation.y = renderFacing;
        castAura.children.forEach((part, index) => {
          const phase = typeof part.userData.phase === 'number' ? part.userData.phase : index;
          if (part instanceof THREE.Mesh && part.material instanceof THREE.MeshBasicMaterial) {
            part.material.opacity = (index < 3 ? 0.42 : 0.78) * castPower;
          }
          if (index < 3) {
            part.rotation.z = time * (2.8 + index * 0.8) + phase;
            part.scale.setScalar(1 + Math.sin(time * 5 + phase) * 0.08 + castPower * 0.28);
          } else {
            const orbit = time * (3.4 + index * 0.08) + phase;
            part.position.set(Math.cos(orbit) * (0.75 + index * 0.025), Math.sin(time * 4.5 + phase) * 0.22, Math.sin(orbit) * (0.75 + index * 0.025));
            part.rotation.set(time * 2 + phase, time * 3.2 + phase, time * 1.6);
            part.scale.setScalar(1 + castPower * 0.75);
          }
        });
      } else if (data.heroAnimation === 'strike' || attackSwing > 0) {
        castAura.visible = false;
        const attackPhase = THREE.MathUtils.clamp(1 - attackSwing, 0, 1);
        const windup = THREE.MathUtils.smoothstep(attackPhase, 0, isTwoHandedWeapon ? 0.34 : 0.24);
        const slash = Math.sin(THREE.MathUtils.clamp((attackPhase - (isTwoHandedWeapon ? 0.24 : 0.16)) / (isTwoHandedWeapon ? 0.32 : 0.34), 0, 1) * Math.PI);
        const impact = Math.sin(THREE.MathUtils.clamp((attackPhase - (isTwoHandedWeapon ? 0.38 : 0.28)) / 0.2, 0, 1) * Math.PI);
        const recover = THREE.MathUtils.smoothstep(attackPhase, isTwoHandedWeapon ? 0.6 : 0.5, 1);
        const lunge = Math.max(slash, impact * 0.8) * (1 - recover * 0.35);
        const heavy = isTwoHandedWeapon ? 1.45 : 1;
        hero.position.x += Math.sin(renderFacing) * (0.16 + lunge * 0.52 * heavy);
        hero.position.z += Math.cos(renderFacing) * (0.16 + lunge * 0.52 * heavy);
        hero.position.y += impact * (isTwoHandedWeapon ? 0.18 : 0.12);
        hero.rotation.x = -0.07 - lunge * (useFallbackHeroRig ? 0.24 : 0.12) * heavy + recover * 0.06;
        hero.rotation.z = -windup * (isTwoHandedWeapon ? 0.22 : 0.12) + impact * (isTwoHandedWeapon ? 0.28 : 0.18);
        if (downloadedHeroModel) {
          downloadedHeroModel.position.y = impact * (isTwoHandedWeapon ? 0.18 : 0.12);
          downloadedHeroModel.rotation.x = -windup * (isTwoHandedWeapon ? 0.42 : 0.28) - slash * (isTwoHandedWeapon ? 0.48 : 0.34) + recover * 0.16;
          downloadedHeroModel.rotation.z = -windup * (isTwoHandedWeapon ? 0.28 : 0.18) + impact * (isTwoHandedWeapon ? 0.42 : 0.3) - recover * 0.08;
        }
        slashTrail.visible = slash > 0.05 || impact > 0.05;
        (slashTrail.material as THREE.MeshBasicMaterial).opacity = Math.max(slash, impact) * 0.72;
        slashTrail.position.set(
          hero.position.x + Math.sin(renderFacing) * (0.88 + lunge * 0.35 * heavy),
          hero.position.y + 1.35 + impact * (isTwoHandedWeapon ? 0.34 : 0.22),
          hero.position.z + Math.cos(renderFacing) * (0.88 + lunge * 0.35 * heavy)
        );
        slashTrail.rotation.set(-0.18 - slash * (isTwoHandedWeapon ? 0.72 : 0.45), renderFacing + Math.PI * 0.5, -0.82 + windup * (isTwoHandedWeapon ? 0.88 : 0.55) - recover * 0.3);
        slashTrail.scale.setScalar((isTwoHandedWeapon ? 0.92 : 0.72) + slash * (isTwoHandedWeapon ? 0.85 : 0.55) + impact * (isTwoHandedWeapon ? 0.55 : 0.35));
        if (useFallbackHeroRig) {
          if (isTwoHandedWeapon) {
            hero.userData.rightArm.rotation.z = 0.94 + windup * 1.55 + slash * 0.45 - recover * 0.45;
            hero.userData.rightArm.rotation.x = -0.45 - windup * 1.85 - slash * 2.45 + recover * 1.15;
            hero.userData.leftArm.rotation.z = -0.08 + windup * 1.15 + slash * 0.62 - recover * 0.5;
            hero.userData.leftArm.rotation.x = -0.35 - windup * 1.55 - slash * 1.95 + recover * 1.0;
            hero.userData.leftShoulder.rotation.z = -0.22 + windup * 0.42;
            hero.userData.rightShoulder.rotation.z = 0.22 + windup * 0.42;
            hero.userData.sword.rotation.x = -0.08 - windup * 1.85 - slash * 2.6 + recover * 1.15;
            hero.userData.sword.rotation.y = -0.18 - impact * 0.42;
            hero.userData.sword.rotation.z = -1.58 - slash * 1.45 + recover * 0.72;
          } else {
            hero.userData.rightArm.rotation.z = 0.62 + windup * 1.45 + slash * 0.82 - recover * 0.35;
            hero.userData.rightArm.rotation.x = -0.2 - windup * 1.3 - slash * 2.05 + recover * 1.05;
            hero.userData.leftArm.rotation.x = -0.22 + slash * 0.35;
            hero.userData.leftArm.rotation.z = -0.56 - lunge * 0.48 + recover * 0.22;
            hero.userData.sword.rotation.x = 0.12 - windup * 1.35 - slash * 2.15 + recover * 1.1;
            hero.userData.sword.rotation.y = -impact * 0.28;
            hero.userData.sword.rotation.z = -1.34 - slash * 1.2 + recover * 0.62;
          }
        }
        heroEquippedWeapon.position.set(
          hero.position.x + 0.62 + impact * (isTwoHandedWeapon ? 0.34 : 0.22),
          hero.position.y + 1.46 + impact * (isTwoHandedWeapon ? 0.16 : 0.08) + windup * (isTwoHandedWeapon ? 0.22 : 0),
          hero.position.z + 0.28 - slash * (isTwoHandedWeapon ? 0.34 : 0.2)
        );
        heroEquippedWeapon.rotation.set(
          -0.52 - windup * (isTwoHandedWeapon ? 1.7 : 1.1) - slash * (isTwoHandedWeapon ? 2.35 : 1.85) + recover * 0.8,
          renderFacing - 0.32 - impact * (isTwoHandedWeapon ? 0.46 : 0.28),
          -0.82 - slash * (isTwoHandedWeapon ? 1.45 : 1.1) + recover * 0.48
        );
        heroEquippedWeapon.scale.multiplyScalar(1 + impact * (isTwoHandedWeapon ? 0.26 : 0.16));
      } else if (data.heroAnimation === 'step' || data.isHeroMoving) {
        if (useFallbackHeroRig) {
          hero.position.x += Math.sin(renderFacing) * stride * 0.11;
          hero.position.z += Math.cos(renderFacing) * stride * 0.11;
          hero.rotation.x -= stepLift * 0.035;
        }
      } else if (data.heroAnimation === 'heal') {
        castAura.visible = false;
        hero.scale.setScalar(1 + Math.sin(time * 10) * 0.045);
        hero.rotation.y += Math.sin(time * 8) * 0.035;
      } else {
        castAura.visible = false;
        hero.rotation.x = 0;
        hero.rotation.z = 0;
      }

      if (!(data.heroAnimation === 'strike' || data.heroAnimation === 'cast' || attackSwing > 0)) {
        heroEquippedWeapon.position.set(hero.position.x + 0.64 + Math.sin(walkCycle) * (data.isHeroMoving ? 0.045 : 0.012), hero.position.y + 1.44 + stepLift * 0.04 + idleBreath * 0.8, hero.position.z + 0.22 + Math.cos(time * 1.6) * 0.012);
        heroEquippedWeapon.rotation.set(-0.58 + Math.sin(walkCycle) * (data.isHeroMoving ? 0.1 : 0.03), renderFacing - 0.28 + Math.sin(time * 1.1) * 0.015, -0.78 + Math.sin(walkCycle * 0.7) * (data.isHeroMoving ? 0.08 : 0.03));
      }
      const weaponData = heroEquippedWeapon.userData as { aura: THREE.Mesh; magicRunes: THREE.Group };
      weaponData.aura.rotation.z = time * 2.4;
      (weaponData.aura.material as THREE.MeshBasicMaterial).opacity =
        (data.hasArcaneWeapon ? 0.48 : 0.24) + Math.sin(time * 5) * 0.08 + (data.heroAnimation === 'strike' ? 0.18 : 0);
      weaponData.magicRunes.children.forEach((rune, index) => {
        const phase = typeof rune.userData.phase === 'number' ? rune.userData.phase : index;
        rune.rotation.z = time * (2.2 + index * 0.18) + phase;
        rune.position.x = Math.sin(time * 2.5 + phase) * 0.05;
        rune.position.z = Math.cos(time * 2.1 + phase) * 0.05;
        rune.scale.setScalar(1 + Math.sin(time * 4 + phase) * 0.18);
        if (rune instanceof THREE.Mesh && rune.material instanceof THREE.MeshBasicMaterial) {
          rune.material.opacity = data.hasArcaneWeapon ? 0.72 + Math.sin(time * 5 + phase) * 0.16 : 0;
        }
      });

      if (!(data.heroAnimation === 'strike' || data.heroAnimation === 'cast' || attackSwing > 0)) {
        slashTrail.visible = false;
        (slashTrail.material as THREE.MeshBasicMaterial).opacity = 0;
      }
      footDust.visible = data.isHeroMoving && jumpHeight < 0.05;
      footDust.children.forEach((puff, index) => {
        const seed = puff.userData.seed as number;
        const phase = (time * 5.2 + seed) % 1;
        const side = index % 2 ? 0.28 : -0.28;
        const back = 0.18 + phase * 0.7;
        puff.position.set(
          hero.position.x - Math.sin(renderFacing) * back + Math.cos(renderFacing) * side,
          0.04 + phase * 0.12,
          hero.position.z - Math.cos(renderFacing) * back - Math.sin(renderFacing) * side
        );
        puff.scale.setScalar(0.45 + phase * 1.5);
      });
      footDustMaterial.opacity = data.isHeroMoving ? 0.18 + stepLift * 0.18 : 0;
      arcaneBolts.children.forEach((bolt) => {
        const life = (bolt.userData.life as number) || 0;
        if (life <= 0) return;
        const duration = (bolt.userData.duration as number) || 0.8;
        const facing = (bolt.userData.facing as number) || renderFacing;
        const speed = (bolt.userData.speed as number) || 8;
        const lane = (bolt.userData.lane as number) || 0;
        const kind = (bolt.userData.kind as number) || 0;
        const nextLife = life + delta;
        const progress = Math.min(1, nextLife / duration);
        bolt.userData.life = progress >= 1 ? 0 : nextLife;
        bolt.position.x += Math.sin(facing) * speed * delta;
        bolt.position.z += Math.cos(facing) * speed * delta;
        bolt.position.y += Math.sin(progress * Math.PI * 2 + lane) * delta * 1.4;
        bolt.rotation.x += delta * (4.8 + kind * 0.08);
        bolt.rotation.y += delta * (6.2 + lane * 0.18);
        bolt.rotation.z += delta * (7.6 + kind * 0.12);
        bolt.scale.setScalar(1 + Math.sin(progress * Math.PI) * (kind >= 15 ? 2.2 : 1.6));
        const core = bolt.userData.core as THREE.Mesh | undefined;
        const trail = bolt.userData.trail as THREE.Mesh | undefined;
        bolt.lookAt(
          bolt.position.x + Math.sin(facing),
          bolt.position.y,
          bolt.position.z + Math.cos(facing)
        );
        if (core?.material instanceof THREE.MeshBasicMaterial) {
          core.material.opacity = (1 - progress) * 0.95;
          core.material.color.set(elementalColors[(kind + lane) % elementalColors.length]);
        }
        if (trail?.material instanceof THREE.MeshBasicMaterial) {
          trail.material.opacity = (1 - progress) * 0.52;
          trail.material.color.set(elementalColors[(kind + lane + 1) % elementalColors.length]);
          trail.scale.set(1 + Math.sin(time * 12 + lane) * 0.18, 1 + progress * 1.8, 1);
        }
        bolt.visible = progress < 1;
      });
      const burstLife = (arcaneBurstRing.userData.life as number) || 0;
      if (burstLife > 0) {
        const nextBurstLife = burstLife + delta;
        const progress = Math.min(1, nextBurstLife / 0.95);
        arcaneBurstRing.userData.life = progress >= 1 ? 0 : nextBurstLife;
        arcaneBurstRing.visible = progress < 1;
        arcaneBurstRing.rotation.z = time * 3.2;
        arcaneBurstRing.scale.setScalar(0.4 + progress * (data.arcaneSpellKind < 6 ? 7.0 : 4.2));
        (arcaneBurstRing.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.82;
        arcaneBurstLight.intensity = (1 - progress) * 6.5;
      } else {
        arcaneBurstRing.visible = false;
        arcaneBurstLight.intensity = 0;
      }
      let activeElementalLight = false;
      elementalMeshes.forEach((fx) => {
        const life = (fx.userData.life as number) || 0;
        if (life <= 0) return;
        const kind = (fx.userData.kind as number) || 0;
        const facing = (fx.userData.facing as number) || renderFacing;
        const boosted = Boolean(fx.userData.boosted);
        const duration = kind === 6 ? 1.15 : boosted ? 1.05 : 0.86;
        const nextLife = life + delta;
        const progress = Math.min(1, nextLife / duration);
        fx.userData.life = progress >= 1 ? 0 : nextLife;
        fx.visible = progress < 1;
        const opacity = ((fx.userData.baseOpacity as number) || 0.7) * (1 - progress);
        if (fx.material instanceof THREE.MeshBasicMaterial) fx.material.opacity = opacity;
        const distance = (boosted ? 8.5 : 6.2) * progress;
        fx.position.x += Math.sin(facing) * delta * (boosted ? 8.6 : 6.4);
        fx.position.z += Math.cos(facing) * delta * (boosted ? 8.6 : 6.4);
        if (kind === 0) {
          fx.rotation.set(Math.PI / 2, 0, facing + Math.PI / 2);
          fx.scale.set(1.1 + progress * 4.8, 0.8 + progress * 1.3, 1.1 + progress * 4.8);
          fx.position.y = 0.12 + Math.sin(progress * Math.PI) * 0.25;
        } else if (kind === 1) {
          fx.rotation.set(0.18, facing, 0);
          fx.scale.set(1.2 + progress * 2.2, 0.75 + progress * 2.4, 0.52 + progress);
          fx.position.y = 0.58 + Math.sin(progress * Math.PI) * 1.1;
        } else if (kind === 2) {
          fx.rotation.set(Math.PI / 2 + progress * 2.8, 0, facing);
          fx.scale.setScalar(0.9 + progress * (boosted ? 4.4 : 2.8));
          fx.position.y = 1.15 + Math.sin(time * 12) * 0.22;
        } else if (kind === 3) {
          fx.rotation.y = time * 5.4;
          fx.scale.setScalar((boosted ? 1.25 : 0.9) + Math.sin(progress * Math.PI) * 1.1);
          fx.position.y = 1.35 + Math.sin(progress * Math.PI) * 0.52;
        } else if (kind === 4) {
          fx.rotation.set(-0.55, facing + Math.PI / 2, -0.9 + progress * 1.8);
          fx.scale.set(1.1 + progress * 2.8, 0.8 + progress * 0.5, 1.1 + progress * 2.8);
          fx.position.y = 1.1 + Math.sin(progress * Math.PI) * 0.38;
        } else if (kind === 5) {
          fx.rotation.set(-0.28, facing + Math.PI / 2, 0.8 - progress * 1.5);
          fx.scale.set(1.2 + progress * 3.5, 0.72 + progress * 0.6, 1.2 + progress * 3.5);
          fx.position.y = 1.42 + Math.sin(progress * Math.PI) * 0.55;
        } else {
          fx.position.x = hero.position.x + Math.sin(facing) * (2.4 + distance * 0.35);
          fx.position.z = hero.position.z + Math.cos(facing) * (2.4 + distance * 0.35);
          fx.position.y = 3.8 - progress * 2.1;
          fx.rotation.set(0, 0, 0);
          fx.scale.set(1.0 + progress * 1.4, 1.0, 1.0 + progress * 1.4);
        }
        elementalLight.position.copy(fx.position);
        elementalLight.intensity = (1 - progress) * (boosted ? 7.5 : 4.8);
        activeElementalLight = true;
      });
      if (!activeElementalLight && arcaneBurstLight.intensity === 0) elementalLight.intensity = 0;

      updateHeroArtifactStyle(heroArtifact, data.equippedArtifactIcon);
      if (heroArtifact.visible) {
        const orbit = time * 2.15;
        const side = 0.86 + Math.sin(time * 1.3) * 0.1;
        heroArtifact.position.set(
          hero.position.x + Math.cos(renderFacing) * side + Math.sin(orbit) * 0.26,
          hero.position.y + 1.68 + Math.sin(time * 3.1) * 0.16 + (data.heroAnimation === 'heal' ? 0.18 : 0),
          hero.position.z - Math.sin(renderFacing) * side + Math.cos(orbit) * 0.26
        );
        heroArtifact.rotation.y = time * 3.1;
        heroArtifact.rotation.x = Math.sin(time * 2.2) * 0.32;
        heroArtifact.rotation.z = Math.sin(time * 1.7) * 0.18;
        heroArtifact.scale.setScalar(1.16 + Math.sin(time * 4) * 0.1 + (data.heroAnimation === 'heal' ? 0.18 : 0));
        const artifactData = heroArtifact.userData as {
          halo: THREE.Mesh;
          trail: THREE.Mesh;
          shards: THREE.Group;
          light: THREE.PointLight;
        };
        artifactData.halo.rotation.z = time * 2.7;
        artifactData.trail.rotation.z = -time * 1.9;
        (artifactData.trail.material as THREE.MeshBasicMaterial).opacity = 0.42 + Math.sin(time * 5) * 0.12;
        artifactData.light.intensity = 1.9 + Math.sin(time * 4.6) * 0.55 + (data.heroAnimation === 'heal' ? 1.2 : 0);
        artifactData.shards.children.forEach((shard, index) => {
          const phase = typeof shard.userData.phase === 'number' ? shard.userData.phase : index;
          const shardOrbit = time * (2.7 + index * 0.12) + phase;
          shard.position.set(Math.cos(shardOrbit) * 0.46, Math.sin(time * 3 + phase) * 0.18, Math.sin(shardOrbit) * 0.46);
          shard.rotation.set(time * 2.2 + phase, time * 3.4 + phase, time * 1.6);
          shard.scale.setScalar(1 + Math.sin(time * 5 + phase) * 0.18);
        });
      }

      const visibleCount = Math.ceil((data.monstersLeft / 100) * monsters.children.length);
      monsters.children.forEach((monster, index) => {
        const current = monster as THREE.Group;
        const alive = index < visibleCount;
        current.visible = current.scale.x > 0.03 || alive;
        if (!current.visible) return;
        const baseScale = 0.86 + (index % 4) * 0.09;
        const targetScale = alive ? baseScale : 0;
        const nextScale = THREE.MathUtils.lerp(current.scale.x, targetScale, Math.min(1, delta * 7));
        current.scale.setScalar(nextScale);
        if (!alive) {
          current.position.y = Math.max(-0.4, current.position.y - delta * 1.6);
          return;
        }

        if (index === 0 && data.nearestMonster.alive) {
          const monsterWorldX = -3.4 + data.nearestMonster.x / 1000;
          const monsterWorldZ = 1.2 + data.nearestMonster.z / 1000;
          current.position.x = THREE.MathUtils.lerp(current.position.x, monsterWorldX, 1 - Math.exp(-delta * 10));
          current.position.z = THREE.MathUtils.lerp(current.position.z, monsterWorldZ, 1 - Math.exp(-delta * 10));
        }

        const toHeroX = hero.position.x - current.position.x;
        const toHeroZ = hero.position.z - current.position.z;
        const distance = Math.max(0.001, Math.hypot(toHeroX, toHeroZ));
        const wantsToKillHero = distance <= monsterAggroRangeMeters;
        const isPressuringHero = distance <= monsterPressureRangeMeters;
        const attackRange = monsterHitRangeMeters;
        current.userData.attackCooldown = Math.max(0, (current.userData.attackCooldown as number) - delta);
        const botAngle = (current.userData.botAngle as number) + Math.sin(time * 0.5 + index) * 0.35;
        const botOrbit = current.userData.botOrbit as number;
        const homeX = typeof current.userData.homeX === 'number' ? current.userData.homeX : current.position.x;
        const homeZ = typeof current.userData.homeZ === 'number' ? current.userData.homeZ : current.position.z;
        const targetRadius = distance > attackRange ? Math.max(0.2, attackRange - 0.85 + botOrbit * 0.18) : Math.max(2.8, attackRange - 0.45 + botOrbit * 0.12);
        const targetX = wantsToKillHero
          ? hero.position.x - (toHeroX / distance) * targetRadius + Math.cos(botAngle) * botOrbit
          : homeX + Math.cos(time * 0.35 + index) * (1.8 + botOrbit);
        const targetZ = wantsToKillHero
          ? hero.position.z - (toHeroZ / distance) * targetRadius + Math.sin(botAngle) * botOrbit
          : homeZ + Math.sin(time * 0.32 + index) * (1.8 + botOrbit);
        const moveX = targetX - current.position.x;
        const moveZ = targetZ - current.position.z;
        const moveDistance = Math.max(0.001, Math.hypot(moveX, moveZ));
        const speed = (current.userData.speed as number) * (wantsToKillHero && distance > monsterPressureRangeMeters ? 1.35 : isPressuringHero && distance > attackRange ? 1.55 : wantsToKillHero ? 0.82 : 0.45);

        if (!wantsToKillHero) {
          const stepDistance = Math.min(moveDistance, speed * delta * 0.58);
          current.position.x += (moveX / moveDistance) * stepDistance;
          current.position.z += (moveZ / moveDistance) * stepDistance;
          current.userData.attackFlash = Math.max(0, (current.userData.attackFlash as number) - delta * 1.8);
          current.userData.attackCycle = 0;
          current.userData.botState = 'patrol';
        } else if (distance > attackRange) {
          const stepDistance = Math.min(Math.max(0, distance - attackRange), speed * delta);
          current.position.x += (moveX / moveDistance) * stepDistance + shake * (index % 2 ? 0.012 : -0.012);
          current.position.z += (moveZ / moveDistance) * stepDistance;
          current.userData.attackFlash = Math.max(0, (current.userData.attackFlash as number) - delta * 1.8);
          current.userData.attackCycle = Math.max(0, (current.userData.attackCycle as number) - delta * 0.8);
          current.userData.botState = 'kill';
        } else {
          current.userData.attackCycle = ((current.userData.attackCycle as number) + delta * 1.55) % 1;
          current.userData.attackFlash = Math.min(1, (current.userData.attackFlash as number) + delta * 5);
          current.position.x -= (toHeroX / distance) * 0.018 * Math.sin(time * 14 + index);
          current.position.z -= (toHeroZ / distance) * 0.018 * Math.sin(time * 14 + index);
          current.userData.botState = 'kill';
          if ((current.userData.attackCooldown as number) === 0 && (current.userData.attackCycle as number) > 0.58) {
            current.userData.attackCooldown = 1.05 + (index % 4) * 0.12;
            current.userData.botState = 'kill';
          }
        }

        const walk = time * (distance > attackRange ? (isPressuringHero ? 10.8 : 8.4) : 5.4) + index;
        const attack = current.userData.attackFlash as number;
        const chaseIntensity = wantsToKillHero ? THREE.MathUtils.clamp(1 - distance / monsterAggroRangeMeters, 0.08, 1) : 0;
        const pressureIntensity = isPressuringHero ? THREE.MathUtils.clamp(1 - distance / monsterPressureRangeMeters, 0.18, 1) : 0;
        const breathing = Math.sin(time * (1.35 + (index % 5) * 0.08) + index) * (wantsToKillHero ? 0.014 : 0.03);
        const footPlant = Math.abs(Math.sin(walk));
        const stalkLean = wantsToKillHero ? 0.04 + chaseIntensity * 0.14 : 0;
        const monsterBaseY = typeof current.userData.baseY === 'number' ? current.userData.baseY : 0.08;
        current.position.y = monsterBaseY + Math.max(0, Math.sin(walk * 2) * 0.08) + (attack > 0.4 ? Math.sin(time * 22 + index) * 0.06 : 0);
        current.position.y += footPlant * (wantsToKillHero ? 0.018 : 0.008);
        const faceHero = Math.atan2(toHeroX, toHeroZ) + Math.PI;
        current.rotation.y = smoothAngle(current.rotation.y, faceHero, delta, distance > attackRange ? 4.8 : 3.6);
        current.rotation.y += Math.sin(walk) * (distance > attackRange ? 0.035 : 0.06);
        const attackCycle = current.userData.attackCycle as number;
        const monsterWindup = THREE.MathUtils.smoothstep(attackCycle, 0.05, 0.34);
        const monsterHit = Math.sin(THREE.MathUtils.clamp((attackCycle - 0.28) / 0.36, 0, 1) * Math.PI);
        const monsterRecover = THREE.MathUtils.smoothstep(attackCycle, 0.62, 0.98);
        const monsterSwing = attack * Math.max(monsterHit, monsterWindup * (1 - monsterRecover));
        const hitReact = Math.max(0, (current.userData.hitReact as number) || 0);
        current.userData.hitReact = Math.max(0, hitReact - delta * 1.9);
        current.position.y += Math.sin(hitReact * Math.PI) * 0.42;
        current.rotation.x -= hitReact * 0.34;
        current.rotation.z += (index % 2 ? 1 : -1) * hitReact * 0.28;
        const loadedMonsterModel = current.userData.loadedGoblinModel as THREE.Object3D | undefined;
        const loadedMonsterBaseRotationY = typeof current.userData.loadedGoblinBaseRotationY === 'number' ? current.userData.loadedGoblinBaseRotationY : Math.PI;
        const chaseWalkPower = distance > attackRange ? 1 : 0.45;
        if (loadedMonsterModel) {
          const loadedStep = Math.sin(walk * 1.28);
          const loadedLift = Math.abs(loadedStep) * chaseWalkPower;
          loadedMonsterModel.position.y = loadedLift * 0.085 + monsterHit * attack * 0.12 + Math.sin(hitReact * Math.PI) * 0.22;
          loadedMonsterModel.rotation.x = -0.08 - monsterSwing * 0.34 + loadedLift * 0.08 - hitReact * 0.55;
          loadedMonsterModel.rotation.y = loadedMonsterBaseRotationY + Math.sin(walk * 0.6 + index) * 0.11;
          loadedMonsterModel.rotation.z = loadedStep * 0.1 + monsterHit * attack * 0.22 + (index % 2 ? 1 : -1) * hitReact * 0.42;
          loadedMonsterModel.scale.setScalar(1 + loadedLift * 0.045 + monsterWindup * attack * 0.05 + pressureIntensity * 0.025 + hitReact * 0.06);
        }
        const attackTrail = current.userData.attackTrail as THREE.Mesh | undefined;
        if (attackTrail) {
          const trailMaterial = attackTrail.material as THREE.MeshBasicMaterial;
          const trailPower = attack * Math.max(monsterHit, monsterWindup * 0.6);
          attackTrail.visible = trailPower > 0.04;
          trailMaterial.opacity = trailPower * 0.78;
          attackTrail.position.set(Math.sin(walk + index) * 0.12, 1.08 + monsterHit * 0.18, -0.62 - monsterHit * 0.28);
          attackTrail.rotation.set(-0.5 - monsterHit * 0.75, monsterWindup * 0.5, 0.9 - monsterRecover * 0.7);
          attackTrail.scale.setScalar(0.72 + trailPower * 0.82);
        }
        if (current.userData.isGoblin) {
          const skitter = Math.sin(walk * 1.45);
          const stab = monsterHit * attack;
          current.rotation.x = -0.12 - pressureIntensity * 0.16 - monsterSwing * 0.28 + Math.abs(skitter) * 0.035;
          current.rotation.z = Math.sin(walk * 0.7) * (0.11 + chaseIntensity * 0.04);
          current.position.y += Math.abs(skitter) * 0.045;
          current.userData.armL.rotation.x = 0.25 + skitter * (0.38 + chaseIntensity * 0.14) - monsterSwing * 0.65;
          current.userData.armL.rotation.z = -1.08 - monsterWindup * 0.3 + Math.sin(walk + 0.6) * 0.18;
          current.userData.armR.rotation.x = -0.45 - skitter * 0.42 - monsterWindup * 1.65 - stab * 2.1 + monsterRecover * 1.2;
          current.userData.armR.rotation.z = 1.15 + monsterWindup * 0.85 + stab * 0.55 + Math.sin(walk + 1.2) * 0.16;
          current.userData.legL.rotation.x = skitter * (0.78 + chaseIntensity * 0.18);
          current.userData.legR.rotation.x = -skitter * (0.78 + chaseIntensity * 0.18);
          current.userData.footL.rotation.x = -0.12 - skitter * 0.32;
          current.userData.footR.rotation.x = -0.12 + skitter * 0.32;
          current.userData.head.rotation.x = -0.1 - pressureIntensity * 0.08 + monsterSwing * 0.35 + Math.sin(walk * 0.7) * 0.1;
          current.userData.head.rotation.z = Math.sin(walk * 0.55) * 0.09;
          current.userData.jaw.rotation.x = attack ? 0.18 + pressureIntensity * 0.08 + stab * 0.32 : Math.max(0, Math.sin(walk * 0.8)) * (0.08 + pressureIntensity * 0.08);
          current.userData.earL.rotation.y = -0.34 + Math.sin(walk * 0.9) * (0.12 + pressureIntensity * 0.07);
          current.userData.earR.rotation.y = 0.34 - Math.sin(walk * 0.9) * (0.12 + pressureIntensity * 0.07);
          current.userData.knife.rotation.z = -0.18 - monsterWindup * 0.75 - stab * 1.05 + monsterRecover * 0.85;
          current.userData.knife.position.z = 0.02 + stab * 0.18;
          current.userData.goblinClub.rotation.z = -monsterWindup * 0.65 - stab * 1.15 + monsterRecover * 0.75 + Math.sin(walk) * 0.12;
        } else if (current.userData.isSpider) {
          const spiderStep = Math.sin(walk * 1.65);
          current.rotation.x = -0.22 - pressureIntensity * 0.12 - monsterSwing * 0.18 + Math.abs(spiderStep) * 0.04;
          current.rotation.z = Math.sin(walk * 0.8) * (0.08 + chaseIntensity * 0.03);
          current.position.y -= pressureIntensity * 0.035;
          current.userData.spiderLegs.children.forEach((leg: THREE.Object3D, legIndex: number) => {
            const side = legIndex < 4 ? -1 : 1;
            const phase = Math.sin(walk * 1.8 + legIndex * 0.7);
            leg.rotation.z = side * (1.02 + (legIndex % 4) * 0.12 + phase * (0.32 + chaseIntensity * 0.12));
            leg.rotation.x = 0.18 - (legIndex % 4) * 0.06 + Math.cos(walk * 1.5 + legIndex) * (0.16 + chaseIntensity * 0.08) - monsterSwing * 0.22;
          });
          current.userData.spiderFace.rotation.x = monsterSwing * 0.26 + Math.sin(walk) * 0.05;
          current.userData.spiderAbdomen.scale.y = 0.72 + Math.abs(spiderStep) * 0.18 + attack * 0.12 + breathing;
          current.userData.jaw.rotation.x = attack ? 0.1 + monsterHit * 0.38 : Math.max(0, Math.sin(walk)) * 0.08;
        } else if (current.userData.isStone || current.userData.isGiant) {
          const heavyStep = Math.sin(walk * 0.75);
          current.position.y += Math.max(0, Math.abs(heavyStep) - 0.55) * 0.12;
          current.rotation.x = -pressureIntensity * 0.1 - monsterSwing * 0.28 + Math.abs(heavyStep) * 0.025;
          current.rotation.z = heavyStep * (0.045 + chaseIntensity * 0.02);
          current.userData.armL.rotation.x = heavyStep * (0.26 + chaseIntensity * 0.08) - monsterSwing * 1.25;
          current.userData.armR.rotation.x = -heavyStep * 0.26 - monsterWindup * 1.1 - monsterHit * 1.95 + monsterRecover * 0.8;
          current.userData.legL.rotation.x = heavyStep * 0.28;
          current.userData.legR.rotation.x = -heavyStep * 0.28;
          current.userData.rockNubs.rotation.y = Math.sin(walk * 0.5) * 0.12;
          current.userData.giantDetails.rotation.x = monsterSwing * 0.12;
        } else if (current.userData.isWire) {
          const pulseWire = 1 + Math.sin(walk * 2.1) * 0.05 + attack * 0.08;
          current.rotation.x = -monsterSwing * 0.16;
          current.rotation.z = Math.sin(walk * 1.2) * 0.12;
          current.userData.wireFrame.scale.set(0.72 + pulseWire * 0.05, 1.85 + pulseWire * 0.12, 0.72 + pulseWire * 0.05);
          current.userData.wireFrame.rotation.y = time * 1.4 + index;
          current.userData.wireGlow.intensity = 1.2 + attack * 2 + Math.sin(time * 9 + index) * 0.35;
          current.userData.armL.rotation.x = Math.sin(walk) * 0.42 - monsterSwing * 0.8;
          current.userData.armR.rotation.x = -Math.sin(walk) * 0.42 - monsterHit * 1.4;
          current.userData.legL.rotation.x = Math.sin(walk) * 0.5;
          current.userData.legR.rotation.x = -Math.sin(walk) * 0.5;
        } else if (current.userData.isLizardBrute || current.userData.isCrawler) {
          const crawl = Math.sin(walk * 1.25);
          current.rotation.x = -0.08 - monsterSwing * 0.2 + Math.abs(crawl) * 0.05;
          current.rotation.z = crawl * 0.08;
          current.userData.armL.rotation.x = crawl * 0.44 - monsterSwing * 0.95;
          current.userData.armR.rotation.x = -crawl * 0.44 - monsterWindup * 1.05 - monsterHit * 1.7;
          current.userData.legL.rotation.x = crawl * 0.72;
          current.userData.legR.rotation.x = -crawl * 0.72;
          current.userData.head.rotation.y = Math.sin(walk * 0.7) * 0.12;
          current.userData.lizardTail.rotation.y = Math.sin(walk * 0.85 + index) * 0.36 + monsterSwing * 0.12;
          current.userData.lizardTail.rotation.z = Math.sin(walk * 0.55 + index) * 0.16;
          current.userData.backSpikes.rotation.x = Math.sin(walk * 0.6 + index) * 0.08;
        } else if (current.userData.isSawWarrior) {
          const sawStep = Math.sin(walk * 1.15);
          current.rotation.x = -monsterSwing * 0.16;
          current.rotation.z = sawStep * 0.06 + monsterHit * attack * 0.12;
          current.userData.saw.rotation.z = -monsterWindup * 0.8 - monsterHit * 1.5 + monsterRecover * 0.9 + time * (attack ? 3.4 : 1.1);
          current.userData.armR.rotation.x = -sawStep * 0.42 - monsterWindup * 1.4 - monsterHit * 1.8 + monsterRecover * 0.8;
          current.userData.armL.rotation.x = sawStep * 0.36 - monsterSwing * 0.55;
          current.userData.legL.rotation.x = sawStep * 0.52;
          current.userData.legR.rotation.x = -sawStep * 0.52;
          current.userData.armor.rotation.z = Math.sin(walk * 0.8) * 0.035;
        } else if (current.userData.isPale) {
          const sway = Math.sin(walk * 0.95);
          current.rotation.x = -0.05 - monsterSwing * 0.12;
          current.rotation.z = sway * 0.11;
          current.userData.paleDetails.scale.y = 1 + Math.abs(sway) * 0.08 + attack * 0.06;
          current.userData.jaw.rotation.x = 0.05 + Math.max(0, Math.sin(walk * 1.2)) * 0.18 + monsterHit * attack * 0.22;
          current.userData.armL.rotation.x = sway * 0.3 - monsterSwing * 0.7;
          current.userData.armR.rotation.x = -sway * 0.3 - monsterHit * 1.4;
          current.userData.legL.rotation.x = sway * 0.38;
          current.userData.legR.rotation.x = -sway * 0.38;
        } else if (current.userData.isOrc) {
          const stomp = Math.sin(walk);
          current.rotation.x = -monsterSwing * 0.2;
          current.rotation.z = stomp * 0.045;
          current.userData.orcAxe.rotation.z = monsterWindup * 0.9 + monsterHit * 1.25 - monsterRecover * 0.75;
          current.userData.armL.rotation.x = stomp * 0.38 - monsterSwing * 0.75;
          current.userData.armR.rotation.x = -stomp * 0.38 - monsterWindup * 1.45 - monsterHit * 1.9 + monsterRecover * 0.85;
          current.userData.legL.rotation.x = stomp * 0.48;
          current.userData.legR.rotation.x = -stomp * 0.48;
          current.userData.armor.rotation.x = Math.abs(stomp) * 0.025;
        } else {
          current.rotation.x = -monsterSwing * 0.18;
          current.rotation.z = 0;
          current.userData.armL.rotation.x = Math.sin(walk) * 0.48 - monsterSwing * 1.1;
          current.userData.armR.rotation.x = -Math.sin(walk) * 0.48 - monsterWindup * 1.2 - monsterHit * 1.7 + monsterRecover * 0.9;
          current.userData.armR.rotation.z = 0.85 + Math.sin(walk + 1.2) * 0.2 + monsterSwing * 1.25;
          current.userData.legL.rotation.x = Math.sin(walk) * 0.55;
          current.userData.legR.rotation.x = -Math.sin(walk) * 0.55;
          current.userData.footL.rotation.x = -Math.sin(walk) * 0.25;
          current.userData.footR.rotation.x = Math.sin(walk) * 0.25;
          current.userData.head.rotation.x = monsterSwing * 0.22 + Math.sin(walk * 0.6) * 0.04;
          current.userData.club.rotation.z = attack ? -0.35 - monsterWindup * 0.9 - monsterHit * 1.1 + monsterRecover * 0.8 : Math.sin(walk) * 0.18;
        }
        if (current.userData.lizardTail instanceof THREE.Group) {
          current.userData.lizardTail.rotation.y = Math.sin(walk * 0.6 + index) * 0.22;
          current.userData.lizardTail.rotation.z = Math.sin(walk * 0.4 + index) * 0.08;
        }
        if (current.userData.backSpikes instanceof THREE.Group) {
          current.userData.backSpikes.rotation.x = Math.sin(walk * 0.35 + index) * 0.06;
        }
        const aliveScale = current.scale.x;
        if (aliveScale > 0.03) {
          current.scale.set(
            aliveScale * (1 + pressureIntensity * 0.018),
            aliveScale * (1 + breathing + pressureIntensity * 0.028 + monsterWindup * attack * 0.018),
            aliveScale * (1 - pressureIntensity * 0.01)
          );
          current.rotation.x -= stalkLean * (distance > attackRange ? 0.65 : 0.25);
          current.rotation.z += Math.sin(walk * 0.45 + index) * (wantsToKillHero ? 0.028 : 0.012);
        }
      });

      const bossSceneKey = data.sceneKey.toLowerCase();
      const specialBossKey =
        data.isFinalReveal || data.monstersLeft > 0
          ? ''
          : bossSceneKey.includes('death')
            ? 'death'
            : bossSceneKey.includes('admin')
              ? 'admin'
              : bossSceneKey.includes('ais')
                ? 'ais'
                : bossSceneKey.includes('arailm')
                  ? 'arailm'
                  : bossSceneKey.includes('mansur')
                    ? 'mansur'
                    : bossSceneKey.includes('anuar')
                      ? 'anuar'
                      : bossSceneKey.includes('fury')
                        ? 'fury'
                        : bossSceneKey.includes('goblin')
                          ? 'goblin'
                          : bossSceneKey.includes('spirit')
                            ? 'spirit'
                            : bossSceneKey.includes('bbi')
                              ? 'bbi'
                              : bossSceneKey.includes('nurali')
                                ? 'nurali'
                                : '';
      const activeSpecialBoss = specialBossKey ? specialBossModels[specialBossKey] : null;
      specialBosses.children.forEach((boss) => {
        boss.visible = boss === activeSpecialBoss;
      });
      dragon.visible = !data.isFinalReveal && data.monstersLeft <= 0 && !activeSpecialBoss;
      nightKingBoss.visible = false;
      if (activeSpecialBoss) {
        const bossTargetAngle = Math.atan2(heroWorldX - activeSpecialBoss.position.x, heroWorldZ - activeSpecialBoss.position.z);
        activeSpecialBoss.rotation.y = smoothAngle(activeSpecialBoss.rotation.y, bossTargetAngle, delta, 1.9);
        const bossPhase = typeof activeSpecialBoss.userData.phase === 'number' ? activeSpecialBoss.userData.phase : 0;
        const bossAttackPulse = Math.max(pulse * 2.2, Math.max(0, Math.sin(time * (specialBossKey === 'fury' || specialBossKey === 'admin' ? 3.8 : 2.6) + bossPhase)));
        const bossFloat = Math.sin(time * (specialBossKey === 'fury' || specialBossKey === 'admin' ? 2.4 : 1.25) + bossPhase);
        activeSpecialBoss.position.set(
          3.6 + shake * 0.82 + Math.sin(time * 0.9 + bossPhase) * 0.12,
          bossFloat * (specialBossKey === 'ais' || specialBossKey === 'spirit' ? 0.24 : 0.1) + bossAttackPulse * 0.08,
          -2.2 + Math.sin(time * 0.7 + bossPhase) * 0.28
        );
        activeSpecialBoss.rotation.x = -bossAttackPulse * (specialBossKey === 'death' || specialBossKey === 'admin' ? 0.16 : 0.08) + Math.sin(time * 1.1 + bossPhase) * 0.025;
        activeSpecialBoss.rotation.z = Math.sin(time * 1.35 + bossPhase) * (specialBossKey === 'fury' ? 0.08 : 0.035) + bossAttackPulse * 0.045;
        const attackGlow = Math.max(0, Math.sin(time * (specialBossKey === 'admin' ? 9 : 5.8) + bossPhase));
        const bossBaseScale = typeof activeSpecialBoss.userData.baseScale === 'number' ? activeSpecialBoss.userData.baseScale : activeSpecialBoss.scale.x;
        activeSpecialBoss.scale.set(
          bossBaseScale * (1 + attackGlow * (specialBossKey === 'death' || specialBossKey === 'admin' ? 0.055 : 0.035)),
          bossBaseScale * (1 + Math.sin(time * 1.7 + bossPhase) * 0.025 + bossAttackPulse * 0.05),
          bossBaseScale * (1 + attackGlow * 0.025)
        );
        activeSpecialBoss.children.forEach((part, partIndex) => {
          if (part instanceof THREE.Mesh || part instanceof THREE.Group) {
            part.rotation.x += Math.sin(time * (1.8 + partIndex * 0.08) + bossPhase) * delta * 0.08;
            part.rotation.z += Math.cos(time * (1.4 + partIndex * 0.07) + bossPhase) * delta * 0.06;
          }
        });
        const bossTint = typeof activeSpecialBoss.userData.tint === 'string' ? activeSpecialBoss.userData.tint : '#ff2a1f';
        (specialBossAura.material as THREE.MeshBasicMaterial).color.set(bossTint);
        specialBossAura.visible = true;
        specialBossAura.position.set(activeSpecialBoss.position.x, 0.05, activeSpecialBoss.position.z);
        specialBossAura.rotation.z = time * (specialBossKey === 'admin' ? 2.6 : 1.4);
        specialBossAura.scale.setScalar(1 + bossAttackPulse * 0.38 + Math.sin(time * 3 + bossPhase) * 0.08);
        (specialBossAura.material as THREE.MeshBasicMaterial).opacity = 0.28 + bossAttackPulse * 0.38;
        (specialBossBlast.material as THREE.MeshBasicMaterial).color.set(bossTint);
        specialBossBlast.visible = bossAttackPulse > 0.42;
        specialBossBlast.position.set(
          activeSpecialBoss.position.x - Math.sin(activeSpecialBoss.rotation.y) * (2.0 + bossAttackPulse),
          1.85 + bossAttackPulse * 0.65,
          activeSpecialBoss.position.z - Math.cos(activeSpecialBoss.rotation.y) * (2.0 + bossAttackPulse)
        );
        specialBossBlast.rotation.set(Math.PI / 2, activeSpecialBoss.rotation.y, 0);
        specialBossBlast.scale.set(0.8 + bossAttackPulse * 1.15, 0.72 + bossAttackPulse * 0.85, 0.8 + bossAttackPulse * 1.15);
        (specialBossBlast.material as THREE.MeshBasicMaterial).opacity = Math.min(0.8, bossAttackPulse * 0.7);
      } else if (nightKingBoss.visible) {
        specialBossAura.visible = false;
        specialBossBlast.visible = false;
        const bossTargetAngle = Math.atan2(heroWorldX - nightKingBoss.position.x, heroWorldZ - nightKingBoss.position.z);
        nightKingBoss.rotation.y = smoothAngle(nightKingBoss.rotation.y, bossTargetAngle, delta, 2.0);
        nightKingBoss.position.y = Math.sin(time * 1.2) * 0.08;
        nightKingBoss.position.x = shake * 0.85;
        const bossHead = nightKingFallback.userData.head;
        if (bossHead instanceof THREE.Object3D) {
          bossHead.rotation.x = -0.08 + Math.sin(time * 1.8) * 0.025;
          bossHead.rotation.y = Math.sin(time * 1.4) * 0.045;
        }
      } else {
        specialBossAura.visible = false;
        specialBossBlast.visible = false;
      }
      const dragonData = dragon.userData as {
        bodyMat: THREE.MeshStandardMaterial;
        body: THREE.Mesh;
        head: THREE.Mesh;
        neck: THREE.Mesh;
        wingL: THREE.Group;
        wingR: THREE.Group;
        fire: THREE.Mesh;
        loadedFire?: THREE.Mesh;
        loadedAura?: THREE.Mesh;
        aura?: THREE.Mesh;
        jaw: THREE.Mesh;
        tail: THREE.Group;
        spines: THREE.Group;
        loadedMixer?: THREE.AnimationMixer;
        loadedActions?: Record<string, THREE.AnimationAction>;
        activeLoadedAction?: string;
      };
      dragonData.loadedMixer?.update(delta);
      const playDragonClip = (clipName: string, fade = 0.18, timeScale = 1) => {
        const actions = dragonData.loadedActions;
        if (!actions?.[clipName] || dragonData.activeLoadedAction === clipName) return;
        const nextAction = actions[clipName];
        const previousAction = dragonData.activeLoadedAction ? actions[dragonData.activeLoadedAction] : undefined;
        if (previousAction && previousAction !== nextAction) previousAction.fadeOut(fade);
        nextAction.enabled = true;
        nextAction.timeScale = timeScale;
        nextAction.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(fade).play();
        dragonData.activeLoadedAction = clipName;
      };
      if (dragonData.loadedActions) {
        if (pulse > 0.12) playDragonClip('Run-loop', 0.08, 1.7);
        else playDragonClip('Idle-loop', 0.22, 1.05);
      }
      dragonData.bodyMat.color.set(data.dragonColor);
      const threat = Math.max(pulse * 1.4, Math.max(0, Math.sin(time * 1.55)) * 0.34);
      const dragonBreath = Math.sin(time * 1.8);
      const wingBeat = Math.sin(time * (6.2 + threat * 2.2));
      const wingSnap = Math.max(0, wingBeat) ** 1.7;
      const headSnap = Math.max(0, Math.sin(time * 3.2 + pulse * 2.4));
      const flameFlicker = 0.85 + Math.max(0, Math.sin(time * 17.5)) * 0.28 + Math.sin(time * 31) * 0.08;
      dragon.position.y = Math.sin(time * 2.1) * 0.18 + threat * 0.08 + wingSnap * 0.045;
      dragon.position.x = 4.75 + shake * 1.45 - threat * 0.25 - headSnap * threat * 0.08;
      dragon.rotation.y = Math.sin(time * 1.1) * 0.14 - threat * 0.05 + headSnap * 0.025;
      dragon.rotation.x = -threat * 0.035 + dragonBreath * 0.012;
      dragonData.body.scale.set(
        1.95 + threat * 0.035,
        1.22 + dragonBreath * 0.055 + threat * 0.045,
        0.92 + Math.abs(dragonBreath) * 0.025 + threat * 0.035
      );
      dragonData.neck.rotation.z = -0.78 + Math.sin(time * 2.2) * 0.08 - threat * 0.14 - headSnap * 0.06;
      dragonData.neck.rotation.y = Math.sin(time * 1.35) * 0.07 + threat * 0.035;
      dragonData.head.rotation.x = -0.04 - threat * 0.08 + headSnap * 0.05;
      dragonData.head.rotation.y = Math.sin(time * 2.1) * 0.1 + headSnap * 0.08;
      dragonData.head.rotation.z = Math.sin(time * 1.7) * 0.055 - threat * 0.075;
      dragonData.spines.rotation.z = Math.sin(time * 2.6) * 0.035 - threat * 0.05;
      dragonData.spines.rotation.x = Math.sin(time * 1.9) * 0.025 - threat * 0.035;
      dragonData.wingL.rotation.z = -0.92 + wingBeat * 0.48 + wingSnap * 0.28 - threat * 0.28;
      dragonData.wingR.rotation.z = 0.92 - wingBeat * 0.48 - wingSnap * 0.28 + threat * 0.28;
      dragonData.wingL.rotation.x = Math.sin(time * 4.8) * 0.1 + threat * 0.18 - wingSnap * 0.12;
      dragonData.wingR.rotation.x = -Math.sin(time * 4.8) * 0.1 - threat * 0.18 + wingSnap * 0.12;
      dragonData.wingL.rotation.y = 0.08 + Math.sin(time * 3.1) * 0.05 + threat * 0.04;
      dragonData.wingR.rotation.y = -0.08 - Math.sin(time * 3.1) * 0.05 - threat * 0.04;
      dragonData.jaw.rotation.z = -0.18 - burn * 0.18 - threat * 0.28 - Math.max(0, Math.sin(time * 7.5)) * 0.16;
      dragonData.tail.rotation.y = Math.sin(time * 1.8) * 0.34 + threat * 0.16;
      dragonData.tail.rotation.z = Math.sin(time * 1.35) * 0.11 + headSnap * threat * 0.06;
      dragonData.tail.children.forEach((segment, segmentIndex) => {
        segment.rotation.y = Math.sin(time * 1.65 + segmentIndex * 0.62) * (0.08 + threat * 0.045);
        segment.rotation.z = 1.12 - segmentIndex * 0.12 + Math.cos(time * 1.35 + segmentIndex * 0.5) * 0.045;
      });
      dragonData.fire.scale.set(
        (1.15 + threat * 0.72) * flameFlicker,
        1.05 + burn * 0.9 + threat * 0.9 + Math.sin(time * 16) * 0.18,
        (1.15 + threat * 0.72) * (0.95 + Math.sin(time * 21) * 0.08)
      );
      (dragonData.fire.material as THREE.MeshBasicMaterial).opacity = dragon.visible ? Math.min(0.96, 0.48 + threat * 0.42 + burn * 0.18) : 0;
      if (dragonData.aura) {
        dragonData.aura.scale.setScalar(1 + threat * 0.42 + Math.sin(time * 3) * 0.08);
        (dragonData.aura.material as THREE.MeshBasicMaterial).opacity = dragon.visible ? 0.2 + threat * 0.28 : 0;
      }
      if (dragonData.loadedAura) {
        dragonData.loadedAura.visible = dragon.visible;
        dragonData.loadedAura.scale.setScalar(1 + threat * 0.48 + Math.sin(time * 3.4) * 0.08);
        (dragonData.loadedAura.material as THREE.MeshBasicMaterial).opacity = dragon.visible ? 0.16 + threat * 0.32 : 0;
      }
      if (dragonData.loadedFire) {
        const breathPower = dragon.visible ? Math.max(pulse * 2.8, threat) : 0;
        dragonData.loadedFire.visible = breathPower > 0.04;
        (dragonData.loadedFire.material as THREE.MeshBasicMaterial).opacity = Math.min(0.95, 0.18 + breathPower * 0.95);
        dragonData.loadedFire.scale.set(
          (1.2 + breathPower * 1.35) * flameFlicker,
          1 + burn * 0.68 + breathPower * 0.72 + Math.sin(time * 18) * 0.14,
          (1.2 + breathPower * 1.35) * (0.95 + Math.sin(time * 23) * 0.08)
        );
        dragonData.loadedFire.position.set(-2.75 - breathPower * 1.18 - headSnap * 0.12, 3.45 + Math.sin(time * 8) * 0.08 - threat * 0.08, Math.sin(time * 11) * 0.035);
      }

      motes.children.forEach((mote) => {
        const seed = typeof mote.userData.seed === 'number' ? mote.userData.seed : 0;
        mote.position.y += 0.012 + Math.sin(time + seed) * 0.003;
        mote.position.x += Math.sin(time * 0.8 + seed) * 0.006 + Math.sin(time * 2.1 + seed) * 0.002;
        mote.position.z += Math.cos(time * 0.6 + seed) * 0.004 + Math.cos(time * 1.7 + seed) * 0.002;
        mote.rotation.x += delta * (0.7 + (seed % 3) * 0.1);
        mote.rotation.y += delta * (1.1 + (seed % 5) * 0.08);
        mote.scale.setScalar(1 + Math.sin(time * 2.4 + seed) * 0.18);
        if (mote.position.y > 13.6) mote.position.y = 0.5;
      });

      const backDistance = data.isHeroMoving ? 13.2 : 11.4;
      const sideOffset = data.isHeroMoving ? 1.45 : 0.95;
      const cameraHeight = data.isHeroMoving ? 6.1 : 5.2;
      const lookAhead = data.isHeroMoving ? 8.4 : 6.2;
      const lookHeight = 1.75;
      cameraTarget.set(
        hero.position.x - Math.sin(cameraYaw) * backDistance + Math.cos(cameraYaw) * sideOffset + shake * 0.45,
        hero.position.y + cameraHeight + Math.sin(time * 0.6) * 0.04,
        hero.position.z - Math.cos(cameraYaw) * backDistance - Math.sin(cameraYaw) * sideOffset
      );
      lookTarget.set(
        hero.position.x + Math.sin(cameraYaw) * lookAhead,
        hero.position.y + lookHeight,
        hero.position.z + Math.cos(cameraYaw) * lookAhead
      );
      const followSpeed = data.isHeroMoving ? 3.7 : 6.1;
      if (!cameraReady) {
        camera.position.copy(cameraTarget);
        smoothLookTarget.copy(lookTarget);
        cameraReady = true;
      } else {
        camera.position.lerp(cameraTarget, 1 - Math.exp(-delta * followSpeed));
        smoothLookTarget.lerp(lookTarget, 1 - Math.exp(-delta * followSpeed));
      }
      camera.lookAt(smoothLookTarget);

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      disposed = true;
      window.clearTimeout(modelReadyFallback);
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const objectMaterial = object.material;
          if (Array.isArray(objectMaterial)) objectMaterial.forEach((entry) => entry.dispose());
          else objectMaterial.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`battle-3d ${modelsReady ? 'ready' : 'loading'}`} ref={mountRef}>
      {!modelsReady && (
        <div className="battle-3d-loading" role="status" aria-live="polite">
          <span className="loading-sigil" aria-hidden="true" />
          <strong>Загрузка моделей</strong>
          <small>Герой, гоблины и карты готовятся</small>
        </div>
      )}
    </div>
  );
}
