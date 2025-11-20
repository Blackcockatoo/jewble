'use client';

import { memo, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { EVOLUTION_VISUALS } from '@/lib/evolution';
import { motion } from 'framer-motion';

export const EnhancedPetSprite = memo(function EnhancedPetSprite() {
  const traits = useStore(s => s.traits);
  const vitals = useStore(s => s.vitals);
  const evolution = useStore(s => s.evolution);

  if (!traits) {
    return (
      <motion.div
        className="w-full h-full flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-6xl"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🧬
        </motion.div>
      </motion.div>
    );
  }

  const { physical } = traits;

  // Determine animation state based on vitals
  const isHappy = vitals.mood > 70;
  const isTired = vitals.energy < 30;
  const isHungry = vitals.hunger > 70;
  const isUnhappy = vitals.mood < 40;

  // Animation variants based on mood
  const petAnimationVariants = {
    happy: {
      y: [0, -8, 0],
      rotate: [0, 2, -2, 0],
    },
    neutral: {
      y: [0, -3, 0],
      rotate: [0, 1, -1, 0],
    },
    tired: {
      y: [0, -2, 0],
      rotate: [0, 0.5, -0.5, 0],
      opacity: [1, 0.8, 1],
    },
    unhappy: {
      y: [0, -2, 0],
      rotate: [0, -2, 2, 0],
    },
    hungry: {
      y: [0, -10, 0],
      scale: [1, 0.95, 1],
    },
  };

  const getMoodAnimation = () => {
    if (isHappy) return petAnimationVariants.happy;
    if (isTired) return petAnimationVariants.tired;
    if (isUnhappy) return petAnimationVariants.unhappy;
    if (isHungry) return petAnimationVariants.hungry;
    return petAnimationVariants.neutral;
  };

  const getBodyShape = () => {
    const size = physical.size * 80;
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
            <circle
              cx="100"
              cy="100"
              r={size * 0.5}
              fill="none"
              stroke={baseProps.stroke}
              strokeWidth={baseProps.strokeWidth}
            />
          </g>
        );
      case 'Crystalline':
        return (
          <polygon
            points={`100,${100 - size} ${100 + size * 0.7},${100 - size * 0.3} ${100 + size * 0.5},${100 + size * 0.5} ${100 - size * 0.5},${100 + size * 0.5} ${100 - size * 0.7},${100 - size * 0.3}`}
            {...baseProps}
          />
        );
      default:
        return <circle cx="100" cy="100" r={size} {...baseProps} />;
    }
  };

  // Glow effect intensity based on mood
  const glowIntensity = Math.max(0.2, vitals.mood / 100);
  const glowColor = isHappy ? '#3b82f6' : isUnhappy ? '#ef4444' : '#8b5cf6';

  return (
    <motion.div
      className="w-full h-full flex items-center justify-center relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background: glowColor,
          opacity: glowIntensity * 0.3,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [glowIntensity * 0.2, glowIntensity * 0.4, glowIntensity * 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Pet sprite with animations */}
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full max-w-xs relative z-10"
        animate={getMoodAnimation()}
        transition={{
          duration: isHappy ? 1.5 : isTired ? 2.5 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Defs for gradients and filters */}
        <defs>
          {/* Glossy shine effect */}
          <radialGradient id="petGloss" cx="35%" cy="35%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="50%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* Mood glow */}
          <filter id="moodGlow">
            <feGaussianBlur stdDeviation={isHappy ? '3' : '1'} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Shadow */}
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Shadow */}
        <ellipse cx="100" cy="180" rx="60" ry="12" fill="black" opacity="0.2" filter="url(#shadow)" />

        {/* Main body */}
        <g filter="url(#moodGlow)">{getBodyShape()}</g>

        {/* Glossy shine overlay */}
        <circle cx="100" cy="100" r={physical.size * 80} fill="url(#petGloss)" />

        {/* Eyes - animated based on mood */}
        <motion.g
          animate={{
            opacity: isTired ? 0.5 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <circle cx="85" cy="90" r="8" fill="white" />
          <circle cx="115" cy="90" r="8" fill="white" />

          {/* Pupils */}
          <motion.circle
            cx="85"
            cy="90"
            r="5"
            fill="black"
            animate={{
              cx: isHappy ? 87 : isUnhappy ? 83 : 85,
              cy: isHappy ? 88 : isUnhappy ? 92 : 90,
            }}
            transition={{ duration: 0.5 }}
          />
          <motion.circle
            cx="115"
            cy="90"
            r="5"
            fill="black"
            animate={{
              cx: isHappy ? 117 : isUnhappy ? 113 : 115,
              cy: isHappy ? 88 : isUnhappy ? 92 : 90,
            }}
            transition={{ duration: 0.5 }}
          />
        </motion.g>

        {/* Mouth - changes based on mood */}
        <motion.path
          d={
            isHappy
              ? 'M 90 110 Q 100 120 110 110' // Smile
              : isUnhappy
                ? 'M 90 115 Q 100 110 110 115' // Frown
                : 'M 90 112 L 110 112' // Neutral
          }
          stroke={physical.secondaryColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: isHappy
              ? 'M 90 110 Q 100 120 110 110'
              : isUnhappy
                ? 'M 90 115 Q 100 110 110 115'
                : 'M 90 112 L 110 112',
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Mood particles for happy state */}
        {isHappy && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.circle
                key={i}
                cx="100"
                cy="50"
                r="2"
                fill={physical.primaryColor}
                opacity="0.6"
                animate={{
                  y: [0, -30, -60],
                  opacity: [0.6, 0.3, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                }}
              />
            ))}
          </>
        )}

        {/* Tired particles (z's) */}
        {isTired && (
          <>
            {[...Array(2)].map((_, i) => (
              <motion.text
                key={i}
                x="130"
                y="60"
                fontSize="12"
                fill={physical.primaryColor}
                opacity="0.7"
                animate={{
                  y: [60, 40, 20],
                  opacity: [0.7, 0.3, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.4,
                  repeat: Infinity,
                }}
              >
                Z
              </motion.text>
            ))}
          </>
        )}
      </motion.svg>
    </motion.div>
  );
});
