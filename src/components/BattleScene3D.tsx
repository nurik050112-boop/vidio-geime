import { useEffect, useRef } from 'react';
import * as THREE from 'three';

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
  cameraMode: 'third' | 'second';
  monsterKind: string;
  viewDistance: number;
  sceneKey: string;
  chapter: number;
  locationIndex: number;
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

function addPillar(scene: THREE.Scene, x: number, z: number, color: string, glow: string) {
  const pillar = new THREE.Group();
  const base = mesh(new THREE.CylinderGeometry(0.62, 0.78, 2.4, 8), color, [x, 1.16, z], { roughness: 0.72 });
  const spike = cone(color, 0.7, 1.9, [x, 3.28, z]);
  const rune = mesh(new THREE.BoxGeometry(0.12, 0.9, 0.06), glow, [x, 2.18, z + 0.64], { emissive: glow, emissiveIntensity: 1.2 });
  const light = new THREE.PointLight(glow, 1.8, 10);
  light.position.set(x, 2.6, z);
  pillar.add(base, spike, rune, light);
  scene.add(pillar);
}

function add3DLocation(scene: THREE.Scene, sceneKey: string, chapter: number, locationIndex: number) {
  const isEnding = sceneKey.startsWith('ending') || sceneKey.includes('final') || sceneKey.includes('death') || sceneKey.includes('admin');
  const theme = cityThemes[Math.abs(chapter + locationIndex) % cityThemes.length];
  const palette = isEnding
    ? { ...theme, sky: '#080509', fog: '#080509', ground: '#1d1418', accent: '#ff004c', glow: '#ff2a1f' }
    : theme;

  scene.background = new THREE.Color(palette.sky);
  scene.fog = new THREE.Fog(palette.fog, 10, isEnding ? 86 : 76);

  const ground = mesh(new THREE.PlaneGeometry(220, 220), palette.ground, [0, -0.055, 0], { roughness: 0.92 });
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  if (locationIndex === 0) {
    for (let i = 0; i < 28; i += 1) {
      const x = -42 + (i % 7) * 13.4;
      const z = -27 + Math.floor(i / 7) * 15.5;
      const building = mesh(new THREE.BoxGeometry(2.6 + (i % 3), 2.2 + (i % 4) * 0.65, 2.2), i % 2 ? '#504238' : '#6b5741', [x, 1.05, z]);
      const roof = cone(palette.accent, 1.9, 1.25, [x, 2.85 + (i % 4) * 0.32, z]);
      roof.rotation.y = Math.PI / 4;
      scene.add(building, roof);
    }
  } else if (locationIndex === 1) {
    for (let i = 0; i < 18; i += 1) {
      const x = -38 + (i % 6) * 15;
      const z = -24 + Math.floor(i / 6) * 20;
      addPillar(scene, x, z, '#1c1717', palette.glow);
    }
    const citadel = mesh(new THREE.CylinderGeometry(4.8, 6.4, 7.4, 10), '#171112', [0, 3.65, -18], { roughness: 0.6 });
    const citadelTop = cone('#090708', 5.2, 5.8, [0, 10.2, -18]);
    const core = mesh(new THREE.BoxGeometry(0.5, 5.2, 0.18), palette.glow, [0, 5.4, -13.15], { emissive: palette.glow, emissiveIntensity: 1.8 });
    scene.add(citadel, citadelTop, core);
  } else {
    for (let i = 0; i < 46; i += 1) {
      const x = -50 + (i % 12) * 9.2 + Math.sin(i) * 1.4;
      const z = -34 + Math.floor(i / 12) * 18 + Math.cos(i) * 1.8;
      const deadTree = new THREE.Group();
      const trunk = mesh(new THREE.CylinderGeometry(0.12, 0.28, 2.6 + (i % 4) * 0.55, 6), '#1d1510', [x, 1.2, z]);
      trunk.rotation.z = Math.sin(i) * 0.18;
      const branch = mesh(new THREE.BoxGeometry(0.13, 1.6, 0.12), '#1d1510', [x + 0.28, 2.35, z]);
      branch.rotation.z = 0.9 + Math.sin(i) * 0.2;
      deadTree.add(trunk, branch);
      scene.add(deadTree);
    }
    for (let i = 0; i < 16; i += 1) {
      const lava = mesh(new THREE.PlaneGeometry(2.2 + (i % 4), 0.38), palette.glow, [-42 + (i % 8) * 12, -0.01, -18 + Math.floor(i / 8) * 31], {
        emissive: palette.glow,
        emissiveIntensity: 1.4,
      });
      lava.rotation.x = -Math.PI / 2;
      lava.rotation.z = Math.sin(i) * 0.6;
      scene.add(lava);
    }
  }

  if (isEnding) {
    for (let i = 0; i < 7; i += 1) {
      addPillar(scene, -30 + i * 10, -34 + Math.sin(i) * 7, '#120b0d', palette.glow);
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
  const armor = material('#8a8d8a', { metalness: 0.78, roughness: 0.2 });
  const darkArmor = material('#3a3a38', { metalness: 0.62, roughness: 0.28 });
  const leather = material('#2b211d', { roughness: 0.82 });
  const steelDark = material('#55585a', { metalness: 0.82, roughness: 0.22 });
  const steelLight = material('#b9bab5', { metalness: 0.9, roughness: 0.16 });

  const body = capsule('#8a8d8a', 0.34, 0.82, [0, 1.1, 0]);
  body.scale.set(0.86, 1.08, 0.58);
  body.material = armor;
  const chestPlate = mesh(new THREE.BoxGeometry(0.68, 0.58, 0.16), '#777a78', [0, 1.18, 0.31], { metalness: 0.86, roughness: 0.18 });
  chestPlate.material = steelDark;
  const skirt = mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.58, 6), '#2b211d', [0, 0.62, 0.02]);
  skirt.material = leather;
  const belt = mesh(new THREE.BoxGeometry(0.72, 0.12, 0.46), '#3a2415', [0, 0.88, 0.03]);
  const helmet = mesh(new THREE.SphereGeometry(0.36, 24, 14), '#8a8d8a', [0, 1.92, 0], { metalness: 0.82, roughness: 0.18 });
  helmet.scale.set(0.78, 1.18, 0.72);
  helmet.material = steelLight;
  const visor = mesh(new THREE.BoxGeometry(0.28, 0.42, 0.08), '#24282b', [0, 1.88, 0.3], { metalness: 0.72, roughness: 0.2 });
  const visorSlit = mesh(new THREE.BoxGeometry(0.24, 0.035, 0.02), '#050607', [0, 1.96, 0.35]);
  const noseGuard = mesh(new THREE.BoxGeometry(0.052, 0.44, 0.055), '#b7b8b0', [0, 1.82, 0.36], { metalness: 0.8, roughness: 0.16 });
  const neckGuard = mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.18, 12), '#55585a', [0, 1.6, 0], { metalness: 0.8, roughness: 0.22 });
  neckGuard.material = steelDark;
  const sword = new THREE.Group();
  const blade = mesh(new THREE.BoxGeometry(0.07, 1.85, 0.035), '#dfe5e3', [0, 0.58, 0], {
    metalness: 0.76,
    emissive: '#9fb6bf',
    emissiveIntensity: 0.18,
  });
  const guard = mesh(new THREE.BoxGeometry(0.5, 0.07, 0.08), '#8a5b38', [0, -0.4, 0], { metalness: 0.3, roughness: 0.42 });
  const pommel = mesh(new THREE.SphereGeometry(0.075, 12, 8), '#8a5b38', [0, -0.74, 0], { metalness: 0.34, roughness: 0.38 });
  sword.add(blade, guard, pommel);
  sword.position.set(0.86, 0.9, 0.16);
  sword.rotation.z = -0.08;

  const leftShoulder = mesh(new THREE.SphereGeometry(0.2, 16, 10), '#8a8d8a', [-0.46, 1.48, 0.02], { metalness: 0.8, roughness: 0.16 });
  leftShoulder.scale.set(1.25, 0.62, 0.9);
  const rightShoulder = leftShoulder.clone();
  rightShoulder.position.x = 0.46;
  const leftArm = capsule('#8a8d8a', 0.095, 0.66, [-0.47, 1.12, 0.02]);
  leftArm.material = armor;
  leftArm.rotation.z = -0.42;
  const rightArm = capsule('#8a8d8a', 0.095, 0.72, [0.48, 1.12, 0.02]);
  rightArm.material = armor;
  rightArm.rotation.z = 0.58;
  const leftGauntlet = capsule('#3a3a38', 0.07, 0.24, [-0.6, 0.77, 0.07]);
  leftGauntlet.material = darkArmor;
  const rightGauntlet = capsule('#3a3a38', 0.07, 0.24, [0.67, 0.77, 0.12]);
  rightGauntlet.material = darkArmor;

  const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.08, 5), armor);
  shield.position.set(-0.68, 1.12, 0.28);
  shield.rotation.set(Math.PI / 2, 0, 0.22);
  shield.castShadow = true;
  shield.receiveShadow = true;
  const shieldFace = mesh(new THREE.BoxGeometry(0.14, 0.22, 0.03), '#3a3a38', [-0.68, 1.12, 0.34]);
  shieldFace.material = darkArmor;
  const shieldMark = mesh(new THREE.BoxGeometry(0.05, 0.14, 0.02), '#b9bab5', [-0.68, 1.12, 0.37], { metalness: 0.82, roughness: 0.18 });

  const leftLeg = capsule('#8a8d8a', 0.12, 0.72, [-0.18, 0.35, -0.08]);
  leftLeg.material = armor;
  const rightLeg = capsule('#8a8d8a', 0.12, 0.72, [0.18, 0.35, 0.08]);
  rightLeg.material = armor;
  const leftBoot = mesh(new THREE.BoxGeometry(0.28, 0.14, 0.42), '#2c241f', [-0.19, -0.03, 0.04]);
  const rightBoot = mesh(new THREE.BoxGeometry(0.28, 0.14, 0.42), '#2c241f', [0.2, -0.03, 0.18]);
  const kneeL = mesh(new THREE.SphereGeometry(0.11, 12, 8), '#b7b8b0', [-0.18, 0.64, 0.08], { metalness: 0.72, roughness: 0.18 });
  kneeL.scale.set(1.1, 0.65, 0.8);
  const kneeR = kneeL.clone();
  kneeR.position.x = 0.18;

  hero.add(
    body,
    chestPlate,
    skirt,
    belt,
    helmet,
    visor,
    visorSlit,
    noseGuard,
    neckGuard,
    sword,
    leftShoulder,
    rightShoulder,
    leftArm,
    rightArm,
    leftGauntlet,
    rightGauntlet,
    shield,
    shieldFace,
    shieldMark,
    leftLeg,
    rightLeg,
    leftBoot,
    rightBoot,
    kneeL,
    kneeR
  );
  hero.userData = { cape: skirt, sword, rightArm, leftArm, leftLeg, rightLeg };
  hero.position.set(-3.4, 0, 1.2);
  return hero;
}

function makeMonster(kind: string, index: number) {
  const group = new THREE.Group();
  const isSpider = kind === 'spider';
  const isSawWarrior = kind === 'saw-warrior';
  const isStone = kind === 'stone-brute';
  const isWire = kind === 'wire';
  const isPale = kind === 'pale';
  const isLizardBrute = kind === 'lizard-brute';
  const isGiant = kind === 'giant' || kind === 'cave-titan';
  const usesReferenceBody = true;
  const isOrc = kind === 'orc' || kind === 'magma' || kind === 'avalanche';
  const isCrawler = kind === 'lizard' || kind === 'frost' || isLizardBrute;
  const skinColor = isSpider ? '#d9c882' : isLizardBrute ? '#2f7f3f' : isStone ? '#888883' : isWire ? '#c8b29e' : isPale ? '#b8c5c9' : isGiant ? '#8d8f8c' : isOrc ? '#6f7d35' : isCrawler ? '#8a8f82' : kind === 'shadow' ? '#5c5364' : '#8f958a';
  const dark = kind === 'shadow' ? '#120916' : '#34261d';
  const scale = isStone ? 1.32 : isGiant ? 1.42 : isOrc || isLizardBrute ? 1.2 : isCrawler ? 1.08 : kind === 'shadow' ? 0.98 : 0.94;

  const body = capsule(skinColor, usesReferenceBody ? 0.22 * scale : 0.34 * scale, isOrc ? 1.08 : 0.8, [0, 0.86 * scale, 0]);
  body.scale.set(isSpider ? 1.15 : usesReferenceBody ? 0.72 : isCrawler ? 1.25 : 0.95, isStone ? 1.32 : usesReferenceBody ? 1.05 : isOrc ? 1.18 : 0.98, isSpider ? 1.45 : isCrawler ? 0.82 : 1);
  const belly = mesh(new THREE.SphereGeometry(0.28 * scale, 22, 14), skinColor, [0, 0.82 * scale, 0.18]);
  belly.scale.set(isStone ? 1.45 : isPale ? 1.05 : 1.15, isStone ? 1.25 : isPale ? 1.7 : 1.02, isSpider ? 1.55 : 0.95);
  belly.visible = usesReferenceBody;
  const ribs = new THREE.Group();
  for (let i = 0; i < 4; i += 1) {
    const rib = mesh(new THREE.BoxGeometry(0.34 * scale, 0.018 * scale, 0.025 * scale), '#6f756c', [0, (1.0 + i * 0.08) * scale, 0.34]);
    rib.visible = usesReferenceBody;
    ribs.add(rib);
  }
  const head = mesh(new THREE.SphereGeometry(0.32 * scale, 22, 14), skinColor, [0, 1.64 * scale, 0.08]);
  head.scale.set(isSpider ? 0.58 : usesReferenceBody ? 0.9 : isOrc ? 1.25 : 1.05, isPale ? 0.78 : usesReferenceBody ? 1.16 : isCrawler ? 0.78 : 1, isLizardBrute ? 1.55 : usesReferenceBody ? 1.08 : isCrawler ? 1.35 : 1);
  const brow = mesh(new THREE.BoxGeometry(0.34 * scale, 0.06 * scale, 0.08 * scale), '#747a70', [0, 1.7 * scale, 0.38 * scale]);
  brow.visible = usesReferenceBody;
  const nose = mesh(new THREE.SphereGeometry(0.075 * scale, 10, 8), '#777d73', [0, 1.58 * scale, 0.42 * scale]);
  nose.scale.set(0.8, 1, 1.35);
  nose.visible = usesReferenceBody;
  const snout = cone(skinColor, usesReferenceBody ? 0.09 * scale : 0.18 * scale, usesReferenceBody ? 0.22 * scale : 0.46 * scale, [0, 1.57 * scale, 0.42 * scale]);
  snout.rotation.x = Math.PI / 2;
  snout.visible = !usesReferenceBody;
  const jaw = mesh(new THREE.BoxGeometry(0.36 * scale, 0.08 * scale, 0.08 * scale), '#1b0908', [0, 1.43 * scale, 0.39 * scale]);
  jaw.scale.x = usesReferenceBody ? 0.72 : 1;
  const eyeMat = new THREE.MeshBasicMaterial({ color: kind === 'shadow' ? '#b56cff' : '#ff3b30' });
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

  const earL = cone(skinColor, 0.105 * scale, 0.62 * scale, [-0.34 * scale, 1.63 * scale, 0.02]);
  earL.rotation.z = Math.PI / 2;
  earL.rotation.y = -0.28;
  const earR = earL.clone();
  earR.position.x *= -1;
  earR.rotation.z = -Math.PI / 2;
  earL.visible = !isOrc && !isSpider && !isStone;
  earR.visible = !isOrc && !isSpider && !isStone;

  const armL = capsule(skinColor, 0.055 * scale, 0.82 * scale, [-0.42 * scale, 0.95 * scale, 0.05]);
  armL.rotation.z = -1.05;
  const armR = capsule(skinColor, 0.055 * scale, 0.82 * scale, [0.42 * scale, 0.95 * scale, 0.05]);
  armR.rotation.z = 1.05;
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
  const footL = mesh(new THREE.BoxGeometry(0.24 * scale, 0.09 * scale, 0.34 * scale), skinColor, [-0.21 * scale, -0.08 * scale, 0.14]);
  const footR = mesh(new THREE.BoxGeometry(0.24 * scale, 0.09 * scale, 0.34 * scale), skinColor, [0.2 * scale, -0.08 * scale, 0.18]);
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
  knife.visible = kind === 'goblin';

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

  group.add(body, belly, ribs, head, brow, nose, snout, jaw, eyeL, eyeR, hood, rag, hornL, hornR, earL, earR, armL, armR, handL, handR, legL, legR, footL, footR, club, knife, armor, saw, spiderLegs, rockNubs, wireFrame);
  group.scale.setScalar(0.86 + (index % 4) * 0.09);
  group.userData = { body, head, armL, armR, club, legL, legR, footL, footR, baseY: 0, seed: index * 0.7 };
  return group;
}

function makeDragon(color: string) {
  const dragon = new THREE.Group();
  const bodyMat = material(color, { roughness: 0.46 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 18), bodyMat);
  body.scale.set(1.9, 0.8, 0.8);
  body.position.set(0, 1.65, 0);
  const neck = capsule(color, 0.2, 1, [0.9, 1.85, 0]);
  neck.rotation.z = -0.85;
  const head = mesh(new THREE.SphereGeometry(0.48, 24, 16), color, [1.46, 2.12, 0]);
  head.scale.set(1.15, 0.78, 0.72);
  const snout = cone(color, 0.27, 0.7, [1.9, 2.05, 0]);
  snout.rotation.z = -Math.PI / 2;
  const wingL = mesh(new THREE.CircleGeometry(1, 3), color, [-0.3, 2.35, -0.62], { transparent: true, opacity: 0.72, side: THREE.DoubleSide });
  wingL.scale.set(1.4, 1, 1);
  wingL.rotation.set(0.9, 0.2, -0.78);
  const wingR = wingL.clone();
  wingR.position.z = 0.62;
  wingR.scale.z = -1;
  const fire = new THREE.Mesh(
    new THREE.ConeGeometry(0.34, 1.55, 12),
    new THREE.MeshBasicMaterial({ color: '#ff8a1f', transparent: true, opacity: 0.88 })
  );
  fire.position.set(2.45, 2.02, 0);
  fire.rotation.z = -Math.PI / 2;
  dragon.add(body, neck, head, snout, wingL, wingR, fire);
  dragon.position.set(4.2, 0, -0.5);
  dragon.userData = { bodyMat, wingL, wingR, fire };
  return dragon;
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
    add3DLocation(scene, refs.current.sceneKey, refs.current.chapter, refs.current.locationIndex);

    const hero = makeHero();
    const dragon = makeDragon(refs.current.dragonColor);
    scene.add(hero, dragon);

    const monsters = new THREE.Group();
    for (let i = 0; i < 36; i += 1) {
      const monster = makeMonster(refs.current.monsterKind, i);
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
    let pulse = 0;
    let lastHeroX = refs.current.heroPosition.x / 1000;
    let lastHeroZ = refs.current.heroPosition.z / 1000;
    let heroFacing = 0.25;
    let renderFacing = 0.25;
    const cameraTarget = new THREE.Vector3(0, 3, 10);
    const lookTarget = new THREE.Vector3(0, 1.5, 0);
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
      if (lastPulse !== data.battlePulse) {
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

      hero.position.y = jumpHeight + Math.sin(time * 2.6) * 0.035;
      hero.rotation.y = renderFacing + Math.sin(time * 1.8) * 0.025;
      hero.userData.cape.rotation.y = Math.sin(time * 2.2) * 0.04;
      const walkCycle = data.isHeroMoving ? time * 10 : time * 4;
      const walkPower = data.isHeroMoving ? 0.55 : 0.12;
      hero.userData.leftLeg.rotation.x = Math.sin(walkCycle) * walkPower - jumpHeight * 0.28;
      hero.userData.rightLeg.rotation.x = -Math.sin(walkCycle) * walkPower - jumpHeight * 0.28;
      hero.userData.leftArm.rotation.x = 0;
      hero.userData.rightArm.rotation.x = 0;
      hero.userData.leftArm.rotation.z = -0.42 + Math.sin(time * 5) * 0.08;
      hero.userData.rightArm.rotation.z = 0.58 - Math.sin(time * 5) * 0.08;
      hero.userData.sword.rotation.set(0, 0, -0.08);
      if (data.heroAnimation === 'strike') {
        const attackPhase = THREE.MathUtils.clamp(1 - attackSwing, 0, 1);
        const windup = THREE.MathUtils.smoothstep(attackPhase, 0, 0.28);
        const slash = Math.sin(THREE.MathUtils.clamp((attackPhase - 0.18) / 0.62, 0, 1) * Math.PI);
        const recover = THREE.MathUtils.smoothstep(attackPhase, 0.62, 1);
        const swing = Math.max(windup * (1 - recover), slash);
        const cut = Math.sin(THREE.MathUtils.clamp((attackPhase - 0.22) / 0.42, 0, 1) * Math.PI);
        hero.position.x += Math.sin(renderFacing) * (0.12 + swing * 0.34);
        hero.position.z += Math.cos(renderFacing) * (0.12 + swing * 0.34);
        hero.rotation.x = -swing * 0.12;
        hero.userData.rightArm.rotation.z = 0.78 + windup * 1.1 + cut * 0.65;
        hero.userData.rightArm.rotation.x = -0.35 - windup * 1.15 - cut * 1.25 + recover * 0.55;
        hero.userData.leftArm.rotation.z = -0.5 - swing * 0.38;
        hero.userData.sword.rotation.x = -0.35 - windup * 1.15 - cut * 1.55 + recover * 0.7;
        hero.userData.sword.rotation.z = -0.1 - cut * 1.35 + recover * 0.35;
      } else if (data.heroAnimation === 'step' || data.isHeroMoving) {
        const stride = Math.sin(time * 12);
        hero.position.x += Math.sin(renderFacing) * stride * 0.11;
        hero.position.z += Math.cos(renderFacing) * stride * 0.11;
        hero.rotation.x = Math.sin(time * 12) * 0.045;
      } else if (data.heroAnimation === 'heal') {
        hero.scale.setScalar(1 + Math.sin(time * 10) * 0.03);
      } else {
        hero.rotation.x = 0;
        hero.scale.setScalar(1);
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
        const chaseRange = 10;
        const attackRange = 5;
        const homeX = current.userData.homeX as number;
        const homeZ = current.userData.homeZ as number;
        const targetX = distance <= chaseRange ? heroWorldX : homeX + Math.sin(time * 0.7 + index) * 1.4;
        const targetZ = distance <= chaseRange ? heroWorldZ : homeZ + Math.cos(time * 0.8 + index) * 1.4;
        const moveX = targetX - current.position.x;
        const moveZ = targetZ - current.position.z;
        const moveDistance = Math.max(0.001, Math.hypot(moveX, moveZ));
        const speed = (current.userData.speed as number) * (distance <= chaseRange ? 2.45 : 0.55);

        if (distance > attackRange) {
          current.position.x += (moveX / moveDistance) * speed * delta * 60 + shake * (index % 2 ? 0.012 : -0.012);
          current.position.z += (moveZ / moveDistance) * speed * delta * 60;
          current.userData.attackFlash = Math.max(0, (current.userData.attackFlash as number) - delta * 1.8);
          current.userData.attackCycle = 0;
        } else {
          current.userData.attackCycle = ((current.userData.attackCycle as number) + delta * 1.55) % 1;
          current.userData.attackFlash = Math.min(1, (current.userData.attackFlash as number) + delta * 5);
          current.position.x -= (toHeroX / distance) * 0.018 * Math.sin(time * 14 + index);
          current.position.z -= (toHeroZ / distance) * 0.018 * Math.sin(time * 14 + index);
        }

        const walk = time * (distance <= chaseRange ? 9.6 : 3.4) + index;
        const attack = current.userData.attackFlash as number;
        current.position.y = Math.max(0, Math.sin(walk * 2) * 0.08) + (attack > 0.4 ? Math.sin(time * 22 + index) * 0.06 : 0);
        current.rotation.y = Math.atan2(moveX, moveZ) + Math.PI + Math.sin(walk) * 0.06;
        const attackCycle = current.userData.attackCycle as number;
        const monsterWindup = THREE.MathUtils.smoothstep(attackCycle, 0.05, 0.34);
        const monsterHit = Math.sin(THREE.MathUtils.clamp((attackCycle - 0.28) / 0.36, 0, 1) * Math.PI);
        const monsterRecover = THREE.MathUtils.smoothstep(attackCycle, 0.62, 0.98);
        const monsterSwing = attack * Math.max(monsterHit, monsterWindup * (1 - monsterRecover));
        current.rotation.x = -monsterSwing * 0.18;
        current.userData.armL.rotation.x = Math.sin(walk) * 0.48 - monsterSwing * 1.1;
        current.userData.armR.rotation.x = -Math.sin(walk) * 0.48 - monsterWindup * 1.2 - monsterHit * 1.7 + monsterRecover * 0.9;
        current.userData.armR.rotation.z = 0.85 + Math.sin(walk + 1.2) * 0.2 + monsterSwing * 1.25;
        current.userData.legL.rotation.x = Math.sin(walk) * 0.55;
        current.userData.legR.rotation.x = -Math.sin(walk) * 0.55;
        current.userData.footL.rotation.x = -Math.sin(walk) * 0.25;
        current.userData.footR.rotation.x = Math.sin(walk) * 0.25;
        current.userData.head.rotation.x = monsterSwing * 0.22 + Math.sin(walk * 0.6) * 0.04;
        current.userData.club.rotation.z = attack ? -0.35 - monsterWindup * 0.9 - monsterHit * 1.1 + monsterRecover * 0.8 : Math.sin(walk) * 0.18;
      });

      dragon.visible = !data.isFinalReveal && data.monstersLeft <= 0;
      const dragonData = dragon.userData as { bodyMat: THREE.MeshStandardMaterial; wingL: THREE.Mesh; wingR: THREE.Mesh; fire: THREE.Mesh };
      dragonData.bodyMat.color.set(data.dragonColor);
      dragon.position.y = Math.sin(time * 2) * 0.16;
      dragon.position.x = 4.2 + shake * 1.2;
      dragon.rotation.y = Math.sin(time * 1.1) * 0.12;
      dragonData.wingL.rotation.z = -0.78 + Math.sin(time * 6) * 0.34;
      dragonData.wingR.rotation.z = 0.78 - Math.sin(time * 6) * 0.34;
      dragonData.fire.scale.set(1, 0.75 + burn * 0.65 + Math.sin(time * 14) * 0.12, 1);

      motes.children.forEach((mote) => {
        mote.position.y += 0.012 + Math.sin(time + mote.userData.seed) * 0.003;
        mote.position.x += Math.sin(time * 0.8 + mote.userData.seed) * 0.006;
        if (mote.position.y > 9.6) mote.position.y = 0.5;
      });

      if (data.cameraMode === 'second') {
        camera.position.set(
          hero.position.x - Math.sin(renderFacing) * 2.2 + Math.cos(renderFacing) * 0.45 + shake,
          hero.position.y + 2.2,
          hero.position.z - Math.cos(renderFacing) * 2.2 - Math.sin(renderFacing) * 0.45
        );
        camera.lookAt(
          hero.position.x + Math.sin(renderFacing) * 4,
          hero.position.y + 1.45,
          hero.position.z + Math.cos(renderFacing) * 4
        );
      } else {
        const backDistance = 6.2;
        const sideOffset = 0.85;
        cameraTarget.set(
          hero.position.x - Math.sin(renderFacing) * backDistance + Math.cos(renderFacing) * sideOffset + shake * 0.45,
          hero.position.y + 3.15 + Math.sin(time * 0.6) * 0.08,
          hero.position.z - Math.cos(renderFacing) * backDistance - Math.sin(renderFacing) * sideOffset
        );
        lookTarget.set(
          hero.position.x + Math.sin(renderFacing) * 5.5,
          hero.position.y + 1.55,
          hero.position.z + Math.cos(renderFacing) * 5.5
        );
        camera.position.lerp(cameraTarget, Math.min(1, delta * 12));
        camera.lookAt(lookTarget);
      }

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
