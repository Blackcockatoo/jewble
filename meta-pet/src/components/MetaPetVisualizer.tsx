'use client';

import { useMemo, useState } from 'react';

type FormName = 'explorer' | 'sleep' | 'study' | 'battle';

type EyeShape = 'round' | 'slit' | 'star';

interface FormConfig {
  readonly name: string;
  readonly baseColor: string;
  readonly accentColor: string;
  readonly secondaryAccent: string;
  readonly eyeColor: string;
  readonly glowColor: string;
  readonly description: string;
}

interface StatSliderProps {
  readonly label: string;
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly color: string;
  readonly icon: string;
}

interface GenomeBarProps {
  readonly label: string;
  readonly value: number;
  readonly color: string;
}

interface FormConditionProps {
  readonly active: boolean;
  readonly label: string;
  readonly condition: string;
}

interface EyeProps {
  readonly cx: number;
  readonly cy: number;
  readonly shape: EyeShape;
  readonly color: string;
  readonly size?: number;
}

interface TailProps {
  readonly form: FormName;
  readonly splits: number;
  readonly color: string;
  readonly secondaryColor: string;
  readonly curiosity: number;
}

interface MetaPetSvgProps {
  readonly form: FormName;
  readonly colors: FormConfig;
  readonly red60: number;
  readonly blue60: number;
  readonly black60: number;
  readonly eyeShape: EyeShape;
  readonly tailSplits: number;
  readonly curiosity: number;
}

const forms: Record<FormName, FormConfig> = {
  explorer: {
    name: 'Explorer Form',
    baseColor: '#E8DCC8',
    accentColor: '#4ECDC4',
    secondaryAccent: '#FFB347',
    eyeColor: '#4ECDC4',
    glowColor: 'rgba(78, 205, 196, 0.4)',
    description: 'Default active state - curious and agile',
  },
  sleep: {
    name: 'Sleep / Cocoon Form',
    baseColor: '#2C3E50',
    accentColor: '#B8A5D6',
    secondaryAccent: '#7DD3C0',
    eyeColor: '#B8A5D6',
    glowColor: 'rgba(184, 165, 214, 0.3)',
    description: 'Resting and regenerating',
  },
  study: {
    name: 'Study Buddy Form',
    baseColor: '#FFE5D0',
    accentColor: '#98D8C8',
    secondaryAccent: '#A8D5E2',
    eyeColor: '#98D8C8',
    glowColor: 'rgba(152, 216, 200, 0.4)',
    description: 'Learning mode - focused and attentive',
  },
  battle: {
    name: 'High-Energy / Battle Form',
    baseColor: '#2C3E77',
    accentColor: '#FF006E',
    secondaryAccent: '#00F5FF',
    eyeColor: '#FF006E',
    glowColor: 'rgba(255, 0, 110, 0.5)',
    description: 'Alert and powerful',
  },
};

const MetaPetVisualizer = () => {
  const [energy, setEnergy] = useState(50);
  const [curiosity, setCuriosity] = useState(50);
  const [bond, setBond] = useState(50);
  const [health, setHealth] = useState(80);

  const activeForm = useMemo<FormName>(() => {
    if (energy < 30 && health < 50) return 'sleep';
    if (energy > 70 && curiosity > 60) return 'battle';
    if (bond > 60 && curiosity > 50) return 'study';
    return 'explorer';
  }, [bond, curiosity, energy, health]);

  const red60 = useMemo(
    () => Math.min(100, energy + (100 - health) * 0.3),
    [energy, health],
  );
  const blue60 = useMemo(
    () => Math.min(100, curiosity + bond * 0.4),
    [bond, curiosity],
  );
  const black60 = useMemo(
    () => Math.min(100, energy * 0.4 + bond * 0.6),
    [bond, energy],
  );

  const currentForm = forms[activeForm];

  const eyeShape: EyeShape = useMemo(() => {
    if (activeForm === 'battle') return 'slit';
    if (energy > 70 || curiosity > 80) return 'star';
    return 'round';
  }, [activeForm, curiosity, energy]);

  const tailSplits = useMemo(() => {
    if (activeForm === 'battle') return 3;
    if (activeForm === 'explorer' && curiosity > 50) return 2;
    return 1;
  }, [activeForm, curiosity]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Meta-Pet Form Visualizer
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Living avatar system with genome-driven transformations
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur">
            <div className="aspect-square bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-20 blur-3xl animate-pulse"
                style={{
                  background: `radial-gradient(circle at center, ${currentForm.glowColor}, transparent 70%)`,
                }}
              />

              <MetaPetSVG
                form={activeForm}
                colors={currentForm}
                red60={red60}
                blue60={blue60}
                black60={black60}
                eyeShape={eyeShape}
                tailSplits={tailSplits}
                curiosity={curiosity}
              />
            </div>

            <div className="mt-4 text-center">
              <h2 className="text-2xl font-bold" style={{ color: currentForm.accentColor }}>
                {currentForm.name}
              </h2>
              <p className="text-gray-400 text-sm mt-1">{currentForm.description}</p>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-2">
              {[
                { label: 'Base', color: currentForm.baseColor },
                { label: 'Accent', color: currentForm.accentColor },
                { label: 'Secondary', color: currentForm.secondaryAccent },
                { label: 'Eyes', color: currentForm.eyeColor },
              ].map(({ label, color }) => (
                <div key={label} className="text-center">
                  <div
                    className="h-12 rounded border-2 border-gray-600"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-xs mt-1 text-gray-400">{label}</p>
                  <p className="text-xs font-mono text-gray-500">{color}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur">
              <h3 className="text-xl font-bold mb-4">Pet Statistics</h3>
              <div className="space-y-4">
                <StatSlider
                  label="Energy"
                  value={energy}
                  onChange={setEnergy}
                  color="#FF6B6B"
                  icon="⚡"
                />
                <StatSlider
                  label="Curiosity"
                  value={curiosity}
                  onChange={setCuriosity}
                  color="#4ECDC4"
                  icon="🔍"
                />
                <StatSlider
                  label="Bond Level"
                  value={bond}
                  onChange={setBond}
                  color="#FFB347"
                  icon="💝"
                />
                <StatSlider
                  label="Health"
                  value={health}
                  onChange={setHealth}
                  color="#95E1D3"
                  icon="❤️"
                />
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur">
              <h3 className="text-xl font-bold mb-4">Genome Expression</h3>
              <p className="text-sm text-gray-400 mb-4">
                Marking patterns derived from genetic code
              </p>
              <div className="space-y-3">
                <GenomeBar label="Red-60" value={red60} color="#FF4757" />
                <GenomeBar label="Blue-60" value={blue60} color="#5F9FFF" />
                <GenomeBar label="Black-60" value={black60} color="#A29BFE" />
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur">
              <h3 className="text-xl font-bold mb-4">Form Conditions</h3>
              <div className="space-y-2 text-sm">
                <FormCondition active={activeForm === 'explorer'} label="Explorer" condition="Default active state" />
                <FormCondition active={activeForm === 'sleep'} label="Sleep" condition="Energy &lt; 30 AND Health &lt; 50" />
                <FormCondition active={activeForm === 'study'} label="Study Buddy" condition="Bond &gt; 60 AND Curiosity &gt; 50" />
                <FormCondition active={activeForm === 'battle'} label="Battle" condition="Energy &gt; 70 AND Curiosity &gt; 60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatSlider = ({ label, value, onChange, color, icon }: StatSliderProps) => (
  <div>
    <div className="flex justify-between mb-2">
      <span className="text-sm font-medium">
        {icon} {label}
      </span>
      <span className="text-sm font-mono" style={{ color }}>
        {value}
      </span>
    </div>
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={(event) => onChange(Number.parseInt(event.target.value, 10))}
      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #374151 ${value}%, #374151 100%)`,
      }}
    />
  </div>
);

const GenomeBar = ({ label, value, color }: GenomeBarProps) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm">{label}</span>
      <span className="text-sm font-mono">{value.toFixed(0)}%</span>
    </div>
    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full transition-all duration-700 ease-out"
        style={{
          width: `${value}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}`,
        }}
      />
    </div>
  </div>
);

const FormCondition = ({ active, label, condition }: FormConditionProps) => (
  <div
    className={`p-3 rounded-lg border-2 transition-all ${
      active ? 'border-cyan-400 bg-cyan-400/10' : 'border-gray-700 bg-gray-700/20'
    }`}
  >
    <div className="flex items-center justify-between">
      <span className="font-medium">{label}</span>
      {active && <span className="text-cyan-400 text-xs">● ACTIVE</span>}
    </div>
    <p className="text-xs text-gray-400 mt-1">{condition}</p>
  </div>
);

const MetaPetSVG = ({
  form,
  colors,
  red60,
  blue60,
  black60,
  eyeShape,
  tailSplits,
  curiosity,
}: MetaPetSvgProps) => {
  const isAsleep = form === 'sleep';
  const isBattle = form === 'battle';
  const isStudy = form === 'study';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full max-w-md">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="red60Grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FF4757', stopOpacity: red60 / 100 }} />
          <stop offset="100%" style={{ stopColor: '#FF4757', stopOpacity: 0 }} />
        </linearGradient>

        <radialGradient id="blue60Grad">
          <stop offset="0%" style={{ stopColor: '#5F9FFF', stopOpacity: blue60 / 100 }} />
          <stop offset="100%" style={{ stopColor: '#5F9FFF', stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      <g className={isAsleep ? 'animate-pulse' : ''}>
        <ellipse
          cx={150}
          cy={isAsleep ? 160 : 150}
          rx={isAsleep ? 50 : isBattle ? 45 : 55}
          ry={isAsleep ? 60 : isBattle ? 50 : 60}
          fill={colors.baseColor}
          className="transition-all duration-1000"
        />

        <ellipse
          cx={150}
          cy={isAsleep ? 160 : 150}
          rx={isAsleep ? 50 : isBattle ? 45 : 55}
          ry={isAsleep ? 60 : isBattle ? 50 : 60}
          fill={colors.glowColor}
          filter="url(#glow)"
          className="animate-pulse"
        />

        {!isAsleep && (
          <ellipse
            cx={150}
            cy={isStudy ? 110 : 105}
            rx={isStudy ? 42 : 40}
            ry={isStudy ? 45 : 42}
            fill={colors.baseColor}
            className="transition-all duration-1000"
          />
        )}

        <path
          d={
            isAsleep
              ? 'M 150 120 Q 150 140 150 160 Q 150 180 150 200'
              : 'M 150 80 Q 150 100 150 120 Q 150 140 150 160 Q 150 180 150 190'
          }
          stroke="url(#red60Grad)"
          strokeWidth={3}
          fill="none"
          strokeDasharray="5,5"
          className="transition-all duration-1000"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="10" dur="2s" repeatCount="indefinite" />
        </path>

        {!isAsleep && (
          <>
            <circle cx={130} cy={100} r={3} fill={colors.accentColor} opacity={blue60 / 150}>
              <animate
                attributeName="opacity"
                values={`${blue60 / 150};${blue60 / 100};${blue60 / 150}`}
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx={170} cy={100} r={3} fill={colors.accentColor} opacity={blue60 / 150}>
              <animate
                attributeName="opacity"
                values={`${blue60 / 150};${blue60 / 100};${blue60 / 150}`}
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <path d="M 130 100 L 140 95" stroke={colors.accentColor} strokeWidth={1} opacity={blue60 / 150} />
            <path d="M 170 100 L 160 95" stroke={colors.accentColor} strokeWidth={1} opacity={blue60 / 150} />
          </>
        )}

        {!isAsleep && (
          <>
            <ellipse
              cx={isBattle ? 115 : 120}
              cy={isBattle ? 80 : 85}
              rx={15}
              ry={35}
              fill={colors.baseColor}
              opacity={0.8}
              transform={isBattle ? 'rotate(-30 115 80)' : 'rotate(-20 120 85)'}
              className="transition-all duration-1000"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values={
                  isBattle ? '-30 115 80;-25 115 80;-30 115 80' : '-20 120 85;-15 120 85;-20 120 85'
                }
                dur="4s"
                repeatCount="indefinite"
              />
            </ellipse>
            <ellipse
              cx={isBattle ? 185 : 180}
              cy={isBattle ? 80 : 85}
              rx={15}
              ry={35}
              fill={colors.baseColor}
              opacity={0.8}
              transform={isBattle ? 'rotate(30 185 80)' : 'rotate(20 180 85)'}
              className="transition-all duration-1000"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values={
                  isBattle ? '30 185 80;25 185 80;30 185 80' : '20 180 85;15 180 85;20 180 85'
                }
                dur="4s"
                repeatCount="indefinite"
              />
            </ellipse>
            <ellipse cx={120} cy={65} rx={8} ry={12} fill={colors.accentColor} opacity={0.6} filter="url(#glow)">
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx={180} cy={65} rx={8} ry={12} fill={colors.accentColor} opacity={0.6} filter="url(#glow)">
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
            </ellipse>
          </>
        )}

        {!isAsleep ? (
          <>
            <Eye cx={135} cy={110} shape={eyeShape} color={colors.eyeColor} size={isStudy ? 14 : 12} />
            <Eye cx={165} cy={110} shape={eyeShape} color={colors.eyeColor} size={isStudy ? 14 : 12} />
          </>
        ) : (
          <>
            <path d="M 130 160 Q 135 165 140 160" stroke={colors.accentColor} strokeWidth={2} fill="none" />
            <path d="M 160 160 Q 165 165 170 160" stroke={colors.accentColor} strokeWidth={2} fill="none" />
          </>
        )}

        {isStudy && (
          <g>
            <path d="M 150 135 L 145 145 L 150 148 L 155 145 Z" fill={colors.accentColor} opacity={0.7}>
              <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite" />
            </path>
            <text x={150} y={125} fontSize={12} fill={colors.accentColor} textAnchor="middle" opacity={0.5}>
              <animate attributeName="opacity" values="0;0.7;0" dur="3s" repeatCount="indefinite" />
              ?
            </text>
          </g>
        )}

        {!isAsleep && (
          <>
            <ellipse cx={130} cy={190} rx={12} ry={15} fill={colors.baseColor} />
            <ellipse cx={170} cy={190} rx={12} ry={15} fill={colors.baseColor} />
            <circle cx={130} cy={195} r={4} fill={colors.secondaryAccent} opacity={0.6} />
            <circle cx={170} cy={195} r={4} fill={colors.secondaryAccent} opacity={0.6} />
          </>
        )}

        <Tail
          form={form}
          splits={tailSplits}
          color={colors.accentColor}
          secondaryColor={colors.secondaryAccent}
          curiosity={curiosity}
        />

        {black60 > 60 && !isAsleep && (
          <>
            <path d="M 135 150 Q 150 155 165 150" stroke="#A29BFE" strokeWidth={2} fill="none" opacity={black60 / 150}>
              <animate
                attributeName="opacity"
                values={`${black60 / 200};${black60 / 120};${black60 / 200}`}
                dur="4s"
                repeatCount="indefinite"
              />
            </path>
            <circle cx={150} cy={90} r={8} fill="#A29BFE" opacity={black60 / 200} filter="url(#glow)" />
          </>
        )}
      </g>
    </svg>
  );
};

const Eye = ({ cx, cy, shape, color, size = 12 }: EyeProps) => {
  if (shape === 'star') {
    return (
      <g>
        <circle cx={cx} cy={cy} r={size} fill="white" />
        <path
          d={`M ${cx} ${cy - 6} L ${cx + 2} ${cy - 2} L ${cx + 6} ${cy} L ${cx + 2} ${cy + 2} L ${cx} ${cy + 6} L ${cx - 2} ${cy + 2} L ${cx - 6} ${cy} L ${cx - 2} ${cy - 2} Z`}
          fill={color}
          filter="url(#glow)"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${cx} ${cy}`}
            to={`360 ${cx} ${cy}`}
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    );
  }

  if (shape === 'slit') {
    return (
      <g>
        <circle cx={cx} cy={cy} r={size} fill={color} opacity={0.3} />
        <ellipse cx={cx} cy={cy} rx={2} ry={size - 2} fill={color} filter="url(#glow)" />
      </g>
    );
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={size} fill="white" />
      <circle cx={cx} cy={cy} r={size - 4} fill={color} filter="url(#glow)">
        <animate attributeName="r" values={`${size - 4};${size - 3};${size - 4}`} dur="3s" repeatCount="indefinite" />
      </circle>
    </g>
  );
};

const Tail = ({ form, splits, color, secondaryColor, curiosity }: TailProps) => {
  const isAsleep = form === 'sleep';
  const isBattle = form === 'battle';

  if (isAsleep) {
    return (
      <g>
        <path
          d="M 150 200 Q 200 200 210 160 Q 210 140 200 120 Q 180 110 150 120"
          stroke={color}
          strokeWidth={8}
          fill="none"
          opacity={0.6}
        />
        <text x={180} y={150} fontSize={10} fill={color} opacity={0.4}>
          <animate attributeName="opacity" values="0;0.6;0" dur="5s" repeatCount="indefinite" />
          ψ
        </text>
      </g>
    );
  }

  if (isBattle && splits === 3) {
    return (
      <g>
        <path d="M 150 190 Q 140 220 130 250" stroke={color} strokeWidth={4} fill="none" filter="url(#glow)">
          <animate
            attributeName="d"
            values="M 150 190 Q 140 220 130 250;M 150 190 Q 135 220 125 250;M 150 190 Q 140 220 130 250"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
        <path d="M 150 190 Q 150 230 150 260" stroke={secondaryColor} strokeWidth={4} fill="none" filter="url(#glow)">
          <animate
            attributeName="d"
            values="M 150 190 Q 150 230 150 260;M 150 190 Q 148 230 150 260;M 150 190 Q 150 230 150 260"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </path>
        <path d="M 150 190 Q 160 220 170 250" stroke={color} strokeWidth={4} fill="none" filter="url(#glow)">
          <animate
            attributeName="d"
            values="M 150 190 Q 160 220 170 250;M 150 190 Q 165 220 175 250;M 150 190 Q 160 220 170 250"
            dur="0.9s"
            repeatCount="indefinite"
          />
        </path>
        <circle cx={130} cy={250} r={4} fill={color} opacity={0.8}>
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx={150} cy={260} r={4} fill={secondaryColor} opacity={0.8}>
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx={170} cy={250} r={4} fill={color} opacity={0.8}>
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>
    );
  }

  if (splits === 2) {
    return (
      <g>
        <path d="M 150 190 Q 150 210 150 230" stroke={color} strokeWidth={6} fill="none" />
        <path d="M 150 230 Q 140 240 135 255" stroke={color} strokeWidth={4} fill="none" filter="url(#glow)">
          <animate
            attributeName="d"
            values="M 150 230 Q 140 240 135 255;M 150 230 Q 138 240 133 255;M 150 230 Q 140 240 135 255"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>
        <path d="M 150 230 Q 160 240 165 255" stroke={color} strokeWidth={4} fill="none" filter="url(#glow)">
          <animate
            attributeName="d"
            values="M 150 230 Q 160 240 165 255;M 150 230 Q 162 240 167 255;M 150 230 Q 160 240 165 255"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>
        <circle cx={135} cy={255} r={5} fill={secondaryColor} opacity={curiosity / 100} filter="url(#glow)">
          <animate
            attributeName="opacity"
            values={`${curiosity / 150};${curiosity / 80};${curiosity / 150}`}
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx={165} cy={255} r={5} fill={secondaryColor} opacity={curiosity / 100} filter="url(#glow)">
          <animate
            attributeName="opacity"
            values={`${curiosity / 150};${curiosity / 80};${curiosity / 150}`}
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    );
  }

  return (
    <g>
      <path
        d="M 150 190 Q 160 220 165 250"
        stroke={color}
        strokeWidth={6}
        fill="none"
        filter="url(#glow)"
      >
        <animate
          attributeName="d"
          values="M 150 190 Q 160 220 165 250;M 150 190 Q 155 220 160 250;M 150 190 Q 160 220 165 250"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </path>
      <circle cx={165} cy={250} r={6} fill={secondaryColor} opacity={0.8} filter="url(#glow)">
        <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
      </circle>
    </g>
  );
};

export default MetaPetVisualizer;
