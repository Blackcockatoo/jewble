import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// ===== TYPE DEFINITIONS =====
type Bigish = bigint | number;
type Field = ReturnType<typeof initField>;
type SigilPoint = { x: number; y: number; hash: string; };
type Particle = { id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; };
type Crackle = { id: number; x: number; y: number; life: number; };
type SigilPulse = { id: number; x: number; y: number; life: number; color: string; };
type FormKey = 'radiant' | 'meditation' | 'sage' | 'vigilant';
type Form = { name: string; baseColor: string; primaryGold: string; secondaryGold: string; tealAccent: string; eyeColor: string; glowColor: string; description: string; };
type Stats = { energy: number; curiosity: number; bond: number; };
type AudioOscillator = { gain: GainNode };
type AudioContextRef = { ctx: AudioContext; noteOscs: AudioOscillator[]; droneOscs: AudioOscillator[]; };
type AIState = { mode: 'idle' | 'observing' | 'focusing' | 'playing'; target: number | null; since: number; };

// ===== MOSSPRIMESEED CORE =====
const RED = "113031491493585389543778774590997079619617525721567332336510";
const BLACK = "011235831459437077415617853819099875279651673033695493257291";
const BLUE = "012776329785893036118967145479098334781325217074992143965631";

const toDigits = (s: string): number[] => s.split('').map(ch => {
  const d = ch.charCodeAt(0) - 48;
  if (d < 0 || d > 9) throw new Error(`non-digit: ${ch}`);
  return d;
});

const mix64 = (x0: Bigish): bigint => {
  let x = BigInt(x0) ^ 0x9E3779B97F4A7C15n;
  x ^= x >> 30n; x *= 0xBF58476D1CE4E5B9n;
  x ^= x >> 27n; x *= 0x94D049BB133111EBn;
  x ^= x >> 31n;
  return x & ((1n << 64n) - 1n);
};

const interleave3 = (a: string, b: string, c: string): string => {
  const n = Math.min(a.length, b.length, c.length);
  let out = "";
  for (let i = 0; i < n; i++) out += a[i] + b[i] + c[i];
  return out;
};

const base10ToHex = (digitStr: string): string => {
  const table = "0123456789abcdef".split("");
  let h = "", acc = 0;
  for (let i = 0; i < digitStr.length; i++) {
    acc = (acc * 17 + (digitStr.charCodeAt(i) - 48)) >>> 0;
    h += table[(acc ^ (i * 7)) & 15];
  }
  return h;
};

const fibFast = (n: Bigish): [bigint, bigint] => {
  const fn = (k: bigint): [bigint, bigint] => {
    if (k === 0n) return [0n, 1n];
    const [a, b] = fn(k >> 1n);
    const c = a * ((b << 1n) - a);
    const d = a * a + b * b;
    if ((k & 1n) === 0n) return [c, d];
    return [d, c + d];
  };
  return fn(BigInt(Math.max(0, Number(n))));
};

const initField = (seedName: string = "AURALIA") => {
  const red = RED, black = BLACK, blue = BLUE;
  const r = toDigits(red), k = toDigits(black), b = toDigits(blue);

  const pulse = r.map((rv, i) => (rv ^ k[(i * 7) % 60] ^ b[(i * 13) % 60]) % 10);
  const ring = Array.from({ length: 60 }, (_, i) => (r[i] + k[i] + b[i]) % 10);

  const seedStr = interleave3(red, black, blue);
  const seedBI = BigInt("0x" + base10ToHex(seedStr + seedName));

  let s0 = mix64(seedBI);
  let s1 = mix64(seedBI ^ 0xA5A5A5A5A5A5A5A5n);
  const prng = (): number => {
    let x = s0, y = s1;
    s0 = y;
    x ^= x << 23n; x ^= x >> 17n; x ^= y ^ (y >> 26n);
    s1 = x;
    const sum = (s0 + s1) & ((1n << 64n) - 1n);
    return Number(sum) / 18446744073709551616;
  };

  const hash = (msg: string): bigint => {
    let h = seedBI;
    for (let i = 0; i < msg.length; i++) {
      h = mix64(h ^ BigInt(msg.charCodeAt(i) + i * 1315423911));
    }
    return h;
  };

  const fib = (n: number): bigint => fibFast(n)[0];
  const lucas = (n: number): bigint => {
    if (n === 0) return 2n;
    const N = Math.max(0, n);
    const [Fn, Fnp1] = fibFast(N);
    return 2n * Fnp1 - Fn;
  };

  return { seed: seedName, red, black, blue, ring, pulse, hash, prng, fib, lucas };
};

// ===== AUDIO SYSTEM WITH REVERB AND LFO DRONE =====
const useAuraliaAudio = (enabled: boolean, stats: Stats) => {
  const audioContextRef = useRef<AudioContextRef | null>(null);
  const isSetup = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!enabled) {
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
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
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

      const baseFreq = 432;
      const ratios = [1, 9/8, 5/4, 3/2, 5/3, 15/8, 2];
      const noteOscs = ratios.map(ratio => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = baseFreq * ratio;
        gain.gain.value = 0;
        osc.connect(gain).connect(masterGain);
        osc.start();
        return { gain };
      });

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.2;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.005;
      lfo.connect(lfoGain);
      lfo.start();

      const droneRatios = [0.5, 0.75, 1];
      const droneOscs = droneRatios.map(ratio => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = (baseFreq / 2) * ratio;
        gain.gain.value = 0;
        lfoGain.connect(gain.gain);
        osc.connect(gain).connect(masterGain);
        osc.start();
        return { gain };
      });
      
      audioContextRef.current = { ctx, noteOscs, droneOscs };
      isSetup.current = true;
    };

    setupAudio();

    return () => {
      if (audioContextRef.current && audioContextRef.current.ctx.state !== 'closed') {
        audioContextRef.current.ctx.close();
      }
      isSetup.current = false;
    };
  }, [enabled]);

  useEffect(() => {
    const audio = audioContextRef.current;
    if (!enabled || !audio) return;
    const { energy, curiosity, bond } = stats;
    const now = audio.ctx.currentTime;
    const maxVol = 0.02;
    (audio.droneOscs[0]?.gain as any).linearRampToValueAtTime((energy / 100) * maxVol, now + 1);
    (audio.droneOscs[1]?.gain as any).linearRampToValueAtTime((curiosity / 100) * maxVol, now + 1);
    (audio.droneOscs[2]?.gain as any).linearRampToValueAtTime((bond / 100) * maxVol, now + 1);
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

// ===== GUARDIAN AI & AUTONOMOUS BEHAVIOR HOOK =====
const useGuardianAI = (field: Field, sigilPoints: SigilPoint[], onWhisper: (text: string) => void, onFocusChange: (target: SigilPoint | null) => void): AIState => {
  const [state, setState] = useState<AIState>({ mode: 'idle', target: null, since: Date.now() });

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const timeInState = (now - state.since) / 1000;

      if (state.mode === 'idle' && timeInState > 5 + field.prng() * 5) {
        const nextMode = field.prng() > 0.3 ? 'observing' : 'focusing';
        const whisper = nextMode === 'observing' ? 'The field shifts...' : 'A point of interest.';
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
      }
    };

    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [state, field, sigilPoints, onWhisper, onFocusChange]);

  return state;
};


// ===== MAIN COMPONENT =====
const AuraliaMetaPet: React.FC = () => {
  const [seedName, setSeedName] = useState<string>("AURALIA");
  const [field, setField] = useState<Field>(() => initField("AURALIA"));
  const [energy, setEnergy] = useState<number>(50);
  const [curiosity, setCuriosity] = useState<number>(50);
  const [bond, setBond] = useState<number>(50);
  const [health, setHealth] = useState<number>(80);
  const [selectedSigilPoint, setSelectedSigilPoint] = useState<number | null>(null);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [transitioning, setTransitioning] = useState<boolean>(false);
  const prevFormRef = useRef<FormKey>('radiant');
  
  const [particles, setParticles] = useState<Particle[]>([]);
  const [eyePos, setEyePos] = useState<{ x: number; y: number; }>({ x: 0, y: 0 });
  const [crackles, setCrackles] = useState<Crackle[]>([]);
  const [sigilPulses, setSigilPulses] = useState<SigilPulse[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const [whisper, setWhisper] = useState<{ text: string; key: number }>({ text: 'The Guardian is dormant.', key: 0 });
  const [aiFocus, setAiFocus] = useState<SigilPoint | null>(null);
  const [activatedPoints, setActivatedPoints] = useState<Set<number>>(new Set());
  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  const stats = useMemo(() => ({ energy, curiosity, bond }), [energy, curiosity, bond]);
  const { playNote } = useAuraliaAudio(audioEnabled, stats);

  const handleWhisper = useCallback((text: string) => setWhisper({ text, key: Date.now() }), []);
  const handleFocusChange = useCallback((target: SigilPoint | null) => setAiFocus(target), []);

  useEffect(() => {
    setField(initField(seedName));
  }, [seedName]);

  const computeGenome = (): { red60: number; blue60: number; black60: number; } => {
    const pulseSum = field.pulse.slice(0, 20).reduce((a, b) => a + b, 0);
    const ringSum = field.ring.slice(0, 20).reduce((a, b) => a + b, 0);
    const red60 = Math.min(100, (pulseSum * 1.2 + energy * 0.7 + (100 - health) * 0.3) % 100);
    const blue60 = Math.min(100, (ringSum * 1.1 + curiosity * 0.6 + bond * 0.5) % 100);
    const black60 = Math.min(100, ((pulseSum + ringSum) * 0.8 + energy * 0.4 + bond * 0.6) % 100);
    return { red60, blue60, black60 };
  };

  const { red60, blue60, black60 } = computeGenome();

  const generateSigil = useCallback((seed: string): SigilPoint[] => {
    const h = field.hash(seed);
    const points: SigilPoint[] = [];
    for (let i = 0; i < 7; i++) {
      const angle = (Number((h >> BigInt(i * 8)) & 0xFFn) / 255) * Math.PI * 2;
      const radius = 15 + (Number((h >> BigInt(i * 8 + 4)) & 0xFn) / 15) * 10;
      points.push({
        x: 200 + Math.cos(angle) * radius,
        y: 145 + Math.sin(angle) * radius,
        hash: (h >> BigInt(i * 8)).toString(16).slice(0, 4)
      });
    }
    return points;
  }, [field]);

  const sigilPoints = useMemo(() => generateSigil(seedName), [seedName, generateSigil]);

  const aiState = useGuardianAI(field, sigilPoints, handleWhisper, handleFocusChange);

  useEffect(() => {
    let animationFrameId: number;
    
    const initialParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: 200 + (field.prng() - 0.5) * 300,
      y: 200 + (field.prng() - 0.5) * 300,
      vx: (field.prng() - 0.5) * 0.2,
      vy: (field.prng() - 0.5) * 0.2,
      color: i % 3 === 0 ? '#FF6B35' : i % 3 === 1 ? '#4ECDC4' : '#A29BFE',
      size: 0.5 + field.prng() * 1.5
    }));
    setParticles(initialParticles);

    const animate = () => {
      setParticles(prev => prev.map(p => {
        let { x, y, vx, vy } = p;
        const dx = 200 - x;
        const dy = 210 - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        vx += (dx / dist) * 0.005;
        vy += (dy / dist) * 0.005;
        
        vx *= 0.99;
        vy *= 0.99;

        x += vx; y += vy;
        
        return { ...p, x, y, vx, vy };
      }));

      if (Math.random() < 0.02 * (energy / 50)) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 100 + Math.random() * 50;
        setCrackles(prev => [...prev, {
          id: Date.now() + Math.random(),
          x: 200 + Math.cos(angle) * radius,
          y: 210 + Math.sin(angle) * radius,
          life: 1
        }]);
      }
      setCrackles(prev => prev.map(c => ({ ...c, life: c.life - 0.05 })).filter(c => c.life > 0));
      
      setSigilPulses(prev => prev.map(p => ({ ...p, life: p.life - 0.04 })).filter(p => p.life > 0));

      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [field, energy]);

  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      blinkTimeout = setTimeout(blink, 3000 + Math.random() * 5000);
    };
    blinkTimeout = setTimeout(blink, 3000 + Math.random() * 5000);
    return () => clearTimeout(blinkTimeout);
  }, []);

  const getActiveForm = (): FormKey => {
    if (energy < 30 && health < 50) return 'meditation';
    if (energy > 70 && curiosity > 60) return 'vigilant';
    if (bond > 60 && curiosity > 50) return 'sage';
    return 'radiant';
  };

  const activeForm = getActiveForm();

  useEffect(() => {
    if (prevFormRef.current !== activeForm) {
      setTransitioning(true);
      if (audioEnabled) {
        [0, 2, 4, 6].forEach((note, i) => setTimeout(() => playNote(note, 0.8), i * 100));
      }
      const transitionTimeout = setTimeout(() => setTransitioning(false), 1200);
      prevFormRef.current = activeForm;
      return () => clearTimeout(transitionTimeout);
    }
  }, [activeForm, audioEnabled, playNote]);

  useEffect(() => {
    if (aiState.mode === 'observing') {
      const angle = (Date.now() / 2000) * Math.PI * 2;
      setEyePos({ x: Math.cos(angle) * 4, y: Math.sin(angle) * 2 });
    } else if (aiFocus) {
      const dx = aiFocus.x - 200;
      const dy = aiFocus.y - 145;
      const dist = Math.sqrt(dx * dx + dy * dy);
      setEyePos({ x: (dx / dist) * 4, y: (dy / dist) * 4 });
    } else if (aiState.mode === 'idle') {
      setEyePos(p => ({ x: p.x * 0.9, y: p.y * 0.9 }));
    }
  }, [aiState, aiFocus]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!svgRef.current || activeForm === 'meditation' || aiState.mode !== 'idle') return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const { x, y } = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    
    const dx = x - 200;
    const dy = y - 145;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 4;
    
    setEyePos({
      x: (dx / dist) * Math.min(dist, maxDist),
      y: (dy / dist) * Math.min(dist, maxDist)
    });
  };

  const handleSigilClick = (index: number, point: SigilPoint) => {
    setSelectedSigilPoint(index);
    if (audioEnabled) playNote(index);
    setSigilPulses(prev => [...prev, { id: Date.now(), x: point.x, y: point.y, life: 1, color: currentForm.tealAccent }]);
    
    if (!activatedPoints.has(index)) {
      setBond(b => Math.min(100, b + 5));
      setActivatedPoints(prev => new Set(prev).add(index));
      handleWhisper("A new connection forms.");
    }
  };

  const forms: Record<FormKey, Form> = {
    radiant: { name: "Radiant Guardian", baseColor: "#2C3E77", primaryGold: "#F4B942", secondaryGold: "#FFD700", tealAccent: "#4ECDC4", eyeColor: "#F4B942", glowColor: "rgba(244, 185, 66, 0.3)", description: "Calm strength - balanced blue and gold" },
    meditation: { name: "Meditation Cocoon", baseColor: "#0d1321", primaryGold: "#2DD4BF", secondaryGold: "#4ECDC4", tealAccent: "#1a4d4d", eyeColor: "#2DD4BF", glowColor: "rgba(45, 212, 191, 0.2)", description: "Quiet endurance - dusk-teal respite" },
    sage: { name: "Sage Luminary", baseColor: "#1a1f3a", primaryGold: "#FFD700", secondaryGold: "#F4B942", tealAccent: "#4ECDC4", eyeColor: "#FFD700", glowColor: "rgba(255, 215, 0, 0.4)", description: "Luminous focus - hepta-crown activated" },
    vigilant: { name: "Vigilant Sentinel", baseColor: "#1a1f3a", primaryGold: "#FF6B35", secondaryGold: "#FF8C42", tealAccent: "#4ECDC4", eyeColor: "#FF6B35", glowColor: "rgba(255, 107, 53, 0.4)", description: "Focused will - indigo with neon fire" }
  };

  const currentForm = forms[activeForm];
  const lucasNum = field.lucas(7 + (energy % 10));
  const fibNum = field.fib(5 + (curiosity % 10));

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white p-6 font-sans">
      <style>{`
        @keyframes breathe { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
        @keyframes breathePulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.9; } }
        @keyframes orbitalDrift { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .breathe-anim { animation: breathe 4s ease-in-out infinite; }
        .orbital-drift { animation: orbitalDrift 20s linear infinite; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-light mb-2" style={{ background: `linear-gradient(135deg, ${currentForm.primaryGold}, ${currentForm.tealAccent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Auralia Guardian
          </h1>
          <div className="h-px bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-50 max-w-md mx-auto" />
          <p className="text-sm text-gray-400 mt-3 font-light">
            MossPrimeSeed • Genome-driven metamorphosis • Living mathematics
          </p>
        </div>
        <div className="mb-6 max-w-md mx-auto flex gap-4">
          <div className="flex-1 bg-gray-900/80 rounded-xl p-4 border border-yellow-600/20">
            <label className="text-sm font-light text-gray-400 block mb-2">Guardian Seed Name</label>
            <input type="text" value={seedName} onChange={(e) => setSeedName(e.target.value.toUpperCase())} className="w-full bg-gray-950 border border-yellow-600/30 rounded-lg px-4 py-2 text-center font-mono text-yellow-500 focus:outline-none focus:border-yellow-600" placeholder="AURALIA" />
          </div>
          <div className="bg-gray-900/80 rounded-xl p-4 border border-yellow-600/20">
            <label className="text-sm font-light text-gray-400 block mb-2">Audio</label>
            <button onClick={() => setAudioEnabled(!audioEnabled)} className="px-4 py-2 rounded-lg bg-gray-950 border border-yellow-600/30 hover:border-yellow-600 transition-colors" aria-pressed={audioEnabled} aria-label="Toggle audio">
              {audioEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-900/80 rounded-2xl p-8 border border-yellow-600/20">
            <div 
              className="aspect-square bg-gradient-to-br from-blue-950/30 to-gray-900/30 rounded-xl flex items-center justify-center relative overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setEyePos({ x: 0, y: 0 })}
            >
              <div className="absolute inset-0 opacity-30 blur-3xl breathe-anim" style={{ background: `radial-gradient(circle at center, ${currentForm.glowColor}, transparent 70%)` }} />
              
              <svg ref={svgRef} viewBox="0 0 400 400" className="w-full h-full max-w-lg relative z-10" role="img" aria-label="Auralia guardian avatar">
                <defs>
                  <filter id="glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  <filter id="strongGlow"><feGaussianBlur stdDeviation="6" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  <radialGradient id="goldGlow"><stop offset="0%" stopColor={currentForm.primaryGold} stopOpacity="0.8" /><stop offset="100%" stopColor={currentForm.primaryGold} stopOpacity="0" /></radialGradient>
                  <linearGradient id="red60grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#FF6B35" stopOpacity={red60/100} /><stop offset="100%" stopColor="#FF6B35" stopOpacity="0" /></linearGradient>
                  
                  <filter id="formTransitionFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="3" result="turbulence">
                      <animate id="transTurb" attributeName="baseFrequency" from="0.1" to="0.01" dur="1.2s" begin="indefinite" fill="freeze" calcMode="spline" keyTimes="0; 1" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                    </feTurbulence>
                    <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="0" result="displacement">
                       <animate id="transDisp" attributeName="scale" values="0;60;0" dur="1.2s" begin="indefinite" fill="freeze" calcMode="spline" keyTimes="0; 0.5; 1" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                    </feDisplacementMap>
                  </filter>
                </defs>

                {particles.map(p => <circle key={p.id} cx={p.x} cy={p.y} r={p.size} fill={p.color} opacity="0.4" />)}

                <g opacity={bond / 150}>
                  {Array.from(activatedPoints).map((p1Index, i) => 
                    Array.from(activatedPoints).slice(i + 1).map(p2Index => (
                      <line
                        key={`${p1Index}-${p2Index}`}
                        x1={sigilPoints[p1Index].x} y1={sigilPoints[p1Index].y}
                        x2={sigilPoints[p2Index].x} y2={sigilPoints[p2Index].y}
                        stroke={currentForm.primaryGold}
                        strokeWidth="0.5"
                        opacity="0.5"
                        strokeDasharray="2,2"
                      />
                    ))
                  )}
                </g>

                <g style={{ filter: transitioning ? 'url(#formTransitionFilter)' : 'none' }}>
                  <circle cx="200" cy="200" r="150" fill="url(#goldGlow)" opacity="0.05" className="breathe-anim" />
                  <g transform="translate(200, 200) rotate(0)" className="orbital-drift" opacity="0.08">
                    <path d="M-150,0 A150,150 0 0,1 150,0 A150,150 0 0,1 -150,0" fill="none" stroke={currentForm.primaryGold} strokeWidth="0.5" />
                    <path d="M-130,0 A130,130 0 0,1 130,0 A130,130 0 0,1 -130,0" fill="none" stroke={currentForm.tealAccent} strokeWidth="0.5" />
                  </g>

                  <g transform="translate(200, 200) rotate(0)" className="orbital-drift" opacity="0.1">
                    {field.pulse.slice(0, 7).map((d, i) => (
                      <text key={i} x={Math.cos(i * Math.PI / 3.5) * 160} y={Math.sin(i * Math.PI / 3.5) * 160} fontSize="10" fill={currentForm.secondaryGold} textAnchor="middle">
                        {d}
                      </text>
                    ))}
                  </g>

                  <g>
                    <path d={`${sigilPoints.reduce((d, p, i) => d + `${i ? ' L' : 'M'} ${p.x} ${p.y}`, '')} Z`} fill="none" stroke={currentForm.tealAccent} strokeWidth="0.5" opacity="0.3" filter="url(#glow)" />
                    {sigilPoints.map((p, i) => (
                      <circle
                        key={i} cx={p.x} cy={p.y} r={selectedSigilPoint === i ? 4 : 2}
                        fill={currentForm.tealAccent} opacity={selectedSigilPoint === i ? 0.9 : 0.5}
                        filter={selectedSigilPoint === i ? "url(#strongGlow)" : "none"}
                        onClick={() => handleSigilClick(i, p)}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </g>

                  <ellipse cx="200" cy="210" rx="40" ry="60" fill={currentForm.baseColor} opacity="0.9" className="breathe-anim" />
                  <ellipse cx="200" cy="145" rx="30" ry="35" fill={currentForm.baseColor} opacity="0.9" className="breathe-anim" />

                  <rect x={200 - red60 / 4} y={150} width={red60 / 2} height={100} fill="url(#red60grad)" opacity={red60 / 150} filter="url(#glow)" />
                  <path d={`M 200 150 C 200 100, ${200 + blue60 / 2} 100, ${200 + blue60 / 2} 145`} fill="none" stroke={currentForm.tealAccent} strokeWidth="1" opacity={blue60 / 150} filter="url(#glow)" />
                  <path d={`M 200 150 C 200 100, ${200 - blue60 / 2} 100, ${200 - blue60 / 2} 145`} fill="none" stroke={currentForm.tealAccent} strokeWidth="1" opacity={blue60 / 150} filter="url(#glow)" />

                  {activeForm === 'sage' && (
                    <g transform="translate(200, 145)">
                      <path d="M 0 -50 L 20 -20 L 50 0 L 20 20 L 0 50 L -20 20 L -50 0 L -20 -20 Z" fill="none" stroke={currentForm.primaryGold} strokeWidth="1" filter="url(#strongGlow)" opacity="0.7" />
                    </g>
                  )}
                  {activeForm === 'vigilant' && (
                    <g transform="translate(200, 145)">
                      <circle r="60" fill="none" stroke={currentForm.tealAccent} strokeWidth="0.5" strokeDasharray="5,5" opacity="0.4" />
                    </g>
                  )}
                  {black60 > 70 && (
                    <circle cx="200" cy="120" r="5" fill={currentForm.primaryGold} filter="url(#strongGlow)" opacity={(black60 - 70) / 30} />
                  )}

                  {activeForm !== 'meditation' ? (
                    <g transform={`translate(${eyePos.x}, ${eyePos.y})`}>
                      {isBlinking ? (
                        <>
                          <path d="M 172 145 h 16" stroke={currentForm.eyeColor} strokeWidth="2" />
                          <path d="M 212 145 h 16" stroke={currentForm.eyeColor} strokeWidth="2" />
                        </>
                      ) : (
                        <>
                          <circle cx="180" cy="145" r="16" fill="#0d1321" opacity="0.8" />
                          <circle cx="180" cy="145" r="14" fill={currentForm.eyeColor} filter="url(#strongGlow)" opacity="0.9"><animate attributeName="r" values="14;15;14" dur="5s" repeatCount="indefinite" /></circle>
                          <circle cx="180" cy="145" r="8" fill="#FFD700" opacity="0.6" />
                          <circle cx="177" cy="142" r="3" fill="white" opacity="0.8" />
                          
                          <circle cx="220" cy="145" r="16" fill="#0d1321" opacity="0.8" />
                          <circle cx="220" cy="145" r="14" fill={currentForm.eyeColor} filter="url(#strongGlow)" opacity="0.9"><animate attributeName="r" values="14;15;14" dur="5s" repeatCount="indefinite" /></circle>
                          <circle cx="220" cy="145" r="8" fill="#FFD700" opacity="0.6" />
                          <circle cx="217" cy="142" r="3" fill="white" opacity="0.8" />
                        </>
                      )}
                    </g>
                  ) : (
                    <>
                      <path d="M 175 210 Q 182 215 190 210" stroke={currentForm.primaryGold} strokeWidth="2" fill="none" opacity="0.6" />
                      <path d="M 210 210 Q 217 215 225 210" stroke={currentForm.primaryGold} strokeWidth="2" fill="none" opacity="0.6" />
                    </>
                  )}
                </g>

                {sigilPulses.map(p => <circle key={p.id} cx={p.x} cy={p.y} r={(1 - p.life) * 30} fill="none" stroke={p.color} strokeWidth={p.life * 2} opacity={p.life} />)}

                {crackles.map(c => {
                  const d = `M ${c.x} ${c.y} l ${Math.random()*4-2} ${Math.random()*4-2} l ${Math.random()*4-2} ${Math.random()*4-2}`;
                  return <path key={c.id} d={d} stroke={c.id % 2 === 0 ? currentForm.primaryGold : currentForm.tealAccent} strokeWidth="1" fill="none" opacity={c.life} filter="url(#glow)" strokeLinecap="round" />;
                })}
              </svg>
            </div>
            
            <div className="mt-6 text-center p-4 bg-gray-950/50 rounded-lg border border-yellow-600/20">
              <p key={whisper.key} className="text-sm text-yellow-300/80 italic font-light animate-pulse">
                "{whisper.text}"
              </p>
            </div>

            <div className="mt-6 p-4 bg-gray-950/50 rounded-lg border border-yellow-600/20">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Guardian Status: {currentForm.name}</h3>
              <p className="text-sm text-gray-400">{currentForm.description}</p>
              <p className="text-sm text-gray-400 mt-2">AI Mode: <span className="font-mono text-yellow-500">{aiState.mode}</span></p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900/80 rounded-2xl p-6 border border-yellow-600/20">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Essence Attunement</h3>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-300">Energy Flow ({energy})</label><input type="range" min="0" max="100" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" /></div>
                <div><label className="block text-sm font-medium text-gray-300">Curiosity Spark ({curiosity})</label><input type="range" min="0" max="100" value={curiosity} onChange={(e) => setCuriosity(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" /></div>
                <div><label className="block text-sm font-medium text-gray-300">Bond Resonance ({bond})</label><input type="range" min="0" max="100" value={bond} onChange={(e) => setBond(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" /></div>
                <div><label className="block text-sm font-medium text-gray-300">Vitality Core ({health})</label><input type="range" min="0" max="100" value={health} onChange={(e) => setHealth(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" /></div>
              </div>
            </div>

            <div className="bg-gray-900/80 rounded-2xl p-6 border border-yellow-600/20">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Sacred Mathematics</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-gray-950/50 rounded-lg"><p className="text-sm text-gray-400">Lucas Number</p><p className="text-2xl font-mono text-yellow-500">{lucasNum.toString()}</p></div>
                <div className="p-3 bg-gray-950/50 rounded-lg"><p className="text-sm text-gray-400">Fibonacci Number</p><p className="text-2xl font-mono text-yellow-500">{fibNum.toString()}</p></div>
              </div>
            </div>

            <div className="bg-gray-900/80 rounded-2xl p-6 border border-yellow-600/20">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Trinity Genome Vaults</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400"><span>Red-60 (Spine Energy)</span><span className="font-mono text-yellow-500">{red60.toFixed(2)}%</span></div>
                <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{ width: `${red60}%` }}></div></div>
                
                <div className="flex justify-between text-sm text-gray-400 pt-2"><span>Blue-60 (Form Integrity)</span><span className="font-mono text-yellow-500">{blue60.toFixed(2)}%</span></div>
                <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${blue60}%` }}></div></div>
                
                <div className="flex justify-between text-sm text-gray-400 pt-2"><span>Black-60 (Mystery Halo)</span><span className="font-mono text-yellow-500">{black60.toFixed(2)}%</span></div>
                <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-gray-500 h-2 rounded-full" style={{ width: `${black60}%` }}></div></div>
              </div>
            </div>

            <div className="bg-gray-900/80 rounded-2xl p-6 border border-yellow-600/20">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Seed Patterns (First 10 Digits)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Pulse (Chaotic)</p>
                  <div className="flex space-x-1">
                    {field.pulse.slice(0, 10).map((d, i) => (
                      <button key={i} onClick={() => audioEnabled && playNote(d % 7)} className="flex-1 h-8 bg-gray-700 rounded-sm hover:bg-yellow-600 transition-colors relative" aria-label={`Pulse digit ${d}`}>
                        <div className="absolute bottom-0 left-0 right-0 bg-yellow-500/50" style={{ height: `${d * 10}%` }}></div>
                        <span className="relative text-xs font-mono">{d}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Ring (Harmonic)</p>
                  <div className="flex space-x-1">
                    {field.ring.slice(0, 10).map((d, i) => (
                      <button key={i} onClick={() => audioEnabled && playNote(d % 7)} className="flex-1 h-8 bg-gray-700 rounded-sm hover:bg-teal-600 transition-colors relative" aria-label={`Ring digit ${d}`}>
                        <div className="absolute bottom-0 left-0 right-0 bg-teal-500/50" style={{ height: `${d * 10}%` }}></div>
                        <span className="relative text-xs font-mono">{d}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuraliaMetaPet;
