'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

export type EffectType = 'explosion' | 'sparkle' | 'heart' | 'star' | 'lightning' | 'heal' | 'victory';

export interface VisualEffect {
  id: string;
  type: EffectType;
  x: number;
  y: number;
  duration: number;
}

export function useVisualEffects() {
  const [effects, setEffects] = useState<VisualEffect[]>([]);

  const triggerEffect = useCallback((type: EffectType, x: number, y: number, duration = 1000) => {
    const id = `${Date.now()}-${Math.random()}`;
    const effect: VisualEffect = { id, type, x, y, duration };

    setEffects(prev => [...prev, effect]);

    setTimeout(() => {
      setEffects(prev => prev.filter(e => e.id !== id));
    }, duration);
  }, []);

  return { effects, triggerEffect };
}

interface VisualEffectsRendererProps {
  effects: VisualEffect[];
}

export function VisualEffectsRenderer({ effects }: VisualEffectsRendererProps) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {effects.map(effect => (
          <EffectElement key={effect.id} effect={effect} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface EffectElementProps {
  effect: VisualEffect;
}

function EffectElement({ effect }: EffectElementProps) {
  const { type, x, y, duration } = effect;

  const getEffectContent = () => {
    switch (type) {
      case 'explosion':
        return (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: duration / 1000 }}
            className="text-4xl"
          >
            💥
          </motion.div>
        );

      case 'sparkle':
        return (
          <motion.div className="relative w-8 h-8">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                }}
                animate={{
                  x: Math.cos((i / 8) * Math.PI * 2) * 40,
                  y: Math.sin((i / 8) * Math.PI * 2) * 40,
                  opacity: 0,
                }}
                transition={{
                  duration: duration / 1000,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        );

      case 'heart':
        return (
          <motion.div
            initial={{ scale: 0, y: 0, opacity: 1 }}
            animate={{ scale: 1, y: -60, opacity: 0 }}
            transition={{ duration: duration / 1000 }}
            className="text-3xl"
          >
            ❤️
          </motion.div>
        );

      case 'star':
        return (
          <motion.div
            initial={{ scale: 0, rotate: 0, opacity: 1 }}
            animate={{ scale: 1.2, rotate: 360, opacity: 0 }}
            transition={{ duration: duration / 1000 }}
            className="text-3xl"
          >
            ⭐
          </motion.div>
        );

      case 'lightning':
        return (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: duration / 1000 }}
            className="text-4xl"
          >
            ⚡
          </motion.div>
        );

      case 'heal':
        return (
          <motion.div
            initial={{ scale: 0, y: 0, opacity: 1 }}
            animate={{ scale: 1, y: -50, opacity: 0 }}
            transition={{ duration: duration / 1000 }}
            className="text-3xl"
          >
            💚
          </motion.div>
        );

      case 'victory':
        return (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: duration / 1000 }}
            className="text-4xl"
          >
            🏆
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="fixed pointer-events-none"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {getEffectContent()}
    </motion.div>
  );
}
