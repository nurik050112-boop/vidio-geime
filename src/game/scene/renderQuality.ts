import * as THREE from 'three';

export function getRenderQuality() {
  const compact = window.matchMedia('(pointer: coarse), (max-width: 800px)').matches;
  return { pixelRatio: Math.min(window.devicePixelRatio, compact ? 1 : 1.5), shadowSize: compact ? 512 : 1024 };
}

// Dozens of point lights inflate every material's shader, even far off screen.
// Emissive flames keep their appearance; the sun and hemisphere light the world.
export function removeSceneryLights(root: THREE.Object3D) {
  const lights: THREE.PointLight[] = [];
  root.traverse(object => { if (object instanceof THREE.PointLight) lights.push(object); });
  lights.forEach(light => { light.removeFromParent(); light.dispose(); });
}
