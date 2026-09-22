import { baseDragonHp,bbiDirectorHp,dungeonEnemiesTotal,finalSpiritMonsterTotal,monsterAvalancheTotal } from '../data/adminBoss';
import { dragonSons } from '../data/arcaneSpells';
import { createDeathSword,createMansurBlade,shouldEquipArmor } from '../data/createFurySword';
import { rollArmor,rollWeapon,scaledDragonPower } from '../data/isDeathSword';
import { formatPower } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'enemy' | 'setEnemyBurning' | 'addWinStreak' | 'currentMonsters' | 'isDeathGodBoss' | 'setDeathGodFightStarted' | 'setVictory' | 'setSecretEnding' | 'unlockAchievement' | 'setChapter' | 'setWeapons' | 'setEquippedWeapon' | 'setEquippedArtifactId' | 'addGold' | 'setMessage' | 'navigate' | 'isBbiBoss' | 'bbiBossStage' | 'setBbiBossStage' | 'setEnemyHp' | 'setBbiFinalChoiceOpen' | 'setBbiGateOpen' | 'setBbiBadEnding' | 'isNuraliKingBoss' | 'setNuraliGateOpen' | 'setNuraliWorldEntered' | 'setNuraliChoiceOpen' | 'setNuraliBossFightStarted' | 'setImpossibleEnding' | 'isAisSharkBoss' | 'setAisSharkFightStarted' | 'setAisFinalChoiceOpen' | 'isAisGodBoss' | 'setAisGateOpen' | 'setAisWorldEntered' | 'setAisGodFightStarted' | 'isAdminWorldBosses' | 'setAdminWorldBossesStarted' | 'setAdminFinalChoiceOpen' | 'isAdminBoss' | 'setAdminWorldGateOpen' | 'setAdminWorldEntered' | 'setAdminBossFightStarted' | 'isArailmKingBoss' | 'setArailmGateOpen' | 'setArailmWorldEntered' | 'setArailmChoiceOpen' | 'setArailmKingFightStarted' | 'isMansurKingBoss' | 'setMansurGateOpen' | 'setMansurDungeonEntered' | 'setMansurKingFightStarted' | 'isAnuarKingBoss' | 'setAnuarGateOpen' | 'setAnuarWorldEntered' | 'setAnuarKingFightStarted' | 'isFuryKingBoss' | 'setFuryGateOpen' | 'setFuryDungeonEntered' | 'setFuryChoiceOpen' | 'setFuryKingFightStarted' | 'isGoblinKingBoss' | 'setGoblinKingReady' | 'setGoblinKingFightStarted' | 'isFamilyBoss' | 'setEndingChoice' | 'isFinalSpiritBoss' | 'setFinalSpiritWorldOpen' | 'setFinalSpiritMonstersLeft' | 'setFinalSpiritFightStarted' | 'deathGodHp' | 'setHeroHp' | 'currentHeroMaxHp' | 'isFinalBoss' | 'finalSpiritDragonHp' | 'savedCities' | 'reward' | 'chapter' | 'setMonsterAvalancheEntered' | 'setMonsterAvalancheLeft' | 'setSavedCities' | 'dungeon' | 'setDungeon' | 'weapons' | 'equippedWeapon' | 'setArmors' | 'armors' | 'equippedArmor' | 'setEquippedArmor' | 'heroHp'>;

export function runClearCity(context: Context): void {
  const { enemy, setEnemyBurning, addWinStreak, currentMonsters, isDeathGodBoss, setDeathGodFightStarted, setVictory, setSecretEnding, unlockAchievement, setChapter, setWeapons, setEquippedWeapon, setEquippedArtifactId, addGold, setMessage, navigate, isBbiBoss, bbiBossStage, setBbiBossStage, setEnemyHp, setBbiFinalChoiceOpen, setBbiGateOpen, setBbiBadEnding, isNuraliKingBoss, setNuraliGateOpen, setNuraliWorldEntered, setNuraliChoiceOpen, setNuraliBossFightStarted, setImpossibleEnding, isAisSharkBoss, setAisSharkFightStarted, setAisFinalChoiceOpen, isAisGodBoss, setAisGateOpen, setAisWorldEntered, setAisGodFightStarted, isAdminWorldBosses, setAdminWorldBossesStarted, setAdminFinalChoiceOpen, isAdminBoss, setAdminWorldGateOpen, setAdminWorldEntered, setAdminBossFightStarted, isArailmKingBoss, setArailmGateOpen, setArailmWorldEntered, setArailmChoiceOpen, setArailmKingFightStarted, isMansurKingBoss, setMansurGateOpen, setMansurDungeonEntered, setMansurKingFightStarted, isAnuarKingBoss, setAnuarGateOpen, setAnuarWorldEntered, setAnuarKingFightStarted, isFuryKingBoss, setFuryGateOpen, setFuryDungeonEntered, setFuryChoiceOpen, setFuryKingFightStarted, isGoblinKingBoss, setGoblinKingReady, setGoblinKingFightStarted, isFamilyBoss, setEndingChoice, isFinalSpiritBoss, setFinalSpiritWorldOpen, setFinalSpiritMonstersLeft, setFinalSpiritFightStarted, deathGodHp, setHeroHp, currentHeroMaxHp, isFinalBoss, finalSpiritDragonHp, savedCities, reward, chapter, setMonsterAvalancheEntered, setMonsterAvalancheLeft, setSavedCities, dungeon, setDungeon, weapons, equippedWeapon, setArmors, armors, equippedArmor, setEquippedArmor, heroHp } = context;
    if (!enemy) return;
    setEnemyBurning(false);
    addWinStreak(currentMonsters === 0 ? 'дракон или босс побежден' : 'город очищен');

    if (isDeathGodBoss) {
      const deathSword = createDeathSword();
      setDeathGodFightStarted(false);
      setVictory(true);
      setSecretEnding('deathVictory');
      unlockAchievement('deathVictory');
      setChapter(dragonSons.length + 1);
      setWeapons((currentWeapons) => [...currentWeapons, deathSword]);
      setEquippedWeapon(deathSword);
      setEquippedArtifactId('godHead');
      addGold(666_666_666);
      setMessage('Король ада побежден. Концовка: победивший смерть. Получены Голова бога и смертельный секретный меч.');
      navigate('/world');
      return;
    }

    if (isBbiBoss) {
      if (bbiBossStage === 'manager') {
        setBbiBossStage('director');
        setEnemyHp(bbiDirectorHp);
        setMessage(`Управляющий побежден. Появился Директор: ${formatPower(bbiDirectorHp)} HP, в 3 раза больше.`);
        return;
      }
      if (bbiBossStage === 'director') {
        setBbiBossStage(null);
        setBbiFinalChoiceOpen(true);
        setMessage('Директор побежден. Появилась надпись: сражаться или отказаться.');
        return;
      }
      setBbiBossStage(null);
      setBbiGateOpen(false);
      setBbiBadEnding(true);
      unlockAchievement('bbiBadEnding');
      setVictory(true);
      setChapter(dragonSons.length + 1);
      addGold(5_000_000);
      setMessage('Последний BBI босс побежден. Концовка: они лишь дети, ты монстр.');
      navigate('/world');
      return;
    }

    if (isNuraliKingBoss) {
      setNuraliGateOpen(false);
      setNuraliWorldEntered(false);
      setNuraliChoiceOpen(false);
      setNuraliBossFightStarted(false);
      setImpossibleEnding(true);
      setVictory(true);
      setChapter(dragonSons.length + 1);
      unlockAchievement('impossibleEnding');
      addGold(2_281_000);
      setMessage('Босс Нурали побежден. Открыта невозможная концовка и артефакт Медальон невозможности.');
      navigate('/world');
      return;
    }

    if (isAisSharkBoss) {
      setAisSharkFightStarted(false);
      setAisFinalChoiceOpen(true);
      setMessage('Акула побеждена. Появилась надпись: сразиться с богом моря Айсултаном? Да или нет.');
      navigate('/world');
      return;
    }

    if (isAisGodBoss) {
      setVictory(true);
      setSecretEnding('aisultanSea');
      unlockAchievement('aisultanSea');
      setAisGateOpen(false);
      setAisWorldEntered(false);
      setAisSharkFightStarted(false);
      setAisFinalChoiceOpen(false);
      setAisGodFightStarted(false);
      setChapter(dragonSons.length + 1);
      addGold(10_000_000);
      setMessage('Воденой мир открыт: бог моря Айсултан побежден.');
      navigate('/world');
      return;
    }

    if (isAdminWorldBosses) {
      setAdminWorldBossesStarted(false);
      setAdminFinalChoiceOpen(true);
      setMessage('Все боссы концовок побеждены. На экране надпись: ты готов или не готов сразиться с админом?');
      navigate('/world');
      return;
    }

    if (isAdminBoss) {
      setVictory(true);
      setSecretEnding('adminImpossible');
      unlockAchievement('adminImpossible');
      setAdminWorldGateOpen(false);
      setAdminWorldEntered(false);
      setAdminWorldBossesStarted(false);
      setAdminFinalChoiceOpen(false);
      setAdminBossFightStarted(false);
      setChapter(dragonSons.length + 1);
      addGold(100_000_000);
      setMessage('Концовка открыта: это невозможно пройти. Герой убил админа и стал уж слишком сильным.');
      navigate('/world');
      return;
    }

    if (isArailmKingBoss) {
      setVictory(true);
      setSecretEnding('arailmKing');
      unlockAchievement('arailmKing');
      setArailmGateOpen(false);
      setArailmWorldEntered(false);
      setArailmChoiceOpen(false);
      setArailmKingFightStarted(false);
      setChapter(dragonSons.length + 1);
      addGold(1_000_000);
      setMessage('Секретная концовка открыта: героиня поняла, что она всего лишь код.');
      navigate('/world');
      return;
    }

    if (isMansurKingBoss) {
      const mansurBlade = createMansurBlade();
      setVictory(true);
      setSecretEnding('mansurKing');
      unlockAchievement('mansurKing');
      setMansurGateOpen(false);
      setMansurDungeonEntered(false);
      setMansurKingFightStarted(false);
      setChapter(dragonSons.length + 1);
      setWeapons((currentWeapons) => [...currentWeapons, mansurBlade]);
      setEquippedWeapon(mansurBlade);
      addGold(1_000_000);
      setMessage('Король Мансур побежден. Получен Мансур секретный клинок.');
      navigate('/world');
      return;
    }

    if (isAnuarKingBoss) {
      setVictory(true);
      setSecretEnding('anuarKing');
      unlockAchievement('anuarKing');
      setAnuarGateOpen(false);
      setAnuarWorldEntered(false);
      setAnuarKingFightStarted(false);
      setChapter(dragonSons.length + 1);
      addGold(1_000_000);
      setMessage('Бомбическая концовка открыта: Ануар побежден, секретный город бомб зачищен.');
      navigate('/world');
      return;
    }

    if (isFuryKingBoss) {
      setSecretEnding('furyKing');
      unlockAchievement('furyKing');
      setFuryGateOpen(false);
      setFuryDungeonEntered(false);
      setFuryChoiceOpen(false);
      setFuryKingFightStarted(false);
      addGold(999_999);
      setMessage('Секретная концовка открыта: король фури побежден.');
      navigate('/world');
      return;
    }

    if (isGoblinKingBoss) {
      setVictory(true);
      setSecretEnding('goblinKing');
      unlockAchievement('goblinKing');
      setGoblinKingReady(false);
      setGoblinKingFightStarted(false);
      setChapter(dragonSons.length + 1);
      addGold(777_777);
      setMessage('Секретная концовка открыта: король гоблинов побежден.');
      navigate('/world');
      return;
    }

    if (isFamilyBoss) {
      setVictory(true);
      setEndingChoice('fight');
      unlockAchievement('dragonWar');
      setChapter(dragonSons.length + 1);
      addGold(100_000);
      setMessage('Семья короля драконов побеждена. Началась плохая концовка: война истребила драконов.');
      navigate('/world');
      return;
    }

    if (isFinalSpiritBoss) {
      setFinalSpiritWorldOpen(false);
      setFinalSpiritMonstersLeft(finalSpiritMonsterTotal);
      setFinalSpiritFightStarted(false);
      setDeathGodFightStarted(true);
      setEnemyHp(deathGodHp);
      setHeroHp(currentHeroMaxHp);
      setMessage(`Души финального босса умерли. Из ада вышел Король ада: ${formatPower(deathGodHp)} HP.`);
      navigate('/game');
      return;
    }

    if (isFinalBoss) {
      if (Math.random() >= 0.1) {
        setVictory(true);
        setChapter(dragonSons.length + 1);
        setHeroHp(currentHeroMaxHp);
        setMessage('Финальный босс побежден. Душа короля драконов не появилась: шанс был 10%. Открылся финальный выбор.');
        navigate('/world');
        return;
      }
      setFinalSpiritWorldOpen(true);
      setFinalSpiritFightStarted(false);
      setFinalSpiritMonstersLeft(finalSpiritMonsterTotal);
      setEnemyHp(finalSpiritDragonHp);
      setHeroHp(currentHeroMaxHp);
      setMessage(`Финальный босс побежден. Сработал шанс 10%: открылся подземный мир. Сначала победи ${formatPower(finalSpiritMonsterTotal)} темных монстров, потом появятся души.`);
      navigate('/game');
      return;
    }

    const clearedCity = `${enemy.city}, ${enemy.country}`;
    const nextSavedCities = savedCities.includes(clearedCity) ? savedCities : [...savedCities, clearedCity];
    const prize = reward;
    const droppedWeapon = rollWeapon(1, chapter + 1);
    const droppedArmor = rollArmor(1, chapter + 1);

    if (chapter === 4 && Math.random() < 0.4) {
      setMonsterAvalancheEntered(true);
      setMonsterAvalancheLeft(monsterAvalancheTotal);
      setHeroHp(currentHeroMaxHp);
      setMessage('5-й дракон умер, и с шансом 40% открылся 5 мир: тебя унесло в лавину из 10 миллиардов монстров.');
      navigate('/game');
      return;
    }

    setSavedCities(nextSavedCities);
    addGold(prize);
    if (chapter === 6 && !dungeon) {
      setDungeon({ city: enemy.city, danger: 80 + chapter * 30, cleared: false, entered: false, enemiesLeft: dungeonEnemiesTotal, declined: false });
    }

    if (droppedWeapon) {
      setWeapons([...weapons, droppedWeapon]);
      if (!equippedWeapon || droppedWeapon.damage > equippedWeapon.damage) {
        setEquippedWeapon(droppedWeapon);
      }
    }

    if (droppedArmor) {
      setArmors([...armors, droppedArmor]);
      if (shouldEquipArmor(equippedArmor, droppedArmor)) {
        setEquippedArmor(droppedArmor);
      }
    }

    if (chapter >= dragonSons.length - 1) {
      setChapter(dragonSons.length);
      setEnemyHp(scaledDragonPower(baseDragonHp, dragonSons.length + 2));
      setHeroHp(currentHeroMaxHp);
      setMessage(`10 драконов побеждены. Появился их отец и король: Великий дракон. У него ${formatPower(scaledDragonPower(baseDragonHp, dragonSons.length + 2))} HP.`);
      return;
    }

    setChapter(chapter + 1);
    setEnemyHp(scaledDragonPower(baseDragonHp, chapter + 1));
    setHeroHp(Math.min(currentHeroMaxHp, heroHp + 28));
    setMessage(`${clearedCity} очищен от монстров. Ты получил ${prize} золота. ${chapter === 6 ? 'После победы над 7-м драконом открылась пещера. Выбери: войти или выйти из подземелья.' : 'Путь идет дальше.'}`);
  
}
