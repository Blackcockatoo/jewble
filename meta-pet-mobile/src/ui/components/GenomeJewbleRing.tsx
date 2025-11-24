import React, { useMemo } from 'react';
import Svg, { Circle, G, Line } from 'react-native-svg';
import { getResidue, getResidueMeta } from '../../engine/genome';

interface GenomeJewbleRingProps {
  redDigits: number[];
  blackDigits: number[];
  blueDigits: number[];
  size?: number;
}

export function GenomeJewbleRing({ redDigits, blackDigits, blueDigits, size = 240 }: GenomeJewbleRingProps) {
  const center = size / 2;
  const tickRadius = size * 0.44;
  const radii = {
    red: size * 0.18,
    black: size * 0.26,
    blue: size * 0.34,
    pair: tickRadius - 6,
    frontier: tickRadius - 2,
  } as const;

  const residueMeta = useMemo(() => Array.from({ length: 60 }, (_, index) => getResidueMeta(index)), []);
  const residuesBySequence = useMemo(() => {
    const toResidues = (digits: number[]) => new Set(digits.map(value => getResidue(value)));
    return {
      red: toResidues(redDigits),
      black: toResidues(blackDigits),
      blue: toResidues(blueDigits),
    };
  }, [redDigits, blackDigits, blueDigits]);

  const polar = (residue: number, radius: number) => {
    const theta = (residue / 60) * Math.PI * 2 - Math.PI / 2;
    return {
      x: center + radius * Math.cos(theta),
      y: center + radius * Math.sin(theta),
    };
  };

  const renderSequence = (residueSet: Set<number>, color: string, radius: number) => (
    <G>
      {Array.from(residueSet).map(residue => {
        const point = polar(residue, radius);
        return <Circle key={`${color}-${residue}`} cx={point.x} cy={point.y} r={4} fill={color} fillOpacity={0.9} />;
      })}
    </G>
  );

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={center} cy={center} r={tickRadius + 8} fill="rgba(15,23,42,0.5)" />

      {residueMeta.map(meta => {
        const inner = polar(meta.residue, tickRadius - 10);
        const outer = polar(meta.residue, tickRadius);
        return (
          <Line
            key={`tick-${meta.residue}`}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="#94a3b8"
            strokeWidth={meta.residue % 5 === 0 ? 1.8 : 1.1}
            strokeOpacity={meta.residue % 5 === 0 ? 0.55 : 0.35}
          />
        );
      })}

      {residueMeta.map(meta => {
        const isUsed =
          residuesBySequence.red.has(meta.residue) ||
          residuesBySequence.black.has(meta.residue) ||
          residuesBySequence.blue.has(meta.residue);

        if (!meta.hasBridge60 || !isUsed) {
          return null;
        }
        const point = polar(meta.residue, radii.pair);
        return (
          <Circle
            key={`pair-${meta.residue}`}
            cx={point.x}
            cy={point.y}
            r={7}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={1.4}
            strokeOpacity={0.6}
          />
        );
      })}

      {residueMeta.map(meta => {
        if (!meta.hasFrontier) return null;
        const point = polar(meta.residue, radii.frontier);
        const highlighted =
          residuesBySequence.red.has(meta.residue) ||
          residuesBySequence.black.has(meta.residue) ||
          residuesBySequence.blue.has(meta.residue);

        return (
          <Circle
            key={`frontier-${meta.residue}`}
            cx={point.x}
            cy={point.y}
            r={6}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={2}
            strokeOpacity={highlighted ? 1 : 0.45}
          />
        );
      })}

      {renderSequence(residuesBySequence.red, '#fb7185', radii.red)}
      {renderSequence(residuesBySequence.black, '#a78bfa', radii.black)}
      {renderSequence(residuesBySequence.blue, '#38bdf8', radii.blue)}
    </Svg>
  );
}
