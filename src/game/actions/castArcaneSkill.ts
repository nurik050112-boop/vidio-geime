import { formatPower } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'gameActiveRef' | 'hasArcaneWeapon' | 'arcaneAllSpells' | 'isFinalReveal' | 'enemy' | 'arcaneSkillReady' | 'playHeroAnimation' | 'setBattlePulse' | 'setArcanePulse' | 'selectedSpell' | 'setArcaneBurstPulse' | 'setHeroMana' | 'arcaneSkillManaCost' | 'setArcaneSkillReadyAt' | 'arcaneSkillCooldownMs' | 'setArcaneCooldownNow' | 'currentMonsters' | 'selectedSpellRadiusMeters' | 'selectedSpellSpeedKmh' | 'arcaneSkillDamage' | 'currentMonsterHp' | 'setCurrentMonsterCount' | 'setNearestMonster' | 'makeNearestMonsterSpawn' | 'nearestMonsterRef' | 'addGold' | 'chapter' | 'addWinStreak' | 'setEnemyHp' | 'currentDragonHp' | 'setMessage' | 'enemyHp' | 'clearCity'>;

export function runCastArcaneSkill(context: Context): void {
  const { gameActiveRef, hasArcaneWeapon, arcaneAllSpells, isFinalReveal, enemy, arcaneSkillReady, playHeroAnimation, setBattlePulse, setArcanePulse, selectedSpell, setArcaneBurstPulse, setHeroMana, arcaneSkillManaCost, setArcaneSkillReadyAt, arcaneSkillCooldownMs, setArcaneCooldownNow, currentMonsters, selectedSpellRadiusMeters, selectedSpellSpeedKmh, arcaneSkillDamage, currentMonsterHp, setCurrentMonsterCount, setNearestMonster, makeNearestMonsterSpawn, nearestMonsterRef, addGold, chapter, addWinStreak, setEnemyHp, currentDragonHp, setMessage, enemyHp, clearCity } = context;
    if (!gameActiveRef.current) return;
    if (!hasArcaneWeapon || isFinalReveal || !enemy || !arcaneSkillReady) return;
    playHeroAnimation('cast', 760);
    setBattlePulse((pulse) => pulse + 1);
    setArcanePulse((pulse) => pulse + 1);
    if (arcaneAllSpells || selectedSpell.targets >= 8 || selectedSpell.power >= 12) setArcaneBurstPulse((pulse) => pulse + 1);
    setHeroMana((mana) => Math.max(0, mana - arcaneSkillManaCost));
    setArcaneSkillReadyAt(Date.now() + arcaneSkillCooldownMs);
    setArcaneCooldownNow(Date.now());

    if (currentMonsters > 0) {
      const radiusBonusKills = Math.floor(selectedSpellRadiusMeters / 10);
      const speedBonusKills = Math.floor(selectedSpellSpeedKmh / 10);
      const spellKills = Math.min(currentMonsters, Math.max(1, selectedSpell.targets + radiusBonusKills + speedBonusKills + Math.floor(arcaneSkillDamage / Math.max(1, currentMonsterHp * 2))));
      const nextMonsters = Math.max(0, currentMonsters - spellKills);
      setCurrentMonsterCount(nextMonsters);
      setNearestMonster(nextMonsters > 0 ? makeNearestMonsterSpawn(currentMonsterHp) : { ...nearestMonsterRef.current, hp: 0, alive: false });
      addGold(spellKills * Math.max(2, chapter + 1));
      const streakRewardText = addWinStreak(`${selectedSpell.name} x${spellKills}`);
      if (nextMonsters === 0) {
        setEnemyHp(currentDragonHp);
        setMessage(`${selectedSpell.name}: магия уничтожила ${formatPower(spellKills)} монстров. Теперь появился босс: ${formatPower(currentDragonHp)} HP.${streakRewardText ? ` ${streakRewardText}` : ''}`);
        return;
      }
      setMessage(`${selectedSpell.name}: радиус ${selectedSpellRadiusMeters}м, скорость ${selectedSpellSpeedKmh} км/ч, уничтожено ${formatPower(spellKills)} монстров. Осталось ${formatPower(nextMonsters)}. Мана -${arcaneSkillManaCost}.${streakRewardText ? ` ${streakRewardText}` : ''}`);
      return;
    }

    if (enemyHp <= 0) return;
    const nextEnemyHp = Math.max(0, enemyHp - arcaneSkillDamage);
    setEnemyHp(nextEnemyHp);
    if (nextEnemyHp === 0) {
      setMessage(`${selectedSpell.name}: -${formatPower(arcaneSkillDamage)} HP. Враг уничтожен.`);
      clearCity();
      return;
    }
    setMessage(`${selectedSpell.name}: радиус ${selectedSpellRadiusMeters}м, скорость ${selectedSpellSpeedKmh} км/ч, удар -${formatPower(arcaneSkillDamage)} HP. Мана -${arcaneSkillManaCost}, перезарядка ${Math.ceil(arcaneSkillCooldownMs / 1000)} сек.`);
  
}
