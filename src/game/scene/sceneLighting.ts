import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function createSceneLighting(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const ambient = new THREE.HemisphereLight('#c3d2dd', '#70604b', 1.6);
  const sun = new THREE.DirectionalLight('#ffe2b3', 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { near: 1, far: 160, left: -38, right: 38, top: 38, bottom: -38 });
  sun.shadow.normalBias = 0.045;
  sun.shadow.bias = -0.00015;
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(ambient, sun, sun.target);
  const room = new RoomEnvironment();
  const generator = new THREE.PMREMGenerator(renderer);
  const environment = generator.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.28;
  room.dispose();
  generator.dispose();

  const skyMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { horizon: { value: new THREE.Color('#bfc4b8') }, zenith: { value: new THREE.Color('#567286') } },
    vertexShader: 'varying vec3 skyDirection; void main() { skyDirection = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      varying vec3 skyDirection;
      uniform vec3 horizon;
      uniform vec3 zenith;
      void main() {
        vec3 direction = normalize(skyDirection);
        float height = max(direction.y, 0.0);
        vec3 color = mix(horizon, zenith, pow(height, 0.45));
        float clouds = sin(direction.x * 14.0 + sin(direction.z * 21.0)) * sin(direction.z * 17.0);
        color = mix(color, horizon * 1.1, smoothstep(0.25, 0.8, clouds) * smoothstep(0.02, 0.3, height) * 0.16);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(800, 24, 12), skyMaterial);
  sky.frustumCulled = false;
  scene.add(sky);
  scene.fog = new THREE.Fog('#bfc4b8', 65, 440);
  return {
    update(position: THREE.Vector3, camera: THREE.Camera) {
      // Texel snapping keeps stationary shadows from shimmering while walking.
      const step = 76 / sun.shadow.mapSize.x;
      const x = Math.round(position.x / step) * step;
      const z = Math.round(position.z / step) * step;
      sun.position.set(x - 35, 65, z + 28);
      sun.target.position.set(x, 0, z);
      sky.position.copy(camera.position);
    },
    setMood(ending: boolean) {
      const horizon = ending ? '#626571' : '#bfc4b8';
      skyMaterial.uniforms.horizon.value.set(horizon);
      skyMaterial.uniforms.zenith.value.set(ending ? '#202b3e' : '#567286');
      if (scene.fog instanceof THREE.Fog) scene.fog.color.set(horizon);
      ambient.intensity = ending ? 1 : 1.6;
      sun.intensity = ending ? 1.8 : 3;
    },
    dispose() { environment.dispose(); },
  };
}
