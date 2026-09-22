import * as THREE from 'three';
import { mesh } from './battleScene3DProps';

export function makeHeroArtifact() {
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

export function makeEquippedHeroWeapon() {
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
