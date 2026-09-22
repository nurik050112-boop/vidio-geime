import { useGameModel } from '../../game/GameContext';

import { arailmEnemiesTotal } from '../../game/data/adminBoss';
import { formatPower } from '../../game/data/rarityDamage';



export function ArailmChoicePageView() {
  const {
    setArailmWorldEntered, setArailmMonstersLeft, setMessage, navigate, setArailmGateOpen
  } = useGameModel();
  return (<main className="arailm-choice-page">
        <section className="cave-choice arailm-choice" aria-label="Красная программа arailm">
          <p className="intro-kicker">Код arailm</p>
          <h1>Красная программа</h1>
          <p>
            Фон стал красным, как экран взлома. Внутри ждут {formatPower(arailmEnemiesTotal)}
            код-монстров.
          </p>
          <p>
            После зачистки появится выбор: не сражаться или сражаться с боссом.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setArailmWorldEntered(true);
              setArailmMonstersLeft(arailmEnemiesTotal);
              setMessage(`Ты вошел в красную программу. Внутри ${formatPower(arailmEnemiesTotal)} код-монстров.`);
              navigate('/game');
            }} type="button">
              Войти
            </button>
            <button className="secondary" onClick={() => {
              setArailmGateOpen(false);
              setMessage('Ты вышел из красной программы.');
              navigate('/game');
            }} type="button">
              Выйти
            </button>
          </div>
        </section>
      </main>);
}
