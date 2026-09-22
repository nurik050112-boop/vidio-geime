import { useGameModel } from '../../game/GameContext';

import { furyDungeonEnemiesTotal } from '../../game/data/adminBoss';
import { formatPower } from '../../game/data/rarityDamage';



export function FuryChoicePageView() {
  const {
    setFuryDungeonEntered, setFuryMonstersLeft, setMessage, navigate, setFuryGateOpen
  } = useGameModel();
  return (<main className="fury-choice-page">
        <section className="cave-choice fury-choice" aria-label="Секретный фури-мир">
          <p className="intro-kicker">Код wwfuri</p>
          <h1>Секретный фури-мир</h1>
          <p>
            Код открыл скрытый вход. За ним ждут {formatPower(furyDungeonEnemiesTotal)}
            фури-монстров и секретное оружие.
          </p>
          <p>
            Если войдёшь, назад будет трудно вернуться: после победы появится выбор
            любить или убить короля фури.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setFuryDungeonEntered(true);
              setFuryMonstersLeft(furyDungeonEnemiesTotal);
              setMessage(`Ты вошел в фури-мир. Внутри ${formatPower(furyDungeonEnemiesTotal)} монстров.`);
              navigate('/game');
            }} type="button">
              Войти
            </button>
            <button className="secondary" onClick={() => {
              setFuryGateOpen(false);
              setMessage('Ты вышел из секретного фури-мира.');
              navigate('/game');
            }} type="button">
              Выйти
            </button>
          </div>
        </section>
      </main>);
}
