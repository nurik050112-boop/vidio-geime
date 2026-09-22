import { useGameModel } from '../../game/GameContext';

import { nuraliBossHp } from '../../game/data/adminBoss';
import { formatPower } from '../../game/data/rarityDamage';



export function NuraliChoicePageView2() {
  const {
    setNuraliChoiceOpen, setNuraliBossFightStarted, setEnemyHp, setMessage, navigate,
    setNuraliGateOpen
  } = useGameModel();
  return (<main className="nurali-choice-page final">
        <section className="cave-choice nurali-choice" aria-label="Выбор Нурали">
          <p className="intro-kicker">100 монстров побеждены</p>
          <h1>Драться с Нурали?</h1>
          <p>
            После смерти 100 монстров на весь экран вышла надпись: драться с Нурали или нет.
          </p>
          <p>
            Нурали главный босс. У него {formatPower(nuraliBossHp)} HP.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setNuraliChoiceOpen(false);
              setNuraliBossFightStarted(true);
              setEnemyHp(nuraliBossHp);
              setMessage(`Нурали вышел на бой. HP босса: ${formatPower(nuraliBossHp)}.`);
              navigate('/game');
            }} type="button">
              Драться
            </button>
            <button className="secondary" onClick={() => {
              setNuraliChoiceOpen(false);
              setNuraliGateOpen(false);
              setMessage('Ты отказался драться с Нурали. Новый мир закрылся.');
              navigate('/game');
            }} type="button">
              Нет
            </button>
          </div>
        </section>
      </main>);
}
