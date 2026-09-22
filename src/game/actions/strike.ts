import { adminNukeDamageText } from '../data/adminBoss';
import { isDeathSword } from '../data/isDeathSword';
import { shopBasePower,upgradePower } from '../data/loadUnlockedAchievements';
import { formatPower,isAdminNuke,isAisultanSword,isBbiLegendaryWeapon } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'gameActiveRef' | 'isFinalReveal' | 'enemy' | 'currentMonsters' | 'setMessage' | 'playHeroAnimation' | 'setBattlePulse' | 'clickTimesRef' | 'setClicksPerSecond' | 'setClickDuelPower' | 'clickDuelHeroPower' | 'clickDuelDragonPower' | 'equippedWeapon' | 'setFireWavePulse' | 'setEnemyBurning' | 'setWaterWavePulse' | 'hasArcaneWeapon' | 'setArcanePulse' | 'enemyHp' | 'setSoulFirePulse' | 'setHeroHp' | 'currentHeroMaxHp' | 'setEnemyHp' | 'clearCity' | 'setNukePulse' | 'isBbiBoss' | 'shopLevels' | 'equippedWeaponDamage' | 'chapter' | 'attackBonus' | 'artifactDamageMultiplier' | 'artifactAttackSpeedMultiplier' | 'dragonReaction'>;

export function runStrike(context: Context): void {
  const { gameActiveRef, isFinalReveal, enemy, currentMonsters, setMessage, playHeroAnimation, setBattlePulse, clickTimesRef, setClicksPerSecond, setClickDuelPower, clickDuelHeroPower, clickDuelDragonPower, equippedWeapon, setFireWavePulse, setEnemyBurning, setWaterWavePulse, hasArcaneWeapon, setArcanePulse, enemyHp, setSoulFirePulse, setHeroHp, currentHeroMaxHp, setEnemyHp, clearCity, setNukePulse, isBbiBoss, shopLevels, equippedWeaponDamage, chapter, attackBonus, artifactDamageMultiplier, artifactAttackSpeedMultiplier, dragonReaction } = context;
    if (!gameActiveRef.current) return;
    if (isFinalReveal || !enemy) return;
    if (currentMonsters > 0) {
      setMessage(`Сначала победи всех монстров. Осталось: ${formatPower(currentMonsters)}.`);
      return;
    }
    playHeroAnimation('strike', 420);
    setBattlePulse((pulse) => pulse + 1);
    const clickNow = Date.now();
    clickTimesRef.current = [...clickTimesRef.current.filter((time) => clickNow - time < 1000), clickNow];
    setClicksPerSecond(clickTimesRef.current.length);
    setClickDuelPower((power) => {
      const powerRatio = Math.log10(clickDuelHeroPower + 10) / Math.max(1, Math.log10(clickDuelDragonPower + 10));
      return Math.min(100, power + 4.5 + powerRatio * 9);
    });
    if (isBbiLegendaryWeapon(equippedWeapon)) {
      setFireWavePulse((pulse) => pulse + 1);
      setEnemyBurning(true);
    }
    if (isAisultanSword(equippedWeapon)) {
      setWaterWavePulse((pulse) => pulse + 1);
    }
    if (hasArcaneWeapon) {
      setArcanePulse((pulse) => pulse + 1);
    }
    if (isDeathSword(equippedWeapon)) {
      const soulDamage = Math.max(1, Math.floor(enemyHp * 0.66));
      const soulHeal = Math.max(1, Math.floor(enemyHp * 0.01));
      const nextEnemyHp = Math.max(0, enemyHp - soulDamage);
      setSoulFirePulse((pulse) => pulse + 1);
      setHeroHp((hp) => Math.min(currentHeroMaxHp, hp + soulHeal));
      setEnemyHp(nextEnemyHp);
      if (nextEnemyHp === 0) {
        setMessage(`Меч смерти выпустил огонь души, забрал 66% души и украл ${formatPower(soulHeal)} HP. Враг уничтожен.`);
        clearCity();
        return;
      }
      setMessage(`Меч смерти выпустил огонь души: -${formatPower(soulDamage)} HP врагу, герой забрал себе ${formatPower(soulHeal)} HP.`);
      return;
    }
    if (isAdminNuke(equippedWeapon)) {
      setNukePulse((pulse) => pulse + 1);
      setEnemyHp(0);
      setMessage(`Админская ядерка ударила силой ${adminNukeDamageText} и уничтожила ${isBbiBoss ? 'босса' : 'дракона'} сразу.`);
      clearCity();
      return;
    }

    const manaDamage = upgradePower(shopLevels.mana, shopBasePower.mana);
    const arcaneSwingDamage = hasArcaneWeapon ? Math.max(1, Math.floor(equippedWeaponDamage * 1.35)) : 0;
    const heroDamage = Math.floor((18 + chapter * 5 + attackBonus + manaDamage + arcaneSwingDamage) * artifactDamageMultiplier * artifactAttackSpeedMultiplier);
    const nextEnemyHp = Math.max(0, enemyHp - heroDamage);

    if (nextEnemyHp === 0) {
      setEnemyHp(0);
      clearCity();
      return;
    }

    setEnemyHp(nextEnemyHp);

    setMessage(`Удар по ${isBbiBoss ? 'боссу' : 'дракону'}: -${formatPower(heroDamage)} HP. Осталось ${formatPower(nextEnemyHp)} HP. Реакция: ${dragonReaction}.`);
  
}
