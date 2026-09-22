import { useGameModel } from '../../game/GameContext';

import { arailmEnemiesTotal,baseDragonHp,programSwordDamageText } from '../../game/data/adminBoss';
import { dragonSons } from '../../game/data/arcaneSpells';
import { createProgramSword } from '../../game/data/createFurySword';
import { scaledDragonPower } from '../../game/data/isDeathSword';
import { formatHugeText,formatPower } from '../../game/data/rarityDamage';



export function ArailmChoicePageView2() {
  const {
    setArailmChoiceOpen, setArailmGateOpen, setWeapons, setEquippedWeapon, setSavedCities,
    setChapter, setEnemyHp, setMessage, navigate, setArailmKingFightStarted
  } = useGameModel();
  return (<main className="arailm-choice-page">
        <section className="cave-choice arailm-choice" aria-label="Выбор arailm">
          <p className="intro-kicker">{formatPower(arailmEnemiesTotal)} монстров побеждены</p>
          <h1>Сражаться или не сражаться</h1>
          <p>
            Если не сражаться, герой получит меч програм с уроном {formatHugeText(programSwordDamageText)}
            и сразу окажется на 5-м городе, будто 5 городов уже зачищены.
          </p>
          <p>
            Если сражаться, у босса будет {formatPower(scaledDragonPower(baseDragonHp, 15))} HP.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              const programSword = createProgramSword();
              setArailmChoiceOpen(false);
              setArailmGateOpen(false);
              setWeapons((currentWeapons) => [...currentWeapons, programSword]);
              setEquippedWeapon(programSword);
              setSavedCities(dragonSons.slice(0, 5).map((city) => `${city.city}, ${city.country}`));
              setChapter(5);
              setEnemyHp(scaledDragonPower(baseDragonHp, 5));
              setMessage('Ты не стал сражаться. Получен меч програм, 5 городов зачищены, путь начинается с 5-го города.');
              navigate('/game');
            }} type="button">
              Не сражаться
            </button>
            <button className="secondary" onClick={() => {
              setArailmChoiceOpen(false);
              setArailmKingFightStarted(true);
              setEnemyHp(scaledDragonPower(baseDragonHp, 15));
              setMessage(`Босс Арайлым вышла на бой. HP: ${formatPower(scaledDragonPower(baseDragonHp, 15))}.`);
              navigate('/game');
            }} type="button">
              Сражаться
            </button>
          </div>
        </section>
      </main>);
}
