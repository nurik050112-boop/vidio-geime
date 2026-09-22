import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'hasArcaneWeapon' | 'arcaneSkillRemainingMs' | 'setArcaneCooldownNow'>;

export function useSpellCooldown(context: Context): void {
  const { hasArcaneWeapon, arcaneSkillRemainingMs, setArcaneCooldownNow } = context;
  useEffect(() => {
    if (!hasArcaneWeapon || arcaneSkillRemainingMs === 0) return;
    const cooldownTimer = window.setInterval(() => {
      setArcaneCooldownNow(Date.now());
    }, 250);

    return () => window.clearInterval(cooldownTimer);
  }, [hasArcaneWeapon, arcaneSkillRemainingMs]);
}
