import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'introSkipped' | 'guestMode' | 'authUser' | 'speakText' | 'introVoiceText'>;

export function useIntroVoice(context: Context): void {
  const { introSkipped, guestMode, authUser, speakText, introVoiceText } = context;
  useEffect(() => {
    if (!introSkipped && !guestMode && authUser) speakText(introVoiceText, 'intro');
  }, [introSkipped]);
}
