import { useGameModel } from '../../game/GameContext';

import { adminWorldMonsterHp,adminWorldMonsterTotal } from '../../game/data/adminBoss';
import { formatPower } from '../../game/data/rarityDamage';



export function AdminChoicePageView() {
  const {
    setAdminWorldEntered, setAdminWorldMonstersLeft, setMessage, navigate, setAdminWorldGateOpen
  } = useGameModel();
  return (<main className="admin-choice-page">
        <section className="cave-choice admin-choice" aria-label="11 мир админская сложность">
          <p className="intro-kicker">Код ADMIN2281</p>
          <h1>11 мир: админская сложность</h1>
          <p>
            Внутри {formatPower(adminWorldMonsterTotal)} монстров. Здоровье каждого как у невозможного босса:
            {formatPower(adminWorldMonsterHp)} HP.
          </p>
          <p>
            После смерти монстров появятся все боссы концовок вместе.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setAdminWorldEntered(true);
              setAdminWorldMonstersLeft(adminWorldMonsterTotal);
              setMessage(`Ты вошел в 11 мир. Админская сложность: ${formatPower(adminWorldMonsterTotal)} монстров по ${formatPower(adminWorldMonsterHp)} HP.`);
              navigate('/game');
            }} type="button">
              Войти
            </button>
            <button className="secondary" onClick={() => {
              setAdminWorldGateOpen(false);
              setMessage('Ты вышел из 11 мира.');
              navigate('/game');
            }} type="button">
              Выйти
            </button>
          </div>
        </section>
      </main>);
}
