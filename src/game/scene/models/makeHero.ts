import * as THREE from 'three';
import { capsule,material,mesh } from './battleScene3DProps';

export function makeHero() {
  const hero = new THREE.Group();
  const armor = material('#8f9290', { metalness: 0.9, roughness: 0.18 });
  const darkArmor = material('#3d3d3a', { metalness: 0.72, roughness: 0.24 });
  const leather = material('#2b211d', { roughness: 0.82 });
  const skin = material('#b7835f', { roughness: 0.58 });
  const steelDark = material('#55585a', { metalness: 0.86, roughness: 0.2 });
  const steelLight = material('#c7c8c1', { metalness: 0.94, roughness: 0.14 });

  const body = capsule('#8a8d8a', 0.34, 0.82, [0, 1.1, 0]);
  body.scale.set(0.82, 1.18, 0.52);
  body.material = armor;
  const chestPlate = mesh(new THREE.BoxGeometry(0.72, 0.72, 0.18), '#777a78', [0, 1.22, 0.28], { metalness: 0.86, roughness: 0.18 });
  chestPlate.material = steelDark;
  chestPlate.rotation.x = -0.08;
  const chestRidge = mesh(new THREE.BoxGeometry(0.08, 0.74, 0.05), '#c7c8c1', [0, 1.24, 0.42], { metalness: 0.94, roughness: 0.14 });
  const ribL = mesh(new THREE.BoxGeometry(0.24, 0.05, 0.045), '#b7b8b0', [-0.19, 1.34, 0.42], { metalness: 0.82, roughness: 0.16 });
  const ribR = ribL.clone();
  ribR.position.x = 0.19;
  const chainmail = mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.52, 16), '#3d3d3a', [0, 0.82, 0.02], { metalness: 0.6, roughness: 0.36 });
  chainmail.scale.set(0.9, 1, 0.58);
  const skirt = mesh(new THREE.CylinderGeometry(0.38, 0.5, 0.42, 8), '#2b211d', [0, 0.54, 0.02]);
  skirt.material = leather;
  const belt = mesh(new THREE.BoxGeometry(0.76, 0.11, 0.42), '#3a2415', [0, 0.9, 0.03]);
  const beltBuckle = mesh(new THREE.BoxGeometry(0.12, 0.12, 0.045), '#caa76a', [0, 0.91, 0.27], { metalness: 0.65, roughness: 0.22 });
  const helmet = mesh(new THREE.SphereGeometry(0.34, 28, 18), '#8a8d8a', [0, 1.94, 0], { metalness: 0.82, roughness: 0.18 });
  helmet.scale.set(0.78, 1.18, 0.74);
  helmet.material = steelLight;
  const visor = mesh(new THREE.BoxGeometry(0.36, 0.42, 0.08), '#24282b', [0, 1.86, 0.29], { metalness: 0.72, roughness: 0.2 });
  visor.rotation.x = -0.08;
  const visorSlit = mesh(new THREE.BoxGeometry(0.28, 0.035, 0.025), '#050607', [0, 1.98, 0.35]);
  const noseGuard = mesh(new THREE.BoxGeometry(0.055, 0.5, 0.055), '#b7b8b0', [0, 1.79, 0.36], { metalness: 0.8, roughness: 0.16 });
  const helmetBack = mesh(new THREE.BoxGeometry(0.42, 0.44, 0.08), '#777a78', [0, 1.78, -0.26], { metalness: 0.86, roughness: 0.18 });
  helmetBack.rotation.x = 0.22;
  const neckGuard = mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.18, 12), '#55585a', [0, 1.6, 0], { metalness: 0.8, roughness: 0.22 });
  neckGuard.material = steelDark;
  const plume = mesh(new THREE.BoxGeometry(0.1, 0.42, 0.06), '#8f1d1d', [0, 2.32, -0.05], { roughness: 0.7 });
  plume.rotation.x = 0.22;
  const sword = new THREE.Group();
  const blade = mesh(new THREE.BoxGeometry(0.09, 2.25, 0.04), '#dfe5e3', [0, 0.75, 0], {
    metalness: 0.76,
    emissive: '#9fb6bf',
    emissiveIntensity: 0.18,
  });
  const bladeTip = mesh(new THREE.ConeGeometry(0.075, 0.26, 12), '#dfe5e3', [0, 1.99, 0], { metalness: 0.76, roughness: 0.18 });
  bladeTip.rotation.z = Math.PI;
  const guard = mesh(new THREE.BoxGeometry(0.62, 0.08, 0.09), '#8a5b38', [0, -0.42, 0], { metalness: 0.3, roughness: 0.42 });
  const pommel = mesh(new THREE.SphereGeometry(0.085, 12, 8), '#8a5b38', [0, -0.82, 0], { metalness: 0.34, roughness: 0.38 });
  sword.add(blade, bladeTip, guard, pommel);
  sword.position.set(0.72, 0.68, 0.18);
  sword.rotation.set(0.12, 0, -1.34);

  const leftShoulder = mesh(new THREE.SphereGeometry(0.24, 18, 10), '#8a8d8a', [-0.48, 1.5, 0.02], { metalness: 0.85, roughness: 0.16 });
  leftShoulder.scale.set(1.42, 0.62, 0.92);
  const rightShoulder = leftShoulder.clone();
  rightShoulder.position.x = 0.46;
  const leftArm = capsule('#8a8d8a', 0.082, 0.72, [-0.5, 1.1, 0.02]);
  leftArm.material = skin;
  leftArm.rotation.z = -0.55;
  const rightArm = capsule('#8a8d8a', 0.082, 0.78, [0.52, 1.17, 0.02]);
  rightArm.material = skin;
  rightArm.rotation.z = -1.18;
  rightArm.rotation.x = -0.18;
  const leftElbow = mesh(new THREE.SphereGeometry(0.09, 12, 8), '#b7b8b0', [-0.58, 0.93, 0.08], { metalness: 0.8, roughness: 0.18 });
  const rightElbow = leftElbow.clone();
  rightElbow.position.set(0.72, 1.02, 0.1);
  const leftGauntlet = capsule('#3a3a38', 0.078, 0.36, [-0.62, 0.76, 0.07]);
  leftGauntlet.material = darkArmor;
  const rightGauntlet = capsule('#3a3a38', 0.075, 0.32, [0.88, 1.12, 0.12]);
  rightGauntlet.material = darkArmor;
  const pointingHand = mesh(new THREE.SphereGeometry(0.08, 12, 8), '#3a3a38', [1.04, 1.1, 0.16], { metalness: 0.72, roughness: 0.22 });
  pointingHand.scale.set(1.05, 0.82, 0.72);
  const pointingFinger = capsule('#3a3a38', 0.014, 0.22, [1.16, 1.1, 0.18]);
  pointingFinger.material = darkArmor;
  pointingFinger.rotation.z = Math.PI / 2;
  const leftHand = mesh(new THREE.SphereGeometry(0.07, 12, 8), '#3a3a38', [-0.7, 0.65, 0.08], { metalness: 0.72, roughness: 0.22 });
  leftHand.scale.set(1, 0.8, 0.7);

  const leftLeg = capsule('#8a8d8a', 0.105, 0.78, [-0.18, 0.32, -0.08]);
  leftLeg.material = armor;
  const rightLeg = capsule('#8a8d8a', 0.105, 0.78, [0.18, 0.32, 0.08]);
  rightLeg.material = armor;
  const thighL = mesh(new THREE.CapsuleGeometry(0.11, 0.42, 8, 12), '#777a78', [-0.2, 0.56, -0.02], { metalness: 0.78, roughness: 0.2 });
  thighL.material = steelDark;
  thighL.rotation.x = 0.08;
  const thighR = thighL.clone();
  thighR.position.x = 0.2;
  thighR.position.z = 0.08;
  const leftBoot = mesh(new THREE.BoxGeometry(0.28, 0.16, 0.46), '#2c241f', [-0.2, -0.05, 0.08]);
  leftBoot.rotation.x = -0.06;
  const rightBoot = mesh(new THREE.BoxGeometry(0.28, 0.16, 0.46), '#2c241f', [0.2, -0.05, 0.18]);
  rightBoot.rotation.x = -0.06;
  const kneeL = mesh(new THREE.SphereGeometry(0.11, 12, 8), '#b7b8b0', [-0.18, 0.64, 0.08], { metalness: 0.72, roughness: 0.18 });
  kneeL.scale.set(1.1, 0.65, 0.8);
  const kneeR = kneeL.clone();
  kneeR.position.x = 0.18;
  const cape = mesh(new THREE.BoxGeometry(0.86, 1.22, 0.08), '#491414', [0, 0.95, -0.32], { roughness: 0.82 });
  cape.rotation.x = 0.16;

  hero.add(
    cape,
    body,
    chestPlate,
    chestRidge,
    ribL,
    ribR,
    chainmail,
    skirt,
    belt,
    beltBuckle,
    helmet,
    visor,
    visorSlit,
    noseGuard,
    helmetBack,
    neckGuard,
    plume,
    sword,
    leftShoulder,
    rightShoulder,
    leftArm,
    rightArm,
    leftElbow,
    rightElbow,
    leftGauntlet,
    rightGauntlet,
    pointingHand,
    pointingFinger,
    leftHand,
    thighL,
    thighR,
    leftLeg,
    rightLeg,
    leftBoot,
    rightBoot,
    kneeL,
    kneeR
  );
  hero.userData = {
    cape,
    sword,
    rightArm,
    leftArm,
    leftLeg,
    rightLeg,
    leftShoulder,
    rightShoulder,
    leftGauntlet,
    rightGauntlet,
    leftBoot,
    rightBoot,
    plume,
    head: helmet,
  };
  hero.position.set(-3.4, 0, 1.2);
  return hero;
}
