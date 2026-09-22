import { useGameModel } from '../../game/GameContext';

import { BattleScene3D } from '../../components/BattleScene3D';
import { getWorldCollisionBoxes } from '../../game/data/getWorldCollisionBoxes';



export function PanelView() {
  const { setSceneReady,
    mapSceneKey, gameActive, enemy, heroAnimation, heroMoving,
    isFinalReveal, worldBurn, heroPosition, heroHeight, heroDirection,
    cameraYaw, nearestMonster, currentMonsterTotal, currentMonsters, battlePulse,
    useCityGoblinModel, chapter, mapLocationIndex, equippedArtifact, equippedWeaponStyle,
    hasArcaneWeapon, selectedArcaneSpell, arcanePulse, arcaneBurstPulse, takeBossMagicHit
  } = useGameModel();
  return (<div className="battle-3d-layer">
            <BattleScene3D onReady={setSceneReady}
              key={mapSceneKey}
              paused={!gameActive}
              dragonColor={enemy?.color ?? '#ffb703'}
              heroAnimation={heroAnimation}
              isHeroMoving={heroMoving}
              isFinalReveal={isFinalReveal}
              burn={worldBurn}
              heroPosition={heroPosition}
              heroHeight={heroHeight}
              heroDirection={heroDirection}
              cameraYaw={cameraYaw}
              nearestMonster={nearestMonster}
              monstersLeft={currentMonsterTotal > 0 ? Math.min(100, (currentMonsters / currentMonsterTotal) * 100) : 0}
              battlePulse={battlePulse}
              cameraMode="third"
              monsterKind={enemy?.monsterKind ?? 'goblin'}
              viewDistance={1_000}
              sceneKey={mapSceneKey}
              useCityGoblinModel={useCityGoblinModel}
              chapter={chapter}
              locationIndex={mapLocationIndex}
              worldObstacles={getWorldCollisionBoxes(chapter, mapLocationIndex, mapSceneKey)}
              equippedArtifactIcon={equippedArtifact?.icon ?? null}
              equippedWeaponStyle={equippedWeaponStyle}
              hasArcaneWeapon={hasArcaneWeapon}
              arcaneSpellKind={selectedArcaneSpell}
              arcanePulse={arcanePulse}
              arcaneBurstPulse={arcaneBurstPulse}
              onBossMagicHit={takeBossMagicHit}
            />
          </div>);
}
