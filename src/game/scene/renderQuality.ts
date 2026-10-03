import * as THREE from 'three';
import { getGraphicsMode } from './graphicsPreference';

export function getRenderQuality() {
  const optimized = getGraphicsMode() === 'optimization';
  return {
    antialias: !optimized,
    pixelRatio: Math.min(window.devicePixelRatio, optimized ? 1 : 1.75),
    shadowSize: optimized ? 512 : 2048,
  };
}

// Dozens of point lights inflate every material's shader, even far off screen.
// Emissive flames keep their appearance; the sun and hemisphere light the world.
export function removeSceneryLights(root: THREE.Object3D) {
  const lights: THREE.PointLight[] = [];
  root.traverse(object => { if (object instanceof THREE.PointLight) lights.push(object); });
  lights.forEach(light => { light.removeFromParent(); light.dispose(); });
}
