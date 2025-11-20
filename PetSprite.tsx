
import { memo } from 'react';

import { useStore } from '@/lib/store';
import { EVOLUTION_VISUALS } from '@/lib/evolution';
import { motion } from 'framer-motion';

export const PetSprite = memo(function PetSprite() {
  const traits = useStore(s => s.traits);
  const vitals = useStore(s => s.vitals);
  const evolution = useStore(s => s.evolution);

  if (!traits) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-6xl animate-pulse">🧬</div>
      </div>
    );
  }

  const { physical } = traits;

  // Determine animation state based on vitals
  const isHappy = vitals.mood > 70;
  const isTired = vitals.energy < 30;
  const isHungry = vitals.hunger > 70;

  // Map body types to SVG shapes
  const getBodyShape = () => {
    const size = physical.size * 80; // Scale to pixel size
    const baseProps = {
      fill: physical.primaryColor,
      stroke: physical.secondaryColor,
      strokeWidth: 3,
    };

    switch (physical.bodyType) {
      case 'Spherical':
        return <circle cx="100" cy="100" r={size} {...baseProps} />;
      case 'Cubic':
        return (
          <rect
            x={100 - size}
            y={100 - size}
            width={size * 2}
            height={size * 2}
            {...baseProps}
          />
        );
      case 'Pyramidal':
        return (
          <polygon
            points={`100,${100 - size} ${100 - size},${100 + size} ${100 + size},${100 + size}`}
            {...baseProps}
          />
        );
      case 'Cylindrical':
        return (
          <ellipse
            cx="100"
            cy="100"
            rx={size * 0.6}
            ry={size * 1.2}
            {...baseProps}
          />
        );
      case 'Toroidal':
        return (
          <g>
            <circle cx="100" cy="100" r={size} {...baseProps} />
            <circle cx="100" cy="100" r={size * 0.5} fill="none" stroke={baseProps.stroke} strokeWidth={baseProps.strokeWidth} />
          </g>
        );
      case 'Crystalline':
        return (
          <polygon
            points={`100,${100 - size} ${100 + size * 0.7},${100 - size * 0.3} ${100 + size * 0.5},${100 + size * 0.5} ${100 - size * 0.5},${100 + size * 0.5} ${100 - size * 0.7},${100 - size * 0.3}`}
            {...baseProps}
          />