import { useGameModel } from '../../game/GameContext';

import { mansurDungeonEnemiesTotal } from '../../game/data/adminBoss';
import { formatPower } from '../../game/data/rarityDamage';



export function MansurChoicePageView() {
  const {
    setMansurDungeonEntered, setMansurMonstersLeft, setMessage, navigate, setMansurGateOpen
  } = useGameModel();
  return (<main className="mansur-choice-page">
        <section className="cave-choice mansur-choice" aria-label="Секретное подземелье Мансура">
          <p className="intro-kicker">Код mansur</p>
          <h1>Подземелье Мансура</h1>
          <p>
            Это секретное подземелье для твоего братишки Мансура. Внутри
            {formatPower(mansurDungeonEnemiesTotal)} монстров и горный мир.
          </p>
          <p>
            После победы над всеми монстрами выйдет Король Мансур с короной.
            Победи его, чтобы получить секретный клинок Мансура.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setMansurDungeonEntered(true);
              setMansurMonstersLeft(mansurDungeonEnemiesTotal);
              setMessage(`Ты вошел в подземелье Мансура. Внутри ${formatPower(mansurDungeonEnemiesTotal)} монстров.`);
              navigate('/game');
            }} type="button">
              Войти
            </button>
            <button className="secondary" onClick={() => {
              setMansurGateOpen(false);
              setMessage('Ты вышел из подземелья Мансура.');
              navigate('/game');
            }} type="button">
              Выйти
            </button>
          </div>
        </section>
      </main>);
}
