import type { CSSProperties } from 'react';

type WeaponThumbnailProps = {
  name: string;
  styleIndex: number;
};

const weaponTiles = [
  [24, 4], [25, 4], [26, 4], [23, 5], [24, 5],
  [25, 5], [26, 5], [23, 6], [24, 6], [25, 6],
  [26, 6], [23, 7], [24, 7], [25, 7], [26, 7],
  [23, 8], [24, 8], [25, 8], [26, 8], [24, 9],
] as const;

export function WeaponThumbnail({ name, styleIndex }: WeaponThumbnailProps) {
  const [column, row] = weaponTiles[Math.abs(styleIndex) % weaponTiles.length];
  const tileOffset = 17;
  const scale = 3;
  const style = {
    '--weapon-image-x': `${-column * tileOffset * scale}px`,
    '--weapon-image-y': `${-row * tileOffset * scale}px`,
  } as CSSProperties;

  return (
    <span className="weapon-thumbnail" role="img" aria-label={`Изображение оружия: ${name}`}>
      <span className="weapon-thumbnail-sprite" style={style} />
    </span>
  );
}
