import React, { useCallback, useEffect, useRef, useState } from 'react';

// ===== Types =====
export type GuardianStats = { energy: number; curiosity: number; bond: number };
export type GuardianSigilPoint = { x: number; y: number; hash: string };
export type GuardianField = { prng: () => number };
export type GuardianAIState = { mode: 'idle' | 'observing' | 'focusing' | 'playing' | 'dreaming'; target: number | null; since: number };
export type GuardianScaleName = 'harmonic' | 'pentatonic' | 'dorian' | 'phrygian';
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';
export type TimeTheme = { bg: string; accent: string; glow: string };

// ===== Themes =====
export const TIME_THEMES: Record<TimeOfDay, TimeTheme> = {
  dawn: { bg: 'from-orange-900 via-pink-900 to-purple-900', accent: '#FFB347', glow: 'rgba(255, 179, 71, 0.3)' },
  day: { bg: 'from-blue-900 via-cyan-900 to-teal-900', accent: '#4ECDC4', glow: 'rgba(78, 205, 196, 0.3)' },
  dusk: { bg: 'from-purple-900 via-indigo-900 to-blue-900', accent: '#B8A5D6', glow: 'rgba(184, 165, 214, 0.3)' },
  night: { bg: 'from-gray-900 via-blue-950 to-gray-900', accent: '#6B7FD7', glow: 'rgba(107, 127, 215, 0.3)' },
};

export const HIGH_CONTRAST_THEME: TimeTheme = { bg: 'from-black via-gray-900 to-black', accent: '#FFFFFF', glow: 'rgba(255, 255, 255, 0.3)' };

export const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
};

export const getTimeTheme = (timeOfDay: TimeOfDay): TimeTheme => TIME_THEMES[timeOfDay];

// ===== Audio =====
export const AUDIO_SCALES: Record<GuardianScaleName, number[]> = {
  harmonic: [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 15 / 8, 2],
  pentatonic: [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2],
  dorian: [1, 9 / 8, 32 / 27, 4 / 3, 3 / 2, 27 / 16, 16 / 9, 2],
  phrygian: [1, 256 / 243, 32 / 27, 4 / 3, 3 / 2, 128 / 81, 16 / 9, 2],
};

const BASE_FREQUENCY = 432;
const DRONE_RATIOS = [0.5, 0.75, 1];

type AudioNodes = {
  master: GainNode;
  droneGains: GainNode[];
  droneOscs: OscillatorNode[];
  noteGains: GainNode[];
  noteOscs: OscillatorNode[];
};

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const useAuraliaAudio = (enabled: boolean, stats: GuardianStats, scale: GuardianScaleName = 'harmonic') => {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNodes | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const teardown = () => {
      const ctx = ctxRef.current;
      const nodes = nodesRef.current;
      if (nodes) {
        [...nodes.droneOscs, ...nodes.noteOscs].forEach((osc) => {
          try { osc.stop(); } catch (e) {}
        });
      }
      if (ctx && ctx.state !== 'closed') {
        try { ctx.close(); } catch (e) {}
      }
      ctxRef.current = null;
      nodesRef.current = null;
    };

    if (!enabled) {
      teardown();
      return;
    }

    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx: AudioContext = new AudioCtx();
    ctxRef.current = ctx;
    if (ctx.state === 'suspended') { ctx.resume().catch(() => {}); }

    const master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(ctx.destination);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.18;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain);
    lfo.start();

    const droneGains: GainNode[] = [];
    const droneOscs: OscillatorNode[] = [];
    DRONE_RATIOS.forEach((ratio) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = BASE_FREQUENCY * ratio;
      gain.gain.value = 0.0001;
      lfoGain.connect(gain.gain);
      osc.connect(gain).connect(master);
      osc.start();
      droneOscs.push(osc);
      droneGains.push(gain);
    });

    const noteGains: GainNode[] = [];
    const noteOscs: OscillatorNode[] = [];
    const intervals = AUDIO_SCALES[scale] || AUDIO_SCALES.harmonic;
    intervals.forEach((interval) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = BASE_FREQUENCY * interval;
      gain.gain.value = 0.0001;
      osc.connect(gain).connect(master);
      osc.start();
      noteOscs.push(osc);
      noteGains.push(gain);
    });

    nodesRef.current = { master, droneGains, droneOscs, noteGains, noteOscs };

    return teardown;
  }, [enabled, scale]);

  useEffect(() => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    if (!enabled || !ctx || !nodes) return;
    const now = ctx.currentTime;
    const maxVol = 0.08;

    const setGain = (gain: GainNode | undefined, value: number) => {
      if (!gain) return;
      gain.gain.cancelScheduledValues(now);
      gain.gain.linearRampToValueAtTime(value, now + 0.5);
    };

    setGain(nodes.droneGains[0], clamp((stats.energy / 100) * maxVol, 0.00001, 0.3));
    setGain(nodes.droneGains[1], clamp((stats.curiosity / 100) * maxVol, 0.00001, 0.3));
    setGain(nodes.droneGains[2], clamp((stats.bond / 100) * maxVol, 0.00001, 0.3));
  }, [enabled, stats.energy, stats.curiosity, stats.bond]);

  const playNote = useCallback((index: number, duration = 0.45) => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    if (!ctx || !nodes || nodes.noteGains.length === 0) return;
    const idx = Math.abs(Math.floor(index || 0)) % nodes.noteGains.length;
    const gain = nodes.noteGains[idx];
    const now = ctx.currentTime;
    try {
      gain.gain.cancelScheduledValues(now);
      const start = Math.max(0.00001, Number(gain.gain.value) || 0.00001);
      gain.gain.setValueAtTime(start, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + duration);
    } catch (e) {}
  }, []);

  return { playNote };
};

// ===== AI State Machine =====
export const useGuardianAI = (
  field: GuardianField,
  sigilPoints: GuardianSigilPoint[],
  onWhisper: (text: string) => void,
  onFocusChange: (target: GuardianSigilPoint | null) => void,
  onDreamComplete?: (insight: string) => void,
): GuardianAIState => {
  const callbacksRef = useRef({ onWhisper, onFocusChange, onDreamComplete });
  useEffect(() => {
    callbacksRef.current = { onWhisper, onFocusChange, onDreamComplete };
  }, [onWhisper, onFocusChange, onDreamComplete]);

  const sigilRef = useRef<GuardianSigilPoint[]>(sigilPoints);
  useEffect(() => { sigilRef.current = sigilPoints; }, [sigilPoints]);

  const prngRef = useRef<() => number>(() => (field?.prng?.() ?? Math.random()));
  useEffect(() => { prngRef.current = () => (field?.prng?.() ?? Math.random()); }, [field]);

  const [aiState, setAiState] = useState<GuardianAIState>({ mode: 'idle', target: null, since: Date.now() });

  useEffect(() => {
    const tick = () => {
      setAiState((prev) => {
        const now = Date.now();
        const timeInState = (now - prev.since) / 1000;
        const prng = prngRef.current;
        const points = sigilRef.current;
        const cb = callbacksRef.current;

        const chooseTarget = () => {
          if (!points.length) return null;
          return Math.floor(prng() * points.length);
        };

        if (prev.mode === 'idle' && timeInState > 4 + prng() * 6) {
          const r = prng();
          if (r > 0.75) {
            cb.onWhisper?.('Drifting deeper into the weave...');
            return { mode: 'dreaming', target: null, since: now };
          }
          if (r > 0.4) {
            cb.onWhisper?.('A faint stirring across the lattice.');
            return { mode: 'observing', target: null, since: now };
          }
          const targetIndex = chooseTarget();
          if (targetIndex !== null) cb.onFocusChange?.(points[targetIndex] ?? null);
          cb.onWhisper?.('Eyes on a singular whisper...');
          return { mode: 'focusing', target: targetIndex, since: now };
        }

        if (prev.mode === 'observing' && timeInState > 3 + prng() * 3) {
          const targetIndex = chooseTarget();
          if (targetIndex !== null) cb.onFocusChange?.(points[targetIndex] ?? null);
          cb.onWhisper?.('Locking onto a new pulse.');
          return { mode: 'focusing', target: targetIndex, since: now };
        }

        if (prev.mode === 'focusing' && timeInState > 2 + prng() * 3) {
          const targetIndex = typeof prev.target === 'number' && prev.target >= 0 ? prev.target : chooseTarget();
          cb.onWhisper?.(`Resonance at point ${(targetIndex ?? 0) + 1}.`);
          return { mode: 'playing', target: targetIndex, since: now };
        }

        if (prev.mode === 'playing' && timeInState > 1.2) {
          cb.onFocusChange?.(null);
          return { mode: 'idle', target: null, since: now };
        }

        if (prev.mode === 'dreaming' && timeInState > 6 + prng() * 6) {
          const insights = [
            'The spiral bends back to itself.',
            'A minor shift reveals a major arc.',
            'Quiet attention multiplies presence.',
            'Connections prefer the gentle hand.',
          ];
          const insight = insights[Math.floor(prng() * insights.length)];
          cb.onWhisper?.(insight);
          cb.onDreamComplete?.(insight);
          return { mode: 'idle', target: null, since: now };
        }

        return prev;
      });
    };

    const id = setInterval(tick, 900);
    return () => clearInterval(id);
  }, []);

  return aiState;
};

// ===== Geometry =====
export const generateSigilPoints = (seed: number, count = 7, width = 1, height = 1): GuardianSigilPoint[] => {
  let s = Math.abs(Math.floor((Number(seed) || 0) * 1e9)) >>> 0;
  if (s === 0) s = 2166136261;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s & 0xffffff) / 0x1000000;
  };
  const points: GuardianSigilPoint[] = [];
  for (let i = 0; i < Math.max(1, Math.floor(count)); i++) {
    const a = rnd();
    const b = rnd();
    const h = ((Math.floor(a * 1e6) ^ Math.floor(b * 1e6)) >>> 0).toString(16).slice(0, 8);
    points.push({ x: a * width, y: b * height, hash: h });
  }
  return points;
};

export const GuardianSigilCanvas: React.FC<{
  width?: number;
  height?: number;
  seed?: number;
  sigilPoints?: GuardianSigilPoint[];
  aiState?: GuardianAIState;
  highlightIndex?: number | null;
}> = ({ width = 400, height = 400, seed = 0.12345, sigilPoints, aiState, highlightIndex = null }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);

    const pts = sigilPoints ?? generateSigilPoints(seed, 7, width, height);
    const stateHue = aiState?.mode === 'dreaming' ? 260 : aiState?.mode === 'playing' ? 200 : aiState?.mode === 'focusing' ? 120 : 20;
    const grd = ctx.createLinearGradient(0, 0, width, height);
    grd.addColorStop(0, `hsla(${stateHue}, 40%, 8%, 1)`);
    grd.addColorStop(1, `hsla(${(stateHue + 60) % 360}, 40%, 12%, 1)`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    pts.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.stroke();

    pts.forEach((p, i) => {
      const size = 4 * (i === (highlightIndex ?? -1) ? 2 : 1);
      ctx.beginPath();
      ctx.fillStyle = i === (highlightIndex ?? -1) ? 'rgba(255,255,255,0.95)' : `rgba(255,255,255,${Math.max(0.05, 0.6 - i * 0.06)})`;
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
      const glow = 0.8 * (i === (highlightIndex ?? -1) ? 1.6 : 1);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 6);
      g.addColorStop(0, `rgba(200,220,255,${Math.max(0, 0.12 * glow)})`);
      g.addColorStop(1, `rgba(200,220,255,0)`);
      ctx.fillStyle = g;
      ctx.fillRect(p.x - size * 6, p.y - size * 6, size * 12, size * 12);
    });

    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo((i / 8) * width, 0);
      ctx.lineTo(width - (i / 8) * width, height);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }, [width, height, seed, sigilPoints, aiState?.mode, highlightIndex]);

  return <canvas ref={canvasRef} />;
};

export default function AuraliaPlaceholder(): JSX.Element | null {
  return null;
}
