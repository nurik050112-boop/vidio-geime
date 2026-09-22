import { useEffect } from 'react';
import { createArmor,createSecretWeapon,createWeapon } from '../data/isDeathSword';
import { formatPower } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'saveReady' | 'quests' | 'paidQuestIds' | 'chapter' | 'addGold' | 'setWeapons' | 'setEquippedWeapon' | 'setArmors' | 'setEquippedArmor' | 'setMessage' | 'storyProgress' | 'savedCities' | 'isFinalReveal' | 'endingChoice' | 'secretEnding'>;

export function useQuestRewards(context: Context): void {
  const { saveReady, quests, paidQuestIds, chapter, addGold, setWeapons, setEquippedWeapon, setArmors, setEquippedArmor, setMessage, storyProgress, savedCities, isFinalReveal, endingChoice, secretEnding } = context;
  useEffect(() => {
    if (!saveReady) return;
    const completedUnpaid = quests.filter((quest) => quest.done && !paidQuestIds.current.has(quest.id));
    if (completedUnpaid.length === 0) return;

    const money = completedUnpaid.reduce((sum, quest) => sum + quest.money, 0);
    const rewardWeapons = completedUnpaid.flatMap((quest) => {
      if (quest.id % 25 === 0 || quest.id === 499) return [createSecretWeapon(Math.max(quest.id / 10, chapter + 1))];
      if (quest.id % 10 === 0 || quest.id === 498) return [createWeapon(quest.id % 50 === 0 ? 'Легендарка' : 'Эпик', Math.max(quest.id / 12, chapter + 1))];
      return [];
    });
    const rewardArmors = completedUnpaid.flatMap((quest) => (
      quest.id % 15 === 0 ? [createArmor(quest.id % 45 === 0 ? 'Легендарка' : 'Эпик', Math.max(quest.id / 15, chapter + 1))] : []
    ));
    completedUnpaid.forEach((quest) => paidQuestIds.current.add(quest.id));
    addGold(money);
    if (rewardWeapons.length > 0) {
      setWeapons((currentWeapons) => [...currentWeapons, ...rewardWeapons]);
      setEquippedWeapon(rewardWeapons[rewardWeapons.length - 1]);
    }
    if (rewardArmors.length > 0) {
      setArmors((currentArmors) => [...currentArmors, ...rewardArmors]);
      setEquippedArmor(rewardArmors[rewardArmors.length - 1]);
    }
    const itemText = [
      rewardWeapons.length > 0 ? `${rewardWeapons.length} оружия` : '',
      rewardArmors.length > 0 ? `${rewardArmors.length} брони` : '',
    ].filter(Boolean).join(', ');
    setMessage(`Квест выполнен! Получено денег: ${formatPower(money)}${itemText ? ` и ${itemText}` : ''}. Всего квестов: ${quests.filter((quest) => quest.done).length} / 500.`);
  }, [saveReady, storyProgress, savedCities.length, isFinalReveal, endingChoice, secretEnding]);
}
