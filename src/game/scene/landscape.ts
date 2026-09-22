import * as THREE from 'three';
import { setSurfaceUVs,type SurfaceMaterials } from './surfaceMaterials';

export function addLandscape(root: THREE.Group, surfaces: SurfaceMaterials) {
  const groundMaterial = surfaces.get('earth', '#8e9270').clone();
  groundMaterial.userData.sharedSurface = true;
  groundMaterial.onBeforeCompile = (shader) => {
    shader.vertexShader = 'varying vec2 terrainPosition;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\nterrainPosition = position.xy;');
    shader.fragmentShader = 'varying vec2 terrainPosition;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
      #include <map_fragment>
      vec2 p = terrainPosition;
      float patches = sin(p.x * 0.14 + sin(p.y * 0.08) * 2.0) * sin(p.y * 0.19) * 0.5 + 0.5;
      float road = 1.0 - smoothstep(4.0, 5.8, min(abs(p.x), abs(p.y - 2.0)));
      vec3 meadow = mix(vec3(0.46, 0.55, 0.3), vec3(0.88, 0.82, 0.61), patches);
      diffuseColor.rgb *= mix(meadow, vec3(0.9, 0.8, 0.64), road);
    `);
  };
  groundMaterial.customProgramCacheKey = () => 'landscape-ground-v1';
  const groundGeometry = new THREE.PlaneGeometry(10_160, 10_160);
  setSurfaceUVs(groundGeometry, 3.5);
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.055;
  ground.receiveShadow = true;
  root.add(ground);

  const stone = surfaces.get('stone', '#a59c89');
  for (const [width, length, z] of [[8, 220, 0], [220, 6, -2]]) {
    const geometry = new THREE.PlaneGeometry(width, length);
    setSurfaceUVs(geometry, 3.2);
    const road = new THREE.Mesh(geometry, stone);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -0.032 + (z ? 0.004 : 0), z);
    road.receiveShadow = true;
    root.add(road);
  }
  return () => groundMaterial.dispose();
}
