import type { CSSProperties } from 'react';

type WeaponThumbnailProps = {
  name: string;
  styleIndex: number;
};

const weaponTiles = [
  [0, 0], [1, 0], [2, 0], [1, 0], [3, 0],
  [3, 3], [4, 2], [0, 2], [2, 3], [3, 3],
  [3, 2], [0, 1], [2, 3], [4, 3], [3, 1],
  [0, 0], [1, 1], [4, 0], [4, 1], [0, 3],
] as const;

export function WeaponThumbnail({ name, styleIndex }: WeaponThumbnailProps) {
  const [column, row] = weaponTiles[Math.abs(styleIndex) % weaponTiles.length];
  const tileSize = 64;
  const style = {
    '--weapon-image-x': `${-column * tileSize}px`,
    '--weapon-image-y': `${-row * tileSize}px`,
  } as CSSProperties;

  return (
    <span className="weapon-thumbnail" role="img" aria-label={`Изображение оружия: ${name}`}>
      <span className="weapon-thumbnail-sprite" style={style} />
    </span>
  );
}
