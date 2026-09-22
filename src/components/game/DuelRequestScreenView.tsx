import { useGameModel } from '../../game/GameContext';

import { formatPower,getWeaponDisplayName } from '../../game/data/rarityDamage';



export function DuelRequestScreenView() {
  const {
    incomingDuelRequest, incomingRequestPlayer, acceptIncomingDuelRequest, rejectIncomingDuelRequest
  } = useGameModel();
  if (!incomingDuelRequest || !incomingRequestPlayer) return null;
  return (<div className="duel-request-screen" role="dialog" aria-modal="true" aria-live="polite" aria-label="Входящий вызов">
          <div className={`duel-request-box ${incomingDuelRequest.kind === 'trade' ? 'trade-request-box' : ''}`}>
            <p className="eyebrow">{incomingDuelRequest.kind === 'trade' ? 'Входящий обмен' : 'Входящая дуэль'}</p>
            <h2>{incomingDuelRequest.kind === 'trade' ? 'Трейд кинул' : 'Игрок хочет драться'}</h2>
            <strong className="trade-request-nick">{incomingRequestPlayer.name}</strong>
            <p>{incomingDuelRequest.kind === 'trade' ? 'Принять трейд или нет?' : 'Принять бой на арене или отказаться?'}</p>
            {incomingDuelRequest.kind === 'trade' && (
              <div className="trade-request-abilities" aria-label="Способности игрока">
                <div>
                  <span>Сила</span>
                  <b>{formatPower(incomingRequestPlayer.power)}</b>
                </div>
                <div>
                  <span>Титул</span>
                  <b>{incomingRequestPlayer.title}</b>
                </div>
                <div>
                  <span>Меч</span>
                  <b>{getWeaponDisplayName(incomingRequestPlayer.weapon)} +{formatPower(incomingRequestPlayer.weapon.damage)}</b>
                </div>
                <div>
                  <span>Броня</span>
                  <b>{incomingRequestPlayer.armor.name} +{formatPower(incomingRequestPlayer.armor.defense)}</b>
                </div>
              </div>
            )}
            <div className="duel-actions">
              <button onClick={acceptIncomingDuelRequest} type="button">
                Принять
              </button>
              <button className="secondary" onClick={rejectIncomingDuelRequest} type="button">Нет</button>
            </div>
          </div>
        </div>);
}
