import * as THREE from 'three';
import { capsule,cone,mesh } from './battleScene3DProps';

export function makeMonster(kind: string, index: number) {
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
  const skinColor = isGoblin ? ['#6f8f3a', '#789f42', '#587a32', '#8aa34e'][goblinVariant] : isSpider ? '#d9c882' : isLizardBrute ? '#2f7f3f' : isStone ? '#888883' : isWire ? '#c8b29e' : isPale ? '#b8c5c9' : isGiant ? '#8d8f8c' : isOrc ? '#6f7d35' : isCrawler ? '#8a8f82' : kind === 'shadow' ? '#5c5364' : '#8f958a';
  const dark = kind === 'shadow' ? '#120916' : '#34261d';
  const scale = isGoblin ? 1.02 : isStone ? 1.32 : isGiant ? 1.42 : isOrc || isLizardBrute ? 1.2 : isCrawler ? 1.08 : kind === 'shadow' ? 0.98 : 0.94;

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
  const footL = mesh(new THREE.BoxGeometry(0.24 * scale, 0.09 * scale, 0.34 * scale), skinColor, [-0.21 * scale, 0.035 * scale, 0.14]);
  const footR = mesh(new THREE.BoxGeometry(0.24 * scale, 0.09 * scale, 0.34 * scale), skinColor, [0.2 * scale, 0.035 * scale, 0.18]);
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
  const mohawk = new THREE.Group();
  for (let i = 0; i < 5; i += 1) {
    const spike = cone('#293017', 0.035 * scale, 0.22 * scale, [0, (1.88 + i * 0.02) * scale, (-0.2 + i * 0.08) * scale]);
    spike.rotation.x = -0.45;
    mohawk.add(spike);
  }
  const bootL = mesh(new THREE.BoxGeometry(0.3 * scale, 0.1 * scale, 0.38 * scale), '#2f2519', [-0.21 * scale, 0.07 * scale, 0.15]);
  const bootR = bootL.clone();
  bootR.position.x = 0.2 * scale;
  bootR.position.z = 0.19;
  goblinDetails.add(loincloth, backCloth, pecL, pecR, shoulderMuscleL, shoulderMuscleR, bicepL, bicepR, calfL, calfR, kneeL, kneeR, collar, clothTears, ribsMark, goblinClub, goblinShield, mohawk, bootL, bootR);
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
  group.userData = {
    body,
    head,
    jaw,
    earL,
    earR,
    armL,
    armR,
    club,
    knife,
    goblinClub,
    legL,
    legR,
    footL,
    footR,
    saw,
    spiderLegs,
    spiderFace,
    spiderAbdomen,
    rockNubs,
    wireFrame,
    wireGlow,
    armor,
    orcAxe,
    giantDetails,
    paleDetails,
    lizardTail,
    backSpikes,
    baseY: isGoblin ? 0.18 : 0.08,
    seed: index * 0.7,
    kind,
    isGoblin,
    isSpider,
    isStone,
    isWire,
    isPale,
    isGiant,
    isOrc,
    isLizardBrute,
    isSawWarrior,
    isCrawler,
    goblinVariant,
  };
  return group;
}
