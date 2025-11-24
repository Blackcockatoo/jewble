'use client';

import { memo } from 'react';

import { useStore } from '@/lib/store';
import { Sparkles, Palette, Brain, Zap, Atom, Waveform } from 'lucide-react';

export const TraitPanel = memo(function TraitPanel() {
  const traits = useStore(s => s.traits);

  if (!traits) {
    return (
      <div className="text-zinc-500 text-center py-8">
        Loading genome...
      </div>
    );
  }

  const { physical, personality, latent, elements } = traits;

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

      {/* Element Math */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Atom className="w-5 h-5 text-amber-300" />
          Element Metrics
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <TraitCard label="Bridge Score" value={elements.bridgeScore.toString()} />
          <TraitCard label="Frontier Weight" value={elements.frontierWeight.toString()} />
          <TraitCard
            label="Charge Vector"
            value={`2:${elements.chargeVector.c2} | 3:${elements.chargeVector.c3} | 5:${elements.chargeVector.c5}`}
          />
          <TraitCard
            label="Hepta Signature"
            value={`Σ ${elements.heptaSignature.total.join('-')} (mod7 ${elements.heptaSignature.mod7.join('-')})`}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <TraitCard label="Wave Magnitude" value={elements.elementWave.magnitude.toFixed(2)} />
          <TraitCard
            label="Wave Angle"
            value={`${elements.elementWave.angle.toFixed(3)} rad`}
          />
          <div className="col-span-2 flex items-center gap-2 text-xs text-zinc-300">
            <Waveform className="w-4 h-4 text-amber-300" />
            <span>
              Element wave real/imag: {elements.elementWave.real.toFixed(3)} / {elements.elementWave.imag.toFixed(3)}
            </span>
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
    zinc: 'bg-zinc-500'
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
