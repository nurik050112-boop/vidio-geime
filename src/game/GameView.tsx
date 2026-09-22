import { AchievementsPageView } from '../components/game/AchievementsPageView';
import { AdminChoicePageView } from '../components/game/AdminChoicePageView';
import { AdminChoicePageView2 } from '../components/game/AdminChoicePageView2';
import { AisChoicePageView } from '../components/game/AisChoicePageView';
import { AisChoicePageView2 } from '../components/game/AisChoicePageView2';
import { AnuarChoicePageView } from '../components/game/AnuarChoicePageView';
import { ArailmChoicePageView } from '../components/game/ArailmChoicePageView';
import { ArailmChoicePageView2 } from '../components/game/ArailmChoicePageView2';
import { BbiChoicePageView } from '../components/game/BbiChoicePageView';
import { BbiChoicePageView2 } from '../components/game/BbiChoicePageView2';
import { CreatorCreditsPageView } from '../components/game/CreatorCreditsPageView';
import { FuryChoicePageView } from '../components/game/FuryChoicePageView';
import { FuryChoicePageView2 } from '../components/game/FuryChoicePageView2';
import { GameView as PlayWorldView } from '../components/game/GameView';
import { MansurChoicePageView } from '../components/game/MansurChoicePageView';
import { NuraliChoicePageView } from '../components/game/NuraliChoicePageView';
import { NuraliChoicePageView2 } from '../components/game/NuraliChoicePageView2';
import { dungeonEnemiesTotal } from './data/adminBoss';
import { formatPower } from './data/rarityDamage';
import { useGameModel } from './GameContext';

export function GameView() {
  const {
    saveReady, creatorCreditsOpen, isAchievementsPage, introSkipped, setIntroSkipped,
    dungeon, enterDungeon, heroHp, declineDungeon, bbiGateOpen,
    bbiWorldEntered, bbiBossStage, bbiFinalChoiceOpen, bbiCityReward, nuraliGateOpen,
    nuraliWorldEntered, nuraliChoiceOpen, nuraliBossFightStarted, aisGateOpen, aisWorldEntered,
    aisSharkFightStarted, aisFinalChoiceOpen, aisGodFightStarted, adminWorldGateOpen, adminWorldEntered,
    adminWorldBossesStarted, adminFinalChoiceOpen, adminBossFightStarted, furyGateOpen, furyDungeonEntered,
    furyChoiceOpen, furyKingFightStarted, anuarGateOpen, anuarWorldEntered, anuarKingFightStarted,
    mansurGateOpen, mansurDungeonEntered, mansurKingFightStarted, arailmGateOpen, arailmWorldEntered,
    arailmChoiceOpen, arailmKingFightStarted
  } = useGameModel();
if (!saveReady) return <main className="route-loading" role="status">Загружаем сохранение…</main>;
if (creatorCreditsOpen) {
    return (
      <CreatorCreditsPageView />
    );
  }
if (isAchievementsPage) {
    return (
      <AchievementsPageView />
    );
  }
if (!introSkipped) {
    return (
      <main className="intro-page">
        <section className="intro-story" aria-label="История игры">
          <p className="intro-kicker">История мира</p>
          <h1>Драконы стали злыми</h1>
          <p>
            Когда-то драконы жили далеко от людей. Но однажды они разозлились,
            поднялись из своих логовищ и начали уничтожать 10 городов.
          </p>
          <p>
            Они сжигали дома, ломали башни и нападали на людей. Чтобы остановить
            беду, жители отправили героя с мечом в самый опасный путь.
          </p>
          <p>
            Теперь герой должен очистить города от монстров, победить сыновей
            дракона и узнать, почему началась эта война.
          </p>
          <button onClick={() => {
            window.speechSynthesis?.cancel();
            setIntroSkipped(true);
          }} type="button">
            Пропустить
          </button>
        </section>
      </main>
    );
  }
if (dungeon && !dungeon.entered && !dungeon.cleared && !dungeon.declined) {
    return (
      <main className="cave-choice-page">
        <section className="cave-choice" aria-label="Вход в подземелье">
          <p className="intro-kicker">Тайная пещера</p>
          <h1>Подземелье 7-го дракона</h1>
          <p>
            После победы над 7-м драконом земля раскрылась. В глубине темной
            пещеры ждут {formatPower(dungeonEnemiesTotal)} монстров.
          </p>
          <p>
            Здесь предметы выпадают намного лучше: шансы на оружие и броню
            улучшены в 10 раз.
          </p>
          <div className="cave-actions">
            <button onClick={enterDungeon} disabled={heroHp === 0} type="button">Войти</button>
            <button className="secondary" onClick={declineDungeon} type="button">Выйти из подземелья</button>
          </div>
        </section>
      </main>
    );
  }
if (bbiGateOpen && !bbiWorldEntered && !bbiBossStage && !bbiFinalChoiceOpen && !bbiCityReward) {
    return (
      <BbiChoicePageView />
    );
  }
if (nuraliGateOpen && !nuraliWorldEntered && !nuraliChoiceOpen && !nuraliBossFightStarted) {
    return (
      <NuraliChoicePageView />
    );
  }
if (nuraliChoiceOpen) {
    return (
      <NuraliChoicePageView2 />
    );
  }
if (aisGateOpen && !aisWorldEntered && !aisSharkFightStarted && !aisFinalChoiceOpen && !aisGodFightStarted) {
    return (
      <AisChoicePageView />
    );
  }
if (aisFinalChoiceOpen) {
    return (
      <AisChoicePageView2 />
    );
  }
if (adminWorldGateOpen && !adminWorldEntered && !adminWorldBossesStarted && !adminFinalChoiceOpen && !adminBossFightStarted) {
    return (
      <AdminChoicePageView />
    );
  }
if (adminFinalChoiceOpen) {
    return (
      <AdminChoicePageView2 />
    );
  }
if (bbiFinalChoiceOpen) {
    return (
      <BbiChoicePageView2 />
    );
  }
if (furyGateOpen && !furyDungeonEntered && !furyChoiceOpen && !furyKingFightStarted) {
    return (
      <FuryChoicePageView />
    );
  }
if (anuarGateOpen && !anuarWorldEntered && !anuarKingFightStarted) {
    return (
      <AnuarChoicePageView />
    );
  }
if (mansurGateOpen && !mansurDungeonEntered && !mansurKingFightStarted) {
    return (
      <MansurChoicePageView />
    );
  }
if (arailmGateOpen && !arailmWorldEntered && !arailmChoiceOpen && !arailmKingFightStarted) {
    return (
      <ArailmChoicePageView />
    );
  }
if (arailmChoiceOpen) {
    return (
      <ArailmChoicePageView2 />
    );
  }
if (furyChoiceOpen) {
    return (
      <FuryChoicePageView2 />
    );
  }
return (
    <PlayWorldView />
  );
}
