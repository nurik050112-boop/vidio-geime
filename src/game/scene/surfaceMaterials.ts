import * as THREE from 'three';
import { surfaceHeight,type SurfaceKind } from './surfaceNoise';

function makeMaps(kind: SurfaceKind, anisotropy: number) {
  const size = 256;
  const heights = new Float32Array(size * size);
  const color = new Uint8Array(size * size * 4);
  const normal = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) heights[y * size + x] = surfaceHeight(kind, x / size, y / size);
  }
  const heightAt = (x: number, y: number) => heights[((y + size) % size) * size + (x + size) % size];
  const direction = new THREE.Vector3();
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) * 4;
      const h = heightAt(x, y);
      const brightness = Math.round(120 + h * 125);
      color.set([brightness, brightness, brightness, 255], index);
      direction.set((heightAt(x - 1, y) - heightAt(x + 1, y)) * 2,
        (heightAt(x, y - 1) - heightAt(x, y + 1)) * 2, 1).normalize();
      normal.set([Math.round((direction.x + 1) * 127.5), Math.round((direction.y + 1) * 127.5),
        Math.round((direction.z + 1) * 127.5), 255], index);
    }
  }
  const texture = (pixels: Uint8Array, colorSpace: THREE.ColorSpace = THREE.NoColorSpace) => {
    const map = new THREE.DataTexture(pixels, size, size);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.magFilter = THREE.LinearFilter;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.generateMipmaps = true;
    map.anisotropy = anisotropy;
    map.colorSpace = colorSpace;
    map.needsUpdate = true;
    return map;
  };
  return { map: texture(color, THREE.SRGBColorSpace), normalMap: texture(normal) };
}

export function createSurfaceMaterials(renderer: THREE.WebGLRenderer) {
  const maps = new Map<SurfaceKind, ReturnType<typeof makeMaps>>();
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  return {
    get(kind: SurfaceKind, color: string) {
      const key = `${kind}:${color}`;
      const cached = materials.get(key);
      if (cached) return cached;
      let textures = maps.get(kind);
      if (!textures) {
        textures = makeMaps(kind, Math.min(8, renderer.capabilities.getMaxAnisotropy()));
        maps.set(kind, textures);
      }
      const material = new THREE.MeshStandardMaterial({
        color, ...textures, roughness: kind === 'wood' ? 0.86 : 0.95,
        normalScale: new THREE.Vector2(0.65, 0.65), metalness: 0,
      });
      material.userData.sharedSurface = true;
      materials.set(key, material);
      return material;
    },
    dispose() {
      materials.forEach((material) => material.dispose());
      maps.forEach(({ map, normalMap }) => { map.dispose(); normalMap.dispose(); });
      maps.clear();
      materials.clear();
    },
  };
}

export type SurfaceMaterials = ReturnType<typeof createSurfaceMaterials>;

// UVs use metres, so a large wall has more bricks, rather than stretched bricks.
export function setSurfaceUVs(geometry: THREE.BufferGeometry, tileSize = 3) {
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  const uv = geometry.getAttribute('uv');
  if (!uv || !normals) return;
  for (let i = 0; i < positions.count; i++) {
    const nx = Math.abs(normals.getX(i));
    const ny = Math.abs(normals.getY(i));
    const nz = Math.abs(normals.getZ(i));
    const u = nx > ny && nx > nz ? positions.getZ(i) : positions.getX(i);
    const v = ny > nx && ny > nz ? positions.getZ(i) : positions.getY(i);
    uv.setXY(i, u / tileSize, v / tileSize);
  }
  uv.needsUpdate = true;
}
