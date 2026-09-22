import { useGameModel } from '../../game/GameContext';

import { Link } from 'wouter';
import { AchievementTrophy } from '../../components/AchievementTrophy';
import { achievements } from '../../game/data/getLocalDateKey';



export function AchievementsPageView() {
  const {
    submitAchievementCode, setAchievementCode, achievementCode, allAchievementsUnlocked, setCreatorCreditsOpen,
    achievementMessage, unlockedAchievements, achievementCheatActive, completeAchievement, teleportToAchievement
  } = useGameModel();
  return (<main className="achievements-page">
        <section className="achievements-screen" aria-label="Достижения">
          <div className="achievement-topbar">
            <Link className="page-switch play-link" href="/game">Играть</Link>
            <Link className="page-switch play-link" href="/world">Пылающий мир</Link>
          </div>
          <p className="intro-kicker">Достижения</p>
          <h1>Концовки и битвы боссов</h1>
          <form className="achievement-code-form" onSubmit={submitAchievementCode}>
            <input
              aria-label="Код достижений"
              onChange={(event) => setAchievementCode(event.target.value)}
              placeholder="Код"
              value={achievementCode}
            />
            <button type="submit">OK</button>
          </form>
          <button
            className="creator-button"
            disabled={!allAchievementsUnlocked}
            onClick={() => setCreatorCreditsOpen(true)}
            type="button"
          >
            Показать создателя
          </button>
          {achievementMessage && <p className="achievement-message">{achievementMessage}</p>}
          <div className="achievement-list">
            {achievements.map((achievement, index) => {
              const unlocked = unlockedAchievements.includes(achievement.id);

              return (
              <div className={unlocked ? 'achievement unlocked' : 'achievement locked'} key={achievement.id}>
                <button
                  className="achievement-main"
                  disabled={!achievementCheatActive && !unlocked}
                  onClick={() => completeAchievement(achievement.id)}
                  type="button"
                >
                  <AchievementTrophy index={index} unlocked={unlocked} />
                  <strong>{achievement.name}</strong>
                  <small>{unlocked ? 'Кубок получен' : achievementCheatActive ? 'Нажми, чтобы открыть' : 'Под замком'}</small>
                </button>
                {achievementCheatActive && (
                  <button className="teleport-button" onClick={() => teleportToAchievement(achievement.id)} type="button">
                    Телепорт
                  </button>
                )}
              </div>
              );
            })}
          </div>
        </section>
      </main>);
}
