import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'introSkipped' | 'endingVoiceText' | 'lastMessageVoiceAtRef' | 'shouldSpeakMessage' | 'message' | 'speakText'>;

export function useMessageVoice(context: Context): void {
  const { introSkipped, endingVoiceText, lastMessageVoiceAtRef, shouldSpeakMessage, message, speakText } = context;
  useEffect(() => {
    const now = Date.now();
    if (!introSkipped || endingVoiceText || now - lastMessageVoiceAtRef.current < 2600 || !shouldSpeakMessage(message)) return;
    lastMessageVoiceAtRef.current = now;
    speakText(message, `message-${message}`);
  }, [message, introSkipped, endingVoiceText]);
}
