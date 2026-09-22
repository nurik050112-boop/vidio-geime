import * as THREE from 'three';
import { addPillar,cone,material,mesh } from './battleScene3DProps';

export function addCapturedCity(root: THREE.Object3D, palette: { accent: string; glow: string }) {
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
