

export type DragonSon = {
  name: string;
  city: string;
  country: string;
  lair: string;
  monsterKind: string;
  monsterName: string;
  title: string;
  power: number;
  color: string;
  attackSpeed: number;
  reaction: string;
};

export type CityStage = DragonSon;

export type ShopItem = {
  id: 'sword' | 'pet' | 'clothes' | 'helmet' | 'armor' | 'mana' | 'health' | 'doubleStrike';
  name: string;
  price: number;
  bonus: string;
};

export type Dungeon = {
  city: string;
  danger: number;
  cleared: boolean;
  entered: boolean;
  enemiesLeft: number;
  declined: boolean;
};

export type Rarity = 'Обычный' | 'Необычный' | 'Редкий' | 'Эпик' | 'Легендарка' | 'Секретное';

export type Weapon = {
  id: string;
  name: string;
  rarity: Rarity;
  damage: number;
  price: number;
  displayDamage?: string;
  hiddenDamageText?: string;
};

export type Armor = {
  id: string;
  name: string;
  rarity: Rarity;
  defense: number;
  price: number;
  displayDefense?: string;
};

export type ArtifactId = 'starRing' | 'dragonPendant' | 'magicBottle' | 'goldHoop' | 'greenRelic' | 'snowGlobe' | 'moonCrystal' | 'seaPearl' | 'deathPendant' | 'sunOrb' | 'impossibleMedallion' | 'avalancheCrown' | 'godHead';

export type Artifact = {
  id: ArtifactId;
  name: string;
  ending: AchievementId;
  bonusPercent: number;
  goldBonusPercent: number;
  attackSpeedPercent: number;
  healthBonusPercent?: number;
  defenseBonusPercent?: number;
  luckBonusPercent?: number;
  manaBonusPercent?: number;
  healingBonusPercent?: number;
  icon: string;
  text: string;
};

export type Quest = {
  id: number;
  title: string;
  text: string;
  done: boolean;
  progress: string;
  money: number;
  reward: string;
};

export type HeroAnimation = 'idle' | 'strike' | 'step' | 'heal' | 'cast';

export type EndingChoice = 'spare' | 'fight' | 'family' | null;

export type SecretEnding = 'goblinKing' | 'furyKing' | 'anuarKing' | 'mansurKing' | 'arailmKing' | 'aisultanSea' | 'adminImpossible' | 'monsterAvalanche' | 'deathHell' | 'deathVictory' | null;

export type AchievementId = 'dragonPeace' | 'dragonWar' | 'goblinKing' | 'furyKing' | 'anuarKing' | 'mansurKing' | 'arailmKing' | 'aisultanSea' | 'adminImpossible' | 'bbiBadEnding' | 'impossibleEnding' | 'monsterAvalanche' | 'deathHell' | 'deathVictory';

export type BbiBossStage = 'manager' | 'director' | 'final' | null;

export type DuelStatus = 'idle' | 'searching' | 'challenge' | 'fighting' | 'won' | 'declined';

export type DuelPlayer = {
  id: string;
  name: string;
  power: number;
  title: string;
  weapon: Weapon;
  armor: Armor;
};

export type OnlinePresence = {
  id: string;
  name: string;
  power: number;
  weapon: Weapon | null;
  armor: Armor | null;
  updatedAt: number;
};

export type DuelChatMessage = {
  id: string;
  from: string;
  text: string;
};

export type DuelRequest = {
  id: string;
  kind: 'fight' | 'trade';
  fromId: string;
  fromName: string;
  toId: string;
  createdAt: number;
};

export type DuelTradeOffer =
  | { kind: 'weapon'; item: Weapon }
  | { kind: 'armor'; item: Armor }
  | null;
