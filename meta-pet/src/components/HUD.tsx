'use client';

import { useStore } from '@/lib/store';
import { UtensilsCrossed, Sparkles, Droplets, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

export function HUD() {
  const vitals = useStore(s => s.vitals);
  const feed = useStore(s => s.feed);
  const clean = useStore(s => s.clean);
  const play = useStore(s => s.play);
  const sleep = useStore(s => s.sleep);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <StatBar
          label="Hunger"
          value={vitals.hunger}
          icon={<UtensilsCrossed className="w-4 h-4" />}
          color="from-orange-500 to-red-500"
        />
        <StatBar
          label="Hygiene"
          value={vitals.hygiene}
          icon={<Droplets className="w-4 h-4" />}
          color="from-blue-500 to-cyan-500"
        />
        <StatBar
          label="Mood"
          value={vitals.mood}
          icon={<Sparkles className="w-4 h-4" />}
          color="from-pink-500 to-purple-500"
        />
        <StatBar
          label="Energy"
          value={vitals.energy}
          icon={<Zap className="w-4 h-4" />}
          color="from-yellow-500 to-amber-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={feed} className="gap-2" aria-label="Feed your pet to increase hunger level">
          <UtensilsCrossed className="w-4 h-4" aria-hidden="true" />
          Feed
        </Button>
        <Button onClick={clean} variant="secondary" className="gap-2" aria-label="Clean your pet to increase hygiene">
          <Droplets className="w-4 h-4" aria-hidden="true" />
          Clean
        </Button>
        <Button onClick={play} variant="outline" className="gap-2" aria-label="Play with your pet to increase mood">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          Play
        </Button>
        <Button onClick={sleep} variant="ghost" className="gap-2" aria-label="Let your pet sleep to restore energy">
          <Zap className="w-4 h-4" aria-hidden="true" />
          Sleep
        </Button>
      </div>
    </div>
  );
}

interface StatBarProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatBar({ label, value, icon, color }: StatBarProps) {
  // Create descriptive text for screen readers based on value ranges
  const getValueDescription = (val: number): string => {
    if (val >= 80) return `${Math.round(val)}% - excellent`;
    if (val >= 60) return `${Math.round(val)}% - good`;
    if (val >= 40) return `${Math.round(val)}% - moderate`;
    if (val >= 20) return `${Math.round(val)}% - low`;
    return `${Math.round(val)}% - critical`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-sm">
        <div className="flex items-center gap-2 text-zinc-300">
          <span aria-hidden="true">{icon}</span>
          <span>{label}</span>
        </div>
        <span className="font-bold text-white tabular-nums">
          {Math.round(value)}%
        </span>
      </div>
      <Progress
        value={value}
        label={`${label} level`}
        valueText={getValueDescription(value)}
        className="h-3 border border-zinc-700 rounded-xl"
        barClassName={`bg-gradient-to-r ${color}`}
      />
    </div>
  );
}
