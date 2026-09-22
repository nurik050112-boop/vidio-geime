import * as THREE from 'three';
import { addCapturedCity } from './addCapturedCity';
import { addPillar,cityThemes,cone,hashSceneKey,makeTorch,mesh,worldDiameterMeters } from './battleScene3DProps';

function addVillageTown(root: THREE.Object3D, accent: string, glow: string) {
  const road = mesh(new THREE.PlaneGeometry(12, 92), '#8a6a4a', [0, 0.008, 0], { roughness: 1 });
  road.rotation.x = -Math.PI / 2;
  const crossroad = mesh(new THREE.PlaneGeometry(92, 9), '#8a6a4a', [0, 0.012, -2], { roughness: 1 });
  crossroad.rotation.x = -Math.PI / 2;
  root.add(road, crossroad);

  const housePositions: Array<[number, number]> = [
    [-27, -25], [27, -25], [-27, 20], [27, 20], [-40, -4], [40, -4],
  ];
  housePositions.forEach(([x, z], index) => {
    const bodyColor = index % 2 ? '#8c6b50' : '#a27b59';
    const body = mesh(new THREE.BoxGeometry(7, 3.2, 5.4), bodyColor, [x, 1.65, z]);
    const roof = mesh(new THREE.ConeGeometry(4.7, 2.4, 4), index % 2 ? '#49362e' : '#5a3d2f', [x, 4.45, z]);
    roof.rotation.y = Math.PI / 4;
    const chimney = mesh(new THREE.BoxGeometry(0.65, 1.5, 0.65), '#59443b', [x + 1.45, 5.15, z - 0.55]);
    const window = mesh(new THREE.BoxGeometry(1.1, 0.95, 0.08), glow, [x, 2.05, z + 2.73], { emissive: glow, emissiveIntensity: 0.65, roughness: 0.35 });
    const porch = mesh(new THREE.BoxGeometry(2.1, 0.22, 1.45), '#6b4934', [x, 0.36, z + 3.1]);
    const door = mesh(new THREE.BoxGeometry(0.85, 1.65, 0.08), '#3d2a25', [x + 0.1, 1.15, z + 2.74]);
    root.add(body, roof, chimney, window, porch, door);
  });

  for (let index = 0; index < 18; index += 1) {
    const x = -44 + (index % 9) * 11;
    const z = index < 9 ? -38 : 32;
    const post = mesh(new THREE.CylinderGeometry(0.09, 0.12, 1.15, 6), '#4b3326', [x, 0.58, z]);
    const rail = mesh(new THREE.BoxGeometry(1.8, 0.1, 0.1), '#5e402d', [x + 0.9, 0.72, z]);
    rail.rotation.y = 0.12;
    root.add(post, rail);
  }

  const well = new THREE.Group();
  const wellBase = mesh(new THREE.CylinderGeometry(1.25, 1.45, 0.8, 12), '#71665a', [0, 0.4, -2]);
  const wellWater = mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.04, 16), '#315e69', [0, 0.83, -2], { metalness: 0.1, roughness: 0.2 });
  const wellRoof = mesh(new THREE.BoxGeometry(2.8, 0.16, 0.16), '#563b2b', [0, 2.7, -2]);
  wellRoof.rotation.z = 0.35;
  well.add(wellBase, wellWater, wellRoof);
  root.add(well);

  [-8, 8].forEach((x) => root.add(makeTorch(x, 5)));
  const treePositions: Array<[number, number]> = [[-45, -25], [45, -25], [-45, 22], [45, 22]];
  treePositions.forEach(([x, z]) => {
    const trunk = mesh(new THREE.CylinderGeometry(0.24, 0.38, 2.8, 8), '#4a3022', [x, 1.4, z]);
    const crown = cone('#3f6b42', 2.1, 4.2, [x, 4.3, z]);
    root.add(trunk, crown);
  });

  const sign = mesh(new THREE.BoxGeometry(3.5, 1.1, 0.12), accent, [0, 2.05, 8], { roughness: 0.62 });
  root.add(sign);
}

export function add3DLocation(scene: THREE.Scene, root: THREE.Object3D, sceneKey: string, chapter: number, locationIndex: number, captured = false) {
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
    addVillageTown(root, palette.accent, palette.glow);
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
