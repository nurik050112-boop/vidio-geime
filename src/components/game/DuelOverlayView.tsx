import { useGameModel } from '../../game/GameContext';
import { DuelCardView } from './DuelCardView';



export function DuelOverlayView() {
  const {
    duelStatus
  } = useGameModel();
  return (<div className={`duel-overlay ${duelStatus}`} role="dialog" aria-modal="true" aria-label="Дуэль">
          <DuelCardView />
        </div>);
}
