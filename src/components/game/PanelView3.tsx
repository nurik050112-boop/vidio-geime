import { useGameModel } from '../../game/GameContext';
import { bbiMonsterHp,bbiMonsterTotal,dungeonEnemiesTotal,nuraliMonsterHp,nuraliMonsterTotal } from '../../game/data/adminBoss';
import { formatPower } from '../../game/data/rarityDamage';
import { BattlePanelView } from './BattlePanelView';
import { ShopView } from './ShopView';



export function PanelView3() {
  const {
    currentMonsters, isFinalSpiritBoss, isBbiBoss, isFinalSpiritWorld, isBbiWorld,
    currentDragonHp, currentMonsterTotal, enemy, strike, heroHp,
    isNuraliWorld, dungeon, exitDungeon, enterDungeon, declineDungeon,
    goblinKingReady, goblinKingFightStarted, setEnemyHp, setMessage, navigate,
    setGoblinKingReady
  } = useGameModel();
  return (<>
            <BattlePanelView />

            <div className="actions">
              <button onClick={strike} disabled={heroHp === 0 || currentMonsters > 0}>{isFinalSpiritBoss ? 'Бить души' : 'Бить дракона'}</button>
            </div>

            <div className="monster-panel">
              <div>
                <p className="label">{isFinalSpiritWorld ? 'Монстры подземного мира' : 'Монстры города'}</p>
                <strong>{enemy.city}: разные монстры {formatPower(currentMonsters)} / {formatPower(currentMonsterTotal)}</strong>
                <p>{currentMonsters === 0 ? `Все монстры побеждены. Теперь бей ${isFinalSpiritBoss ? 'души' : isBbiBoss ? 'босса' : 'дракона'}.` : `Победи ${formatPower(currentMonsterTotal)} монстров, чтобы появился ${isFinalSpiritWorld ? 'рой душ' : isBbiWorld ? 'Управляющий' : 'дракон'}.`}</p>
                <p>{isNuraliWorld ? `Монстр Нурали: ${formatPower(nuraliMonsterHp)} HP. Всего монстров: ${formatPower(nuraliMonsterTotal)}.` : isBbiWorld ? `BBI монстр: ${formatPower(bbiMonsterHp)} HP. Всего монстров: ${formatPower(bbiMonsterTotal)}.` : 'Первый город: 100 HP и 10 урона. Каждый следующий город сильнее в 100 раз.'}</p>
              </div>
            </div>

            {dungeon && !dungeon.declined && (
              <div className={`dungeon ${dungeon.cleared ? 'cleared' : ''}`}>
                <div>
                  <p className="label">Пещера 7-го дракона</p>
                  <strong>{dungeon.city}</strong>
                  <p>Врагов внутри: {formatPower(dungeon.enemiesLeft)} / {formatPower(dungeonEnemiesTotal)}</p>
                  <p>Шансы на предметы улучшены в 10 раз. Обычное 10%, необычное 10%, эпик 30%, легендарка 5%, секретное 0.1%.</p>
                </div>
                {dungeon.entered || dungeon.cleared ? (
                  <button onClick={exitDungeon} disabled={dungeon.cleared || heroHp === 0}>
                    {dungeon.cleared ? 'Очищено' : 'Выйти'}
                  </button>
                ) : (
                  <div className="ending-actions">
                    <button onClick={enterDungeon} disabled={heroHp === 0}>Войти</button>
                    <button className="secondary" onClick={declineDungeon}>Не входить</button>
                  </div>
                )}
              </div>
            )}

            {goblinKingReady && !goblinKingFightStarted && (
              <div className="dungeon">
                <div>
                  <p className="label">Король гоблинов</p>
                  <strong>После 1000 врагов открылся трон гоблинов</strong>
                  <p>Выбор: сражаться с ним или не сражаться. Победа откроет секретную концовку про бедных гоблинов.</p>
                </div>
                <div className="ending-actions">
                  <button onClick={() => {
                    setEnemyHp(currentDragonHp);
                    setMessage(`Король гоблинов вышел из глубокой пещеры. У него ${formatPower(currentDragonHp)} HP.`);
                    navigate('/game');
                  }}>
                    Сражаться
                  </button>
                  <button className="secondary" onClick={() => {
                    setGoblinKingReady(false);
                    setMessage('Герой не стал сражаться с королем гоблинов. Тайна пещеры осталась жить под землей.');
                  }}>
                    Не сражаться
                  </button>
                </div>
              </div>
            )}

            <ShopView />
          </>);
}
