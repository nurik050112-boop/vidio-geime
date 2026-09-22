import { useGameModel } from '../../game/GameContext';

import { furyDungeonEnemiesTotal,furySwordDamageText } from '../../game/data/adminBoss';
import { formatHugeText,formatPower } from '../../game/data/rarityDamage';



export function FuryChoicePageView2() {
  const {
    setFuryChoiceOpen, setFuryKingFightStarted, setEnemyHp, currentDragonHp, setMessage,
    navigate, restart
  } = useGameModel();
  return (<main className="fury-choice-page">
        <section className="cave-choice fury-choice" aria-label="Выбор фури">
          <p className="intro-kicker">Фури меч найден</p>
          <h1>Убить или любить</h1>
          <p>
            Все {formatPower(furyDungeonEnemiesTotal)} фури-монстров побеждены.
            Герой получил секретный Фури меч с уроном {formatHugeText(furySwordDamageText)}.
          </p>
          <p>
            Перед тобой путь к королю фури. Можно любить и начать заново,
            или убить и открыть страшную секретную концовку.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setFuryChoiceOpen(false);
              setFuryKingFightStarted(true);
              setEnemyHp(currentDragonHp);
              setMessage(`Король фури вышел на бой. У него ${formatPower(currentDragonHp)} HP.`);
              navigate('/game');
            }} type="button">
              Убить
            </button>
            <button className="secondary" onClick={restart} type="button">
              Любить
            </button>
          </div>
        </section>
      </main>);
}
