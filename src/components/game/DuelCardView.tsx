import { useGameModel } from '../../game/GameContext';
import { toDuelPlayer } from '../../game/data/getLocalDateKey';
import { formatPower,getWeaponDisplayName } from '../../game/data/rarityDamage';
import { DuelTradeView } from './DuelTradeView';
import { OnlinePlayersView } from './OnlinePlayersView';
import { PanelView2 } from './PanelView2';



export function DuelCardView() {
  const {
    duelStatus, playerName, setDuelStatus, duelOpponent, playerId,
    acceptDuel, declineDuel, openDuelTrade, duelWins, startDuelSearch,
    duelTradeOpen, selectDuelPlayer, leaderboardPlayers, duelChatMessages, sendDuelChat,
    setDuelChatText, duelChatText
  } = useGameModel();
  return (<div className="duel-card">
            <p className="eyebrow">Дуэль онлайн</p>
            {duelStatus === 'searching' ? (
              <>
                <h2><span className="admin-nick">{playerName}</span> ищет игроков в сети...</h2>
                <div className="duel-scanner"><span /></div>
                <button className="secondary" onClick={() => setDuelStatus('idle')} type="button">Отмена</button>
              </>
            ) : duelStatus === 'challenge' && duelOpponent ? (
              <>
                <h2>{duelOpponent.name} кинул вызов</h2>
                <p><span className="admin-nick">{playerName}</span> ID {playerId} против {duelOpponent.name} ID {duelOpponent.id}. {duelOpponent.title}. Сила: {formatPower(duelOpponent.power)}.</p>
                <div className="duel-loot">
                  <span>Оружие: {getWeaponDisplayName(duelOpponent.weapon)} +{formatPower(duelOpponent.weapon.damage)}</span>
                  <span>Броня: {duelOpponent.armor.name} +{formatPower(duelOpponent.armor.defense)}</span>
                </div>
                <strong>Драться?</strong>
                <div className="duel-actions">
                  <button onClick={acceptDuel} type="button">Драться</button>
                  <button className="secondary" onClick={declineDuel} type="button">Нет</button>
                  <button className="secondary" onClick={openDuelTrade} type="button">Обмен</button>
                </div>
              </>
            ) : duelStatus === 'fighting' && duelOpponent ? (
              <PanelView2 />
            ) : (
              <>
                <h2>Победа в дуэли</h2>
                <p><span className="admin-nick">{playerName}</span>, счет побед: {duelWins}. Можно искать следующего игрока.</p>
                <div className="duel-actions">
                  <button onClick={startDuelSearch} type="button">Еще дуэль</button>
                  <button className="secondary" onClick={() => setDuelStatus('idle')} type="button">Закрыть</button>
                </div>
              </>
            )}
            {duelTradeOpen && duelOpponent && (
              <DuelTradeView />
            )}
            <OnlinePlayersView />
            <div className="online-players leaderboard">
              <div className="online-players-head">
                <strong>Лидерборд силы</strong>
                <span>{leaderboardPlayers.length} игроков</span>
              </div>
              <div className="online-player-list leaderboard-list">
                {leaderboardPlayers.length === 0 ? (
                  <p className="online-empty">Лидерборд пуст. Первый игрок появится после захода в игру.</p>
                ) : leaderboardPlayers.map((player, index) => (
                  <button
                    className={player.id === playerId ? 'selected' : ''}
                    key={player.id}
                    onClick={() => {
                      if (player.id === playerId) return;
                      selectDuelPlayer(toDuelPlayer(player));
                    }}
                    type="button"
                  >
                    <span>#{index + 1} {player.name}</span>
                    <small>ID {player.id} | сила {formatPower(player.power)} | заходил {new Date(player.updatedAt).toLocaleDateString()}</small>
                  </button>
                ))}
              </div>
            </div>
            {duelOpponent && (
              <div className="duel-chat">
                <strong>Магический чат с {duelOpponent.name} ID {duelOpponent.id}</strong>
                <div className="duel-chat-log">
                  {duelChatMessages.length === 0 ? (
                    <span>Напиши сообщение игроку.</span>
                  ) : duelChatMessages.map((chatMessage) => (
                    <p key={chatMessage.id}>
                      <b>{chatMessage.from}:</b> {chatMessage.text}
                    </p>
                  ))}
                </div>
                <form className="duel-chat-form" onSubmit={sendDuelChat}>
                  <input
                    aria-label="Сообщение в дуэльный чат"
                    onChange={(event) => setDuelChatText(event.target.value)}
                    placeholder="Написать в чат"
                    value={duelChatText}
                  />
                  <button type="submit">Отпр</button>
                </form>
              </div>
            )}
          </div>);
}
