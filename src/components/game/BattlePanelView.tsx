import { useGameModel } from '../../game/GameContext';

import { formatHugeText,formatPower,getWeaponDisplayName,isBbiLegendaryWeapon } from '../../game/data/rarityDamage';



export function BattlePanelView() {
  const {
    playerName, heroHealthPercent, heroHealthText, currentMonsters, isFinalSpiritBoss,
    isBbiBoss, isFinalSpiritWorld, isBbiWorld, enemyHp, currentDragonHp,
    currentMonsterTotal, enemy, dragonReaction, infiniteGold, gold,
    goldMultiplier, attackBonus, equippedArtifact, hasAdminHelmet, defenseBonus,
    reward, healthLevel, currentMonsterHp, equippedWeapon, bbiLegendaryDamage,
    equippedArmor
  } = useGameModel();
  return (<div className="battle-panel">
              <div>
                <p className="label">Герой</p>
                <strong className="admin-nick">{playerName}</strong>
                <div className="bar">
                  <span style={{ width: `${heroHealthPercent}%` }} />
                </div>
                <strong>{heroHealthText}</strong>
              </div>
              <div>
                <p className="label">{currentMonsters === 0 ? (isFinalSpiritBoss ? 'Души босса' : isBbiBoss ? 'BBI босс' : 'Дракон-босс') : (isFinalSpiritWorld ? 'Подземный мир' : isBbiWorld ? 'BBI новый мир' : 'Город')}</p>
                <div className="bar enemy">
                  <span style={{ width: `${currentMonsters === 0 ? Math.min(100, (enemyHp / currentDragonHp) * 100) : Math.max(0, 100 - (currentMonsters / currentMonsterTotal) * 100)}%` }} />
                </div>
                <strong>{currentMonsters === 0 ? enemy.name : enemy.city}</strong>
                {currentMonsters === 0 ? (
                  <>
                    <strong>HP: {formatPower(enemyHp)} / {formatPower(currentDragonHp)}</strong>
                    <strong>Реакция: {dragonReaction}</strong>
                  </>
                ) : (
                <strong>Очищено: {formatPower(currentMonsterTotal - currentMonsters)} / {formatPower(currentMonsterTotal)}</strong>
                )}
              </div>
              <div className="lair-summary">
                <p className="label">Место дракона в этом городе</p>
                <strong>{enemy.lair}</strong>
              </div>
              <div className="stats">
                <strong>Золото: {infiniteGold ? '∞' : formatPower(gold)}</strong>
                <strong>Деньги: x{goldMultiplier}</strong>
                <strong>Урон: +{formatPower(attackBonus)}</strong>
                <strong>Артефакт: {equippedArtifact ? `+${equippedArtifact.bonusPercent}% урон, +${equippedArtifact.goldBonusPercent}% деньги, +${equippedArtifact.attackSpeedPercent}% скорость, +${equippedArtifact.manaBonusPercent ?? 0}% мана` : 'нет'}</strong>
                <strong>Защита: -{hasAdminHelmet ? '∞' : formatPower(defenseBonus)}</strong>
                <strong>Деньги за босса: {formatPower(reward)}</strong>
                <strong>Монстры: {formatPower(currentMonsters)}</strong>
                <strong>Здоровье ур.: {healthLevel}</strong>
                <strong>HP монстра: {formatPower(currentMonsterHp)}</strong>
              </div>
              <div className="weapon-summary">
                <p className="label">Оружие 12 500 видов</p>
                <strong>{equippedWeapon ? getWeaponDisplayName(equippedWeapon) : 'Пока нет оружия'}</strong>
                <span>{equippedWeapon ? `${equippedWeapon.rarity}, +${isBbiLegendaryWeapon(equippedWeapon) ? `${formatPower(bbiLegendaryDamage)} (+10000%)` : equippedWeapon.displayDamage ? formatHugeText(equippedWeapon.displayDamage) : formatPower(equippedWeapon.damage)} урона, цена ${formatPower(equippedWeapon.price)}` : 'Выбивается с врагов и в подземельях'}</span>
              </div>
              <div className="weapon-summary armor-summary">
                <p className="label">Броня 3375 видов</p>
                <strong>{equippedArmor ? equippedArmor.name : 'Пока нет брони'}</strong>
                <span>{equippedArmor ? `${equippedArmor.rarity}, +${equippedArmor.displayDefense ?? formatPower(equippedArmor.defense)} защиты, цена ${formatPower(equippedArmor.price)}` : 'Выбивается с врагов и в подземельях'}</span>
              </div>
            </div>);
}
