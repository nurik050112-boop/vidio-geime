import * as THREE from 'three';
import { capsule,cone,material,mesh } from './battleScene3DProps';

export function makeAvalancheDragon(index: number) {
  const dragon = new THREE.Group();
  const colors = ['#dc2626', '#f97316', '#7c3aed', '#0f766e', '#334155'];
  const color = colors[index % colors.length];
  const dragonMaterial = material(color, { roughness: 0.5, metalness: 0.12 });
  const body = mesh(new THREE.SphereGeometry(0.72, 10, 7), color, [0, 0, 0]);
  body.material = dragonMaterial;
  body.scale.set(1.7, 0.72, 0.82);
  const head = mesh(new THREE.SphereGeometry(0.42, 10, 7), color, [1.22, 0.18, 0]);
  head.material = dragonMaterial;
  const snout = mesh(new THREE.ConeGeometry(0.3, 0.68, 8), color, [1.72, 0.08, 0]);
  snout.material = dragonMaterial;
  snout.rotation.z = -Math.PI / 2;
  const wingMaterial = material(color, { emissive: color, emissiveIntensity: 0.16, side: THREE.DoubleSide });
  const wingGeometry = new THREE.ConeGeometry(0.72, 2.3, 3);
  const wingLeft = new THREE.Mesh(wingGeometry, wingMaterial);
  wingLeft.position.set(-0.1, 0.5, 0.72);
  wingLeft.rotation.set(Math.PI / 2, 0, -0.55);
  const wingRight = wingLeft.clone();
  wingRight.position.z = -0.72;
  wingRight.rotation.x = -Math.PI / 2;
  const tail = mesh(new THREE.ConeGeometry(0.3, 2.4, 8), color, [-1.85, 0, 0]);
  tail.material = dragonMaterial;
  tail.rotation.z = Math.PI / 2;
  const fire = mesh(new THREE.ConeGeometry(0.22, 1.2, 8), '#ffb703', [2.35, 0.06, 0]);
  fire.rotation.z = -Math.PI / 2;
  dragon.add(body, head, snout, wingLeft, wingRight, tail, fire);
  return dragon;
}

export function makeNightKingFallback() {
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
