import { type BattleScene3DProps, hashSceneKey, loadDetailedMapProps, monsterRunSpeedMetersPerSecond, material, arcaneAttackRadiusMeters, arcaneProjectileSpeedMetersPerSecond, smoothAngle, monsterAggroRangeMeters, monsterPressureRangeMeters, monsterHitRangeMeters } from '../game/scene/models/battleScene3DProps';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { getRenderQuality, removeSceneryLights } from '../game/scene/renderQuality';
import { createSceneLighting } from '../game/scene/sceneLighting';
import { addCaveCity } from '../game/scene/models/addCaveCity';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { fitMapPropModel, tuneDownloadedCharacter, fitHeroModel, fitMonsterModel } from '../game/scene/models/fitHeroModel';
import { add3DLocation } from '../game/scene/models/add3DLocation';
import { makeHero } from '../game/scene/models/makeHero';
import { makeHeroArtifact, makeEquippedHeroWeapon } from '../game/scene/models/makeHeroArtifact';
import { makeDragon } from '../game/scene/models/makeDragon';
import { makeAvalancheDragon, makeNightKingFallback } from '../game/scene/models/makeAvalancheDragon';
import { disposeScene } from '../game/scene/disposeScene';
import { makeMonster } from '../game/scene/models/makeMonster';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { updateEquippedHeroWeapon, updateHeroArtifactStyle } from '../game/scene/models/updateEquippedHeroWeapon';

export function BattleScene3D(props: BattleScene3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef(props);
  const [modelsReady, setModelsReady] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => { props.onReady(modelsReady && !renderError); }, [modelsReady, renderError, props.onReady]);

  useEffect(() => {
    refs.current = props;
  }, [props]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    setModelsReady(false);
    setRenderError(false);
    const requiredModels = new Set(['hero']);
    let disposed = false;
    const markModelReady = (key: string) => {
      requiredModels.delete(key);
      if (!disposed && requiredModels.size === 0) setModelsReady(true);
    };
    const modelReadyFallback = window.setTimeout(() => {
      if (!disposed) setModelsReady(true);
    }, 5000);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#081111');
    scene.fog = new THREE.Fog('#081111', 12, 70);

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 900);
    camera.position.set(0, 4.3, 10);

    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); }
    catch {
      window.clearTimeout(modelReadyFallback);
      setRenderError(true);
      return;
    }
    const onContextLost = (event: Event) => {
      event.preventDefault();
      window.clearTimeout(modelReadyFallback);
      setRenderError(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    const quality = getRenderQuality();
    renderer.setPixelRatio(quality.pixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = 'battle-canvas';
    container.appendChild(renderer.domElement);

    const sceneLighting = createSceneLighting(scene, renderer);

    addCaveCity(scene);
    removeSceneryLights(scene);
    const locationRoot = new THREE.Group();
    scene.add(locationRoot);
    const downloadedMapRoot = new THREE.Group();
    scene.add(downloadedMapRoot);
    const locationLoader = new GLTFLoader();
    const mapPropTemplates = new Map<string, THREE.Object3D>();
    const loadMapProp = (path: string, locationKey: string, position: [number, number, number], scale: number, rotationY = 0) => {
      const placeModel = (template: THREE.Object3D) => {
        if (locationKey !== activeLocationKey) return;
        const model = template.clone(true);
        model.position.set(...position);
        model.rotation.y = rotationY;
        model.scale.setScalar(scale);
        downloadedMapRoot.add(model);
      };

      const template = mapPropTemplates.get(path);
      if (template) {
        placeModel(template);
        return;
      }

      locationLoader.load(path, (gltf) => {
        const model = gltf.scene;
        model.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
          }
        });
        fitMapPropModel(model);
        mapPropTemplates.set(path, model);
        placeModel(model);
      });
    };
    const addDownloadedMapDecor = (locationKey: string, data: BattleScene3DProps) => {
      const natureBase = '/models/map-packs/nature-kit/Models/GLTF%20format';
      const townBase = '/models/map-packs/fantasy-town-kit/Models/GLB%20format';
      const caveBase = '/models/map-packs/modular-cave-kit/Models/GLB%20format';
      const dungeonBase = '/models/map-packs/modular-dungeon-kit/Models/GLB%20format';
      const mapPresets = [
        [`${natureBase}/tree_oak.glb`, `${natureBase}/tree_cone.glb`, `${natureBase}/rock_largeA.glb`, `${natureBase}/plant_bushLarge.glb`, `${natureBase}/bridge_wood.glb`],
        [`${natureBase}/tree_default.glb`, `${natureBase}/tree_fat.glb`, `${natureBase}/rock_smallA.glb`, `${natureBase}/grass_large.glb`, `${natureBase}/campfire_stones.glb`],
        [`${natureBase}/tree_blocks.glb`, `${natureBase}/tree_detailed.glb`, `${natureBase}/rock_tallA.glb`, `${natureBase}/plant_flatTall.glb`, `${natureBase}/bridge_stone.glb`],
        [`${natureBase}/tree_oak_dark.glb`, `${natureBase}/tree_cone_dark.glb`, `${natureBase}/rock_largeB.glb`, `${natureBase}/plant_bushTriangle.glb`, `${natureBase}/bridge_woodRound.glb`],
        [`${natureBase}/tree_default_fall.glb`, `${natureBase}/tree_fat_fall.glb`, `${natureBase}/rock_largeC.glb`, `${natureBase}/plant_bushSmall.glb`, `${natureBase}/campfire_logs.glb`],
        [`${natureBase}/tree_blocks_dark.glb`, `${natureBase}/tree_detailed_dark.glb`, `${natureBase}/rock_tallB.glb`, `${natureBase}/grass_leafsLarge.glb`, `${natureBase}/bridge_stoneRound.glb`],
        [`${natureBase}/tree_oak_fall.glb`, `${natureBase}/tree_cone_fall.glb`, `${natureBase}/rock_smallFlatA.glb`, `${natureBase}/plant_bushDetailed.glb`, `${natureBase}/bridge_woodNarrow.glb`],
        [`${natureBase}/tree_default_dark.glb`, `${natureBase}/tree_fat_darkh.glb`, `${natureBase}/rock_tallC.glb`, `${natureBase}/grass.glb`, `${natureBase}/bridge_stoneNarrow.glb`],
        [`${natureBase}/tree_detailed_fall.glb`, `${natureBase}/tree_blocks_fall.glb`, `${natureBase}/rock_largeD.glb`, `${natureBase}/plant_flatShort.glb`, `${natureBase}/campfire_bricks.glb`],
        [`${natureBase}/tree_cone.glb`, `${natureBase}/tree_oak.glb`, `${natureBase}/rock_tallD.glb`, `${natureBase}/plant_bushLargeTriangle.glb`, `${natureBase}/bridge_woodRoundNarrow.glb`],
        [`${townBase}/wall-arch.glb`, `${townBase}/wall-window-stone.glb`, `${townBase}/road.glb`, `${townBase}/fountain-round.glb`, `${townBase}/stairs-stone.glb`],
        [`${townBase}/wall-door.glb`, `${townBase}/wall-block.glb`, `${townBase}/road-corner.glb`, `${townBase}/rock-large.glb`, `${townBase}/stairs-full.glb`],
        [`${townBase}/wall-broken.glb`, `${townBase}/wall-window-shutters.glb`, `${townBase}/road-bend.glb`, `${townBase}/fountain-square.glb`, `${townBase}/stairs-wide-stone.glb`],
        [`${townBase}/wall-corner.glb`, `${townBase}/wall-doorway-round.glb`, `${townBase}/road-edge.glb`, `${townBase}/rock-wide.glb`, `${townBase}/stairs-wood.glb`],
        [`${townBase}/wall-rounded.glb`, `${townBase}/wall-window-round.glb`, `${townBase}/road-curb.glb`, `${townBase}/fountain-center.glb`, `${townBase}/stairs-stone-round.glb`],
        [`${townBase}/wall-wood-arch.glb`, `${townBase}/wall-wood-block.glb`, `${townBase}/road-slope.glb`, `${townBase}/rock-small.glb`, `${townBase}/stairs-wide-wood.glb`],
        [`${townBase}/wall-detail-cross.glb`, `${townBase}/wall-doorway-square.glb`, `${townBase}/road-curb-end.glb`, `${townBase}/fountain-edge.glb`, `${townBase}/stairs-stone-handrail.glb`],
        [`${townBase}/wall-half.glb`, `${townBase}/wall-window-glass.glb`, `${townBase}/road-corner-inner.glb`, `${townBase}/fountain-curved.glb`, `${townBase}/stairs-wood-handrail.glb`],
        [`${townBase}/wall-diagonal.glb`, `${townBase}/wall-doorway-square-wide.glb`, `${townBase}/road-edge-slope.glb`, `${townBase}/fountain-round-detail.glb`, `${townBase}/stairs-full-corner-outer.glb`],
        [`${townBase}/wall-wood-broken.glb`, `${townBase}/wall-wood-corner.glb`, `${townBase}/road.glb`, `${townBase}/fountain-square-detail.glb`, `${townBase}/stairs-full-corner-inner.glb`],
        [`${caveBase}/room-small.glb`, `${caveBase}/gate-rock.glb`, `${caveBase}/corridor-wide.glb`, `${caveBase}/stairs.glb`],
        [`${caveBase}/room-large.glb`, `${caveBase}/gate.glb`, `${caveBase}/corridor-corner.glb`, `${caveBase}/stairs-wide.glb`],
        [`${caveBase}/room-wide.glb`, `${caveBase}/gate-metal-bars.glb`, `${caveBase}/corridor-junction.glb`, `${caveBase}/corridor-end.glb`],
        [`${caveBase}/room-corner.glb`, `${caveBase}/gate-overhang.glb`, `${caveBase}/corridor-intersection.glb`, `${caveBase}/corridor-transition.glb`],
        [`${caveBase}/room-small-variation.glb`, `${caveBase}/gate-rock.glb`, `${caveBase}/corridor-wide-corner.glb`, `${caveBase}/stairs.glb`],
        [`${caveBase}/room-large-variation.glb`, `${caveBase}/gate.glb`, `${caveBase}/corridor-wide-junction.glb`, `${caveBase}/stairs-wide.glb`],
        [`${caveBase}/room-wide-variation.glb`, `${caveBase}/gate-metal-bars.glb`, `${caveBase}/corridor-wide-end.glb`, `${caveBase}/corridor-wide-intersection.glb`],
        [`${caveBase}/room-small.glb`, `${caveBase}/gate-overhang.glb`, `${caveBase}/corridor.glb`, `${caveBase}/template-wall-stairs.glb`],
        [`${caveBase}/room-large.glb`, `${caveBase}/gate-rock.glb`, `${caveBase}/corridor-wide.glb`, `${caveBase}/corridor-transition.glb`],
        [`${caveBase}/room-wide.glb`, `${caveBase}/gate.glb`, `${caveBase}/corridor-corner.glb`, `${caveBase}/stairs-wide.glb`],
        [`${dungeonBase}/room-small.glb`, `${dungeonBase}/gate.glb`, `${dungeonBase}/corridor.glb`, `${dungeonBase}/stairs-wide.glb`],
        [`${dungeonBase}/room-large.glb`, `${dungeonBase}/gate-metal-bars.glb`, `${dungeonBase}/corridor-corner.glb`, `${dungeonBase}/stairs.glb`],
        [`${dungeonBase}/room-wide.glb`, `${dungeonBase}/gate-door.glb`, `${dungeonBase}/corridor-junction.glb`, `${dungeonBase}/corridor-end.glb`],
        [`${dungeonBase}/room-corner.glb`, `${dungeonBase}/gate.glb`, `${dungeonBase}/corridor-intersection.glb`, `${dungeonBase}/stairs-wide.glb`],
        [`${dungeonBase}/room-small-variation.glb`, `${dungeonBase}/gate-metal-bars.glb`, `${dungeonBase}/corridor-wide.glb`, `${dungeonBase}/stairs.glb`],
        [`${dungeonBase}/room-large-variation.glb`, `${dungeonBase}/gate.glb`, `${dungeonBase}/corridor-wide-corner.glb`, `${dungeonBase}/corridor-transition.glb`],
        [`${dungeonBase}/room-wide-variation.glb`, `${dungeonBase}/gate-door.glb`, `${dungeonBase}/corridor-wide-junction.glb`, `${dungeonBase}/stairs-wide.glb`],
        [`${dungeonBase}/room-small.glb`, `${dungeonBase}/gate-metal-bars.glb`, `${dungeonBase}/corridor-wide-end.glb`, `${dungeonBase}/corridor-wide-intersection.glb`],
        [`${dungeonBase}/room-large.glb`, `${dungeonBase}/gate.glb`, `${dungeonBase}/corridor.glb`, `${dungeonBase}/template-wall-stairs.glb`],
        [`${dungeonBase}/room-wide.glb`, `${dungeonBase}/gate-door.glb`, `${dungeonBase}/corridor-corner.glb`, `${dungeonBase}/stairs.glb`],
      ];
      const randomPresetIndex = Math.abs(data.chapter * 7 + data.locationIndex * 13 + hashSceneKey(data.sceneKey)) % mapPresets.length;
      const presetIndex = data.monsterKind === 'avalanche'
        ? 8
        : data.sceneKey.includes('sea')
          ? 0
          : data.sceneKey.includes('admin')
            ? 16
            : data.sceneKey.includes('spirit') || data.sceneKey.includes('death')
              ? 37
              : data.sceneKey.includes('dungeon')
                ? 24 + (data.chapter % 6)
                : randomPresetIndex;
      const positions: Array<[number, number, number]> = [
        [-42, 0, -42],
        [42, 0, -42],
        [-52, 0, -14],
        [52, 0, -14],
        [-42, 0, 34],
        [42, 0, 34],
        [-18, 0, -50],
        [18, 0, 48],
        [-58, 0, 44],
        [58, 0, 44],
      ];
      const selectedPack = mapPresets[presetIndex];
      positions.slice(0, 3).forEach((position, index) => {
        const path = selectedPack[index % selectedPack.length];
        const family = Math.floor(presetIndex / 10);
        const size = family === 0 ? 0.62 + (index % 3) * 0.12 : family === 1 ? 0.82 : 0.95;
        loadMapProp(path, locationKey, position, size, Math.sin(index + data.chapter) * 0.9);
      });
    };
    let activeLocationKey = '';
    const disposeLocationObject = (object: THREE.Object3D) => {
      object.traverse((entry) => {
        if (entry instanceof THREE.Mesh) {
          entry.geometry.dispose();
          const objectMaterial = entry.material;
          if (Array.isArray(objectMaterial)) objectMaterial.forEach((item) => item.dispose());
          else objectMaterial.dispose();
        }
      });
    };
    const rebuildLocation = () => {
      const data = refs.current;
      const nextLocationKey = `${data.sceneKey}-${data.chapter}-${data.locationIndex}-${data.monstersLeft > 0 ? 'captured' : 'free'}`;
      if (nextLocationKey === activeLocationKey) return;
      activeLocationKey = nextLocationKey;
      while (locationRoot.children.length) {
        const child = locationRoot.children.pop();
        if (child) disposeLocationObject(child);
      }
      downloadedMapRoot.clear();
      add3DLocation(scene, locationRoot, data.sceneKey, data.chapter, data.locationIndex, data.monstersLeft > 0 && !data.isFinalReveal);
      removeSceneryLights(locationRoot);
      if (loadDetailedMapProps) addDownloadedMapDecor(nextLocationKey, data);
    };
    rebuildLocation();

    const hero = makeHero();
    const heroArtifact = makeHeroArtifact();
    const heroEquippedWeapon = makeEquippedHeroWeapon();
    const dragon = makeDragon(refs.current.dragonColor);
    const avalancheDragons = new THREE.Group();
    for (let index = 0; index < 10; index += 1) {
      const avalancheDragon = makeAvalancheDragon(index);
      avalancheDragon.userData.phase = (index / 10) * Math.PI * 2;
      avalancheDragon.userData.radius = 14 + (index % 3) * 5;
      avalancheDragon.scale.setScalar(0.32 + (index % 4) * 0.035);
      avalancheDragon.visible = false;
      avalancheDragons.add(avalancheDragon);
    }
    scene.add(avalancheDragons);
    const dragonBreath = new THREE.Group();
    const breathCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 1.15, 1, 18, 1, true),
      new THREE.MeshBasicMaterial({ color: '#ff5a00', transparent: true, opacity: 0.78, depthWrite: false })
    );
    breathCore.rotation.x = Math.PI / 2;
    dragonBreath.add(breathCore);
    for (let index = 0; index < 18; index += 1) {
      const flame = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.24 + (index % 4) * 0.08, 1),
        new THREE.MeshBasicMaterial({
          color: index % 3 === 0 ? '#fff275' : index % 2 === 0 ? '#ff9f1c' : '#ff2d00',
          transparent: true,
          opacity: 0.86,
          depthWrite: false,
        })
      );
      flame.userData.seed = index * 0.71;
      dragonBreath.add(flame);
    }
    const breathLight = new THREE.PointLight('#ff4d00', 0, 24);
    dragonBreath.add(breathLight);
    dragonBreath.visible = false;
    const nightKingBoss = new THREE.Group();
    const nightKingFallback = makeNightKingFallback();
    nightKingBoss.add(nightKingFallback);
    nightKingBoss.position.set(0, 0, -18);
    nightKingBoss.scale.setScalar(3.8);
    const specialBosses = new THREE.Group();
    const specialBossModels: Record<string, THREE.Object3D> = {};
    const specialBossAura = new THREE.Mesh(
      new THREE.TorusGeometry(2.25, 0.055, 8, 72),
      new THREE.MeshBasicMaterial({ color: '#ff2a1f', transparent: true, opacity: 0, depthWrite: false })
    );
    specialBossAura.rotation.x = -Math.PI / 2;
    specialBossAura.visible = false;
    const specialBossBlast = new THREE.Mesh(
      new THREE.ConeGeometry(0.45, 4.8, 18),
      new THREE.MeshBasicMaterial({ color: '#ff5a3d', transparent: true, opacity: 0, depthWrite: false })
    );
    specialBossBlast.visible = false;
    const bossMagicProjectiles = new THREE.Group();
    const bossMagicColors: Record<string, string> = {
      goblin: '#a6ff00', fury: '#7c3aed', anuar: '#ff5a1f', mansur: '#9cff00', arailm: '#ff2a1f',
      ais: '#2f80ed', admin: '#ff004c', death: '#ff3b1f', spirit: '#b56cff', bbi: '#ffd166', nurali: '#75e6da',
    };
    const bossMagicNames: Record<string, string> = {
      goblin: 'кислотный сгусток', fury: 'тёмный шар', anuar: 'огненный шар', mansur: 'зелёный шип', arailm: 'красный код-болт',
      ais: 'водяной шар', admin: 'админ-плазму', death: 'адское пламя', spirit: 'шар души', bbi: 'солнечный удар', nurali: 'ледяной шип',
    };
    for (let index = 0; index < 4; index += 1) {
      const projectile = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.24, 1),
        new THREE.MeshBasicMaterial({ color: '#ff5a1f', transparent: true, opacity: 0.95, depthWrite: false })
      );
      projectile.visible = false;
      projectile.userData.velocity = new THREE.Vector3();
      projectile.userData.life = 0;
      projectile.userData.spell = '';
      bossMagicProjectiles.add(projectile);
    }
    let bossMagicCooldown = 1.2;
    scene.add(hero, heroArtifact, heroEquippedWeapon, dragon, dragonBreath, nightKingBoss, specialBosses, specialBossAura, specialBossBlast, bossMagicProjectiles);

    const gltfLoader = new GLTFLoader();
    const heroMixers: THREE.AnimationMixer[] = [];
    const heroClipActions: Record<string, THREE.AnimationAction> = {};
    let activeHeroClip = '';
    let hasDownloadedHeroAnimations = false;
    const findHeroClip = (...names: string[]) => {
      const availableNames = Object.keys(heroClipActions);
      for (const name of names) {
        if (heroClipActions[name]) return name;
        const lowerName = name.toLowerCase();
        const match = availableNames.find((entry) => entry.toLowerCase().includes(lowerName));
        if (match) return match;
      }
      return '';
    };
    const playHeroClip = (clipName: string, fade = 0.14, once = false, timeScale = 1) => {
      const nextAction = heroClipActions[clipName];
      if (!nextAction) return false;
      nextAction.timeScale = timeScale;
      if (activeHeroClip === clipName && !once) return true;
      const previousAction = heroClipActions[activeHeroClip];
      if (previousAction && previousAction !== nextAction) previousAction.fadeOut(fade);
      nextAction.enabled = true;
      nextAction.reset();
      nextAction.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity);
      nextAction.clampWhenFinished = once;
      nextAction.fadeIn(fade).play();
      activeHeroClip = clipName;
      return true;
    };
    gltfLoader.load(
      '/models/kaykit-knight/Knight.glb',
      (gltf) => {
        if (disposed) { disposeScene(gltf.scene, true); return; }
        hero.children.forEach((child) => {
          child.visible = false;
        });
        const model = gltf.scene;
        tuneDownloadedCharacter(model);
        fitHeroModel(model);
        model.name = 'downloaded-hero-model';
        hero.add(model);
        hero.userData.downloadedModel = model;
        hero.userData.weaponHand = model.getObjectByName('handslot.r') ?? model.getObjectByName('hand.r');
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            heroClipActions[clip.name] = mixer.clipAction(clip);
          });
          hasDownloadedHeroAnimations = true;
          playHeroClip(findHeroClip('Idle', 'idle'), 0);
          heroMixers.push(mixer);
          hero.userData.downloadedMixer = mixer;
        }
        markModelReady('hero');
      },
      undefined,
      () => {
        hero.children.forEach((child) => {
          child.visible = true;
        });
        markModelReady('hero');
      }
    );
    const specialBossStyles = [
      ['goblin', '#65a832', 1.34], ['fury', '#111111', 1.48], ['anuar', '#ff5a3d', 1.42],
      ['mansur', '#9cff00', 1.3], ['arailm', '#ff2a1f', 1.5], ['ais', '#2f80ed', 1.58],
      ['admin', '#ff2a1f', 1.68], ['death', '#8b0000', 1.76], ['spirit', '#b56cff', 1.55],
      ['bbi', '#ffe66d', 1.52], ['nurali', '#75e6da', 1.46],
    ] as const;
    specialBossStyles.forEach(([bossKey, tint, bossScale], index) => {
      const boss = makeNightKingFallback();
      boss.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        const clonedMaterials = materials.map((item) => {
          const cloned = item.clone();
          if (cloned instanceof THREE.MeshStandardMaterial) {
            cloned.color.lerp(new THREE.Color(tint), 0.55);
            cloned.emissive.set(tint);
            cloned.emissiveIntensity = 0.12;
          }
          return cloned;
        });
        object.material = clonedMaterials.length === 1 ? clonedMaterials[0] : clonedMaterials;
      });
      boss.scale.setScalar(bossScale);
      boss.userData.baseScale = bossScale;
      boss.userData.phase = index * 0.57;
      boss.userData.tint = tint;
      boss.visible = false;
      specialBosses.add(boss);
      specialBossModels[bossKey] = boss;
    });

    const monsterSlashMaterial = new THREE.MeshBasicMaterial({ color: '#ff4d2e', transparent: true, opacity: 0, depthWrite: false });
    const monsters = new THREE.Group();
    const visualMonsterCount = refs.current.monsterKind === 'avalanche' ? 10 : 6;
    for (let i = 0; i < visualMonsterCount; i += 1) {
      const monster = makeMonster(refs.current.monsterKind, i);
      const attackTrail = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.03, 8, 28, Math.PI * 1.12), monsterSlashMaterial.clone());
      attackTrail.visible = false;
      attackTrail.userData.attackTrail = true;
      attackTrail.position.set(0, 1.08, -0.62);
      attackTrail.rotation.set(-0.55, 0, 0.92);
      monster.add(attackTrail);
      const ring = 12 + (i % 4) * 6.2;
      const angle = (i / visualMonsterCount) * Math.PI * 2;
      const homeX = Math.cos(angle) * ring + Math.sin(i * 1.7) * 2.2;
      const homeZ = Math.sin(angle) * ring - 7 + Math.cos(i * 1.2) * 2.2;
      monster.position.set(homeX, 0, homeZ);
      monster.rotation.y = Math.PI + Math.sin(i) * 0.35;
      monster.userData.homeX = homeX;
      monster.userData.homeZ = homeZ;
      monster.userData.speed = monsterRunSpeedMetersPerSecond;
      monster.userData.attackFlash = 0;
      monster.userData.attackCycle = (i % 7) * 0.13;
      monster.userData.botState = 'chase';
      monster.userData.botAngle = angle + (i % 3 - 1) * 0.32;
      monster.userData.botOrbit = 0.7 + (i % 5) * 0.18;
      monster.userData.attackCooldown = (i % 6) * 0.18;
      monster.userData.attackTrail = attackTrail;
      monsters.add(monster);
    }
    scene.add(monsters);

    const monsterKind = refs.current.monsterKind;
    const monsterModelPath = monsterKind === 'spider'
      ? '/models/quaternius-monsters/bat.fbx'
      : monsterKind === 'avalanche' || monsterKind === 'magma'
        ? '/models/quaternius-monsters/dragon.fbx'
        : monsterKind === 'pale' || monsterKind === 'wire' || monsterKind === 'shadow'
          ? '/models/quaternius-monsters/slime.fbx'
          : '/models/quaternius-monsters/skeleton.fbx';
    const monsterLoader = new FBXLoader();
    monsterLoader.load(monsterModelPath, (template) => {
      if (disposed) { disposeScene(template, true); return; }
      template.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });
      fitMonsterModel(template);

      monsters.children.forEach((monster, index) => {
        const current = monster as THREE.Group;
        const attackTrail = current.userData.attackTrail as THREE.Mesh | undefined;
        current.children.forEach((child) => {
          if (child !== attackTrail) child.visible = false;
        });
        const model = cloneSkeleton(template);
        model.name = 'downloaded-animated-monster';
        model.rotation.y += index % 2 ? 0.12 : -0.12;
        if (current.userData.kind === 'goblin') {
          model.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((entry) => {
              if (entry instanceof THREE.MeshStandardMaterial) entry.color.lerp(new THREE.Color('#4d9b45'), 0.6);
            });
          });
          const club = new THREE.Group();
          const handle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.1, 1.15, 8),
            material('#5c3518', { roughness: 0.82 })
          );
          handle.rotation.z = Math.PI / 2;
          const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.22, 10, 8),
            material('#3b2413', { roughness: 0.9 })
          );
          head.position.x = 0.56;
          club.add(handle, head);
          club.position.set(0.45, 1.05, 0.15);
          club.rotation.z = -0.8;
          model.add(club);
          current.userData.downloadedClub = club;
        }
        current.add(model);
        current.userData.loadedMonsterModel = model;
        current.userData.loadedMonsterBaseScale = model.scale.x;
        current.userData.loadedMonsterBaseRotationY = model.rotation.y;
        if (template.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          const actions = template.animations.map((clip) => mixer.clipAction(clip));
          const idleAction = actions.find((action) => /idle/i.test(action.getClip().name)) ?? actions[0];
          const attackActions = actions.filter((action) => /attack|punch|hit|slash|claw|bite|die/i.test(action.getClip().name));
          idleAction.play();
          current.userData.loadedMonsterMixer = mixer;
          current.userData.loadedMonsterAttacks = attackActions.length > 0 ? attackActions : [actions[0]];
          current.userData.loadedMonsterAttacking = false;
          current.userData.loadedMonsterAttackIndex = 0;
        }
      });
    });

    const ashMat = new THREE.MeshBasicMaterial({ color: '#aee9e3', transparent: true, opacity: 0.58 });
    const motes = new THREE.Group();
    for (let i = 0; i < 48; i += 1) {
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.025 + (i % 3) * 0.01, 8, 6), ashMat);
      mote.position.set(-80 + Math.random() * 160, 0.6 + Math.random() * 12, -86 + Math.random() * 170);
      mote.userData.seed = Math.random() * 10;
      motes.add(mote);
    }
    scene.add(motes);

    const slashTrail = new THREE.Mesh(
      new THREE.TorusGeometry(0.92, 0.035, 8, 42, Math.PI * 1.18),
      new THREE.MeshBasicMaterial({ color: '#dff8ff', transparent: true, opacity: 0, depthWrite: false })
    );
    slashTrail.visible = false;
    scene.add(slashTrail);

    const castAura = new THREE.Group();
    const castAuraMaterials = ['#75e6da', '#b56cff', '#ffe66d'].map(
      (color) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
    );
    for (let index = 0; index < 3; index += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7 + index * 0.26, 0.018, 8, 72), castAuraMaterials[index]);
      ring.rotation.x = Math.PI / 2 + index * 0.42;
      ring.userData.phase = index * 0.7;
      castAura.add(ring);
    }
    for (let index = 0; index < 9; index += 1) {
      const rune = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.055 + (index % 3) * 0.012, 0),
        castAuraMaterials[index % castAuraMaterials.length]
      );
      rune.userData.phase = (index / 9) * Math.PI * 2;
      castAura.add(rune);
    }
    castAura.visible = false;
    scene.add(castAura);

    const footDustMaterial = new THREE.MeshBasicMaterial({ color: '#d9c6a3', transparent: true, opacity: 0, depthWrite: false });
    const footDust = new THREE.Group();
    for (let i = 0; i < 8; i += 1) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.12 + (i % 3) * 0.025, 8, 6), footDustMaterial);
      puff.userData.seed = i * 0.73;
      footDust.add(puff);
    }
    scene.add(footDust);

    const arcaneBolts = new THREE.Group();
    const arcaneBoltMaterial = new THREE.MeshBasicMaterial({ color: '#b56cff', transparent: true, opacity: 0, depthWrite: false });
    for (let index = 0; index < 18; index += 1) {
      const bolt = new THREE.Group();
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.11 + (index % 3) * 0.025, 12, 8), arcaneBoltMaterial.clone());
      const trail = new THREE.Mesh(
        new THREE.ConeGeometry(0.11 + (index % 3) * 0.018, 0.9, 12, 1, true),
        new THREE.MeshBasicMaterial({ color: '#b56cff', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
      );
      trail.rotation.x = Math.PI / 2;
      trail.position.z = -0.45;
      bolt.add(core, trail);
      bolt.visible = false;
      bolt.userData.seed = index * 0.53;
      bolt.userData.life = 0;
      bolt.userData.duration = 0.85;
      bolt.userData.core = core;
      bolt.userData.trail = trail;
      arcaneBolts.add(bolt);
    }
    scene.add(arcaneBolts);

    const arcaneBurstRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.35, 0.035, 10, 72),
      new THREE.MeshBasicMaterial({ color: '#b56cff', transparent: true, opacity: 0, depthWrite: false })
    );
    arcaneBurstRing.rotation.x = Math.PI / 2;
    arcaneBurstRing.visible = false;
    arcaneBurstRing.userData.life = 0;
    scene.add(arcaneBurstRing);

    const arcaneBurstLight = new THREE.PointLight('#b56cff', 0, 10);
    scene.add(arcaneBurstLight);

    const elementalFx = new THREE.Group();
    const makeFxMesh = (geometry: THREE.BufferGeometry, color: string, opacity: number) => {
      const fx = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
      fx.visible = false;
      fx.userData.baseOpacity = opacity;
      elementalFx.add(fx);
      return fx;
    };
    const elementalColors = ['#ff6b2b', '#75e6da', '#dff8ff', '#ff9f1c', '#8bd8ff', '#f8fbff', '#fff8e8', '#65ff7a', '#ff4fd8', '#8f5bff', '#ff2a1f', '#66f7ff', '#b7ff5a', '#8b5e34', '#facc15', '#ff7849', '#38bdf8', '#fff176'];
    const elementalMeshes = [
      makeFxMesh(new THREE.TorusGeometry(1.15, 0.08, 10, 72, Math.PI * 1.18), '#ff6b2b', 0.82),
      makeFxMesh(new THREE.CylinderGeometry(1.1, 1.6, 1.1, 24, 1, true), '#75e6da', 0.66),
      makeFxMesh(new THREE.TorusGeometry(1.05, 0.045, 8, 72), '#dff8ff', 0.72),
      makeFxMesh(new THREE.SphereGeometry(0.46, 24, 16), '#ff9f1c', 0.95),
      makeFxMesh(new THREE.TorusGeometry(0.95, 0.035, 8, 64, Math.PI * 1.12), '#8bd8ff', 0.78),
      makeFxMesh(new THREE.TorusGeometry(1.05, 0.026, 8, 64, Math.PI * 1.2), '#f8fbff', 0.68),
      makeFxMesh(new THREE.CylinderGeometry(0.38, 0.72, 7.5, 28, 1, true), '#fff8e8', 0.78),
      makeFxMesh(new THREE.SphereGeometry(0.72, 16, 12), '#65ff7a', 0.72),
      makeFxMesh(new THREE.TorusKnotGeometry(0.58, 0.045, 80, 8), '#ff4fd8', 0.78),
      makeFxMesh(new THREE.ConeGeometry(0.84, 2.7, 7, 1, true), '#8f5bff', 0.76),
      makeFxMesh(new THREE.RingGeometry(0.42, 1.6, 32), '#ff2a1f', 0.84),
      makeFxMesh(new THREE.IcosahedronGeometry(0.7, 1), '#66f7ff', 0.7),
      makeFxMesh(new THREE.TorusGeometry(1.05, 0.055, 8, 72, Math.PI * 1.7), '#b7ff5a', 0.72),
      makeFxMesh(new THREE.ConeGeometry(1.15, 1.9, 6, 1, true), '#8b5e34', 0.76),
      makeFxMesh(new THREE.TorusKnotGeometry(0.72, 0.035, 96, 10), '#facc15', 0.82),
      makeFxMesh(new THREE.DodecahedronGeometry(0.95, 0), '#ff7849', 0.84),
      makeFxMesh(new THREE.CylinderGeometry(0.72, 1.35, 2.2, 18, 1, true), '#38bdf8', 0.76),
      makeFxMesh(new THREE.SphereGeometry(1.05, 24, 16), '#fff176', 0.72),
    ];
    const elementalLight = new THREE.PointLight('#fff8e8', 0, 14);
    scene.add(elementalFx, elementalLight);

    const launchElementalFx = (kind: number, originX: number, originY: number, originZ: number, facing: number, boosted = false) => {
      const fx = elementalMeshes[((kind % elementalMeshes.length) + elementalMeshes.length) % elementalMeshes.length];
      fx.visible = true;
      fx.userData.life = 0.001;
      fx.userData.kind = kind % elementalMeshes.length;
      fx.userData.facing = facing;
      fx.userData.boosted = boosted;
      fx.position.set(originX + Math.sin(facing) * 1.1, originY + 0.85, originZ + Math.cos(facing) * 1.1);
      fx.scale.setScalar(boosted ? 1.35 : 1);
      elementalLight.position.copy(fx.position);
      elementalLight.color.set(elementalColors[kind % elementalColors.length]);
      elementalLight.intensity = boosted ? 6.5 : 4.2;
    };

    const launchArcaneBolts = (count: number, originX: number, originY: number, originZ: number, facing: number, effectKind: number) => {
      launchElementalFx(effectKind, originX, originY, originZ, facing, count > 6);
      let launched = 0;
      arcaneBolts.children.forEach((bolt) => {
        if (launched >= count || bolt.userData.life > 0) return;
        const spread = (launched - (count - 1) / 2) * 0.16;
        bolt.visible = true;
        bolt.position.set(originX + Math.sin(facing + spread) * 0.5, originY + 0.12 + launched * 0.035, originZ + Math.cos(facing + spread) * 0.5);
        bolt.userData.life = 0.001;
        bolt.userData.duration = arcaneAttackRadiusMeters / arcaneProjectileSpeedMetersPerSecond;
        bolt.userData.facing = facing + spread;
        bolt.userData.speed = arcaneProjectileSpeedMetersPerSecond;
        bolt.userData.lane = launched;
        bolt.userData.kind = effectKind;
        launched += 1;
      });
      if (count > 6) {
        arcaneBurstRing.visible = true;
        arcaneBurstRing.position.set(originX + Math.sin(facing) * 3.2, 0.08, originZ + Math.cos(facing) * 3.2);
        arcaneBurstRing.scale.setScalar(0.2);
        arcaneBurstRing.userData.life = 0.001;
        arcaneBurstLight.position.set(arcaneBurstRing.position.x, 1.3, arcaneBurstRing.position.z);
        arcaneBurstLight.intensity = 6.5;
      }
    };

    const clock = new THREE.Clock();
    let frame = 0;
    let lastPulse = refs.current.battlePulse;
    let lastArcanePulse = refs.current.arcanePulse;
    let lastArcaneBurstPulse = refs.current.arcaneBurstPulse;
    let lastHeroAnimation = refs.current.heroAnimation;
    let pulse = 0;
    let lastHeroX = refs.current.heroPosition.x / 1000;
    let lastHeroZ = refs.current.heroPosition.z / 1000;
    const initialFacing = refs.current.cameraYaw;
    let heroFacing = initialFacing;
    let renderFacing = initialFacing;
    let cameraYaw = initialFacing;
    const smoothHeroPosition = new THREE.Vector3(-3.4 + lastHeroX, 0, 1.2 + lastHeroZ);
    const targetHeroPosition = new THREE.Vector3(-3.4 + lastHeroX, 0, 1.2 + lastHeroZ);
    const cameraTarget = new THREE.Vector3(0, 3, 10);
    const weaponHandPosition = new THREE.Vector3();
    const weaponHandRotation = new THREE.Quaternion();
    const weaponGripOffset = new THREE.Vector3();
    const weaponGripCorrection = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
    const lookTarget = new THREE.Vector3(0, 1.5, 0);
    const smoothLookTarget = new THREE.Vector3(0, 1.5, 0);
    let attackSwing = 0;
    let cameraReady = false;
    const heroAttackClips = [
      '1H_Melee_Attack_Slice_Horizontal',
      '1H_Melee_Attack_Slice_Diagonal',
      '1H_Melee_Attack_Chop',
      '1H_Melee_Attack_Stab',
      '2H_Melee_Attack_Slice',
    ];

    const resize = () => {
      const width = container.clientWidth || 640;
      const height = container.clientHeight || 520;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const animate = () => {
      if (refs.current.paused || document.hidden) {
        clock.getDelta();
        frame = window.requestAnimationFrame(animate);
        return;
      }
      const delta = clock.getDelta();
      const time = clock.elapsedTime;
      const data = refs.current;
      sceneLighting.update(camera.position, camera);
      sceneLighting.setMood(data.isFinalReveal || data.sceneKey.includes('ending'));
      heroMixers.forEach((mixer) => mixer.update(delta));
      rebuildLocation();
      const startedStrike = lastHeroAnimation !== data.heroAnimation && data.heroAnimation === 'strike';
      lastHeroAnimation = data.heroAnimation;
      if (lastPulse !== data.battlePulse || startedStrike) {
        lastPulse = data.battlePulse;
        pulse = 0.38;
        attackSwing = 1;
        const attackClip = heroAttackClips[Math.abs(data.battlePulse) % heroAttackClips.length];
        playHeroClip(findHeroClip(attackClip, '1H_Melee_Attack_Slice_Horizontal', 'Attack', 'Slice'), 0.06, true, 1.55);
      }
      const hasNewArcanePulse = lastArcanePulse !== data.arcanePulse;
      const hasNewArcaneBurst = lastArcaneBurstPulse !== data.arcaneBurstPulse;
      if (hasNewArcanePulse) lastArcanePulse = data.arcanePulse;
      if (hasNewArcaneBurst) lastArcaneBurstPulse = data.arcaneBurstPulse;
      if (!attackSwing) {
        if (data.heroHeight > 0) playHeroClip(findHeroClip('Jump_Full_Short', 'Jump'), 0.1, false, 1.1);
        else if (data.heroAnimation === 'cast') playHeroClip(findHeroClip('Spellcast_Raise', 'Spellcast', 'Cheer', 'Interact'), 0.08, false, 1.25);
        else if (data.isHeroMoving) playHeroClip(findHeroClip('Walking_A', 'Walking_B', 'Walking_C', 'Walking', 'Running_A', 'Running_B', 'Run'), 0.18, false, 1);
        else if (data.heroAnimation === 'heal') playHeroClip(findHeroClip('Cheer'), 0.12, false, 1);
        else playHeroClip(findHeroClip('Idle', 'idle'), 0.24, false, 0.9);
      }
      pulse = Math.max(0, pulse - delta);
      attackSwing = Math.max(0, attackSwing - delta * 2.8);
      const shake = pulse ? Math.sin(pulse * 76) * pulse : 0;
      const heroX = data.heroPosition.x / 1000;
      const heroZ = data.heroPosition.z / 1000;
      const burn = Math.max(0.18, data.burn / 100);
      const heroWorldX = -3.4 + heroX;
      const heroWorldZ = 1.2 + heroZ;
      const jumpHeight = data.heroHeight / 120;
      targetHeroPosition.set(heroWorldX, 0, heroWorldZ);
      smoothHeroPosition.lerp(targetHeroPosition, 1 - Math.exp(-delta * 18));

      if (scene.fog instanceof THREE.Fog) {
        scene.fog.near = Math.max(18, data.viewDistance * 0.04);
        scene.fog.far = Math.max(180, data.viewDistance * 1.05);
      }
      scene.traverse((object) => {
        if (object instanceof THREE.PointLight) object.intensity = 2.2 + burn * 2.8 + Math.sin(time * 8 + object.position.x) * 0.35;
        if (object.userData.flame instanceof THREE.Mesh) object.userData.flame.scale.y = 0.8 + burn * 0.5 + Math.sin(time * 9 + object.position.x) * 0.18;
      });
      downloadedMapRoot.children.forEach((object, index) => {
        object.rotation.y += Math.sin(time * 0.7 + index) * delta * 0.08;
        object.position.y += Math.sin(time * 1.4 + index) * delta * 0.018;
      });
      locationRoot.children.forEach((object, index) => {
        if (object instanceof THREE.Mesh && object.geometry instanceof THREE.PlaneGeometry) return;
        if (object.userData.smoke) {
          const seed = typeof object.userData.seed === 'number' ? object.userData.seed : index;
          object.position.y += Math.sin(time * 0.7 + seed) * delta * 0.14;
          object.position.x += Math.sin(time * 0.45 + seed) * delta * 0.08;
          object.scale.set(
            1 + Math.sin(time * 0.8 + seed) * 0.12,
            1.8 + Math.sin(time * 0.6 + seed) * 0.18,
            1 + Math.cos(time * 0.75 + seed) * 0.1
          );
          if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshBasicMaterial) {
            object.material.opacity = 0.24 + Math.sin(time * 0.9 + seed) * 0.08;
          }
          return;
        }
        object.rotation.y += Math.sin(time * 0.45 + index) * delta * 0.012;
      });

      hero.position.x = smoothHeroPosition.x;
      hero.position.z = smoothHeroPosition.z;
      const moveDX = heroX - lastHeroX;
      const moveDZ = heroZ - lastHeroZ;
      if (Math.hypot(data.heroDirection.x, data.heroDirection.z) > 0.01) {
        heroFacing = Math.atan2(data.heroDirection.x, data.heroDirection.z);
      } else if (Math.hypot(moveDX, moveDZ) > 0.005) {
        heroFacing = Math.atan2(moveDX, moveDZ);
      }
      renderFacing = smoothAngle(renderFacing, heroFacing, delta, data.isHeroMoving ? 4.6 : 3.2);
      cameraYaw = smoothAngle(cameraYaw, data.cameraYaw, delta, data.isHeroMoving ? 5.8 : 7.4);
      lastHeroX = heroX;
      lastHeroZ = heroZ;
      if (hasNewArcanePulse || hasNewArcaneBurst) {
        const effectKind = data.arcaneSpellKind % elementalMeshes.length;
        launchArcaneBolts(hasNewArcaneBurst ? 12 : 3, hero.position.x, hero.position.y + 1.34, hero.position.z, renderFacing, effectKind);
        monsters.children.forEach((monster, index) => {
          if (index > (hasNewArcaneBurst ? 10 : 4)) return;
          const current = monster as THREE.Group;
          current.userData.hitReact = 0.75 - index * 0.035;
        });
      }

      const walkCycle = data.isHeroMoving ? time * 12.5 : time * 4;
      const stride = Math.sin(walkCycle);
      const counterStride = Math.cos(walkCycle);
      const stepLift = Math.abs(Math.sin(walkCycle));
      const runTilt = data.isHeroMoving ? Math.sin(walkCycle * 0.5) * 0.055 : 0;
      const walkPower = data.isHeroMoving ? 0.74 : 0.12;
      const idleBreath = Math.sin(time * 1.8) * 0.018;
      const idleShift = Math.sin(time * 1.15) * 0.012;
      const capeWind = Math.sin(time * 2.4 + hero.position.x * 0.08 + hero.position.z * 0.05);
      const useFallbackHeroRig = !hasDownloadedHeroAnimations;
      const isTwoHandedWeapon = [3, 11, 14, 16, 18, 19].includes(data.equippedWeaponStyle);
      const downloadedHeroModel = hero.userData.downloadedModel as THREE.Object3D | undefined;
      updateEquippedHeroWeapon(heroEquippedWeapon, data.equippedWeaponStyle, data.hasArcaneWeapon);
      heroEquippedWeapon.scale.setScalar(0.62);
      hero.scale.set(1 + Math.abs(idleBreath) * 0.018, 1 + idleBreath, 1 - Math.abs(idleBreath) * 0.012);
      hero.position.y =
        jumpHeight +
        Math.sin(time * 2.6) * (useFallbackHeroRig ? 0.035 : 0.022) +
        (data.isHeroMoving ? stepLift * (useFallbackHeroRig ? 0.095 : 0.045) : idleShift);
      hero.rotation.y = renderFacing + Math.sin(time * 1.8) * 0.014;
      hero.rotation.x = data.isHeroMoving ? -0.04 + runTilt * (useFallbackHeroRig ? 1 : 0.55) : 0;
      hero.rotation.z = data.isHeroMoving ? Math.sin(walkCycle) * (useFallbackHeroRig ? 0.055 : 0.024) : 0;
      if (downloadedHeroModel) {
        downloadedHeroModel.rotation.x = data.isHeroMoving ? stride * 0.035 - stepLift * 0.025 : Math.sin(time * 1.2) * 0.006;
        downloadedHeroModel.rotation.y = Math.sin(time * 1.4) * (data.isHeroMoving ? 0.018 : 0.006);
        downloadedHeroModel.rotation.z = data.isHeroMoving ? counterStride * 0.035 : Math.sin(time * 1.7) * 0.006;
        downloadedHeroModel.position.y = data.isHeroMoving ? stepLift * 0.07 : Math.sin(time * 1.6) * 0.012 + idleBreath * 0.35;
      }
      if (useFallbackHeroRig) {
        const runAmount = data.isHeroMoving ? 1 : 0;
        hero.userData.cape.rotation.y = capeWind * 0.08 - stride * 0.18 * runAmount;
        hero.userData.cape.rotation.x = -stepLift * 0.15 * runAmount + Math.sin(time * 1.7) * 0.035 - Math.max(0, capeWind) * 0.04;
        hero.userData.leftLeg.rotation.x = stride * walkPower - jumpHeight * 0.28;
        hero.userData.rightLeg.rotation.x = -stride * walkPower - jumpHeight * 0.28;
        hero.userData.leftLeg.rotation.z = 0.07 + counterStride * 0.08 * runAmount;
        hero.userData.rightLeg.rotation.z = -0.07 - counterStride * 0.08 * runAmount;
        hero.userData.leftArm.rotation.x = -stride * (data.isHeroMoving ? 0.58 : 0.08) - idleBreath * 1.3;
        hero.userData.rightArm.rotation.x = -0.18 + stride * (data.isHeroMoving ? 0.42 : 0.05) - idleBreath * 1.1;
        hero.userData.leftArm.rotation.z = -0.55 + Math.sin(time * 5) * 0.08 + stepLift * 0.14 * runAmount;
        hero.userData.rightArm.rotation.z = -1.18 - Math.sin(time * 5) * 0.05 - stepLift * 0.1 * runAmount;
        hero.userData.leftShoulder.rotation.z = -0.08 + stride * 0.08 * runAmount;
        hero.userData.rightShoulder.rotation.z = 0.08 + stride * 0.08 * runAmount;
        hero.userData.leftGauntlet.rotation.x = -stride * 0.34 * runAmount;
        hero.userData.rightGauntlet.rotation.x = stride * 0.3 * runAmount;
        hero.userData.leftBoot.rotation.x = -0.08 + Math.max(0, -stride) * 0.34 * runAmount;
        hero.userData.rightBoot.rotation.x = -0.08 + Math.max(0, stride) * 0.34 * runAmount;
        hero.userData.head.rotation.x = -0.02 + idleBreath * 1.6 - stepLift * 0.035 * runAmount;
        hero.userData.head.rotation.y = Math.sin(time * 1.25) * 0.035 + stride * 0.035 * runAmount;
        hero.userData.plume.rotation.x = 0.22 + counterStride * 0.08 * runAmount + capeWind * 0.05;
        hero.userData.plume.rotation.z = Math.sin(time * 2.8) * 0.08 + stride * 0.08 * runAmount;
        hero.userData.sword.rotation.set(0.12, 0, -1.34);
      }
      if (data.heroAnimation === 'cast') {
        const castWave = Math.sin(time * 8);
        const castPower = 0.55 + Math.max(0, castWave) * 0.45;
        hero.position.y += 0.05 + Math.max(0, castWave) * 0.08;
        hero.rotation.x = -0.08 + castWave * 0.025;
        hero.rotation.z = Math.sin(time * 5.2) * 0.035;
        if (downloadedHeroModel) {
          downloadedHeroModel.position.y = 0.08 + Math.max(0, castWave) * 0.08;
          downloadedHeroModel.rotation.x = -0.16 + castWave * 0.04;
          downloadedHeroModel.rotation.z = Math.sin(time * 5.8) * 0.06;
        }
        if (useFallbackHeroRig) {
          hero.userData.leftArm.rotation.x = -1.45 + castWave * 0.18;
          hero.userData.rightArm.rotation.x = -1.55 - castWave * 0.14;
          hero.userData.leftArm.rotation.z = -0.18 + Math.sin(time * 6) * 0.12;
          hero.userData.rightArm.rotation.z = 0.25 - Math.sin(time * 6) * 0.12;
          hero.userData.sword.rotation.set(-1.15 + castWave * 0.18, 0.18, -0.35 + Math.sin(time * 7) * 0.08);
        }
        heroEquippedWeapon.position.set(hero.position.x + Math.sin(renderFacing) * 0.42, hero.position.y + 1.88 + Math.max(0, castWave) * 0.12, hero.position.z + Math.cos(renderFacing) * 0.42);
        heroEquippedWeapon.rotation.set(-1.35 + castWave * 0.18, renderFacing, -0.22 + Math.sin(time * 7) * 0.1);
        heroEquippedWeapon.scale.multiplyScalar(1.12 + Math.max(0, castWave) * 0.12);
        slashTrail.visible = true;
        slashTrail.position.set(hero.position.x, hero.position.y + 1.55, hero.position.z);
        slashTrail.rotation.set(Math.PI / 2, 0, time * 4.6);
        slashTrail.scale.setScalar(0.7 + Math.max(0, castWave) * 0.55);
        (slashTrail.material as THREE.MeshBasicMaterial).opacity = 0.32 + Math.max(0, castWave) * 0.3;
        castAura.visible = true;
        castAura.position.set(hero.position.x, hero.position.y + 1.18, hero.position.z);
        castAura.rotation.y = renderFacing;
        castAura.children.forEach((part, index) => {
          const phase = typeof part.userData.phase === 'number' ? part.userData.phase : index;
          if (part instanceof THREE.Mesh && part.material instanceof THREE.MeshBasicMaterial) {
            part.material.opacity = (index < 3 ? 0.42 : 0.78) * castPower;
          }
          if (index < 3) {
            part.rotation.z = time * (2.8 + index * 0.8) + phase;
            part.scale.setScalar(1 + Math.sin(time * 5 + phase) * 0.08 + castPower * 0.28);
          } else {
            const orbit = time * (3.4 + index * 0.08) + phase;
            part.position.set(Math.cos(orbit) * (0.75 + index * 0.025), Math.sin(time * 4.5 + phase) * 0.22, Math.sin(orbit) * (0.75 + index * 0.025));
            part.rotation.set(time * 2 + phase, time * 3.2 + phase, time * 1.6);
            part.scale.setScalar(1 + castPower * 0.75);
          }
        });
      } else if (data.heroAnimation === 'strike' || attackSwing > 0) {
        castAura.visible = false;
        const attackPhase = THREE.MathUtils.clamp(1 - attackSwing, 0, 1);
        const windup = THREE.MathUtils.smoothstep(attackPhase, 0, isTwoHandedWeapon ? 0.34 : 0.24);
        const slash = Math.sin(THREE.MathUtils.clamp((attackPhase - (isTwoHandedWeapon ? 0.24 : 0.16)) / (isTwoHandedWeapon ? 0.32 : 0.34), 0, 1) * Math.PI);
        const impact = Math.sin(THREE.MathUtils.clamp((attackPhase - (isTwoHandedWeapon ? 0.38 : 0.28)) / 0.2, 0, 1) * Math.PI);
        const recover = THREE.MathUtils.smoothstep(attackPhase, isTwoHandedWeapon ? 0.6 : 0.5, 1);
        const lunge = Math.max(slash, impact * 0.8) * (1 - recover * 0.35);
        const heavy = isTwoHandedWeapon ? 1.45 : 1;
        hero.position.x += Math.sin(renderFacing) * (0.16 + lunge * 0.52 * heavy);
        hero.position.z += Math.cos(renderFacing) * (0.16 + lunge * 0.52 * heavy);
        hero.position.y += impact * (isTwoHandedWeapon ? 0.18 : 0.12);
        hero.rotation.x = -0.07 - lunge * (useFallbackHeroRig ? 0.24 : 0.12) * heavy + recover * 0.06;
        hero.rotation.z = -windup * (isTwoHandedWeapon ? 0.22 : 0.12) + impact * (isTwoHandedWeapon ? 0.28 : 0.18);
        if (downloadedHeroModel) {
          downloadedHeroModel.position.y = impact * (isTwoHandedWeapon ? 0.18 : 0.12);
          downloadedHeroModel.rotation.x = -windup * (isTwoHandedWeapon ? 0.42 : 0.28) - slash * (isTwoHandedWeapon ? 0.48 : 0.34) + recover * 0.16;
          downloadedHeroModel.rotation.z = -windup * (isTwoHandedWeapon ? 0.28 : 0.18) + impact * (isTwoHandedWeapon ? 0.42 : 0.3) - recover * 0.08;
        }
        slashTrail.visible = slash > 0.05 || impact > 0.05;
        (slashTrail.material as THREE.MeshBasicMaterial).opacity = Math.max(slash, impact) * 0.72;
        slashTrail.position.set(
          hero.position.x + Math.sin(renderFacing) * (0.88 + lunge * 0.35 * heavy),
          hero.position.y + 1.35 + impact * (isTwoHandedWeapon ? 0.34 : 0.22),
          hero.position.z + Math.cos(renderFacing) * (0.88 + lunge * 0.35 * heavy)
        );
        slashTrail.rotation.set(-0.18 - slash * (isTwoHandedWeapon ? 0.72 : 0.45), renderFacing + Math.PI * 0.5, -0.82 + windup * (isTwoHandedWeapon ? 0.88 : 0.55) - recover * 0.3);
        slashTrail.scale.setScalar((isTwoHandedWeapon ? 0.92 : 0.72) + slash * (isTwoHandedWeapon ? 0.85 : 0.55) + impact * (isTwoHandedWeapon ? 0.55 : 0.35));
        if (useFallbackHeroRig) {
          if (isTwoHandedWeapon) {
            hero.userData.rightArm.rotation.z = 0.94 + windup * 1.55 + slash * 0.45 - recover * 0.45;
            hero.userData.rightArm.rotation.x = -0.45 - windup * 1.85 - slash * 2.45 + recover * 1.15;
            hero.userData.leftArm.rotation.z = -0.08 + windup * 1.15 + slash * 0.62 - recover * 0.5;
            hero.userData.leftArm.rotation.x = -0.35 - windup * 1.55 - slash * 1.95 + recover * 1.0;
            hero.userData.leftShoulder.rotation.z = -0.22 + windup * 0.42;
            hero.userData.rightShoulder.rotation.z = 0.22 + windup * 0.42;
            hero.userData.sword.rotation.x = -0.08 - windup * 1.85 - slash * 2.6 + recover * 1.15;
            hero.userData.sword.rotation.y = -0.18 - impact * 0.42;
            hero.userData.sword.rotation.z = -1.58 - slash * 1.45 + recover * 0.72;
          } else {
            hero.userData.rightArm.rotation.z = 0.62 + windup * 1.45 + slash * 0.82 - recover * 0.35;
            hero.userData.rightArm.rotation.x = -0.2 - windup * 1.3 - slash * 2.05 + recover * 1.05;
            hero.userData.leftArm.rotation.x = -0.22 + slash * 0.35;
            hero.userData.leftArm.rotation.z = -0.56 - lunge * 0.48 + recover * 0.22;
            hero.userData.sword.rotation.x = 0.12 - windup * 1.35 - slash * 2.15 + recover * 1.1;
            hero.userData.sword.rotation.y = -impact * 0.28;
            hero.userData.sword.rotation.z = -1.34 - slash * 1.2 + recover * 0.62;
          }
        }
        heroEquippedWeapon.position.set(
          hero.position.x + 0.62 + impact * (isTwoHandedWeapon ? 0.34 : 0.22),
          hero.position.y + 1.46 + impact * (isTwoHandedWeapon ? 0.16 : 0.08) + windup * (isTwoHandedWeapon ? 0.22 : 0),
          hero.position.z + 0.28 - slash * (isTwoHandedWeapon ? 0.34 : 0.2)
        );
        heroEquippedWeapon.rotation.set(
          -0.52 - windup * (isTwoHandedWeapon ? 1.7 : 1.1) - slash * (isTwoHandedWeapon ? 2.35 : 1.85) + recover * 0.8,
          renderFacing - 0.32 - impact * (isTwoHandedWeapon ? 0.46 : 0.28),
          -0.82 - slash * (isTwoHandedWeapon ? 1.45 : 1.1) + recover * 0.48
        );
        heroEquippedWeapon.scale.multiplyScalar(1 + impact * (isTwoHandedWeapon ? 0.26 : 0.16));
      } else if (data.heroAnimation === 'step' || data.isHeroMoving) {
        if (useFallbackHeroRig) {
          hero.position.x += Math.sin(renderFacing) * stride * 0.11;
          hero.position.z += Math.cos(renderFacing) * stride * 0.11;
          hero.rotation.x -= stepLift * 0.035;
        }
      } else if (data.heroAnimation === 'heal') {
        castAura.visible = false;
        hero.scale.setScalar(1 + Math.sin(time * 10) * 0.045);
        hero.rotation.y += Math.sin(time * 8) * 0.035;
      } else {
        castAura.visible = false;
        hero.rotation.x = 0;
        hero.rotation.z = 0;
      }

      if (!(data.heroAnimation === 'strike' || data.heroAnimation === 'cast' || attackSwing > 0)) {
        heroEquippedWeapon.position.set(hero.position.x + 0.64 + Math.sin(walkCycle) * (data.isHeroMoving ? 0.045 : 0.012), hero.position.y + 1.44 + stepLift * 0.04 + idleBreath * 0.8, hero.position.z + 0.22 + Math.cos(time * 1.6) * 0.012);
        heroEquippedWeapon.rotation.set(-0.58 + Math.sin(walkCycle) * (data.isHeroMoving ? 0.1 : 0.03), renderFacing - 0.28 + Math.sin(time * 1.1) * 0.015, -0.78 + Math.sin(walkCycle * 0.7) * (data.isHeroMoving ? 0.08 : 0.03));
      }
      const weaponHand = hero.userData.weaponHand as THREE.Object3D | undefined;
      if (weaponHand) {
        weaponHand.getWorldPosition(weaponHandPosition);
        weaponHand.getWorldQuaternion(weaponHandRotation);
        heroEquippedWeapon.quaternion.copy(weaponHandRotation).multiply(weaponGripCorrection);
        const handWeaponScale = data.equippedWeaponStyle === 17 ? 0.42 : isTwoHandedWeapon ? 0.68 : 0.56;
        heroEquippedWeapon.scale.setScalar(handWeaponScale);
        weaponGripOffset.set(0, 0.66 * handWeaponScale, 0).applyQuaternion(heroEquippedWeapon.quaternion);
        heroEquippedWeapon.position.copy(weaponHandPosition).add(weaponGripOffset);
      }
      const weaponData = heroEquippedWeapon.userData as { aura: THREE.Mesh; magicRunes: THREE.Group };
      weaponData.aura.rotation.z = time * 2.4;
      (weaponData.aura.material as THREE.MeshBasicMaterial).opacity =
        (data.hasArcaneWeapon ? 0.48 : 0.24) + Math.sin(time * 5) * 0.08 + (data.heroAnimation === 'strike' ? 0.18 : 0);
      weaponData.magicRunes.children.forEach((rune, index) => {
        const phase = typeof rune.userData.phase === 'number' ? rune.userData.phase : index;
        rune.rotation.z = time * (2.2 + index * 0.18) + phase;
        rune.position.x = Math.sin(time * 2.5 + phase) * 0.05;
        rune.position.z = Math.cos(time * 2.1 + phase) * 0.05;
        rune.scale.setScalar(1 + Math.sin(time * 4 + phase) * 0.18);
        if (rune instanceof THREE.Mesh && rune.material instanceof THREE.MeshBasicMaterial) {
          rune.material.opacity = data.hasArcaneWeapon ? 0.72 + Math.sin(time * 5 + phase) * 0.16 : 0;
        }
      });

      if (!(data.heroAnimation === 'strike' || data.heroAnimation === 'cast' || attackSwing > 0)) {
        slashTrail.visible = false;
        (slashTrail.material as THREE.MeshBasicMaterial).opacity = 0;
      }
      footDust.visible = data.isHeroMoving && jumpHeight < 0.05;
      footDust.children.forEach((puff, index) => {
        const seed = puff.userData.seed as number;
        const phase = (time * 5.2 + seed) % 1;
        const side = index % 2 ? 0.28 : -0.28;
        const back = 0.18 + phase * 0.7;
        puff.position.set(
          hero.position.x - Math.sin(renderFacing) * back + Math.cos(renderFacing) * side,
          0.04 + phase * 0.12,
          hero.position.z - Math.cos(renderFacing) * back - Math.sin(renderFacing) * side
        );
        puff.scale.setScalar(0.45 + phase * 1.5);
      });
      footDustMaterial.opacity = data.isHeroMoving ? 0.18 + stepLift * 0.18 : 0;
      arcaneBolts.children.forEach((bolt) => {
        const life = (bolt.userData.life as number) || 0;
        if (life <= 0) return;
        const duration = (bolt.userData.duration as number) || 0.8;
        const facing = (bolt.userData.facing as number) || renderFacing;
        const speed = (bolt.userData.speed as number) || 8;
        const lane = (bolt.userData.lane as number) || 0;
        const kind = (bolt.userData.kind as number) || 0;
        const nextLife = life + delta;
        const progress = Math.min(1, nextLife / duration);
        bolt.userData.life = progress >= 1 ? 0 : nextLife;
        bolt.position.x += Math.sin(facing) * speed * delta;
        bolt.position.z += Math.cos(facing) * speed * delta;
        bolt.position.y += Math.sin(progress * Math.PI * 2 + lane) * delta * 1.4;
        bolt.rotation.x += delta * (4.8 + kind * 0.08);
        bolt.rotation.y += delta * (6.2 + lane * 0.18);
        bolt.rotation.z += delta * (7.6 + kind * 0.12);
        bolt.scale.setScalar(1 + Math.sin(progress * Math.PI) * (kind >= 15 ? 2.2 : 1.6));
        const core = bolt.userData.core as THREE.Mesh | undefined;
        const trail = bolt.userData.trail as THREE.Mesh | undefined;
        bolt.lookAt(
          bolt.position.x + Math.sin(facing),
          bolt.position.y,
          bolt.position.z + Math.cos(facing)
        );
        if (core?.material instanceof THREE.MeshBasicMaterial) {
          core.material.opacity = (1 - progress) * 0.95;
          core.material.color.set(elementalColors[(kind + lane) % elementalColors.length]);
        }
        if (trail?.material instanceof THREE.MeshBasicMaterial) {
          trail.material.opacity = (1 - progress) * 0.52;
          trail.material.color.set(elementalColors[(kind + lane + 1) % elementalColors.length]);
          trail.scale.set(1 + Math.sin(time * 12 + lane) * 0.18, 1 + progress * 1.8, 1);
        }
        bolt.visible = progress < 1;
      });
      const burstLife = (arcaneBurstRing.userData.life as number) || 0;
      if (burstLife > 0) {
        const nextBurstLife = burstLife + delta;
        const progress = Math.min(1, nextBurstLife / 0.95);
        arcaneBurstRing.userData.life = progress >= 1 ? 0 : nextBurstLife;
        arcaneBurstRing.visible = progress < 1;
        arcaneBurstRing.rotation.z = time * 3.2;
        arcaneBurstRing.scale.setScalar(0.4 + progress * (data.arcaneSpellKind < 6 ? 7.0 : 4.2));
        (arcaneBurstRing.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.82;
        arcaneBurstLight.intensity = (1 - progress) * 6.5;
      } else {
        arcaneBurstRing.visible = false;
        arcaneBurstLight.intensity = 0;
      }
      let activeElementalLight = false;
      elementalMeshes.forEach((fx) => {
        const life = (fx.userData.life as number) || 0;
        if (life <= 0) return;
        const kind = (fx.userData.kind as number) || 0;
        const facing = (fx.userData.facing as number) || renderFacing;
        const boosted = Boolean(fx.userData.boosted);
        const duration = kind === 6 ? 1.15 : boosted ? 1.05 : 0.86;
        const nextLife = life + delta;
        const progress = Math.min(1, nextLife / duration);
        fx.userData.life = progress >= 1 ? 0 : nextLife;
        fx.visible = progress < 1;
        const opacity = ((fx.userData.baseOpacity as number) || 0.7) * (1 - progress);
        if (fx.material instanceof THREE.MeshBasicMaterial) fx.material.opacity = opacity;
        const distance = (boosted ? 8.5 : 6.2) * progress;
        fx.position.x += Math.sin(facing) * delta * (boosted ? 8.6 : 6.4);
        fx.position.z += Math.cos(facing) * delta * (boosted ? 8.6 : 6.4);
        if (kind === 0) {
          fx.rotation.set(Math.PI / 2, 0, facing + Math.PI / 2);
          fx.scale.set(1.1 + progress * 4.8, 0.8 + progress * 1.3, 1.1 + progress * 4.8);
          fx.position.y = 0.12 + Math.sin(progress * Math.PI) * 0.25;
        } else if (kind === 1) {
          fx.rotation.set(0.18, facing, 0);
          fx.scale.set(1.2 + progress * 2.2, 0.75 + progress * 2.4, 0.52 + progress);
          fx.position.y = 0.58 + Math.sin(progress * Math.PI) * 1.1;
        } else if (kind === 2) {
          fx.rotation.set(Math.PI / 2 + progress * 2.8, 0, facing);
          fx.scale.setScalar(0.9 + progress * (boosted ? 4.4 : 2.8));
          fx.position.y = 1.15 + Math.sin(time * 12) * 0.22;
        } else if (kind === 3) {
          fx.rotation.y = time * 5.4;
          fx.scale.setScalar((boosted ? 1.25 : 0.9) + Math.sin(progress * Math.PI) * 1.1);
          fx.position.y = 1.35 + Math.sin(progress * Math.PI) * 0.52;
        } else if (kind === 4) {
          fx.rotation.set(-0.55, facing + Math.PI / 2, -0.9 + progress * 1.8);
          fx.scale.set(1.1 + progress * 2.8, 0.8 + progress * 0.5, 1.1 + progress * 2.8);
          fx.position.y = 1.1 + Math.sin(progress * Math.PI) * 0.38;
        } else if (kind === 5) {
          fx.rotation.set(-0.28, facing + Math.PI / 2, 0.8 - progress * 1.5);
          fx.scale.set(1.2 + progress * 3.5, 0.72 + progress * 0.6, 1.2 + progress * 3.5);
          fx.position.y = 1.42 + Math.sin(progress * Math.PI) * 0.55;
        } else {
          fx.position.x = hero.position.x + Math.sin(facing) * (2.4 + distance * 0.35);
          fx.position.z = hero.position.z + Math.cos(facing) * (2.4 + distance * 0.35);
          fx.position.y = 3.8 - progress * 2.1;
          fx.rotation.set(0, 0, 0);
          fx.scale.set(1.0 + progress * 1.4, 1.0, 1.0 + progress * 1.4);
        }
        elementalLight.position.copy(fx.position);
        elementalLight.intensity = (1 - progress) * (boosted ? 7.5 : 4.8);
        activeElementalLight = true;
      });
      if (!activeElementalLight && arcaneBurstLight.intensity === 0) elementalLight.intensity = 0;

      updateHeroArtifactStyle(heroArtifact, data.equippedArtifactIcon);
      if (heroArtifact.visible) {
        const orbit = time * 2.15;
        const side = 0.86 + Math.sin(time * 1.3) * 0.1;
        heroArtifact.position.set(
          hero.position.x + Math.cos(renderFacing) * side + Math.sin(orbit) * 0.26,
          hero.position.y + 1.68 + Math.sin(time * 3.1) * 0.16 + (data.heroAnimation === 'heal' ? 0.18 : 0),
          hero.position.z - Math.sin(renderFacing) * side + Math.cos(orbit) * 0.26
        );
        heroArtifact.rotation.y = time * 3.1;
        heroArtifact.rotation.x = Math.sin(time * 2.2) * 0.32;
        heroArtifact.rotation.z = Math.sin(time * 1.7) * 0.18;
        heroArtifact.scale.setScalar(1.16 + Math.sin(time * 4) * 0.1 + (data.heroAnimation === 'heal' ? 0.18 : 0));
        const artifactData = heroArtifact.userData as {
          halo: THREE.Mesh;
          trail: THREE.Mesh;
          shards: THREE.Group;
          light: THREE.PointLight;
        };
        artifactData.halo.rotation.z = time * 2.7;
        artifactData.trail.rotation.z = -time * 1.9;
        (artifactData.trail.material as THREE.MeshBasicMaterial).opacity = 0.42 + Math.sin(time * 5) * 0.12;
        artifactData.light.intensity = 1.9 + Math.sin(time * 4.6) * 0.55 + (data.heroAnimation === 'heal' ? 1.2 : 0);
        artifactData.shards.children.forEach((shard, index) => {
          const phase = typeof shard.userData.phase === 'number' ? shard.userData.phase : index;
          const shardOrbit = time * (2.7 + index * 0.12) + phase;
          shard.position.set(Math.cos(shardOrbit) * 0.46, Math.sin(time * 3 + phase) * 0.18, Math.sin(shardOrbit) * 0.46);
          shard.rotation.set(time * 2.2 + phase, time * 3.4 + phase, time * 1.6);
          shard.scale.setScalar(1 + Math.sin(time * 5 + phase) * 0.18);
        });
      }

      const visibleCount = Math.ceil((data.monstersLeft / 100) * monsters.children.length);
      const isMonsterBlocked = (x: number, z: number) => data.worldObstacles.some((box) =>
        Math.abs(x - box.x) <= box.halfX + 0.72 && Math.abs(z - box.z) <= box.halfZ + 0.72
      );
      const moveMonsterSafely = (monster: THREE.Group, dx: number, dz: number, index: number) => {
        const wasBlocked = isMonsterBlocked(monster.position.x, monster.position.z);
        const nextX = monster.position.x + dx;
        const nextZ = monster.position.z + dz;
        const isCrowded = monsters.children.some((other) => {
          if (other === monster || !other.visible) return false;
          const distanceX = other.position.x - nextX;
          const distanceZ = other.position.z - nextZ;
          return distanceX * distanceX + distanceZ * distanceZ < 2.8 * 2.8;
        });
        if (wasBlocked || (!isMonsterBlocked(nextX, nextZ) && !isCrowded)) {
          monster.position.setX(nextX);
          monster.position.setZ(nextZ);
          return;
        }
        if (!isMonsterBlocked(nextX, monster.position.z) && !isCrowded) {
          monster.position.setX(nextX);
          return;
        }
        if (!isMonsterBlocked(monster.position.x, nextZ) && !isCrowded) {
          monster.position.setZ(nextZ);
          return;
        }
        const side = index % 2 ? 1 : -1;
        const length = Math.max(0.001, Math.hypot(dx, dz));
        const sideX = monster.position.x - (dz / length) * length * side;
        const sideZ = monster.position.z + (dx / length) * length * side;
        if (!isMonsterBlocked(sideX, sideZ)) {
          monster.position.setX(sideX);
          monster.position.setZ(sideZ);
        }
      };
      monsters.children.forEach((monster, index) => {
        const current = monster as THREE.Group;
        const alive = index < visibleCount;
        current.visible = current.scale.x > 0.03 || alive;
        if (!current.visible) return;
        const baseScale = 0.86 + (index % 4) * 0.09;
        const targetScale = alive ? baseScale : 0;
        const nextScale = THREE.MathUtils.lerp(current.scale.x, targetScale, Math.min(1, delta * 7));
        current.scale.setScalar(nextScale);
        if (!alive) {
          current.position.y = Math.max(-0.4, current.position.y - delta * 1.6);
          return;
        }

        if (index === 0 && data.nearestMonster.alive) {
          const monsterWorldX = -3.4 + data.nearestMonster.x / 1000;
          const monsterWorldZ = 1.2 + data.nearestMonster.z / 1000;
          current.position.x = THREE.MathUtils.lerp(current.position.x, monsterWorldX, 1 - Math.exp(-delta * 10));
          current.position.z = THREE.MathUtils.lerp(current.position.z, monsterWorldZ, 1 - Math.exp(-delta * 10));
        }

        const toHeroX = hero.position.x - current.position.x;
        const toHeroZ = hero.position.z - current.position.z;
        const distance = Math.max(0.001, Math.hypot(toHeroX, toHeroZ));
        const wantsToKillHero = distance <= monsterAggroRangeMeters;
        const isPressuringHero = distance <= monsterPressureRangeMeters;
        const attackRange = monsterHitRangeMeters;
        current.userData.attackCooldown = Math.max(0, (current.userData.attackCooldown as number) - delta);
        const botAngle = (current.userData.botAngle as number) + Math.sin(time * 0.5 + index) * 0.35;
        const botOrbit = current.userData.botOrbit as number;
        const homeX = typeof current.userData.homeX === 'number' ? current.userData.homeX : current.position.x;
        const homeZ = typeof current.userData.homeZ === 'number' ? current.userData.homeZ : current.position.z;
        const targetRadius = distance > attackRange ? Math.max(0.2, attackRange - 0.85 + botOrbit * 0.18) : Math.max(2.8, attackRange - 0.45 + botOrbit * 0.12);
        const targetX = wantsToKillHero
          ? hero.position.x - (toHeroX / distance) * targetRadius + Math.cos(botAngle) * botOrbit
          : homeX + Math.cos(time * 0.35 + index) * (1.8 + botOrbit);
        const targetZ = wantsToKillHero
          ? hero.position.z - (toHeroZ / distance) * targetRadius + Math.sin(botAngle) * botOrbit
          : homeZ + Math.sin(time * 0.32 + index) * (1.8 + botOrbit);
        const moveX = targetX - current.position.x;
        const moveZ = targetZ - current.position.z;
        const moveDistance = Math.max(0.001, Math.hypot(moveX, moveZ));
        const speed = (current.userData.speed as number) * (wantsToKillHero && distance > monsterPressureRangeMeters ? 1.35 : isPressuringHero && distance > attackRange ? 1.55 : wantsToKillHero ? 0.82 : 0.45);

        if (!wantsToKillHero) {
          const stepDistance = Math.min(moveDistance, speed * delta * 0.58);
          moveMonsterSafely(current, (moveX / moveDistance) * stepDistance, (moveZ / moveDistance) * stepDistance, index);
          current.userData.attackFlash = Math.max(0, (current.userData.attackFlash as number) - delta * 1.8);
          current.userData.attackCycle = 0;
          current.userData.botState = 'patrol';
        } else if (distance > attackRange) {
          const stepDistance = Math.min(Math.max(0, distance - attackRange), speed * delta);
          moveMonsterSafely(
            current,
            (moveX / moveDistance) * stepDistance + shake * (index % 2 ? 0.012 : -0.012),
            (moveZ / moveDistance) * stepDistance,
            index
          );
          current.userData.attackFlash = Math.max(0, (current.userData.attackFlash as number) - delta * 1.8);
          current.userData.attackCycle = Math.max(0, (current.userData.attackCycle as number) - delta * 0.8);
          current.userData.botState = 'kill';
        } else {
          current.userData.attackCycle = ((current.userData.attackCycle as number) + delta * 1.55) % 1;
          current.userData.attackFlash = Math.min(1, (current.userData.attackFlash as number) + delta * 5);
          current.position.x -= (toHeroX / distance) * 0.018 * Math.sin(time * 14 + index);
          current.position.z -= (toHeroZ / distance) * 0.018 * Math.sin(time * 14 + index);
          current.userData.botState = 'kill';
          if ((current.userData.attackCooldown as number) === 0 && (current.userData.attackCycle as number) > 0.58) {
            current.userData.attackCooldown = 1.05 + (index % 4) * 0.12;
            current.userData.botState = 'kill';
          }
        }

        const walk = time * (distance > attackRange ? (isPressuringHero ? 10.8 : 8.4) : 5.4) + index;
        const attack = current.userData.attackFlash as number;
        const chaseIntensity = wantsToKillHero ? THREE.MathUtils.clamp(1 - distance / monsterAggroRangeMeters, 0.08, 1) : 0;
        const pressureIntensity = isPressuringHero ? THREE.MathUtils.clamp(1 - distance / monsterPressureRangeMeters, 0.18, 1) : 0;
        const breathing = Math.sin(time * (1.35 + (index % 5) * 0.08) + index) * (wantsToKillHero ? 0.014 : 0.03);
        const stalkLean = wantsToKillHero ? 0.04 + chaseIntensity * 0.14 : 0;
        const monsterBaseY = typeof current.userData.baseY === 'number' ? current.userData.baseY : 0.08;
        current.position.y = monsterBaseY + (attack > 0.4 ? Math.max(0, Math.sin(time * 22 + index)) * 0.025 : 0);
        const faceHero = Math.atan2(toHeroX, toHeroZ) + Math.PI;
        current.rotation.y = smoothAngle(current.rotation.y, faceHero, delta, distance > attackRange ? 4.8 : 3.6);
        current.rotation.y += Math.sin(walk) * (distance > attackRange ? 0.035 : 0.06);
        const attackCycle = current.userData.attackCycle as number;
        const monsterWindup = THREE.MathUtils.smoothstep(attackCycle, 0.05, 0.34);
        const monsterHit = Math.sin(THREE.MathUtils.clamp((attackCycle - 0.28) / 0.36, 0, 1) * Math.PI);
        const monsterRecover = THREE.MathUtils.smoothstep(attackCycle, 0.62, 0.98);
        const monsterSwing = attack * Math.max(monsterHit, monsterWindup * (1 - monsterRecover));
        const hitReact = Math.max(0, (current.userData.hitReact as number) || 0);
        current.userData.hitReact = Math.max(0, hitReact - delta * 1.9);
        current.position.y += Math.sin(hitReact * Math.PI) * 0.42;
        current.rotation.x -= hitReact * 0.34;
        current.rotation.z += (index % 2 ? 1 : -1) * hitReact * 0.28;
        const loadedMonsterModel = current.userData.loadedMonsterModel as THREE.Object3D | undefined;
        const loadedMonsterBaseScale =
          typeof current.userData.loadedMonsterBaseScale === 'number' ? current.userData.loadedMonsterBaseScale : 1;
        const loadedMonsterBaseRotationY = typeof current.userData.loadedMonsterBaseRotationY === 'number' ? current.userData.loadedMonsterBaseRotationY : Math.PI;
        const chaseWalkPower = distance > attackRange ? 1 : 0.45;
        if (loadedMonsterModel) {
          const loadedStep = Math.sin(walk * 1.28);
          const loadedLift = Math.abs(loadedStep) * chaseWalkPower;
          loadedMonsterModel.position.y = monsterHit * attack * 0.035 + Math.sin(hitReact * Math.PI) * 0.08;
          loadedMonsterModel.rotation.x = -0.08 - monsterSwing * 0.34 + loadedLift * 0.08 - hitReact * 0.55;
          loadedMonsterModel.rotation.y = loadedMonsterBaseRotationY + Math.sin(walk * 0.6 + index) * 0.11;
          loadedMonsterModel.rotation.z = loadedStep * 0.1 + monsterHit * attack * 0.22 + (index % 2 ? 1 : -1) * hitReact * 0.42;
          loadedMonsterModel.scale.setScalar(loadedMonsterBaseScale);
          const loadedMixer = current.userData.loadedMonsterMixer as THREE.AnimationMixer | undefined;
          const attackActions = current.userData.loadedMonsterAttacks as THREE.AnimationAction[] | undefined;
          const isAttacking = Boolean(current.userData.loadedMonsterAttacking);
          if (attackActions && monsterSwing > 0.45 && !isAttacking) {
            const attackIndex = (current.userData.loadedMonsterAttackIndex as number ?? 0) % attackActions.length;
            const attackAction = attackActions[attackIndex];
            attackAction.reset().setLoop(THREE.LoopOnce, 1).clampWhenFinished = true;
            attackAction.play();
            current.userData.loadedMonsterAttacking = true;
            current.userData.loadedMonsterAttackIndex = attackIndex + 1;
          }
          if (monsterSwing < 0.08) current.userData.loadedMonsterAttacking = false;
          loadedMixer?.update(delta);
          const downloadedClub = current.userData.downloadedClub as THREE.Group | undefined;
          if (downloadedClub) {
            downloadedClub.rotation.z = -0.8 - monsterWindup * 1.1 - monsterHit * 1.8 + monsterRecover * 0.9;
            downloadedClub.rotation.y = Math.sin(walk + index) * 0.14;
          }
        }
        const attackTrail = current.userData.attackTrail as THREE.Mesh | undefined;
        if (attackTrail) {
          const trailMaterial = attackTrail.material as THREE.MeshBasicMaterial;
          const trailPower = attack * Math.max(monsterHit, monsterWindup * 0.6);
          attackTrail.visible = trailPower > 0.04;
          trailMaterial.opacity = trailPower * 0.78;
          attackTrail.position.set(Math.sin(walk + index) * 0.12, 1.08 + monsterHit * 0.18, -0.62 - monsterHit * 0.28);
          attackTrail.rotation.set(-0.5 - monsterHit * 0.75, monsterWindup * 0.5, 0.9 - monsterRecover * 0.7);
          attackTrail.scale.setScalar(0.72 + trailPower * 0.82);
        }
        if (current.userData.isGoblin) {
          const skitter = Math.sin(walk * 1.45);
          const stab = monsterHit * attack;
          current.rotation.x = -0.12 - pressureIntensity * 0.16 - monsterSwing * 0.28 + Math.abs(skitter) * 0.035;
          current.rotation.z = Math.sin(walk * 0.7) * (0.11 + chaseIntensity * 0.04);
          current.userData.armL.rotation.x = 0.25 + skitter * (0.38 + chaseIntensity * 0.14) - monsterSwing * 0.65;
          current.userData.armL.rotation.z = -1.08 - monsterWindup * 0.3 + Math.sin(walk + 0.6) * 0.18;
          current.userData.armR.rotation.x = -0.45 - skitter * 0.42 - monsterWindup * 1.65 - stab * 2.1 + monsterRecover * 1.2;
          current.userData.armR.rotation.z = 1.15 + monsterWindup * 0.85 + stab * 0.55 + Math.sin(walk + 1.2) * 0.16;
          current.userData.legL.rotation.x = skitter * (0.78 + chaseIntensity * 0.18);
          current.userData.legR.rotation.x = -skitter * (0.78 + chaseIntensity * 0.18);
          current.userData.footL.rotation.x = -0.12 - skitter * 0.32;
          current.userData.footR.rotation.x = -0.12 + skitter * 0.32;
          current.userData.head.rotation.x = -0.1 - pressureIntensity * 0.08 + monsterSwing * 0.35 + Math.sin(walk * 0.7) * 0.1;
          current.userData.head.rotation.z = Math.sin(walk * 0.55) * 0.09;
          current.userData.jaw.rotation.x = attack ? 0.18 + pressureIntensity * 0.08 + stab * 0.32 : Math.max(0, Math.sin(walk * 0.8)) * (0.08 + pressureIntensity * 0.08);
          current.userData.earL.rotation.y = -0.34 + Math.sin(walk * 0.9) * (0.12 + pressureIntensity * 0.07);
          current.userData.earR.rotation.y = 0.34 - Math.sin(walk * 0.9) * (0.12 + pressureIntensity * 0.07);
          current.userData.knife.rotation.z = -0.18 - monsterWindup * 0.75 - stab * 1.05 + monsterRecover * 0.85;
          current.userData.knife.position.z = 0.02 + stab * 0.18;
          current.userData.goblinClub.rotation.z = -monsterWindup * 0.65 - stab * 1.15 + monsterRecover * 0.75 + Math.sin(walk) * 0.12;
        } else if (current.userData.isSpider) {
          const spiderStep = Math.sin(walk * 1.65);
          current.rotation.x = -0.22 - pressureIntensity * 0.12 - monsterSwing * 0.18 + Math.abs(spiderStep) * 0.04;
          current.rotation.z = Math.sin(walk * 0.8) * (0.08 + chaseIntensity * 0.03);
          current.position.y -= pressureIntensity * 0.035;
          current.userData.spiderLegs.children.forEach((leg: THREE.Object3D, legIndex: number) => {
            const side = legIndex < 4 ? -1 : 1;
            const phase = Math.sin(walk * 1.8 + legIndex * 0.7);
            leg.rotation.z = side * (1.02 + (legIndex % 4) * 0.12 + phase * (0.32 + chaseIntensity * 0.12));
            leg.rotation.x = 0.18 - (legIndex % 4) * 0.06 + Math.cos(walk * 1.5 + legIndex) * (0.16 + chaseIntensity * 0.08) - monsterSwing * 0.22;
          });
          current.userData.spiderFace.rotation.x = monsterSwing * 0.26 + Math.sin(walk) * 0.05;
          current.userData.spiderAbdomen.scale.y = 0.72 + Math.abs(spiderStep) * 0.18 + attack * 0.12 + breathing;
          current.userData.jaw.rotation.x = attack ? 0.1 + monsterHit * 0.38 : Math.max(0, Math.sin(walk)) * 0.08;
        } else if (current.userData.isStone || current.userData.isGiant) {
          const heavyStep = Math.sin(walk * 0.75);
          current.position.y += Math.max(0, Math.abs(heavyStep) - 0.55) * 0.12;
          current.rotation.x = -pressureIntensity * 0.1 - monsterSwing * 0.28 + Math.abs(heavyStep) * 0.025;
          current.rotation.z = heavyStep * (0.045 + chaseIntensity * 0.02);
          current.userData.armL.rotation.x = heavyStep * (0.26 + chaseIntensity * 0.08) - monsterSwing * 1.25;
          current.userData.armR.rotation.x = -heavyStep * 0.26 - monsterWindup * 1.1 - monsterHit * 1.95 + monsterRecover * 0.8;
          current.userData.legL.rotation.x = heavyStep * 0.28;
          current.userData.legR.rotation.x = -heavyStep * 0.28;
          current.userData.rockNubs.rotation.y = Math.sin(walk * 0.5) * 0.12;
          current.userData.giantDetails.rotation.x = monsterSwing * 0.12;
        } else if (current.userData.isWire) {
          const pulseWire = 1 + Math.sin(walk * 2.1) * 0.05 + attack * 0.08;
          current.rotation.x = -monsterSwing * 0.16;
          current.rotation.z = Math.sin(walk * 1.2) * 0.12;
          current.userData.wireFrame.scale.set(0.72 + pulseWire * 0.05, 1.85 + pulseWire * 0.12, 0.72 + pulseWire * 0.05);
          current.userData.wireFrame.rotation.y = time * 1.4 + index;
          current.userData.wireGlow.intensity = 1.2 + attack * 2 + Math.sin(time * 9 + index) * 0.35;
          current.userData.armL.rotation.x = Math.sin(walk) * 0.42 - monsterSwing * 0.8;
          current.userData.armR.rotation.x = -Math.sin(walk) * 0.42 - monsterHit * 1.4;
          current.userData.legL.rotation.x = Math.sin(walk) * 0.5;
          current.userData.legR.rotation.x = -Math.sin(walk) * 0.5;
        } else if (current.userData.isLizardBrute || current.userData.isCrawler) {
          const crawl = Math.sin(walk * 1.25);
          current.rotation.x = -0.08 - monsterSwing * 0.2 + Math.abs(crawl) * 0.05;
          current.rotation.z = crawl * 0.08;
          current.userData.armL.rotation.x = crawl * 0.44 - monsterSwing * 0.95;
          current.userData.armR.rotation.x = -crawl * 0.44 - monsterWindup * 1.05 - monsterHit * 1.7;
          current.userData.legL.rotation.x = crawl * 0.72;
          current.userData.legR.rotation.x = -crawl * 0.72;
          current.userData.head.rotation.y = Math.sin(walk * 0.7) * 0.12;
          current.userData.lizardTail.rotation.y = Math.sin(walk * 0.85 + index) * 0.36 + monsterSwing * 0.12;
          current.userData.lizardTail.rotation.z = Math.sin(walk * 0.55 + index) * 0.16;
          current.userData.backSpikes.rotation.x = Math.sin(walk * 0.6 + index) * 0.08;
        } else if (current.userData.isSawWarrior) {
          const sawStep = Math.sin(walk * 1.15);
          current.rotation.x = -monsterSwing * 0.16;
          current.rotation.z = sawStep * 0.06 + monsterHit * attack * 0.12;
          current.userData.saw.rotation.z = -monsterWindup * 0.8 - monsterHit * 1.5 + monsterRecover * 0.9 + time * (attack ? 3.4 : 1.1);
          current.userData.armR.rotation.x = -sawStep * 0.42 - monsterWindup * 1.4 - monsterHit * 1.8 + monsterRecover * 0.8;
          current.userData.armL.rotation.x = sawStep * 0.36 - monsterSwing * 0.55;
          current.userData.legL.rotation.x = sawStep * 0.52;
          current.userData.legR.rotation.x = -sawStep * 0.52;
          current.userData.armor.rotation.z = Math.sin(walk * 0.8) * 0.035;
        } else if (current.userData.isPale) {
          const sway = Math.sin(walk * 0.95);
          current.rotation.x = -0.05 - monsterSwing * 0.12;
          current.rotation.z = sway * 0.11;
          current.userData.paleDetails.scale.y = 1 + Math.abs(sway) * 0.08 + attack * 0.06;
          current.userData.jaw.rotation.x = 0.05 + Math.max(0, Math.sin(walk * 1.2)) * 0.18 + monsterHit * attack * 0.22;
          current.userData.armL.rotation.x = sway * 0.3 - monsterSwing * 0.7;
          current.userData.armR.rotation.x = -sway * 0.3 - monsterHit * 1.4;
          current.userData.legL.rotation.x = sway * 0.38;
          current.userData.legR.rotation.x = -sway * 0.38;
        } else if (current.userData.isOrc) {
          const stomp = Math.sin(walk);
          current.rotation.x = -monsterSwing * 0.2;
          current.rotation.z = stomp * 0.045;
          current.userData.orcAxe.rotation.z = monsterWindup * 0.9 + monsterHit * 1.25 - monsterRecover * 0.75;
          current.userData.armL.rotation.x = stomp * 0.38 - monsterSwing * 0.75;
          current.userData.armR.rotation.x = -stomp * 0.38 - monsterWindup * 1.45 - monsterHit * 1.9 + monsterRecover * 0.85;
          current.userData.legL.rotation.x = stomp * 0.48;
          current.userData.legR.rotation.x = -stomp * 0.48;
          current.userData.armor.rotation.x = Math.abs(stomp) * 0.025;
        } else {
          current.rotation.x = -monsterSwing * 0.18;
          current.rotation.z = 0;
          current.userData.armL.rotation.x = Math.sin(walk) * 0.48 - monsterSwing * 1.1;
          current.userData.armR.rotation.x = -Math.sin(walk) * 0.48 - monsterWindup * 1.2 - monsterHit * 1.7 + monsterRecover * 0.9;
          current.userData.armR.rotation.z = 0.85 + Math.sin(walk + 1.2) * 0.2 + monsterSwing * 1.25;
          current.userData.legL.rotation.x = Math.sin(walk) * 0.55;
          current.userData.legR.rotation.x = -Math.sin(walk) * 0.55;
          current.userData.footL.rotation.x = -Math.sin(walk) * 0.25;
          current.userData.footR.rotation.x = Math.sin(walk) * 0.25;
          current.userData.head.rotation.x = monsterSwing * 0.22 + Math.sin(walk * 0.6) * 0.04;
          current.userData.club.rotation.z = attack ? -0.35 - monsterWindup * 0.9 - monsterHit * 1.1 + monsterRecover * 0.8 : Math.sin(walk) * 0.18;
        }
        if (current.userData.lizardTail instanceof THREE.Group) {
          current.userData.lizardTail.rotation.y = Math.sin(walk * 0.6 + index) * 0.22;
          current.userData.lizardTail.rotation.z = Math.sin(walk * 0.4 + index) * 0.08;
        }
        if (current.userData.backSpikes instanceof THREE.Group) {
          current.userData.backSpikes.rotation.x = Math.sin(walk * 0.35 + index) * 0.06;
        }
        if (current.scale.x > 0.03) {
          current.rotation.x -= stalkLean * (distance > attackRange ? 0.65 : 0.25);
          current.rotation.z += Math.sin(walk * 0.45 + index) * (wantsToKillHero ? 0.028 : 0.012);
        }
      });

      const bossSceneKey = data.sceneKey.toLowerCase();
      const avalancheActive = data.monsterKind === 'avalanche' && data.monstersLeft > 0;
      avalancheDragons.children.forEach((avalancheDragon, index) => {
        avalancheDragon.visible = avalancheActive;
        if (!avalancheActive) return;

        const phase = avalancheDragon.userData.phase as number;
        const radius = avalancheDragon.userData.radius as number;
        const flightAngle = time * (0.18 + (index % 3) * 0.035) + phase;
        const attackPulse = Math.max(0, Math.sin(time * 2.4 + phase));
        const targetX = heroWorldX + Math.cos(flightAngle) * radius * (1 - attackPulse * 0.34);
        const targetZ = heroWorldZ + Math.sin(flightAngle) * radius - 8 * attackPulse;
        avalancheDragon.position.set(
          targetX,
          4.5 + (index % 4) * 1.25 + Math.sin(time * 2 + phase) * 0.7 - attackPulse * 2.1,
          targetZ,
        );
        // Avalanche dragons are built with their heads on local +X.
        avalancheDragon.rotation.y = Math.atan2(targetZ - heroWorldZ, heroWorldX - targetX);
        avalancheDragon.rotation.x = -0.08 - attackPulse * 0.32;
        avalancheDragon.rotation.z = Math.sin(time * 3.4 + phase) * 0.12;
        const baseScale = 0.32 + (index % 4) * 0.035;
        avalancheDragon.scale.setScalar(baseScale * (1 + attackPulse * 0.14));
      });
      const specialBossKey =
        data.isFinalReveal || data.monstersLeft > 0
          ? ''
          : bossSceneKey.includes('death')
            ? 'death'
            : bossSceneKey.includes('admin')
              ? 'admin'
              : bossSceneKey.includes('ais')
                ? 'ais'
                : bossSceneKey.includes('arailm')
                  ? 'arailm'
                  : bossSceneKey.includes('mansur')
                    ? 'mansur'
                    : bossSceneKey.includes('anuar')
                      ? 'anuar'
                      : bossSceneKey.includes('fury')
                        ? 'fury'
                        : bossSceneKey.includes('goblin')
                          ? 'goblin'
                          : bossSceneKey.includes('spirit')
                            ? 'spirit'
                            : bossSceneKey.includes('bbi')
                              ? 'bbi'
                              : bossSceneKey.includes('nurali')
                                ? 'nurali'
                                : '';
      const activeSpecialBoss = specialBossKey ? specialBossModels[specialBossKey] : null;
      specialBosses.children.forEach((boss) => {
        boss.visible = boss === activeSpecialBoss;
      });
      dragon.visible = !data.isFinalReveal && data.monstersLeft <= 0 && !activeSpecialBoss;
      nightKingBoss.visible = false;
      if (activeSpecialBoss) {
        const bossTargetAngle = Math.atan2(heroWorldX - activeSpecialBoss.position.x, heroWorldZ - activeSpecialBoss.position.z);
        activeSpecialBoss.rotation.y = smoothAngle(activeSpecialBoss.rotation.y, bossTargetAngle, delta, 1.9);
        const bossPhase = typeof activeSpecialBoss.userData.phase === 'number' ? activeSpecialBoss.userData.phase : 0;
        const bossAttackPulse = Math.max(pulse * 2.2, Math.max(0, Math.sin(time * (specialBossKey === 'fury' || specialBossKey === 'admin' ? 3.8 : 2.6) + bossPhase)));
        const bossFloat = Math.sin(time * (specialBossKey === 'fury' || specialBossKey === 'admin' ? 2.4 : 1.25) + bossPhase);
        activeSpecialBoss.position.set(
          3.6 + shake * 0.82 + Math.sin(time * 0.9 + bossPhase) * 0.12,
          bossFloat * (specialBossKey === 'ais' || specialBossKey === 'spirit' ? 0.24 : 0.1) + bossAttackPulse * 0.08,
          -2.2 + Math.sin(time * 0.7 + bossPhase) * 0.28
        );
        activeSpecialBoss.rotation.x = -bossAttackPulse * (specialBossKey === 'death' || specialBossKey === 'admin' ? 0.16 : 0.08) + Math.sin(time * 1.1 + bossPhase) * 0.025;
        activeSpecialBoss.rotation.z = Math.sin(time * 1.35 + bossPhase) * (specialBossKey === 'fury' ? 0.08 : 0.035) + bossAttackPulse * 0.045;
        const attackGlow = Math.max(0, Math.sin(time * (specialBossKey === 'admin' ? 9 : 5.8) + bossPhase));
        const bossBaseScale = typeof activeSpecialBoss.userData.baseScale === 'number' ? activeSpecialBoss.userData.baseScale : activeSpecialBoss.scale.x;
        activeSpecialBoss.scale.set(
          bossBaseScale * (1 + attackGlow * (specialBossKey === 'death' || specialBossKey === 'admin' ? 0.055 : 0.035)),
          bossBaseScale * (1 + Math.sin(time * 1.7 + bossPhase) * 0.025 + bossAttackPulse * 0.05),
          bossBaseScale * (1 + attackGlow * 0.025)
        );
        activeSpecialBoss.children.forEach((part, partIndex) => {
          if (part instanceof THREE.Mesh || part instanceof THREE.Group) {
            part.rotation.x += Math.sin(time * (1.8 + partIndex * 0.08) + bossPhase) * delta * 0.08;
            part.rotation.z += Math.cos(time * (1.4 + partIndex * 0.07) + bossPhase) * delta * 0.06;
          }
        });
        const bossTint = typeof activeSpecialBoss.userData.tint === 'string' ? activeSpecialBoss.userData.tint : '#ff2a1f';
        (specialBossAura.material as THREE.MeshBasicMaterial).color.set(bossTint);
        specialBossAura.visible = true;
        specialBossAura.position.set(activeSpecialBoss.position.x, 0.05, activeSpecialBoss.position.z);
        specialBossAura.rotation.z = time * (specialBossKey === 'admin' ? 2.6 : 1.4);
        specialBossAura.scale.setScalar(1 + bossAttackPulse * 0.38 + Math.sin(time * 3 + bossPhase) * 0.08);
        (specialBossAura.material as THREE.MeshBasicMaterial).opacity = 0.28 + bossAttackPulse * 0.38;
        (specialBossBlast.material as THREE.MeshBasicMaterial).color.set(bossTint);
        specialBossBlast.visible = bossAttackPulse > 0.42;
        specialBossBlast.position.set(
          activeSpecialBoss.position.x - Math.sin(activeSpecialBoss.rotation.y) * (2.0 + bossAttackPulse),
          1.85 + bossAttackPulse * 0.65,
          activeSpecialBoss.position.z - Math.cos(activeSpecialBoss.rotation.y) * (2.0 + bossAttackPulse)
        );
        specialBossBlast.rotation.set(Math.PI / 2, activeSpecialBoss.rotation.y, 0);
        specialBossBlast.scale.set(0.8 + bossAttackPulse * 1.15, 0.72 + bossAttackPulse * 0.85, 0.8 + bossAttackPulse * 1.15);
        (specialBossBlast.material as THREE.MeshBasicMaterial).opacity = Math.min(0.8, bossAttackPulse * 0.7);
      } else if (nightKingBoss.visible) {
        specialBossAura.visible = false;
        specialBossBlast.visible = false;
        const bossTargetAngle = Math.atan2(heroWorldX - nightKingBoss.position.x, heroWorldZ - nightKingBoss.position.z);
        nightKingBoss.rotation.y = smoothAngle(nightKingBoss.rotation.y, bossTargetAngle, delta, 2.0);
        nightKingBoss.position.y = Math.sin(time * 1.2) * 0.08;
        nightKingBoss.position.x = shake * 0.85;
        const bossHead = nightKingFallback.userData.head;
        if (bossHead instanceof THREE.Object3D) {
          bossHead.rotation.x = -0.08 + Math.sin(time * 1.8) * 0.025;
          bossHead.rotation.y = Math.sin(time * 1.4) * 0.045;
        }
      } else {
        specialBossAura.visible = false;
        specialBossBlast.visible = false;
      }

      const magicCaster = activeSpecialBoss ?? (dragon.visible && data.monstersLeft <= 0 ? dragon : null);
      const magicKey = activeSpecialBoss ? specialBossKey : 'anuar';
      bossMagicCooldown = Math.max(0, bossMagicCooldown - delta);
      if (magicCaster && bossMagicCooldown === 0) {
        const projectile = bossMagicProjectiles.children.find((item) => !item.visible) as THREE.Mesh | undefined;
        if (projectile) {
          const spellColor = bossMagicColors[magicKey] ?? '#ff5a1f';
          const spellName = bossMagicNames[magicKey] ?? 'магический снаряд';
          const isSpike = magicKey === 'mansur' || magicKey === 'nurali' || magicKey === 'arailm';
          projectile.visible = true;
          projectile.position.copy(magicCaster.position).add(new THREE.Vector3(0, 1.6, 0));
          projectile.scale.set(isSpike ? 0.72 : 1, isSpike ? 1.8 : 1, isSpike ? 0.72 : 1);
          (projectile.material as THREE.MeshBasicMaterial).color.set(spellColor);
          projectile.userData.spell = spellName;
          projectile.userData.life = 0;
          const target = new THREE.Vector3(heroWorldX, 1.1, heroWorldZ);
          projectile.userData.velocity.copy(target.sub(projectile.position).normalize().multiplyScalar(isSpike ? 7.5 : 6.2));
          bossMagicCooldown = 2.6 + (magicKey === 'admin' || magicKey === 'death' ? 0.5 : 0);
        }
      }
      bossMagicProjectiles.children.forEach((item) => {
        const projectile = item as THREE.Mesh;
        if (!projectile.visible) return;
        projectile.userData.life = (projectile.userData.life as number) + delta;
        projectile.position.addScaledVector(projectile.userData.velocity as THREE.Vector3, delta);
        projectile.rotation.x += delta * 8;
        projectile.rotation.y += delta * 10;
        const distanceToHero = Math.hypot(projectile.position.x - heroWorldX, projectile.position.z - heroWorldZ);
        if (distanceToHero < 0.65 || (projectile.userData.life as number) > 4) {
          if (distanceToHero < 0.65) refs.current.onBossMagicHit(projectile.userData.spell as string);
          projectile.visible = false;
        }
      });
      const dragonData = dragon.userData as {
        bodyMat: THREE.MeshStandardMaterial;
        body: THREE.Mesh;
        head: THREE.Mesh;
        neck: THREE.Mesh;
        wingL: THREE.Group;
        wingR: THREE.Group;
        fire: THREE.Mesh;
        loadedFire?: THREE.Mesh;
        loadedAura?: THREE.Mesh;
        aura?: THREE.Mesh;
        jaw: THREE.Mesh;
        tail: THREE.Group;
        spines: THREE.Group;
        crest: THREE.Group;
        loadedModel?: THREE.Object3D;
        loadedBaseScale?: number;
        loadedMixer?: THREE.AnimationMixer;
        loadedActions?: Record<string, THREE.AnimationAction>;
        activeLoadedAction?: string;
      };
      dragonData.loadedMixer?.update(delta);
      const dragonVariant = Math.abs(data.chapter + data.locationIndex) % 10;
      const variantWidth = [1, 1.2, 0.86, 1.34, 0.94, 1.12, 1.42, 0.78, 1.27, 1.55][dragonVariant];
      const variantHeight = [1, 0.9, 1.22, 0.82, 1.3, 1.08, 0.96, 1.42, 1.16, 0.76][dragonVariant];
      const variantLength = [1, 0.92, 1.16, 1.25, 0.88, 1.32, 1.08, 1.38, 0.82, 1.48][dragonVariant];
      dragonData.crest.children.forEach((horn, index) => {
        horn.visible = index <= dragonVariant && (dragonVariant < 7 || index % 2 === dragonVariant % 2);
        const hornScale = 0.72 + dragonVariant * 0.065;
        horn.scale.set(hornScale, hornScale * (dragonVariant >= 7 ? 1.45 : 1), hornScale);
      });
      dragonData.crest.rotation.y = Math.sin(time * 1.4) * 0.035;
      if (dragonData.loadedModel && dragonData.loadedBaseScale) {
        const baseScale = dragonData.loadedBaseScale;
        dragonData.loadedModel.scale.set(
          baseScale * variantLength,
          baseScale * variantHeight,
          baseScale * variantWidth
        );
      }
      const playDragonClip = (clipName: string, fade = 0.18, timeScale = 1) => {
        const actions = dragonData.loadedActions;
        if (!actions?.[clipName] || dragonData.activeLoadedAction === clipName) return;
        const nextAction = actions[clipName];
        const previousAction = dragonData.activeLoadedAction ? actions[dragonData.activeLoadedAction] : undefined;
        if (previousAction && previousAction !== nextAction) previousAction.fadeOut(fade);
        nextAction.enabled = true;
        nextAction.timeScale = timeScale;
        nextAction.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(fade).play();
        dragonData.activeLoadedAction = clipName;
      };
      if (dragonData.loadedActions) {
        if (pulse > 0.12) playDragonClip('Run-loop', 0.08, 1.45 + dragonVariant * 0.08);
        else playDragonClip('Idle-loop', 0.22, 0.86 + dragonVariant * 0.07);
      }
      dragonData.bodyMat.color.set(data.dragonColor);
      const threat = Math.max(pulse * 1.4, Math.max(0, Math.sin(time * 1.55)) * 0.34);
      const dragonBreathing = Math.sin(time * 1.8);
      const wingBeat = Math.sin(time * (6.2 + threat * 2.2));
      const wingSnap = Math.max(0, wingBeat) ** 1.7;
      const headSnap = Math.max(0, Math.sin(time * 3.2 + pulse * 2.4));
      const flameFlicker = 0.85 + Math.max(0, Math.sin(time * 17.5)) * 0.28 + Math.sin(time * 31) * 0.08;
      dragon.position.y = Math.sin(time * 2.1) * 0.18 + threat * 0.08 + wingSnap * 0.045;
      dragon.position.x = 4.75 + shake * 1.45 - threat * 0.25 - headSnap * threat * 0.08;
      // The main dragon also faces local +X. Using the usual +Z angle made
      // it turn its tail toward the hero while attacking.
      const dragonTargetAngle = Math.atan2(
        dragon.position.z - heroWorldZ,
        heroWorldX - dragon.position.x
      );
      dragon.rotation.y = smoothAngle(dragon.rotation.y, dragonTargetAngle, delta, 2.4);
      dragon.rotation.x = -threat * 0.035 + dragonBreathing * 0.012;
      dragonData.body.scale.set(
        (1.95 + threat * 0.035) * variantLength,
        (1.22 + dragonBreathing * 0.055 + threat * 0.045) * variantHeight,
        (0.92 + Math.abs(dragonBreathing) * 0.025 + threat * 0.035) * variantWidth
      );
      dragonData.head.scale.set(1 + dragonVariant * 0.035, 1 + (6 - dragonVariant) * 0.018, 0.9 + dragonVariant * 0.045);
      dragonData.neck.scale.set(0.9 + dragonVariant * 0.055, 0.92 + dragonVariant * 0.035, 0.9 + dragonVariant * 0.04);
      dragonData.neck.rotation.z = -0.78 + Math.sin(time * 2.2) * 0.08 - threat * 0.14 - headSnap * 0.06;
      dragonData.neck.rotation.y = Math.sin(time * 1.35) * 0.07 + threat * 0.035;
      dragonData.head.rotation.x = -0.04 - threat * 0.08 + headSnap * 0.05;
      dragonData.head.rotation.y = Math.sin(time * 2.1) * 0.1 + headSnap * 0.08;
      dragonData.head.rotation.z = Math.sin(time * 1.7) * 0.055 - threat * 0.075;
      dragonData.spines.rotation.z = Math.sin(time * 2.6) * 0.035 - threat * 0.05;
      dragonData.spines.rotation.x = Math.sin(time * 1.9) * 0.025 - threat * 0.035;
      dragonData.wingL.rotation.z = -0.92 + wingBeat * 0.48 + wingSnap * 0.28 - threat * 0.28;
      dragonData.wingR.rotation.z = 0.92 - wingBeat * 0.48 - wingSnap * 0.28 + threat * 0.28;
      dragonData.wingL.rotation.x = Math.sin(time * 4.8) * 0.1 + threat * 0.18 - wingSnap * 0.12;
      dragonData.wingR.rotation.x = -Math.sin(time * 4.8) * 0.1 - threat * 0.18 + wingSnap * 0.12;
      dragonData.wingL.rotation.y = 0.08 + Math.sin(time * 3.1) * 0.05 + threat * 0.04;
      dragonData.wingR.rotation.y = -0.08 - Math.sin(time * 3.1) * 0.05 - threat * 0.04;
      dragonData.jaw.rotation.z = -0.18 - burn * 0.18 - threat * 0.28 - Math.max(0, Math.sin(time * 7.5)) * 0.16;
      dragonData.tail.rotation.y = Math.sin(time * 1.8) * 0.34 + threat * 0.16;
      dragonData.tail.rotation.z = Math.sin(time * 1.35) * 0.11 + headSnap * threat * 0.06;
      dragonData.tail.children.forEach((segment, segmentIndex) => {
        segment.rotation.y = Math.sin(time * 1.65 + segmentIndex * 0.62) * (0.08 + threat * 0.045);
        segment.rotation.z = 1.12 - segmentIndex * 0.12 + Math.cos(time * 1.35 + segmentIndex * 0.5) * 0.045;
      });
      dragonData.fire.scale.set(
        (1.15 + threat * 0.72) * flameFlicker,
        1.05 + burn * 0.9 + threat * 0.9 + Math.sin(time * 16) * 0.18,
        (1.15 + threat * 0.72) * (0.95 + Math.sin(time * 21) * 0.08)
      );
      (dragonData.fire.material as THREE.MeshBasicMaterial).opacity = dragon.visible ? Math.min(0.96, 0.48 + threat * 0.42 + burn * 0.18) : 0;
      if (dragonData.aura) {
        dragonData.aura.scale.setScalar(1 + threat * 0.42 + Math.sin(time * 3) * 0.08);
        (dragonData.aura.material as THREE.MeshBasicMaterial).opacity = dragon.visible ? 0.2 + threat * 0.28 : 0;
      }
      if (dragonData.loadedAura) {
        dragonData.loadedAura.visible = dragon.visible;
        dragonData.loadedAura.scale.setScalar(1 + threat * 0.48 + Math.sin(time * 3.4) * 0.08);
        (dragonData.loadedAura.material as THREE.MeshBasicMaterial).opacity = dragon.visible ? 0.16 + threat * 0.32 : 0;
      }
      if (dragonData.loadedFire) {
        const breathPower = dragon.visible ? Math.max(pulse * 2.8, threat) : 0;
        dragonData.loadedFire.visible = breathPower > 0.04;
        (dragonData.loadedFire.material as THREE.MeshBasicMaterial).opacity = Math.min(0.95, 0.18 + breathPower * 0.95);
        dragonData.loadedFire.scale.set(
          (1.2 + breathPower * 1.35) * flameFlicker,
          1 + burn * 0.68 + breathPower * 0.72 + Math.sin(time * 18) * 0.14,
          (1.2 + breathPower * 1.35) * (0.95 + Math.sin(time * 23) * 0.08)
        );
        dragonData.loadedFire.position.set(2.75 + breathPower * 1.18 + headSnap * 0.12, 3.45 + Math.sin(time * 8) * 0.08 - threat * 0.08, Math.sin(time * 11) * 0.035);
      }

      const breathCycle = time % 6;
      const isBreathingFire = dragon.visible && (breathCycle > 2.8 && breathCycle < 4.9 || pulse > 0.24);
      const breathCharge = THREE.MathUtils.clamp((breathCycle - 2.8) / 0.42, 0, 1);
      const breathFade = THREE.MathUtils.clamp((4.9 - breathCycle) / 0.34, 0, 1);
      const breathStrength = pulse > 0.24 ? 1 : Math.min(breathCharge, breathFade);
      dragonBreath.visible = isBreathingFire;
      if (isBreathingFire) {
        const mouth = new THREE.Vector3(dragon.position.x, dragon.position.y + 4.15, dragon.position.z);
        const target = new THREE.Vector3(heroWorldX, Math.max(0.6, data.heroHeight + 1.1), heroWorldZ);
        const breathLength = Math.min(24, Math.max(5, mouth.distanceTo(target)));
        dragonBreath.position.copy(mouth);
        dragonBreath.lookAt(target);
        breathCore.position.set(0, 0, -breathLength / 2);
        breathCore.scale.set(0.7 + breathStrength * 0.65, breathLength, 0.7 + breathStrength * 0.65);
        (breathCore.material as THREE.MeshBasicMaterial).opacity = 0.42 + breathStrength * 0.42;
        breathLight.position.set(0, 0.2, -Math.min(5, breathLength * 0.35));
        breathLight.intensity = 4 + breathStrength * 9;
        dragonBreath.children.slice(1, 19).forEach((object) => {
          const flame = object as THREE.Mesh;
          const seed = flame.userData.seed as number;
          const travel = (time * (1.7 + breathStrength) + seed) % 1;
          const spread = 0.12 + travel * 0.85;
          flame.position.set(
            Math.sin(seed * 7 + time * 13) * spread,
            Math.cos(seed * 5 + time * 11) * spread,
            -travel * breathLength
          );
          flame.scale.setScalar((0.55 + travel * 1.5) * breathStrength);
          flame.rotation.x += delta * 7;
          flame.rotation.y += delta * 9;
          (flame.material as THREE.MeshBasicMaterial).opacity = (1 - travel * 0.72) * breathStrength;
        });
        dragonData.jaw.rotation.z -= breathStrength * 0.38;
        dragonData.head.rotation.x -= breathStrength * 0.12;
      }

      motes.children.forEach((mote) => {
        const seed = typeof mote.userData.seed === 'number' ? mote.userData.seed : 0;
        mote.position.y += 0.012 + Math.sin(time + seed) * 0.003;
        mote.position.x += Math.sin(time * 0.8 + seed) * 0.006 + Math.sin(time * 2.1 + seed) * 0.002;
        mote.position.z += Math.cos(time * 0.6 + seed) * 0.004 + Math.cos(time * 1.7 + seed) * 0.002;
        mote.rotation.x += delta * (0.7 + (seed % 3) * 0.1);
        mote.rotation.y += delta * (1.1 + (seed % 5) * 0.08);
        mote.scale.setScalar(1 + Math.sin(time * 2.4 + seed) * 0.18);
        if (mote.position.y > 13.6) mote.position.y = 0.5;
      });

      const backDistance = data.isHeroMoving ? 13.2 : 11.4;
      const sideOffset = data.isHeroMoving ? 1.45 : 0.95;
      const cameraHeight = data.isHeroMoving ? 6.1 : 5.2;
      const lookAhead = data.isHeroMoving ? 8.4 : 6.2;
      const lookHeight = 1.75;
      cameraTarget.set(
        hero.position.x - Math.sin(cameraYaw) * backDistance + Math.cos(cameraYaw) * sideOffset + shake * 0.45,
        hero.position.y + cameraHeight + Math.sin(time * 0.6) * 0.04,
        hero.position.z - Math.cos(cameraYaw) * backDistance - Math.sin(cameraYaw) * sideOffset
      );
      lookTarget.set(
        hero.position.x + Math.sin(cameraYaw) * lookAhead,
        hero.position.y + lookHeight,
        hero.position.z + Math.cos(cameraYaw) * lookAhead
      );
      const followSpeed = data.isHeroMoving ? 3.7 : 6.1;
      if (!cameraReady) {
        camera.position.copy(cameraTarget);
        smoothLookTarget.copy(lookTarget);
        cameraReady = true;
      } else {
        camera.position.lerp(cameraTarget, 1 - Math.exp(-delta * followSpeed));
        smoothLookTarget.lerp(lookTarget, 1 - Math.exp(-delta * followSpeed));
      }
      camera.lookAt(smoothLookTarget);

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };

    resize();
    animate();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      refs.current.onReady(false);
      window.clearTimeout(modelReadyFallback);
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement);
      heroMixers.forEach(mixer => mixer.stopAllAction());
      sceneLighting.dispose();
      disposeScene(scene, true);
      renderer.dispose();
    };
  }, [attempt]);

  return (
    <div className={`battle-3d ${modelsReady ? 'ready' : 'loading'}`} ref={mountRef}>
      {renderError ? (
        <div className="battle-3d-loading render-error" role="alert">
          <strong>Не удалось запустить 3D</strong>
          <small>Игра на паузе. Включи аппаратное ускорение или попробуй другой браузер.</small>
          <button type="button" onClick={event => { event.stopPropagation(); setAttempt(value => value + 1); }}>Попробовать снова</button>
        </div>
      ) : !modelsReady && (
        <div className="battle-3d-loading" role="status" aria-live="polite">
          <span className="loading-sigil" aria-hidden="true" />
          <strong>Загрузка моделей</strong>
          <small>Герой, гоблины и карты готовятся</small>
        </div>
      )}
    </div>
  );
}
