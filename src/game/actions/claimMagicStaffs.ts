import { createMagicStaff } from '../data/createFurySword';
import { isArcaneWeapon } from '../data/isDeathSword';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'weapons' | 'chapter' | 'setMessage' | 'setWeapons' | 'setEquippedWeapon'>;

export function runClaimMagicStaffs(context: Context): void {
  const { weapons, chapter, setMessage, setWeapons, setEquippedWeapon } = context;
    const staffNames = ['Посох огненного вихря', 'Посох ветра', 'Посох ледяного дождя', 'Посох окаменения', 'Посох громового разлома'];
    const ownedNames = new Set(weapons.filter(isArcaneWeapon).map((weapon) => weapon.name));
    const newStaffs = staffNames
      .filter((name) => !ownedNames.has(name))
      .map((name, index) => createMagicStaff(name, Math.max(3, chapter + 3 + index), 1 + index * 0.18));
    if (newStaffs.length === 0) {
      setMessage('Все магические посохи уже есть в инвентаре.');
      return;
    }
    setWeapons((currentWeapons) => [...currentWeapons, ...newStaffs]);
    setEquippedWeapon(newStaffs[0]);
    setMessage(`Получено магическое оружие: ${newStaffs.map((staff) => staff.name).join(', ')}.`);
  
}
