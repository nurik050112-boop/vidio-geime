import { useGameModel } from '../../game/GameContext';

import { aisultanSeaGodHp,baseDragonHp } from '../../game/data/adminBoss';
import { dragonSons } from '../../game/data/arcaneSpells';
import { createAisultanSword } from '../../game/data/createFurySword';
import { scaledDragonPower } from '../../game/data/isDeathSword';
import { formatPower } from '../../game/data/rarityDamage';



export function AisChoicePageView2() {
  const {
    setAisFinalChoiceOpen, setAisGodFightStarted, setEnemyHp, setMessage, navigate,
    weapons, setAisGateOpen, setWeapons, setEquippedWeapon, setSavedCities,
    setChapter
  } = useGameModel();
  return (<main className="ais-choice-page final">
        <section className="cave-choice ais-choice" aria-label="Выбор бога моря Айсултана">
          <p className="intro-kicker">Акула побеждена</p>
          <h1>Сразиться с богом моря Айсултаном?</h1>
          <p>
            Если победишь, получишь концовку: воденой мир.
          </p>
          <p>
            Если откажешься, тебя отправит в 6 город и даст меч сильнее твоего лучшего оружия на 100000%.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setAisFinalChoiceOpen(false);
              setAisGodFightStarted(true);
              setEnemyHp(aisultanSeaGodHp);
              setMessage(`Бог моря Айсултан вышел на бой. HP: ${formatPower(aisultanSeaGodHp)}.`);
              navigate('/game');
            }} type="button">
              Да
            </button>
            <button className="secondary" onClick={() => {
              const bestDamage = Math.max(1, ...weapons.map((weapon) => weapon.damage));
              const seaSword = createAisultanSword(bestDamage);
              setAisFinalChoiceOpen(false);
              setAisGateOpen(false);
              setWeapons((currentWeapons) => [...currentWeapons, seaSword]);
              setEquippedWeapon(seaSword);
              setSavedCities(dragonSons.slice(0, 5).map((city) => `${city.city}, ${city.country}`));
              setChapter(5);
              setEnemyHp(scaledDragonPower(baseDragonHp, 5));
              setMessage('Ты отказался сражаться с Айсултаном. Перенос в 6 город: получен воденой меч сильнее лучшего оружия на 100000%.');
              navigate('/game');
            }} type="button">
              Нет
            </button>
          </div>
        </section>
      </main>);
}
