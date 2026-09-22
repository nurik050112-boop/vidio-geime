import * as THREE from 'three';
import { cone,makeTorch,material,mesh,worldDiameterMeters,worldRadiusMeters } from './battleScene3DProps';

export function addCaveCity(scene: THREE.Scene) {
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
