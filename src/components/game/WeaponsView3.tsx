import { useGameModel } from '../../game/GameContext';

import { getArmorStyleIndex,isHelmetArmor } from '../../game/data/isDeathSword';
import { formatPower,rarityClass } from '../../game/data/rarityDamage';



export function WeaponsView3() {
  const {
    showFullInventory, armors, inventoryPreviewLimit, setShowFullInventory, visibleArmors,
    equippedArmor, setEquippedArmor, sellArmor
  } = useGameModel();
  return (<div className="weapons armors">
            <div className="inventory-head">
              <div>
                <p className="label">Инвентарь брони 3375 видов</p>
                <strong>{showFullInventory ? `Вся броня: ${armors.length}` : `Последние ${inventoryPreviewLimit} из ${armors.length}`}</strong>
              </div>
              <button onClick={() => setShowFullInventory((show) => !show)}>
                {showFullInventory ? 'Показать последние' : 'Показать весь'}
              </button>
            </div>
            <div className={showFullInventory ? 'inventory-list full' : 'inventory-list'}>
              {visibleArmors.map((armor) => (
                <button
                  className={`weapon armor-card ${rarityClass[armor.rarity]} armor-style-${getArmorStyleIndex(armor)} ${isHelmetArmor(armor) ? 'helmet-card' : 'body-card'} ${equippedArmor?.id === armor.id ? 'equipped' : ''}`}
                  onClick={() => setEquippedArmor(armor)}
                  key={armor.id}
                >
                  <span className="armor-picture" aria-hidden="true">
                    <i />
                  </span>
                  <span>{armor.name}</span>
                  <small>{armor.rarity} +{armor.displayDefense ?? formatPower(armor.defense)} защиты | цена {formatPower(armor.price)}</small>
                  <span
                    className="sell-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      sellArmor(armor);
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
