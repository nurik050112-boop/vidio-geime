import { type CityStage } from './dragonSon';

export const deathGod: CityStage = {
  name: 'Король ада',
  city: 'Адский трон',
  country: 'После подземного мира',
  lair: 'Черный зал ада, где король ада ждет героя после смерти душ финального босса',
  monsterKind: 'death-god',
  monsterName: 'души ада',
  title: 'король ада',
  power: 999_999_999_999,
  color: '#8b0000',
  attackSpeed: 0.3,
  reaction: 'ударяет адским огнем и давит душу',
};

export const dragonFamily: CityStage = {
  name: 'Семья короля драконов',
  city: 'Последнее логово семьи',
  country: 'Драконье небо',
  lair: 'Семейное гнездо над троном огня',
  monsterKind: 'magma',
  monsterName: 'драконья семья',
  title: 'семья короля драконов',
  power: 999_999_999_999,
  color: '#fff275',
  attackSpeed: 0.45,
  reaction: 'семья атакует почти без паузы',
};

export const goblinKing: CityStage = {
  name: 'Король гоблинов',
  city: 'Глубокая пещера',
  country: 'Забытое королевство',
  lair: 'Трон бедных гоблинов под землей',
  monsterKind: 'goblin',
  monsterName: 'бедные гоблины',
  title: 'король тех, кого никто не любит',
  power: 777_777_777,
  color: '#65a832',
  attackSpeed: 0.6,
  reaction: 'дерется быстро, потому что защищает своих',
};

export const furyKing: CityStage = {
  name: 'Король фури',
  city: 'Секретный фури-мир',
  country: 'Скрытая улица',
  lair: 'Трон фури под серым городом',
  monsterKind: 'shadow',
  monsterName: 'фури',
  title: 'король фури',
  power: 999_999_999,
  color: '#111111',
  attackSpeed: 0.52,
  reaction: 'двигается очень быстро',
};

export const anuarKing: CityStage = {
  name: 'Ануар',
  city: 'Город бомб',
  country: 'Секретный мир',
  lair: 'Финальная площадь после взрыва',
  monsterKind: 'magma',
  monsterName: 'бомба-монстры',
  title: 'король бомб',
  power: 999_999_999,
  color: '#ff5a3d',
  attackSpeed: 0.48,
  reaction: 'кидает бомбический удар',
};

export const mansurKing: CityStage = {
  name: 'Король Мансур',
  city: 'Секретное подземелье Мансура',
  country: 'Мир братишки',
  lair: 'Трон Мансура у горного озера',
  monsterKind: 'goblin',
  monsterName: 'монстры Мансура',
  title: 'король Мансура',
  power: 999_999_999,
  color: '#9cff00',
  attackSpeed: 0.5,
  reaction: 'атакует как секретный страж',
};

export const arailmKing: CityStage = {
  name: 'Арайлым',
  city: 'Красный код',
  country: 'Секретная программа',
  lair: 'Экран, из которого код хочет выбраться',
  monsterKind: 'shadow',
  monsterName: 'код-монстры',
  title: 'босс программы',
  power: 999_999_999,
  color: '#ff2a1f',
  attackSpeed: 0.42,
  reaction: 'понимает, что она всего лишь код',
};

export const seaShark: CityStage = {
  name: 'Промежуточный босс Акула',
  city: 'Водный мир',
  country: '10 мир',
  lair: 'Глубина под холодной волной',
  monsterKind: 'shark',
  monsterName: 'рыбы',
  title: 'страж бога моря',
  power: 100_000_000_000,
  color: '#75c7e8',
  attackSpeed: 0.5,
  reaction: 'акула режет воду быстрым рывком',
};

export const aisultanSeaGod: CityStage = {
  name: 'Бог моря Айсултан',
  city: 'Трон водного мира',
  country: '10 мир',
  lair: 'Дворец из волн на дне океана',
  monsterKind: 'sea-god',
  monsterName: 'морские стражи',
  title: 'бог моря',
  power: 1_000_000_000_000,
  color: '#2f80ed',
  attackSpeed: 0.36,
  reaction: 'поднимает волну сильнее меча',
};
