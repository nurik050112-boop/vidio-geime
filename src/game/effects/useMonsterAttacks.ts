import { useEffect } from 'react';
import { meleeRangeMeters,monsterBotAttackCooldownMs,monsterBotAttackDamage,monsterChaseCatchTimeMs } from '../data/adminBoss';
import { formatPower } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'gameActiveRef' | 'monsterBotRef' | 'monsterChaseStartedAt' | 'setBattlePulse' | 'setMonsterAttackCount' | 'setHeroHp' | 'setMessage'>;

export function useMonsterAttacks(context: Context): void {
  const { gameActiveRef, monsterBotRef, monsterChaseStartedAt, setBattlePulse, setMonsterAttackCount, setHeroHp, setMessage } = context;
  useEffect(() => {
    const attackTimer = window.setInterval(() => {
      if (!gameActiveRef.current) return;
      const state = monsterBotRef.current;
      if (state.isFinalReveal || state.currentMonsters <= 0 || state.heroHp <= 0 || state.hasAdminHelmet) return;
      if (!state.nearestMonsterInAggro) return;
      if (Date.now() - monsterChaseStartedAt.current < monsterChaseCatchTimeMs) return;
      if (!state.nearestMonsterInRange) return;

      const hunterBots = Math.max(1, Math.ceil(Math.min(state.currentMonsters, state.currentMonsterTotal) / Math.max(1, state.currentMonsterTotal / 10)));
      const rawDamage = Math.ceil(monsterBotAttackDamage + state.chapter * 4 + hunterBots * 3);
      const damage = Math.max(1, rawDamage - Math.floor(state.defenseBonus * 0.08));
      setBattlePulse((pulse) => pulse + 1);
      setMonsterAttackCount((count) => count + 1);
      setHeroHp((hp) => {
        const nextHp = Math.max(0, hp - damage);
        if (nextHp === 0) {
          setMessage(`${formatPower(hunterBots)} гоблинов добежали до радиуса ${meleeRangeMeters}м и нанесли ${formatPower(damage)} урона. Герой упал, восстанови HP.`);
        }
        return nextHp;
      });
    }, monsterBotAttackCooldownMs);

    return () => window.clearInterval(attackTimer);
  }, []);
}
