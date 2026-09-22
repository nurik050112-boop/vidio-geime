import * as THREE from 'three';
import { forestTrees,seededRandom } from './sceneryLayout';
import { setSurfaceUVs,type SurfaceMaterials } from './surfaceMaterials';

type Obstacle = { x: number; z: number; halfX: number; halfZ: number };

export function addVegetation(root: THREE.Group, surfaces: SurfaceMaterials, obstacles: Obstacle[]) {
  const transform = new THREE.Object3D();
  const random = seededRandom(8146);
  const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.32, 1, 7);
  setSurfaceUVs(trunkGeometry, 1.5);
  const trunks = new THREE.InstancedMesh(trunkGeometry, surfaces.get('wood', '#75614b'), forestTrees.length);
  const crownGeometry = new THREE.ConeGeometry(1, 1, 9, 3);
  const leaves = new THREE.MeshStandardMaterial({ color: '#63754b', roughness: 1 });
  const crowns = new THREE.InstancedMesh(crownGeometry, leaves, forestTrees.length * 4);
  const tint = new THREE.Color();
  forestTrees.forEach((tree, index) => {
    transform.position.set(tree.x, tree.height * 0.28, tree.z);
    transform.rotation.set(0, tree.rotation, 0);
    transform.scale.set(1, tree.height * 0.56, 1);
    transform.updateMatrix();
    trunks.setMatrixAt(index, transform.matrix);
    for (let layer = 0; layer < 4; layer++) {
      const width = tree.height * (0.22 - layer * 0.038);
      transform.position.y = tree.height * (0.42 + layer * 0.15);
      transform.scale.set(width, tree.height * 0.43, width);
      transform.updateMatrix();
      crowns.setMatrixAt(index * 4 + layer, transform.matrix);
      crowns.setColorAt(index * 4 + layer, tint.setHSL(0.23 + random() * 0.035, 0.18, 0.52 + random() * 0.2));
    }
  });
  for (const mesh of [trunks, crowns]) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    root.add(mesh);
  }

  const blade = new THREE.BufferGeometry();
  blade.setAttribute('position', new THREE.Float32BufferAttribute([
    -0.1, 0, 0, 0.1, 0, 0, 0.07, 0.38, 0.035, 0.02, 0.65, 0.09,
  ], 3));
  blade.setIndex([0, 1, 2, 0, 2, 3]);
  blade.computeVertexNormals();
  const grassMaterial = new THREE.MeshStandardMaterial({ color: '#87905b', roughness: 1, side: THREE.DoubleSide });
  const wind = { value: 0 };
  grassMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.windTime = wind;
    shader.vertexShader = 'uniform float windTime;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      transformed.x += sin(windTime * 1.3 + instanceMatrix[3].x * 0.6 + instanceMatrix[3].z * 0.3) * position.y * position.y * 0.18;
    `);
  };
  grassMaterial.customProgramCacheKey = () => 'grass-wind-v1';
  // Small patches allow offscreen vegetation to be culled independently.
  for (let patch = 0; patch < 16; patch++) {
    const grass = new THREE.InstancedMesh(blade, grassMaterial, 180);
    let count = 0;
    for (let index = 0; index < 180; index++) {
      const x = -88 + (patch % 4) * 44 + random() * 44;
      const z = -88 + Math.floor(patch / 4) * 44 + random() * 44;
      if (Math.abs(x) < 6 || Math.abs(z + 2) < 5) continue;
      if (obstacles.some((box) => Math.abs(x - box.x) < box.halfX + 0.5 && Math.abs(z - box.z) < box.halfZ + 0.5)) continue;
      transform.position.set(x, -0.05, z);
      transform.rotation.set(0, random() * Math.PI * 2, 0);
      transform.scale.setScalar(0.55 + random() * 0.75);
      transform.updateMatrix();
      grass.setMatrixAt(count, transform.matrix);
      grass.setColorAt(count++, tint.setHSL(0.19 + random() * 0.07, 0.22, 0.48 + random() * 0.28));
    }
    grass.count = count;
    grass.receiveShadow = true;
    grass.computeBoundingSphere();
    root.add(grass);
  }
  return (time: number) => { wind.value = time; };
}
