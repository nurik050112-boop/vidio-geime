import * as THREE from 'three';

export function fitHeroModel(model: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  model.position.y += size.y / 2;
  model.scale.setScalar(size.y > 0 ? 2.35 / size.y : 1);
  model.rotation.y = Math.PI;
}

export function fitMonsterModel(model: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  model.position.y += size.y / 2;
  model.scale.setScalar(size.y > 0 ? 2.2 / size.y : 1);
  model.rotation.y = Math.PI;
}

export function tuneDownloadedCharacter(model: THREE.Object3D) {
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const tuneMaterial = (entry: THREE.Material) => {
      if (entry instanceof THREE.MeshStandardMaterial) {
        entry.roughness = THREE.MathUtils.clamp(entry.roughness * 0.72, 0.34, 0.82);
        entry.metalness = Math.max(entry.metalness, 0.04);
        entry.envMapIntensity = 1.15;
      }
    };
    if (Array.isArray(object.material)) object.material.forEach(tuneMaterial);
    else tuneMaterial(object.material);
  });
}

export function fitMapPropModel(model: THREE.Object3D, targetSize = 1) {
  model.position.set(0, 0, 0);
  model.rotation.set(0, 0, 0);
  model.scale.setScalar(1);
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const largestSide = Math.max(size.x, size.y, size.z, 0.001);
  const scale = targetSize / largestSide;
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
}
