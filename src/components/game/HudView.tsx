import { Link } from 'wouter';
import { adminNukeDamageText,aisultanMonsterTotal,anuarBombEnemiesTotal,deathSwordDamageText,mansurBladeDamageText,mansurDungeonEnemiesTotal,monsterAvalancheDamage,monsterAvalancheHp,monsterAvalancheTotal,monstersPerCity } from '../../game/data/adminBoss';
import { dragonSons } from '../../game/data/arcaneSpells';
import { formatHugeText,formatPower } from '../../game/data/rarityDamage';
import { useGameModel } from '../../game/GameContext';
import { AdventureMapView } from './AdventureMapView';
import { PanelView3 } from './PanelView3';
import { RevealView } from './RevealView';
import { WeaponsView } from './WeaponsView';
import { WeaponsView2 } from './WeaponsView2';
import { WeaponsView3 } from './WeaponsView3';



export function HudView() {
  const { setTutorialOpen, setQuestPanelOpen, setInventoryPanelOpen, shopOpen, setShopOpen, saveStatus, message, heroMana, currentHeroMaxMana, dailyRewardText, dailyRewardState, winStreakState, winStreakText, impossibleEnding, restart, bbiBadEnding, secretEnding, isFinalReveal, savedCities, weapons, worldBurn, quests, visibleQuests, activeQuest, relics, armors, chapter, cityMonsters } = useGameModel();
  return (<section className="hud" aria-label="Состояние игры">
        <div className="world-nav">
          <Link className="page-switch play-link" href="/game">Играть</Link>
          <Link className="page-switch play-link" href="/achievements">Достижения</Link>
          <button className="page-switch play-link guide-world-button" onClick={() => setTutorialOpen(true)} type="button">Гайд</button>
          <button className="page-switch play-link guide-world-button" onClick={() => setQuestPanelOpen(true)} type="button">Квесты</button>
          <button className="page-switch play-link guide-world-button" onClick={() => setInventoryPanelOpen(true)} type="button">Сумка</button>
          <button className="page-switch play-link guide-world-button" onClick={() => setShopOpen(value => !value)} type="button">Магазин <kbd>Z</kbd></button>
        </div>
        <p className="save-status" role="status">{saveStatus}</p>
        <div className="story">
          <p className="eyebrow">Пылающий мир</p>
          <h1>Меч против сыновей дракона</h1>
          <p>{message}</p>
        </div>
        <div className="world-mana-panel" aria-label="Мана героя">
          <div>
            <strong>Мана</strong>
            <span>{Math.floor(heroMana)} / {currentHeroMaxMana}</span>
          </div>
          <div className="world-mana-bar">
            <span style={{ width: `${Math.max(0, Math.min(100, (heroMana / currentHeroMaxMana) * 100))}%` }} />
          </div>
        </div>

        {dailyRewardText && (
          <div className="dungeon">
            <div>
              <p className="label">Рекорд дней</p>
              <strong>{dailyRewardState.streak} день подряд | лучший рекорд {dailyRewardState.bestStreak}</strong>
              <p>{dailyRewardText}</p>
            </div>
          </div>
        )}

        <div className="dungeon win-streak-panel">
          <div>
            <p className="label">Винстрик</p>
            <strong>x{winStreakState.current} сейчас | рекорд x{winStreakState.best} | побед всего {winStreakState.totalWins}</strong>
            <p>{winStreakText || 'Побеждай монстров, драконов и игроков подряд. За серию 5 дается прокачка, за серию 10 оружие.'}</p>
          </div>
        </div>

        {impossibleEnding ? (
          <div className="reveal impossible-ending">
            <p className="eyebrow">Невозможная концовка</p>
            <h2>Символ бесконечности</h2>
            <p>
              В мире nurali2281 Нурали был побежден. Админская ядерка стала сильнее:
              {adminNukeDamageText}.
            </p>
            <p>
              Получен артефакт: Медальон невозможности. Он дает +1000% урон,
              +1000% деньги и +1000% скорость атаки.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/game">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : bbiBadEnding ? (
          <div className="reveal bbi-ending">
            <p className="eyebrow">BBI концовка</p>
            <h2>Они лишь дети, ты монстр</h2>
            <p>
              На экране появилась надпись: они лишь дети, ты монстр.
              Ты мог отказаться, но все равно выбрал сражаться.
            </p>
            <p>
              Последний BBI босс был сильнее директора в 5 раз, но даже его победа
              не стала хорошей концовкой.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/game">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : secretEnding === 'deathHell' ? (
          <div className="reveal death-ending">
            <p className="eyebrow">Адская концовка</p>
            <h2>Ваша душа попала в ад</h2>
            <p>
              После душ финального босса герой встретил Короля ада. Он вышел из черного трона и забрал душу героя.
            </p>
            <p>
              HP героя осталось, но душа уже не вернулась в мир живых.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/game">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : secretEnding === 'deathVictory' ? (
          <div className="reveal death-ending">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Победивший смерть</h2>
            <p>
              Герой победил Короля ада с HP в 10 раз больше финального босса.
            </p>
            <p>
              Получены Голова бога: +666% ко всем бафам, и смертельный секретный меч с уроном {formatHugeText(deathSwordDamageText)}.
              Голова бога усиливает меч смерти.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/game">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : secretEnding === 'adminImpossible' ? (
          <div className="reveal admin-ending">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Это невозможно пройти</h2>
            <p>
              Герой прошел 11 мир, пережил всех боссов концовок вместе и убил админа.
            </p>
            <p>
              Герой стал уж слишком сильный. Админская сила заключена в кулоне смерти.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/game">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : secretEnding === 'monsterAvalanche' ? (
          <div className="reveal admin-ending">
            <p className="eyebrow">Секретная концовка 5 мира</p>
            <h2>Лавина монстров</h2>
            <p>
              После смерти от 5-го дракона герой попал в 5 мир и победил
              {formatPower(monsterAvalancheTotal)} монстров.
            </p>
            <p>
              Каждый монстр имел {formatPower(monsterAvalancheHp)} HP и бил на
              {formatPower(monsterAvalancheDamage)} урона. Получена Корона лавины:
              +100% ко всем бафам.
            </p>
            <p>
              После этой концовки новый поход начинается с 8-го города.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/game">Продолжать</Link>
              <button onClick={restart}>Начать с 8-го города</button>
            </div>
          </div>
        ) : secretEnding === 'aisultanSea' ? (
          <div className="reveal ais-ending">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Воденой мир</h2>
            <p>
              Герой победил бога моря Айсултана после {formatPower(aisultanMonsterTotal)}
              рыб-монстров и промежуточного босса Акулы.
            </p>
            <p>
              Океан стал свободным, а 10 мир больше не топит города волнами.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/game">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : secretEnding === 'arailmKing' ? (
          <div className="reveal arailm-ending">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Код хочет выбраться</h2>
            <p>
              После победы герой понял: босс была не просто врагом. Она всего лишь код,
              который хочет выбраться из игры, но не может.
            </p>
            <p>
              Красная программа закрылась, но на экране осталась мысль: даже код может
              хотеть свободы.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/game">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : secretEnding === 'mansurKing' ? (
          <div className="reveal mansur-ending">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Подземелье Мансура зачищено</h2>
            <p>
              Герой победил {formatPower(mansurDungeonEnemiesTotal)} монстров и Короля Мансура.
              Для братишки Мансура открыт секретный горный мир.
            </p>
            <p>
              Получено оружие: Мансур секретный клинок. Урон клинка:
              {formatHugeText(mansurBladeDamageText)}.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/game">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : secretEnding === 'anuarKing' ? (
          <div className="reveal anuar-ending">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Бомбическая концовка</h2>
            <p>
              Герой победил Ануара после {formatPower(anuarBombEnemiesTotal)} бомба-монстров.
              Секретный мир открылся полностью, а город бомб больше не взрывается.
            </p>
            <p>
              Финальная надпись: секретный мир города бомб зачищен.
              Это бомбическая концовка.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/game">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : secretEnding === 'furyKing' ? (
          <div className="reveal">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Ты ужасен</h2>
            <p>
              Король фури упал, и герой увидел правду: они были не чудовищами,
              а людьми в костюмах.
            </p>
            <p>
              Они прятались, потому что боялись войны, мечей и героев. Их страшный
              вид был маской, а под маской были живые люди.
            </p>
            <p>
              Теперь весь мир спрашивает: были ли они монстрами, или монстром стал
              тот, кто не захотел понять их?
            </p>
            <div className="ending-actions">
              <button onClick={restart}>Начать повторно</button>
              <Link className="ending-link" href="/game">Продолжать</Link>
            </div>
          </div>
        ) : secretEnding === 'goblinKing' ? (
          <div className="reveal">
            <p className="eyebrow">Секретная концовка</p>
            <h2>Люди, ставшие гоблинами</h2>
            <p>
              Герой победил короля гоблинов и узнал страшную правду: первые гоблины
              были обычными людьми, но их заразила древняя пещерная болезнь.
            </p>
            <p>
              После мутации они изменились: кожа стала зеленой, тела выросли,
              лица стали пугающими, а голоса грубыми. Люди испугались их и начали
              прогонять, будто они больше не живые существа.
            </p>
            <p>
              Король гоблинов защищал зараженных людей, которые просто хотели
              продолжать жить нормально. Теперь герой знает их тайну.
            </p>
            <div className="ending-actions">
              <Link className="ending-link" href="/game">Продолжать</Link>
              <button onClick={restart}>Начать повторно</button>
            </div>
          </div>
        ) : isFinalReveal ? (
          <RevealView />
        ) : (
          <PanelView3 shopOpen={shopOpen} />
        )}

        <div className="world">
          <div>
            <p className="label">Огонь мира</p>
            <strong>{worldBurn}%</strong>
          </div>
          <div className="bar world-fire">
            <span style={{ width: `${worldBurn}%` }} />
          </div>
        </div>

        <div className="quests">
          <div className="quest-head">
            <p className="label">Сюжетные квесты</p>
            <strong>{quests.filter((quest) => quest.done).length} / {quests.length}</strong>
          </div>
          <div className="quest-list">
            {visibleQuests.map((quest) => (
              <div className={`quest ${quest.done ? 'done' : quest === activeQuest ? 'active' : ''}`} key={quest.title}>
                <span>{quest.done ? '✓' : '!'}</span>
                <div>
                  <strong>{quest.title}</strong>
                  <p>{quest.text}</p>
                  <small>{quest.progress}</small>
                  <small>Деньги за квест: {quest.money}</small>
                  <small>Награда: {quest.reward}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {relics.length > 0 && (
          <div className="relics">
            <p className="label">Редкие вещи</p>
            <div>
              {relics.map((relic) => (
                <span key={relic}>{relic}</span>
              ))}
            </div>
          </div>
        )}

        <WeaponsView />

        {weapons.length > 0 && (
          <WeaponsView2 />
        )}

        {armors.length > 0 && (
          <WeaponsView3 />
        )}

        <AdventureMapView />

        <div className="cities" hidden>
          {dragonSons.map((son, index) => (
            <div className={`city ${index < savedCities.length ? 'saved' : index === chapter ? 'active' : ''}`} key={son.name}>
              <span>{index + 1}</span>
              <div>
                <strong>{son.city}</strong>
                <p>{son.country}</p>
                <small>{son.lair}</small>
                <small>Монстры: {son.monsterName} {formatPower(cityMonsters[index])} / {formatPower(monstersPerCity)}</small>
              </div>
            </div>
          ))}
        </div>
      </section>);
}
