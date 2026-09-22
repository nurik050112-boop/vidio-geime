
type Input = {
  isDeathGodBoss: boolean;
  isFinalSpiritBoss: boolean;
  finalSpiritWorldOpen: boolean;
  isAdminWorld: boolean;
  isAdminWorldBosses: boolean;
  isAdminBoss: boolean;
  adminFinalChoiceOpen: boolean;
  isAisWorld: boolean;
  isAisSharkBoss: boolean;
  isAisGodBoss: boolean;
  aisFinalChoiceOpen: boolean;
  isDungeon: boolean | undefined;
  isNuraliWorld: boolean;
  isNuraliKingBoss: boolean;
  nuraliChoiceOpen: boolean;
  isBbiWorld: boolean;
  isBbiBoss: boolean;
  bbiCityReward: boolean;
  isArailmWorld: boolean;
  isArailmKingBoss: boolean;
  isMansurDungeon: boolean;
  isMansurKingBoss: boolean;
  isAnuarWorld: boolean;
  isAnuarKingBoss: boolean;
  isFuryDungeon: boolean;
  isFuryKingBoss: boolean;
  isFamilyBoss: boolean;
  currentMonsters: number;
  isGoblinKingBoss: boolean;
  isFinalBoss: boolean;
  chapter: number;
  cityScene: string;
};
type State = {
  battleScene: string;
};

export function useBattleSceneState(input: Input): State {
  const { isDeathGodBoss, isFinalSpiritBoss, finalSpiritWorldOpen, isAdminWorld, isAdminWorldBosses, isAdminBoss, adminFinalChoiceOpen, isAisWorld, isAisSharkBoss, isAisGodBoss, aisFinalChoiceOpen, isDungeon, isNuraliWorld, isNuraliKingBoss, nuraliChoiceOpen, isBbiWorld, isBbiBoss, bbiCityReward, isArailmWorld, isArailmKingBoss, isMansurDungeon, isMansurKingBoss, isAnuarWorld, isAnuarKingBoss, isFuryDungeon, isFuryKingBoss, isFamilyBoss, currentMonsters, isGoblinKingBoss, isFinalBoss, chapter, cityScene } = input;

  const battleScene = isDeathGodBoss
    ? 'scene-death-god'
    : isFinalSpiritBoss || finalSpiritWorldOpen
    ? 'scene-underground-spirit'
    : isAdminWorld || isAdminWorldBosses || isAdminBoss || adminFinalChoiceOpen
    ? 'scene-admin'
    : isAisWorld || isAisSharkBoss || isAisGodBoss || aisFinalChoiceOpen
    ? 'scene-ais'
    : isDungeon
    ? 'scene-dungeon'
    : isNuraliWorld || isNuraliKingBoss
      ? 'scene-nurali'
    : isNuraliWorld || isNuraliKingBoss || nuraliChoiceOpen
      ? 'scene-nurali'
    : isBbiWorld || isBbiBoss || bbiCityReward
      ? 'scene-bbi'
    : isArailmWorld || isArailmKingBoss
      ? 'scene-arailm'
      : isMansurDungeon || isMansurKingBoss
      ? 'scene-mansur'
      : isAnuarWorld || isAnuarKingBoss
      ? 'scene-anuar'
      : isFuryDungeon || isFuryKingBoss
        ? 'scene-fury'
      : isFamilyBoss
      ? 'scene-family'
      : currentMonsters === 0
        ? isGoblinKingBoss
          ? 'scene-boss-goblin'
          : isFinalBoss
            ? 'scene-boss-final'
            : `scene-boss-${chapter % 10}`
        : cityScene;
  return {
    battleScene
  };
}
