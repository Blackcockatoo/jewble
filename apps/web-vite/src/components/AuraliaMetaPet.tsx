import { useState } from 'react';

type GuardianForm = 'radiant' | 'meditation' | 'sage' | 'vigilant';

type FormDefinition = {
  name: string;
  baseColor: string;
  primaryGold: string;
  secondaryGold: string;
  tealAccent: string;
  eyeColor: string;
  glowColor: string;
  description: string;
};

const forms: Record<GuardianForm, FormDefinition> = {
  radiant: {
    name: 'Radiant Guardian',
    baseColor: '#2C3E77',
    primaryGold: '#F4B942',
    secondaryGold: '#FFD700',
    tealAccent: '#4ECDC4',
    eyeColor: '#F4B942',
    glowColor: 'rgba(244, 185, 66, 0.3)',
    description: 'Calm strength - balanced blue and gold',
  },
  meditation: {
    name: 'Meditation Cocoon',
    baseColor: '#0d1321',
    primaryGold: '#2DD4BF',
    secondaryGold: '#4ECDC4',
    tealAccent: '#1a4d4d',
    eyeColor: '#2DD4BF',
    glowColor: 'rgba(45, 212, 191, 0.2)',
    description: 'Quiet endurance - dusk-teal respite',
  },
  sage: {
    name: 'Sage Luminary',
    baseColor: '#1a1f3a',
    primaryGold: '#FFD700',
    secondaryGold: '#F4B942',
    tealAccent: '#4ECDC4',
    eyeColor: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    description: 'Luminous focus - hepta-crown activated',
  },
  vigilant: {
    name: 'Vigilant Sentinel',
    baseColor: '#1a1f3a',
    primaryGold: '#FF6B35',
    secondaryGold: '#FF8C42',
    tealAccent: '#4ECDC4',
    eyeColor: '#FF6B35',
    glowColor: 'rgba(255, 107, 53, 0.4)',
    description: 'Focused will - indigo with neon fire',
  },
};

type SliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
  icon: string;
};

type GenomeBarProps = {
  label: string;
  value: number;
  color: string;
};

type FormStateProps = {
  active: boolean;
  label: string;
  condition: string;
  color: string;
};

type GuardianEyeProps = {
  cx: number;
  cy: number;
  shape: 'heptaStar' | 'luminous' | 'round';
  color: string;
  size?: number;
};

type GuardianTailProps = {
  form: GuardianForm;
  colors: FormDefinition;
  curiosity: number;
};

type GuardianHaloProps = {
  type: 'wrapped' | 'heptaCrown' | 'split' | 'radiant';
  colors: FormDefinition;
};

type GuardianSVGProps = {
  form: GuardianForm;
  colors: FormDefinition;
  red60: number;
  blue60: number;
  black60: number;
  eyeShape: GuardianEyeProps['shape'];
  haloType: GuardianHaloProps['type'];
  curiosity: number;
};

type HeptaSymmetryProps = {
  color: string;
};

export default function AuraliaMetaPet() {
  const [energy, setEnergy] = useState(50);
  const [curiosity, setCuriosity] = useState(50);
  const [bond, setBond] = useState(50);
  const [health, setHealth] = useState(80);

  const activeForm: GuardianForm = (() => {
    if (energy < 30 && health < 50) return 'meditation';
    if (energy > 70 && curiosity > 60) return 'vigilant';
    if (bond > 60 && curiosity > 50) return 'sage';
    return 'radiant';
  })();

  const currentForm = forms[activeForm];

  const red60 = Math.min(100, energy + (100 - health) * 0.3);
  const blue60 = Math.min(100, curiosity + bond * 0.4);
  const black60 = Math.min(100, energy * 0.4 + bond * 0.6);

  const eyeShape: GuardianEyeProps['shape'] = (() => {
    if (activeForm === 'vigilant') return 'heptaStar';
    if (energy > 70 || curiosity > 80) return 'luminous';
    return 'round';
  })();

  const haloType: GuardianHaloProps['type'] = (() => {
    if (activeForm === 'vigilant') return 'split';
    if (activeForm === 'sage') return 'heptaCrown';
    if (activeForm === 'meditation') return 'wrapped';
    return 'radiant';
  })();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white p-6 overflow-auto">
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <SeedOfLifePattern />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block">
            <h1
              className="text-5xl font-light tracking-wide mb-2"
              style={{
                background: `linear-gradient(135deg, ${currentForm.primaryGold}, ${currentForm.tealAccent})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Auralia Guardian
            </h1>
            <div className="h-px bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-50" />
          </div>
          <p className="text-sm text-gray-400 mt-3 font-light tracking-wider">
            Living avatar • Genome-driven metamorphosis • Calm intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl blur-xl" />
            <div className="relative bg-gradient-to-br from-gray-900/80 to-blue-950/80 rounded-2xl p-8 backdrop-blur border border-yellow-600/20 shadow-2xl">
              <div className="aspect-square bg-gradient-to-br from-blue-950/30 to-gray-900/30 rounded-xl flex items-center justify-center relative overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 400">
                  <HeptaSymmetry color={currentForm.primaryGold} />
                </svg>

                <div
                  className="absolute inset-0 opacity-30 blur-3xl animate-pulse"
                  style={{
                    background: `radial-gradient(circle at center, ${currentForm.glowColor}, transparent 70%)`,
                    animationDuration: '5s',
                  }}
                />

                <GuardianSVG
                  form={activeForm}
                  colors={currentForm}
                  red60={red60}
                  blue60={blue60}
                  black60={black60}
                  eyeShape={eyeShape}
                  haloType={haloType}
                  curiosity={curiosity}
                />
              </div>

              <div className="mt-6 text-center">
                <h2 className="text-3xl font-light tracking-wide" style={{ color: currentForm.primaryGold }}>
                  {currentForm.name}
                </h2>
                <p className="text-gray-400 text-sm mt-2 font-light italic">{currentForm.description}</p>
              </div>

              <div className="mt-8 grid grid-cols-4 gap-3">
                {[
                  { label: 'Midnight', color: currentForm.baseColor },
                  { label: 'Auric', color: currentForm.primaryGold },
                  { label: 'Solar', color: currentForm.secondaryGold },
                  { label: 'Resonance', color: currentForm.tealAccent },
                ].map(({ label, color }) => (
                  <div key={label} className="text-center">
                    <div
                      className="h-14 rounded-lg border border-yellow-600/30 shadow-lg relative overflow-hidden"
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <p className="text-xs mt-2 text-gray-400 font-light">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-gray-900/80 to-blue-950/80 rounded-2xl p-6 backdrop-blur border border-yellow-600/20">
                <h3 className="text-xl font-light tracking-wide mb-6 text-yellow-500">Essence Attunement</h3>
                <div className="space-y-5">
                  <AuraliaSlider label="Energy Flow" value={energy} onChange={setEnergy} color="#FF6B35" icon="⚡" />
                  <AuraliaSlider label="Curiosity Spark" value={curiosity} onChange={setCuriosity} color="#4ECDC4" icon="✦" />
                  <AuraliaSlider label="Bond Resonance" value={bond} onChange={setBond} color="#F4B942" icon="◈" />
                  <AuraliaSlider label="Vitality Core" value={health} onChange={setHealth} color="#2DD4BF" icon="❖" />
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-gray-900/80 to-blue-950/80 rounded-2xl p-6 backdrop-blur border border-yellow-600/20">
                <h3 className="text-xl font-light tracking-wide mb-4 text-yellow-500">Genome Expression</h3>
                <p className="text-sm text-gray-400 mb-5 font-light">Markings derived from genetic recursion</p>
                <div className="space-y-4">
                  <AuraliaGenomeBar label="Red-60 Vault" value={red60} color="#FF6B35" />
                  <AuraliaGenomeBar label="Blue-60 Vault" value={blue60} color="#4ECDC4" />
                  <AuraliaGenomeBar label="Black-60 Vault" value={black60} color="#A29BFE" />
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-gray-900/80 to-blue-950/80 rounded-2xl p-6 backdrop-blur border border-yellow-600/20">
                <h3 className="text-xl font-light tracking-wide mb-5 text-yellow-500">Guardian States</h3>
                <div className="space-y-3 text-sm">
                  <FormState active={activeForm === 'radiant'} label="Radiant Guardian" condition="Default harmonious state" color="#F4B942" />
                  <FormState active={activeForm === 'meditation'} label="Meditation Cocoon" condition="Energy < 30 • Vitality < 50" color="#2DD4BF" />
                  <FormState active={activeForm === 'sage'} label="Sage Luminary" condition="Bond > 60 • Curiosity > 50" color="#FFD700" />
                  <FormState active={activeForm === 'vigilant'} label="Vigilant Sentinel" condition="Energy > 70 • Curiosity > 60" color="#FF6B35" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 mb-6">
          <p className="text-xs text-gray-500 font-light tracking-widest">
            BLUE SNAKE STUDIOS • AURALIA SYSTEM
          </p>
          <p className="text-xs text-gray-600 mt-1 italic">
            The art hums quietly — intelligence made visible, recursion made kind
          </p>
        </div>
      </div>
    </div>
  );
}

function SeedOfLifePattern() {
  return (
    <svg className="w-full h-full" viewBox="0 0 1000 1000">
      {[0, 1, 2].map(i => (
        <g key={i} transform={`translate(${250 + i * 250}, 250)`}>
          <circle cx="0" cy="0" r="80" fill="none" stroke="#F4B942" strokeWidth="0.5" opacity="0.3" />
          <circle cx="80" cy="0" r="80" fill="none" stroke="#F4B942" strokeWidth="0.5" opacity="0.3" />
          <circle cx="40" cy="69" r="80" fill="none" stroke="#4ECDC4" strokeWidth="0.5" opacity="0.3" />
          <circle cx="40" cy="-69" r="80" fill="none" stroke="#4ECDC4" strokeWidth="0.5" opacity="0.3" />
          <circle cx="-40" cy="69" r="80" fill="none" stroke="#4ECDC4" strokeWidth="0.5" opacity="0.3" />
          <circle cx="-40" cy="-69" r="80" fill="none" stroke="#4ECDC4" strokeWidth="0.5" opacity="0.3" />
        </g>
      ))}
    </svg>
  );
}

function HeptaSymmetry({ color }: HeptaSymmetryProps) {
  const points = Array.from({ length: 7 }, (_, i) => {
    const angle = (i * 2 * Math.PI) / 7 - Math.PI / 2;
    return {
      x: 200 + Math.cos(angle) * 150,
      y: 200 + Math.sin(angle) * 150,
    };
  });

  return (
    <g>
      {points.map((p, i) => (
        <g key={i}>
          <line x1="200" y1="200" x2={p.x} y2={p.y} stroke={color} strokeWidth="0.5" opacity="0.3" />
          <circle cx={p.x} cy={p.y} r="4" fill={color} opacity="0.4" />
        </g>
      ))}
      <circle cx="200" cy="200" r="150" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
      <circle cx="200" cy="200" r="100" fill="none" stroke={color} strokeWidth="0.5" opacity="0.2" />
      <circle cx="200" cy="200" r="50" fill="none" stroke={color} strokeWidth="0.5" opacity="0.2" />
    </g>
  );
}

function AuraliaSlider({ label, value, onChange, color, icon }: SliderProps) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-light">
          <span className="opacity-60">{icon}</span> {label}
        </span>
        <span className="text-sm font-mono font-light" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={event => onChange(Number(event.target.value))}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #1a1f3a ${value}%, #1a1f3a 100%)`
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 pointer-events-none"
          style={{
            left: `calc(${value}% - 6px)`,
            backgroundColor: color,
            borderColor: '#FFD700',
            boxShadow: `0 0 8px ${color}`
          }}
        />
      </div>
    </div>
  );
}

function AuraliaGenomeBar({ label, value, color }: GenomeBarProps) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-light">{label}</span>
        <span className="text-sm font-mono font-light">{value.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-gray-900/50 rounded-full overflow-hidden border border-gray-800">
        <div
          className="h-full transition-all duration-700 ease-out relative"
          style={{
            width: `${value}%`,
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function FormState({ active, label, condition, color }: FormStateProps) {
  return (
    <div className={`p-4 rounded-lg border transition-all ${
      active
        ? 'border-yellow-600/60 bg-yellow-600/10'
        : 'border-gray-800 bg-gray-900/30'
    }`}>
      <div className="flex items-center justify-between">
        <span className="font-light">{label}</span>
        {active && (
          <span className="text-xs font-light tracking-wider" style={{ color }}>
            ◉ ACTIVE
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1 font-light">{condition}</p>
    </div>
  );
}

function GuardianSVG({ form, colors, red60, blue60, black60, eyeShape, haloType, curiosity }: GuardianSVGProps) {
  const isMeditation = form === 'meditation';
  const isVigilant = form === 'vigilant';
  const isSage = form === 'sage';

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full max-w-lg">
      <defs>
        <filter id="auraliaGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="strongGlow">
          <feGaussianBlur stdDeviation="8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="red60Auralia" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FF6B35', stopOpacity: red60/100 }} />
          <stop offset="100%" style={{ stopColor: '#FF6B35', stopOpacity: 0 }} />
        </linearGradient>

        <radialGradient id="blue60Auralia">
          <stop offset="0%" style={{ stopColor: '#4ECDC4', stopOpacity: blue60/100 }} />
          <stop offset="100%" style={{ stopColor: '#4ECDC4', stopOpacity: 0 }} />
        </radialGradient>

        <radialGradient id="goldRadiance">
          <stop offset="0%" style={{ stopColor: colors.primaryGold, stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: colors.primaryGold, stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      <GuardianHalo type={haloType} colors={colors} />

      <g className={isMeditation ? 'animate-pulse' : ''}>
        <ellipse
          cx="200"
          cy={isMeditation ? '220' : '210'}
          rx={isMeditation ? '60' : isVigilant ? '55' : '65'}
          ry={isMeditation ? '75' : isVigilant ? '65' : '75'}
          fill={colors.baseColor}
          className="transition-all duration-1000"
          stroke={colors.primaryGold}
          strokeWidth="1"
          opacity="0.9"
        />

        <ellipse
          cx="200"
          cy={isMeditation ? '220' : '210'}
          rx={isMeditation ? '58' : isVigilant ? '53' : '63'}
          ry={isMeditation ? '73' : isVigilant ? '63' : '73'}
          fill="url(#goldRadiance)"
          filter="url(#auraliaGlow)"
          className="animate-pulse"
          style={{ animationDuration: '5s' }}
        />

        {!isMeditation && (
          <ellipse
            cx="200"
            cy={isSage ? '150' : '145'}
            rx={isSage ? '50' : '48'}
            ry={isSage ? '55' : '52'}
            fill={colors.baseColor}
            className="transition-all duration-1000"
            stroke={colors.primaryGold}
            strokeWidth="1"
            opacity="0.9"
          />
        )}

        <path
          d={
            isMeditation
              ? 'M 200 160 L 200 180 L 200 200 L 200 220 L 200 240'
              : 'M 200 110 L 200 130 L 200 150 L 200 170 L 200 190 L 200 210'
          }
          stroke="url(#red60Auralia)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="4,4"
          className="transition-all duration-1000"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="8"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>

        {!isMeditation && (
          <>
            <circle cx="170" cy="140" r="3" fill={colors.tealAccent} opacity={blue60/120}>
              <animate attributeName="opacity" values={`${blue60/150};${blue60/80};${blue60/150}`} dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="230" cy="140" r="3" fill={colors.tealAccent} opacity={blue60/120}>
              <animate attributeName="opacity" values={`${blue60/150};${blue60/80};${blue60/150}`} dur="4s" repeatCount="indefinite" />
            </circle>
            <path d="M 170 140 Q 200 135 230 140" stroke={colors.tealAccent} strokeWidth="0.5" opacity={blue60/200} />
          </>
        )}

        {!isMeditation && <CockatooCrest form={form} colors={colors} />}

        {!isMeditation ? (
          <>
            <GuardianEye
              cx={180}
              cy={150}
              shape={eyeShape}
              color={colors.eyeColor}
              size={isSage ? 16 : 14}
            />
            <GuardianEye
              cx={220}
              cy={150}
              shape={eyeShape}
              color={colors.eyeColor}
              size={isSage ? 16 : 14}
            />
          </>
        ) : (
          <>
            <path d="M 175 210 Q 182 215 190 210" stroke={colors.primaryGold} strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M 210 210 Q 217 215 225 210" stroke={colors.primaryGold} strokeWidth="2" fill="none" opacity="0.6" />
            <circle cx="182" cy="208" r="2" fill={colors.tealAccent} opacity="0.4">
              <animate attributeName="opacity" values="0.2;0.6;0.2" dur="5s" repeatCount="indefinite" />
            </circle>
            <circle cx="217" cy="208" r="2" fill={colors.tealAccent} opacity="0.4">
              <animate attributeName="opacity" values="0.2;0.6;0.2" dur="5s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {isSage && (
          <g>
            <circle cx="200" cy="185" r="12" fill="none" stroke={colors.primaryGold} strokeWidth="1" opacity="0.6">
              <animate attributeName="r" values="12;14;12" dur="3s" repeatCount="indefinite" />
            </circle>
            <path
              d="M 200 173 L 195 185 L 200 190 L 205 185 Z"
              fill={colors.primaryGold}
              opacity="0.7"
              filter="url(#auraliaGlow)"
            >
              <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite" />
            </path>
          </g>
        )}

        {!isMeditation && (
          <>
            <path
              d="M 140 200 Q 110 210 100 190 Q 95 170 110 165 Q 130 180 140 200"
              fill={colors.baseColor}
              opacity="0.7"
              stroke={colors.primaryGold}
              strokeWidth="0.5"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 140 200;-5 140 200;0 140 200"
                dur="4s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M 260 200 Q 290 210 300 190 Q 305 170 290 165 Q 270 180 260 200"
              fill={colors.baseColor}
              opacity="0.7"
              stroke={colors.primaryGold}
              strokeWidth="0.5"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 260 200;5 260 200;0 260 200"
                dur="4s"
                repeatCount="indefinite"
              />
            </path>
          </>
        )}

        <GuardianTail form={form} colors={colors} curiosity={curiosity} />

        {black60 > 60 && !isMeditation && (
          <>
            <circle cx="200" cy="120" r="10" fill="none" stroke="#A29BFE" strokeWidth="1" opacity={black60/200} filter="url(#auraliaGlow)">
              <animate attributeName="r" values="10;12;10" dur="5s" repeatCount="indefinite" />
            </circle>
            <path
              d="M 180 205 Q 200 210 220 205"
              stroke="#A29BFE"
              strokeWidth="1.5"
              fill="none"
              opacity={black60/150}
            >
              <animate attributeName="opacity" values={`${black60/200};${black60/100};${black60/200}`} dur="5s" repeatCount="indefinite" />
            </path>
          </>
        )}
      </g>
    </svg>
  );
}

function GuardianHalo({ type, colors }: GuardianHaloProps) {
  if (type === 'wrapped') {
    return (
      <g>
        <circle cx="200" cy="210" r="90" fill="none" stroke={colors.primaryGold} strokeWidth="1" opacity="0.3" strokeDasharray="5,5">
          <animate attributeName="stroke-dashoffset" from="0" to="10" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="210" r="100" fill="none" stroke={colors.tealAccent} strokeWidth="0.5" opacity="0.2" />
      </g>
    );
  }

  if (type === 'heptaCrown') {
    const points = Array.from({ length: 7 }, (_, i) => {
      const angle = (i * 2 * Math.PI) / 7 - Math.PI / 2;
      return {
        x: 200 + Math.cos(angle) * 80,
        y: 150 + Math.sin(angle) * 80,
      };
    });

    return (
      <g>
        <circle cx="200" cy="150" r="80" fill="none" stroke={colors.primaryGold} strokeWidth="1.5" opacity="0.5" filter="url(#auraliaGlow)">
          <animate attributeName="r" values="80;82;80" dur="4s" repeatCount="indefinite" />
        </circle>
        {points.map((p, i) => (
          <g key={i}>
            <line x1="200" y1="150" x2={p.x} y2={p.y} stroke={colors.primaryGold} strokeWidth="0.5" opacity="0.4" />
            <circle cx={p.x} cy={p.y} r="4" fill={colors.primaryGold} opacity="0.7" filter="url(#auraliaGlow)">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
            </circle>
          </g>
        ))}
      </g>
    );
  }

  if (type === 'split') {
    return (
      <g>
        <circle cx="200" cy="145" r="75" fill="none" stroke={colors.primaryGold} strokeWidth="2" opacity="0.6" filter="url(#auraliaGlow)" />
        <circle cx="200" cy="145" r="85" fill="none" stroke={colors.secondaryGold} strokeWidth="1" opacity="0.4" strokeDasharray="10,5">
          <animate attributeName="stroke-dashoffset" from="0" to="15" dur="2s" repeatCount="indefinite" />
        </circle>
        {[0, 1, 2, 3].map(i => {
          const angle = (i * Math.PI) / 2;
          return (
            <circle
              key={i}
              cx={200 + Math.cos(angle) * 75}
              cy={145 + Math.sin(angle) * 75}
              r="5"
              fill={colors.primaryGold}
              opacity="0.8"
              filter="url(#strongGlow)"
            >
              <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
            </circle>
          );
        })}
      </g>
    );
  }

  return (
    <g>
      <circle cx="200" cy="145" r="80" fill="none" stroke={colors.primaryGold} strokeWidth="1.5" opacity="0.5" filter="url(#auraliaGlow)">
        <animate attributeName="opacity" values="0.4;0.6;0.4" dur="5s" repeatCount="indefinite" />
      </circle>
      <circle cx="200" cy="145" r="90" fill="none" stroke={colors.tealAccent} strokeWidth="0.5" opacity="0.3">
        <animate attributeName="r" values="90;92;90" dur="6s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

function CockatooCrest({ form, colors }: { form: GuardianForm; colors: FormDefinition }) {
  const isSage = form === 'sage';
  const isVigilant = form === 'vigilant';
  const crestHeight = isSage ? 50 : isVigilant ? 45 : 40;
  const feathers = isVigilant ? 5 : 3;

  return (
    <g>
      {Array.from({ length: feathers }, (_, i) => {
        const offset = (i - Math.floor(feathers / 2)) * 12;
        return (
          <path
            key={i}
            d={`M ${200 + offset} 115 Q ${200 + offset} ${115 - crestHeight} ${200 + offset + 5} ${115 - crestHeight + 10}`}
            stroke={colors.primaryGold}
            strokeWidth="3"
            fill="none"
            opacity="0.7"
            filter="url(#auraliaGlow)"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={`0 ${200 + offset} 115;${isVigilant ? 5 : 3} ${200 + offset} 115;0 ${200 + offset} 115`}
              dur="3s"
              repeatCount="indefinite"
              begin={`${i * 0.2}s`}
            />
          </path>
        );
      })}
      {Array.from({ length: feathers }, (_, i) => {
        const offset = (i - Math.floor(feathers / 2)) * 12;
        return (
          <circle
            key={i}
            cx={200 + offset + 5}
            cy={115 - crestHeight + 10}
            r="3"
            fill={colors.secondaryGold}
            opacity="0.8"
            filter="url(#strongGlow)"
          >
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
          </circle>
        );
      })}
    </g>
  );
}

function GuardianEye({ cx, cy, shape, color, size = 14 }: GuardianEyeProps) {
  if (shape === 'heptaStar') {
    const points = Array.from({ length: 7 }, (_, i) => {
      const angle = (i * 2 * Math.PI) / 7 - Math.PI / 2;
      return `${cx + Math.cos(angle) * size},${cy + Math.sin(angle) * size}`;
    }).join(' ');

    return (
      <g>
        <circle cx={cx} cy={cy} r={size + 2} fill="#0d1321" opacity="0.8" />
        <polygon points={points} fill={color} filter="url(#strongGlow)" opacity="0.9">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${cx} ${cy}`}
            to={`360 ${cx} ${cy}`}
            dur="6s"
            repeatCount="indefinite"
          />
        </polygon>
      </g>
    );
  }

  if (shape === 'luminous') {
    return (
      <g>
        <circle cx={cx} cy={cy} r={size + 2} fill="#0d1321" opacity="0.8" />
        <circle cx={cx} cy={cy} r={size} fill={color} filter="url(#strongGlow)" opacity="0.9">
          <animate attributeName="r" values={`${size};${size + 2};${size}`} dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx={cx} cy={cy} r={size - 5} fill="#FFD700" opacity="0.6">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>
    );
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={size + 2} fill="#0d1321" opacity="0.8" />
      <circle cx={cx} cy={cy} r={size} fill={color} filter="url(#auraliaGlow)" opacity="0.8">
        <animate attributeName="opacity" values="0.7;0.9;0.7" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={size - 6} fill="#FFD700" opacity="0.5" />
    </g>
  );
}

function GuardianTail({ form, colors, curiosity }: GuardianTailProps) {
  const isMeditation = form === 'meditation';
  const isVigilant = form === 'vigilant';

  if (isMeditation) {
    return (
      <g>
        <path d="M 200 280 Q 260 270 280 230 Q 290 190 270 160 Q 240 140 200 155" stroke={colors.primaryGold} strokeWidth="6" fill="none" opacity="0.5" />
        <circle cx="280" cy="230" r="4" fill={colors.tealAccent} opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="5s" repeatCount="indefinite" />
        </circle>
      </g>
    );
  }

  if (isVigilant) {
    return (
      <g>
        {[-20, 0, 20].map((offset, i) => (
          <g key={i}>
            <path
              d={`M 200 280 Q ${195 + offset} 320 ${190 + offset} 360`}
              stroke={colors.primaryGold}
              strokeWidth="4"
              fill="none"
              filter="url(#auraliaGlow)"
              opacity="0.8"
            >
              <animate
                attributeName="d"
                values={`M 200 280 Q ${195 + offset} 320 ${190 + offset} 360;M 200 280 Q ${190 + offset} 320 ${185 + offset} 360;M 200 280 Q ${195 + offset} 320 ${190 + offset} 360`}
                dur={`${1.5 + i * 0.2}s`}
                repeatCount="indefinite"
              />
            </path>
            <circle cx={`${190 + offset}`} cy="360" r="5" fill={colors.secondaryGold} opacity="0.8" filter="url(#strongGlow)">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
            </circle>
          </g>
        ))}
      </g>
    );
  }

  return (
    <g>
      <path
        d="M 200 280 Q 210 320 215 360"
        stroke={colors.primaryGold}
        strokeWidth="5"
        fill="none"
        filter="url(#auraliaGlow)"
        opacity="0.7"
      >
        <animate attributeName="d" values="M 200 280 Q 210 320 215 360;M 200 280 Q 205 320 210 360;M 200 280 Q 210 320 215 360" dur="3s" repeatCount="indefinite" />
      </path>
      <circle cx="215" cy="360" r="7" fill={colors.secondaryGold} opacity="0.8" filter="url(#auraliaGlow)">
        <animate attributeName="r" values="7;9;7" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="3s" repeatCount="indefinite" />
      </circle>
      {curiosity > 50 && (
        <>
          <circle cx="207" cy="300" r="3" fill={colors.tealAccent} opacity={curiosity/150}>
            <animate attributeName="opacity" values={`${curiosity/200};${curiosity/100};${curiosity/200}`} dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="211" cy="330" r="3" fill={colors.tealAccent} opacity={curiosity/150}>
            <animate attributeName="opacity" values={`${curiosity/200};${curiosity/100};${curiosity/200}`} dur="3s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </g>
  );
}

