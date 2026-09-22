import { useGameModel } from '../../game/GameContext';

import { type CSSProperties } from 'react';
import { monsterKinds } from '../../game/data/arcaneSpells';



export function MonsterPackView() {
  const {
    enemy, currentMonsters, chapter, isFinalSpiritWorld, isAdminWorld,
    isAisWorld, isNuraliWorld, isBbiWorld, isArailmWorld, isMansurDungeon,
    isAnuarWorld, isFuryDungeon, heroPosition
  } = useGameModel();
  return (<div className="monster-pack" data-kind={enemy?.monsterKind ?? 'goblin'}>
            {Array.from({ length: Math.max(0, Math.min(3, Math.ceil(currentMonsters / 700))) }).map((_, index) => {
              const mixedMonster = monsterKinds[(chapter + index) % monsterKinds.length];
              const monsterKind = isFinalSpiritWorld ? 'shadow' : isAdminWorld ? 'admin' : isAisWorld ? 'fish' : isNuraliWorld ? 'nurali' : isBbiWorld ? 'shadow' : isArailmWorld ? 'arailm' : isMansurDungeon ? 'mansur' : isAnuarWorld ? 'bomb' : isFuryDungeon ? 'fury' : enemy?.monsterKind ?? mixedMonster[0];
              const monsterColumn = index % 8;
              const monsterRow = Math.floor(index / 8);
              return (
              <span
                className={`monster-token ${monsterKind}`}
                key={index}
                style={{
                  '--monster-x': `${Math.max(-30, Math.min(290, heroPosition.x / 150 + (monsterColumn - 3.5) * 34 + 130))}px`,
                  '--monster-y': `${Math.max(-34, Math.min(64, heroPosition.z / 240 + monsterRow * 34 - 28))}px`,
                } as CSSProperties}
              >
                <i />
                <em className="monster-face" />
                <em className="monster-nose" />
                <em className="monster-belt" />
                <em className="monster-boots" />
                <em className="monster-armor" />
                <b />
              </span>
              );
            })}
          </div>);
}
