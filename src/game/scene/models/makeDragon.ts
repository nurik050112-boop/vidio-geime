import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { capsule,cone,material,mesh } from './battleScene3DProps';

export function makeDragon(color: string) {
  {
  const dragon = new THREE.Group();
  const fallback = new THREE.Group();
  const darkScale = 1.82;
  const bodyMat = material('#0b0707', { metalness: 0.18, roughness: 0.34, emissive: '#260500', emissiveIntensity: 0.18 });
  const frostEye = new THREE.MeshBasicMaterial({ color: '#ff1f05' });
  const body = capsule('#15100e', 0.5 * darkScale, 1.8 * darkScale, [0, 1.55 * darkScale, 0]);
  body.material = bodyMat;
  body.scale.set(1.95, 0.98, 0.92);
  const neck = capsule('#15100e', 0.18 * darkScale, 1.0 * darkScale, [0.82 * darkScale, 2.02 * darkScale, 0]);
  neck.material = bodyMat;
  neck.rotation.z = -0.62;
  const head = mesh(new THREE.SphereGeometry(0.34 * darkScale, 22, 14), '#15100e', [1.42 * darkScale, 2.38 * darkScale, 0]);
  head.material = bodyMat;
  head.scale.set(1.35, 0.82, 0.72);
  const jaw = mesh(new THREE.BoxGeometry(0.52 * darkScale, 0.12 * darkScale, 0.14 * darkScale), '#2b1510', [1.68 * darkScale, 2.22 * darkScale, 0]);
  jaw.scale.set(1.18, 1.15, 1.12);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04 * darkScale, 8, 6), frostEye);
  eyeL.position.set(1.6 * darkScale, 2.44 * darkScale, 0.24 * darkScale);
  const eyeR = eyeL.clone();
  eyeR.position.z *= -1;
  const eyeGlowL = new THREE.PointLight('#ff2200', 1.35, 6);
  eyeGlowL.position.copy(eyeL.position);
  const eyeGlowR = eyeGlowL.clone();
  eyeGlowR.position.copy(eyeR.position);
  const wingL = new THREE.Group();
  const wingR = new THREE.Group();
  const makeWing = (side: 1 | -1) => {
    const wing = side === 1 ? wingL : wingR;
    const membrane = new THREE.Mesh(
      new THREE.CircleGeometry(1.25 * darkScale, 4),
      new THREE.MeshStandardMaterial({ color: '#130908', emissive: '#260000', emissiveIntensity: 0.28, side: THREE.DoubleSide, transparent: true, opacity: 0.86, roughness: 0.44 })
    );
    membrane.position.set(-0.35 * darkScale, 2.25 * darkScale, side * 0.8 * darkScale);
    membrane.rotation.set(0.8, side * 0.42, side * -0.78);
    membrane.scale.set(1.62, 0.9, 1);
    wing.add(membrane);
  };
  makeWing(1);
  makeWing(-1);
  const tail = new THREE.Group();
  for (let i = 0; i < 5; i += 1) {
    const segment = capsule('#15100e', (0.18 - i * 0.022) * darkScale, 0.48 * darkScale, [(-0.72 - i * 0.36) * darkScale, (1.08 - i * 0.06) * darkScale, Math.sin(i) * 0.18 * darkScale]);
    segment.material = bodyMat;
    segment.rotation.z = 1.12 - i * 0.12;
    tail.add(segment);
  }
  const spines = new THREE.Group();
  for (let i = 0; i < 11; i += 1) {
    const spine = cone('#f2d08a', Math.max(0.035, 0.078 - i * 0.004) * darkScale, Math.max(0.18, 0.42 - i * 0.014) * darkScale, [(1.02 - i * 0.31) * darkScale, (2.38 - i * 0.105) * darkScale, 0]);
    spine.rotation.z = -0.28 + i * 0.015;
    spines.add(spine);
  }
  const fire = new THREE.Mesh(
    new THREE.ConeGeometry(0.42 * darkScale, 2.15 * darkScale, 16),
    new THREE.MeshBasicMaterial({ color: '#ff3d00', transparent: true, opacity: 0.9, depthWrite: false })
  );
  fire.position.set(2.05 * darkScale, 2.28 * darkScale, 0);
  fire.rotation.z = -Math.PI / 2;
  const aura = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 48),
    new THREE.MeshBasicMaterial({ color: '#b51600', transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide })
  );
  aura.rotation.x = -Math.PI / 2;
  aura.position.set(0.05 * darkScale, 0.035, 0);
  fallback.add(body, neck, head, jaw, eyeL, eyeR, eyeGlowL, eyeGlowR, wingL, wingR, tail, spines, fire, aura);
  dragon.add(fallback);

  const loadedFire = new THREE.Mesh(
    new THREE.ConeGeometry(0.62, 4.8, 22),
    new THREE.MeshBasicMaterial({ color: '#ff2d00', transparent: true, opacity: 0, depthWrite: false })
  );
  loadedFire.position.set(2.8, 3.5, 0);
  loadedFire.rotation.z = Math.PI / 2;
  loadedFire.visible = false;
  dragon.add(loadedFire);

  const crest = new THREE.Group();
  for (let index = 0; index < 10; index += 1) {
    const horn = cone(index % 2 ? '#8f2d1c' : '#e3c17c', 0.13 + index * 0.018, 0.65 + index * 0.08, [
      -1.25 + index * 0.42,
      5.15 + Math.sin(index * 0.7) * 0.34,
      0,
    ]);
    horn.rotation.z = -0.18 + index * 0.055;
    crest.add(horn);
  }
  dragon.add(crest);

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    '/models/animated-dragon/dragon.glb',
    (gltf) => {
      fallback.visible = false;
      const model = gltf.scene;
      model.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
          if (object.material instanceof THREE.MeshStandardMaterial) {
            object.material = object.material.clone();
            object.material.color.lerp(new THREE.Color('#120808'), 0.34);
            object.material.emissive = new THREE.Color('#260300');
            object.material.emissiveIntensity = 0.16;
            object.material.roughness = Math.min(0.62, object.material.roughness + 0.08);
          }
        }
      });
      // The dragon's snout is on its local +X side. Keep the downloaded
      // model aligned with the fallback dragon, so both face the target.
      model.rotation.y = 0;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      model.position.y += size.y / 2;
      model.scale.setScalar(size.y > 0 ? 9.2 / size.y : 1);
      dragon.add(model);
      dragon.userData.loadedModel = model;
      dragon.userData.loadedBaseScale = size.y > 0 ? 9.2 / size.y : 1;
      if (gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        const actions: Record<string, THREE.AnimationAction> = {};
        gltf.animations.forEach((clip) => {
          actions[clip.name] = mixer.clipAction(clip);
        });
        dragon.userData.loadedMixer = mixer;
        dragon.userData.loadedActions = actions;
        dragon.userData.activeLoadedAction = '';
      }
    },
    undefined,
    () => {
      fallback.visible = true;
    }
  );

  const loadedAura = new THREE.Mesh(
    new THREE.CircleGeometry(4.4, 64),
    new THREE.MeshBasicMaterial({ color: '#c01600', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
  );
  loadedAura.rotation.x = -Math.PI / 2;
  loadedAura.position.set(0, 0.04, 0);
  dragon.add(loadedAura);

  dragon.position.set(4.75, 0, -0.5);
  dragon.userData = { bodyMat, body, head, neck, wingL, wingR, fire, loadedFire, loadedAura, aura, jaw, tail, spines, crest };
  return dragon;
  }

  const dragon = new THREE.Group();
  const bodyMat = material(color, { metalness: 0.05, roughness: 0.42 });
  const bellyMat = material('#d7c5a5', { roughness: 0.5 });
  const hornMat = material('#d8d0bc', { metalness: 0.1, roughness: 0.28 });
  const clawMat = material('#27231f', { metalness: 0.18, roughness: 0.32 });
  const membraneMat = material(color, { transparent: true, opacity: 0.58, side: THREE.DoubleSide, roughness: 0.36 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.92, 32, 20), bodyMat);
  body.scale.set(1.45, 1.18, 0.86);
  body.position.set(0, 1.36, 0);
  body.castShadow = true;
  body.receiveShadow = true;
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.54, 24, 14), bellyMat);
  belly.scale.set(0.72, 1.25, 0.32);
  belly.position.set(0.22, 1.26, 0.55);
  belly.castShadow = true;
  const chestPlate = mesh(new THREE.BoxGeometry(0.58, 0.12, 0.05), '#b8a98e', [0.34, 1.62, 0.86]);
  chestPlate.rotation.x = -0.28;

  const neck = capsule(color, 0.22, 1.18, [0.9, 1.84, 0.08]);
  neck.rotation.z = -0.72;
  neck.rotation.y = -0.08;
  const head = mesh(new THREE.SphereGeometry(0.44, 28, 16), color, [1.62, 2.16, 0.1]);
  head.scale.set(1.15, 0.82, 0.72);
  const snout = cone(color, 0.25, 0.78, [2.06, 2.1, 0.1]);
  snout.rotation.z = -Math.PI / 2;
  snout.scale.y = 0.78;
  const jaw = mesh(new THREE.BoxGeometry(0.42, 0.12, 0.16), '#31241d', [1.95, 1.93, 0.1]);
  jaw.rotation.z = -0.12;
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#ffd166' });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), eyeMat);
  eyeL.position.set(1.77, 2.24, 0.38);
  const eyeR = eyeL.clone();
  eyeR.position.z = -0.18;

  const hornL = cone('#d8d0bc', 0.075, 0.88, [1.38, 2.55, 0.28]);
  hornL.material = hornMat;
  hornL.rotation.z = -0.45;
  hornL.rotation.x = 0.42;
  const hornR = hornL.clone();
  hornR.position.z = -0.08;
  hornR.rotation.x = -0.42;
  const browL = cone(color, 0.08, 0.42, [1.84, 2.3, 0.34]);
  browL.rotation.z = -1.1;
  browL.rotation.x = 0.35;
  const browR = browL.clone();
  browR.position.z = -0.14;
  browR.rotation.x = -0.35;

  const spines = new THREE.Group();
  for (let i = 0; i < 7; i += 1) {
    const spine = cone('#d8d0bc', 0.06 - i * 0.004, 0.34 - i * 0.018, [1.26 - i * 0.36, 2.35 - i * 0.12, 0]);
    spine.material = hornMat;
    spine.rotation.z = -0.25 + i * 0.05;
    spines.add(spine);
  }

  const makeWing = (side: 1 | -1) => {
    const wing = new THREE.Group();
    const root = [0.0, 1.95, side * 0.48] as [number, number, number];
    const upper = capsule('#d8d0bc', 0.035, 1.6, [root[0] - 0.42, root[1] + 0.44, root[2] + side * 0.52]);
    upper.material = hornMat;
    upper.rotation.set(0.25, side * 0.3, side * 0.92);
    const outer = capsule('#d8d0bc', 0.03, 1.5, [root[0] - 0.98, root[1] + 0.1, root[2] + side * 1.02]);
    outer.material = hornMat;
    outer.rotation.set(-0.18, side * 0.18, side * 1.24);
    const membrane = new THREE.Mesh(new THREE.CircleGeometry(1, 4), membraneMat);
    membrane.position.set(root[0] - 0.68, root[1] + 0.18, root[2] + side * 0.75);
    membrane.scale.set(1.25, 0.7, 1);
    membrane.rotation.set(0.75, side * 0.42, side * -0.62);
    membrane.castShadow = true;
    wing.add(upper, outer, membrane);
    return wing;
  };
  const wingL = makeWing(1);
  const wingR = makeWing(-1);

  const makeLeg = (x: number, z: number, front: boolean) => {
    const leg = new THREE.Group();
    const upper = capsule(color, front ? 0.12 : 0.16, front ? 0.58 : 0.72, [x, front ? 0.92 : 0.78, z]);
    upper.material = bodyMat;
    upper.rotation.z = front ? 0.58 : -0.35;
    const foot = mesh(new THREE.BoxGeometry(front ? 0.34 : 0.48, 0.16, 0.36), color, [x + (front ? 0.28 : -0.18), 0.28, z]);
    for (let i = 0; i < 3; i += 1) {
      const claw = cone('#27231f', 0.035, 0.16, [foot.position.x + 0.12 + i * 0.08, 0.29, z + (i - 1) * 0.08]);
      claw.material = clawMat;
      claw.rotation.z = -Math.PI / 2;
      leg.add(claw);
    }
    leg.add(upper, foot);
    return leg;
  };
  const legs = new THREE.Group();
  legs.add(makeLeg(0.72, 0.52, true), makeLeg(0.72, -0.42, true), makeLeg(-0.62, 0.48, false), makeLeg(-0.62, -0.38, false));

  const tail = new THREE.Group();
  for (let i = 0; i < 7; i += 1) {
    const segment = capsule(color, Math.max(0.07, 0.16 - i * 0.014), 0.38, [-1.05 - i * 0.28, 1.0 + Math.sin(i * 0.75) * 0.18, Math.sin(i * 0.8) * 0.38]);
    segment.material = bodyMat;
    segment.rotation.z = 1.12 - i * 0.08;
    segment.rotation.y = Math.sin(i * 0.65) * 0.42;
    tail.add(segment);
  }
  const tailTip = cone('#d8d0bc', 0.09, 0.36, [-2.9, 1.02, -0.12]);
  tailTip.material = hornMat;
  tailTip.rotation.z = Math.PI / 2;
  tail.add(tailTip);

  const fire = new THREE.Mesh(
    new THREE.ConeGeometry(0.34, 1.55, 12),
    new THREE.MeshBasicMaterial({ color: '#ff8a1f', transparent: true, opacity: 0.88 })
  );
  fire.position.set(2.58, 2.04, 0.1);
  fire.rotation.z = -Math.PI / 2;
  dragon.add(body, belly, chestPlate, neck, head, snout, jaw, eyeL, eyeR, hornL, hornR, browL, browR, spines, wingL, wingR, legs, tail, fire);
  dragon.position.set(4.2, 0, -0.5);
  dragon.userData = { bodyMat, body, head, neck, wingL, wingR, fire, jaw, tail, spines };
  return dragon;
}
