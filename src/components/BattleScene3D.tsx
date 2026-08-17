import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';

type BattleScene3DProps = {
  dragonColor: string;
  heroAnimation: 'idle' | 'strike' | 'step' | 'heal';
  isHeroMoving: boolean;
  isFinalReveal: boolean;
  burn: number;
  heroPosition: { x: number; z: number };
  heroHeight: number;
  heroDirection: { x: number; z: number };
  monstersLeft: number;
  battlePulse: number;
  cameraMode: 'third';
  monsterKind: string;
  viewDistance: number;
  sceneKey: string;
  chapter: number;
  locationIndex: number;
  equippedArtifactIcon: string | null;
};

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

function add3DLocation(scene: THREE.Scene, root: THREE.Object3D, sceneKey: string, chapter: number, locationIndex: number) {
  const isEnding = sceneKey.startsWith('ending') || sceneKey.includes('final') || sceneKey.includes('death') || sceneKey.includes('admin');
  const locationStyle = Math.abs(chapter) % 10;
  const theme = cityThemes[Math.abs(chapter + locationIndex) % cityThemes.length];
  const palette = isEnding
    ? { ...theme, sky: '#080509', fog: '#080509', ground: '#1d1418', accent: '#ff004c', glow: '#ff2a1f' }
    : theme;

  scene.background = new THREE.Color(palette.sky);
  scene.fog = new THREE.Fog(palette.fog, 10, isEnding ? 86 : 76);

  const ground = mesh(new THREE.PlaneGeometry(220, 220), palette.ground, [0, -0.055, 0], { roughness: 0.92 });
  ground.rotation.x = -Math.PI / 2;
  root.add(ground);

  if (locationStyle === 0) {
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
  const floor = mesh(new THREE.CircleGeometry(112, 128), '#29241f', [0, -0.04, 0]);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const arena = mesh(new THREE.PlaneGeometry(200, 200), '#26331f', [0, -0.035, 0], { roughness: 0.9 });
  arena.rotation.x = -Math.PI / 2;
  scene.add(arena);

  const roadMat = material('#6b5741', { roughness: 0.86 });
  const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(8, 190), roadMat);
  mainRoad.position.set(0, -0.02, 0);
  mainRoad.rotation.x = -Math.PI / 2;
  mainRoad.receiveShadow = true;
  scene.add(mainRoad);

  const crossRoad = new THREE.Mesh(new THREE.PlaneGeometry(190, 6), roadMat);
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
  hero.userData = { cape, sword, rightArm, leftArm, leftLeg, rightLeg };
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
  const light = new THREE.PointLight('#75e6da', 1.6, 4);
  group.add(ring, core, orb, pendant, halo, light);
  group.userData = { ring, core, orb, pendant, halo, light, glowMat, gemMat, darkMat };
  return group;
}

function updateHeroArtifactStyle(artifact: THREE.Group, icon: string | null) {
  const data = artifact.userData as {
    ring: THREE.Mesh;
    core: THREE.Mesh;
    orb: THREE.Mesh;
    pendant: THREE.Mesh;
    halo: THREE.Mesh;
    light: THREE.PointLight;
    glowMat: THREE.MeshStandardMaterial;
    gemMat: THREE.MeshStandardMaterial;
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
  const skinColor = isGoblin ? ['#a9aaa5', '#949893', '#b8b9b2', '#858b86'][goblinVariant] : isSpider ? '#d9c882' : isLizardBrute ? '#2f7f3f' : isStone ? '#888883' : isWire ? '#c8b29e' : isPale ? '#b8c5c9' : isGiant ? '#8d8f8c' : isOrc ? '#6f7d35' : isCrawler ? '#8a8f82' : kind === 'shadow' ? '#5c5364' : '#8f958a';
  const dark = kind === 'shadow' ? '#120916' : '#34261d';
  const scale = isGoblin ? 0.9 : isStone ? 1.32 : isGiant ? 1.42 : isOrc || isLizardBrute ? 1.2 : isCrawler ? 1.08 : kind === 'shadow' ? 0.98 : 0.94;

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
  const footL = mesh(new THREE.BoxGeometry(0.24 * scale, 0.09 * scale, 0.34 * scale), skinColor, [-0.21 * scale, -0.08 * scale, 0.14]);
  const footR = mesh(new THREE.BoxGeometry(0.24 * scale, 0.09 * scale, 0.34 * scale), skinColor, [0.2 * scale, -0.08 * scale, 0.18]);
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
  goblinDetails.add(loincloth, backCloth, pecL, pecR, shoulderMuscleL, shoulderMuscleR, bicepL, bicepR, calfL, calfR, kneeL, kneeR, collar, clothTears, ribsMark, goblinClub, goblinShield);
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
  group.userData = { body, head, jaw, earL, earR, armL, armR, club, knife, goblinClub, legL, legR, footL, footR, lizardTail, backSpikes, baseY: 0, seed: index * 0.7, isGoblin, goblinVariant };
  return group;
}

function makeReplacementMonsterFallback() {
  const group = new THREE.Group();
  const skin = material('#3f4f38', { roughness: 0.66, metalness: 0.05 });
  const body = capsule('#3f4f38', 0.18, 0.62, [0, 0.58, 0]);
  body.material = skin;
  body.scale.set(0.75, 1.08, 0.62);
  const head = mesh(new THREE.SphereGeometry(0.22, 16, 10), '#465d40', [0, 1.13, 0.04]);
  head.scale.set(1.05, 0.86, 0.9);
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#ff5a1f' });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), eyeMat);
  eyeL.position.set(-0.07, 1.17, 0.22);
  const eyeR = eyeL.clone();
  eyeR.position.x *= -1;
  const armL = capsule('#3f4f38', 0.045, 0.5, [-0.28, 0.65, 0.02]);
  armL.material = skin;
  armL.rotation.z = -0.95;
  const armR = armL.clone();
  armR.position.x *= -1;
  armR.rotation.z = 0.95;
  const legL = capsule('#354631', 0.055, 0.46, [-0.1, 0.2, 0]);
  const legR = legL.clone();
  legR.position.x *= -1;
  group.add(body, head, eyeL, eyeR, armL, armR, legL, legR);
  return group;
}

function fitMonsterModel(model: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  model.position.y += size.y / 2;
  model.scale.setScalar(size.y > 0 ? 1.65 / size.y : 1);
  model.rotation.y = Math.PI;
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

function makeDragon(color: string) {
  {
  const dragon = new THREE.Group();
  const fallback = new THREE.Group();
  const darkScale = 1.5;
  const bodyMat = material('#15100e', { metalness: 0.12, roughness: 0.42 });
  const frostEye = new THREE.MeshBasicMaterial({ color: '#ff5a1f' });
  const body = capsule('#15100e', 0.5 * darkScale, 1.8 * darkScale, [0, 1.55 * darkScale, 0]);
  body.material = bodyMat;
  body.scale.set(1.7, 0.92, 0.82);
  const neck = capsule('#15100e', 0.18 * darkScale, 1.0 * darkScale, [0.82 * darkScale, 2.02 * darkScale, 0]);
  neck.material = bodyMat;
  neck.rotation.z = -0.62;
  const head = mesh(new THREE.SphereGeometry(0.34 * darkScale, 22, 14), '#15100e', [1.42 * darkScale, 2.38 * darkScale, 0]);
  head.material = bodyMat;
  head.scale.set(1.35, 0.82, 0.72);
  const jaw = mesh(new THREE.BoxGeometry(0.52 * darkScale, 0.12 * darkScale, 0.14 * darkScale), '#2b1510', [1.68 * darkScale, 2.22 * darkScale, 0]);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04 * darkScale, 8, 6), frostEye);
  eyeL.position.set(1.6 * darkScale, 2.44 * darkScale, 0.24 * darkScale);
  const eyeR = eyeL.clone();
  eyeR.position.z *= -1;
  const wingL = new THREE.Group();
  const wingR = new THREE.Group();
  const makeWing = (side: 1 | -1) => {
    const wing = side === 1 ? wingL : wingR;
    const membrane = new THREE.Mesh(
      new THREE.CircleGeometry(1.25 * darkScale, 4),
      new THREE.MeshStandardMaterial({ color: '#211716', side: THREE.DoubleSide, transparent: true, opacity: 0.78, roughness: 0.5 })
    );
    membrane.position.set(-0.35 * darkScale, 2.25 * darkScale, side * 0.8 * darkScale);
    membrane.rotation.set(0.8, side * 0.42, side * -0.78);
    membrane.scale.set(1.35, 0.76, 1);
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
  for (let i = 0; i < 8; i += 1) {
    const spine = cone('#d8d0bc', (0.065 - i * 0.004) * darkScale, (0.32 - i * 0.012) * darkScale, [(0.9 - i * 0.34) * darkScale, (2.28 - i * 0.12) * darkScale, 0]);
    spine.rotation.z = -0.18;
    spines.add(spine);
  }
  const fire = new THREE.Mesh(
    new THREE.ConeGeometry(0.28 * darkScale, 1.35 * darkScale, 12),
    new THREE.MeshBasicMaterial({ color: '#ff8a1f', transparent: true, opacity: 0.88 })
  );
  fire.position.set(2.05 * darkScale, 2.28 * darkScale, 0);
  fire.rotation.z = -Math.PI / 2;
  fallback.add(body, neck, head, jaw, eyeL, eyeR, wingL, wingR, tail, spines, fire);
  dragon.add(fallback);

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    '/models/khronos-dragon/dragon.glb',
    (gltf) => {
      fallback.visible = false;
      const model = gltf.scene;
      model.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });
      model.rotation.y = -Math.PI / 2;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      model.position.y += size.y / 2;
      model.scale.setScalar(size.y > 0 ? 8.5 / size.y : 1);
      dragon.add(model);
      dragon.userData.loadedModel = model;
    },
    undefined,
    () => {
      fallback.visible = true;
    }
  );

  dragon.position.set(4.2, 0, -0.5);
  dragon.userData = { bodyMat, body, head, neck, wingL, wingR, fire, jaw, tail, spines };
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

  useEffect(() => {
    refs.current = props;
  }, [props]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#081111');
    scene.fog = new THREE.Fog('#081111', 12, 70);

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
    camera.position.set(0, 4.3, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = 'battle-canvas';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight('#73d2de', '#160e0b', 1.35));
    const key = new THREE.DirectionalLight('#fff1c7', 2.3);
    key.position.set(-4, 9, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    addCaveCity(scene);
    const locationRoot = new THREE.Group();
    scene.add(locationRoot);
    const recRoomLocation = new THREE.Group();
    recRoomLocation.position.set(0, 0, -26);
    scene.add(recRoomLocation);
    const recRoomRunLocation = new THREE.Group();
    recRoomRunLocation.position.set(34, 0, -18);
    recRoomRunLocation.rotation.y = -0.38;
    scene.add(recRoomRunLocation);
    const locationLoader = new GLTFLoader();
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
      }
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
      }
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
      const nextLocationKey = `${data.sceneKey}-${data.chapter}-${data.locationIndex}`;
      if (nextLocationKey === activeLocationKey) return;
      activeLocationKey = nextLocationKey;
      while (locationRoot.children.length) {
        const child = locationRoot.children.pop();
        if (child) disposeLocationObject(child);
      }
      add3DLocation(scene, locationRoot, data.sceneKey, data.chapter, data.locationIndex);
    };
    rebuildLocation();

    const hero = makeHero();
    const heroArtifact = makeHeroArtifact();
    const dragon = makeDragon(refs.current.dragonColor);
    const nightKingBoss = new THREE.Group();
    const nightKingFallback = makeNightKingFallback();
    nightKingBoss.add(nightKingFallback);
    nightKingBoss.position.set(0, 0, -18);
    nightKingBoss.scale.setScalar(3.8);
    scene.add(hero, heroArtifact, dragon, nightKingBoss);

    const gltfLoader = new GLTFLoader();
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
      },
      undefined,
      () => {
        nightKingFallback.visible = true;
      }
    );

    const monsters = new THREE.Group();
    for (let i = 0; i < 36; i += 1) {
      const monster = makeMonster(refs.current.monsterKind, i);
      monster.children.forEach((child) => {
        child.visible = false;
      });
      const replacementFallback = makeReplacementMonsterFallback();
      replacementFallback.name = 'replacement-monster-fallback';
      monster.add(replacementFallback);
      monster.userData.replacementFallback = replacementFallback;
      const ring = 8 + (i % 6) * 3.7;
      const angle = (i / 36) * Math.PI * 2;
      const homeX = Math.cos(angle) * ring + Math.sin(i * 1.7) * 4;
      const homeZ = Math.sin(angle) * ring - 5 + Math.cos(i * 1.2) * 4;
      monster.position.set(homeX, 0, homeZ);
      monster.rotation.y = Math.PI + Math.sin(i) * 0.35;
      monster.userData.homeX = homeX;
      monster.userData.homeZ = homeZ;
      monster.userData.speed = (refs.current.monsterKind === 'goblin' ? 0.04 : 0.018) + (i % 5) * 0.004;
      monster.userData.attackFlash = 0;
      monster.userData.attackCycle = (i % 7) * 0.13;
      monsters.add(monster);
    }
    scene.add(monsters);

    const monsterMixers: THREE.AnimationMixer[] = [];
    const monsterLoader = new GLTFLoader();
    const monsterModelPaths = [
      '/models/gobkit-minions/minion-a01.glb',
      '/models/gobkit-minions/minion-b01.glb',
      '/models/gobkit-minions/minion-c01.glb',
      '/models/gobkit-minions/minion-d01.glb',
    ];
    monsterModelPaths.forEach((modelPath, modelIndex) => {
      monsterLoader.load(
        modelPath,
        (gltf) => {
        const template = gltf.scene;
        template.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
          }
        });
        monsters.children.forEach((monster, index) => {
          if (index % monsterModelPaths.length !== modelIndex) return;
          const current = monster as THREE.Group;
          const fallback = current.userData.replacementFallback;
          if (fallback instanceof THREE.Object3D) fallback.visible = false;
          const model = cloneSkeleton(template);
          fitMonsterModel(model);
          model.rotation.y += (index % 2 ? 0.08 : -0.08);
          model.name = 'replacement-monster-model';
          current.add(model);
          current.userData.replacementModel = model;
          if (gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            const idleClip = THREE.AnimationUtils.subclip(gltf.animations[0], 'idle', 0, 30, 24);
            mixer.clipAction(idleClip).play();
            monsterMixers.push(mixer);
            current.userData.replacementMixer = mixer;
          }
        });
      },
      undefined,
      () => {
        monsters.children.forEach((monster) => {
          const fallback = (monster as THREE.Group).userData.replacementFallback;
          if (fallback instanceof THREE.Object3D) fallback.visible = true;
        });
      }
      );
    });

    const ashMat = new THREE.MeshBasicMaterial({ color: '#aee9e3', transparent: true, opacity: 0.58 });
    const motes = new THREE.Group();
    for (let i = 0; i < 110; i += 1) {
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.025 + (i % 3) * 0.01, 8, 6), ashMat);
      mote.position.set(-14 + Math.random() * 28, 0.6 + Math.random() * 8, -18 + Math.random() * 24);
      mote.userData.seed = Math.random() * 10;
      motes.add(mote);
    }
    scene.add(motes);

    const clock = new THREE.Clock();
    let frame = 0;
    let lastPulse = refs.current.battlePulse;
    let lastHeroAnimation = refs.current.heroAnimation;
    let pulse = 0;
    let lastHeroX = refs.current.heroPosition.x / 1000;
    let lastHeroZ = refs.current.heroPosition.z / 1000;
    let heroFacing = 0.25;
    let renderFacing = 0.25;
    const cameraTarget = new THREE.Vector3(0, 3, 10);
    const lookTarget = new THREE.Vector3(0, 1.5, 0);
    const smoothLookTarget = new THREE.Vector3(0, 1.5, 0);
    let attackSwing = 0;

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
      monsterMixers.forEach((mixer) => mixer.update(delta));
      rebuildLocation();
      const startedStrike = lastHeroAnimation !== data.heroAnimation && data.heroAnimation === 'strike';
      lastHeroAnimation = data.heroAnimation;
      if (lastPulse !== data.battlePulse || startedStrike) {
        lastPulse = data.battlePulse;
        pulse = 0.38;
        attackSwing = 1;
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

      scene.fog = new THREE.Fog('#081111', Math.max(9, data.viewDistance * 0.015), Math.max(34, data.viewDistance * 0.08));
      scene.traverse((object) => {
        if (object instanceof THREE.PointLight) object.intensity = 2.2 + burn * 2.8 + Math.sin(time * 8 + object.position.x) * 0.35;
        if (object.userData.flame instanceof THREE.Mesh) object.userData.flame.scale.y = 0.8 + burn * 0.5 + Math.sin(time * 9 + object.position.x) * 0.18;
      });

      hero.position.x = heroWorldX;
      hero.position.z = heroWorldZ;
      const moveDX = heroX - lastHeroX;
      const moveDZ = heroZ - lastHeroZ;
      if (Math.hypot(data.heroDirection.x, data.heroDirection.z) > 0.01) {
        heroFacing = Math.atan2(data.heroDirection.x, data.heroDirection.z);
      } else if (Math.hypot(moveDX, moveDZ) > 0.005) {
        heroFacing = Math.atan2(moveDX, moveDZ);
      }
      let turnDelta = heroFacing - renderFacing;
      turnDelta = Math.atan2(Math.sin(turnDelta), Math.cos(turnDelta));
      renderFacing += turnDelta * Math.min(1, delta * 9);
      lastHeroX = heroX;
      lastHeroZ = heroZ;

      const walkCycle = data.isHeroMoving ? time * 12.5 : time * 4;
      const stride = Math.sin(walkCycle);
      const stepLift = Math.abs(Math.sin(walkCycle));
      const runTilt = data.isHeroMoving ? Math.sin(walkCycle * 0.5) * 0.055 : 0;
      const walkPower = data.isHeroMoving ? 0.74 : 0.12;
      hero.scale.setScalar(1);
      hero.position.y = jumpHeight + Math.sin(time * 2.6) * 0.035 + (data.isHeroMoving ? stepLift * 0.095 : 0);
      hero.rotation.y = renderFacing + Math.sin(time * 1.8) * 0.025;
      hero.rotation.x = data.isHeroMoving ? -0.07 + runTilt : 0;
      hero.rotation.z = data.isHeroMoving ? Math.sin(walkCycle) * 0.055 : 0;
      hero.userData.cape.rotation.y = Math.sin(time * 2.2) * 0.04 - stride * (data.isHeroMoving ? 0.12 : 0);
      hero.userData.cape.rotation.x = data.isHeroMoving ? -0.08 - stepLift * 0.08 : 0;
      hero.userData.leftLeg.rotation.x = stride * walkPower - jumpHeight * 0.28;
      hero.userData.rightLeg.rotation.x = -stride * walkPower - jumpHeight * 0.28;
      hero.userData.leftArm.rotation.x = -stride * (data.isHeroMoving ? 0.5 : 0.08);
      hero.userData.rightArm.rotation.x = -0.18 + stride * (data.isHeroMoving ? 0.34 : 0.05);
      hero.userData.leftArm.rotation.z = -0.55 + Math.sin(time * 5) * 0.08 + stepLift * (data.isHeroMoving ? 0.12 : 0);
      hero.userData.rightArm.rotation.z = -1.18 - Math.sin(time * 5) * 0.05 - stepLift * (data.isHeroMoving ? 0.08 : 0);
      hero.userData.sword.rotation.set(0.12, 0, -1.34);
      if (data.heroAnimation === 'strike' || attackSwing > 0) {
        const attackPhase = THREE.MathUtils.clamp(1 - attackSwing, 0, 1);
        const windup = THREE.MathUtils.smoothstep(attackPhase, 0, 0.24);
        const slash = Math.sin(THREE.MathUtils.clamp((attackPhase - 0.16) / 0.34, 0, 1) * Math.PI);
        const impact = Math.sin(THREE.MathUtils.clamp((attackPhase - 0.28) / 0.2, 0, 1) * Math.PI);
        const recover = THREE.MathUtils.smoothstep(attackPhase, 0.5, 1);
        const lunge = Math.max(slash, impact * 0.75) * (1 - recover * 0.35);
        hero.position.x += Math.sin(renderFacing) * (0.16 + lunge * 0.52);
        hero.position.z += Math.cos(renderFacing) * (0.16 + lunge * 0.52);
        hero.position.y += impact * 0.12;
        hero.rotation.x = -0.12 - lunge * 0.24 + recover * 0.08;
        hero.rotation.z = -windup * 0.18 + impact * 0.26;
        hero.userData.rightArm.rotation.z = 0.62 + windup * 1.45 + slash * 0.82 - recover * 0.35;
        hero.userData.rightArm.rotation.x = -0.2 - windup * 1.3 - slash * 2.05 + recover * 1.05;
        hero.userData.leftArm.rotation.x = -0.22 + slash * 0.35;
        hero.userData.leftArm.rotation.z = -0.56 - lunge * 0.48 + recover * 0.22;
        hero.userData.sword.rotation.x = 0.12 - windup * 1.35 - slash * 2.15 + recover * 1.1;
        hero.userData.sword.rotation.y = -impact * 0.28;
        hero.userData.sword.rotation.z = -1.34 - slash * 1.2 + recover * 0.62;
      } else if (data.heroAnimation === 'step' || data.isHeroMoving) {
        hero.position.x += Math.sin(renderFacing) * stride * 0.11;
        hero.position.z += Math.cos(renderFacing) * stride * 0.11;
        hero.rotation.x -= stepLift * 0.035;
      } else if (data.heroAnimation === 'heal') {
        hero.scale.setScalar(1 + Math.sin(time * 10) * 0.045);
        hero.rotation.y += Math.sin(time * 8) * 0.035;
      } else {
        hero.rotation.x = 0;
        hero.rotation.z = 0;
      }

      updateHeroArtifactStyle(heroArtifact, data.equippedArtifactIcon);
      if (heroArtifact.visible) {
        const orbit = time * 1.8;
        const side = 0.72 + Math.sin(time * 1.3) * 0.08;
        heroArtifact.position.set(
          hero.position.x + Math.cos(renderFacing) * side + Math.sin(orbit) * 0.12,
          hero.position.y + 1.58 + Math.sin(time * 3.1) * 0.12,
          hero.position.z - Math.sin(renderFacing) * side + Math.cos(orbit) * 0.12
        );
        heroArtifact.rotation.y = time * 2.4;
        heroArtifact.rotation.x = Math.sin(time * 2.2) * 0.28;
        heroArtifact.scale.setScalar(1 + Math.sin(time * 4) * 0.08);
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

        const toHeroX = heroWorldX - current.position.x;
        const toHeroZ = heroWorldZ - current.position.z;
        const distance = Math.max(0.001, Math.hypot(toHeroX, toHeroZ));
        const attackRange = 5;
        const targetX = heroWorldX;
        const targetZ = heroWorldZ;
        const moveX = targetX - current.position.x;
        const moveZ = targetZ - current.position.z;
        const moveDistance = Math.max(0.001, Math.hypot(moveX, moveZ));
        const speed = (current.userData.speed as number) * 2.65;

        if (distance > attackRange) {
          const stopDistance = attackRange * 0.82;
          const stepDistance = Math.min(Math.max(0, distance - stopDistance), speed * delta * 60);
          current.position.x += (moveX / moveDistance) * stepDistance + shake * (index % 2 ? 0.012 : -0.012);
          current.position.z += (moveZ / moveDistance) * stepDistance;
          current.userData.attackFlash = Math.max(0, (current.userData.attackFlash as number) - delta * 1.8);
          current.userData.attackCycle = 0;
        } else {
          current.userData.attackCycle = ((current.userData.attackCycle as number) + delta * 1.55) % 1;
          current.userData.attackFlash = Math.min(1, (current.userData.attackFlash as number) + delta * 5);
          current.position.x -= (toHeroX / distance) * 0.018 * Math.sin(time * 14 + index);
          current.position.z -= (toHeroZ / distance) * 0.018 * Math.sin(time * 14 + index);
        }

        const walk = time * (distance > attackRange ? 9.8 : 5.4) + index;
        const attack = current.userData.attackFlash as number;
        current.position.y = Math.max(0, Math.sin(walk * 2) * 0.08) + (attack > 0.4 ? Math.sin(time * 22 + index) * 0.06 : 0);
        const faceHero = Math.atan2(toHeroX, toHeroZ) + Math.PI;
        let monsterTurnDelta = faceHero - current.rotation.y;
        monsterTurnDelta = Math.atan2(Math.sin(monsterTurnDelta), Math.cos(monsterTurnDelta));
        current.rotation.y += monsterTurnDelta * Math.min(1, delta * 8);
        current.rotation.y += Math.sin(walk) * (distance > attackRange ? 0.035 : 0.06);
        const attackCycle = current.userData.attackCycle as number;
        const monsterWindup = THREE.MathUtils.smoothstep(attackCycle, 0.05, 0.34);
        const monsterHit = Math.sin(THREE.MathUtils.clamp((attackCycle - 0.28) / 0.36, 0, 1) * Math.PI);
        const monsterRecover = THREE.MathUtils.smoothstep(attackCycle, 0.62, 0.98);
        const monsterSwing = attack * Math.max(monsterHit, monsterWindup * (1 - monsterRecover));
        if (current.userData.isGoblin) {
          const skitter = Math.sin(walk * 1.45);
          const stab = monsterHit * attack;
          current.rotation.x = -0.12 - monsterSwing * 0.28 + Math.abs(skitter) * 0.035;
          current.rotation.z = Math.sin(walk * 0.7) * 0.11;
          current.position.y += Math.abs(skitter) * 0.045;
          current.userData.armL.rotation.x = 0.25 + skitter * 0.38 - monsterSwing * 0.65;
          current.userData.armL.rotation.z = -1.08 - monsterWindup * 0.3 + Math.sin(walk + 0.6) * 0.18;
          current.userData.armR.rotation.x = -0.45 - skitter * 0.42 - monsterWindup * 1.65 - stab * 2.1 + monsterRecover * 1.2;
          current.userData.armR.rotation.z = 1.15 + monsterWindup * 0.85 + stab * 0.55 + Math.sin(walk + 1.2) * 0.16;
          current.userData.legL.rotation.x = skitter * 0.78;
          current.userData.legR.rotation.x = -skitter * 0.78;
          current.userData.footL.rotation.x = -0.12 - skitter * 0.32;
          current.userData.footR.rotation.x = -0.12 + skitter * 0.32;
          current.userData.head.rotation.x = -0.1 + monsterSwing * 0.35 + Math.sin(walk * 0.7) * 0.1;
          current.userData.head.rotation.z = Math.sin(walk * 0.55) * 0.09;
          current.userData.jaw.rotation.x = attack ? 0.18 + stab * 0.32 : Math.max(0, Math.sin(walk * 0.8)) * 0.08;
          current.userData.earL.rotation.y = -0.34 + Math.sin(walk * 0.9) * 0.12;
          current.userData.earR.rotation.y = 0.34 - Math.sin(walk * 0.9) * 0.12;
          current.userData.knife.rotation.z = -0.18 - monsterWindup * 0.75 - stab * 1.05 + monsterRecover * 0.85;
          current.userData.knife.position.z = 0.02 + stab * 0.18;
          current.userData.goblinClub.rotation.z = -monsterWindup * 0.65 - stab * 1.15 + monsterRecover * 0.75 + Math.sin(walk) * 0.12;
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
      });

      dragon.visible = !data.isFinalReveal && data.monstersLeft <= 0;
      nightKingBoss.visible = !data.isFinalReveal && data.monstersLeft <= 0;
      if (nightKingBoss.visible) {
        const bossTargetAngle = Math.atan2(heroWorldX - nightKingBoss.position.x, heroWorldZ - nightKingBoss.position.z);
        nightKingBoss.rotation.y = THREE.MathUtils.lerp(nightKingBoss.rotation.y, bossTargetAngle, Math.min(1, delta * 2.8));
        nightKingBoss.position.y = Math.sin(time * 1.2) * 0.08;
        nightKingBoss.position.x = shake * 0.85;
        const bossHead = nightKingFallback.userData.head;
        if (bossHead instanceof THREE.Object3D) {
          bossHead.rotation.x = -0.08 + Math.sin(time * 1.8) * 0.025;
          bossHead.rotation.y = Math.sin(time * 1.4) * 0.045;
        }
      }
      const dragonData = dragon.userData as { bodyMat: THREE.MeshStandardMaterial; body: THREE.Mesh; head: THREE.Mesh; neck: THREE.Mesh; wingL: THREE.Group; wingR: THREE.Group; fire: THREE.Mesh; jaw: THREE.Mesh; tail: THREE.Group; spines: THREE.Group };
      dragonData.bodyMat.color.set(data.dragonColor);
      dragon.position.y = Math.sin(time * 2) * 0.16;
      dragon.position.x = 4.2 + shake * 1.2;
      dragon.rotation.y = Math.sin(time * 1.1) * 0.12;
      dragonData.body.scale.y = 1.18 + Math.sin(time * 2.8) * 0.035;
      dragonData.neck.rotation.z = -0.72 + Math.sin(time * 2.2) * 0.06;
      dragonData.head.rotation.y = Math.sin(time * 2.1) * 0.08;
      dragonData.head.rotation.z = Math.sin(time * 1.7) * 0.045;
      dragonData.spines.rotation.z = Math.sin(time * 2.6) * 0.025;
      dragonData.wingL.rotation.z = -0.78 + Math.sin(time * 6) * 0.42;
      dragonData.wingR.rotation.z = 0.78 - Math.sin(time * 6) * 0.42;
      dragonData.wingL.rotation.x = Math.sin(time * 4.5) * 0.08;
      dragonData.wingR.rotation.x = -Math.sin(time * 4.5) * 0.08;
      dragonData.jaw.rotation.z = -0.12 - burn * 0.12 - Math.max(0, Math.sin(time * 7)) * 0.11;
      dragonData.tail.rotation.y = Math.sin(time * 1.8) * 0.24;
      dragonData.tail.rotation.z = Math.sin(time * 1.35) * 0.08;
      dragonData.fire.scale.set(1, 0.75 + burn * 0.65 + Math.sin(time * 14) * 0.12, 1);

      motes.children.forEach((mote) => {
        mote.position.y += 0.012 + Math.sin(time + mote.userData.seed) * 0.003;
        mote.position.x += Math.sin(time * 0.8 + mote.userData.seed) * 0.006;
        if (mote.position.y > 9.6) mote.position.y = 0.5;
      });

      const backDistance = 5.4;
      const sideOffset = 0.35;
      cameraTarget.set(
        hero.position.x - Math.sin(renderFacing) * backDistance + Math.cos(renderFacing) * sideOffset + shake * 0.45,
        hero.position.y + 2.75 + Math.sin(time * 0.6) * 0.06,
        hero.position.z - Math.cos(renderFacing) * backDistance - Math.sin(renderFacing) * sideOffset
      );
      lookTarget.set(
        hero.position.x + Math.sin(renderFacing) * 0.45,
        hero.position.y + 1.42,
        hero.position.z + Math.cos(renderFacing) * 0.45
      );
      const followSpeed = data.isHeroMoving ? 46 : 30;
      if (camera.position.distanceTo(cameraTarget) > 1.15) {
        camera.position.copy(cameraTarget);
        smoothLookTarget.copy(lookTarget);
      } else {
        camera.position.lerp(cameraTarget, Math.min(1, delta * followSpeed));
        smoothLookTarget.lerp(lookTarget, Math.min(1, delta * followSpeed));
      }
      camera.lookAt(smoothLookTarget);

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
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

  return <div className="battle-3d" ref={mountRef} />;
}
