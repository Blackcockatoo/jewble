'use client';

import { useStore } from '@/lib/store';
import { UtensilsCrossed, Sparkles, Droplets, Zap } from 'lucide-react';
import { Button } from './ui/button';

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
        <Button onClick={feed} className="gap-2">
          <UtensilsCrossed className="w-4 h-4" />
          Feed
        </Button>
        <Button onClick={clean} variant="secondary" className="gap-2">
          <Droplets className="w-4 h-4" />
          Clean
        </Button>
        <Button onClick={play} variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Play
        </Button>
        <Button onClick={sleep} variant="ghost" className="gap-2">
          <Zap className="w-4 h-4" />
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
  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-sm">
        <div className="flex items-center gap-2 text-zinc-300">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-bold text-white tabular-nums">
          {Math.round(value)}%
        </span>
      </div>
      <div className="h-3 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700">
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
