import { type CityStage } from './dragonSon';

export const adminBoss: CityStage = {
  name: 'Админ',
  city: '11 мир',
  country: 'Админская сложность',
  lair: 'Последний экран, где игра почти ломается',
  monsterKind: 'admin',
  monsterName: 'админские монстры',
  title: 'создатель невозможного режима',
  power: 500_000_000_000,
  color: '#ff2a1f',
  attackSpeed: 0.22,
  reaction: 'админ бьет так, будто нажал все кнопки сразу',
};

export const heroMaxHp = 200;

export const monstersPerCity = 1_000;

export const dungeonEnemiesTotal = 500;

export const furyDungeonEnemiesTotal = 700;

export const anuarBombEnemiesTotal = 700;

export const mansurDungeonEnemiesTotal = 700;

export const arailmEnemiesTotal = 700;

export const aisultanMonsterTotal = 1_000;

export const aisultanMonsterHp = 1_000;

export const aisultanSharkHp = aisultanMonsterHp * 10;

export const aisultanSeaGodHp = aisultanSharkHp * 10;

export const adminWorldMonsterTotal = 1_000;

export const adminWorldMonsterHp = 1_000;

export const adminWorldBossesHp = 250_000_000_000;

export const adminFinalBossHp = 500_000_000_000;

export const baseMonsterHp = 1_000;

export const baseDragonHp = 100_000_000;

export const adminNukeHiddenDamageText = '9'.repeat(999);

export const adminNukeDamageText = '∞';

export const adminHelmetHealthText = '∞';

export const furySwordDamageText = '1' + '0'.repeat(116);

export const mansurBladeDamageText = '99999999999999999999999999999999999999999999999999999999';

export const programSwordDamageText = '1000000000000000000000000';

export const bbiMonsterTotal = 100;

export const bbiMonsterHp = 1_000;

export const bbiManagerHp = 5_000_000;

export const bbiDirectorHp = bbiManagerHp * 3;

export const bbiFinalBossHp = bbiDirectorHp * 3;

export const nuraliMonsterTotal = 100;

export const nuraliMonsterHp = 1_000;

export const nuraliBossHp = 25_000_000;

export const monsterAvalancheTotal = 10_000_000_000;

export const monsterAvalancheHp = 1_000;

export const monsterAvalancheDamage = 100_000;

export const monsterAvalancheStartChapter = 7;

export const finalSpiritMonsterTotal = 1_000;

export const finalSpiritMonsterHp = 1_000;

export const deathSwordDamageText = '999999999999999999999999999999999999999999999';

export const citySizeMeters = 5_000;

export const cityHalfSize = (citySizeMeters / 2) * 1_000;

export const heroMoveSpeedPerSecond = (9 / 3.6) * 1_000;

export const heroRunSpeedPerSecond = (18 / 3.6) * 1_000;

export const worldCollisionEnabled = true;

export const meleeRangeMeters = 5;

export const meleeRangeUnits = meleeRangeMeters * 1_000;

export const monsterPressureRangeUnits = 12_000;

export const monsterRunSpeedPerSecond = (18 / 3.6) * 1_000;

export const monsterSpawnDistanceUnits = 11_000;

export const monsterAggroDistanceUnits = 100_000;

export const monsterBotAttackDamage = 10;

export const monsterBotAttackCooldownMs = 1_100;

export const monsterChaseCatchTimeMs = 2_500;

export type NearestMonsterState = {
  x: number;
  z: number;
  hp: number;
  alive: boolean;
};

export type CollisionBox = {
  x: number;
  z: number;
  halfX: number;
  halfZ: number;
};
