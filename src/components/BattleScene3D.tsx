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

function makeBox(color: string, size: [number, number, number], position: [number, number, number]) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size[0], size[1], size[2]),
    new THREE.MeshStandardMaterial({ color, roughness: 0.62 })
  );
  mesh.position.set(position[0], position[1], position[2]);
  return mesh;
}

export function BattleScene3D({ dragonColor, heroAnimation, isFinalReveal, burn, heroPosition, monstersLeft, battlePulse, cameraMode, monsterKind, viewDistance }: BattleScene3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef(heroAnimation);
  const dragonColorRef = useRef(dragonColor);
  const burnRef = useRef(burn);
  const heroPositionRef = useRef(heroPosition);
  const monstersLeftRef = useRef(monstersLeft);
  const battlePulseRef = useRef(battlePulse);
  const cameraModeRef = useRef(cameraMode);
  const monsterKindRef = useRef(monsterKind);
  const viewDistanceRef = useRef(viewDistance);

  useEffect(() => {
    animationRef.current = heroAnimation;
  }, [heroAnimation]);

  useEffect(() => {
    dragonColorRef.current = dragonColor;
  }, [dragonColor]);

  useEffect(() => {
    burnRef.current = burn;
  }, [burn]);

  useEffect(() => {
    heroPositionRef.current = heroPosition;
  }, [heroPosition]);

  useEffect(() => {
    monstersLeftRef.current = monstersLeft;
  }, [monstersLeft]);

  useEffect(() => {
    battlePulseRef.current = battlePulse;
  }, [battlePulse]);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  useEffect(() => {
    monsterKindRef.current = monsterKind;
  }, [monsterKind]);

  useEffect(() => {
    viewDistanceRef.current = viewDistance;
  }, [viewDistance]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const container = mount;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#211634');
    scene.fog = new THREE.Fog('#211634', 220, 19000);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 24000);
    camera.position.set(0, 5.4, 12);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.domElement.className = 'battle-canvas';
    container.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight('#ffdca8', '#20142d', 2.6);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight('#fff2b8', 2.4);
    sun.position.set(-5, 9, 6);
    sun.castShadow = true;
    scene.add(sun);

    const fireLight = new THREE.PointLight('#ff6b2b', 8, 18);
    fireLight.position.set(0, 1.5, -4);
    scene.add(fireLight);

    const ground = new THREE.Mesh(
      new THREE.CylinderGeometry(16_000, 19_000, 0.5, 96),
      new THREE.MeshStandardMaterial({ color: '#50312f', roughness: 0.9 })
    );
    ground.position.y = -0.25;
    ground.receiveShadow = true;
    scene.add(ground);

    const city = new THREE.Group();
    Array.from({ length: 28 }).forEach((_, index) => {
      const x = -12_500 + (index % 14) * 1_900;
      const z = -6_400 - Math.floor(index / 14) * 1_450;
      const tower = makeBox('#8a5a44', [900, 1.4 + (index % 5) * 0.42, 900], [x, 0.7, z]);
      tower.userData.baseY = tower.position.y;
      tower.userData.wave = index * 0.55;
      tower.castShadow = true;
      city.add(tower);
    });
    scene.add(city);

    const ashGroup = new THREE.Group();
    const ashMaterial = new THREE.MeshBasicMaterial({ color: '#ffd166', transparent: true, opacity: 0.7 });
    for (let i = 0; i < 90; i += 1) {
      const ash = new THREE.Mesh(new THREE.SphereGeometry(0.025 + (i % 3) * 0.01, 8, 6), ashMaterial);
      ash.position.set(-7 + Math.random() * 14, 0.8 + Math.random() * 5, -5 + Math.random() * 8);
      ash.userData.seed = Math.random() * 10;
      ashGroup.add(ash);
    }
    scene.add(ashGroup);

    const flameGroup = new THREE.Group();
    for (let i = 0; i < 34; i += 1) {
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.24, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: i % 2 ? '#ff9f1c' : '#d00000', emissive: '#ff4d00', emissiveIntensity: 1.4 })
      );
      flame.position.set(-13_000 + i * 800, 0.5, -3_150 - (i % 4) * 420);
      flame.rotation.z = (i % 2 ? 1 : -1) * 0.12;
      flameGroup.add(flame);
    }
    scene.add(flameGroup);

    const hero = new THREE.Group();
    const armorMaterial = new THREE.MeshStandardMaterial({ color: '#6f7f95', metalness: 0.72, roughness: 0.24 });
    const blueArmorMaterial = new THREE.MeshStandardMaterial({ color: '#2f80ed', metalness: 0.45, roughness: 0.28 });
    const goldMaterial = new THREE.MeshStandardMaterial({ color: '#ffd166', metalness: 0.68, roughness: 0.22 });
    const clothMaterial = new THREE.MeshStandardMaterial({ color: '#d00000', roughness: 0.72 });
    const skinMaterial = new THREE.MeshStandardMaterial({ color: '#ffd6a5', roughness: 0.5 });
    const heroBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.86, 8, 18), blueArmorMaterial);
    heroBody.position.set(-3.1, 1.08, 0);
    heroBody.scale.set(0.82, 1, 0.58);
    const chestPlate = makeBox('#b8c1d1', [0.62, 0.72, 0.12], [-3.1, 1.2, 0.27]);
    chestPlate.material = armorMaterial;
    const belt = makeBox('#3a2415', [0.72, 0.12, 0.5], [-3.1, 0.78, 0]);
    const heroHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 24, 16),
      skinMaterial
    );
    heroHead.position.set(-3.1, 1.9, 0);
    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.39, 24, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({ color: '#626f86', metalness: 0.55, roughness: 0.25 })
    );
    helmet.position.set(-3.1, 2.02, 0);
    const visor = makeBox('#202a36', [0.38, 0.1, 0.08], [-3.1, 2.0, 0.33]);
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.44, 0.06), goldMaterial);
    crest.position.set(-3.1, 2.35, 0);
    crest.rotation.z = 0.08;
    const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.45, 3, 5), clothMaterial);
    cape.position.set(-3.55, 1.08, 0.16);
    cape.rotation.y = 0.25;
    const shoulderLeft = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 10), armorMaterial);
    shoulderLeft.scale.set(1.1, 0.55, 0.8);
    shoulderLeft.position.set(-3.56, 1.55, 0);
    const shoulderRight = shoulderLeft.clone();
    shoulderRight.position.x = -2.63;
    const armLeft = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.72, 6, 12), armorMaterial);
    armLeft.position.set(-3.52, 1.2, 0);
    armLeft.rotation.z = -0.35;
    const armRight = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.78, 6, 12), armorMaterial);
    armRight.position.set(-2.65, 1.28, 0);
    armRight.rotation.z = 0.85;
    const legLeft = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.72, 6, 12), armorMaterial);
    legLeft.position.set(-3.28, 0.36, -0.12);
    legLeft.rotation.z = 0.12;
    const legRight = legLeft.clone();
    legRight.position.set(-2.94, 0.36, 0.12);
    legRight.rotation.z = -0.12;
    const bootLeft = makeBox('#191923', [0.34, 0.16, 0.22], [-3.28, -0.03, -0.12]);
    const bootRight = makeBox('#191923', [0.34, 0.16, 0.22], [-2.94, -0.03, 0.12]);
    const shield = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.42, 0.1, 5),
      new THREE.MeshStandardMaterial({ color: '#264653', metalness: 0.45, roughness: 0.32 })
    );
    shield.position.set(-3.76, 1.16, 0.14);
    shield.rotation.set(Math.PI / 2, 0, 0.18);
    const shieldGem = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 8),
      new THREE.MeshStandardMaterial({ color: '#ffd166', emissive: '#ffd166', emissiveIntensity: 0.25, metalness: 0.4, roughness: 0.2 })
    );
    shieldGem.position.set(-3.76, 1.16, 0.22);

    const sword = new THREE.Group();
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.65, 0.035),
      new THREE.MeshStandardMaterial({ color: '#d7fbff', emissive: '#73d2de', emissiveIntensity: 0.75, metalness: 0.7, roughness: 0.18 })
    );
    blade.position.y = 0.52;
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.07, 0.22, 4),
      new THREE.MeshStandardMaterial({ color: '#f4feff', emissive: '#73d2de', emissiveIntensity: 0.7, metalness: 0.75, roughness: 0.12 })
    );
    tip.position.y = 1.46;
    tip.rotation.y = Math.PI / 4;
    const guard = makeBox('#ffd166', [0.58, 0.08, 0.08], [0, -0.36, 0]);
    const grip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.42, 12),
      new THREE.MeshStandardMaterial({ color: '#3a2415', roughness: 0.5 })
    );
    grip.position.y = -0.62;
    const pommel = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 14, 10),
      new THREE.MeshStandardMaterial({ color: '#ffd166', metalness: 0.6, roughness: 0.2 })
    );
    pommel.position.y = -0.88;
    sword.add(blade, tip, guard, grip, pommel);
    sword.position.set(-2.42, 1.45, 0);
    sword.rotation.z = -0.72;
    const swordGlow = new THREE.PointLight('#73d2de', 2.6, 4);
    swordGlow.position.set(-2.2, 1.8, 0);
    hero.add(
      heroBody,
      chestPlate,
      belt,
      heroHead,
      helmet,
      visor,
      crest,
      cape,
      shoulderLeft,
      shoulderRight,
      armLeft,
      armRight,
      legLeft,
      legRight,
      bootLeft,
      bootRight,
      shield,
      shieldGem,
      sword,
      swordGlow
    );
    scene.add(hero);

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.75, 32),
      new THREE.MeshBasicMaterial({ color: '#12091a', transparent: true, opacity: 0.34 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(-3.1, 0.02, 0);
    scene.add(shadow);

    const monsters = new THREE.Group();
    const monsterMaterials = {
      goblin: new THREE.MeshStandardMaterial({ color: '#4cc94c', roughness: 0.74 }),
      orc: new THREE.MeshStandardMaterial({ color: '#2d6a4f', roughness: 0.8 }),
      lizard: new THREE.MeshStandardMaterial({ color: '#5dd39e', roughness: 0.58 }),
      dwarf: new THREE.MeshStandardMaterial({ color: '#b5651d', roughness: 0.68 }),
      shadow: new THREE.MeshStandardMaterial({ color: '#3c096c', roughness: 0.82 }),
      magma: new THREE.MeshStandardMaterial({ color: '#d00000', emissive: '#ff6b2b', emissiveIntensity: 0.35, roughness: 0.55 }),
      frost: new THREE.MeshStandardMaterial({ color: '#8ecae6', emissive: '#caf0f8', emissiveIntensity: 0.25, roughness: 0.38 }),
    };
    const monsterMaterial = monsterMaterials.goblin;
    for (let i = 0; i < 24; i += 1) {
      const monster = new THREE.Group();
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.7, 7), monsterMaterial);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), monsterMaterial);
      head.position.y = 0.45;
      const earLeft = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.42, 12), monsterMaterial);
      earLeft.position.set(-0.2, 0.47, 0);
      earLeft.rotation.z = Math.PI / 2;
      const earRight = earLeft.clone();
      earRight.position.x = 0.2;
      earRight.rotation.z = -Math.PI / 2;
      const eyeLeft = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: '#f8e58c' }));
      eyeLeft.position.set(-0.07, 0.5, 0.15);
      const eyeRight = eyeLeft.clone();
      eyeRight.position.x = 0.07;
      const mouth = makeBox('#2b1111', [0.16, 0.035, 0.025], [0, 0.4, 0.17]);
      const cloth = makeBox('#7a441f', [0.34, 0.16, 0.22], [0, -0.08, 0.01]);
      const shield = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.42, 0.3),
        new THREE.MeshStandardMaterial({ color: '#5c3b20', roughness: 0.84 })
      );
      shield.position.set(-0.28, 0.08, 0.04);
      shield.rotation.z = -0.18;
      const weapon = makeBox('#2b1d12', [0.06, 0.46, 0.06], [0.23, 0.25, 0]);
      weapon.rotation.z = -0.55;
      monster.add(body, head, earLeft, earRight, eyeLeft, eyeRight, mouth, cloth, shield, weapon);
      monster.position.set(-1.5 + (i % 8) * 0.55, 0.35, -1.4 + Math.floor(i / 8) * 0.55);
      monster.userData.baseX = monster.position.x;
      monster.userData.body = body;
      monster.userData.head = head;
      monster.userData.earLeft = earLeft;
      monster.userData.earRight = earRight;
      monster.userData.eyeLeft = eyeLeft;
      monster.userData.eyeRight = eyeRight;
      monster.userData.mouth = mouth;
      monster.userData.cloth = cloth;
      monster.userData.shield = shield;
      monster.userData.weapon = weapon;
      monsters.add(monster);
    }
    scene.add(monsters);

    const lootGroup = new THREE.Group();
    const lootMaterials = ['#7b8794', '#2fbf71', '#2f80ed', '#8338ec', '#ffd166'].map(
      (color) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.32, roughness: 0.35 })
    );
    for (let i = 0; i < 12; i += 1) {
      const loot = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), lootMaterials[i % lootMaterials.length]);
      loot.position.set(-2.2 + (i % 6) * 0.55, 0.6, 1.6 + Math.floor(i / 6) * 0.45);
      loot.userData.baseY = loot.position.y;
      loot.userData.seed = i * 0.7;
      lootGroup.add(loot);
    }
    scene.add(lootGroup);

    const healRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.035, 12, 48),
      new THREE.MeshBasicMaterial({ color: '#2fbf71', transparent: true, opacity: 0 })
    );
    healRing.position.set(-3.1, 1.1, 0);
    healRing.rotation.x = Math.PI / 2;
    scene.add(healRing);

    const dragon = new THREE.Group();
    const dragonMaterial = new THREE.MeshStandardMaterial({ color: dragonColorRef.current, roughness: 0.48 });
    const darkDragonMaterial = new THREE.MeshStandardMaterial({ color: '#221223', roughness: 0.58 });
    const hornMaterial = new THREE.MeshStandardMaterial({ color: '#f7e7b4', roughness: 0.34 });
    const wingMembraneMaterial = new THREE.MeshStandardMaterial({ color: dragonColorRef.current, transparent: true, opacity: 0.72, roughness: 0.7, side: THREE.DoubleSide });
    const dragonBody = new THREE.Mesh(new THREE.SphereGeometry(0.88, 32, 18), dragonMaterial);
    dragonBody.scale.set(1.7, 0.78, 0.72);
    dragonBody.position.set(3.2, 1.75, 0);
    const dragonChest = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 14), darkDragonMaterial);
    dragonChest.scale.set(0.8, 0.62, 0.68);
    dragonChest.position.set(3.95, 1.68, 0);
    const dragonNeck = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 1.05, 8, 16), dragonMaterial);
    dragonNeck.position.set(4.25, 1.95, 0);
    dragonNeck.rotation.z = -1.05;
    const dragonHead = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), dragonMaterial);
    dragonHead.scale.set(1.12, 0.78, 0.72);
    dragonHead.position.set(4.78, 2.18, 0);
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.7, 18), dragonMaterial);
    snout.position.set(5.23, 2.12, 0);
    snout.rotation.z = -Math.PI / 2;
    const hornLeft = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.46, 10), hornMaterial);
    hornLeft.position.set(4.58, 2.55, -0.2);
    hornLeft.rotation.z = 0.65;
    const hornRight = hornLeft.clone();
    hornRight.position.z = 0.2;
    const eyeLeft = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshBasicMaterial({ color: '#fff275' }));
    eyeLeft.position.set(5.12, 2.26, -0.22);
    const eyeRight = eyeLeft.clone();
    eyeRight.position.z = 0.22;
    const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 1.95, 8, 16), dragonMaterial);
    tail.position.set(1.82, 1.72, 0);
    tail.rotation.z = 1.32;
    const tailSpike = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 8), hornMaterial);
    tailSpike.position.set(0.86, 1.58, 0);
    tailSpike.rotation.z = 1.45;
    const legMaterial = darkDragonMaterial;
    const legs = new THREE.Group();
    [
      [2.7, 1.0, -0.45],
      [3.7, 1.0, -0.42],
      [2.7, 1.0, 0.45],
      [3.7, 1.0, 0.42],
    ].forEach((position, index) => {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.72, 6, 12), legMaterial);
      leg.position.set(position[0], position[1], position[2]);
      leg.rotation.z = index % 2 ? -0.16 : 0.16;
      legs.add(leg);
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 8), hornMaterial);
      claw.position.set(position[0] + 0.08, 0.58, position[2]);
      claw.rotation.z = -Math.PI / 2;
      legs.add(claw);
    });
    const wingBoneGeometry = new THREE.CapsuleGeometry(0.045, 1.7, 5, 10);
    const wingLeft = new THREE.Group();
    const wingLeftBone = new THREE.Mesh(wingBoneGeometry, darkDragonMaterial);
    wingLeftBone.rotation.z = -0.9;
    const wingLeftFinger = new THREE.Mesh(wingBoneGeometry, darkDragonMaterial);
    wingLeftFinger.position.set(-0.38, 0.14, -0.14);
    wingLeftFinger.rotation.z = -1.32;
    const wingLeftMembrane = new THREE.Mesh(new THREE.CircleGeometry(1.0, 3), wingMembraneMaterial);
    wingLeftMembrane.scale.set(1.25, 0.95, 1);
    wingLeftMembrane.position.set(-0.42, -0.16, -0.12);
    wingLeftMembrane.rotation.set(0.9, 0.25, -0.72);
    wingLeft.add(wingLeftMembrane, wingLeftBone, wingLeftFinger);
    wingLeft.position.set(2.7, 2.4, -0.65);
    const wingRight = wingLeft.clone();
    wingRight.position.z = 0.65;
    wingRight.scale.z = -1;
    const dragonFire = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 1.8, 16),
      new THREE.MeshBasicMaterial({ color: '#ff9f1c', transparent: true, opacity: 0.9 })
    );
    dragonFire.position.set(5.72, 2.08, 0);
    dragonFire.rotation.z = -Math.PI / 2;
    dragon.add(
      dragonBody,
      dragonChest,
      dragonNeck,
      dragonHead,
      snout,
      hornLeft,
      hornRight,
      eyeLeft,
      eyeRight,
      tail,
      tailSpike,
      legs,
      wingLeft,
      wingRight,
      dragonFire
    );
    scene.add(dragon);

    const clock = new THREE.Clock();
    let frameId = 0;
    let lastPulse = battlePulseRef.current;
    let pulseTime = 0;

    function resize() {
      const width = container.clientWidth || 640;
      const height = container.clientHeight || 520;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function animate() {
      const time = clock.getElapsedTime();
      const mode = animationRef.current;
      const fireScale = Math.max(0.2, burnRef.current / 100);
      const sceneHeroX = heroPositionRef.current.x / 1000;
      const sceneHeroZ = heroPositionRef.current.z / 1000;
      const view = viewDistanceRef.current;
      camera.far = view;
      camera.fov = cameraModeRef.current === 'second' ? 58 : 42 + Math.min(18, view / 900);
      camera.updateProjectionMatrix();
      scene.fog = new THREE.Fog('#211634', Math.max(20, view * 0.16), view);
      if (battlePulseRef.current !== lastPulse) {
        lastPulse = battlePulseRef.current;
        pulseTime = 0.45;
      }
      pulseTime = Math.max(0, pulseTime - clock.getDelta());
      const hitShake = pulseTime > 0 ? Math.sin(pulseTime * 70) * pulseTime : 0;

      dragonMaterial.color.set(dragonColorRef.current);
      wingMembraneMaterial.color.set(dragonColorRef.current);
      dragon.visible = !isFinalReveal;
      fireLight.intensity = 3 + fireScale * 7 + Math.sin(time * 8) * 0.6;
      flameGroup.children.forEach((flame, index) => {
        flame.scale.y = fireScale * (0.8 + Math.sin(time * 5 + index) * 0.22);
        flame.rotation.y = Math.sin(time * 2 + index) * 0.35;
      });

      city.children.forEach((tower) => {
        tower.position.y = tower.userData.baseY + Math.sin(time * 0.9 + tower.userData.wave) * 0.035;
        tower.rotation.z = Math.sin(time * 0.6 + tower.userData.wave) * 0.006;
      });

      ashGroup.children.forEach((ash) => {
        ash.position.y += 0.015 + Math.sin(time + ash.userData.seed) * 0.004;
        ash.position.x += Math.sin(time * 0.8 + ash.userData.seed) * 0.01;
        if (ash.position.y > 6.3) ash.position.y = 0.7;
      });

      hero.position.y = Math.sin(time * 2.4) * 0.06;
      hero.position.x = sceneHeroX;
      hero.position.z = sceneHeroZ;
      hero.rotation.y = Math.sin(time * 1.6) * 0.04;
      cape.rotation.x = Math.sin(time * 2.2) * 0.05;
      cape.rotation.z = Math.sin(time * 1.4) * 0.08;
      armLeft.rotation.x = Math.sin(time * 3) * 0.12;
      legLeft.rotation.x = Math.sin(time * 2.5) * 0.08;
      legRight.rotation.x = -Math.sin(time * 2.5) * 0.08;
      sword.rotation.z = -0.72;
      healRing.material.opacity = 0;
      healRing.position.x = -3.1 + sceneHeroX;
      healRing.position.z = sceneHeroZ;
      shadow.position.x = sceneHeroX - 3.1;
      shadow.position.z = sceneHeroZ;
      shadow.scale.setScalar(1 + Math.sin(time * 2.4) * 0.08);

      const visibleMonsterCount = Math.ceil((monstersLeftRef.current / 100) * monsters.children.length);
      const kind = monsterKindRef.current;
      const selectedMonsterMaterial = monsterMaterials[kind as keyof typeof monsterMaterials] ?? monsterMaterials.goblin;
      monsters.children.forEach((monster, index) => {
        monster.visible = index < visibleMonsterCount;
        const body = monster.userData.body as THREE.Mesh;
        const head = monster.userData.head as THREE.Mesh;
        const weapon = monster.userData.weapon as THREE.Mesh;
        const earLeft = monster.userData.earLeft as THREE.Mesh;
        const earRight = monster.userData.earRight as THREE.Mesh;
        const eyeLeft = monster.userData.eyeLeft as THREE.Mesh;
        const eyeRight = monster.userData.eyeRight as THREE.Mesh;
        const mouth = monster.userData.mouth as THREE.Mesh;
        const cloth = monster.userData.cloth as THREE.Mesh;
        const shield = monster.userData.shield as THREE.Mesh;
        body.material = selectedMonsterMaterial;
        head.material = selectedMonsterMaterial;
        earLeft.material = selectedMonsterMaterial;
        earRight.material = selectedMonsterMaterial;
        body.scale.set(1, 1, 1);
        head.scale.set(1, 1, 1);
        earLeft.visible = kind === 'goblin';
        earRight.visible = kind === 'goblin';
        eyeLeft.visible = kind === 'goblin';
        eyeRight.visible = kind === 'goblin';
        mouth.visible = kind === 'goblin';
        cloth.visible = kind === 'goblin';
        shield.visible = kind === 'goblin';
        weapon.visible = true;
        if (kind === 'goblin') {
          body.scale.set(0.78, 1.12, 0.62);
          head.scale.set(1.42, 1.05, 1.22);
          earLeft.scale.set(1.3, 0.82, 1);
          earRight.scale.set(1.3, 0.82, 1);
          earLeft.rotation.y = Math.sin(time * 4 + index) * 0.18;
          earRight.rotation.y = -Math.sin(time * 4 + index) * 0.18;
          weapon.rotation.z = -0.95 + Math.sin(time * 7 + index) * 0.12;
          shield.rotation.z = -0.18 + Math.sin(time * 5 + index) * 0.08;
        }
        if (kind === 'orc') {
          body.scale.set(1.35, 1.45, 1.25);
          head.scale.set(1.18, 1.18, 1.18);
        } else if (kind === 'lizard') {
          body.scale.set(0.8, 1.2, 1.8);
          head.scale.set(0.9, 0.75, 1.45);
        } else if (kind === 'dwarf') {
          body.scale.set(1.25, 0.72, 1.25);
          head.scale.set(1.24, 1.0, 1.24);
        } else if (kind === 'shadow') {
          body.scale.set(0.7, 1.55, 0.7);
          weapon.visible = false;
        } else if (kind === 'magma') {
          body.scale.set(1.1, 1.25, 1.1);
        } else if (kind === 'frost') {
          body.scale.set(0.95, 1.35, 0.95);
        }
        const attackHop = Math.max(0, Math.sin(time * 3.4 + index)) * 0.22;
        monster.position.y = 0.35 + Math.sin(time * 5 + index) * 0.08 + attackHop;
        monster.position.x = monster.userData.baseX + hitShake * (index % 2 ? 0.22 : -0.22) + Math.sin(time * 2 + index) * 0.05;
        monster.rotation.y += 0.035;
      });

      lootGroup.children.forEach((loot) => {
        loot.position.y = loot.userData.baseY + Math.sin(time * 2.5 + loot.userData.seed) * 0.22;
        loot.rotation.x += 0.025;
        loot.rotation.y += 0.04;
      });

      if (mode === 'strike') {
        hero.position.x += Math.sin(time * 18) * 0.18 + 0.35;
        hero.position.y += Math.abs(Math.sin(time * 18)) * 0.22;
        armRight.rotation.z = 1.25 + Math.sin(time * 28) * 0.35;
        sword.rotation.z = -1.9 + Math.sin(time * 28) * 0.25;
        sword.rotation.y = Math.sin(time * 28) * 0.6;
        swordGlow.intensity = 5;
      } else if (mode === 'step') {
        hero.position.x += Math.sin(time * 12) * 0.35 + 0.25;
        hero.rotation.z = Math.sin(time * 14) * 0.06;
        hero.rotation.y = Math.sin(time * 12) * 0.18;
        armRight.rotation.z = 0.85 + Math.sin(time * 12) * 0.18;
      } else if (mode === 'heal') {
        healRing.material.opacity = 0.75 + Math.sin(time * 12) * 0.18;
        healRing.scale.setScalar(1 + Math.sin(time * 8) * 0.16);
        swordGlow.intensity = 5.4;
      } else {
        swordGlow.intensity = 2.6;
      }

      dragon.position.y = Math.sin(time * 2.1) * 0.24;
      dragon.position.x = hitShake * 1.4;
      dragon.rotation.z = hitShake * 0.25;
      dragon.rotation.y = Math.sin(time * 1.3) * 0.08;
      dragonNeck.rotation.z = -1.05 + Math.sin(time * 2.2) * 0.08;
      tail.rotation.z = 1.32 + Math.sin(time * 2.4) * 0.16;
      wingLeft.rotation.z = -0.28 + Math.sin(time * 6) * 0.28;
      wingRight.rotation.z = 0.28 - Math.sin(time * 6) * 0.28;
      dragonFire.scale.x = 0.8 + Math.sin(time * 11) * 0.18;
      dragonFire.scale.y = 1 + Math.sin(time * 18) * 0.12;

      if (cameraModeRef.current === 'second') {
        camera.position.set(4.8 + hitShake * 0.35, 2.8, 1.2);
        camera.lookAt(sceneHeroX - 3.1, 1.3, sceneHeroZ);
      } else {
        camera.position.x = sceneHeroX * 0.18 + Math.sin(time * 0.35) * 0.5 + hitShake * 0.35;
        camera.position.z = 12 + sceneHeroZ * 0.15;
        camera.lookAt(sceneHeroX * 0.25, 1.25, sceneHeroZ - 0.4);
      }
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
          else material.dispose();
        }
      });
    };
  }, [isFinalReveal]);

  return <div className="battle-3d" ref={mountRef} />;
}
