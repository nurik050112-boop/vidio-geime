import { type HeroAnimation } from '../data/dragonSon';
import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'heroAnimation' | 'heroAnimationTimer' | 'setHeroAnimation'>;

export function runPlayHeroAnimation(context: Context, animation: HeroAnimation, duration: number): void {
  const { heroAnimation, heroAnimationTimer, setHeroAnimation } = context;
    if (animation === 'step' && (heroAnimation === 'step' || heroAnimation === 'strike' || heroAnimation === 'heal')) return;
    if (heroAnimationTimer.current !== null) {
      window.clearTimeout(heroAnimationTimer.current);
    }
    setHeroAnimation(animation);
    heroAnimationTimer.current = window.setTimeout(() => {
      setHeroAnimation('idle');
      heroAnimationTimer.current = null;
    }, duration);
  
}
