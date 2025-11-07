'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from './ui/button';
import { BrainCircuit, Music4 } from 'lucide-react';

export function MiniGamesPanel() {
  const miniGames = useStore(s => s.miniGames);
  const vitals = useStore(s => s.vitals);
  const updateScore = useStore(s => s.updateMiniGameScore);

  const [memoryLog, setMemoryLog] = useState<string>('Solve memory puzzles to raise temperament.');
  const [rhythmLog, setRhythmLog] = useState<string>('Sync to cosmic beats for energy surges.');

  const playMemory = () => {
    const base = Math.round((vitals.mood + vitals.energy) / 20);
    const noise = Math.floor(Math.random() * 4);
    const score = base + noise;
    updateScore('memory', score);
    setMemoryLog(`Pattern recall score: ${score}. High score: ${Math.max(score, miniGames.memoryHighScore)}.`);
  };

  const playRhythm = () => {
    const base = Math.round((vitals.energy + vitals.hygiene) / 18);
    const noise = Math.floor(Math.random() * 5);
    const score = base + noise;
    updateScore('rhythm', score);
    setRhythmLog(`Rhythm alignment score: ${score}. High score: ${Math.max(score, miniGames.rhythmHighScore)}.`);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <BrainCircuit className="w-5 h-5 text-emerald-300" />
        Conscious Mini-Games
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <BrainCircuit className="w-4 h-4 text-emerald-300" />
            Memory Sequence
          </div>
          <p className="text-xs text-zinc-400">Higher mood and energy produce better recall performance.</p>
          <Button onClick={playMemory} className="gap-2">
            <BrainCircuit className="w-4 h-4" />
            Attempt Memory Shuffle
          </Button>
          <p className="text-xs text-zinc-400 italic">{memoryLog}</p>
          <p className="text-xs text-zinc-500">Best score: <span className="text-emerald-300 font-semibold">{miniGames.memoryHighScore}</span></p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <Music4 className="w-4 h-4 text-pink-300" />
            Rhythm Weave
          </div>
          <p className="text-xs text-zinc-400">Energy and cleanliness align to keep tempo steady.</p>
          <Button onClick={playRhythm} className="gap-2">
            <Music4 className="w-4 h-4" />
            Play Rhythm Pulse
          </Button>
          <p className="text-xs text-zinc-400 italic">{rhythmLog}</p>
          <p className="text-xs text-zinc-500">Best score: <span className="text-pink-300 font-semibold">{miniGames.rhythmHighScore}</span></p>
        </div>
      </div>
    </div>
  );
}
