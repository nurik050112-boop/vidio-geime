import { useGameModel } from '../../game/GameContext';

import { bbiManagerHp,bbiMonsterHp,bbiMonsterTotal } from '../../game/data/adminBoss';
import { formatPower } from '../../game/data/rarityDamage';



export function BbiChoicePageView() {
  const {
    setBbiWorldEntered, setBbiMonstersLeft, setMessage, navigate, setBbiGateOpen
  } = useGameModel();
  return (<main className="bbi-choice-page">
        <section className="cave-choice bbi-choice" aria-label="BBI новый мир">
          <p className="intro-kicker">Код BBI</p>
          <h1>Новый мир</h1>
          <p>
            На фоне открылась большая игровая комната. На экране выбор: войти или не входить.
            Внутри ждут {formatPower(bbiMonsterTotal)} монстров, и у каждого {formatPower(bbiMonsterHp)} HP.
          </p>
          <p>
            После победы над монстрами появится Управляющий с {formatPower(bbiManagerHp)} HP,
            потом Директор с HP в 3 раза больше.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setBbiWorldEntered(true);
              setBbiMonstersLeft(bbiMonsterTotal);
              setMessage(`Ты вошел в BBI новый мир. Внутри ${formatPower(bbiMonsterTotal)} монстров по ${formatPower(bbiMonsterHp)} HP.`);
              navigate('/game');
            }} type="button">
              Войти
            </button>
            <button className="secondary" onClick={() => {
              setBbiGateOpen(false);
              setMessage('Ты не вошел в BBI новый мир.');
              navigate('/game');
            }} type="button">
              Не входить
            </button>
          </div>
        </section>
      </main>);
}
