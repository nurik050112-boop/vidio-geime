import { type ShopItem } from '../data/dragonSon';
import { getShopBonusText,getShopPrice,nextUpgradePower,shopBasePower } from '../data/loadUnlockedAchievements';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'shopLevels' | 'infiniteGold' | 'gold' | 'setMessage' | 'setGold' | 'setItems' | 'items' | 'setShopLevels' | 'setHealthLevel' | 'setHeroHp' | 'currentHeroMaxHp' | 'setHeroMana' | 'currentHeroMaxMana'>;

export function runBuy(context: Context, item: ShopItem): void {
  const { shopLevels, infiniteGold, gold, setMessage, setGold, setItems, items, setShopLevels, setHealthLevel, setHeroHp, currentHeroMaxHp, setHeroMana, currentHeroMaxMana } = context;
    const level = shopLevels[item.id];
    const price = getShopPrice(item, level);
    const bonusText = getShopBonusText(item, level);

    if (!infiniteGold && gold < price) {
      setMessage(`Не хватает золота на ${item.name}. Победи еще одного врага.`);
      return;
    }

    if (!infiniteGold) setGold(gold - price);
    setItems({ ...items, [item.id]: items[item.id] + 1 });
    setShopLevels({ ...shopLevels, [item.id]: level + 1 });
    if (item.id === 'health') {
      setHealthLevel((level) => level + 1);
      setHeroHp((hp) => Math.min(currentHeroMaxHp + nextUpgradePower(level, shopBasePower.health), hp + nextUpgradePower(level, shopBasePower.health)));
    }
    if (item.id === 'mana') {
      const manaBonus = nextUpgradePower(level, shopBasePower.mana);
      setHeroMana((mana) => Math.min(currentHeroMaxMana + manaBonus, mana + manaBonus));
    }
    setMessage(`${item.name} куплен. ${bonusText}, следующий раз будет дороже и сильнее.`);
  
}
