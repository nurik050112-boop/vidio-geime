import { useGameModel } from '../../game/GameContext';

import { adminFinalBossHp } from '../../game/data/adminBoss';



export function AdminChoicePageView2() {
  const {
    setAdminFinalChoiceOpen, setAdminBossFightStarted, setEnemyHp, setMessage, navigate,
    setAdminWorldGateOpen
  } = useGameModel();
  return (<main className="admin-choice-page final">
        <section className="cave-choice admin-choice" aria-label="Финальный выбор админа">
          <p className="intro-kicker">Этап 2 побежден</p>
          <h1>Ты готов сразиться с админом?</h1>
          <p>
            У админа HP в 10 раз больше, чем у второго этапа.
          </p>
          <p>
            После победы откроется концовка: это невозможно пройти.
          </p>
          <div className="cave-actions">
            <button onClick={() => {
              setAdminFinalChoiceOpen(false);
              setAdminBossFightStarted(true);
              setEnemyHp(adminFinalBossHp);
              setMessage('Админ вышел на бой. У него HP больше второго этапа в 10 раз.');
              navigate('/game');
            }} type="button">
              Готов
            </button>
            <button className="secondary" onClick={() => {
              setAdminFinalChoiceOpen(false);
              setAdminWorldGateOpen(false);
              setMessage('Ты не готов сразиться с админом. 11 мир закрылся.');
              navigate('/game');
            }} type="button">
              Не готов
            </button>
          </div>
        </section>
      </main>);
}
