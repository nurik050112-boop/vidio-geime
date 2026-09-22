import * as THREE from 'three';

export type BattleScene3DProps = {
  paused: boolean;
  onReady: (ready: boolean) => void;
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
  worldObstacles: Array<{ x: number; z: number; halfX: number; halfZ: number }>;
  equippedArtifactIcon: string | null;
  equippedWeaponStyle: number;
  hasArcaneWeapon: boolean;
  arcaneSpellKind: number;
  arcanePulse: number;
  arcaneBurstPulse: number;
  onBossMagicHit: (spell: string) => void;
};

export const monsterRunSpeedMetersPerSecond = 18 / 3.6;

export const monsterHitRangeMeters = 5;

export const monsterPressureRangeMeters = 12;

export const monsterAggroRangeMeters = 100;

export const arcaneProjectileSpeedMetersPerSecond = 100 / 3.6;

export const arcaneAttackRadiusMeters = 70;

export const worldRadiusMeters = 5_000;

export const worldDiameterMeters = worldRadiusMeters * 2;

export const loadDetailedMapProps = true;

export function material(color: string, options: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.02, ...options });
}

export function mesh(geometry: THREE.BufferGeometry, color: string, position: [number, number, number], options: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const item = new THREE.Mesh(geometry, material(color, options));
  item.position.set(...position);
  item.castShadow = true;
  item.receiveShadow = true;
  return item;
}

export function capsule(color: string, radius: number, length: number, position: [number, number, number]) {
  return mesh(new THREE.CapsuleGeometry(radius, length, 8, 16), color, position);
}

export function cone(color: string, radius: number, height: number, position: [number, number, number]) {
  return mesh(new THREE.ConeGeometry(radius, height, 12), color, position);
}

export function makeTorch(x: number, z: number) {
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

export const cityThemes = [
  { sky: '#14221d', fog: '#14221d', ground: '#2e4026', accent: '#7b4b2a', glow: '#ff9f1c' },
  { sky: '#1b120f', fog: '#1b120f', ground: '#33261f', accent: '#d00000', glow: '#ff3b30' },
  { sky: '#111926', fog: '#111926', ground: '#263241', accent: '#8ecae6', glow: '#73d2de' },
  { sky: '#0d0b14', fog: '#0d0b14', ground: '#2d2436', accent: '#8338ec', glow: '#b56cff' },
  { sky: '#051f28', fog: '#051f28', ground: '#153d46', accent: '#06d6a0', glow: '#75e6da' },
];

export function hashSceneKey(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 997;
  }
  return hash;
}

export function smoothAngle(current: number, target: number, delta: number, speed: number) {
  const turn = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + turn * (1 - Math.exp(-delta * speed));
}

export function addPillar(scene: THREE.Object3D, x: number, z: number, color: string, glow: string) {
  const pillar = new THREE.Group();
  const base = mesh(new THREE.CylinderGeometry(0.62, 0.78, 2.4, 8), color, [x, 1.16, z], { roughness: 0.72 });
  const spike = cone(color, 0.7, 1.9, [x, 3.28, z]);
  const rune = mesh(new THREE.BoxGeometry(0.12, 0.9, 0.06), glow, [x, 2.18, z + 0.64], { emissive: glow, emissiveIntensity: 1.2 });
  const light = new THREE.PointLight(glow, 1.8, 10);
  light.position.set(x, 2.6, z);
  pillar.add(base, spike, rune, light);
  scene.add(pillar);
}
