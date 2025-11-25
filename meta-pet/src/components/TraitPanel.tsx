'use client';

import { memo, type ComponentType } from 'react';

import { useStore } from '@/lib/store';
import { Sparkles, Palette, Brain, Zap, Orbit, Link2, Ban } from 'lucide-react';
import { GenomeJewbleRing } from './GenomeJewbleRing';

export const TraitPanel = memo(function TraitPanel() {
  const traits = useStore(s => s.traits);
  const genome = useStore(s => s.genome);

  if (!traits || !genome) {
    return (
      <div className="text-zinc-500 text-center py-8">
        Loading genome...
      </div>
    );
  }

  const { physical, personality, latent, elementWeb } = traits;

  return (
    <div className="space-y-6">
      {/* Physical Traits */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Palette className="w-5 h-5 text-pink-400" />
          Physical Traits
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <TraitCard label="Body Type" value={physical.bodyType} />
          <TraitCard label="Pattern" value={physical.pattern} />
          <TraitCard label="Texture" value={physical.texture} />
          <TraitCard label="Size" value={`${physical.size.toFixed(2)}x`} />
        </div>
        <div className="flex gap-2 items-center text-sm">
          <span className="text-zinc-400">Colors:</span>
          <div
            className="w-8 h-8 rounded-lg border-2 border-zinc-700"
            style={{ backgroundColor: physical.primaryColor }}
            title={physical.primaryColor}
          />
          <div
            className="w-8 h-8 rounded-lg border-2 border-zinc-700"
            style={{ backgroundColor: physical.secondaryColor }}
            title={physical.secondaryColor}
          />
        </div>
        {physical.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {physical.features.map((feat, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs bg-pink-500/20 text-pink-300 rounded-md border border-pink-500/30"
              >
                {feat}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Personality Traits */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Brain className="w-5 h-5 text-blue-400" />
          Personality
        </h3>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-zinc-400">Temperament:</span>{' '}
            <span className="text-white font-medium">{personality.temperament}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <StatMini label="Energy" value={personality.energy} />
            <StatMini label="Social" value={personality.social} />
            <StatMini label="Curiosity" value={personality.curiosity} />
            <StatMini label="Affection" value={personality.affection} />
            <StatMini label="Playfulness" value={personality.playfulness} />
            <StatMini label="Loyalty" value={personality.loyalty} />
          </div>
        </div>
        {personality.quirks.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">Quirks:</div>
            <div className="flex flex-wrap gap-2">
              {personality.quirks.map((quirk, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-md border border-blue-500/30"
                >
                  {quirk}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Latent Traits */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Hidden Potential
        </h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-zinc-400">Evolution Path:</span>{' '}
            <span className="text-purple-300 font-medium">{latent.evolutionPath}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <StatMini label="Physical" value={latent.potential.physical} color="red" />
            <StatMini label="Mental" value={latent.potential.mental} color="blue" />
            <StatMini label="Social" value={latent.potential.social} color="green" />
          </div>
        </div>
        {latent.rareAbilities.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-zinc-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Rare Abilities:
            </div>
            <div className="flex flex-wrap gap-2">
              {latent.rareAbilities.map((ability, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-md border border-purple-500/30 font-medium"
                >
                  {ability}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Element Web */}
      <section className="space-y-3 bg-amber-950/20 border border-amber-900/30 rounded-xl p-4 -mx-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Orbit className="w-5 h-5 text-amber-300" />
          Element Web
        </h3>
        <div className="grid gap-3 lg:grid-cols-[1fr,0.9fr]">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
            <GenomeJewbleRing
              redDigits={genome.red60}
              blackDigits={genome.black60}
              blueDigits={genome.blue60}
              variant="dial"
            />
          </div>
          <div className="space-y-3 text-sm">
            <MetricRow label="Residue Coverage" value={`${Math.round(elementWeb.coverage * 100)}%`} />
            <div className="grid grid-cols-2 gap-2">
              <MetricPill icon={Orbit} label="Frontier Affinity" value={elementWeb.frontierAffinity} color="amber" />
              <MetricPill icon={Link2} label="Bridge Count" value={elementWeb.bridgeCount} color="cyan" />
              <MetricPill icon={Ban} label="Void Drift" value={elementWeb.voidDrift} color="rose" />
              <MetricPill icon={Sparkles} label="Active Residues" value={elementWeb.usedResidues.length} color="purple" />
            </div>
            <div className="space-y-2 text-xs text-zinc-300">
              <DetailLine label="Frontier Slots" value={formatResidues(elementWeb.frontierSlots)} />
              <DetailLine label="Bridge Slots" value={formatResidues(elementWeb.pairSlots)} />
              <DetailLine label="Void Slots Hit" value={formatResidues(elementWeb.voidSlotsHit)} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

interface TraitCardProps {
  label: string;
  value: string;
}

function TraitCard({ label, value }: TraitCardProps) {
  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-sm font-medium text-white">{value}</div>
    </div>
  );
}

interface StatMiniProps {
  label: string;
  value: number;
  color?: 'red' | 'blue' | 'green' | 'zinc';
}

function StatMini({ label, value, color = 'zinc' }: StatMiniProps) {
  const colorMap = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    zinc: 'bg-zinc-500',
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-zinc-400">{label}</span>
        <span className="text-white font-medium">{value}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorMap[color]} transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

interface MetricPillProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color?: 'amber' | 'cyan' | 'rose' | 'purple';
}

function MetricPill({ icon: Icon, label, value, color = 'amber' }: MetricPillProps) {
  const colorMap = {
    amber: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
    cyan: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40',
    rose: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
    purple: 'bg-purple-500/20 text-purple-200 border-purple-400/40',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colorMap[color]}`}>
      <Icon className="w-4 h-4" />
      <div>
        <div className="text-[11px] uppercase tracking-wide text-zinc-200/80">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: string;
}

function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2">
      <span className="text-zinc-400 text-xs uppercase tracking-wide">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}

interface DetailLineProps {
  label: string;
  value: string;
}

function DetailLine({ label, value }: DetailLineProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-zinc-400 w-32">{label}:</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

function formatResidues(residues: number[]): string {
  if (!residues.length) {
    return 'None';
  }

  return residues.join(', ');
}
