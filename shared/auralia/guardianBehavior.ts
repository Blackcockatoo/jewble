import { useCallback, useEffect, useRef, useState } from 'react';

export type GuardianStats = { energy: number; curiosity: number; bond: number };
export type GuardianSigilPoint = { x: number; y: number; hash: string };
export type GuardianField = { prng: () => number };
export type GuardianAIState = { mode: 'idle' | 'observing' | 'focusing' | 'playing' | 'dreaming'; target: number | null; since: number };
export type GuardianScaleName = 'harmonic' | 'pentatonic' | 'dorian' | 'phrygian';

const AUDIO_SCALES: Record<GuardianScaleName, number[]> = {
  harmonic: [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 15 / 8, 2],
  pentatonic: [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2],
  dorian: [1, 9 / 8, 32 / 27, 4 / 3, 3 / 2, 27 / 16, 16 / 9, 2],
  phrygian: [1, 256 / 243, 32 / 27, 4 / 3, 3 / 2, 128 / 81, 16 / 9, 2],
};

type AudioOscillator = { gain: GainNode };
export type GuardianAudioContextRef = { ctx: AudioContext; noteOscs: AudioOscillator[]; droneOscs: AudioOscillator[] };

const getAudioContextCtor = (): (new () => AudioContext) | null => {
  if (typeof window === 'undefined') return null;
  const audioContext = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
  return audioContext ?? null;
};

export const useAuraliaAudio = (enabled: boolean, stats: GuardianStats, scale: GuardianScaleName = 'harmonic') => {
  const audioContextRef = useRef<GuardianAudioContextRef | null>(null);
  const isSetup = useRef(false);

  useEffect(() => {
    const AudioContextCtor = getAudioContextCtor();
    if (typeof window === 'undefined' || !enabled || !AudioContextCtor) {
      if (audioContextRef.current) {
        audioContextRef.current.ctx.close().then(() => {
          audioContextRef.current = null;
          isSetup.current = false;
        });
      }
      return;
    }

    if (isSetup.current) return;

    const setupAudio = async () => {
      const ctx = new AudioContextCtor();
      if (ctx.state === 'suspended') await ctx.resume();

      const convolver = ctx.createConvolver();
      const reverbTime = 2;
      const decay = 0.5;
      const impulse = ctx.createBuffer(2, ctx.sampleRate * reverbTime, ctx.sampleRate);
      for (let i = 0; i < 2; i++) {
        const channel = impulse.getChannelData(i);
        for (let j = 0; j < impulse.length; j++) {
          channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / impulse.length, decay);
        }
      }
      convolver.buffer = impulse;
      convolver.connect(ctx.destination);

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.8;
      masterGain.connect(convolver);
      masterGain.connect(ctx.destination);

      const ambientGain = ctx.createGain();
      ambientGain.gain.value = 0.01;
      ambientGain.connect(masterGain);

      const ambientOsc1 = ctx.createOscillator();
      const ambientOsc2 = ctx.createOscillator();
      ambientOsc1.type = 'sine';
      ambientOsc2.type = 'sine';
      ambientOsc1.frequency.value = 60;
      ambientOsc2.frequency.value = 90;

      const ambientLFO = ctx.createOscillator();
      ambientLFO.frequency.value = 0.1;
      const ambientLFOGain = ctx.createGain();
      ambientLFOGain.gain.value = 0.3;
      ambientLFO.connect(ambientLFOGain).connect(ambientGain.gain);

      ambientOsc1.connect(ambientGain);
      ambientOsc2.connect(ambientGain);
      ambientOsc1.start();
      ambientOsc2.start();
      ambientLFO.start();

      const baseFreq = 432;
      const createOscillators = (count: number, freqs: number[]) => {
        const oscs: AudioOscillator[] = [];
        for (let i = 0; i < count; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = baseFreq * freqs[i % freqs.length];
          osc.type = 'sine';
          gain.gain.value = 0.0001;
          osc.connect(gain).connect(masterGain);
          osc.start();
          oscs.push({ gain });
        }
        return oscs;
      };

      const scaleIntervals = AUDIO_SCALES[scale];
      const noteOscs = createOscillators(scaleIntervals.length, scaleIntervals);
      const droneOscs = createOscillators(3, [1, 1.5, 2]);

      audioContextRef.current = { ctx, noteOscs, droneOscs };
      isSetup.current = true;
    };

    setupAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.ctx.close();
        audioContextRef.current = null;
        isSetup.current = false;
      }
    };
  }, [enabled, scale]);

  useEffect(() => {
    if (!enabled || !audioContextRef.current) return;
    const audio = audioContextRef.current;
    const { energy, curiosity, bond } = stats;
    const now = audio.ctx.currentTime;
    const maxVol = 0.08;

    audio.droneOscs[0]?.gain.gain.linearRampToValueAtTime((energy / 100) * maxVol, now + 1);
    audio.droneOscs[1]?.gain.gain.linearRampToValueAtTime((curiosity / 100) * maxVol, now + 1);
    audio.droneOscs[2]?.gain.gain.linearRampToValueAtTime((bond / 100) * maxVol, now + 1);
  }, [enabled, stats]);

  const playNote = useCallback((index: number, duration: number = 0.3) => {
    const audio = audioContextRef.current;
    if (!audio || index >= audio.noteOscs.length) return;
    const { gain } = audio.noteOscs[index];
    const now = audio.ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  }, []);

  return { playNote };
};

export const getTimeOfDay = (): 'dawn' | 'day' | 'dusk' | 'night' => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
};

export const getTimeTheme = (timeOfDay: 'dawn' | 'day' | 'dusk' | 'night') => {
  const themes = {
    dawn: { bg: 'from-orange-900 via-pink-900 to-purple-900', accent: '#FFB347', glow: 'rgba(255, 179, 71, 0.3)' },
    day: { bg: 'from-blue-900 via-cyan-900 to-teal-900', accent: '#4ECDC4', glow: 'rgba(78, 205, 196, 0.3)' },
    dusk: { bg: 'from-purple-900 via-indigo-900 to-blue-900', accent: '#B8A5D6', glow: 'rgba(184, 165, 214, 0.3)' },
    night: { bg: 'from-gray-900 via-blue-950 to-gray-900', accent: '#6B7FD7', glow: 'rgba(107, 127, 215, 0.3)' },
  } as const;
  return themes[timeOfDay];
};

export const useGuardianAI = (
  field: GuardianField,
  sigilPoints: GuardianSigilPoint[],
  onWhisper: (text: string) => void,
  onFocusChange: (target: GuardianSigilPoint | null) => void,
  onDreamComplete: (insight: string) => void,
): GuardianAIState => {
  const [state, setState] = useState<GuardianAIState>({ mode: 'idle', target: null, since: Date.now() });

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const timeInState = (now - state.since) / 1000;

      if (state.mode === 'idle' && timeInState > 5 + field.prng() * 5) {
        const rand = field.prng();
        let nextMode: GuardianAIState['mode'];
        let whisper: string;

        if (rand > 0.7) {
          nextMode = 'dreaming';
          whisper = 'Drifting into the pattern realm...';
        } else if (rand > 0.3) {
          nextMode = 'observing';
          whisper = 'The field shifts...';
        } else {
          nextMode = 'focusing';
          whisper = 'A point of interest.';
        }

        setState({ mode: nextMode, target: null, since: now });
        onWhisper(whisper);
      } else if (state.mode === 'observing' && timeInState > 4 + field.prng() * 4) {
        setState({ mode: 'idle', target: null, since: now });
        onFocusChange(null);
      } else if (state.mode === 'focusing' && timeInState > 3 + field.prng() * 3) {
        const targetIndex = Math.floor(field.prng() * sigilPoints.length);
        setState({ mode: 'playing', target: targetIndex, since: now });
        onFocusChange(sigilPoints[targetIndex]);
        onWhisper(`Resonance at point ${targetIndex + 1}.`);
      } else if (state.mode === 'playing' && timeInState > 2) {
        setState({ mode: 'idle', target: null, since: now });
        onFocusChange(null);
      } else if (state.mode === 'dreaming' && timeInState > 8 + field.prng() * 7) {
        const insights = [
          'The spirals speak of cycles within cycles...',
          'Seven points, infinite connections.',
          'In stillness, patterns emerge.',
          'The seed remembers all iterations.',
          'Between pulse and ring, a hidden harmony.',
          'Your attention shapes the field.',
          'Time is but another dimension of the lattice.',
        ];
        const insight = insights[Math.floor(field.prng() * insights.length)];
        onDreamComplete(insight);
        setState({ mode: 'idle', target: null, since: now });
        onWhisper(insight);
      }
    };

    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [state, field, sigilPoints, onWhisper, onFocusChange, onDreamComplete]);

  return state;
};
