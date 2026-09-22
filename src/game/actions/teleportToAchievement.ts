import { adminFinalBossHp,adminWorldMonsterTotal,aisultanMonsterTotal,aisultanSeaGodHp,baseDragonHp,bbiFinalBossHp,bbiMonsterTotal,finalSpiritMonsterTotal,monsterAvalancheStartChapter,monsterAvalancheTotal,monstersPerCity,nuraliBossHp,nuraliMonsterTotal } from '../data/adminBoss';
import { dragonSons } from '../data/arcaneSpells';
import { type AchievementId } from '../data/dragonSon';
import { scaledDragonPower } from '../data/isDeathSword';
import { formatPower } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'achievementCheatActive' | 'setSavedCities' | 'setCityMonsters' | 'setIntroSkipped' | 'setVictory' | 'setEndingChoice' | 'setSecretEnding' | 'setGoblinKingReady' | 'setGoblinKingFightStarted' | 'setFuryGateOpen' | 'setFuryDungeonEntered' | 'setFuryChoiceOpen' | 'setFuryKingFightStarted' | 'setAnuarGateOpen' | 'setAnuarWorldEntered' | 'setAnuarKingFightStarted' | 'setMansurGateOpen' | 'setMansurDungeonEntered' | 'setMansurKingFightStarted' | 'setArailmGateOpen' | 'setArailmWorldEntered' | 'setArailmChoiceOpen' | 'setArailmKingFightStarted' | 'setAisGateOpen' | 'setAisWorldEntered' | 'setAisMonstersLeft' | 'setAisSharkFightStarted' | 'setAisFinalChoiceOpen' | 'setAisGodFightStarted' | 'setAdminWorldGateOpen' | 'setAdminWorldEntered' | 'setAdminWorldMonstersLeft' | 'setAdminWorldBossesStarted' | 'setAdminFinalChoiceOpen' | 'setAdminBossFightStarted' | 'setBbiGateOpen' | 'setBbiWorldEntered' | 'setBbiMonstersLeft' | 'setBbiBossStage' | 'setBbiFinalChoiceOpen' | 'setBbiCityReward' | 'setBbiBadEnding' | 'setNuraliGateOpen' | 'setNuraliWorldEntered' | 'setNuraliMonstersLeft' | 'setNuraliChoiceOpen' | 'setNuraliBossFightStarted' | 'setMonsterAvalancheEntered' | 'setMonsterAvalancheLeft' | 'setMonsterAvalancheEnding' | 'setFinalSpiritWorldOpen' | 'setFinalSpiritMonstersLeft' | 'setFinalSpiritFightStarted' | 'setDeathGodFightStarted' | 'setImpossibleEnding' | 'setHeroHp' | 'currentHeroMaxHp' | 'setHeroPosition' | 'setHeroHeight' | 'verticalVelocity' | 'setEnemyBurning' | 'setMonsterAttackCount' | 'setChapter' | 'setEnemyHp' | 'kingDragonHp' | 'setMessage' | 'navigate' | 'deathGodHp'>;

export function runTeleportToAchievement(context: Context, id: AchievementId): void {
  const { achievementCheatActive, setSavedCities, setCityMonsters, setIntroSkipped, setVictory, setEndingChoice, setSecretEnding, setGoblinKingReady, setGoblinKingFightStarted, setFuryGateOpen, setFuryDungeonEntered, setFuryChoiceOpen, setFuryKingFightStarted, setAnuarGateOpen, setAnuarWorldEntered, setAnuarKingFightStarted, setMansurGateOpen, setMansurDungeonEntered, setMansurKingFightStarted, setArailmGateOpen, setArailmWorldEntered, setArailmChoiceOpen, setArailmKingFightStarted, setAisGateOpen, setAisWorldEntered, setAisMonstersLeft, setAisSharkFightStarted, setAisFinalChoiceOpen, setAisGodFightStarted, setAdminWorldGateOpen, setAdminWorldEntered, setAdminWorldMonstersLeft, setAdminWorldBossesStarted, setAdminFinalChoiceOpen, setAdminBossFightStarted, setBbiGateOpen, setBbiWorldEntered, setBbiMonstersLeft, setBbiBossStage, setBbiFinalChoiceOpen, setBbiCityReward, setBbiBadEnding, setNuraliGateOpen, setNuraliWorldEntered, setNuraliMonstersLeft, setNuraliChoiceOpen, setNuraliBossFightStarted, setMonsterAvalancheEntered, setMonsterAvalancheLeft, setMonsterAvalancheEnding, setFinalSpiritWorldOpen, setFinalSpiritMonstersLeft, setFinalSpiritFightStarted, setDeathGodFightStarted, setImpossibleEnding, setHeroHp, currentHeroMaxHp, setHeroPosition, setHeroHeight, verticalVelocity, setEnemyBurning, setMonsterAttackCount, setChapter, setEnemyHp, kingDragonHp, setMessage, navigate, deathGodHp } = context;
    if (!achievementCheatActive) return;

    const markSavedThrough = (lastIndex: number) => {
      setSavedCities(dragonSons.slice(0, Math.max(0, lastIndex + 1)).map((city) => `${city.city}, ${city.country}`));
      setCityMonsters(dragonSons.map((_, index) => (index <= lastIndex ? 0 : monstersPerCity)));
    };

    setIntroSkipped(true);
    setVictory(false);
    setEndingChoice(null);
    setSecretEnding(null);
    setGoblinKingReady(false);
    setGoblinKingFightStarted(false);
    setFuryGateOpen(false);
    setFuryDungeonEntered(false);
    setFuryChoiceOpen(false);
    setFuryKingFightStarted(false);
    setAnuarGateOpen(false);
    setAnuarWorldEntered(false);
    setAnuarKingFightStarted(false);
    setMansurGateOpen(false);
    setMansurDungeonEntered(false);
    setMansurKingFightStarted(false);
    setArailmGateOpen(false);
    setArailmWorldEntered(false);
    setArailmChoiceOpen(false);
    setArailmKingFightStarted(false);
    setAisGateOpen(false);
    setAisWorldEntered(false);
    setAisMonstersLeft(aisultanMonsterTotal);
    setAisSharkFightStarted(false);
    setAisFinalChoiceOpen(false);
    setAisGodFightStarted(false);
    setAdminWorldGateOpen(false);
    setAdminWorldEntered(false);
    setAdminWorldMonstersLeft(adminWorldMonsterTotal);
    setAdminWorldBossesStarted(false);
    setAdminFinalChoiceOpen(false);
    setAdminBossFightStarted(false);
    setBbiGateOpen(false);
    setBbiWorldEntered(false);
    setBbiMonstersLeft(bbiMonsterTotal);
    setBbiBossStage(null);
    setBbiFinalChoiceOpen(false);
    setBbiCityReward(false);
    setBbiBadEnding(false);
    setNuraliGateOpen(false);
    setNuraliWorldEntered(false);
    setNuraliMonstersLeft(nuraliMonsterTotal);
    setNuraliChoiceOpen(false);
    setNuraliBossFightStarted(false);
    setMonsterAvalancheEntered(false);
    setMonsterAvalancheLeft(monsterAvalancheTotal);
    setMonsterAvalancheEnding(false);
    setFinalSpiritWorldOpen(false);
    setFinalSpiritMonstersLeft(finalSpiritMonsterTotal);
    setFinalSpiritFightStarted(false);
    setDeathGodFightStarted(false);
    setImpossibleEnding(false);
    setHeroHp(currentHeroMaxHp);
    setHeroPosition({ x: -18_000, z: 0 });
    setHeroHeight(0);
    verticalVelocity.current = 0;
    setEnemyBurning(false);
    setMonsterAttackCount(0);

    if (id === 'dragonPeace') {
      setVictory(true);
      setChapter(dragonSons.length + 1);
      markSavedThrough(dragonSons.length - 1);
      setEnemyHp(kingDragonHp);
      setEndingChoice(null);
      setMessage('Телепорт: финальный выбор после Великого дракона.');
      navigate('/world');
      return;
    }

    if (id === 'dragonWar') {
      setChapter(dragonSons.length + 1);
      markSavedThrough(dragonSons.length - 1);
      setEndingChoice('family');
      setEnemyHp(kingDragonHp * 100);
      setMessage('Телепорт: битва с семьей драконов.');
      navigate('/game');
      return;
    }

    if (id === 'monsterAvalanche') {
      setChapter(monsterAvalancheStartChapter);
      markSavedThrough(monsterAvalancheStartChapter - 1);
      setMonsterAvalancheEntered(true);
      setMonsterAvalancheLeft(monsterAvalancheTotal);
      setHeroHp(currentHeroMaxHp);
      setMessage('Телепорт: 5 мир. Лавина из 10 миллиардов монстров уже несется.');
      navigate('/game');
      return;
    }

    if (id === 'goblinKing') {
      setChapter(0);
      setSavedCities([]);
      setCityMonsters(dragonSons.map(() => monstersPerCity));
      setGoblinKingReady(true);
      setGoblinKingFightStarted(true);
      setEnemyHp(scaledDragonPower(baseDragonHp, 4));
      setMessage('Телепорт: Король гоблинов вышел на бой.');
      navigate('/game');
      return;
    }

    if (id === 'furyKing') {
      setChapter(4);
      markSavedThrough(4);
      setFuryKingFightStarted(true);
      setEnemyHp(scaledDragonPower(baseDragonHp, 10));
      setMessage('Телепорт: Король фури вышел на бой.');
      navigate('/game');
      return;
    }

    if (id === 'anuarKing') {
      setChapter(6);
      markSavedThrough(6);
      setAnuarKingFightStarted(true);
      setEnemyHp(scaledDragonPower(baseDragonHp, 12));
      setMessage('Телепорт: Ануар вышел на финальный бой.');
      navigate('/game');
      return;
    }

    if (id === 'mansurKing') {
      setChapter(7);
      markSavedThrough(7);
      setMansurKingFightStarted(true);
      setEnemyHp(scaledDragonPower(baseDragonHp, 14));
      setMessage('Телепорт: Король Мансур вышел с короной.');
      navigate('/game');
      return;
    }

    if (id === 'arailmKing') {
      setChapter(8);
      markSavedThrough(8);
      setArailmKingFightStarted(true);
      setEnemyHp(scaledDragonPower(baseDragonHp, 15));
      setMessage(`Телепорт: босс Арайлым вышла на бой. HP: ${formatPower(scaledDragonPower(baseDragonHp, 15))}.`);
      navigate('/game');
      return;
    }

    if (id === 'aisultanSea') {
      setChapter(9);
      markSavedThrough(9);
      setAisGateOpen(true);
      setAisWorldEntered(false);
      setAisMonstersLeft(0);
      setAisSharkFightStarted(false);
      setAisFinalChoiceOpen(false);
      setAisGodFightStarted(true);
      setEnemyHp(aisultanSeaGodHp);
      setMessage(`Телепорт: 10 водный мир. Бог моря Айсултан вышел на бой. HP: ${formatPower(aisultanSeaGodHp)}.`);
      navigate('/game');
      return;
    }

    if (id === 'adminImpossible') {
      setChapter(10);
      markSavedThrough(dragonSons.length - 1);
      setAdminWorldGateOpen(true);
      setAdminBossFightStarted(true);
      setEnemyHp(adminFinalBossHp);
      setMessage('Телепорт: 11 мир. Админ вышел на финальный бой.');
      navigate('/game');
      return;
    }

    if (id === 'bbiBadEnding') {
      setChapter(11);
      markSavedThrough(dragonSons.length - 1);
      setBbiFinalChoiceOpen(true);
      setEnemyHp(bbiFinalBossHp);
      setMessage('Телепорт: BBI финальный выбор. Можно сражаться или отказаться.');
      navigate('/game');
      return;
    }

    if (id === 'impossibleEnding') {
      setChapter(12);
      markSavedThrough(dragonSons.length - 1);
      setNuraliBossFightStarted(true);
      setEnemyHp(nuraliBossHp);
      setMessage(`Телепорт: Нурали вышел на бой за невозможную концовку. HP босса: ${formatPower(nuraliBossHp)}.`);
      navigate('/game');
      return;
    }

    if (id === 'deathHell') {
      setVictory(true);
      setSecretEnding('deathHell');
      setChapter(dragonSons.length + 1);
      markSavedThrough(dragonSons.length - 1);
      setMessage('Телепорт: адская концовка. Душа героя попала в ад.');
      navigate('/world');
      return;
    }

    if (id === 'deathVictory') {
      setChapter(dragonSons.length);
      markSavedThrough(dragonSons.length - 1);
      setDeathGodFightStarted(true);
      setEnemyHp(deathGodHp);
      setMessage(`Телепорт: Король ада вышел на бой. HP: ${formatPower(deathGodHp)}.`);
      navigate('/game');
    }
  
}
