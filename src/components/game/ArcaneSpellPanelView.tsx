import { useGameModel } from '../../game/GameContext';

import { arcaneSpells } from '../../game/data/arcaneSpells';



export function ArcaneSpellPanelView() {
  const {
    selectedArcaneSpell, setSelectedArcaneSpell, selectedSpell, selectedSpellRadiusMeters, selectedSpellSpeedKmh,
    arcaneSkillReady, heroHp, castArcaneSkill, heroMana, arcaneSkillManaCost,
    arcaneSkillRemainingMs
  } = useGameModel();
  return (<div className="arcane-spell-panel" aria-label="Заклинания">
              <div className="arcane-spell-grid">
                {arcaneSpells.map((spell, index) => (
                  <button
                    aria-label={spell.name}
                    className={selectedArcaneSpell === index ? 'selected' : ''}
                    key={spell.name}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedArcaneSpell(index);
                    }}
                    title={`${spell.name}: ${spell.mana} маны`}
                    type="button"
                  >
                    {spell.icon}
                    <small>{spell.mana}</small>
                  </button>
                ))}
              </div>
              <div className="arcane-spell-info">
                <strong>{selectedSpell.name}</strong>
                <span>радиус {selectedSpellRadiusMeters}м | скорость {selectedSpellSpeedKmh} км/ч | перезарядка 3с</span>
              </div>
              <button
                className={`arcane-skill-button ${arcaneSkillReady ? 'ready' : 'cooldown'}`}
                disabled={!arcaneSkillReady || heroHp === 0}
                onClick={(event) => {
                  event.stopPropagation();
                  castArcaneSkill();
                }}
                type="button"
              >
                {heroMana < arcaneSkillManaCost ? `${arcaneSkillManaCost} маны` : arcaneSkillReady ? selectedSpell.name : `${Math.ceil(arcaneSkillRemainingMs / 1000)}с`}
              </button>
            </div>);
}
