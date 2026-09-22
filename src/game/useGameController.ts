import { useState } from 'react';
import { type User } from '@supabase/supabase-js';
import { type FormEvent,type PointerEvent as ReactPointerEvent } from 'react';
import { useLocation } from 'wouter';
import { runAcceptDuel } from './actions/acceptDuel';
import { runAcceptDuelTrade } from './actions/acceptDuelTrade';
import { runAcceptIncomingDuelRequest } from './actions/acceptIncomingDuelRequest';
import { runAddGold } from './actions/addGold';
import { runAddWinStreak } from './actions/addWinStreak';
import { runApplyGameSave } from './actions/applyGameSave';
import { runAttackFromStageClick } from './actions/attackFromStageClick';
import { runBuy } from './actions/buy';
import { runCastArcaneSkill } from './actions/castArcaneSkill';
import { runClaimMagicStaffs } from './actions/claimMagicStaffs';
import { runClearCity } from './actions/clearCity';
import { runClearIncomingDuelRequest } from './actions/clearIncomingDuelRequest';
import { runCloseDuelList } from './actions/closeDuelList';
import { runCloseTutorial } from './actions/closeTutorial';
import { runCompleteAchievement } from './actions/completeAchievement';
import { runDeclineDuel } from './actions/declineDuel';
import { runDeclineDungeon } from './actions/declineDungeon';
import { runDuelHit } from './actions/duelHit';
import { runEnterDungeon } from './actions/enterDungeon';
import { runEquipArtifact } from './actions/equipArtifact';
import { runExitDungeon } from './actions/exitDungeon';
import { runFightMonster } from './actions/fightMonster';
import { runFinishMonsterAvalanche } from './actions/finishMonsterAvalanche';
import { runGrantDailyReward } from './actions/grantDailyReward';
import { runMakeNearestMonsterSpawn } from './actions/makeNearestMonsterSpawn';
import { runMoveCameraDrag } from './actions/moveCameraDrag';
import { runMoveHero } from './actions/moveHero';
import { runMoveJoystick } from './actions/moveJoystick';
import { runMoveMonsterAroundObjects } from './actions/moveMonsterAroundObjects';
import { runOpenArailmWorld } from './actions/openArailmWorld';
import { runOpenDuelTrade } from './actions/openDuelTrade';
import { runPlayBossMusic } from './actions/playBossMusic';
import { runPlayHeroAnimation } from './actions/playHeroAnimation';
import { runRejectDuelTrade } from './actions/rejectDuelTrade';
import { runRejectIncomingDuelRequest } from './actions/rejectIncomingDuelRequest';
import { runResetJoystick } from './actions/resetJoystick';
import { runResetWinStreak } from './actions/resetWinStreak';
import { runRestart } from './actions/restart';
import { runScheduleOnlineListReturn } from './actions/scheduleOnlineListReturn';
import { runSelectDuelPlayer } from './actions/selectDuelPlayer';
import { runSellArmor } from './actions/sellArmor';
import { runSellWeapon } from './actions/sellWeapon';
import { runSendDuelChat } from './actions/sendDuelChat';
import { runSetCurrentMonsterCount } from './actions/setCurrentMonsterCount';
import { runShouldSpeakMessage } from './actions/shouldSpeakMessage';
import { runSpeakText } from './actions/speakText';
import { runStartCameraDrag } from './actions/startCameraDrag';
import { runStartDuelSearch } from './actions/startDuelSearch';
import { runStartJoystick } from './actions/startJoystick';
import { runStopBossMusic } from './actions/stopBossMusic';
import { runStopCameraDrag } from './actions/stopCameraDrag';
import { runStopJoystick } from './actions/stopJoystick';
import { runStrike } from './actions/strike';
import { runSubmitAchievementCode } from './actions/submitAchievementCode';
import { runSubmitAdminCode } from './actions/submitAdminCode';
import { runTakeBossMagicHit } from './actions/takeBossMagicHit';
import { runTeleportToAchievement } from './actions/teleportToAchievement';
import { runUnlockAchievement } from './actions/unlockAchievement';
import { runUpdateCameraYaw } from './actions/updateCameraYaw';
import { runUpdateJoystick } from './actions/updateJoystick';
import { type NearestMonsterState } from './data/adminBoss';
import { type AchievementId,type Armor,type Artifact,type DuelPlayer,type HeroAnimation,type ShopItem,type Weapon } from './data/dragonSon';
import { type GameSaveState } from './data/gameSaveState';
import { useAchievementStorage } from './effects/useAchievementStorage';
import { useAudioCleanup } from './effects/useAudioCleanup';
import { useBossMusic } from './effects/useBossMusic';
import { useClickDuel } from './effects/useClickDuel';
import { useCollisionContext } from './effects/useCollisionContext';
import { useCreatorCredits } from './effects/useCreatorCredits';
import { useDailyReward } from './effects/useDailyReward';
import { useDuelRequests } from './effects/useDuelRequests';
import { useDuelSearch } from './effects/useDuelSearch';
import { useEndingVoice } from './effects/useEndingVoice';
import { useEnemyBurn } from './effects/useEnemyBurn';
import { useForcedLocation } from './effects/useForcedLocation';
import { useGravity } from './effects/useGravity';
import { useHeroRespawn } from './effects/useHeroRespawn';
import { useIntroVoice } from './effects/useIntroVoice';
import { useKeyboardAttack } from './effects/useKeyboardAttack';
import { useKeyboardMovement } from './effects/useKeyboardMovement';
import { useLevelStats } from './effects/useLevelStats';
import { useManaLimit } from './effects/useManaLimit';
import { useManaRegeneration } from './effects/useManaRegeneration';
import { useMessageVoice } from './effects/useMessageVoice';
import { useMonsterAttacks } from './effects/useMonsterAttacks';
import { useMonsterChase } from './effects/useMonsterChase';
import { useMonsterReference } from './effects/useMonsterReference';
import { useMonsterSpawn } from './effects/useMonsterSpawn';
import { useMonsterState } from './effects/useMonsterState';
import { useMovementLoop } from './effects/useMovementLoop';
import { useNickname } from './effects/useNickname';
import { useOnlinePresence } from './effects/useOnlinePresence';
import { useQuestRewards } from './effects/useQuestRewards';
import { useSpellCooldown } from './effects/useSpellCooldown';
import { useSpiritRespawn } from './effects/useSpiritRespawn';
import { useArailmMonstersLeftState } from './state/useArailmMonstersLeftState';
import { useArcaneBurstPulseState } from './state/useArcaneBurstPulseState';
import { useBattleSceneState } from './state/useBattleSceneState';
import { useBbiGateOpenState } from './state/useBbiGateOpenState';
import { useDragonClassState } from './state/useDragonClassState';
import { useDuelChatMessagesState } from './state/useDuelChatMessagesState';
import { useEquippedIsHelmetState } from './state/useEquippedIsHelmetState';
import { useFuryGateOpenState } from './state/useFuryGateOpenState';
import { useIncomingRequestPlayerState } from './state/useIncomingRequestPlayerState';
import { useIntroSkippedState } from './state/useIntroSkippedState';
import { useIsFuryDungeonState } from './state/useIsFuryDungeonState';
import { useIsWorldPageState } from './state/useIsWorldPageState';
import { useMonsterAvalancheEndingState } from './state/useMonsterAvalancheEndingState';
import { useQuestsState } from './state/useQuestsState';
import { useSaveStateState } from './state/useSaveStateState';
import { useShopTabState } from './state/useShopTabState';
import { useVerticalVelocityState } from './state/useVerticalVelocityState';
import { useWeaponBonusState } from './state/useWeaponBonusState';
import { useGameActivity } from './useGameActivity';
import { useGamePersistence } from './useGamePersistence';

export function useGameController({ authUser, guestMode }: { authUser: User | null; guestMode: boolean }) {

  const [sceneReady, setSceneReady] = useState(false);
  const [location, navigate] = useLocation();
  const {
    isWorldPage, isAchievementsPage, saveStorageKey, initialSave, savedGameRef,
    tutorialOpen, setTutorialOpen, chapter, setChapter, healthLevel,
    setHealthLevel, heroHp, setHeroHp, enemyHp, setEnemyHp,
    message, setMessage, savedCities, setSavedCities, victory,
    setVictory, endingChoice, setEndingChoice, secretEnding, setSecretEnding,
    goblinKingReady, setGoblinKingReady, goblinKingFightStarted, setGoblinKingFightStarted
  } = useIsWorldPageState({ location, authUser });
  const {
    furyGateOpen, setFuryGateOpen, furyDungeonEntered, setFuryDungeonEntered, furyMonstersLeft,
    setFuryMonstersLeft, furyChoiceOpen, setFuryChoiceOpen, furyKingFightStarted, setFuryKingFightStarted,
    anuarGateOpen, setAnuarGateOpen, anuarWorldEntered, setAnuarWorldEntered, anuarBombsLeft,
    setAnuarBombsLeft, anuarKingFightStarted, setAnuarKingFightStarted, mansurGateOpen, setMansurGateOpen,
    mansurDungeonEntered, setMansurDungeonEntered, mansurMonstersLeft, setMansurMonstersLeft, mansurKingFightStarted,
    setMansurKingFightStarted, arailmGateOpen, setArailmGateOpen, arailmWorldEntered, setArailmWorldEntered
  } = useFuryGateOpenState({ savedGameRef });
  const {
    arailmMonstersLeft, setArailmMonstersLeft, arailmChoiceOpen, setArailmChoiceOpen, arailmKingFightStarted,
    setArailmKingFightStarted, aisGateOpen, setAisGateOpen, aisWorldEntered, setAisWorldEntered,
    aisMonstersLeft, setAisMonstersLeft, aisSharkFightStarted, setAisSharkFightStarted, aisFinalChoiceOpen,
    setAisFinalChoiceOpen, aisGodFightStarted, setAisGodFightStarted, adminWorldGateOpen, setAdminWorldGateOpen,
    adminWorldEntered, setAdminWorldEntered, adminWorldMonstersLeft, setAdminWorldMonstersLeft, adminWorldBossesStarted,
    setAdminWorldBossesStarted, adminFinalChoiceOpen, setAdminFinalChoiceOpen, adminBossFightStarted, setAdminBossFightStarted
  } = useArailmMonstersLeftState({ savedGameRef });
  const {
    bbiGateOpen, setBbiGateOpen, bbiWorldEntered, setBbiWorldEntered, bbiMonstersLeft,
    setBbiMonstersLeft, bbiBossStage, setBbiBossStage, bbiFinalChoiceOpen, setBbiFinalChoiceOpen,
    bbiCityReward, setBbiCityReward, bbiBadEnding, setBbiBadEnding, impossibleEnding,
    setImpossibleEnding, nuraliGateOpen, setNuraliGateOpen, nuraliWorldEntered, setNuraliWorldEntered,
    nuraliMonstersLeft, setNuraliMonstersLeft, nuraliChoiceOpen, setNuraliChoiceOpen, nuraliBossFightStarted,
    setNuraliBossFightStarted, monsterAvalancheEntered, setMonsterAvalancheEntered, monsterAvalancheLeft, setMonsterAvalancheLeft
  } = useBbiGateOpenState({ savedGameRef });
  const {
    monsterAvalancheEnding, setMonsterAvalancheEnding, finalSpiritWorldOpen, setFinalSpiritWorldOpen, finalSpiritMonstersLeft,
    setFinalSpiritMonstersLeft, finalSpiritFightStarted, setFinalSpiritFightStarted, deathGodFightStarted, setDeathGodFightStarted,
    unlockedAchievements, setUnlockedAchievements, gold, setGold, goldMultiplier,
    setGoldMultiplier, infiniteGold, setInfiniteGold, dungeon, setDungeon,
    relics, setRelics, weapons, setWeapons, equippedWeapon,
    setEquippedWeapon, armors, setArmors, equippedArmor, setEquippedArmor
  } = useMonsterAvalancheEndingState({ savedGameRef });
  const {
    shopTab, setShopTab, equippedArtifactId, setEquippedArtifactId, heroMana,
    setHeroMana, showFullInventory, setShowFullInventory, questPanelOpen, setQuestPanelOpen,
    inventoryPanelOpen, setInventoryPanelOpen, heroAnimation, setHeroAnimation, heroPosition,
    setHeroPosition, heroHeight, setHeroHeight, heroMoving, setHeroMoving,
    heroDirection, setHeroDirection, cameraYaw, setCameraYaw, nearestMonster,
    setNearestMonster, mapLocationIndex, setMapLocationIndex, joystickThumb, setJoystickThumb
  } = useShopTabState({ savedGameRef });
  const {
    verticalVelocity, heroAnimationTimer, pressedKeys, joystickVector, movementVelocity,
    joystickPointerId, cameraYawRef, cameraPointer, blockNextStageClick, lastMoveAt,
    clickTimesRef, monsterChaseStartedAt, nearestMonsterRef, monsterBotRef, cityMonsters,
    setCityMonsters, setMonsterAttackCount, battlePulse, setBattlePulse, nukePulse,
    setNukePulse, fireWavePulse, setFireWavePulse, waterWavePulse, setWaterWavePulse,
    soulFirePulse, setSoulFirePulse, arcanePulse, setArcanePulse
  } = useVerticalVelocityState({ cameraYaw, savedGameRef });
  const {
    arcaneBurstPulse, setArcaneBurstPulse, selectedArcaneSpell, setSelectedArcaneSpell, arcaneSkillReadyAt,
    setArcaneSkillReadyAt, arcaneCooldownNow, setArcaneCooldownNow, clickDuelPower, setClickDuelPower,
    clicksPerSecond, setClicksPerSecond, enemyBurning, setEnemyBurning, duelStatus,
    setDuelStatus, duelOpponent, setDuelOpponent, duelWins, setDuelWins,
    duelHeroHp, setDuelHeroHp, duelOpponentHp, setDuelOpponentHp, duelTradeOpen,
    setDuelTradeOpen, duelTradeOffer, setDuelTradeOffer, incomingDuelRequest, setIncomingDuelRequest
  } = useArcaneBurstPulseState({ savedGameRef });
  const {
    duelChatMessages, setDuelChatMessages, duelChatText, setDuelChatText, onlinePlayers,
    setOnlinePlayers, leaderboardPlayers, setLeaderboardPlayers, dailyRewardState, setDailyRewardState,
    dailyRewardText, setDailyRewardText, winStreakState, setWinStreakState, winStreakText,
    setWinStreakText, nickname, playerId, duelTargetId, setDuelTargetId,
    levelStatMultiplier, setLevelStatMultiplier, adminCode, setAdminCode, achievementCode,
    setAchievementCode, achievementCheatActive, setAchievementCheatActive, achievementMessage, setAchievementMessage
  } = useDuelChatMessagesState();
  const {
    introSkipped, setIntroSkipped, creatorCreditsOpen, setCreatorCreditsOpen, paidQuestIds,
    audioContextRef, bossMusicStopRef, lastSpokenSceneRef, lastMessageVoiceAtRef, onlinePlayerListRef,
    onlinePlayerScrollTimer, dailyRewardCheckedRef, items, setItems, shopLevels,
    setShopLevels, isFinalBoss, isFinalSpiritBoss, isFinalSpiritWorld, isFamilyBoss,
    isGoblinKingBoss, isFuryKingBoss, isAnuarKingBoss, isMansurKingBoss, isArailmKingBoss,
    isAisSharkBoss, isAisGodBoss, isAdminWorldBosses, isAdminBoss, isNuraliKingBoss
  } = useIntroSkippedState({ savedGameRef, chapter, victory, finalSpiritFightStarted, finalSpiritWorldOpen, endingChoice, goblinKingReady, goblinKingFightStarted, furyKingFightStarted, anuarKingFightStarted, mansurKingFightStarted, arailmKingFightStarted, aisSharkFightStarted, aisGodFightStarted, adminWorldBossesStarted, adminBossFightStarted, nuraliBossFightStarted });
  const {
    isFuryDungeon, isAnuarWorld, isMansurDungeon, isArailmWorld, isAisWorld,
    isAdminWorld, isNuraliWorld, isBbiBoss, isBbiWorld, isMonsterAvalancheWorld,
    isDeathGodBoss, enemy, isFinalReveal, isEndingChoice,
    isDungeon, hasAdminHelmet, unlockedArtifacts, equippedArtifact, 
    currentHeroMaxHp, currentHeroMaxMana, heroHealthText, heroHealthPercent,
    worldBurn, equippedWeaponStyle, strongestNonBbiWeaponDamage, armorBonus, equippedArmorStyle
  } = useIsFuryDungeonState({ furyDungeonEntered, furyChoiceOpen, furyKingFightStarted, anuarWorldEntered, anuarKingFightStarted, mansurDungeonEntered, mansurKingFightStarted, arailmWorldEntered, arailmChoiceOpen, arailmKingFightStarted, aisWorldEntered, aisSharkFightStarted, aisFinalChoiceOpen, aisGodFightStarted, adminWorldEntered, adminWorldBossesStarted, adminFinalChoiceOpen, adminBossFightStarted, nuraliWorldEntered, nuraliChoiceOpen, nuraliBossFightStarted, bbiBossStage, bbiWorldEntered, bbiFinalChoiceOpen, monsterAvalancheEntered, monsterAvalancheEnding, deathGodFightStarted, chapter, isFinalSpiritBoss, isFinalSpiritWorld, isAdminBoss, isAdminWorldBosses, isAisGodBoss, isAisSharkBoss, isNuraliKingBoss, isArailmKingBoss, isMansurKingBoss, isAnuarKingBoss, isFuryKingBoss, isGoblinKingBoss, isFamilyBoss, isFinalBoss, victory, endingChoice, dungeon, equippedArmor, unlockedAchievements, equippedArtifactId, healthLevel, levelStatMultiplier, shopLevels, heroHp, savedCities, equippedWeapon, weapons });
  const {
    equippedIsHelmet, artifactLuckMultiplier, defenseBonus, artifactDamageMultiplier,
    artifactGoldMultiplier, artifactAttackSpeedMultiplier, waterSwordArtifactMultiplier, equippedWeaponDamage, reward,
    currentMonsters, musicKey, currentMonsterHp, nearestMonsterDistanceMeters,
    nearestMonsterInAggro, nearestMonsterInPressure, nearestMonsterInRange, kingDragonHp, finalSpiritDragonHp,
    deathGodHp, currentDragonHp, bbiLegendaryDamage, deathSwordMultiplier
  } = useEquippedIsHelmetState({ equippedArmor, equippedArtifact, items, armorBonus, levelStatMultiplier, equippedArtifactId, equippedWeapon, enemy, chapter, isDeathGodBoss, isFinalSpiritBoss, isAdminBoss, isAdminWorldBosses, isAisSharkBoss, isAisGodBoss, isNuraliKingBoss, isBbiBoss, isFinalBoss, isFamilyBoss, isGoblinKingBoss, isFuryKingBoss, isAnuarKingBoss, isMansurKingBoss, isArailmKingBoss, isFinalSpiritWorld, finalSpiritMonstersLeft, isMonsterAvalancheWorld, monsterAvalancheLeft, isAdminWorld, adminWorldMonstersLeft, isAisWorld, aisMonstersLeft, isNuraliWorld, nuraliMonstersLeft, isBbiWorld, bbiMonstersLeft, isArailmWorld, arailmMonstersLeft, isMansurDungeon, mansurMonstersLeft, isAnuarWorld, anuarBombsLeft, isFuryDungeon, furyMonstersLeft, isDungeon, dungeon, cityMonsters, isFinalReveal, nearestMonster, heroPosition, bbiBossStage, strongestNonBbiWeaponDamage });
  const {
    attackBonus, isClickDuelActive, clickDuelHeroPower,
    clickDuelDragonPower, playerName, dragonReaction, currentMonsterTotal, currentEnemyHealthText,
    introVoiceText, endingVoiceText, cityScene, forcedCenterLocation, mapSceneKey,
    useCityGoblinModel, collisionContextRef
  } = useWeaponBonusState({ equippedWeapon, bbiLegendaryDamage, equippedWeaponDamage, deathSwordMultiplier, items, waterSwordArtifactMultiplier, isFinalReveal, currentMonsters, enemyHp, heroHp, chapter, artifactDamageMultiplier, artifactAttackSpeedMultiplier, currentDragonHp, enemy, nickname, isFinalSpiritWorld, isMonsterAvalancheWorld, isAdminWorld, isAisWorld, isNuraliWorld, isBbiWorld, isArailmWorld, isMansurDungeon, isAnuarWorld, isFuryDungeon, isDungeon, currentMonsterHp, isArailmKingBoss, impossibleEnding, bbiBadEnding, secretEnding, isEndingChoice, endingChoice, isDeathGodBoss, isFinalSpiritBoss, isFinalBoss, isFamilyBoss, finalSpiritWorldOpen, isAdminWorldBosses, isAdminBoss, adminFinalChoiceOpen, isAisSharkBoss, isAisGodBoss, aisFinalChoiceOpen, mapLocationIndex });

  const {
    saveState
  } = useSaveStateState({ chapter, healthLevel, heroHp, enemyHp, message, savedCities, victory, endingChoice, secretEnding, goblinKingReady, goblinKingFightStarted, furyGateOpen, furyDungeonEntered, furyMonstersLeft, furyChoiceOpen, furyKingFightStarted, anuarGateOpen, anuarWorldEntered, anuarBombsLeft, anuarKingFightStarted, mansurGateOpen, mansurDungeonEntered, mansurMonstersLeft, mansurKingFightStarted, arailmGateOpen, arailmWorldEntered, arailmMonstersLeft, arailmChoiceOpen, arailmKingFightStarted, aisGateOpen, aisWorldEntered, aisMonstersLeft, aisSharkFightStarted, aisFinalChoiceOpen, aisGodFightStarted, adminWorldGateOpen, adminWorldEntered, adminWorldMonstersLeft, adminWorldBossesStarted, adminFinalChoiceOpen, adminBossFightStarted, bbiGateOpen, bbiWorldEntered, bbiMonstersLeft, bbiBossStage, bbiFinalChoiceOpen, bbiCityReward, bbiBadEnding, impossibleEnding, nuraliGateOpen, nuraliWorldEntered, nuraliMonstersLeft, nuraliChoiceOpen, nuraliBossFightStarted, monsterAvalancheEntered, monsterAvalancheLeft, monsterAvalancheEnding, finalSpiritWorldOpen, finalSpiritMonstersLeft, finalSpiritFightStarted, deathGodFightStarted, gold, goldMultiplier, infiniteGold, dungeon, relics, weapons, equippedWeapon, armors, equippedArmor, equippedArtifactId, heroMana, heroPosition, heroDirection, mapLocationIndex, cityMonsters, duelWins, items, shopLevels, introSkipped, paidQuestIds });
  const { ready: saveReady, status: saveStatus } = useGamePersistence({
    userId: authUser?.id, storageKey: saveStorageKey, initialSave, save: saveState, applySave: applyGameSave,
  });

  const { active: gameActive, activeRef: gameActiveRef, manualPause, setManualPause } = useGameActivity(
    Boolean(sceneReady && saveReady && (authUser || guestMode) && !isWorldPage && !isAchievementsPage && !creatorCreditsOpen
      && !tutorialOpen && !questPanelOpen && !inventoryPanelOpen && duelStatus === 'idle' && !incomingDuelRequest
      && !((!introSkipped) || (dungeon && !dungeon.entered && !dungeon.cleared && !dungeon.declined) || (bbiGateOpen && !bbiWorldEntered && !bbiBossStage && !bbiFinalChoiceOpen && !bbiCityReward) || (nuraliGateOpen && !nuraliWorldEntered && !nuraliChoiceOpen && !nuraliBossFightStarted) || (nuraliChoiceOpen) || (aisGateOpen && !aisWorldEntered && !aisSharkFightStarted && !aisFinalChoiceOpen && !aisGodFightStarted) || (aisFinalChoiceOpen) || (adminWorldGateOpen && !adminWorldEntered && !adminWorldBossesStarted && !adminFinalChoiceOpen && !adminBossFightStarted) || (adminFinalChoiceOpen) || (bbiFinalChoiceOpen) || (furyGateOpen && !furyDungeonEntered && !furyChoiceOpen && !furyKingFightStarted) || (anuarGateOpen && !anuarWorldEntered && !anuarKingFightStarted) || (mansurGateOpen && !mansurDungeonEntered && !mansurKingFightStarted) || (arailmGateOpen && !arailmWorldEntered && !arailmChoiceOpen && !arailmKingFightStarted) || (arailmChoiceOpen) || (furyChoiceOpen))),
    () => {
      pressedKeys.current.clear();
      movementVelocity.current = { x: 0, z: 0 };
      cameraPointer.current = null;
      resetJoystick();
    },
  );

  useCollisionContext({ collisionContextRef, chapter, mapLocationIndex, mapSceneKey });

  useForcedLocation({ forcedCenterLocation, setMapLocationIndex });
  const {
    battleScene
  } = useBattleSceneState({ isDeathGodBoss, isFinalSpiritBoss, finalSpiritWorldOpen, isAdminWorld, isAdminWorldBosses, isAdminBoss, adminFinalChoiceOpen, isAisWorld, isAisSharkBoss, isAisGodBoss, aisFinalChoiceOpen, isDungeon, isNuraliWorld, isNuraliKingBoss, nuraliChoiceOpen, isBbiWorld, isBbiBoss, bbiCityReward, isArailmWorld, isArailmKingBoss, isMansurDungeon, isMansurKingBoss, isAnuarWorld, isAnuarKingBoss, isFuryDungeon, isFuryKingBoss, isFamilyBoss, currentMonsters, isGoblinKingBoss, isFinalBoss, chapter, cityScene });

  function takeBossMagicHit(spell: string): void {
    return runTakeBossMagicHit({ gameActiveRef, isFinalReveal, heroHp, hasAdminHelmet, chapter, currentDragonHp, setHeroHp, setMessage, enemy }, spell);
  }
  const {
    dragonClass, defeatedMonsters, storyProgress, generatedQuests
  } = useDragonClassState({ isDeathGodBoss, isFinalSpiritBoss, isAdminBoss, isAdminWorldBosses, isAisGodBoss, isAisSharkBoss, isBbiBoss, isNuraliKingBoss, isFamilyBoss, isArailmKingBoss, isMansurKingBoss, isAnuarKingBoss, isFuryKingBoss, isGoblinKingBoss, isFinalBoss, chapter, cityMonsters, savedCities, weapons, relics });
  const {
    quests, activeQuest, visibleQuests, completedQuestCount, playerLevelState,
    playerLevel, playerLevelProgress, expectedLevelStatMultiplier, inventoryPreviewLimit, visibleWeapons,
    magicWeapons, visibleMagicWeapons, visibleArmors, visibleRelics, currentPlayerPower,
    hasArcaneWeapon, selectedSpell, selectedSpellRadiusMeters, selectedSpellSpeedKmh, arcaneSkillCooldownMs,
    arcaneSkillManaCost, arcaneSkillRemainingMs, arcaneSkillReady, arcaneSkillDamage, allAchievementsUnlocked
  } = useQuestsState({ generatedQuests, savedCities, isFinalReveal, endingChoice, isEndingChoice, secretEnding, goblinKingReady, defeatedMonsters, showFullInventory, weapons, armors, relics, attackBonus, defenseBonus, currentHeroMaxHp, equippedWeapon, selectedArcaneSpell, arcaneSkillReadyAt, arcaneCooldownNow, heroMana, equippedWeaponDamage, artifactDamageMultiplier, unlockedAchievements });

  useLevelStats({ setLevelStatMultiplier, expectedLevelStatMultiplier });

  function speakText(text: string, sceneKey: string): void {
    return runSpeakText({ lastSpokenSceneRef }, text, sceneKey);
  }

  function shouldSpeakMessage(text: string): boolean {
    return runShouldSpeakMessage(text);
  }

  function stopBossMusic(): void {
    return runStopBossMusic({ bossMusicStopRef });
  }

  function playBossMusic(sceneKey: string): void {
    return runPlayBossMusic({ bossMusicStopRef, audioContextRef }, sceneKey);
  }

  function unlockAchievement(id: AchievementId): void {
    return runUnlockAchievement({ setUnlockedAchievements }, id);
  }

  function submitAchievementCode(event: FormEvent<HTMLFormElement>): void {
    return runSubmitAchievementCode({ achievementCode, setUnlockedAchievements, setAchievementCheatActive, setAchievementCode, setAchievementMessage }, event);
  }

  function completeAchievement(id: AchievementId): void {
    return runCompleteAchievement({ achievementCheatActive, unlockAchievement, setAchievementMessage }, id);
  }

  function addGold(amount: number): void {
    return runAddGold({ infiniteGold, setGold, goldMultiplier, artifactGoldMultiplier }, amount);
  }

  function addWinStreak(reason: string): string {
    return runAddWinStreak({ winStreakState, chapter, addGold, setWeapons, setEquippedWeapon, setShopLevels, setItems, setHealthLevel, setHeroHp, currentHeroMaxHp, setWinStreakState, setWinStreakText }, reason);
  }

  function resetWinStreak(reason: string): void {
    return runResetWinStreak({ winStreakState, setWinStreakState, setWinStreakText }, reason);
  }

  function grantDailyReward(day: number): string {
    return runGrantDailyReward({ addGold, setShopLevels, setItems, setHealthLevel, setHeroHp, currentHeroMaxHp, chapter, setWeapons, setEquippedWeapon, setArmors, setEquippedArmor }, day);
  }

  function sellWeapon(weapon: Weapon): void {
    return runSellWeapon({ setWeapons, equippedWeapon, setEquippedWeapon, addGold, setMessage, goldMultiplier }, weapon);
  }

  function claimMagicStaffs(): void {
    return runClaimMagicStaffs({ weapons, chapter, setMessage, setWeapons, setEquippedWeapon });
  }

  function sellArmor(armor: Armor): void {
    return runSellArmor({ setArmors, equippedArmor, setEquippedArmor, addGold, setMessage, goldMultiplier }, armor);
  }

  function teleportToAchievement(id: AchievementId): void {
    return runTeleportToAchievement({ achievementCheatActive, setSavedCities, setCityMonsters, setIntroSkipped, setVictory, setEndingChoice, setSecretEnding, setGoblinKingReady, setGoblinKingFightStarted, setFuryGateOpen, setFuryDungeonEntered, setFuryChoiceOpen, setFuryKingFightStarted, setAnuarGateOpen, setAnuarWorldEntered, setAnuarKingFightStarted, setMansurGateOpen, setMansurDungeonEntered, setMansurKingFightStarted, setArailmGateOpen, setArailmWorldEntered, setArailmChoiceOpen, setArailmKingFightStarted, setAisGateOpen, setAisWorldEntered, setAisMonstersLeft, setAisSharkFightStarted, setAisFinalChoiceOpen, setAisGodFightStarted, setAdminWorldGateOpen, setAdminWorldEntered, setAdminWorldMonstersLeft, setAdminWorldBossesStarted, setAdminFinalChoiceOpen, setAdminBossFightStarted, setBbiGateOpen, setBbiWorldEntered, setBbiMonstersLeft, setBbiBossStage, setBbiFinalChoiceOpen, setBbiCityReward, setBbiBadEnding, setNuraliGateOpen, setNuraliWorldEntered, setNuraliMonstersLeft, setNuraliChoiceOpen, setNuraliBossFightStarted, setMonsterAvalancheEntered, setMonsterAvalancheLeft, setMonsterAvalancheEnding, setFinalSpiritWorldOpen, setFinalSpiritMonstersLeft, setFinalSpiritFightStarted, setDeathGodFightStarted, setImpossibleEnding, setHeroHp, currentHeroMaxHp, setHeroPosition, setHeroHeight, verticalVelocity, setEnemyBurning, setMonsterAttackCount, setChapter, setEnemyHp, kingDragonHp, setMessage, navigate, deathGodHp }, id);
  }

  useAchievementStorage({ unlockedAchievements });

  function applyGameSave(save: Partial<GameSaveState>): void {
    return runApplyGameSave({ setChapter, setHealthLevel, setHeroHp, currentHeroMaxHp, setEnemyHp, setMessage, setSavedCities, setVictory, setEndingChoice, setSecretEnding, setGoblinKingReady, setGoblinKingFightStarted, setFuryGateOpen, setFuryDungeonEntered, setFuryMonstersLeft, setFuryChoiceOpen, setFuryKingFightStarted, setAnuarGateOpen, setAnuarWorldEntered, setAnuarBombsLeft, setAnuarKingFightStarted, setMansurGateOpen, setMansurDungeonEntered, setMansurMonstersLeft, setMansurKingFightStarted, setArailmGateOpen, setArailmWorldEntered, setArailmMonstersLeft, setArailmChoiceOpen, setArailmKingFightStarted, setAisGateOpen, setAisWorldEntered, setAisMonstersLeft, setAisSharkFightStarted, setAisFinalChoiceOpen, setAisGodFightStarted, setAdminWorldGateOpen, setAdminWorldEntered, setAdminWorldMonstersLeft, setAdminWorldBossesStarted, setAdminFinalChoiceOpen, setAdminBossFightStarted, setBbiGateOpen, setBbiWorldEntered, setBbiMonstersLeft, setBbiBossStage, setBbiFinalChoiceOpen, setBbiCityReward, setBbiBadEnding, setImpossibleEnding, setNuraliGateOpen, setNuraliWorldEntered, setNuraliMonstersLeft, setNuraliChoiceOpen, setNuraliBossFightStarted, setMonsterAvalancheEntered, setMonsterAvalancheLeft, setMonsterAvalancheEnding, setFinalSpiritWorldOpen, setFinalSpiritMonstersLeft, setFinalSpiritFightStarted, setDeathGodFightStarted, setGold, setGoldMultiplier, setInfiniteGold, setDungeon, setRelics, setWeapons, setEquippedWeapon, setArmors, setEquippedArmor, setEquippedArtifactId, setHeroMana, setHeroPosition, setHeroDirection, setMapLocationIndex, setCityMonsters, setDuelWins, setItems, setShopLevels, setIntroSkipped, paidQuestIds }, save);
  }



  useCreatorCredits({ allAchievementsUnlocked, creatorCreditsOpen, setCreatorCreditsOpen });

  useBossMusic({ stopBossMusic, playBossMusic, musicKey });

  useIntroVoice({ introSkipped, guestMode, authUser, speakText, introVoiceText });

  useEndingVoice({ endingVoiceText, speakText, bbiBadEnding, secretEnding, endingChoice, impossibleEnding });

  useMessageVoice({ introSkipped, endingVoiceText, lastMessageVoiceAtRef, shouldSpeakMessage, message, speakText });

  useAudioCleanup({ stopBossMusic });



  useQuestRewards({ saveReady, quests, paidQuestIds, chapter, addGold, setWeapons, setEquippedWeapon, setArmors, setEquippedArmor, setMessage, storyProgress, savedCities, isFinalReveal, endingChoice, secretEnding });

  useHeroRespawn({ heroHp, isFinalReveal, isMonsterAvalancheWorld, isFinalSpiritWorld, isFinalSpiritBoss, resetWinStreak, restart, setMessage });

  useSpiritRespawn({ heroHp, isFinalSpiritWorld, isFinalSpiritBoss, setHeroHp, currentHeroMaxHp, setMessage });

  useDailyReward({ saveReady, dailyRewardCheckedRef, setDailyRewardState, setDailyRewardText, grantDailyReward, setMessage });

  function buy(item: ShopItem): void {
    return runBuy({ shopLevels, infiniteGold, gold, setMessage, setGold, setItems, items, setShopLevels, setHealthLevel, setHeroHp, currentHeroMaxHp, setHeroMana, currentHeroMaxMana }, item);
  }

  function playHeroAnimation(animation: HeroAnimation, duration = 520): void {
    return runPlayHeroAnimation({ heroAnimation, heroAnimationTimer, setHeroAnimation }, animation, duration);
  }

  function closeTutorial(): void {
    return runCloseTutorial({ setTutorialOpen });
  }

  function setCurrentMonsterCount(nextMonsters: number): void {
    return runSetCurrentMonsterCount({ isAdminWorld, setAdminWorldMonstersLeft, isFinalSpiritWorld, setFinalSpiritMonstersLeft, isMonsterAvalancheWorld, setMonsterAvalancheLeft, isBbiWorld, setBbiMonstersLeft, isNuraliWorld, setNuraliMonstersLeft, isAisWorld, setAisMonstersLeft, isArailmWorld, setArailmMonstersLeft, isMansurDungeon, setMansurMonstersLeft, isAnuarWorld, setAnuarBombsLeft, isFuryDungeon, setFuryMonstersLeft, isDungeon, dungeon, setDungeon, setCityMonsters, cityMonsters, chapter }, nextMonsters);
  }

  function equipArtifact(artifact: Artifact): void {
    return runEquipArtifact({ currentHeroMaxHp, setEquippedArtifactId, setHeroHp, playHeroAnimation, setMessage }, artifact);
  }

  function moveHero(dx: number, dz: number): void {
    return runMoveHero({ setHeroPosition, collisionContextRef }, dx, dz);
  }

  function moveMonsterAroundObjects(monster: NearestMonsterState, dx: number, dz: number): NearestMonsterState {
    return runMoveMonsterAroundObjects({ collisionContextRef }, monster, dx, dz);
  }

  function updateJoystick(event: ReactPointerEvent<HTMLDivElement>): void {
    return runUpdateJoystick({ joystickVector, setJoystickThumb }, event);
  }

  function startJoystick(event: ReactPointerEvent<HTMLDivElement>): void {
    return runStartJoystick({ gameActiveRef, joystickPointerId, updateJoystick }, event);
  }

  function moveJoystick(event: ReactPointerEvent<HTMLDivElement>): void {
    return runMoveJoystick({ joystickPointerId, updateJoystick }, event);
  }

  function stopJoystick(event: ReactPointerEvent<HTMLDivElement>): void {
    return runStopJoystick({ joystickPointerId, resetJoystick }, event);
  }

  function resetJoystick(): void {
    return runResetJoystick({ joystickPointerId, joystickVector, setJoystickThumb, setHeroMoving });
  }

  function updateCameraYaw(nextYaw: number): void {
    return runUpdateCameraYaw({ cameraYawRef, setCameraYaw }, nextYaw);
  }

  function startCameraDrag(event: ReactPointerEvent<HTMLDivElement>): void {
    return runStartCameraDrag({ gameActiveRef, cameraPointer }, event);
  }

  function moveCameraDrag(event: ReactPointerEvent<HTMLDivElement>): void {
    return runMoveCameraDrag({ cameraPointer, updateCameraYaw, cameraYawRef }, event);
  }

  function stopCameraDrag(event: ReactPointerEvent<HTMLDivElement>): void {
    return runStopCameraDrag({ cameraPointer, blockNextStageClick }, event);
  }

  function attackFromStageClick(): void {
    return runAttackFromStageClick({ gameActiveRef, blockNextStageClick, currentMonsters, fightMonster, strike });
  }

  useMovementLoop({ gameActiveRef, lastMoveAt, pressedKeys, joystickVector, cameraYawRef, movementVelocity, setHeroMoving, setHeroDirection, moveHero });

  useGravity({ gameActiveRef, setHeroHeight, verticalVelocity });

  function makeNearestMonsterSpawn(hp = currentMonsterHp): NearestMonsterState {
    return runMakeNearestMonsterSpawn({ currentMonsterHp, heroDirection, collisionContextRef, heroPosition, currentMonsters }, hp);
  }

  function fightMonster(): void {
    return runFightMonster({ gameActiveRef, isFinalReveal, heroHp, currentMonsters, setMessage, playHeroAnimation, setBattlePulse, equippedWeapon, setWaterWavePulse, setNukePulse, isBbiWorld, setBbiMonstersLeft, setBbiWorldEntered, setBbiBossStage, setEnemyHp, isNuraliWorld, setNuraliMonstersLeft, setNuraliWorldEntered, setNuraliChoiceOpen, isMonsterAvalancheWorld, finishMonsterAvalanche, isFinalSpiritWorld, setFinalSpiritMonstersLeft, setFinalSpiritFightStarted, finalSpiritDragonHp, setHeroHp, currentHeroMaxHp, isArailmWorld, setArailmMonstersLeft, setArailmWorldEntered, setArailmChoiceOpen, isAisWorld, setAisMonstersLeft, setAisWorldEntered, setAisSharkFightStarted, isAdminWorld, setAdminWorldMonstersLeft, setAdminWorldEntered, setAdminWorldBossesStarted, isMansurDungeon, setMansurMonstersLeft, setMansurDungeonEntered, setMansurKingFightStarted, currentDragonHp, isAnuarWorld, setAnuarBombsLeft, setAnuarWorldEntered, setAnuarKingFightStarted, isFuryDungeon, setFuryMonstersLeft, setFuryDungeonEntered, setFuryChoiceOpen, setWeapons, setEquippedWeapon, isDungeon, dungeon, setDungeon, setGoblinKingReady, setGoblinKingFightStarted, setCityMonsters, cityMonsters, chapter, addGold, heroPosition, nearestMonsterRef, items, shopLevels, artifactAttackSpeedMultiplier, attackBonus, artifactDamageMultiplier, setNearestMonster, nearestMonsterDistanceMeters, artifactLuckMultiplier, setMonsterAvalancheLeft, makeNearestMonsterSpawn, currentMonsterHp, addWinStreak, weapons, setArmors, armors, equippedArmor, setEquippedArmor, currentMonsterTotal });
  }

  function finishMonsterAvalanche(): void {
    return runFinishMonsterAvalanche({ setMonsterAvalancheEntered, setMonsterAvalancheLeft, setMonsterAvalancheEnding, setSecretEnding, setVictory, setChapter, setSavedCities, setHeroHp, currentHeroMaxHp, unlockAchievement, addGold, setMessage, navigate });
  }

  function clearCity(): void {
    return runClearCity({ enemy, setEnemyBurning, addWinStreak, currentMonsters, isDeathGodBoss, setDeathGodFightStarted, setVictory, setSecretEnding, unlockAchievement, setChapter, setWeapons, setEquippedWeapon, setEquippedArtifactId, addGold, setMessage, navigate, isBbiBoss, bbiBossStage, setBbiBossStage, setEnemyHp, setBbiFinalChoiceOpen, setBbiGateOpen, setBbiBadEnding, isNuraliKingBoss, setNuraliGateOpen, setNuraliWorldEntered, setNuraliChoiceOpen, setNuraliBossFightStarted, setImpossibleEnding, isAisSharkBoss, setAisSharkFightStarted, setAisFinalChoiceOpen, isAisGodBoss, setAisGateOpen, setAisWorldEntered, setAisGodFightStarted, isAdminWorldBosses, setAdminWorldBossesStarted, setAdminFinalChoiceOpen, isAdminBoss, setAdminWorldGateOpen, setAdminWorldEntered, setAdminBossFightStarted, isArailmKingBoss, setArailmGateOpen, setArailmWorldEntered, setArailmChoiceOpen, setArailmKingFightStarted, isMansurKingBoss, setMansurGateOpen, setMansurDungeonEntered, setMansurKingFightStarted, isAnuarKingBoss, setAnuarGateOpen, setAnuarWorldEntered, setAnuarKingFightStarted, isFuryKingBoss, setFuryGateOpen, setFuryDungeonEntered, setFuryChoiceOpen, setFuryKingFightStarted, isGoblinKingBoss, setGoblinKingReady, setGoblinKingFightStarted, isFamilyBoss, setEndingChoice, isFinalSpiritBoss, setFinalSpiritWorldOpen, setFinalSpiritMonstersLeft, setFinalSpiritFightStarted, deathGodHp, setHeroHp, currentHeroMaxHp, isFinalBoss, finalSpiritDragonHp, savedCities, reward, chapter, setMonsterAvalancheEntered, setMonsterAvalancheLeft, setSavedCities, dungeon, setDungeon, weapons, equippedWeapon, setArmors, armors, equippedArmor, setEquippedArmor, heroHp });
  }

  useKeyboardMovement({ gameActiveRef, pressedKeys, verticalVelocity, playHeroAnimation, resetJoystick, movementVelocity, setHeroMoving, setTutorialOpen });

  useKeyboardAttack({ gameActiveRef, currentMonsters, fightMonster, strike, heroHp, heroPosition, enemyHp, equippedWeapon, equippedArtifactId, items, shopLevels });

  useMonsterSpawn({ setMonsterAttackCount, monsterChaseStartedAt, setNearestMonster, currentMonsters, makeNearestMonsterSpawn, currentMonsterHp, nearestMonsterRef, chapter });

  useMonsterReference({ nearestMonsterRef, nearestMonster });

  useMonsterChase({ setNearestMonster, gameActiveRef, currentMonsters, heroHp, isFinalReveal, heroPosition, moveMonsterAroundObjects });

  useMonsterState({ monsterBotRef, chapter, currentMonsters, currentMonsterTotal, defenseBonus, hasAdminHelmet, heroHp, heroPosition, isFinalReveal, nearestMonsterInAggro, nearestMonsterInPressure, nearestMonsterInRange });

  useMonsterAttacks({ gameActiveRef, monsterBotRef, monsterChaseStartedAt, setBattlePulse, setMonsterAttackCount, setHeroHp, setMessage });

  useEnemyBurn({ enemyBurning, isFinalReveal, currentMonsters, enemyHp, gameActiveRef, setEnemyHp, currentDragonHp, setEnemyBurning, clearCity });

  useClickDuel({ isClickDuelActive, setClickDuelPower, setClicksPerSecond, clickTimesRef, gameActiveRef, enemy });

  useSpellCooldown({ hasArcaneWeapon, arcaneSkillRemainingMs, setArcaneCooldownNow });

  useManaRegeneration({ setHeroMana, currentHeroMaxMana });

  useManaLimit({ setHeroMana, currentHeroMaxMana });

  function castArcaneSkill(): void {
    return runCastArcaneSkill({ gameActiveRef, hasArcaneWeapon, isFinalReveal, enemy, arcaneSkillReady, playHeroAnimation, setBattlePulse, setArcanePulse, selectedSpell, setArcaneBurstPulse, setHeroMana, arcaneSkillManaCost, setArcaneSkillReadyAt, arcaneSkillCooldownMs, setArcaneCooldownNow, currentMonsters, selectedSpellRadiusMeters, selectedSpellSpeedKmh, arcaneSkillDamage, currentMonsterHp, setCurrentMonsterCount, setNearestMonster, makeNearestMonsterSpawn, nearestMonsterRef, addGold, chapter, addWinStreak, setEnemyHp, currentDragonHp, setMessage, enemyHp, clearCity });
  }

  function strike(): void {
    return runStrike({ gameActiveRef, isFinalReveal, enemy, currentMonsters, setMessage, playHeroAnimation, setBattlePulse, clickTimesRef, setClicksPerSecond, setClickDuelPower, clickDuelHeroPower, clickDuelDragonPower, equippedWeapon, setFireWavePulse, setEnemyBurning, setWaterWavePulse, hasArcaneWeapon, setArcanePulse, enemyHp, setSoulFirePulse, setHeroHp, currentHeroMaxHp, setEnemyHp, clearCity, setNukePulse, isBbiBoss, shopLevels, equippedWeaponDamage, chapter, attackBonus, artifactDamageMultiplier, artifactAttackSpeedMultiplier, dragonReaction });
  }

  function submitAdminCode(event: FormEvent<HTMLFormElement>): void {
    return runSubmitAdminCode({ adminCode, setFuryGateOpen, setFuryDungeonEntered, setFuryMonstersLeft, setFuryChoiceOpen, setFuryKingFightStarted, setAdminCode, setMessage, navigate, setAnuarGateOpen, setAnuarWorldEntered, setAnuarBombsLeft, setAnuarKingFightStarted, setMansurGateOpen, setMansurDungeonEntered, setMansurMonstersLeft, setMansurKingFightStarted, setNuraliGateOpen, setNuraliWorldEntered, setNuraliMonstersLeft, setNuraliChoiceOpen, setNuraliBossFightStarted, openArailmWorld, setAisGateOpen, setAisWorldEntered, setAisMonstersLeft, setAisSharkFightStarted, setAisFinalChoiceOpen, setAisGodFightStarted, chapter, setWeapons, setEquippedWeapon, setAdminWorldGateOpen, setAdminWorldEntered, setAdminWorldMonstersLeft, setAdminWorldBossesStarted, setAdminFinalChoiceOpen, setAdminBossFightStarted, setBbiGateOpen, setBbiWorldEntered, setBbiMonstersLeft, setBbiBossStage, setBbiFinalChoiceOpen, setBbiCityReward, setArmors, setEquippedArmor, setHeroHp, setGold, setGoldMultiplier, setInfiniteGold }, event);
  }

  function openArailmWorld(): void {
    return runOpenArailmWorld({ setFuryGateOpen, setAnuarGateOpen, setMansurGateOpen, setArailmGateOpen, setArailmWorldEntered, setArailmMonstersLeft, setArailmChoiceOpen, setArailmKingFightStarted, setAisGateOpen, setAisWorldEntered, setAisMonstersLeft, setAisSharkFightStarted, setAisFinalChoiceOpen, setAisGodFightStarted, setAdminCode, setMessage, navigate });
  }

  function enterDungeon(): void {
    return runEnterDungeon({ dungeon, setDungeon, setMessage, navigate });
  }

  function exitDungeon(): void {
    return runExitDungeon({ dungeon, setDungeon, setMessage });
  }

  function declineDungeon(): void {
    return runDeclineDungeon({ dungeon, setDungeon, setMessage });
  }

  function startDuelSearch(): void {
    return runStartDuelSearch({ duelStatus, duelTargetId, setDuelTargetId, playerId, setMessage, onlinePlayers, setDuelStatus, setDuelOpponent, setDuelChatMessages, playerName });
  }

  function selectDuelPlayer(player: DuelPlayer): void {
    return runSelectDuelPlayer({ setDuelTargetId, setDuelOpponent, setDuelTradeOpen, setDuelTradeOffer, setDuelStatus, setDuelChatMessages, setMessage }, player);
  }

  function closeDuelList(): void {
    return runCloseDuelList({ setDuelStatus, setDuelOpponent, setDuelTradeOpen, setDuelTradeOffer, setDuelChatMessages, setDuelChatText, setMessage });
  }

  function scheduleOnlineListReturn(): void {
    return runScheduleOnlineListReturn({ onlinePlayerScrollTimer, onlinePlayerListRef });
  }

  function declineDuel(): void {
    return runDeclineDuel({ setDuelStatus, setDuelTradeOpen, setDuelTradeOffer, setMessage });
  }

  function clearIncomingDuelRequest(): void {
    return runClearIncomingDuelRequest({ incomingDuelRequest, setIncomingDuelRequest });
  }

  function acceptIncomingDuelRequest(): void {
    return runAcceptIncomingDuelRequest({ incomingDuelRequest, onlinePlayers, currentPlayerPower, setDuelOpponent, setDuelTargetId, setDuelChatMessages, setDuelStatus, setDuelTradeOpen, setMessage, setDuelHeroHp, currentHeroMaxHp, defenseBonus, attackBonus, setDuelOpponentHp, clearIncomingDuelRequest });
  }

  function rejectIncomingDuelRequest(): void {
    return runRejectIncomingDuelRequest({ incomingDuelRequest, clearIncomingDuelRequest, setMessage });
  }

  function acceptDuel(): void {
    return runAcceptDuel({ duelOpponent, playerId, playerName, setDuelStatus, setDuelTradeOpen, setDuelTradeOffer, setDuelHeroHp, currentHeroMaxHp, defenseBonus, attackBonus, setDuelOpponentHp, setBattlePulse, playHeroAnimation, setMessage });
  }

  function duelHit(): void {
    return runDuelHit({ duelOpponent, duelStatus, attackBonus, weapons, artifactDamageMultiplier, defenseBonus, duelOpponentHp, setBattlePulse, playHeroAnimation, setDuelOpponentHp, setDuelWins, addGold, addWinStreak, setDuelStatus, setMessage, playerName, duelHeroHp, setDuelHeroHp, resetWinStreak });
  }

  function rejectDuelTrade(): void {
    return runRejectDuelTrade({ setDuelTradeOffer, setDuelTradeOpen, setMessage });
  }

  function acceptDuelTrade(): void {
    return runAcceptDuelTrade({ duelOpponent, duelTradeOffer, setMessage, setWeapons, equippedWeapon, setEquippedWeapon, setDuelTradeOffer, setDuelTradeOpen, setArmors, equippedArmor, setEquippedArmor });
  }

  function openDuelTrade(): void {
    return runOpenDuelTrade({ duelOpponent, setMessage, playerId, playerName, setDuelTradeOpen, setDuelTradeOffer });
  }

  function sendDuelChat(event: FormEvent<HTMLFormElement>): void {
    return runSendDuelChat({ duelOpponent, setMessage, duelChatText, setDuelChatMessages, playerName, playerId, setDuelChatText }, event);
  }

  useDuelSearch({ duelStatus, onlinePlayers, duelWins, chapter, weapons, armors, setDuelOpponent, setDuelChatMessages, setDuelStatus, setMessage });

  useNickname({ playerName });

  useOnlinePresence({ authUser, guestMode, playerId, playerName, currentPlayerPower, equippedWeapon, equippedArmor, setLeaderboardPlayers, setOnlinePlayers });

  useDuelRequests({ setIncomingDuelRequest, playerId });

  function restart(): void {
    return runRestart({ unlockedAchievements, setChapter, setHealthLevel, setHeroHp, setEnemyHp, setMessage, setSavedCities, setVictory, setEndingChoice, setSecretEnding, setGoblinKingReady, setGoblinKingFightStarted, setFuryGateOpen, setFuryDungeonEntered, setFuryMonstersLeft, setFuryChoiceOpen, setFuryKingFightStarted, setAnuarGateOpen, setAnuarWorldEntered, setAnuarBombsLeft, setAnuarKingFightStarted, setMansurGateOpen, setMansurDungeonEntered, setMansurMonstersLeft, setMansurKingFightStarted, setArailmGateOpen, setArailmWorldEntered, setArailmMonstersLeft, setArailmChoiceOpen, setArailmKingFightStarted, setAisGateOpen, setAisWorldEntered, setAisMonstersLeft, setAisSharkFightStarted, setAisFinalChoiceOpen, setAisGodFightStarted, setAdminWorldGateOpen, setAdminWorldEntered, setAdminWorldMonstersLeft, setAdminWorldBossesStarted, setAdminFinalChoiceOpen, setAdminBossFightStarted, setBbiGateOpen, setBbiWorldEntered, setBbiMonstersLeft, setBbiBossStage, setBbiFinalChoiceOpen, setBbiCityReward, setBbiBadEnding, setNuraliGateOpen, setNuraliWorldEntered, setNuraliMonstersLeft, setNuraliChoiceOpen, setNuraliBossFightStarted, setMonsterAvalancheEntered, setMonsterAvalancheLeft, setMonsterAvalancheEnding, setFinalSpiritWorldOpen, setFinalSpiritMonstersLeft, setFinalSpiritFightStarted, setGold, setGoldMultiplier, setInfiniteGold, setDungeon, setRelics, setWeapons, setEquippedWeapon, setArmors, setEquippedArmor, setShopTab, setHeroAnimation, setHeroPosition, setHeroHeight, verticalVelocity, setCityMonsters, setMonsterAttackCount, setBattlePulse, setFireWavePulse, setWaterWavePulse, setEnemyBurning, setDuelStatus, setDuelOpponent, setDuelWins, setDuelHeroHp, setDuelOpponentHp, setDuelTradeOpen, setDuelChatMessages, setDuelChatText, paidQuestIds, setItems, setShopLevels });
  }

  const {
    incomingRequestPlayer
  } = useIncomingRequestPlayerState({ incomingDuelRequest, onlinePlayers, currentPlayerPower });
  return {
    setSceneReady, sceneReady,
    saveReady, creatorCreditsOpen, setCreatorCreditsOpen, navigate, isAchievementsPage,
    submitAchievementCode, setAchievementCode, achievementCode, allAchievementsUnlocked, achievementMessage,
    unlockedAchievements, achievementCheatActive, completeAchievement, teleportToAchievement, introSkipped,
    setIntroSkipped, dungeon, enterDungeon, heroHp, declineDungeon,
    bbiGateOpen, bbiWorldEntered, bbiBossStage, bbiFinalChoiceOpen, bbiCityReward,
    setBbiWorldEntered, setBbiMonstersLeft, setMessage, setBbiGateOpen, nuraliGateOpen,
    nuraliWorldEntered, nuraliChoiceOpen, nuraliBossFightStarted, setNuraliWorldEntered, setNuraliMonstersLeft,
    setNuraliGateOpen, setNuraliChoiceOpen, setNuraliBossFightStarted, setEnemyHp, aisGateOpen,
    aisWorldEntered, aisSharkFightStarted, aisFinalChoiceOpen, aisGodFightStarted, setAisWorldEntered,
    setAisMonstersLeft, setAisGateOpen, setAisFinalChoiceOpen, setAisGodFightStarted, weapons,
    setWeapons, setEquippedWeapon, setSavedCities, setChapter, adminWorldGateOpen,
    adminWorldEntered, adminWorldBossesStarted, adminFinalChoiceOpen, adminBossFightStarted, setAdminWorldEntered,
    setAdminWorldMonstersLeft, setAdminWorldGateOpen, setAdminFinalChoiceOpen, setAdminBossFightStarted, setBbiFinalChoiceOpen,
    setBbiBossStage, setBbiCityReward, furyGateOpen, furyDungeonEntered, furyChoiceOpen,
    furyKingFightStarted, setFuryDungeonEntered, setFuryMonstersLeft, setFuryGateOpen, anuarGateOpen,
    anuarWorldEntered, anuarKingFightStarted, setAnuarWorldEntered, setAnuarBombsLeft, setAnuarGateOpen,
    mansurGateOpen, mansurDungeonEntered, mansurKingFightStarted, setMansurDungeonEntered, setMansurMonstersLeft,
    setMansurGateOpen, arailmGateOpen, arailmWorldEntered, arailmChoiceOpen, arailmKingFightStarted,
    setArailmWorldEntered, setArailmMonstersLeft, setArailmGateOpen, setArailmChoiceOpen, setArailmKingFightStarted,
    setFuryChoiceOpen, setFuryKingFightStarted, currentDragonHp, restart, isWorldPage,
    manualPause, setManualPause, tutorialOpen, closeTutorial, gameActive,
    attackFromStageClick, verticalVelocity, playHeroAnimation, setTutorialOpen, battleScene,
    battlePulse, currentMonsters, fightMonster, strike, startCameraDrag,
    moveCameraDrag, stopCameraDrag, mapSceneKey, enemy, heroAnimation,
    heroMoving, isFinalReveal, worldBurn, heroPosition, heroHeight,
    heroDirection, cameraYaw, nearestMonster, currentMonsterTotal, useCityGoblinModel,
    chapter, mapLocationIndex, equippedArtifact, equippedWeaponStyle, hasArcaneWeapon,
    selectedArcaneSpell, arcanePulse, arcaneBurstPulse, takeBossMagicHit, isClickDuelActive,
    clickDuelHeroPower, clicksPerSecond, clickDuelPower, clickDuelDragonPower, isFinalSpiritWorld,
    isAdminWorld, isAisWorld, isNuraliWorld, isBbiWorld, isArailmWorld,
    isMansurDungeon, isAnuarWorld, isFuryDungeon, nukePulse, fireWavePulse,
    waterWavePulse, soulFirePulse, equippedArmorStyle, equippedArmor, equippedIsHelmet,
    isGoblinKingBoss, isFuryKingBoss, isAnuarKingBoss, isMansurKingBoss, isArailmKingBoss,
    isAisSharkBoss, isAisGodBoss, isAdminWorldBosses, isAdminBoss, isDeathGodBoss,
    isFinalSpiritBoss, isFinalBoss, dragonClass, enemyBurning, startJoystick,
    moveJoystick, stopJoystick, resetJoystick, joystickThumb, setSelectedArcaneSpell,
    selectedSpell, selectedSpellRadiusMeters, selectedSpellSpeedKmh, arcaneSkillReady, castArcaneSkill,
    heroMana, arcaneSkillManaCost, arcaneSkillRemainingMs, duelStatus, playerName,
    setDuelStatus, duelOpponent, playerId, acceptDuel, declineDuel,
    openDuelTrade, duelHeroHp, currentHeroMaxHp, defenseBonus, attackBonus,
    duelOpponentHp, duelHit, duelWins, startDuelSearch, duelTradeOpen,
    armors, duelTradeOffer, setDuelTradeOffer, acceptDuelTrade, rejectDuelTrade,
    closeDuelList, scheduleOnlineListReturn, onlinePlayerListRef, onlinePlayers, selectDuelPlayer,
    leaderboardPlayers, duelChatMessages, sendDuelChat, setDuelChatText, duelChatText,
    incomingDuelRequest, incomingRequestPlayer, acceptIncomingDuelRequest, rejectIncomingDuelRequest, playerLevel,
    playerLevelState, playerLevelProgress, heroHealthText, heroHealthPercent, currentHeroMaxMana,
    infiniteGold, gold, currentEnemyHealthText, setQuestPanelOpen, setInventoryPanelOpen,
    claimMagicStaffs, questPanelOpen, completedQuestCount, quests, visibleQuests,
    activeQuest, inventoryPanelOpen, relics, setShowFullInventory, showFullInventory,
    visibleMagicWeapons, equippedWeapon, visibleWeapons, visibleArmors, setEquippedArmor,
    visibleRelics, saveStatus, message, dailyRewardText, dailyRewardState,
    winStreakState, winStreakText, impossibleEnding, bbiBadEnding, secretEnding,
    isEndingChoice, endingChoice, setEndingChoice, kingDragonHp, setHeroHp,
    unlockAchievement, savedCities, defeatedMonsters, isBbiBoss, enemyHp,
    dragonReaction, goldMultiplier, hasAdminHelmet, reward, healthLevel,
    currentMonsterHp, bbiLegendaryDamage, exitDungeon, goblinKingReady, goblinKingFightStarted,
    setGoblinKingReady, shopTab, unlockedArtifacts, setShopTab, shopLevels,
    buy, equippedArtifactId, equipArtifact, submitAdminCode, setAdminCode,
    adminCode, setDuelTargetId, duelTargetId, magicWeapons, inventoryPreviewLimit,
    sellWeapon, sellArmor, cityMonsters, gameActiveRef, lastSpokenSceneRef,
    bossMusicStopRef, audioContextRef, setUnlockedAchievements, setAchievementCheatActive, setAchievementMessage,
    setGold, artifactGoldMultiplier, addGold, setShopLevels, setItems,
    setHealthLevel, setWinStreakState, setWinStreakText, setArmors, setCityMonsters,
    setVictory, setSecretEnding, setGoblinKingFightStarted, setAnuarKingFightStarted, setMansurKingFightStarted,
    setAisSharkFightStarted, setAdminWorldBossesStarted, setBbiBadEnding, setMonsterAvalancheEntered, setMonsterAvalancheLeft,
    setMonsterAvalancheEnding, setFinalSpiritWorldOpen, setFinalSpiritMonstersLeft, setFinalSpiritFightStarted, setDeathGodFightStarted,
    setImpossibleEnding, setHeroPosition, setHeroHeight, setEnemyBurning, setMonsterAttackCount,
    deathGodHp, setGoldMultiplier, setInfiniteGold, setDungeon, setRelics,
    setEquippedArtifactId, setHeroMana, setHeroDirection, setMapLocationIndex, setDuelWins,
    paidQuestIds, items, heroAnimationTimer, setHeroAnimation, isMonsterAvalancheWorld,
    isDungeon, collisionContextRef, joystickVector, setJoystickThumb, joystickPointerId,
    updateJoystick, setHeroMoving, cameraYawRef, setCameraYaw, cameraPointer,
    updateCameraYaw, blockNextStageClick, setBattlePulse, setWaterWavePulse, setNukePulse,
    finishMonsterAvalanche, finalSpiritDragonHp, nearestMonsterRef, artifactAttackSpeedMultiplier, artifactDamageMultiplier,
    setNearestMonster, nearestMonsterDistanceMeters, artifactLuckMultiplier, makeNearestMonsterSpawn, addWinStreak,
    isNuraliKingBoss, isFamilyBoss, setArcanePulse, setArcaneBurstPulse, setArcaneSkillReadyAt,
    arcaneSkillCooldownMs, setArcaneCooldownNow, arcaneSkillDamage, setCurrentMonsterCount, clearCity,
    clickTimesRef, setClicksPerSecond, setClickDuelPower, setFireWavePulse, setSoulFirePulse,
    equippedWeaponDamage, openArailmWorld, setDuelOpponent, setDuelChatMessages, setDuelTradeOpen,
    onlinePlayerScrollTimer, setIncomingDuelRequest, currentPlayerPower, setDuelHeroHp, setDuelOpponentHp,
    clearIncomingDuelRequest, resetWinStreak, forcedCenterLocation, setLevelStatMultiplier, expectedLevelStatMultiplier,
    stopBossMusic, playBossMusic, musicKey, guestMode, authUser,
    speakText, introVoiceText, endingVoiceText, lastMessageVoiceAtRef, shouldSpeakMessage,
    storyProgress, dailyRewardCheckedRef, setDailyRewardState, setDailyRewardText, grantDailyReward,
    lastMoveAt, pressedKeys, movementVelocity, moveHero, monsterChaseStartedAt,
    moveMonsterAroundObjects, monsterBotRef, nearestMonsterInAggro, nearestMonsterInPressure, nearestMonsterInRange,
    setLeaderboardPlayers, setOnlinePlayers
  };
}

export type GameViewModel = ReturnType<typeof useGameController>;
