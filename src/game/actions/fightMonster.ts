import { adminWorldBossesHp,aisultanSharkHp,arailmEnemiesTotal,bbiManagerHp,meleeRangeMeters,meleeRangeUnits,monstersPerCity } from '../data/adminBoss';
import { createFurySword,shouldEquipArmor } from '../data/createFurySword';
import { rollArmor,rollDungeonWeapon,rollWeapon } from '../data/isDeathSword';
import { formatPower,getWeaponDisplayName,isAisultanSword } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'gameActiveRef' | 'isFinalReveal' | 'heroHp' | 'currentMonsters' | 'setMessage' | 'playHeroAnimation' | 'setBattlePulse' | 'equippedWeapon' | 'setWaterWavePulse' | 'setNukePulse' | 'isBbiWorld' | 'setBbiMonstersLeft' | 'setBbiWorldEntered' | 'setBbiBossStage' | 'setEnemyHp' | 'isNuraliWorld' | 'setNuraliMonstersLeft' | 'setNuraliWorldEntered' | 'setNuraliChoiceOpen' | 'isMonsterAvalancheWorld' | 'finishMonsterAvalanche' | 'isFinalSpiritWorld' | 'setFinalSpiritMonstersLeft' | 'setFinalSpiritFightStarted' | 'finalSpiritDragonHp' | 'setHeroHp' | 'currentHeroMaxHp' | 'isArailmWorld' | 'setArailmMonstersLeft' | 'setArailmWorldEntered' | 'setArailmChoiceOpen' | 'isAisWorld' | 'setAisMonstersLeft' | 'setAisWorldEntered' | 'setAisSharkFightStarted' | 'isAdminWorld' | 'setAdminWorldMonstersLeft' | 'setAdminWorldEntered' | 'setAdminWorldBossesStarted' | 'isMansurDungeon' | 'setMansurMonstersLeft' | 'setMansurDungeonEntered' | 'setMansurKingFightStarted' | 'currentDragonHp' | 'isAnuarWorld' | 'setAnuarBombsLeft' | 'setAnuarWorldEntered' | 'setAnuarKingFightStarted' | 'isFuryDungeon' | 'setFuryMonstersLeft' | 'setFuryDungeonEntered' | 'setFuryChoiceOpen' | 'setWeapons' | 'setEquippedWeapon' | 'isDungeon' | 'dungeon' | 'setDungeon' | 'setGoblinKingReady' | 'setGoblinKingFightStarted' | 'setCityMonsters' | 'cityMonsters' | 'chapter' | 'addGold' | 'heroPosition' | 'nearestMonsterRef' | 'items' | 'shopLevels' | 'artifactAttackSpeedMultiplier' | 'attackBonus' | 'artifactDamageMultiplier' | 'setNearestMonster' | 'nearestMonsterDistanceMeters' | 'artifactLuckMultiplier' | 'setMonsterAvalancheLeft' | 'makeNearestMonsterSpawn' | 'currentMonsterHp' | 'addWinStreak' | 'weapons' | 'setArmors' | 'armors' | 'equippedArmor' | 'setEquippedArmor' | 'currentMonsterTotal'>;

export function runFightMonster(context: Context): void {
  const { gameActiveRef, isFinalReveal, heroHp, currentMonsters, setMessage, playHeroAnimation, setBattlePulse, equippedWeapon, setWaterWavePulse, setNukePulse, isBbiWorld, setBbiMonstersLeft, setBbiWorldEntered, setBbiBossStage, setEnemyHp, isNuraliWorld, setNuraliMonstersLeft, setNuraliWorldEntered, setNuraliChoiceOpen, isMonsterAvalancheWorld, finishMonsterAvalanche, isFinalSpiritWorld, setFinalSpiritMonstersLeft, setFinalSpiritFightStarted, finalSpiritDragonHp, setHeroHp, currentHeroMaxHp, isArailmWorld, setArailmMonstersLeft, setArailmWorldEntered, setArailmChoiceOpen, isAisWorld, setAisMonstersLeft, setAisWorldEntered, setAisSharkFightStarted, isAdminWorld, setAdminWorldMonstersLeft, setAdminWorldEntered, setAdminWorldBossesStarted, isMansurDungeon, setMansurMonstersLeft, setMansurDungeonEntered, setMansurKingFightStarted, currentDragonHp, isAnuarWorld, setAnuarBombsLeft, setAnuarWorldEntered, setAnuarKingFightStarted, isFuryDungeon, setFuryMonstersLeft, setFuryDungeonEntered, setFuryChoiceOpen, setWeapons, setEquippedWeapon, isDungeon, dungeon, setDungeon, setGoblinKingReady, setGoblinKingFightStarted, setCityMonsters, cityMonsters, chapter, addGold, heroPosition, nearestMonsterRef, items, shopLevels, artifactAttackSpeedMultiplier, attackBonus, artifactDamageMultiplier, setNearestMonster, nearestMonsterDistanceMeters, artifactLuckMultiplier, setMonsterAvalancheLeft, makeNearestMonsterSpawn, currentMonsterHp, addWinStreak, weapons, setArmors, armors, equippedArmor, setEquippedArmor, currentMonsterTotal } = context;
    if (!gameActiveRef.current) return;
    if (isFinalReveal || heroHp === 0 || currentMonsters <= 0) {
      setMessage(currentMonsters <= 0 ? `В этом городе все ${formatPower(monstersPerCity)} монстров уже побеждены.` : 'Сначала восстанови героя.');
      return;
    }
    playHeroAnimation('strike', 420);
    setBattlePulse((pulse) => pulse + 1);
    if (isAisultanSword(equippedWeapon)) {
      setWaterWavePulse((pulse) => pulse + 1);
    }

    if (equippedWeapon?.id.startsWith('admin-nuke-')) {
      setNukePulse((pulse) => pulse + 1);
      if (isBbiWorld) {
        setBbiMonstersLeft(0);
        setBbiWorldEntered(false);
        setBbiBossStage('manager');
        setEnemyHp(bbiManagerHp);
        setMessage('100 BBI монстров уничтожены. Появился босс Управляющий.');
        return;
      }
      if (isNuraliWorld) {
        setNuraliMonstersLeft(0);
        setNuraliWorldEntered(false);
        setNuraliChoiceOpen(true);
        setMessage('100 монстров Нурали уничтожены. На весь экран вышла надпись: драться с Нурали или нет.');
        return;
      }
      if (isMonsterAvalancheWorld) {
        finishMonsterAvalanche();
        return;
      }
      if (isFinalSpiritWorld) {
        setFinalSpiritMonstersLeft(0);
        setFinalSpiritFightStarted(true);
        setEnemyHp(finalSpiritDragonHp);
        setHeroHp(currentHeroMaxHp);
        setMessage(`Подземные монстры уничтожены ядеркой. Души финального босса собрались в бой: ${formatPower(finalSpiritDragonHp)} HP.`);
        return;
      }
      if (isArailmWorld) {
        setArailmMonstersLeft(0);
        setArailmWorldEntered(false);
        setArailmChoiceOpen(true);
        setMessage(`${formatPower(arailmEnemiesTotal)} код-монстров уничтожены. Теперь выбери: не сражаться или сражаться.`);
        return;
      }
      if (isAisWorld) {
        setAisMonstersLeft(0);
        setAisWorldEntered(false);
        setAisSharkFightStarted(true);
        setEnemyHp(aisultanSharkHp);
        setMessage(`1 млрд рыб-монстров уничтожены. Промежуточный босс Акула вышла на бой: ${formatPower(aisultanSharkHp)} HP.`);
        return;
      }
      if (isAdminWorld) {
        setAdminWorldMonstersLeft(0);
        setAdminWorldEntered(false);
        setAdminWorldBossesStarted(true);
        setEnemyHp(adminWorldBossesHp);
        setMessage('1 млрд админских монстров уничтожен. Этап 2: все боссы концовок вышли вместе.');
        return;
      }
      if (isMansurDungeon) {
        setMansurMonstersLeft(0);
        setMansurDungeonEntered(false);
        setMansurKingFightStarted(true);
        setEnemyHp(currentDragonHp);
        setMessage('Подземелье Мансура очищено. Король Мансур вышел с короной.');
        return;
      }
      if (isAnuarWorld) {
        setAnuarBombsLeft(0);
        setAnuarWorldEntered(false);
        setAnuarKingFightStarted(true);
        setEnemyHp(currentDragonHp);
        setMessage('Бомба-монстры уничтожены. Ануар вышел на финальный бой.');
        return;
      }
      if (isFuryDungeon) {
        const furySword = createFurySword();
        setFuryMonstersLeft(0);
        setFuryDungeonEntered(false);
        setFuryChoiceOpen(true);
        setWeapons((currentWeapons) => [...currentWeapons, furySword]);
        setEquippedWeapon(furySword);
        setMessage('Фури-подземелье очищено. Получен секретный Фури меч. Выбери: убить или любить.');
        return;
      }
      if (isDungeon && dungeon) {
        setDungeon({ ...dungeon, enemiesLeft: 0, cleared: true, entered: false });
        setGoblinKingReady(true);
        setGoblinKingFightStarted(true);
        setEnemyHp(currentDragonHp);
        setMessage('Админская ядерка очистила пещеру. Король гоблинов вышел на бой.');
        return;
      }
      setCityMonsters(cityMonsters.map((count, index) => (index === chapter ? 0 : count)));
      setEnemyHp(currentDragonHp);
      addGold(1_000 + chapter * 250);
      setMessage(`Админская ядерка сработала! Все ${formatPower(monstersPerCity)} монстров города уничтожены сразу. Босс-дракон появился.`);
      return;
    }

    const monsterDistance = Math.hypot(heroPosition.x - nearestMonsterRef.current.x, heroPosition.z - nearestMonsterRef.current.z);
    if (!nearestMonsterRef.current.alive || monsterDistance > meleeRangeUnits) {
      setMessage(`Подойди ближе к гоблину: сейчас ${Math.ceil(monsterDistance / 1_000)}м, удар работает в радиусе ${meleeRangeMeters}м.`);
      return;
    }

    const baseMonstersPerHit = isMonsterAvalancheWorld
      ? 100_000_000
      : items.doubleStrike > 0
        ? 2 + Math.max(0, shopLevels.doubleStrike - 1)
        : 1;
    const monstersPerHit = Math.max(1, Math.floor(baseMonstersPerHit * artifactAttackSpeedMultiplier));
    const heroMonsterDamage = Math.max(1, Math.floor((18 + chapter * 5 + attackBonus) * artifactDamageMultiplier));
    const nextMonsterHp = nearestMonsterRef.current.hp - heroMonsterDamage;
    if (nextMonsterHp > 0) {
      setNearestMonster((monster) => ({ ...monster, hp: Math.min(monster.hp, nextMonsterHp), alive: true }));
      setMessage(`Удар по гоблину: -${formatPower(heroMonsterDamage)} HP. Осталось ${formatPower(nextMonsterHp)} HP. Дистанция ${nearestMonsterDistanceMeters.toFixed(1)}м.`);
      return;
    }

    const nextMonsters = Math.max(0, currentMonsters - monstersPerHit);
    const monsterWeapon = isAdminWorld ? rollDungeonWeapon((chapter + 30) * artifactLuckMultiplier) : isNuraliWorld ? rollDungeonWeapon(chapter + 18) : isBbiWorld ? rollDungeonWeapon(chapter + 12) : isArailmWorld ? rollDungeonWeapon(chapter + 16) : isMansurDungeon ? rollDungeonWeapon(chapter + 14) : isAnuarWorld ? rollDungeonWeapon(chapter + 12) : isFuryDungeon ? rollDungeonWeapon(chapter + 10) : isDungeon ? rollDungeonWeapon(chapter + 1) : rollWeapon(2 * artifactLuckMultiplier, chapter + 1);
    const monsterArmor = isAdminWorld ? rollArmor((chapter + 30) * artifactLuckMultiplier, chapter + 30) : isNuraliWorld ? rollArmor(18, chapter + 18) : isBbiWorld ? rollArmor(12, chapter + 12) : isArailmWorld ? rollArmor(16, chapter + 16) : isMansurDungeon ? rollArmor(14, chapter + 14) : isAnuarWorld ? rollArmor(12, chapter + 12) : isFuryDungeon ? rollArmor(10, chapter + 10) : isDungeon ? rollArmor(10, chapter + 1) : rollArmor(2 * artifactLuckMultiplier, chapter + 1);
    const nextCityMonsters = cityMonsters.map((count, index) => (index === chapter ? nextMonsters : count));

    if (isAdminWorld) {
      setAdminWorldMonstersLeft(nextMonsters);
    } else if (isFinalSpiritWorld) {
      setFinalSpiritMonstersLeft(nextMonsters);
    } else if (isMonsterAvalancheWorld) {
      setMonsterAvalancheLeft(nextMonsters);
    } else if (isBbiWorld) {
      setBbiMonstersLeft(nextMonsters);
    } else if (isNuraliWorld) {
      setNuraliMonstersLeft(nextMonsters);
    } else if (isAisWorld) {
      setAisMonstersLeft(nextMonsters);
    } else if (isArailmWorld) {
      setArailmMonstersLeft(nextMonsters);
    } else if (isMansurDungeon) {
      setMansurMonstersLeft(nextMonsters);
    } else if (isAnuarWorld) {
      setAnuarBombsLeft(nextMonsters);
    } else if (isFuryDungeon) {
      setFuryMonstersLeft(nextMonsters);
    } else if (isDungeon && dungeon) {
      setDungeon({ ...dungeon, enemiesLeft: nextMonsters });
    } else {
      setCityMonsters(nextCityMonsters);
    }
    setNearestMonster(nextMonsters > 0 ? makeNearestMonsterSpawn(currentMonsterHp) : { ...nearestMonsterRef.current, hp: 0, alive: false });
    addGold(2 + chapter);
    const streakRewardText = addWinStreak('монстр побежден');

    if (monsterWeapon) {
      setWeapons([...weapons, monsterWeapon]);
      if (!equippedWeapon || monsterWeapon.damage > equippedWeapon.damage) {
        setEquippedWeapon(monsterWeapon);
      }
    }

    if (monsterArmor) {
      setArmors([...armors, monsterArmor]);
      if (shouldEquipArmor(equippedArmor, monsterArmor)) {
        setEquippedArmor(monsterArmor);
      }
    }

    setMessage(
      monsterWeapon
        ? `Удар задел ${monstersPerHit} враг. Осталось ${nextMonsters} из ${currentMonsterTotal}. Выпало оружие: ${getWeaponDisplayName(monsterWeapon)} (${monsterWeapon.rarity}).`
        : monsterArmor
          ? `Удар задел ${monstersPerHit} враг. Осталось ${nextMonsters} из ${currentMonsterTotal}. Выпала броня: ${monsterArmor.name} (${monsterArmor.rarity}).`
        : `Удар задел ${monstersPerHit} враг. Осталось ${nextMonsters} из ${currentMonsterTotal}. Получено золото. ${streakRewardText}`
    );

    if (nextMonsters === 0) {
      if (isMonsterAvalancheWorld) {
        finishMonsterAvalanche();
        return;
      }
      if (isFinalSpiritWorld) {
        setFinalSpiritMonstersLeft(0);
        setFinalSpiritFightStarted(true);
        setEnemyHp(finalSpiritDragonHp);
        setHeroHp(currentHeroMaxHp);
        setMessage(`Монстры подземного мира побеждены. Теперь появились души финального босса: ${formatPower(finalSpiritDragonHp)} HP.`);
        return;
      }
      if (isBbiWorld) {
        setBbiWorldEntered(false);
        setBbiBossStage('manager');
        setEnemyHp(bbiManagerHp);
        setMessage('100 BBI монстров побеждены. Появился босс Управляющий.');
        return;
      }
      if (isNuraliWorld) {
        setNuraliWorldEntered(false);
        setNuraliChoiceOpen(true);
        setMessage('100 монстров Нурали побеждены. Появилась надпись: драться с Нурали или нет.');
        return;
      }
      if (isArailmWorld) {
        setArailmWorldEntered(false);
        setArailmChoiceOpen(true);
        setMessage(`${formatPower(arailmEnemiesTotal)} код-монстров побеждены. На экране выбор: не сражаться или сражаться.`);
        return;
      }
      if (isAisWorld) {
        setAisWorldEntered(false);
        setAisSharkFightStarted(true);
        setEnemyHp(aisultanSharkHp);
        setMessage(`1 млрд рыб-монстров побежден. Вышел промежуточный босс Акула: ${formatPower(aisultanSharkHp)} HP.`);
        return;
      }
      if (isAdminWorld) {
        setAdminWorldEntered(false);
        setAdminWorldBossesStarted(true);
        setEnemyHp(adminWorldBossesHp);
        setMessage('1 млрд админских монстров побежден. Этап 2: все боссы концовок вышли вместе и бьют героя.');
        return;
      }
      if (isMansurDungeon) {
        setMansurDungeonEntered(false);
        setMansurKingFightStarted(true);
        setEnemyHp(currentDragonHp);
        setMessage('100000 монстров Мансура побеждены. Король Мансур вышел с короной.');
        return;
      }
      if (isAnuarWorld) {
        setAnuarWorldEntered(false);
        setAnuarKingFightStarted(true);
        setEnemyHp(currentDragonHp);
        setMessage('100000 бомба-монстров побеждены. Ануар вышел с табличкой и начался финальный бой.');
        return;
      }
      if (isFuryDungeon) {
        const furySword = createFurySword();
        setFuryDungeonEntered(false);
        setFuryChoiceOpen(true);
        setWeapons([...weapons, furySword]);
        setEquippedWeapon(furySword);
        setMessage('100000 фури-монстров побеждены. Получен секретный Фури меч. Выбери: убить или любить.');
        return;
      }
      if (isDungeon && dungeon) {
        setDungeon({ ...dungeon, enemiesLeft: 0, cleared: true, entered: false });
        setGoblinKingReady(true);
        setGoblinKingFightStarted(true);
        setEnemyHp(currentDragonHp);
        setMessage('Пещера очищена: 10000 врагов побеждены. Король гоблинов вышел на бой.');
        return;
      }
      setEnemyHp(currentDragonHp);
      setMessage(`Все монстры побеждены. Появился дракон: ${formatPower(currentDragonHp)} HP.`);
    }
  
}
