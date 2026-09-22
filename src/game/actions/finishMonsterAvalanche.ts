import { monsterAvalancheStartChapter } from '../data/adminBoss';
import { dragonSons } from '../data/arcaneSpells';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setMonsterAvalancheEntered' | 'setMonsterAvalancheLeft' | 'setMonsterAvalancheEnding' | 'setSecretEnding' | 'setVictory' | 'setChapter' | 'setSavedCities' | 'setHeroHp' | 'currentHeroMaxHp' | 'unlockAchievement' | 'addGold' | 'setMessage' | 'navigate'>;

export function runFinishMonsterAvalanche(context: Context): void {
  const { setMonsterAvalancheEntered, setMonsterAvalancheLeft, setMonsterAvalancheEnding, setSecretEnding, setVictory, setChapter, setSavedCities, setHeroHp, currentHeroMaxHp, unlockAchievement, addGold, setMessage, navigate } = context;
    setMonsterAvalancheEntered(false);
    setMonsterAvalancheLeft(0);
    setMonsterAvalancheEnding(true);
    setSecretEnding('monsterAvalanche');
    setVictory(true);
    setChapter(dragonSons.length + 1);
    setSavedCities(dragonSons.slice(0, monsterAvalancheStartChapter + 1).map((city) => `${city.city}, ${city.country}`));
    setHeroHp(currentHeroMaxHp);
    unlockAchievement('monsterAvalanche');
    addGold(10_000_000_000);
    setMessage('Лавина из 10 миллиардов монстров побеждена. Открыта концовка лавины и 100% баф ко всем силам.');
    navigate('/world');
  
}
