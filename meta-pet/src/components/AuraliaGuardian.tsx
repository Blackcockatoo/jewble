'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  loadGuardianState,
  saveGuardianState,
  type GuardianSaveData,
  type Offspring,
} from '@metapet/core/auralia/persistence';
import {
  getTimeOfDay,
  getTimeTheme,
  useAuraliaAudio,
  useGuardianAI,
  type GuardianScaleName as ScaleName,
  type GuardianSigilPoint,
  type GuardianStats,
} from '@metapet/core/auralia';

// ===== TYPE DEFINITIONS =====
type Bigish = bigint | number;
type Field = ReturnType<typeof initField>;
type SigilPoint = GuardianSigilPoint;
type Particle = { id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; };
type Crackle = { id: number; x: number; y: number; life: number; };
type SigilPulse = { id: number; x: number; y: number; life: number; color: string; };
type FormKey = 'radiant' | 'meditation' | 'sage' | 'vigilant' | 'celestial' | 'wild';
type Form = { name: string; baseColor: string; primaryGold: string; secondaryGold: string; tealAccent: string; eyeColor: string; glowColor: string; description: string; };
type BondHistoryEntry = { timestamp: number; bond: number; event: string; };
type MiniGameType = 'sigilPattern' | 'fibonacciTrivia' | 'snake' | 'tetris' | null;
type PatternChallenge = { sequence: number[]; userSequence: number[]; active: boolean; };
type TriviaQuestion = { question: string; answer: number; options: number[]; };
type SnakeSegment = { x: number; y: number; };
type SnakeState = { segments: SnakeSegment[]; food: { x: number; y: number }; direction: 'up' | 'down' | 'left' | 'right'; score: number; gameOver: boolean; };
type TetrisPiece = { shape: number[][]; x: number; y: number; color: string; };
type TetrisState = { board: number[][]; currentPiece: TetrisPiece | null; score: number; gameOver: boolean; };
type Stats = GuardianStats;

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
  const index = typeof n === "bigint"
    ? (n < 0n ? 0n : n)
    : BigInt(Math.max(0, Math.floor(n)));
  return fn(index);
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
    const x = s0;
    const y = s1;
    s0 = y;
    let xMut = x;
    xMut ^= xMut << 23n; xMut ^= xMut >> 17n; xMut ^= y ^ (y >> 26n);
    s1 = xMut;
    const sum = (s0 + s1) & ((1n << 64n) - 1n);
    return Number(sum) / 18446744073709551616;
  };

  const hash = (msg: string): bigint => {
    let h = seedBI;
    for (let i = 0; i < msg.length; i++) {
      h = mix64(h ^ (BigInt(msg.charCodeAt(i)) + BigInt(i) * 1315423911n));
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

// ===== MINI-GAME HELPERS =====
const generateFibonacciTrivia = (field: Field): TriviaQuestion => {
  const questions = [
    { n: 7, question: "What is the 7th Fibonacci number?", answer: Number(field.fib(7)) },
    { n: 10, question: "What is the 10th Fibonacci number?", answer: Number(field.fib(10)) },
    { n: 8, question: "What is the 8th Lucas number?", answer: Number(field.lucas(8)) },
    { n: 6, question: "What is the 6th Lucas number?", answer: Number(field.lucas(6)) },
    { n: 12, question: "What is the 12th Fibonacci number?", answer: Number(field.fib(12)) }
  ];

  const q = questions[Math.floor(field.prng() * questions.length)];
  const wrong1 = q.answer + Math.floor(field.prng() * 20) - 10;
  const wrong2 = q.answer * 2;
  const wrong3 = Math.floor(q.answer / 2);

  const options = [q.answer, wrong1, wrong2, wrong3].sort(() => field.prng() - 0.5);

  return { question: q.question, answer: q.answer, options };
};

// ===== TETRIS PIECES =====
const TETRIS_PIECES = [
  { shape: [[1,1,1,1]], color: '#00FFFF' }, // I
  { shape: [[1,1],[1,1]], color: '#FFFF00' }, // O
  { shape: [[0,1,0],[1,1,1]], color: '#FF00FF' }, // T
  { shape: [[1,1,0],[0,1,1]], color: '#00FF00' }, // S
  { shape: [[0,1,1],[1,1,0]], color: '#FF0000' }, // Z
  { shape: [[1,0,0],[1,1,1]], color: '#0000FF' }, // J
  { shape: [[0,0,1],[1,1,1]], color: '#FFA500' }  // L
];

const rotatePiece = (shape: number[][]): number[][] => {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = [];
  for (let i = 0; i < cols; i++) {
    rotated[i] = [];
    for (let j = 0; j < rows; j++) {
      rotated[i][j] = shape[rows - 1 - j][i];
    }
  }
  return rotated;
};

// ===== MAIN AURALIA SPRITE COMPONENT =====
export function AuraliaGuardian() {
  const vitals = useStore(s => s.vitals);
  const genome = useStore(s => s.genome);

  const [seedName, setSeedName] = useState<string>("AURALIA");
  const [field, setField] = useState<Field>(() => initField("AURALIA"));
  const [energy, setEnergy] = useState<number>(vitals.energy);
  const [curiosity, setCuriosity] = useState<number>(vitals.mood);
  const [bond, setBond] = useState<number>(50);
  const [health, setHealth] = useState<number>(vitals.hygiene);
  const [selectedSigilPoint, setSelectedSigilPoint] = useState<number | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const prevFormRef = useRef<FormKey>('radiant');

  const [particles, setParticles] = useState<Particle[]>([]);
  const [eyePos, setEyePos] = useState<{ x: number; y: number; }>({ x: 0, y: 0 });
  const [crackles, setCrackles] = useState<Crackle[]>([]);
  const [sigilPulses, setSigilPulses] = useState<SigilPulse[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const [whisper, setWhisper] = useState<{ text: string; key: number }>({ text: 'The Guardian awakens...', key: 0 });
  const [aiFocus, setAiFocus] = useState<SigilPoint | null>(null);
  const [activatedPoints, setActivatedPoints] = useState<Set<number>>(new Set());
  const [isBlinking, setIsBlinking] = useState(false);
  const [bondHistory, setBondHistory] = useState<BondHistoryEntry[]>([]);
  const [totalInteractions, setTotalInteractions] = useState<number>(0);
  const [dreamCount, setDreamCount] = useState<number>(0);
  const [gamesWon, setGamesWon] = useState<number>(0);
  const [createdAt] = useState<number>(() => Date.now());
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>(() => getTimeOfDay());

  const [currentGame, setCurrentGame] = useState<MiniGameType>(null);
  const [patternChallenge, setPatternChallenge] = useState<PatternChallenge>({ sequence: [], userSequence: [], active: false });
  const [triviaQuestion, setTriviaQuestion] = useState<TriviaQuestion | null>(null);
  const [audioScale, setAudioScale] = useState<ScaleName>('harmonic');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [snakeState, setSnakeState] = useState<SnakeState>({ segments: [{x: 5, y: 5}], food: {x: 10, y: 10}, direction: 'right', score: 0, gameOver: false });
  const [tetrisState, setTetrisState] = useState<TetrisState>({ board: Array(20).fill(null).map(() => Array(10).fill(0)), currentPiece: null, score: 0, gameOver: false });
  const [offspring, setOffspring] = useState<Offspring[]>([]);
  const [breedingPartner, setBreedingPartner] = useState<string>('');

  // Sync with store
  useEffect(() => {
    setEnergy(vitals.energy);
    setCuriosity(vitals.mood);
    setHealth(vitals.hygiene);
  }, [vitals.energy, vitals.mood, vitals.hygiene]);

  const stats = useMemo(() => ({ energy, curiosity, bond }), [energy, curiosity, bond]);
  const { playNote } = useAuraliaAudio(audioEnabled, stats, audioScale);

  const addToBondHistory = useCallback((event: string) => {
    setBondHistory(prev => [...prev.slice(-29), { timestamp: Date.now(), bond, event }]);
  }, [bond]);

  const handleWhisper = useCallback((text: string) => setWhisper({ text, key: Date.now() }), []);
  const handleFocusChange = useCallback((target: SigilPoint | null) => setAiFocus(target), []);
  const handleDreamComplete = useCallback((insight: string) => {
    setDreamCount(prev => prev + 1);
    addToBondHistory(`Dream #${dreamCount + 1}: ${insight}`);
  }, [dreamCount, addToBondHistory]);

  // Load saved state on mount
  useEffect(() => {
    const saved = loadGuardianState();
    if (saved) {
      setSeedName(saved.seedName);
      setEnergy(saved.energy);
      setCuriosity(saved.curiosity);
      setBond(saved.bond);
      setHealth(saved.health);
      setBondHistory(saved.bondHistory || []);
      setActivatedPoints(new Set(saved.activatedPoints || []));
      setTotalInteractions(saved.totalInteractions || 0);
      setDreamCount(saved.dreamCount || 0);
      setGamesWon(saved.gamesWon || 0);
      setHighContrast(saved.highContrast || false);
      setOffspring(saved.offspring || []);
      setBreedingPartner(saved.breedingPartner || '');
      handleWhisper('Welcome back. The patterns remember you.');
    }
  }, [handleWhisper]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const saveData: GuardianSaveData = {
        seedName,
        energy,
        curiosity,
        bond,
        health,
        bondHistory,
        activatedPoints: Array.from(activatedPoints),
        createdAt,
        lastSaved: Date.now(),
        totalInteractions,
        dreamCount,
        gamesWon,
        highContrast,
        offspring,
        breedingPartner
      };
      saveGuardianState(saveData);
    }, 30000);

    return () => clearInterval(interval);
  }, [seedName, energy, curiosity, bond, health, bondHistory, activatedPoints, createdAt, totalInteractions, dreamCount, gamesWon, highContrast, offspring, breedingPartner]);

  // Update time of day every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const aiState = useGuardianAI(field, sigilPoints, handleWhisper, handleFocusChange, handleDreamComplete);

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
    if (bond > 80 && dreamCount > 3) return 'celestial';
    if (energy > 80 && curiosity > 70 && activatedPoints.size >= 5) return 'wild';
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

    setTotalInteractions(prev => prev + 1);

    // If pattern game is active, handle differently
    if (patternChallenge.active) {
      const newUserSequence = [...patternChallenge.userSequence, index];
      setPatternChallenge(prev => ({ ...prev, userSequence: newUserSequence }));

      if (newUserSequence.length === patternChallenge.sequence.length) {
        const success = newUserSequence.every((v, i) => v === patternChallenge.sequence[i]);
        if (success) {
          setBond(b => Math.min(100, b + 10));
          setCuriosity(c => Math.min(100, c + 5));
          setGamesWon(prev => prev + 1);
          addToBondHistory(`Won pattern game! Sequence: ${patternChallenge.sequence.map(i => i + 1).join(', ')}`);
          handleWhisper("Perfect resonance! The pattern is revealed.");
        } else {
          handleWhisper("The pattern eludes you... Try again.");
        }
        setPatternChallenge({ sequence: [], userSequence: [], active: false });
        setCurrentGame(null);
      }
      return;
    }

    if (!activatedPoints.has(index)) {
      setBond(b => Math.min(100, b + 5));
      setActivatedPoints(prev => new Set(prev).add(index));
      addToBondHistory(`Activated sigil point ${index + 1}`);
      handleWhisper("A new connection forms.");
    } else {
      addToBondHistory(`Resonated with sigil point ${index + 1}`);
    }
  };

  const startPatternGame = () => {
    const length = 3 + Math.floor(field.prng() * 3); // 3-5 points
    const sequence: number[] = [];
    for (let i = 0; i < length; i++) {
      sequence.push(Math.floor(field.prng() * 7));
    }
    setPatternChallenge({ sequence, userSequence: [], active: true });
    setCurrentGame('sigilPattern');
    handleWhisper(`Memorize this pattern: ${sequence.map(i => i + 1).join(' → ')}`);

    // Play the sequence
    if (audioEnabled) {
      sequence.forEach((note, i) => setTimeout(() => playNote(note, 0.5), i * 600));
    }
  };

  const startTriviaGame = () => {
    const question = generateFibonacciTrivia(field);
    setTriviaQuestion(question);
    setCurrentGame('fibonacciTrivia');
    handleWhisper(question.question);
  };

  const answerTrivia = (answer: number) => {
    if (!triviaQuestion) return;

    if (answer === triviaQuestion.answer) {
      setBond(b => Math.min(100, b + 8));
      setCuriosity(c => Math.min(100, c + 12));
      setGamesWon(prev => prev + 1);
      addToBondHistory(`Answered trivia correctly: ${triviaQuestion.answer}`);
      handleWhisper("Wisdom flows through the numbers!");
      if (audioEnabled) {
        [0, 2, 4].forEach((note, i) => setTimeout(() => playNote(note, 0.3), i * 150));
      }
    } else {
      handleWhisper(`Not quite. The answer was ${triviaQuestion.answer}.`);
    }

    setTriviaQuestion(null);
    setCurrentGame(null);
  };

  // ===== SNAKE GAME LOGIC =====
  const startSnakeGame = () => {
    const initialFood = { x: Math.floor(field.prng() * 15), y: Math.floor(field.prng() * 15) };
    setSnakeState({ segments: [{x: 5, y: 5}, {x: 4, y: 5}, {x: 3, y: 5}], food: initialFood, direction: 'right', score: 0, gameOver: false });
    setCurrentGame('snake');
    handleWhisper('Navigate the serpent through the grid!');
  };

  const resetSnakeGame = () => {
    startSnakeGame();
  };

  useEffect(() => {
    if (currentGame !== 'snake' || snakeState.gameOver) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const { direction } = snakeState;
      if (e.key === 'ArrowUp' && direction !== 'down') setSnakeState(s => ({ ...s, direction: 'up' }));
      if (e.key === 'ArrowDown' && direction !== 'up') setSnakeState(s => ({ ...s, direction: 'down' }));
      if (e.key === 'ArrowLeft' && direction !== 'right') setSnakeState(s => ({ ...s, direction: 'left' }));
      if (e.key === 'ArrowRight' && direction !== 'left') setSnakeState(s => ({ ...s, direction: 'right' }));
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentGame, snakeState]);

  useEffect(() => {
    if (currentGame !== 'snake' || snakeState.gameOver) return;

    const gameLoop = setInterval(() => {
      setSnakeState(prev => {
        const head = prev.segments[0];
        const newHead = { ...head };

        if (prev.direction === 'up') newHead.y -= 1;
        if (prev.direction === 'down') newHead.y += 1;
        if (prev.direction === 'left') newHead.x -= 1;
        if (prev.direction === 'right') newHead.x += 1;

        const willGrow = newHead.x === prev.food.x && newHead.y === prev.food.y;
        const bodyToCheck = willGrow ? prev.segments : prev.segments.slice(0, -1);

        // Check collision with walls or self
        if (newHead.x < 0 || newHead.x >= 15 || newHead.y < 0 || newHead.y >= 15 ||
            bodyToCheck.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          handleWhisper(`Snake game over! Score: ${prev.score}`);
          return { ...prev, gameOver: true };
        }

        const newSegments = [newHead, ...prev.segments];

        // Check if ate food
        if (willGrow) {
          let newFood = prev.food;
          for (let attempts = 0; attempts < 50; attempts++) {
            const candidate = { x: Math.floor(field.prng() * 15), y: Math.floor(field.prng() * 15) };
            const overlapsSnake = newSegments.some(seg => seg.x === candidate.x && seg.y === candidate.y);
            if (!overlapsSnake) {
              newFood = candidate;
              break;
            }
          }
          if (audioEnabled) playNote(prev.score % 7, 0.2);

          const newScore = prev.score + 10;
          if (newScore >= 50 && !prev.gameOver) {
            setBond(b => Math.min(100, b + 15));
            setEnergy(e => Math.min(100, e + 10));
            setGamesWon(g => g + 1);
            addToBondHistory(`Won Snake game with score ${newScore}!`);
            handleWhisper(`Serpent mastery achieved! ${newScore} points.`);
            return { ...prev, gameOver: true };
          }

          return { ...prev, segments: newSegments, food: newFood, score: newScore };
        } else {
          newSegments.pop();
          return { ...prev, segments: newSegments };
        }
      });
    }, 200);

    return () => clearInterval(gameLoop);
  }, [currentGame, snakeState.gameOver, audioEnabled, playNote, field, addToBondHistory, handleWhisper]);

  // ===== TETRIS GAME LOGIC =====
  const startTetrisGame = () => {
    const piece = TETRIS_PIECES[Math.floor(field.prng() * TETRIS_PIECES.length)];
    setTetrisState({
      board: Array(20).fill(null).map(() => Array(10).fill(0)),
      currentPiece: { ...piece, x: 4, y: 0 },
      score: 0,
      gameOver: false
    });
    setCurrentGame('tetris');
    handleWhisper('Stack the sacred geometries!');
  };

  const resetTetrisGame = () => {
    startTetrisGame();
  };

  const canPlacePiece = useCallback((piece: TetrisPiece, board: number[][], offsetX: number = 0, offsetY: number = 0): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + offsetX;
          const newY = piece.y + y + offsetY;
          if (newX < 0 || newX >= 10 || newY >= 20 || (newY >= 0 && board[newY][newX])) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const moveTetrisPiece = useCallback((dx: number, dy: number) => {
    setTetrisState(prev => {
      if (!prev.currentPiece) return prev;
      if (canPlacePiece(prev.currentPiece, prev.board, dx, dy)) {
        return { ...prev, currentPiece: { ...prev.currentPiece, x: prev.currentPiece.x + dx, y: prev.currentPiece.y + dy } };
      }
      return prev;
    });
  }, [canPlacePiece]);

  const rotateTetrisPiece = useCallback(() => {
    setTetrisState(prev => {
      if (!prev.currentPiece) return prev;
      const rotated = { ...prev.currentPiece, shape: rotatePiece(prev.currentPiece.shape) };
      if (canPlacePiece(rotated, prev.board)) {
        return { ...prev, currentPiece: rotated };
      }
      return prev;
    });
  }, [canPlacePiece]);

  useEffect(() => {
    if (currentGame !== 'tetris' || !tetrisState.currentPiece || tetrisState.gameOver) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') moveTetrisPiece(-1, 0);
      if (e.key === 'ArrowRight') moveTetrisPiece(1, 0);
      if (e.key === 'ArrowDown') moveTetrisPiece(0, 1);
      if (e.key === 'ArrowUp') rotateTetrisPiece();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentGame, tetrisState, moveTetrisPiece, rotateTetrisPiece]);

  const lockPiece = useCallback(() => {
    setTetrisState(prev => {
      if (!prev.currentPiece) return prev;

      const newBoard = prev.board.map(row => [...row]);
      const piece = prev.currentPiece;

      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x] && piece.y + y >= 0) {
            newBoard[piece.y + y][piece.x + x] = 1;
          }
        }
      }

      // Clear full rows
      let linesCleared = 0;
      for (let y = newBoard.length - 1; y >= 0; y--) {
        if (newBoard[y].every(cell => cell === 1)) {
          newBoard.splice(y, 1);
          newBoard.unshift(Array(10).fill(0));
          linesCleared++;
          y++;
        }
      }

      const newScore = prev.score + linesCleared * 100;

      // Create new piece
      const nextPiece = TETRIS_PIECES[Math.floor(field.prng() * TETRIS_PIECES.length)];
      const newPiece = { ...nextPiece, x: 4, y: 0 };

      if (!canPlacePiece(newPiece, newBoard)) {
        handleWhisper(`Tetris complete! Score: ${newScore}`);
        if (newScore >= 300) {
          setBond(b => Math.min(100, b + 20));
          setCuriosity(c => Math.min(100, c + 15));
          setGamesWon(g => g + 1);
          addToBondHistory(`Won Tetris with score ${newScore}!`);
        }
        return { ...prev, board: newBoard, score: newScore, gameOver: true, currentPiece: null };
      }

      if (linesCleared > 0 && audioEnabled) {
        playNote(linesCleared % 7, 0.3);
      }

      return { ...prev, board: newBoard, currentPiece: newPiece, score: newScore };
    });
  }, [canPlacePiece, field, handleWhisper, setBond, setCuriosity, setGamesWon, addToBondHistory, audioEnabled, playNote]);

  useEffect(() => {
    if (currentGame !== 'tetris' || !tetrisState.currentPiece || tetrisState.gameOver) return;

    const gameLoop = setInterval(() => {
      setTetrisState(prev => {
        if (!prev.currentPiece) return prev;
        if (canPlacePiece(prev.currentPiece, prev.board, 0, 1)) {
          return { ...prev, currentPiece: { ...prev.currentPiece, y: prev.currentPiece.y + 1 } };
        } else {
          lockPiece();
          return prev;
        }
      });
    }, 500);

    return () => clearInterval(gameLoop);
  }, [currentGame, tetrisState.currentPiece, tetrisState.gameOver, lockPiece, canPlacePiece]);

  // ===== BREEDING SYSTEM =====
  const breedGuardian = () => {
    if (!breedingPartner || bond < 70) {
      handleWhisper('Bond must be at least 70 to breed, and you need a partner name.');
      return;
    }

    const partnerField = initField(breedingPartner);
    const partnerGenome = {
      red60: Math.min(100, (partnerField.pulse.slice(0, 20).reduce((a, b) => a + b, 0) * 1.5) % 100),
      blue60: Math.min(100, (partnerField.ring.slice(0, 20).reduce((a, b) => a + b, 0) * 1.3) % 100),
      black60: Math.min(100, ((partnerField.pulse.slice(0, 10).reduce((a, b) => a + b, 0) + partnerField.ring.slice(0, 10).reduce((a, b) => a + b, 0)) * 1.1) % 100)
    };

    const childGenome = {
      red60: (red60 + partnerGenome.red60) / 2 + (field.prng() - 0.5) * 10,
      blue60: (blue60 + partnerGenome.blue60) / 2 + (field.prng() - 0.5) * 10,
      black60: (black60 + partnerGenome.black60) / 2 + (field.prng() - 0.5) * 10
    };

    const childName = `${seedName.slice(0, 3)}${breedingPartner.slice(0, 3)}${Math.floor(field.prng() * 999)}`.toUpperCase();

    const child: Offspring = {
      name: childName,
      genome: childGenome,
      parents: [seedName, breedingPartner],
      birthDate: Date.now()
    };

    setOffspring(prev => [...prev, child]);
    setBond(b => Math.min(100, b + 25));
    setCuriosity(c => Math.min(100, c + 20));
    setGamesWon(g => g + 1);
    addToBondHistory(`Bred new Guardian: ${childName}`);
    handleWhisper(`New Guardian born: ${childName}! The lineage continues.`);

    if (audioEnabled) {
      [0, 2, 4, 5, 7].forEach((note, i) => setTimeout(() => playNote(note, 0.5), i * 200));
    }
  };

  const forms: Record<FormKey, Form> = {
    radiant: { name: "Radiant Guardian", baseColor: "#2C3E77", primaryGold: "#F4B942", secondaryGold: "#FFD700", tealAccent: "#4ECDC4", eyeColor: "#F4B942", glowColor: "rgba(244, 185, 66, 0.3)", description: "Calm strength - balanced blue and gold" },
    meditation: { name: "Meditation Cocoon", baseColor: "#0d1321", primaryGold: "#2DD4BF", secondaryGold: "#4ECDC4", tealAccent: "#1a4d4d", eyeColor: "#2DD4BF", glowColor: "rgba(45, 212, 191, 0.2)", description: "Quiet endurance - dusk-teal respite" },
    sage: { name: "Sage Luminary", baseColor: "#1a1f3a", primaryGold: "#FFD700", secondaryGold: "#F4B942", tealAccent: "#4ECDC4", eyeColor: "#FFD700", glowColor: "rgba(255, 215, 0, 0.4)", description: "Luminous focus - hepta-crown activated" },
    vigilant: { name: "Vigilant Sentinel", baseColor: "#1a1f3a", primaryGold: "#FF6B35", secondaryGold: "#FF8C42", tealAccent: "#4ECDC4", eyeColor: "#FF6B35", glowColor: "rgba(255, 107, 53, 0.4)", description: "Focused will - indigo with neon fire" },
    celestial: { name: "Celestial Voyager", baseColor: "#0A1128", primaryGold: "#E0E7FF", secondaryGold: "#C4B5FD", tealAccent: "#8B5CF6", eyeColor: "#E0E7FF", glowColor: "rgba(139, 92, 246, 0.5)", description: "Cosmic transcendence - stardust and void" },
    wild: { name: "Wild Verdant", baseColor: "#1A4D2E", primaryGold: "#7FFF00", secondaryGold: "#32CD32", tealAccent: "#90EE90", eyeColor: "#7FFF00", glowColor: "rgba(127, 255, 0, 0.4)", description: "Primal vitality - fractal growth unleashed" }
  };

  const currentForm = forms[activeForm];
  const lucasNum = field.lucas(7 + (energy % 10));
  const fibNum = field.fib(5 + (curiosity % 10));
  const timeTheme = getTimeTheme(timeOfDay);

  return (
    <div className={`w-full min-h-screen bg-gradient-to-br ${highContrast ? 'from-black via-gray-900 to-black' : timeTheme.bg} text-white p-4 md:p-6 pb-12 font-sans transition-colors duration-[3000ms] overflow-y-auto`}>
      <style>{`
        @keyframes breathe { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
        @keyframes breathePulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.9; } }
        @keyframes orbitalDrift { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .breathe-anim { animation: breathe 4s ease-in-out infinite; }
        .orbital-drift { animation: orbitalDrift 20s linear infinite; }
        ${highContrast ? `
          .bg-gray-900\\/80 { background-color: rgba(0, 0, 0, 0.95) !important; border-color: rgba(255, 255, 255, 0.3) !important; }
          .text-gray-400 { color: rgba(255, 255, 255, 0.9) !important; }
        ` : ''}
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-light mb-2" style={{ background: `linear-gradient(135deg, ${currentForm.primaryGold}, ${currentForm.tealAccent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Auralia Guardian
          </h1>
          <div className="h-px bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-50 max-w-md mx-auto" />
          <p className="text-xs md:text-sm text-gray-400 mt-3 font-light">
            MossPrimeSeed • Genome-driven metamorphosis • Living mathematics
          </p>
        </div>
        <div className="mb-6 max-w-md mx-auto flex flex-col sm:flex-row gap-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-gray-900/80 rounded-2xl p-8 border border-yellow-600/20 lg:sticky lg:top-4">
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
                  {activeForm === 'celestial' && (
                    <g transform="translate(200, 145)">
                      <circle r="80" fill="none" stroke={currentForm.primaryGold} strokeWidth="0.5" opacity="0.4">
                        <animate attributeName="r" values="80;85;80" dur="4s" repeatCount="indefinite" />
                      </circle>
                      <circle r="65" fill="none" stroke={currentForm.tealAccent} strokeWidth="0.5" opacity="0.3">
                        <animate attributeName="r" values="65;70;65" dur="5s" repeatCount="indefinite" />
                      </circle>
                      {[0, 60, 120, 180, 240, 300].map((angle) => (
                        <g key={angle} transform={`rotate(${angle} 0 0)`}>
                          <circle cx="0" cy="-75" r="2" fill={currentForm.primaryGold} opacity="0.8" filter="url(#strongGlow)">
                            <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" begin={`${angle/60}s`} />
                          </circle>
                          <path d="M 0 -75 L 2 -80 L -2 -80 Z" fill={currentForm.tealAccent} opacity="0.6">
                            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" begin={`${angle/60}s`} />
                          </path>
                        </g>
                      ))}
                    </g>
                  )}
                  {activeForm === 'wild' && (
                    <g transform="translate(200, 145)">
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                        <g key={angle} transform={`rotate(${angle} 0 0)`}>
                          <path
                            d={`M 0 -55 Q ${5 + i * 2} -${65 + i * 3} ${8 + i * 3} -${75 + i * 5}`}
                            stroke={i % 2 === 0 ? currentForm.primaryGold : currentForm.secondaryGold}
                            strokeWidth="2"
                            fill="none"
                            opacity="0.7"
                            filter="url(#glow)"
                          >
                            <animate
                              attributeName="d"
                              values={`M 0 -55 Q ${5 + i * 2} -${65 + i * 3} ${8 + i * 3} -${75 + i * 5};M 0 -55 Q ${7 + i * 2} -${68 + i * 3} ${10 + i * 3} -${78 + i * 5};M 0 -55 Q ${5 + i * 2} -${65 + i * 3} ${8 + i * 3} -${75 + i * 5}`}
                              dur={`${2 + i * 0.3}s`}
                              repeatCount="indefinite"
                            />
                          </path>
                          <circle cx="0" cy={`-${75 + i * 5}`} r="3" fill={currentForm.tealAccent} opacity="0.6">
                            <animate attributeName="r" values="3;5;3" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                          </circle>
                        </g>
                      ))}
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
                &quot;{whisper.text}&quot;
              </p>
            </div>

            <div className="mt-6 p-4 bg-gray-950/50 rounded-lg border border-yellow-600/20">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Guardian Status: {currentForm.name}</h3>
              <p className="text-sm text-gray-400">{currentForm.description}</p>
              <div className="mt-3 space-y-1">
                <p className="text-sm text-gray-400">AI Mode: <span className={`font-mono ${aiState.mode === 'dreaming' ? 'text-purple-400 animate-pulse' : 'text-yellow-500'}`}>{aiState.mode}</span></p>
                <p className="text-sm text-gray-400">Time: <span className="font-mono text-teal-400">{timeOfDay}</span></p>
                <p className="text-sm text-gray-400">Dreams: <span className="font-mono text-purple-400">{dreamCount}</span> | Interactions: <span className="font-mono text-cyan-400">{totalInteractions}</span></p>
                <p className="text-sm text-gray-400">Sigils Activated: <span className="font-mono text-green-400">{activatedPoints.size}/7</span></p>
              </div>
            </div>

            {bondHistory.length > 0 && (
              <div className="mt-6 p-4 bg-gray-950/50 rounded-lg border border-yellow-600/20 max-h-48 overflow-y-auto">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Bond Chronicle</h3>
                <div className="space-y-2">
                  {bondHistory.slice(-10).reverse().map((entry, i) => (
                    <div key={entry.timestamp} className="text-xs text-gray-400 border-l-2 border-teal-600/30 pl-2">
                      <span className="text-teal-400 font-mono">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                      <span className="mx-2 text-gray-500">•</span>
                      <span>{entry.event}</span>
                      <span className="ml-2 text-yellow-500">({entry.bond})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

            <div className="bg-gray-900/80 rounded-2xl p-6 border border-yellow-600/20">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Sacred Games</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={startPatternGame}
                  disabled={currentGame !== null}
                  className="px-3 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-all text-sm"
                  aria-label="Start sigil pattern matching game"
                >
                  🔮 Sigil Pattern
                </button>
                <button
                  onClick={startTriviaGame}
                  disabled={currentGame !== null}
                  className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-all text-sm"
                  aria-label="Start Fibonacci trivia quiz"
                >
                  🧮 Number Quiz
                </button>
                <button
                  onClick={startSnakeGame}
                  disabled={currentGame !== null}
                  className="px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-all text-sm"
                  aria-label="Start Snake game"
                >
                  🐍 Snake
                </button>
                <button
                  onClick={startTetrisGame}
                  disabled={currentGame !== null}
                  className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-all text-sm"
                  aria-label="Start Tetris game"
                >
                  🟦 Tetris
                </button>
              </div>
              {gamesWon > 0 && (
                <p className="text-xs text-center text-green-400 mt-3">
                  Games Won: {gamesWon}
                </p>
              )}

              {patternChallenge.active && (
                <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <p className="text-sm text-purple-300 mb-2">
                    Pattern: {patternChallenge.sequence.map(i => i + 1).join(' → ')}
                  </p>
                  <p className="text-xs text-gray-400">
                    Your input ({patternChallenge.userSequence.length}/{patternChallenge.sequence.length}): {patternChallenge.userSequence.map(i => i + 1).join(' → ')}
                  </p>
                </div>
              )}

              {triviaQuestion && (
                <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
                  <p className="text-sm text-indigo-200 mb-3 font-medium">{triviaQuestion.question}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {triviaQuestion.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => answerTrivia(opt)}
                        className="px-3 py-2 bg-indigo-700/40 hover:bg-indigo-600/60 rounded transition-colors text-sm"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentGame === 'snake' && (
                <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm text-green-300 font-medium">Snake Game</p>
                    <p className="text-sm text-green-400">Score: {snakeState.score}</p>
                  </div>
                  {snakeState.gameOver ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-red-400 mb-2">Game Over!</p>
                      <button onClick={resetSnakeGame} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm">
                        Play Again
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-15 gap-0.5 bg-gray-950 p-2 rounded">
                      {Array.from({ length: 15 }).map((_, y) => (
                        <div key={y} className="flex gap-0.5">
                          {Array.from({ length: 15 }).map((_, x) => {
                            const isSnake = snakeState.segments.some(seg => seg.x === x && seg.y === y);
                            const isHead = snakeState.segments[0].x === x && snakeState.segments[0].y === y;
                            const isFood = snakeState.food.x === x && snakeState.food.y === y;
                            return (
                              <div
                                key={x}
                                className={`w-3 h-3 rounded-sm ${isHead ? 'bg-green-400' : isSnake ? 'bg-green-600' : isFood ? 'bg-red-500' : 'bg-gray-800'}`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2 text-center">Use arrow keys to control</p>
                </div>
              )}

              {currentGame === 'tetris' && (
                <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm text-indigo-300 font-medium">Tetris Game</p>
                    <p className="text-sm text-indigo-400">Score: {tetrisState.score}</p>
                  </div>
                  {tetrisState.gameOver ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-red-400 mb-2">Game Over!</p>
                      <button onClick={resetTetrisGame} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm">
                        Play Again
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-950 p-2 rounded inline-block">
                      {tetrisState.board.map((row, y) => (
                        <div key={y} className="flex gap-0.5">
                          {row.map((cell, x) => {
                            let cellColor = cell ? '#4B5563' : '#1F2937';
                            if (tetrisState.currentPiece) {
                              const piece = tetrisState.currentPiece;
                              for (let py = 0; py < piece.shape.length; py++) {
                                for (let px = 0; px < piece.shape[py].length; px++) {
                                  if (piece.shape[py][px] && piece.x + px === x && piece.y + py === y) {
                                    cellColor = piece.color;
                                  }
                                }
                              }
                            }
                            return (
                              <div
                                key={x}
                                className="w-4 h-4 rounded-sm"
                                style={{ backgroundColor: cellColor }}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2 text-center">Arrows: move/rotate (↑), Drop: ↓</p>
                </div>
              )}
            </div>

            <div className="bg-gray-900/80 rounded-2xl p-6 border border-yellow-600/20">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Breeding & Lineage</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Partner Guardian Name</label>
                  <input
                    type="text"
                    value={breedingPartner}
                    onChange={(e) => setBreedingPartner(e.target.value.toUpperCase())}
                    className="w-full bg-gray-950 border border-yellow-600/30 rounded-lg px-4 py-2 text-center font-mono text-cyan-400 focus:outline-none focus:border-yellow-600"
                    placeholder="PARTNER"
                  />
                </div>
                <button
                  onClick={breedGuardian}
                  disabled={bond < 70 || !breedingPartner}
                  className="w-full px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-all"
                  aria-label="Breed new Guardian"
                >
                  💞 Breed Guardian (Bond ≥ 70)
                </button>
                {offspring.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-semibold text-purple-400">Offspring ({offspring.length})</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {offspring.map((child, i) => (
                        <div key={i} className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                          <p className="text-sm text-purple-300 font-mono">{child.name}</p>
                          <p className="text-xs text-gray-400">Parents: {child.parents.join(' × ')}</p>
                          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                            <div><span className="text-gray-400">R:</span> <span className="text-red-400">{child.genome.red60.toFixed(1)}</span></div>
                            <div><span className="text-gray-400">B:</span> <span className="text-blue-400">{child.genome.blue60.toFixed(1)}</span></div>
                            <div><span className="text-gray-400">K:</span> <span className="text-gray-400">{child.genome.black60.toFixed(1)}</span></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{new Date(child.birthDate).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-900/80 rounded-2xl p-6 border border-yellow-600/20">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Audio Scale</label>
                  <select
                    value={audioScale}
                    onChange={(e) => setAudioScale(e.target.value as ScaleName)}
                    className="w-full bg-gray-950 border border-yellow-600/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-600"
                    aria-label="Select audio scale"
                  >
                    <option value="harmonic">Harmonic (Just Intonation)</option>
                    <option value="pentatonic">Pentatonic</option>
                    <option value="dorian">Dorian Mode</option>
                    <option value="phrygian">Phrygian Mode</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="highContrast" className="text-sm font-medium text-gray-300">
                    High Contrast Mode
                  </label>
                  <button
                    id="highContrast"
                    onClick={() => setHighContrast(!highContrast)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${highContrast ? 'bg-yellow-500' : 'bg-gray-600'}`}
                    role="switch"
                    aria-checked={highContrast}
                    aria-label="Toggle high contrast mode"
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${highContrast ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
