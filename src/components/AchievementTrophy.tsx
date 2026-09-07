import type { CSSProperties } from 'react';

type AchievementTrophyProps = {
  index: number;
  unlocked: boolean;
};

export function AchievementTrophy({ index, unlocked }: AchievementTrophyProps) {
  if (!unlocked) {
    return (
      <span className="achievement-trophy achievement-trophy-locked" aria-hidden="true">
        🔒
      </span>
    );
  }

  const column = index % 7;
  const row = Math.floor(index / 7);
  const style = {
    '--trophy-x': `${(column / 6) * 100}%`,
    '--trophy-y': `${row * 100}%`,
  } as CSSProperties;

  return (
    <span
      className="achievement-trophy achievement-trophy-unlocked"
      role="img"
      aria-label="Кубок достижения"
      style={style}
    />
  );
}
