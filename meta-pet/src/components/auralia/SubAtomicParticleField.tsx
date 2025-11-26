import React, { useMemo } from 'react';

interface SubAtomicParticleFieldProps {
  energy: number;
  curiosity: number;
  bond: number;
  size?: number;
  color?: string;
}

interface Particle {
  id: number;
  orbit: number;
  size: number;
  duration: number;
  delay: number;
  twinkle: number;
  twinkleDelay: number;
  opacity: number;
}

/**
 * Sub-Atomic Particle Field (Upgrade 4)
 * Web adaptation of the particle halo that responds to vitals.
 */
export function SubAtomicParticleField({
  energy,
  curiosity,
  bond,
  size = 400,
  color = '#22d3ee',
}: SubAtomicParticleFieldProps) {
  const particles = useMemo<Particle[]>(() => {
    const particleCount = Math.max(12, Math.round(10 + energy / 3));
    const bondInfluence = 1 + bond / 150;
    const curiosityVariance = Math.max(0.8, 1.4 - curiosity / 120);

    return Array.from({ length: particleCount }, (_, index) => {
      const orbitBase = 70 + (index * 6) % 80;
      const orbitJitter = (Math.sin(index * 1.7 + energy / 15) + 1) * 12;
      const orbit = orbitBase + orbitJitter;

      const sizePulse = 1 + (energy / 120) * (1 + Math.sin(index * 0.9));
      const duration = Math.max(2.5, 6 - energy / 35 + (index % 5) * 0.2);
      const delay = (index * 0.35 + bond / 90) % duration;

      return {
        id: index,
        orbit,
        size: 1.4 + sizePulse,
        duration: duration * curiosityVariance,
        delay,
        twinkle: 1.2 + (index % 4) * 0.3,
        twinkleDelay: (index * 0.15) % 2,
        opacity: 0.35 + (bondInfluence * (index % 7)) / 25,
      };
    });
  }, [bond, curiosity, energy, size]);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      viewBox={`0 0 ${size} ${size}`}
      role="presentation"
    >
      <style>{`
        @keyframes particle-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes particle-twinkle {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 1; }
        }
      `}</style>

      {particles.map((particle) => (
        <g
          key={particle.id}
          className="particle-orbit"
          style={{
            transformOrigin: `${size / 2}px ${size / 2}px`,
            animation: `particle-orbit ${particle.duration}s linear infinite`,
            animationDelay: `-${particle.delay}s`,
          }}
        >
          <circle
            cx={size / 2 + particle.orbit}
            cy={size / 2}
            r={particle.size}
            fill={color}
            opacity={particle.opacity}
            className="particle-twinkle"
            style={{
              animation: `particle-twinkle ${particle.twinkle}s ease-in-out infinite`,
              animationDelay: `${particle.twinkleDelay}s`,
              filter: 'blur(0.4px)',
            }}
          />
        </g>
      ))}
    </svg>
  );
}

export default SubAtomicParticleField;
