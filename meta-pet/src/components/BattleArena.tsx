'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
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
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  const handleBattle = () => {
    const opponent = pickOpponent();
    const vitalityFactor = (vitals.energy + vitals.mood) / 200;
    const shieldFactor = battle.energyShield / 150;
    const winChance = Math.min(0.85, 0.35 + vitalityFactor + shieldFactor);
    const result = Math.random() < winChance ? 'win' : 'loss';

    recordBattle(result, opponent);

    if (result === 'win') {
      const summary = `Victory! ${opponent} yielded to your pet's calm aura.`;
      setLastSummary(summary);
      setLiveAnnouncement(`Battle won against ${opponent}. Win streak: ${battle.winStreak + 1}`);
    } else {
      const summary = `Defeat. ${opponent} overpowered the resonance—rest and try again.`;
      setLastSummary(summary);
      setLiveAnnouncement(`Battle lost to ${opponent}. Streak reset.`);
    }
  };

  // Clear live announcement after it's been read by screen readers
  useEffect(() => {
    if (liveAnnouncement) {
      const timer = setTimeout(() => setLiveAnnouncement(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [liveAnnouncement]);

  return (
    <div className="space-y-4">
      {/* ARIA live region for battle results - announced to screen readers */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Swords className="w-5 h-5 text-pink-300" aria-hidden="true" />
            Consciousness Arena
          </h2>
          <p className="text-xs text-zinc-500">Channel mood and energy into non-violent resonance duels.</p>
        </div>
        <div className="text-xs text-zinc-400 text-right" aria-label={`Battle stats: ${battle.wins} wins, ${battle.losses} losses, ${battle.streak} win streak`}>
          <p>Wins: <span className="text-emerald-300 font-semibold">{battle.wins}</span></p>
          <p>Losses: <span className="text-rose-300 font-semibold">{battle.losses}</span></p>
          <p>Streak: <span className="text-amber-300 font-semibold">{battle.streak}</span></p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-zinc-300">
            <ShieldHalf className="w-5 h-5 text-cyan-300" aria-hidden="true" />
            <span>Energy Shield Buffer: <strong className="text-cyan-200">{Math.round(battle.energyShield)}%</strong></span>
          </div>
          <Progress
            value={battle.energyShield}
            label="Energy shield buffer level"
            valueText={`${Math.round(battle.energyShield)}% shield strength`}
            className="h-2"
            barClassName="bg-gradient-to-r from-cyan-500 to-blue-500"
          />
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">Shield increases after wins and depletes on losses. Higher shields tilt odds in your favor.</p>
        <Button onClick={handleBattle} className="gap-2" aria-label="Initiate resonance duel with random opponent">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          Initiate Duel
        </Button>
        <p className="text-xs text-zinc-400 italic" aria-live="polite">{lastSummary}</p>
      </div>
    </div>
  );
}
