'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from './ui/button';
import { Swords, ShieldHalf, Sparkles } from 'lucide-react';

const OPPONENTS = ['Echo Wisp', 'Prism Lurker', 'Dream Stag', 'Aurora Fox'];

function pickOpponent(): string {
  return OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
}

export function BattleArena() {
  const battle = useStore(s => s.battle);
  const vitals = useStore(s => s.vitals);
  const recordBattle = useStore(s => s.recordBattle);

  const [lastSummary, setLastSummary] = useState<string>('No battles yet.');

  const handleBattle = () => {
    const opponent = pickOpponent();
    const vitalityFactor = (vitals.energy + vitals.mood) / 200;
    const shieldFactor = battle.energyShield / 150;
    const winChance = Math.min(0.85, 0.35 + vitalityFactor + shieldFactor);
    const result = Math.random() < winChance ? 'win' : 'loss';

    recordBattle(result, opponent);

    if (result === 'win') {
      setLastSummary(`Victory! ${opponent} yielded to your pet's calm aura.`);
    } else {
      setLastSummary(`Defeat. ${opponent} overpowered the resonance—rest and try again.`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Swords className="w-5 h-5 text-pink-300" />
            Consciousness Arena
          </h2>
          <p className="text-xs text-zinc-500">Channel mood and energy into non-violent resonance duels.</p>
        </div>
        <div className="text-xs text-zinc-400 text-right">
          <p>Wins: <span className="text-emerald-300 font-semibold">{battle.wins}</span></p>
          <p>Losses: <span className="text-rose-300 font-semibold">{battle.losses}</span></p>
          <p>Streak: <span className="text-amber-300 font-semibold">{battle.streak}</span></p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <div className="flex items-center gap-3 text-sm text-zinc-300">
          <ShieldHalf className="w-5 h-5 text-cyan-300" />
          <span>Energy Shield Buffer: <strong className="text-cyan-200">{Math.round(battle.energyShield)}%</strong></span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">Shield increases after wins and depletes on losses. Higher shields tilt odds in your favor.</p>
        <Button onClick={handleBattle} className="gap-2">
          <Sparkles className="w-4 h-4" />
          Initiate Duel
        </Button>
        <p className="text-xs text-zinc-400 italic">{lastSummary}</p>
      </div>
    </div>
  );
}
