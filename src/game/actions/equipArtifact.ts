import { type Artifact } from '../data/dragonSon';
import { formatPower } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'currentHeroMaxHp' | 'setEquippedArtifactId' | 'setHeroHp' | 'playHeroAnimation' | 'setMessage'>;

export function runEquipArtifact(context: Context, artifact: Artifact): void {
  const { currentHeroMaxHp, setEquippedArtifactId, setHeroHp, playHeroAnimation, setMessage } = context;
    const healingPercent = 20 * (1 + (artifact.healingBonusPercent ?? 0) / 100);
    const healingAmount = Math.max(1, Math.floor(currentHeroMaxHp * (healingPercent / 100)));
    setEquippedArtifactId(artifact.id);
    setHeroHp((hp) => Math.min(currentHeroMaxHp, hp + healingAmount));
    playHeroAnimation('heal', 720);
    setMessage(`${artifact.name} надет. Амулет исцелил героя на ${formatPower(healingAmount)} HP${artifact.healingBonusPercent ? `, бонус к исцелению +${artifact.healingBonusPercent}%` : ''}.`);
  
}
