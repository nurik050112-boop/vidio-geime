import { type FormEvent } from 'react';
import { adminWorldMonsterTotal,aisultanMonsterTotal,anuarBombEnemiesTotal,bbiMonsterTotal,furyDungeonEnemiesTotal,mansurDungeonEnemiesTotal,nuraliMonsterTotal } from '../data/adminBoss';
import { createAdminHelmet,createArcaneScepter,createBbiLegendarySword } from '../data/createFurySword';
import { createAdminNuke,createBillionSword,normalizeCode } from '../data/isDeathSword';
import { getWeaponDisplayName } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'adminCode' | 'setFuryGateOpen' | 'setFuryDungeonEntered' | 'setFuryMonstersLeft' | 'setFuryChoiceOpen' | 'setFuryKingFightStarted' | 'setAdminCode' | 'setMessage' | 'navigate' | 'setAnuarGateOpen' | 'setAnuarWorldEntered' | 'setAnuarBombsLeft' | 'setAnuarKingFightStarted' | 'setMansurGateOpen' | 'setMansurDungeonEntered' | 'setMansurMonstersLeft' | 'setMansurKingFightStarted' | 'setNuraliGateOpen' | 'setNuraliWorldEntered' | 'setNuraliMonstersLeft' | 'setNuraliChoiceOpen' | 'setNuraliBossFightStarted' | 'openArailmWorld' | 'setAisGateOpen' | 'setAisWorldEntered' | 'setAisMonstersLeft' | 'setAisSharkFightStarted' | 'setAisFinalChoiceOpen' | 'setAisGodFightStarted' | 'chapter' | 'setWeapons' | 'setEquippedWeapon' | 'setAdminWorldGateOpen' | 'setAdminWorldEntered' | 'setAdminWorldMonstersLeft' | 'setAdminWorldBossesStarted' | 'setAdminFinalChoiceOpen' | 'setAdminBossFightStarted' | 'setBbiGateOpen' | 'setBbiWorldEntered' | 'setBbiMonstersLeft' | 'setBbiBossStage' | 'setBbiFinalChoiceOpen' | 'setBbiCityReward' | 'setArmors' | 'setEquippedArmor' | 'setHeroHp' | 'setGold' | 'setGoldMultiplier' | 'setInfiniteGold'>;

export function runSubmitAdminCode(context: Context, event: FormEvent<HTMLFormElement>): void {
  const { adminCode, setFuryGateOpen, setFuryDungeonEntered, setFuryMonstersLeft, setFuryChoiceOpen, setFuryKingFightStarted, setAdminCode, setMessage, navigate, setAnuarGateOpen, setAnuarWorldEntered, setAnuarBombsLeft, setAnuarKingFightStarted, setMansurGateOpen, setMansurDungeonEntered, setMansurMonstersLeft, setMansurKingFightStarted, setNuraliGateOpen, setNuraliWorldEntered, setNuraliMonstersLeft, setNuraliChoiceOpen, setNuraliBossFightStarted, openArailmWorld, setAisGateOpen, setAisWorldEntered, setAisMonstersLeft, setAisSharkFightStarted, setAisFinalChoiceOpen, setAisGodFightStarted, chapter, setWeapons, setEquippedWeapon, setAdminWorldGateOpen, setAdminWorldEntered, setAdminWorldMonstersLeft, setAdminWorldBossesStarted, setAdminFinalChoiceOpen, setAdminBossFightStarted, setBbiGateOpen, setBbiWorldEntered, setBbiMonstersLeft, setBbiBossStage, setBbiFinalChoiceOpen, setBbiCityReward, setArmors, setEquippedArmor, setHeroHp, setGold, setGoldMultiplier, setInfiniteGold } = context;
    event.preventDefault();
    const code = normalizeCode(adminCode);

    if (code === 'wwfuri') {
      setFuryGateOpen(true);
      setFuryDungeonEntered(false);
      setFuryMonstersLeft(furyDungeonEnemiesTotal);
      setFuryChoiceOpen(false);
      setFuryKingFightStarted(false);
      setAdminCode('');
      setMessage('Код wwfuri открыл секретный фури-мир. Выбери: войти или выйти.');
      navigate('/world');
      return;
    }

    if (code === 'anuar') {
      setAnuarGateOpen(true);
      setAnuarWorldEntered(false);
      setAnuarBombsLeft(anuarBombEnemiesTotal);
      setAnuarKingFightStarted(false);
      setAdminCode('');
      setMessage('Код Anuar открыл секретный мир города бомб. Выбери: войти или выйти.');
      navigate('/world');
      return;
    }

    if (code === 'mansur') {
      setMansurGateOpen(true);
      setMansurDungeonEntered(false);
      setMansurMonstersLeft(mansurDungeonEnemiesTotal);
      setMansurKingFightStarted(false);
      setAdminCode('');
      setMessage('Код mansur открыл секретное подземелье Мансура для братишки.');
      navigate('/world');
      return;
    }

    if (code === 'nurali2281') {
      setNuraliGateOpen(true);
      setNuraliWorldEntered(false);
      setNuraliMonstersLeft(nuraliMonsterTotal);
      setNuraliChoiceOpen(false);
      setNuraliBossFightStarted(false);
      setAdminCode('');
      setMessage('Код nurali2281 открыл новый мир Нурали. Выбери: войти или выйти.');
      navigate('/world');
      return;
    }

    if (code === 'arailm' || code === 'arailym') {
      openArailmWorld();
      return;
    }

    if (code === 'ais228198') {
      setAisGateOpen(true);
      setAisWorldEntered(false);
      setAisMonstersLeft(aisultanMonsterTotal);
      setAisSharkFightStarted(false);
      setAisFinalChoiceOpen(false);
      setAisGodFightStarted(false);
      setAdminCode('');
      setMessage('Код ais228198 открыл 10 мир: водный мир Айсултана. Выбери: войти или выйти.');
      navigate('/world');
      return;
    }

    if (code === 'magic') {
      const arcaneWeapon = createArcaneScepter(Math.max(3, chapter + 3));
      setWeapons((currentWeapons) => [...currentWeapons, arcaneWeapon]);
      setEquippedWeapon(arcaneWeapon);
      setAdminCode('');
      setMessage(`Код magic дал ${getWeaponDisplayName(arcaneWeapon)}. Каждый взмах выпускает магию, навык дает много магии с перезарядкой.`);
      return;
    }

    if (code === 'admin2281') {
      setAdminWorldGateOpen(true);
      setAdminWorldEntered(false);
      setAdminWorldMonstersLeft(adminWorldMonsterTotal);
      setAdminWorldBossesStarted(false);
      setAdminFinalChoiceOpen(false);
      setAdminBossFightStarted(false);
      setAdminCode('');
      setMessage('Код ADMIN2281 открыл 11 мир: админская сложность.');
      navigate('/world');
      return;
    }

    if (code === 'bbi' || code === 'ииш') {
      setBbiGateOpen(true);
      setBbiWorldEntered(false);
      setBbiMonstersLeft(bbiMonsterTotal);
      setBbiBossStage(null);
      setBbiFinalChoiceOpen(false);
      setBbiCityReward(false);
      setAdminCode('');
      setMessage('Код BBI открыл новый мир. Выбери: войти или не входить.');
      navigate('/world');
      return;
    }

    if (code === 'ibb') {
      const bbiSword = createBbiLegendarySword();
      setWeapons((currentWeapons) => [...currentWeapons, bbiSword]);
      setEquippedWeapon(bbiSword);
      setAdminCode('');
      setMessage('Код ibb принят. Получен BBI огненный легендарный меч.');
      return;
    }

    if (code === '999999999') {
      const sword = createBillionSword();
      setWeapons((currentWeapons) => [...currentWeapons, sword]);
      setEquippedWeapon(sword);
      setAdminCode('');
      setMessage('Код принят. Получен меч с уроном 999999999.');
      return;
    }

    if (code !== 'wwnurikww' && code !== 'ццтгкшлцц') {
      setAdminCode('');
      setMessage('Код не подошел.');
      return;
    }

    const nuke = createAdminNuke();
    const helmet = createAdminHelmet();
    const isSuperAdminCode = code === 'ццтгкшлцц';
    setWeapons((currentWeapons) => [...currentWeapons, nuke]);
    setArmors((currentArmors) => [...currentArmors, helmet]);
    setEquippedWeapon(nuke);
    setEquippedArmor(helmet);
    setHeroHp(Number.MAX_SAFE_INTEGER);
    if (isSuperAdminCode) {
      setGold(Number.MAX_SAFE_INTEGER);
      setGoldMultiplier(100);
      setInfiniteGold(true);
    }
    setAdminCode('');
    setMessage(isSuperAdminCode
      ? 'Код ццтгкшлцц принят. Ядерка усилена до ∞, получены шлем, бесконечные деньги и множитель денег x100.'
      : 'Код wwnurikww принят. Получена админская ядерка и шлем с огромным здоровьем.');
  
}
