import * as THREE from 'three';

export function updateEquippedHeroWeapon(weapon: THREE.Group, styleIndex: number, hasArcaneWeapon: boolean) {
  const data = weapon.userData as {
    blade: THREE.Mesh;
    tip: THREE.Mesh;
    guard: THREE.Mesh;
    grip: THREE.Mesh;
    aura: THREE.Mesh;
    magicRunes: THREE.Group;
    bladeMat: THREE.MeshStandardMaterial;
    guardMat: THREE.MeshStandardMaterial;
  };
  const colors = [
    ['#d9f7ff', '#ffd166'], ['#fff0bd', '#b5651d'], ['#e9fbff', '#3a3230'], ['#c8d0d8', '#1a1022'],
    ['#7dd3fc', '#8338ec'], ['#dce5ed', '#59606b'], ['#fff8e8', '#d69b23'], ['#ffffff', '#f5d54a'],
    ['#111111', '#8f2d1d'], ['#ffd166', '#b88718'], ['#a7f3d0', '#164c9a'], ['#f43f5e', '#8338ec'],
    ['#4338ca', '#3a2415'], ['#22d3ee', '#f97316'], ['#334155', '#7f1d1d'], ['#fef3c7', '#0f766e'],
    ['#ef4444', '#ef4444'], ['#94a3b8', '#92400e'], ['#5f6f55', '#41513d'], ['#ff9f1c', '#8f2d1d'],
  ];
  const [bladeColor, guardColor] = colors[styleIndex % colors.length] ?? colors[0];
  data.bladeMat.color.set(bladeColor);
  data.bladeMat.emissive.set(bladeColor);
  data.bladeMat.emissiveIntensity = hasArcaneWeapon ? 1.15 : 0.42;
  data.guardMat.color.set(guardColor);
  data.guardMat.emissive.set(guardColor);
  (data.aura.material as THREE.MeshBasicMaterial).color.set(bladeColor);
  data.magicRunes.visible = hasArcaneWeapon;
  const isHeavy = [3, 11, 14, 16, 18, 19].includes(styleIndex);
  const isPole = [6, 7, 13].includes(styleIndex);
  const isDagger = styleIndex === 17;
  const isBow = styleIndex === 10;
  data.blade.scale.set(isBow ? 0.42 : isHeavy ? 1.55 : isPole ? 0.55 : isDagger ? 0.62 : 1, isPole ? 1.34 : isDagger ? 0.58 : isHeavy ? 1.16 : 1, isBow ? 0.45 : 1);
  data.tip.visible = !isBow;
  data.guard.scale.set(isBow ? 1.6 : isPole ? 0.62 : isHeavy ? 1.35 : 1, 1, 1);
  data.grip.scale.set(isPole ? 0.9 : isBow ? 1.45 : 1, isPole ? 1.85 : isBow ? 1.4 : 1, 1);
  weapon.scale.setScalar(isHeavy ? 1.08 : isDagger ? 0.82 : 1);
}

export function updateHeroArtifactStyle(artifact: THREE.Group, icon: string | null) {
  const data = artifact.userData as {
    ring: THREE.Mesh;
    core: THREE.Mesh;
    orb: THREE.Mesh;
    pendant: THREE.Mesh;
    halo: THREE.Mesh;
    trail: THREE.Mesh;
    shards: THREE.Group;
    light: THREE.PointLight;
    glowMat: THREE.MeshStandardMaterial;
    gemMat: THREE.MeshStandardMaterial;
    shardMat: THREE.MeshStandardMaterial;
  };
  artifact.visible = Boolean(icon);
  if (!icon) return;

  data.ring.visible = icon.includes('ring') || icon.includes('hoop') || icon.includes('medallion');
  data.core.visible = icon.includes('crystal') || icon.includes('relic') || icon.includes('medallion');
  data.orb.visible = icon.includes('orb') || icon.includes('pearl') || icon.includes('globe') || icon.includes('bottle');
  data.pendant.visible = icon.includes('pendant') || icon.includes('head') || icon.includes('crown');
  data.halo.visible = icon.includes('ring') || icon.includes('orb') || icon.includes('pearl');

  const color = icon.includes('death') || icon.includes('god') ? '#ff004c' : icon.includes('sea') ? '#75e6da' : icon.includes('snow') ? '#d9f7ff' : icon.includes('moon') ? '#b56cff' : icon.includes('green') ? '#06d6a0' : icon.includes('sun') || icon.includes('gold') ? '#ffe66d' : '#ffb703';
  data.glowMat.color.set(color);
  data.glowMat.emissive.set(color);
  data.gemMat.color.set(color);
  data.gemMat.emissive.set(color);
  data.shardMat.color.set(color);
  data.shardMat.emissive.set(color);
  (data.trail.material as THREE.MeshBasicMaterial).color.set(color);
  data.light.color.set(color);
}
