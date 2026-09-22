import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Merge nearby static objects by material, keeping spatial culling useful.
export function batchScenery(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const batches = new Map<string, THREE.Mesh<THREE.BufferGeometry, THREE.Material>[]>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || object instanceof THREE.InstancedMesh
      || Array.isArray(object.material) || object.material.transparent || object.userData.animated) return;
    const position = object.getWorldPosition(new THREE.Vector3());
    const key = `${object.material.uuid}:${Math.floor(position.x / 48)}:${Math.floor(position.z / 48)}`;
    const group = batches.get(key) ?? [];
    group.push(object as THREE.Mesh<THREE.BufferGeometry, THREE.Material>);
    batches.set(key, group);
  });
  const rootInverse = root.matrixWorld.clone().invert();
  batches.forEach((objects) => {
    if (objects.length < 2) return;
    const geometries = objects.map((object) => {
      const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
      geometry.applyMatrix4(rootInverse.clone().multiply(object.matrixWorld));
      return geometry;
    });
    const merged = mergeGeometries(geometries);
    geometries.forEach((geometry) => geometry.dispose());
    if (!merged) return;
    const mesh = new THREE.Mesh(merged, objects[0].material);
    mesh.castShadow = objects.some((object) => object.castShadow);
    mesh.receiveShadow = true;
    root.add(mesh);
    const originals = new Set(objects.map((object) => object.geometry));
    objects.forEach((object) => object.removeFromParent());
    originals.forEach((geometry) => geometry.dispose());
  });
  root.updateMatrixWorld(true);
  root.traverse((object) => {
    if (object instanceof THREE.Mesh && !object.material.transparent && !object.userData.animated) {
      object.updateMatrix();
      object.matrixAutoUpdate = false;
    }
  });
}
