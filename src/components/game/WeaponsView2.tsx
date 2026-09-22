import { useGameModel } from '../../game/GameContext';

import { WeaponThumbnail } from '../../components/WeaponThumbnail';
import { formatHugeText,formatPower,getWeaponDisplayName,getWeaponModelName,getWeaponStyleIndex,isBbiLegendaryWeapon,rarityClass,weaponSellPrice } from '../../game/data/rarityDamage';



export function WeaponsView2() {
  const {
    showFullInventory, weapons, inventoryPreviewLimit, setShowFullInventory, visibleWeapons,
    equippedWeapon, setEquippedWeapon, bbiLegendaryDamage, sellWeapon
  } = useGameModel();
  return (<div className="weapons">
            <div className="inventory-head">
              <div>
                <p className="label">Инвентарь оружия</p>
                <strong>{showFullInventory ? `Все оружие: ${weapons.length}` : `Последние ${inventoryPreviewLimit} из ${weapons.length}`}</strong>
              </div>
              <button onClick={() => setShowFullInventory((show) => !show)}>
                {showFullInventory ? 'Показать последние' : 'Показать весь'}
              </button>
            </div>
            <div className={showFullInventory ? 'inventory-list full' : 'inventory-list'}>
              {visibleWeapons.map((weapon) => (
                <button
                  className={`weapon weapon-card ${rarityClass[weapon.rarity]} weapon-style-${getWeaponStyleIndex(weapon)} ${equippedWeapon?.id === weapon.id ? 'equipped' : ''}`}
                  onClick={() => setEquippedWeapon(weapon)}
                  key={weapon.id}
                >
                  <WeaponThumbnail name={getWeaponDisplayName(weapon)} styleIndex={getWeaponStyleIndex(weapon)} />
                  <span className="weapon-name">{getWeaponDisplayName(weapon)}</span>
                  <small>{weapon.rarity} +{isBbiLegendaryWeapon(weapon) ? `${formatPower(bbiLegendaryDamage)} +10000%` : weapon.displayDamage ? formatHugeText(weapon.displayDamage) : formatPower(weapon.damage)} | продажа {formatPower(weaponSellPrice[weapon.rarity])}</small>
                  <small className="weapon-model-label">Вид оружия: {getWeaponModelName(weapon)}</small>
                  <span
                    className="sell-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      sellWeapon(weapon);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    Продать
                  </span>
                </button>
              ))}
            </div>
          </div>);
}
