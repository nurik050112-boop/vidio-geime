import { useEffect } from 'react';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'endingVoiceText' | 'speakText' | 'bbiBadEnding' | 'secretEnding' | 'endingChoice' | 'impossibleEnding'>;

export function useEndingVoice(context: Context): void {
  const { endingVoiceText, speakText, bbiBadEnding, secretEnding, endingChoice, impossibleEnding } = context;
  useEffect(() => {
    if (endingVoiceText) speakText(endingVoiceText, `ending-${bbiBadEnding}-${secretEnding}-${endingChoice}`);
  }, [endingVoiceText, impossibleEnding, bbiBadEnding, secretEnding, endingChoice]);
}
