import { useGameModel } from '../../game/GameContext';

import { Link } from 'wouter';
import { dragonSons } from '../../game/data/arcaneSpells';
import { formatPower } from '../../game/data/rarityDamage';



export function RevealView() {
  const {
    isEndingChoice, endingChoice, setEndingChoice, setEnemyHp, kingDragonHp,
    setHeroHp, currentHeroMaxHp, setMessage, navigate, unlockAchievement,
    savedCities, defeatedMonsters, infiniteGold, gold, weapons,
    restart
  } = useGameModel();
  return (<div className="reveal">
            <p className="eyebrow">Концовка</p>
            <h2>{isEndingChoice ? 'Последний выбор' : endingChoice === 'spare' ? 'Мир после огня' : 'Пустое небо'}</h2>
            <p>
              Великий дракон был не просто злым боссом. Люди много лет убивали, унижали и гнобили драконов:
              забирали их земли, ломали гнезда и охотились даже на маленьких драконят.
            </p>
            <p>
              Король драконов хотел спасти своих детей. Он сам захватил 10 городов и в каждом городе
              поставил одного сына управлять, чтобы никто больше не тревожил его семью.
            </p>
            <p>
              После победы герой понял правду: король драконов начал войну не ради золота и власти,
              а из страха за детей. Теперь надо не добивать последних драконов, а остановить войну,
              чтобы люди и драконы больше не мучили друг друга.
            </p>
            {isEndingChoice ? (
              <div className="ending-choice">
                <strong>Перед героем стоит семья драконов.</strong>
                <p>Сыновья больше не атакуют. Они ждут: герой сразится с ними до конца или оставит их жить?</p>
                <div className="ending-actions">
                  <button onClick={() => {
                    setEndingChoice('family');
                    setEnemyHp(kingDragonHp * 100);
                    setHeroHp(currentHeroMaxHp);
                    setMessage(`Герой вызвал семью короля драконов на бой. Они в 100 раз сильнее короля: ${formatPower(kingDragonHp * 100)} HP.`);
                    navigate('/game');
                  }}>
                    Сразиться с семьей
                  </button>
                  <button className="secondary" onClick={() => {
                    setEndingChoice('spare');
                    unlockAchievement('dragonPeace');
                    setMessage('Герой оставил семью драконов. Начался мир между людьми и драконами.');
                  }}>
                    Оставить семью
                  </button>
                </div>
              </div>
            ) : (
            <>
            <div className="ending-stats">
              <strong>Города спасены: {savedCities.length} / {dragonSons.length}</strong>
              <strong>Монстров побеждено: {formatPower(defeatedMonsters)}</strong>
              <strong>Золото героя: {infiniteGold ? '∞' : formatPower(gold)}</strong>
              <strong>Оружия найдено: {weapons.length}</strong>
            </div>
            <div className="ending-choice">
              <strong>{endingChoice === 'spare' ? 'Герой не убил последних драконов.' : 'Герой сразился с семьей драконов.'}</strong>
              <p>
                {endingChoice === 'spare'
                  ? 'Он открыл школы мира в очищенных городах. Люди вернули драконам горы, пещеры и небо, а драконы помогли потушить последний огонь.'
                  : 'Это была плохая концовка. Война истребила почти всех драконов, а люди не стали добрее: они дальше гнобили, унижали и убивали тех драконов, кто еще прятался в горах и пещерах.'}
              </p>
            </div>
            <div className="ending-actions">
              <button onClick={restart}>Начать заново</button>
              <Link className="ending-link" href="/game">Вернуться в битву</Link>
            </div>
            </>
            )}
          </div>);
}
