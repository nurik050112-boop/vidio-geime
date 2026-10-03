import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { disposeScene } from '../../game/scene/disposeScene';
import { fitMapPropModel } from '../../game/scene/models/fitHeroModel';

export function WorldBossModel() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    let disposed = false;
    let frame = 0;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 2.2, 9);
    camera.lookAt(0, 1.3, 0);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setError(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight('#d9e8ff', '#352a22', 2.1);
    const keyLight = new THREE.DirectionalLight('#fff2d8', 3);
    keyLight.position.set(3, 6, 5);
    keyLight.castShadow = true;
    const rimLight = new THREE.PointLight('#da482e', 24, 14);
    rimLight.position.set(-3, 3, -2);
    scene.add(ambient, keyLight, rimLight);

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const loader = new FBXLoader();
    loader.load('/models/quaternius-monsters/ultimate/Yeti.fbx', (boss) => {
      if (disposed) {
        disposeScene(boss, true);
        return;
      }
      boss.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });
      fitMapPropModel(boss, 4.5);
      boss.position.y = 0;
      scene.add(boss);
      if (boss.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(boss);
        mixer.clipAction(boss.animations[0]).play();
        boss.userData.mixer = mixer;
      }
    }, undefined, () => {
      if (!disposed) {
        console.error('Не удалось загрузить модель мирового босса.');
        setError(true);
      }
    });

    const clock = new THREE.Clock();
    const animate = () => {
      if (disposed) return;
      const delta = clock.getDelta();
      scene.traverse((object) => {
        const mixer = object.userData.mixer as THREE.AnimationMixer | undefined;
        mixer?.update(delta);
      });
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      disposeScene(scene, true);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="boss-model-frame" aria-label="3D-модель мирового босса">
      <div className="boss-model-canvas" ref={mountRef} />
      {error && <span className="boss-model-error" role="status">3D-модель не загрузилась — бой всё равно доступен.</span>}
    </div>
  );
}
