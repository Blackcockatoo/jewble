import React, { useEffect, useRef, useState } from 'react';

interface TemporalEchoTrailProps {
  energy: number;
  curiosity: number;
  bond: number;
  size?: number;
  color?: string;
}

interface EchoPosition {
  x: number;
  y: number;
  createdAt: number;
}

const MAX_HISTORY = 12;
const MAX_AGE_MS = 1400;

/**
 * Temporal Echo Trail (Upgrade 3)
 * Leaves a fading trail based on the pet's motion energy.
 */
export function TemporalEchoTrail({
  energy,
  curiosity,
  bond,
  size = 400,
  color = '#f4b942',
}: TemporalEchoTrailProps) {
  const [echoes, setEchoes] = useState<EchoPosition[]>([]);
  const rafRef = useRef<number>();
  const timestampRef = useRef<number>(0);

  useEffect(() => {
    const animate = (timestamp: number) => {
      timestampRef.current = timestamp;

      const wobble = Math.sin(timestamp / 620 + curiosity / 35) * (8 + bond / 40);
      const orbit = 18 + (energy / 100) * 26;
      const focusShift = Math.cos(timestamp / 880 + bond / 60) * 10;

      const x = size / 2 + Math.cos(timestamp / 920 + curiosity / 90) * (orbit + wobble * 0.35);
      const y = size / 2 + Math.sin(timestamp / 1050 + energy / 70) * (orbit * 0.65) + focusShift;

      setEchoes((prev) => {
        const updated = [...prev, { x, y, createdAt: timestamp }];
        const recent = updated.filter((echo) => timestamp - echo.createdAt < MAX_AGE_MS);
        return recent.slice(-MAX_HISTORY);
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [bond, curiosity, energy, size]);

  const currentTime = timestampRef.current || 0;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      viewBox={`0 0 ${size} ${size}`}
      role="presentation"
    >
      {echoes.map((echo, index) => {
        const age = Math.min(1, Math.max(0, (currentTime - echo.createdAt) / MAX_AGE_MS));
        const trailOpacity = Math.max(0, 0.45 - age * 0.35) * ((index + 1) / MAX_HISTORY);
        const radius = Math.max(4, 18 - age * 10);

        return (
          <circle
            key={`${echo.createdAt}-${index}`}
            cx={echo.x}
            cy={echo.y}
            r={radius}
            fill={color}
            opacity={trailOpacity}
            style={{ filter: 'blur(2px)' }}
          />
        );
      })}
    </svg>
  );
}

export default TemporalEchoTrail;
