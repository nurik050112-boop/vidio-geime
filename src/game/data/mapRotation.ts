const mapVariantCount = 14;
const cityMapPresetCount = 20;

export function getMapVariant(chapter: number, locationIndex: number, sceneKey: string) {
  if (sceneKey.startsWith('city-') || sceneKey.startsWith('dungeon-')) {
    return ((chapter + locationIndex * 5 + 3) % mapVariantCount + mapVariantCount) % mapVariantCount;
  }

  let hash = 0;
  for (let index = 0; index < sceneKey.length; index += 1) {
    hash = (hash * 31 + sceneKey.charCodeAt(index)) % 997;
  }
  return Math.abs(chapter * 3 + locationIndex * 5 + hash) % mapVariantCount;
}

export function getCityMapPresetIndex(chapter: number, locationIndex: number) {
  return ((chapter * 7 + locationIndex * 13) % cityMapPresetCount + cityMapPresetCount) % cityMapPresetCount;
}