import { Link } from 'wouter';
import { GameControls } from '../../components/GameControls';
import { useGameModel } from '../../game/GameContext';
import { SkyView } from './SkyView';



export function StageView() {
  const {
    gameActive, heroHp, attackFromStageClick, setManualPause, verticalVelocity,
    playHeroAnimation, setTutorialOpen
  } = useGameModel();
  return (<section className="stage" aria-label="Поле битвы">
        <GameControls disabled={!gameActive || heroHp <= 0} onAttack={attackFromStageClick}
          onPause={() => setManualPause(true)} onJump={() => {
            if (verticalVelocity.current === 0) { verticalVelocity.current = 24; playHeroAnimation('step', 360); }
          }} />
        <Link className="page-switch world-link" href="/world">Пылающий мир</Link>
        <Link className="page-switch achievements-link" href="/achievements">Достижения</Link>
        <button className="guide-button" onClick={() => setTutorialOpen(true)} type="button">Гайд</button>
        <SkyView />
      </section>);
}
