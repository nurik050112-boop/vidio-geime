import { useGameModel } from '../../game/GameContext';

import { WeaponThumbnail } from '../../components/WeaponThumbnail';
import { formatHugeText,formatPower,getWeaponStyleIndex,rarityClass } from '../../game/data/rarityDamage';



export function WeaponsView() {
  const {
    magicWeapons, claimMagicStaffs, showFullInventory, visibleMagicWeapons, equippedWeapon,
    setEquippedWeapon
  } = useGameModel();
  return (<div className="weapons magic-weapons">
          <div className="inventory-head">
            <div>
              <p className="label">Магическое оружие</p>
              <strong>{magicWeapons.length > 0 ? `Посохи: ${magicWeapons.length}` : 'Посохи и способности'}</strong>
            </div>
            <button onClick={claimMagicStaffs} type="button">
              Получить посохи
            </button>
          </div>
          <div className={showFullInventory ? 'inventory-list full' : 'inventory-list'}>
            {visibleMagicWeapons.map((weapon) => (
              <button
                className={`weapon weapon-card magic-staff ${rarityClass[weapon.rarity]} weapon-style-${getWeaponStyleIndex(weapon)} ${equippedWeapon?.id === weapon.id ? 'equipped' : ''}`}
                onClick={() => setEquippedWeapon(weapon)}
                key={weapon.id}
              >
                <WeaponThumbnail name={weapon.name} styleIndex={getWeaponStyleIndex(weapon)} />
                <span className="weapon-name">{weapon.name}</span>
                <small>{weapon.displayDamage ? formatHugeText(weapon.displayDamage) : formatPower(weapon.damage)} | способности снизу</small>
                <small className="weapon-model-label">70м радиус | 100 км/ч | 3с перезарядка</small>
              </button>
            ))}
            {visibleMagicWeapons.length === 0 && (
              <div className="magic-empty">
                <strong>Магические посохи ещё не взяты</strong>
                <span>Нажми “Получить посохи”, потом выбери способность внизу боя.</span>
              </div>
            )}
          </div>
        </div>);
}
