import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type BattleScene3DProps = {
  dragonColor: string;
  heroAnimation: 'idle' | 'strike' | 'step' | 'heal';
  isFinalReveal: boolean;
  burn: number;
  heroPosition: { x: number; z: number };
  monstersLeft: number;
  battlePulse: number;
  cameraMode: 'third' | 'second';
  monsterKind: string;
  viewDistance: number;
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

function addCaveCity(scene: THREE.Scene) {
  const floor = mesh(new THREE.CircleGeometry(34, 96), '#29241f', [0, -0.04, 0]);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const water = mesh(new THREE.PlaneGeometry(7, 23, 1, 1), '#143e44', [-8.5, 0.01, -2], {
    transparent: true,
    opacity: 0.72,
    metalness: 0.18,
    roughness: 0.24,
  });
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  const backWall = mesh(new THREE.TorusGeometry(14, 2.3, 18, 72, Math.PI * 1.25), '#302b25', [0, 7.6, -18]);
  backWall.rotation.z = Math.PI * 0.88;
  backWall.scale.set(1.25, 1, 0.55);
  scene.add(backWall);

  for (let i = 0; i < 38; i += 1) {
    const angle = (i / 38) * Math.PI * 2;
    const radius = 18 + (i % 5) * 2.3;
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

  for (let i = 0; i < 19; i += 1) {
    const stalactite = cone('#24211d', 0.55 + (i % 4) * 0.15, 3.8 + (i % 5), [-14 + i * 1.55, 9.5, -14 - (i % 3) * 2.4]);
    stalactite.rotation.x = Math.PI;
    scene.add(stalactite);
  }

  for (let i = 0; i < 20; i += 1) {
    const house = new THREE.Group();
    const x = -12 + (i % 10) * 2.7;
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

  [-12, -6, 0, 6, 12].forEach((x, index) => {
    const cage = mesh(new THREE.BoxGeometry(1.1, 1.6, 0.22), '#4a2f20', [x, 1, -15.8]);
    cage.rotation.y = index % 2 ? 0.18 : -0.12;
    scene.add(cage);
  });

  [-12, -6, 0, 6, 12, 15].forEach((x, index) => {
    scene.add(makeTorch(x, -7 - (index % 2) * 4));
  });
}

function makeHero() {
  const hero = new THREE.Group();
  const armor = material('#8a8d8a', { metalness: 0.78, roughness: 0.2 });
  const darkArmor = material('#3a3a38', { metalness: 0.62, roughness: 0.28 });
  const blueCloth = material('#1f3769', { roughness: 0.72 });
  const redCloth = material('#8f1f1f', { roughness: 0.82, side: THREE.DoubleSide });
  const gold = material('#ffd166', { metalness: 0.45, roughness: 0.26, emissive: '#6b3b00', emissiveIntensity: 0.18 });

  const body = capsule('#8a8d8a', 0.34, 0.82, [0, 1.1, 0]);
  body.scale.set(0.95, 1.08, 0.62);
  body.material = armor;
  const tunic = mesh(new THREE.BoxGeometry(0.56, 0.82, 0.13), '#1f3769', [0, 1.04, 0.31]);
  tunic.material = blueCloth;
  const lion = mesh(new THREE.BoxGeometry(0.22, 0.32, 0.035), '#ffd166', [0.02, 1.13, 0.39]);
  lion.material = gold;
  const belt = mesh(new THREE.BoxGeometry(0.72, 0.12, 0.46), '#3a2415', [0, 0.82, 0.03]);
  const helmet = mesh(new THREE.SphereGeometry(0.36, 24, 14), '#8a8d8a', [0, 1.92, 0], { metalness: 0.82, roughness: 0.18 });
  helmet.scale.set(0.86, 1.12, 0.82);
  const visor = mesh(new THREE.BoxGeometry(0.34, 0.34, 0.08), '#24282b', [0, 1.88, 0.3], { metalness: 0.72, roughness: 0.2 });
  const visorSlit = mesh(new THREE.BoxGeometry(0.28, 0.035, 0.02), '#050607', [0, 1.94, 0.35]);
  const noseGuard = mesh(new THREE.BoxGeometry(0.055, 0.36, 0.055), '#b7b8b0', [0, 1.84, 0.36], { metalness: 0.8, roughness: 0.16 });
  const plumeBase = mesh(new THREE.SphereGeometry(0.08, 12, 8), '#d8d0bf', [0, 2.3, -0.03], { roughness: 0.6 });
  const plume = new THREE.Group();
  for (let i = 0; i < 9; i += 1) {
    const hair = mesh(new THREE.CapsuleGeometry(0.018, 0.62 - i * 0.025, 5, 8), '#d8d0bf', [0.04 + i * 0.035, 2.28 - i * 0.025, -0.12 - i * 0.015], { roughness: 0.7 });
    hair.rotation.z = -1.16 - i * 0.08;
    hair.rotation.y = -0.25;
    plume.add(hair);
  }
  const capeShape = new THREE.Shape();
  capeShape.moveTo(-0.42, 0.64);
  capeShape.lineTo(0.42, 0.54);
  capeShape.lineTo(0.58, -0.38);
  capeShape.lineTo(0.28, -0.25);
  capeShape.lineTo(0.08, -0.58);
  capeShape.lineTo(-0.12, -0.28);
  capeShape.lineTo(-0.42, -0.54);
  capeShape.lineTo(-0.5, 0.2);
  capeShape.lineTo(-0.42, 0.64);
  const cape = new THREE.Mesh(new THREE.ShapeGeometry(capeShape), redCloth);
  cape.position.set(-0.38, 1.08, -0.34);
  cape.rotation.y = 0.44;
  cape.rotation.z = -0.08;
  cape.castShadow = true;
  cape.receiveShadow = true;
  const sword = new THREE.Group();
  const blade = mesh(new THREE.BoxGeometry(0.08, 1.6, 0.04), '#e7fbff', [0, 0.45, 0], {
    metalness: 0.76,
    emissive: '#73d2de',
    emissiveIntensity: 0.7,
  });
  const guard = mesh(new THREE.BoxGeometry(0.54, 0.08, 0.08), '#ffd166', [0, -0.34, 0]);
  guard.material = gold;
  const pommel = mesh(new THREE.SphereGeometry(0.08, 12, 8), '#ffd166', [0, -0.67, 0]);
  pommel.material = gold;
  sword.add(blade, guard, pommel);
  sword.position.set(0.7, 1.22, 0.2);
  sword.rotation.z = -0.36;

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

  const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.11, 5), armor);
  shield.position.set(-0.68, 1.12, 0.28);
  shield.rotation.set(Math.PI / 2, 0, 0.22);
  shield.castShadow = true;
  shield.receiveShadow = true;
  const shieldFace = mesh(new THREE.BoxGeometry(0.18, 0.28, 0.03), '#1f3769', [-0.68, 1.12, 0.36]);
  shieldFace.material = blueCloth;
  const shieldMark = mesh(new THREE.BoxGeometry(0.08, 0.16, 0.02), '#ffd166', [-0.68, 1.12, 0.39]);
  shieldMark.material = gold;

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
    tunic,
    lion,
    belt,
    helmet,
    visor,
    visorSlit,
    noseGuard,
    plumeBase,
    plume,
    cape,
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
  hero.userData = { cape, sword, rightArm, leftArm, leftLeg, rightLeg };
  hero.position.set(-3.4, 0, 1.2);
  return hero;
}

function makeMonster(kind: string, index: number) {
  const group = new THREE.Group();
  const usesReferenceBody = true;
  const isOrc = kind === 'orc' || kind === 'magma' || kind === 'avalanche';
  const isCrawler = kind === 'lizard' || kind === 'frost';
  const skinColor = isOrc ? '#7d8475' : isCrawler ? '#8a8f82' : kind === 'shadow' ? '#5c5364' : kind === 'magma' ? '#8a766b' : kind === 'frost' ? '#a3aaa6' : '#8f958a';
  const dark = kind === 'shadow' ? '#120916' : '#34261d';
  const scale = isOrc ? 1.2 : isCrawler ? 1.08 : kind === 'shadow' ? 0.98 : 0.94;

  const body = capsule(skinColor, usesReferenceBody ? 0.22 * scale : 0.34 * scale, isOrc ? 1.08 : 0.8, [0, 0.86 * scale, 0]);
  body.scale.set(usesReferenceBody ? 0.72 : isCrawler ? 1.25 : 0.95, usesReferenceBody ? 1.05 : isOrc ? 1.18 : 0.98, isCrawler ? 0.82 : 1);
  const belly = mesh(new THREE.SphereGeometry(0.28 * scale, 22, 14), skinColor, [0, 0.82 * scale, 0.18]);
  belly.scale.set(1.15, 1.02, 0.95);
  belly.visible = usesReferenceBody;
  const ribs = new THREE.Group();
  for (let i = 0; i < 4; i += 1) {
    const rib = mesh(new THREE.BoxGeometry(0.34 * scale, 0.018 * scale, 0.025 * scale), '#6f756c', [0, (1.0 + i * 0.08) * scale, 0.34]);
    rib.visible = usesReferenceBody;
    ribs.add(rib);
  }
  const head = mesh(new THREE.SphereGeometry(0.32 * scale, 22, 14), skinColor, [0, 1.64 * scale, 0.08]);
  head.scale.set(usesReferenceBody ? 0.9 : isOrc ? 1.25 : 1.05, usesReferenceBody ? 1.16 : isCrawler ? 0.78 : 1, usesReferenceBody ? 1.08 : isCrawler ? 1.35 : 1);
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
  const rag = mesh(new THREE.BoxGeometry(0.76 * scale, 0.38 * scale, 0.16 * scale), '#65412e', [0, 0.8 * scale, 0.34 * scale]);
  rag.scale.set(0.7, 0.8, 1);

  const hornL = cone('#d9c39b', 0.075 * scale, 0.54 * scale, [-0.28 * scale, 1.93 * scale, 0]);
  hornL.rotation.z = 0.72;
  const hornR = hornL.clone();
  hornR.position.x *= -1;
  hornR.rotation.z = -0.72;
  hornL.visible = isOrc;
  hornR.visible = isOrc;

  const earL = cone(skinColor, 0.105 * scale, 0.62 * scale, [-0.34 * scale, 1.63 * scale, 0.02]);
  earL.rotation.z = Math.PI / 2;
  earL.rotation.y = -0.28;
  const earR = earL.clone();
  earR.position.x *= -1;
  earR.rotation.z = -Math.PI / 2;
  earL.visible = !isOrc;
  earR.visible = !isOrc;

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

  group.add(body, belly, ribs, head, brow, nose, snout, jaw, eyeL, eyeR, hood, rag, hornL, hornR, earL, earR, armL, armR, handL, handR, legL, legR, footL, footR, club);
  group.scale.setScalar(0.86 + (index % 4) * 0.09);
  group.userData = { body, head, armL, armR, club, legL, legR, baseY: 0, seed: index * 0.7 };
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

    const hero = makeHero();
    const dragon = makeDragon(refs.current.dragonColor);
    scene.add(hero, dragon);

    const monsters = new THREE.Group();
    for (let i = 0; i < 18; i += 1) {
      const monster = makeMonster(refs.current.monsterKind, i);
      monster.position.set(-1.3 + (i % 6) * 1.15, 0, -1.8 - Math.floor(i / 6) * 1.05);
      monster.rotation.y = Math.PI + Math.sin(i) * 0.35;
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
      }
      pulse = Math.max(0, pulse - delta);
      const shake = pulse ? Math.sin(pulse * 76) * pulse : 0;
      const heroX = data.heroPosition.x / 1000;
      const heroZ = data.heroPosition.z / 1000;
      const burn = Math.max(0.18, data.burn / 100);

      scene.fog = new THREE.Fog('#081111', Math.max(9, data.viewDistance * 0.015), Math.max(34, data.viewDistance * 0.08));
      scene.traverse((object) => {
        if (object instanceof THREE.PointLight) object.intensity = 2.2 + burn * 2.8 + Math.sin(time * 8 + object.position.x) * 0.35;
        if (object.userData.flame instanceof THREE.Mesh) object.userData.flame.scale.y = 0.8 + burn * 0.5 + Math.sin(time * 9 + object.position.x) * 0.18;
      });

      hero.position.x = -3.4 + heroX;
      hero.position.z = 1.2 + heroZ;
      hero.position.y = Math.sin(time * 2.6) * 0.05;
      hero.rotation.y = 0.25 + Math.sin(time * 1.8) * 0.05;
      hero.userData.cape.rotation.x = Math.sin(time * 2.2) * 0.08;
      hero.userData.leftLeg.rotation.x = Math.sin(time * 4) * 0.14;
      hero.userData.rightLeg.rotation.x = -Math.sin(time * 4) * 0.14;
      hero.userData.sword.rotation.z = -0.78;
      if (data.heroAnimation === 'strike') {
        hero.position.x += 0.45 + Math.sin(time * 18) * 0.18;
        hero.userData.rightArm.rotation.z = 1.2 + Math.sin(time * 24) * 0.45;
        hero.userData.sword.rotation.z = -1.75 + Math.sin(time * 26) * 0.3;
      } else if (data.heroAnimation === 'step') {
        hero.position.x += Math.sin(time * 12) * 0.32;
      } else if (data.heroAnimation === 'heal') {
        hero.scale.setScalar(1 + Math.sin(time * 10) * 0.03);
      } else {
        hero.scale.setScalar(1);
      }

      const visibleCount = Math.ceil((data.monstersLeft / 100) * monsters.children.length);
      monsters.children.forEach((monster, index) => {
        const current = monster as THREE.Group;
        current.visible = index < visibleCount;
        current.position.y = Math.max(0, Math.sin(time * 4.5 + index) * 0.08) + (index % 3 === 0 ? Math.max(0, Math.sin(time * 2.4 + index)) * 0.18 : 0);
        current.position.x += Math.sin(time * 2 + index) * 0.002 + shake * (index % 2 ? 0.018 : -0.018);
        current.rotation.y = Math.PI + Math.sin(time * 1.6 + index) * 0.28;
        current.userData.armR.rotation.z = 0.85 + Math.sin(time * 6 + index) * 0.18;
        current.userData.club.rotation.z = Math.sin(time * 5 + index) * 0.18;
      });

      dragon.visible = !data.isFinalReveal;
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
        camera.position.set(2.1 + heroX + shake, 2.4, 4.2 + heroZ);
        camera.lookAt(hero.position.x + 0.5, 1.3, hero.position.z - 1.4);
      } else {
        camera.position.set(heroX * 0.22 + shake, 4.1 + Math.sin(time * 0.6) * 0.18, 10 + heroZ * 0.16);
        camera.lookAt(heroX * 0.2, 1.45, -2.2 + heroZ * 0.12);
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
