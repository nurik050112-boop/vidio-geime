import { useGameModel } from '../../game/GameContext';

import { GameDialog } from '../../components/GameDialog';
import { WeaponThumbnail } from '../../components/WeaponThumbnail';
import { getArmorStyleIndex,isArcaneWeapon,isHelmetArmor } from '../../game/data/isDeathSword';
import { formatHugeText,formatPower,getWeaponDisplayName,getWeaponStyleIndex,rarityClass } from '../../game/data/rarityDamage';



export function GameDialogView() {
  const {
    setInventoryPanelOpen, weapons, armors, relics, claimMagicStaffs,
    setShowFullInventory, showFullInventory, visibleMagicWeapons, equippedWeapon, setEquippedWeapon,
    visibleWeapons, visibleArmors, equippedArmor, setEquippedArmor, visibleRelics
  } = useGameModel();
  return (<GameDialog title="Инвентарь" onClose={() => setInventoryPanelOpen(false)}>
          <div className="game-modal-panel inventory-modal-panel">
            <div className="game-modal-head">
              <div>
                <p className="label">Один инвентарь</p>
                <strong>{weapons.length + armors.length + relics.length} вещей</strong>
              </div>
              <div className="modal-head-actions">
                <button onClick={claimMagicStaffs} type="button">Магия</button>
                <button onClick={() => setShowFullInventory((show) => !show)} type="button">{showFullInventory ? 'Коротко' : 'Все'}</button>
                <button onClick={() => setInventoryPanelOpen(false)} type="button">Закрыть</button>
              </div>
            </div>
            <div className="inventory-list full unified-inventory-list">
              {visibleMagicWeapons.map((weapon) => (
                <button
                  className={`weapon weapon-card magic-staff ${rarityClass[weapon.rarity]} weapon-style-${getWeaponStyleIndex(weapon)} ${equippedWeapon?.id === weapon.id ? 'equipped' : ''}`}
                  onClick={() => setEquippedWeapon(weapon)}
                  key={`magic-${weapon.id}`}
                  type="button"
                >
                  <WeaponThumbnail name={weapon.name} styleIndex={getWeaponStyleIndex(weapon)} />
                  <span className="weapon-name">{weapon.name}</span>
                  <small>{weapon.displayDamage ? formatHugeText(weapon.displayDamage) : formatPower(weapon.damage)} | магия</small>
                </button>
              ))}
              {visibleWeapons.filter((weapon) => !isArcaneWeapon(weapon)).map((weapon) => (
                <button
                  className={`weapon weapon-card ${rarityClass[weapon.rarity]} weapon-style-${getWeaponStyleIndex(weapon)} ${equippedWeapon?.id === weapon.id ? 'equipped' : ''}`}
                  onClick={() => setEquippedWeapon(weapon)}
                  key={`weapon-${weapon.id}`}
                  type="button"
                >
                  <WeaponThumbnail name={getWeaponDisplayName(weapon)} styleIndex={getWeaponStyleIndex(weapon)} />
                  <span className="weapon-name">{getWeaponDisplayName(weapon)}</span>
                  <small>{weapon.rarity} +{weapon.displayDamage ? formatHugeText(weapon.displayDamage) : formatPower(weapon.damage)}</small>
                </button>
              ))}
              {visibleArmors.map((armor) => (
                <button
                  className={`weapon armor-card ${rarityClass[armor.rarity]} armor-style-${getArmorStyleIndex(armor)} ${isHelmetArmor(armor) ? 'helmet-card' : 'body-card'} ${equippedArmor?.id === armor.id ? 'equipped' : ''}`}
                  onClick={() => setEquippedArmor(armor)}
                  key={`armor-${armor.id}`}
                  type="button"
                >
                  <span className="armor-picture" aria-hidden="true"><i /></span>
                  <span>{armor.name}</span>
                  <small>{armor.rarity} +{armor.displayDefense ?? formatPower(armor.defense)} защиты</small>
                </button>
              ))}
              {visibleRelics.map((relic) => (
                <div className="unified-relic" key={`relic-${relic}`}>
                  <strong>{relic}</strong>
                  <small>Редкая вещь</small>
                </div>
              ))}
              {weapons.length === 0 && armors.length === 0 && relics.length === 0 && (
                <div className="magic-empty">
                  <strong>Инвентарь пустой</strong>
                  <span>Бей монстров, открывай сундуки и забирай магию.</span>
                </div>
              )}
            </div>
          </div>
        </GameDialog>);
}
