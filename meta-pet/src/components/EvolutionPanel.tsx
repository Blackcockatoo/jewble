'use client';

import { useStore } from '@/lib/store';
import { getEvolutionProgress, getTimeUntilNextEvolution, EVOLUTION_VISUALS } from '@/lib/evolution';
import { Zap, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export function EvolutionPanel() {
  const evolution = useStore(s => s.evolution);
  const vitals = useStore(s => s.vitals);
  const tryEvolve = useStore(s => s.tryEvolve);

  const vitalsAvg = (vitals.hunger + vitals.hygiene + vitals.mood + vitals.energy) / 4;
  const progress = getEvolutionProgress(evolution, vitalsAvg);
  const timeRemaining = getTimeUntilNextEvolution(evolution);

  const visuals = EVOLUTION_VISUALS[evolution.state];

  const formatTime = (ms: number) => {
    if (ms < 0) return 'Max level';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const handleEvolve = () => {
    const success = tryEvolve();
    if (success) {
      // Evolution successful!
      console.log('Evolution successful!');
    }
  };

  return (
    <div className="space-y-4">
      {/* Current State */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 mb-2"
          style={{
            borderColor: visuals.colors[0],
            backgroundColor: `${visuals.colors[0]}20`
          }}
        >
          <Sparkles className="w-4 h-4" style={{ color: visuals.colors[0] }} />
          <span className="font-bold text-white text-lg">{evolution.state}</span>
        </div>
        <p className="text-zinc-400 text-sm">Evolution Stage {['GENETICS', 'NEURO', 'QUANTUM', 'SPECIATION'].indexOf(evolution.state) + 1}/4</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
          <div className="flex items-center gap-2 text-zinc-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Experience</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${evolution.experience}%`,
                  backgroundColor: visuals.colors[0]
                }}
              />
            </div>
            <span className="text-white font-medium">{Math.round(evolution.experience)}%</span>
          </div>
        </div>

        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
          <div className="flex items-center gap-2 text-zinc-400 mb-1">
            <Zap className="w-4 h-4" />
            <span>Interactions</span>
          </div>
          <div className="text-white font-medium text-lg">
            {evolution.totalInteractions}
          </div>
        </div>
      </div>

      {/* Evolution Progress */}
      {evolution.state !== 'SPECIATION' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Next Evolution</span>
            <span className="text-white font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(to right, ${visuals.colors[0]}, ${visuals.colors[1] || visuals.colors[0]})`
              }}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Clock className="w-3 h-3" />
            <span>Time remaining: {formatTime(timeRemaining)}</span>
          </div>
        </div>
      )}

      {/* Evolve Button */}
      {evolution.canEvolve && evolution.state !== 'SPECIATION' && (
        <Button
          onClick={handleEvolve}
          className="w-full gap-2 font-bold text-lg"
          style={{
            background: `linear-gradient(135deg, ${visuals.colors[0]}, ${visuals.colors[1] || visuals.colors[0]})`,
            boxShadow: `0 0 20px ${visuals.colors[0]}50`
          }}
        >
          <Sparkles className="w-5 h-5" />
          Evolve Now!
        </Button>
      )}

      {/* Age */}
      <div className="text-center text-xs text-zinc-500">
        Age: {formatTime(Date.now() - evolution.birthTime)}
      </div>
    </div>
  );
}
