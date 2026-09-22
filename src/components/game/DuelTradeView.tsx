import { useGameModel } from '../../game/GameContext';

import { WeaponThumbnail } from '../../components/WeaponThumbnail';
import { getArmorStyleIndex,isHelmetArmor } from '../../game/data/isDeathSword';
import { formatHugeText,formatPower,getWeaponDisplayName,getWeaponStyleIndex,rarityClass } from '../../game/data/rarityDamage';



export function DuelTradeView() {
  const {
    duelOpponent, weapons, armors, duelTradeOffer, setDuelTradeOffer,
    acceptDuelTrade, rejectDuelTrade
  } = useGameModel();
  if (!duelOpponent) return null;
  return (<div className="duel-trade">
                <strong>Обмен или нет</strong>
                <p>Сверху вещи другого игрока, ниже твой инвентарь. Выбери предмет и нажми готово.</p>
                <div className="duel-trade-label">У него есть</div>
                <div className="duel-trade-target">
                  <div className="weapon weapon-card rare">
                    <WeaponThumbnail name={getWeaponDisplayName(duelOpponent.weapon)} styleIndex={getWeaponStyleIndex(duelOpponent.weapon)} />
                    <span className="weapon-name">{getWeaponDisplayName(duelOpponent.weapon)}</span>
                    <small>Получишь меч соперника +{formatPower(duelOpponent.weapon.damage)}</small>
                  </div>
                  <div className="weapon armor-card rare body-card">
                    <span className="armor-picture" aria-hidden="true"><i /></span>
                    <span>{duelOpponent.armor.name}</span>
                    <small>Получишь броню соперника +{formatPower(duelOpponent.armor.defense)}</small>
                  </div>
                </div>
                <div className="duel-trade-label">У тебя есть</div>
                <div className="duel-trade-inventory">
                  {weapons.length === 0 && armors.length === 0 ? (
                    <p className="online-empty">Инвентарь пуст. Для обмена нужен меч или броня.</p>
                  ) : (
                    <>
                      {weapons.map((weapon) => (
                        <button
                          className={`weapon weapon-card ${rarityClass[weapon.rarity]} weapon-style-${getWeaponStyleIndex(weapon)} ${duelTradeOffer?.kind === 'weapon' && duelTradeOffer.item.id === weapon.id ? 'selected' : ''}`}
                          key={weapon.id}
                          onClick={() => setDuelTradeOffer({ kind: 'weapon', item: weapon })}
                          type="button"
                        >
                          <WeaponThumbnail name={getWeaponDisplayName(weapon)} styleIndex={getWeaponStyleIndex(weapon)} />
                          <span className="weapon-name">{getWeaponDisplayName(weapon)}</span>
                          <small>{weapon.rarity} +{weapon.displayDamage ? formatHugeText(weapon.displayDamage) : formatPower(weapon.damage)}</small>
                        </button>
                      ))}
                      {armors.map((armor) => (
                        <button
                          className={`weapon armor-card ${rarityClass[armor.rarity]} armor-style-${getArmorStyleIndex(armor)} ${isHelmetArmor(armor) ? 'helmet-card' : 'body-card'} ${duelTradeOffer?.kind === 'armor' && duelTradeOffer.item.id === armor.id ? 'selected' : ''}`}
                          key={armor.id}
                          onClick={() => setDuelTradeOffer({ kind: 'armor', item: armor })}
                          type="button"
                        >
                          <span className="armor-picture" aria-hidden="true"><i /></span>
                          <span>{armor.name}</span>
                          <small>{armor.rarity} +{armor.displayDefense ?? formatPower(armor.defense)} защиты</small>
                        </button>
                      ))}
                    </>
                  )}
                </div>
                <div className="duel-actions">
                  <button onClick={acceptDuelTrade} disabled={!duelTradeOffer} type="button">Готово</button>
                  <button className="secondary" onClick={rejectDuelTrade} type="button">Отказаться</button>
                </div>
              </div>);
}
