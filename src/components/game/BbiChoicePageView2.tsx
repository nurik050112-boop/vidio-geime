import { useGameModel } from '../../game/GameContext';

import { baseDragonHp,bbiFinalBossHp } from '../../game/data/adminBoss';
import { dragonSons } from '../../game/data/arcaneSpells';
import { createBbiLegendarySword } from '../../game/data/createFurySword';
import { scaledDragonPower } from '../../game/data/isDeathSword';
import { formatPower } from '../../game/data/rarityDamage';



export function BbiChoicePageView2() {
  const {
    setBbiFinalChoiceOpen, setBbiBossStage, setEnemyHp, setMessage, navigate,
    setBbiGateOpen, setBbiCityReward, setWeapons, setEquippedWeapon, setSavedCities,
    setChapter
  } = useGameModel();
  return (<main className="bbi-choice-page final">
        <section className="cave-choice bbi-choice" aria-label="BBI финальный выбор">
          <p className="intro-kicker">Директор побежден</p>
          <h1>Сражаться или отказаться</h1>
          <p>
            Появилась надпись: сражаться или отказаться. Если отказаться,
            тебя перенесет в 3 город с легендарным мечом.
          </p>
          <p>
            Если сражаться, выйдет последний босс. Он сильнее директора в 5 раз:
            {formatPower(bbiFinalBossHp)} HP.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setBbiFinalChoiceOpen(false);
              setBbiBossStage('final');
              setEnemyHp(bbiFinalBossHp);
              setMessage(`Последний BBI босс вышел на бой. Он сильнее директора в 5 раз: ${formatPower(bbiFinalBossHp)} HP.`);
              navigate('/game');
            }} type="button">
              Сражаться
            </button>
            <button className="secondary" onClick={() => {
              const bbiSword = createBbiLegendarySword();
              setBbiFinalChoiceOpen(false);
              setBbiGateOpen(false);
              setBbiCityReward(true);
              setWeapons((currentWeapons) => [...currentWeapons, bbiSword]);
              setEquippedWeapon(bbiSword);
              setSavedCities(dragonSons.slice(0, 2).map((city) => `${city.city}, ${city.country}`));
              setChapter(2);
              setEnemyHp(scaledDragonPower(baseDragonHp, 2));
              setMessage('Ты отказался сражаться. Перенос в 3 город: получен BBI легендарный меч.');
              navigate('/game');
            }} type="button">
              Отказаться
            </button>
          </div>
        </section>
      </main>);
}
