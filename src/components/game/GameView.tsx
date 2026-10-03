import { useEffect, useRef, useState } from 'react';
import { GameDialog } from '../../components/GameDialog';
import { GameGuide } from '../../components/GameGuide';
import { formatPower } from '../../game/data/rarityDamage';
import { useGameModel } from '../../game/GameContext';
import { DuelOverlayView } from './DuelOverlayView';
import { DuelRequestScreenView } from './DuelRequestScreenView';
import { GameDialogView } from './GameDialogView';
import { GlobalMapView } from './GlobalMapView';
import { HudView } from './HudView';
import { QuickHudView } from './QuickHudView';
import { ShopView } from './ShopView';
import { StageView } from './StageView';



export function GameView() {
  const { isWorldPage, manualPause, setManualPause, tutorialOpen, closeTutorial, shopOpen, setShopOpen, enemy, isFinalReveal, duelStatus, incomingDuelRequest, incomingRequestPlayer, setQuestPanelOpen, questPanelOpen, completedQuestCount, quests, visibleQuests, activeQuest, inventoryPanelOpen } = useGameModel();
  const [globalMapOpen, setGlobalMapOpen] = useState(false);
  const shortcutKeys = useRef(new Set<string>());

  useEffect(() => {
    function isTyping(target: EventTarget | null) {
      return target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target instanceof HTMLSelectElement
        || (target instanceof HTMLElement && target.isContentEditable);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (isTyping(event.target)) return;
      if (event.code !== 'KeyN' && event.code !== 'KeyB') return;
      shortcutKeys.current.add(event.code);
      if (shortcutKeys.current.has('KeyN') && shortcutKeys.current.has('KeyB') && !event.repeat) {
        event.preventDefault();
        setGlobalMapOpen((open) => !open);
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      shortcutKeys.current.delete(event.code);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      shortcutKeys.current.clear();
    };
  }, []);

  return (<main className={`game ${isWorldPage ? 'world-page' : 'play-page'}`}>
      {globalMapOpen && <GlobalMapView onClose={() => setGlobalMapOpen(false)} />}
      {manualPause && !isWorldPage && (
        <GameDialog title="Игра на паузе" onClose={() => setManualPause(false)} className="pause-dialog">
          <p className="eyebrow">Можно передохнуть</p><h2>Игра на паузе</h2>
          <p>Герой в безопасности. Продолжим приключение?</p>
          <button onClick={() => setManualPause(false)} type="button">Продолжить</button>
        </GameDialog>
      )}
      {tutorialOpen && <GameGuide onClose={closeTutorial} />}
      {shopOpen && !isWorldPage && (
        <GameDialog title="Магазин" onClose={() => setShopOpen(false)} className="shop-dialog">
          <div className="game-modal-head">
            <div><p className="eyebrow">Лавка героя</p><h2>Магазин</h2></div>
            <button onClick={() => setShopOpen(false)} type="button" aria-label="Закрыть магазин">Закрыть</button>
          </div>
          <ShopView />
        </GameDialog>
      )}
      {!isWorldPage && <StageView />}

      {(duelStatus === 'searching' || duelStatus === 'challenge' || duelStatus === 'fighting' || duelStatus === 'won') && (
        <DuelOverlayView />
      )}

      {incomingDuelRequest && incomingRequestPlayer && (
        <DuelRequestScreenView />
      )}

      {!isWorldPage && !isFinalReveal && enemy && (
        <QuickHudView />
      )}

      {questPanelOpen && (
        <GameDialog title="Квесты" onClose={() => setQuestPanelOpen(false)}>
          <div className="game-modal-panel quest-modal-panel">
            <div className="game-modal-head">
              <div>
                <p className="label">Квесты</p>
                <strong>{completedQuestCount} / {quests.length}</strong>
              </div>
              <button onClick={() => setQuestPanelOpen(false)} type="button">Закрыть</button>
            </div>
            <div className="quest-list compact-quest-list">
              {visibleQuests.map((quest) => (
                <div className={`quest ${quest.done ? 'done' : quest === activeQuest ? 'active' : ''}`} key={quest.title}>
                  <span>{quest.done ? '✓' : '!'}</span>
                  <div>
                    <strong>{quest.title}</strong>
                    <p>{quest.text}</p>
                    <small>{quest.progress}</small>
                    <small>Деньги: {formatPower(quest.money)} | {quest.reward}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GameDialog>
      )}

      {inventoryPanelOpen && (
        <GameDialogView />
      )}

      {isWorldPage && (
      <HudView />
      )}
    </main>);
}
