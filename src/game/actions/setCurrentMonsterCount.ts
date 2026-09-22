import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'isAdminWorld' | 'setAdminWorldMonstersLeft' | 'isFinalSpiritWorld' | 'setFinalSpiritMonstersLeft' | 'isMonsterAvalancheWorld' | 'setMonsterAvalancheLeft' | 'isBbiWorld' | 'setBbiMonstersLeft' | 'isNuraliWorld' | 'setNuraliMonstersLeft' | 'isAisWorld' | 'setAisMonstersLeft' | 'isArailmWorld' | 'setArailmMonstersLeft' | 'isMansurDungeon' | 'setMansurMonstersLeft' | 'isAnuarWorld' | 'setAnuarBombsLeft' | 'isFuryDungeon' | 'setFuryMonstersLeft' | 'isDungeon' | 'dungeon' | 'setDungeon' | 'setCityMonsters' | 'cityMonsters' | 'chapter'>;

export function runSetCurrentMonsterCount(context: Context, nextMonsters: number): void {
  const { isAdminWorld, setAdminWorldMonstersLeft, isFinalSpiritWorld, setFinalSpiritMonstersLeft, isMonsterAvalancheWorld, setMonsterAvalancheLeft, isBbiWorld, setBbiMonstersLeft, isNuraliWorld, setNuraliMonstersLeft, isAisWorld, setAisMonstersLeft, isArailmWorld, setArailmMonstersLeft, isMansurDungeon, setMansurMonstersLeft, isAnuarWorld, setAnuarBombsLeft, isFuryDungeon, setFuryMonstersLeft, isDungeon, dungeon, setDungeon, setCityMonsters, cityMonsters, chapter } = context;
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
      setCityMonsters(cityMonsters.map((count, index) => (index === chapter ? nextMonsters : count)));
    }
  
}
