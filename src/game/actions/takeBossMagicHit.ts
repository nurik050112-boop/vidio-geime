import { formatPower } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'gameActiveRef' | 'isFinalReveal' | 'heroHp' | 'hasAdminHelmet' | 'chapter' | 'currentDragonHp' | 'setHeroHp' | 'setMessage' | 'enemy'>;

export function runTakeBossMagicHit(context: Context, spell: string): void {
  const { gameActiveRef, isFinalReveal, heroHp, hasAdminHelmet, chapter, currentDragonHp, setHeroHp, setMessage, enemy } = context;
    if (!gameActiveRef.current) return;
    if (isFinalReveal || heroHp <= 0 || hasAdminHelmet) return;

    const damage = Math.max(12, Math.round(22 + chapter * 6 + currentDragonHp / 1_000_000));
    setHeroHp((hp) => Math.max(0, hp - damage));
    setMessage(`${enemy?.title ?? 'Босс'} применил ${spell}: -${formatPower(damage)} HP.`);
  
}
