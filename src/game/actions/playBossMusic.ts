import type { GameViewModel } from '../useGameController';

type Context = Pick<GameViewModel, 'bossMusicStopRef' | 'audioContextRef'>;

export function runPlayBossMusic(game: Context, sceneKey: string): void {
  const { bossMusicStopRef, audioContextRef } = game;
    if (typeof window === 'undefined' || bossMusicStopRef.current) return;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;
    void context.resume();

    const patterns: Record<string, { notes: number[]; beat: number; wave: OscillatorType; gain: number }> = {
      world: { notes: [196, 247, 294, 247], beat: 0.48, wave: 'triangle', gain: 0.022 },
      dungeon: { notes: [98, 123, 147, 123], beat: 0.42, wave: 'triangle', gain: 0.026 },
      ending: { notes: [220, 277, 330, 440], beat: 0.58, wave: 'triangle', gain: 0.024 },
      'bbi-world': { notes: [262, 330, 392, 330], beat: 0.38, wave: 'triangle', gain: 0.024 },
      'nurali-world': { notes: [196, 247, 330, 247], beat: 0.4, wave: 'triangle', gain: 0.024 },
      'fury-world': { notes: [146, 196, 233, 196], beat: 0.34, wave: 'triangle', gain: 0.026 },
      'anuar-world': { notes: [123, 165, 247, 165], beat: 0.36, wave: 'square', gain: 0.024 },
      'mansur-world': { notes: [147, 196, 247, 196], beat: 0.46, wave: 'triangle', gain: 0.024 },
      'arailm-world': { notes: [98, 131, 175, 131], beat: 0.28, wave: 'sawtooth', gain: 0.022 },
      'ais-world': { notes: [110, 147, 196, 247], beat: 0.42, wave: 'sine', gain: 0.025 },
      'admin-world': { notes: [41, 55, 82, 110], beat: 0.24, wave: 'square', gain: 0.03 },
      goblin: { notes: [98, 196, 233, 196, 87], beat: 0.13, wave: 'square', gain: 0.07 },
      fury: { notes: [55, 110, 146, 196, 220], beat: 0.11, wave: 'sawtooth', gain: 0.065 },
      anuar: { notes: [41, 82, 123, 165, 247], beat: 0.14, wave: 'square', gain: 0.075 },
      mansur: { notes: [73, 147, 196, 247, 294], beat: 0.16, wave: 'sawtooth', gain: 0.068 },
      arailm: { notes: [49, 98, 131, 98, 175, 208], beat: 0.1, wave: 'sawtooth', gain: 0.06 },
      ais: { notes: [55, 110, 165, 220, 330], beat: 0.18, wave: 'triangle', gain: 0.065 },
      admin: { notes: [33, 66, 99, 132, 198], beat: 0.08, wave: 'sawtooth', gain: 0.08 },
      bbi: { notes: [131, 262, 330, 392, 523], beat: 0.1, wave: 'square', gain: 0.07 },
      nurali: { notes: [55, 110, 165, 220, 330], beat: 0.12, wave: 'sawtooth', gain: 0.072 },
      family: { notes: [37, 73, 110, 147, 220], beat: 0.18, wave: 'sawtooth', gain: 0.075 },
      final: { notes: [27, 55, 82, 110, 165, 220], beat: 0.15, wave: 'sawtooth', gain: 0.08 },
      dragon: { notes: [65, 130, 164, 196, 246], beat: 0.17, wave: 'sawtooth', gain: 0.065 },
    };
    const pattern = patterns[sceneKey] ?? patterns.dragon;
    const masterGain = context.createGain();
    masterGain.gain.value = pattern.gain;
    masterGain.connect(context.destination);

    let step = 0;
    const playStep = () => {
      const oscillator = context.createOscillator();
      const noteGain = context.createGain();
      oscillator.type = pattern.wave;
      oscillator.frequency.value = pattern.notes[step % pattern.notes.length];
      noteGain.gain.setValueAtTime(0, context.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.9, context.currentTime + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + pattern.beat);
      oscillator.connect(noteGain);
      noteGain.connect(masterGain);
      oscillator.start();
      oscillator.stop(context.currentTime + pattern.beat);
      step += 1;
    };

    playStep();
    const timer = window.setInterval(playStep, pattern.beat * 1000);
    bossMusicStopRef.current = () => {
      window.clearInterval(timer);
      masterGain.disconnect();
    };
  
}
