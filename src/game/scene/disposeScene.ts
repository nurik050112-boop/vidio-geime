import * as THREE from 'three';

export function disposeScene(root: THREE.Object3D, includeTextures = false) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
      geometries.add(object.geometry);
      const entries = Array.isArray(object.material) ? object.material : [object.material];
      entries.forEach((material) => materials.add(material));
      if (object instanceof THREE.SkinnedMesh) object.skeleton.dispose();
      if (object instanceof THREE.InstancedMesh) object.dispose();
    }
    if (object instanceof THREE.Light && 'shadow' in object) {
      (object.shadow as THREE.LightShadow | undefined)?.dispose();
    }
  });
  materials.forEach((material) => {
    if (material.userData.sharedSurface) return;
    if (includeTextures) {
      Object.values(material).forEach((value: unknown) => {
        if (value instanceof THREE.Texture) textures.add(value);
      });
    }
    material.dispose();
  });
  textures.forEach((texture) => texture.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}
