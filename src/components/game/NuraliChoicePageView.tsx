import { useGameModel } from '../../game/GameContext';

import { nuraliMonsterHp,nuraliMonsterTotal } from '../../game/data/adminBoss';
import { formatPower } from '../../game/data/rarityDamage';



export function NuraliChoicePageView() {
  const {
    setNuraliWorldEntered, setNuraliMonstersLeft, setMessage, navigate, setNuraliGateOpen
  } = useGameModel();
  return (<main className="nurali-choice-page">
        <section className="cave-choice nurali-choice" aria-label="Новый мир Нурали">
          <p className="intro-kicker">Код nurali2281</p>
          <h1>Новый мир Нурали</h1>
          <p>
            На фоне появился дом с красной крышей и зеленым двором.
            Внутри ждут {formatPower(nuraliMonsterTotal)} монстров.
          </p>
          <p>
            У каждого монстра {formatPower(nuraliMonsterHp)} HP. После победы над всеми
            появится надпись: драться с Нурали или нет.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setNuraliWorldEntered(true);
              setNuraliMonstersLeft(nuraliMonsterTotal);
              setMessage(`Ты вошел в мир Нурали. Внутри ${formatPower(nuraliMonsterTotal)} монстров по ${formatPower(nuraliMonsterHp)} HP.`);
              navigate('/game');
            }} type="button">
              Войти
            </button>
            <button className="secondary" onClick={() => {
              setNuraliGateOpen(false);
              setMessage('Ты вышел из мира Нурали.');
              navigate('/game');
            }} type="button">
              Выйти
            </button>
          </div>
        </section>
      </main>);
}
