import type * as React from 'react';
import { useRef } from 'react';
import { adminWorldMonsterTotal,aisultanMonsterTotal,anuarBombEnemiesTotal,arailmEnemiesTotal,bbiMonsterTotal,dungeonEnemiesTotal,finalSpiritMonsterTotal,furyDungeonEnemiesTotal,mansurDungeonEnemiesTotal,monsterAvalancheTotal,monstersPerCity,nuraliMonsterTotal } from '../data/adminBoss';
import { type EndingChoice,type SecretEnding,type Weapon } from '../data/dragonSon';
import { shopBasePower,upgradePower } from '../data/loadUnlockedAchievements';
import { formatPower,isBbiLegendaryWeapon } from '../data/rarityDamage';

type Input = {
  equippedWeapon: Weapon | null;
  bbiLegendaryDamage: number;
  equippedWeaponDamage: number;
  deathSwordMultiplier: 1 | 7.66;
  items: Record<"sword" | "pet" | "clothes" | "helmet" | "armor" | "mana" | "health" | "doubleStrike", number>;
  waterSwordArtifactMultiplier: 1 | 11;
  isFinalReveal: boolean;
  currentMonsters: number;
  enemyHp: number;
  heroHp: number;
  chapter: number;
  artifactDamageMultiplier: number;
  artifactAttackSpeedMultiplier: number;
  currentDragonHp: number;
  enemy: import("../data/dragonSon").DragonSon;
  nickname: string;
  isFinalSpiritWorld: boolean;
  isMonsterAvalancheWorld: boolean;
  isAdminWorld: boolean;
  isAisWorld: boolean;
  isNuraliWorld: boolean;
  isBbiWorld: boolean;
  isArailmWorld: boolean;
  isMansurDungeon: boolean;
  isAnuarWorld: boolean;
  isFuryDungeon: boolean;
  isDungeon: boolean | undefined;
  currentMonsterHp: 1000;
  isArailmKingBoss: boolean;
  impossibleEnding: boolean;
  bbiBadEnding: boolean;
  secretEnding: SecretEnding;
  isEndingChoice: boolean;
  endingChoice: EndingChoice;
  isDeathGodBoss: boolean;
  isFinalSpiritBoss: boolean;
  isFinalBoss: boolean;
  isFamilyBoss: boolean;
  finalSpiritWorldOpen: boolean;
  isAdminWorldBosses: boolean;
  isAdminBoss: boolean;
  adminFinalChoiceOpen: boolean;
  isAisSharkBoss: boolean;
  isAisGodBoss: boolean;
  aisFinalChoiceOpen: boolean;
  mapLocationIndex: number;
};
type State = {
  weaponBonus: number;
  petBonus: number;
  attackBonus: number;
  isClickDuelActive: boolean;
  clickDuelHeroPower: number;
  clickDuelDragonPower: number;
  playerName: string;
  dragonReaction: string;
  currentMonsterTotal: 700 | 1000 | 100 | 10000000000 | 500;
  currentEnemyHealthText: string;
  introVoiceText: "Драконы стали злыми. Они начали уничтожать города. Герой берет меч и идет спасать мир.";
  endingVoiceText: "" | "Невозможная концовка. Админская ядерка стала бесконечной. Получен медальон невозможности." | "Би Би Ай концовка. Они лишь дети, ты монстр. Ты мог отказаться, но выбрал сражаться." | "Плохая концовка. Ваша душа попала в ад." | "Секретная концовка. Победивший смерть. Герой получил голову бога и смертельный меч." | "Секретная концовка. Это невозможно пройти. Герой убил админа и стал уж слишком сильным." | "Секретная концовка. Лавина монстров побеждена. Все бафы стали сильнее на сто процентов." | "Секретная концовка. Воденой мир. Бог моря Айсултан побежден, океан стал свободным." | "Секретная концовка. Код хочет выбраться. Даже код может хотеть свободы." | "Секретная концовка. Подземелье Мансура зачищено. Герой получил секретный клинок." | "Бомбическая концовка. Ануар побежден, город бомб зачищен." | "Секретная концовка. Ты ужасен. Под масками были живые люди." | "Секретная концовка. Люди, ставшие гоблинами. Герой узнал их тайну." | "Концовка. Мир после огня. Герой оставил драконью семью жить." | "Плохая концовка. Пустое небо. Герой сразился с семьей драконов.";
  cityScene: string;
  forcedCenterLocation: boolean | "goblinKing" | "furyKing" | "anuarKing" | "mansurKing" | "arailmKing" | "aisultanSea" | "adminImpossible" | "monsterAvalanche" | "deathHell" | "deathVictory";
  mapSceneKey: string;
  useCityGoblinModel: boolean;
  collisionContextRef: React.MutableRefObject<{ chapter: number; mapLocationIndex: number; mapSceneKey: string; }>;
};

export function useWeaponBonusState(input: Input): State {
  const { equippedWeapon, bbiLegendaryDamage, equippedWeaponDamage, deathSwordMultiplier, items, waterSwordArtifactMultiplier, isFinalReveal, currentMonsters, enemyHp, heroHp, chapter, artifactDamageMultiplier, artifactAttackSpeedMultiplier, currentDragonHp, enemy, nickname, isFinalSpiritWorld, isMonsterAvalancheWorld, isAdminWorld, isAisWorld, isNuraliWorld, isBbiWorld, isArailmWorld, isMansurDungeon, isAnuarWorld, isFuryDungeon, isDungeon, currentMonsterHp, isArailmKingBoss, impossibleEnding, bbiBadEnding, secretEnding, isEndingChoice, endingChoice, isDeathGodBoss, isFinalSpiritBoss, isFinalBoss, isFamilyBoss, finalSpiritWorldOpen, isAdminWorldBosses, isAdminBoss, adminFinalChoiceOpen, isAisSharkBoss, isAisGodBoss, aisFinalChoiceOpen, mapLocationIndex } = input;

  const weaponBonus = Math.floor((isBbiLegendaryWeapon(equippedWeapon) ? bbiLegendaryDamage : equippedWeaponDamage) * deathSwordMultiplier);
  const petBonus = Math.min(20, upgradePower(items.pet, shopBasePower.pet));
  const attackBonus = upgradePower(items.sword, shopBasePower.sword) + petBonus + Math.floor(weaponBonus * waterSwordArtifactMultiplier);
  const isClickDuelActive = !isFinalReveal && currentMonsters === 0 && enemyHp > 0 && heroHp > 0;
  const clickDuelHeroPower = Math.max(1, Math.floor((18 + chapter * 5 + attackBonus) * artifactDamageMultiplier * artifactAttackSpeedMultiplier));
  const clickDuelDragonPower = Math.max(1, Math.floor(currentDragonHp * (enemy?.attackSpeed ?? 1)));
  const playerName = nickname.trim() || 'BBI герой';
  const dragonReaction = enemy?.reaction ?? 'обычная реакция';
  const currentMonsterTotal = isFinalSpiritWorld ? finalSpiritMonsterTotal : isMonsterAvalancheWorld ? monsterAvalancheTotal : isAdminWorld ? adminWorldMonsterTotal : isAisWorld ? aisultanMonsterTotal : isNuraliWorld ? nuraliMonsterTotal : isBbiWorld ? bbiMonsterTotal : isArailmWorld ? arailmEnemiesTotal : isMansurDungeon ? mansurDungeonEnemiesTotal : isAnuarWorld ? anuarBombEnemiesTotal : isFuryDungeon ? furyDungeonEnemiesTotal : isDungeon ? dungeonEnemiesTotal : monstersPerCity;
  const currentEnemyHealthText = currentMonsters > 0
    ? `Враг HP ${formatPower(currentMonsterHp)}`
    : isArailmKingBoss
      ? `Босс HP ${formatPower(currentDragonHp)}`
    : `Дракон HP ${formatPower(enemyHp)}/${formatPower(currentDragonHp)}`;
  const introVoiceText = 'Драконы стали злыми. Они начали уничтожать города. Герой берет меч и идет спасать мир.';
  const endingVoiceText = impossibleEnding
    ? 'Невозможная концовка. Админская ядерка стала бесконечной. Получен медальон невозможности.'
    : bbiBadEnding
    ? 'Би Би Ай концовка. Они лишь дети, ты монстр. Ты мог отказаться, но выбрал сражаться.'
    : secretEnding === 'deathHell'
      ? 'Плохая концовка. Ваша душа попала в ад.'
    : secretEnding === 'deathVictory'
      ? 'Секретная концовка. Победивший смерть. Герой получил голову бога и смертельный меч.'
    : secretEnding === 'adminImpossible'
      ? 'Секретная концовка. Это невозможно пройти. Герой убил админа и стал уж слишком сильным.'
    : secretEnding === 'monsterAvalanche'
      ? 'Секретная концовка. Лавина монстров побеждена. Все бафы стали сильнее на сто процентов.'
    : secretEnding === 'aisultanSea'
      ? 'Секретная концовка. Воденой мир. Бог моря Айсултан побежден, океан стал свободным.'
    : secretEnding === 'arailmKing'
      ? 'Секретная концовка. Код хочет выбраться. Даже код может хотеть свободы.'
    : secretEnding === 'mansurKing'
      ? 'Секретная концовка. Подземелье Мансура зачищено. Герой получил секретный клинок.'
    : secretEnding === 'anuarKing'
      ? 'Бомбическая концовка. Ануар побежден, город бомб зачищен.'
    : secretEnding === 'furyKing'
      ? 'Секретная концовка. Ты ужасен. Под масками были живые люди.'
    : secretEnding === 'goblinKing'
      ? 'Секретная концовка. Люди, ставшие гоблинами. Герой узнал их тайну.'
    : isFinalReveal && !isEndingChoice
      ? endingChoice === 'spare'
        ? 'Концовка. Мир после огня. Герой оставил драконью семью жить.'
        : 'Плохая концовка. Пустое небо. Герой сразился с семьей драконов.'
      : '';
  const cityScene = `scene-city-${chapter % 20}`;
  const forcedCenterLocation = isFinalReveal || secretEnding || impossibleEnding || bbiBadEnding || isDeathGodBoss || isFinalSpiritBoss || isFinalBoss || isFamilyBoss;
  const mapSceneKey = isFinalReveal
    ? `ending-${endingChoice ?? 'choice'}`
    : secretEnding
      ? `ending-${secretEnding}`
      : impossibleEnding
        ? 'ending-impossible'
        : bbiBadEnding
          ? 'ending-bbi'
          : isDeathGodBoss
            ? 'death-god'
            : isFinalSpiritBoss || finalSpiritWorldOpen
              ? 'final-spirit'
              : isAdminWorld || isAdminWorldBosses || isAdminBoss || adminFinalChoiceOpen
                ? 'admin-city'
                : isAisWorld || isAisSharkBoss || isAisGodBoss || aisFinalChoiceOpen
                  ? 'sea-city'
                : isDungeon
                    ? `dungeon-${chapter}`
                    : `city-${chapter}`;
  const useCityGoblinModel = mapSceneKey.startsWith('city-') && !isDungeon;
  const collisionContextRef = useRef({ chapter, mapLocationIndex, mapSceneKey });
  return {
    weaponBonus, petBonus, attackBonus, isClickDuelActive, clickDuelHeroPower,
    clickDuelDragonPower, playerName, dragonReaction, currentMonsterTotal, currentEnemyHealthText,
    introVoiceText, endingVoiceText, cityScene, forcedCenterLocation, mapSceneKey,
    useCityGoblinModel, collisionContextRef
  };
}
