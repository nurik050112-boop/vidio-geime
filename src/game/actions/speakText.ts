import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'lastSpokenSceneRef'>;

export function runSpeakText(context: Context, text: string, sceneKey: string): void {
  const { lastSpokenSceneRef } = context;
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || lastSpokenSceneRef.current === sceneKey) return;
    lastSpokenSceneRef.current = sceneKey;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.78;
    utterance.pitch = 0.48;
    utterance.volume = 0.95;
    window.speechSynthesis.speak(utterance);
  
}
