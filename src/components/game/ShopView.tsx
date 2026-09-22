import { useGameModel } from '../../game/GameContext';

import { normalizePlayerId } from '../../game/data/isWorldBlockedAt';
import { endingArtifacts,getShopBonusText,getShopPrice,shopItems } from '../../game/data/loadUnlockedAchievements';
import { formatPower } from '../../game/data/rarityDamage';



export function ShopView() {
  const {
    shopTab, infiniteGold, gold, unlockedArtifacts, onlinePlayers,
    playerId, setShopTab, shopLevels, buy, unlockedAchievements,
    equippedArtifactId, equipArtifact, submitAdminCode, setAdminCode, adminCode,
    startDuelSearch, setDuelTargetId, duelTargetId, duelWins
  } = useGameModel();
  return (<div className="shop">
              <div className="shop-title">
                <p className="label">Лавка героя</p>
                <strong>
                  {shopTab === 'upgrades'
                    ? `${infiniteGold ? '∞' : formatPower(gold)} золота`
                    : shopTab === 'artifacts'
                      ? `${unlockedArtifacts.length} / ${endingArtifacts.length} артефактов`
                      : shopTab === 'players'
                        ? `${onlinePlayers.length} игроков`
                        : shopTab === 'id'
                          ? `ID ${playerId}`
                          : 'онлайн'}
                </strong>
              </div>
              <div className="shop-tabs" role="tablist" aria-label="Вкладки магазина">
                <button className={shopTab === 'upgrades' ? 'selected' : ''} onClick={() => setShopTab('upgrades')} type="button">Улучшения</button>
                <button className={shopTab === 'artifacts' ? 'selected' : ''} onClick={() => setShopTab('artifacts')} type="button">Артефакты</button>
                <button className={shopTab === 'code' ? 'selected' : ''} onClick={() => setShopTab('code')} type="button">Код</button>
                <button className={shopTab === 'duel' ? 'selected' : ''} onClick={() => setShopTab('duel')} type="button">Дуэль</button>
                <button className={shopTab === 'players' ? 'selected' : ''} onClick={() => setShopTab('players')} type="button">Игроки</button>
                <button className={shopTab === 'id' ? 'selected' : ''} onClick={() => setShopTab('id')} type="button">ID</button>
              </div>
              {shopTab === 'upgrades' ? (
                <div className="shop-grid">
                  {shopItems.map((item) => {
                    const level = shopLevels[item.id];
                    const price = getShopPrice(item, level);
                    return (
                      <button className="shop-item" onClick={() => buy(item)} disabled={!infiniteGold && gold < price} key={item.id}>
                        <span>{item.name} ур. {level}</span>
                        <small>{getShopBonusText(item, level)}</small>
                        <b>{price}</b>
                      </button>
                    );
                  })}
                </div>
              ) : shopTab === 'artifacts' ? (
                <div className="artifact-grid">
                  {endingArtifacts.map((artifact) => {
                    const unlocked = unlockedAchievements.includes(artifact.ending);
                    const equipped = equippedArtifactId === artifact.id;
                    return (
                      <button
                        className={`artifact-card ${unlocked ? 'unlocked' : 'locked'} ${equipped ? 'equipped' : ''}`}
                        disabled={!unlocked}
                        key={artifact.id}
                        onClick={() => equipArtifact(artifact)}
                        type="button"
                      >
                        <span className={`artifact-icon ${artifact.icon}`}><span /></span>
                        <strong>{artifact.name}</strong>
                        <small>{unlocked ? artifact.text : 'Открой концовку'}</small>
                        <b>{unlocked ? `${equipped ? 'Надет: ' : ''}+${artifact.bonusPercent}% урон, +${artifact.goldBonusPercent}% деньги, +${artifact.attackSpeedPercent}% скорость, +${artifact.manaBonusPercent ?? 0}% мана, лечит 20% HP${artifact.healingBonusPercent ? `, +${artifact.healingBonusPercent}% к исцелению` : ''}${artifact.healthBonusPercent ? `, +${artifact.healthBonusPercent}% здоровье` : ''}${artifact.defenseBonusPercent ? `, +${artifact.defenseBonusPercent}% защита` : ''}${artifact.luckBonusPercent ? `, +${artifact.luckBonusPercent}% удача` : ''}${artifact.id === 'seaPearl' ? ', воденой меч +1000%' : ''}` : 'Закрыт'}</b>
                      </button>
                    );
                  })}
                </div>
              ) : shopTab === 'code' ? (
                <form className="code-form shop-code-form shop-panel" onSubmit={submitAdminCode}>
                  <input
                    aria-label="Код магазина"
                    onChange={(event) => setAdminCode(event.target.value)}
                    placeholder="Код"
                    value={adminCode}
                  />
                  <button className="nuclear-button" type="submit">OK</button>
                </form>
              ) : shopTab === 'duel' ? (
                <div className="shop-panel shop-duel-panel">
                  <button className="duel-button" onClick={startDuelSearch} type="button">Искать дуэль</button>
                  <form className="duel-id-box" onSubmit={(event) => {
                    event.preventDefault();
                    startDuelSearch();
                  }}>
                    <input
                      aria-label="ID игрока для дуэли"
                      maxLength={6}
                      onChange={(event) => setDuelTargetId(normalizePlayerId(event.target.value))}
                      placeholder="ID игрока"
                      value={duelTargetId}
                    />
                    <button type="submit">OK</button>
                  </form>
                  <p>Побед в дуэлях: {duelWins}. Введи ID игрока или ищи случайного онлайн.</p>
                </div>
              ) : shopTab === 'players' ? (
                <div className="online-players shop-online-players">
                  <div className="online-players-head">
                    <strong>Игроки онлайн</strong>
                    <button onClick={startDuelSearch} type="button">Дуэль</button>
                  </div>
                  <div className="online-player-list">
                    {onlinePlayers.length === 0 ? (
                      <p className="online-empty">Список пуст. Реальных игроков онлайн нет.</p>
                    ) : onlinePlayers.map((player) => (
                      <button
                        className={duelTargetId === player.id ? 'selected' : ''}
                        key={player.id}
                        onClick={() => {
                          setDuelTargetId(player.id);
                          setShopTab('duel');
                        }}
                        type="button"
                      >
                        <span>{player.name} ID {player.id}</span>
                        <small>{player.title} | сила {formatPower(player.power)}</small>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="shop-panel shop-id-panel">
                  <strong className="player-id">ID {playerId}</strong>
                  <p>Твой ID теперь показывается только в магазине. Другой игрок может ввести его во вкладке Дуэль.</p>
                </div>
              )}
            </div>);
}
