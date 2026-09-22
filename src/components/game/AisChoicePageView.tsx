import { useGameModel } from '../../game/GameContext';

import { aisultanMonsterHp,aisultanMonsterTotal } from '../../game/data/adminBoss';
import { formatPower } from '../../game/data/rarityDamage';



export function AisChoicePageView() {
  const {
    setAisWorldEntered, setAisMonstersLeft, setMessage, navigate, setAisGateOpen
  } = useGameModel();
  return (<main className="ais-choice-page">
        <section className="cave-choice ais-choice" aria-label="10 водный мир ais228198">
          <p className="intro-kicker">Код ais228198</p>
          <h1>10 мир: водный мир</h1>
          <p>
            Открылся океанский фон. Внутри {formatPower(aisultanMonsterTotal)}
            рыб-монстров, у каждого {formatPower(aisultanMonsterHp)} HP.
          </p>
          <p>
            После смерти монстров выйдет промежуточный босс Акула с HP в 10 раз больше.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setAisWorldEntered(true);
              setAisMonstersLeft(aisultanMonsterTotal);
              setMessage(`Ты вошел в 10 водный мир. Внутри ${formatPower(aisultanMonsterTotal)} рыб-монстров по ${formatPower(aisultanMonsterHp)} HP.`);
              navigate('/game');
            }} type="button">
              Войти
            </button>
            <button className="secondary" onClick={() => {
              setAisGateOpen(false);
              setMessage('Ты вышел из 10 водного мира.');
              navigate('/game');
            }} type="button">
              Выйти
            </button>
          </div>
        </section>
      </main>);
}
