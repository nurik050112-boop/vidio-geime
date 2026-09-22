import { useGameModel } from '../../game/GameContext';

import { formatPower } from '../../game/data/rarityDamage';



export function OnlinePlayersView() {
  const {
    closeDuelList, scheduleOnlineListReturn, onlinePlayerListRef, onlinePlayers, duelOpponent,
    selectDuelPlayer
  } = useGameModel();
  return (<div className="online-players">
              <div className="online-players-head">
                <strong>Люди в сети</strong>
                <button className="secondary" onClick={closeDuelList} type="button">Выйти из списка и играть</button>
              </div>
              <div
                className="online-player-list"
                onScroll={scheduleOnlineListReturn}
                ref={onlinePlayerListRef}
              >
                {onlinePlayers.length === 0 ? (
                  <p className="online-empty">Список пуст. Реальных игроков онлайн нет.</p>
                ) : onlinePlayers.map((player) => (
                  <button
                    className={duelOpponent?.id === player.id ? 'selected' : ''}
                    key={player.id}
                    onClick={() => selectDuelPlayer(player)}
                    type="button"
                  >
                    <span>{player.name}</span>
                    <small>ID {player.id} | сила {formatPower(player.power)}</small>
                  </button>
                ))}
              </div>
            </div>);
}
