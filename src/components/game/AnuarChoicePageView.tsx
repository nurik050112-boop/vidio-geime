import { useGameModel } from '../../game/GameContext';

import { anuarBombEnemiesTotal } from '../../game/data/adminBoss';
import { formatPower } from '../../game/data/rarityDamage';



export function AnuarChoicePageView() {
  const {
    setAnuarWorldEntered, setAnuarBombsLeft, setMessage, navigate, setAnuarGateOpen
  } = useGameModel();
  return (<main className="anuar-choice-page">
        <section className="cave-choice anuar-choice" aria-label="Секретный мир Ануара">
          <p className="intro-kicker">Код Anuar</p>
          <h1>Секретный город бомб</h1>
          <p>
            На экране появилась надпись: войти или выйти. За входом ждут
            {formatPower(anuarBombEnemiesTotal)} бомба-монстров.
          </p>
          <p>
            После зачистки выйдет Ануар с табличкой, и начнется финальный бой
            за бомбическую концовку.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setAnuarWorldEntered(true);
              setAnuarBombsLeft(anuarBombEnemiesTotal);
              setMessage(`Ты вошел в город бомб. Внутри ${formatPower(anuarBombEnemiesTotal)} бомба-монстров.`);
              navigate('/game');
            }} type="button">
              Войти
            </button>
            <button className="secondary" onClick={() => {
              setAnuarGateOpen(false);
              setMessage('Ты вышел из секретного города бомб.');
              navigate('/game');
            }} type="button">
              Выйти
            </button>
          </div>
        </section>
      </main>);
}
