import { useGameModel } from '../../game/GameContext';
import { ArcaneSpellPanelView } from './ArcaneSpellPanelView';
import { ClickDuelView } from './ClickDuelView';
import { PanelView } from './PanelView';

export function SkyView() {
  const {
    battleScene, attackFromStageClick, startCameraDrag, moveCameraDrag,
    stopCameraDrag, hasArcaneWeapon, isClickDuelActive, tutorialOpen,
    startJoystick, moveJoystick, stopJoystick, resetJoystick, joystickThumb,
  } = useGameModel();

  return (
    <div className={`sky battle-2d ${battleScene}`}
      onClick={attackFromStageClick}
      onPointerDown={startCameraDrag}
      onPointerMove={moveCameraDrag}
      onPointerUp={stopCameraDrag}
      onPointerCancel={stopCameraDrag}
      role="region" aria-label="3D-сцена: проведи для поворота камеры">
      {isClickDuelActive && <ClickDuelView />}
      {!tutorialOpen && (
        <div className="mobile-joystick"
          onClick={event => event.stopPropagation()}
          onPointerDown={startJoystick}
          onPointerMove={moveJoystick}
          onPointerUp={stopJoystick}
          onPointerCancel={stopJoystick}
          onLostPointerCapture={resetJoystick}
          role="application" aria-label="Джойстик движения">
          <span style={{ transform: `translate(${joystickThumb.x}px, ${joystickThumb.y}px)` }} />
        </div>
      )}
      {hasArcaneWeapon && <ArcaneSpellPanelView />}
      <PanelView />
    </div>
  );
}