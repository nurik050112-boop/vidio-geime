import { aisultanMonsterTotal,arailmEnemiesTotal } from '../data/adminBoss';
import { formatPower } from '../data/rarityDamage';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'setFuryGateOpen' | 'setAnuarGateOpen' | 'setMansurGateOpen' | 'setArailmGateOpen' | 'setArailmWorldEntered' | 'setArailmMonstersLeft' | 'setArailmChoiceOpen' | 'setArailmKingFightStarted' | 'setAisGateOpen' | 'setAisWorldEntered' | 'setAisMonstersLeft' | 'setAisSharkFightStarted' | 'setAisFinalChoiceOpen' | 'setAisGodFightStarted' | 'setAdminCode' | 'setMessage' | 'navigate'>;

export function runOpenArailmWorld(context: Context): void {
  const { setFuryGateOpen, setAnuarGateOpen, setMansurGateOpen, setArailmGateOpen, setArailmWorldEntered, setArailmMonstersLeft, setArailmChoiceOpen, setArailmKingFightStarted, setAisGateOpen, setAisWorldEntered, setAisMonstersLeft, setAisSharkFightStarted, setAisFinalChoiceOpen, setAisGodFightStarted, setAdminCode, setMessage, navigate } = context;
    setFuryGateOpen(false);
    setAnuarGateOpen(false);
    setMansurGateOpen(false);
    setArailmGateOpen(true);
    setArailmWorldEntered(false);
    setArailmMonstersLeft(arailmEnemiesTotal);
    setArailmChoiceOpen(false);
    setArailmKingFightStarted(false);
    setAisGateOpen(false);
    setAisWorldEntered(false);
    setAisMonstersLeft(aisultanMonsterTotal);
    setAisSharkFightStarted(false);
    setAisFinalChoiceOpen(false);
    setAisGodFightStarted(false);
    setAdminCode('');
    setMessage(`Код arailm открыл красную программу. Войди и зачисти ${formatPower(arailmEnemiesTotal)} код-монстров.`);
    navigate('/world');
  
}
