'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useVisualEffects, VisualEffectsRenderer } from './VisualEffects';
import { useRealtimeResponse } from '@/hooks/useRealtimeResponse';
import { ResponseBubble } from './ResponseBubble';

interface BattleAction {
  id: string;
  attacker: 'player' | 'opponent';
  damage: number;
  type: 'physical' | 'special' | 'heal';
  timestamp: number;
}

interface EnhancedBattleArenaProps {
  playerName: string;
  opponentName: string;
  playerHp: number;
  playerMaxHp: number;
  opponentHp: number;
  opponentMaxHp: number;
  onAttack: (damage: number) => void;
  onSpecialAttack: (damage: number) => void;
  onHeal: (amount: number) => void;
  onFlee?: () => void;
}

export function EnhancedBattleArena({
  playerName,
  opponentName,
  playerHp,
  playerMaxHp,
  opponentHp,
  opponentMaxHp,
  onAttack,
  onSpecialAttack,
  onHeal,
  onFlee,
}: EnhancedBattleArenaProps) {
  const [battleLog, setBattleLog] = useState<BattleAction[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const { effects, triggerEffect } = useVisualEffects();

  const { currentResponse, isVisible, triggerResponse } = useRealtimeResponse({
    mood: 70,
    energy: 50,
    hunger: 30,
    hygiene: 60,
    recentActions: [],
  });

  const playerHpPercent = (playerHp / playerMaxHp) * 100;
  const opponentHpPercent = (opponentHp / opponentMaxHp) * 100;

  const handleAttack = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const damage = Math.floor(Math.random() * 20) + 10;
    onAttack(damage);
    triggerEffect('lightning', window.innerWidth * 0.7, window.innerHeight * 0.3, 800);
    triggerResponse('battle_victory');

    const action: BattleAction = {
      id: `${Date.now()}`,
      attacker: 'player',
      damage,
      type: 'physical',
      timestamp: Date.now(),
    };

    setBattleLog(prev => [action, ...prev.slice(0, 4)]);

    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating, onAttack, triggerEffect, triggerResponse]);

  const handleSpecialAttack = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const damage = Math.floor(Math.random() * 35) + 20;
    onSpecialAttack(damage);
    triggerEffect('explosion', window.innerWidth * 0.7, window.innerHeight * 0.3, 1000);
    triggerResponse('battle_victory');

    const action: BattleAction = {
      id: `${Date.now()}`,
      attacker: 'player',
      damage,
      type: 'special',
      timestamp: Date.now(),
    };

    setBattleLog(prev => [action, ...prev.slice(0, 4)]);

    setTimeout(() => setIsAnimating(false), 1000);
  }, [isAnimating, onSpecialAttack, triggerEffect, triggerResponse]);

  const handleHeal = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const amount = Math.floor(Math.random() * 15) + 10;
    onHeal(amount);
    triggerEffect('heal', window.innerWidth * 0.3, window.innerHeight * 0.5, 800);
    triggerResponse('action');

    const action: BattleAction = {
      id: `${Date.now()}`,
      attacker: 'player',
      damage: -amount,
      type: 'heal',
      timestamp: Date.now(),
    };

    setBattleLog(prev => [action, ...prev.slice(0, 4)]);

    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating, onHeal, triggerEffect, triggerResponse]);

  return (
    <>
      <ResponseBubble response={currentResponse} isVisible={isVisible} />
      <VisualEffectsRenderer effects={effects} />

      <motion.div
        className="w-full space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Battle Arena */}
        <div className="relative w-full aspect-video bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg border border-slate-700 overflow-hidden">
          {/* Background effects */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1), transparent 50%)',
              backgroundSize: '200% 200%',
            }}
          />

          {/* Opponent */}
          <motion.div
            className="absolute top-8 right-8 flex flex-col items-center gap-2"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="text-6xl"
              animate={{
                scale: opponentHpPercent < 30 ? [1, 0.95, 1] : 1,
                filter: opponentHpPercent < 30 ? 'hue-rotate(-30deg)' : 'hue-rotate(0deg)',
              }}
              transition={{
                duration: opponentHpPercent < 30 ? 0.5 : 1,
                repeat: opponentHpPercent < 30 ? Infinity : 0,
              }}
            >
              👾
            </motion.div>
            <div className="text-sm font-bold text-white">{opponentName}</div>
            <div className="w-32 h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                initial={{ width: '100%' }}
                animate={{ width: `${opponentHpPercent}%` }}
                transition={{ type: 'spring', stiffness: 50 }}
              />
            </div>
            <div className="text-xs text-slate-400">
              {Math.max(0, opponentHp)} / {opponentMaxHp}
            </div>
          </motion.div>

          {/* Player */}
          <motion.div
            className="absolute bottom-8 left-8 flex flex-col items-center gap-2"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="text-6xl"
              animate={{
                scale: playerHpPercent < 30 ? [1, 0.95, 1] : 1,
                filter: playerHpPercent < 30 ? 'hue-rotate(-30deg)' : 'hue-rotate(0deg)',
              }}
              transition={{
                duration: playerHpPercent < 30 ? 0.5 : 1,
                repeat: playerHpPercent < 30 ? Infinity : 0,
              }}
            >
              🐾
            </motion.div>
            <div className="text-sm font-bold text-white">{playerName}</div>
            <div className="w-32 h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                initial={{ width: '100%' }}
                animate={{ width: `${playerHpPercent}%` }}
                transition={{ type: 'spring', stiffness: 50 }}
              />
            </div>
            <div className="text-xs text-slate-400">
              {Math.max(0, playerHp)} / {playerMaxHp}
            </div>
          </motion.div>

          {/* Center text */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            animate={{
              opacity: isAnimating ? 1 : 0,
            }}
          >
            <motion.div
              className="text-4xl font-bold text-white drop-shadow-lg"
              animate={{
                scale: [1, 1.2, 1],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 0.6,
              }}
            >
              ⚔️
            </motion.div>
          </motion.div>
        </div>

        {/* Battle Log */}
        <motion.div
          className="bg-slate-900 rounded-lg border border-slate-700 p-4 max-h-24 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-1 text-sm">
            <AnimatePresence>
              {battleLog.map(action => (
                <motion.div
                  key={action.id}
                  className={`
                    ${
                      action.type === 'heal'
                        ? 'text-green-400'
                        : action.type === 'special'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                    }
                  `}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {action.attacker === 'player'
                    ? `You ${action.type === 'heal' ? 'healed' : 'dealt'} ${Math.abs(action.damage)} ${action.type === 'special' ? '⚡' : action.type === 'heal' ? '💚' : '⚔️'}`
                    : `Opponent dealt ${action.damage} damage!`}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <BattleButton
            onClick={handleAttack}
            disabled={isAnimating}
            label="Attack"
            emoji="⚔️"
            variant="primary"
          />
          <BattleButton
            onClick={handleSpecialAttack}
            disabled={isAnimating}
            label="Special"
            emoji="⚡"
            variant="special"
          />
          <BattleButton
            onClick={handleHeal}
            disabled={isAnimating}
            label="Heal"
            emoji="💚"
            variant="heal"
          />
          {onFlee && (
            <BattleButton
              onClick={onFlee}
              disabled={isAnimating}
              label="Flee"
              emoji="🏃"
              variant="secondary"
            />
          )}
        </motion.div>
      </motion.div>
    </>
  );
}

interface BattleButtonProps {
  onClick: () => void;
  disabled: boolean;
  label: string;
  emoji: string;
  variant: 'primary' | 'special' | 'heal' | 'secondary';
}

function BattleButton({ onClick, disabled, label, emoji, variant }: BattleButtonProps) {
  const variantClasses = {
    primary: 'from-blue-600 to-blue-500 hover:shadow-blue-500/50',
    special: 'from-yellow-600 to-yellow-500 hover:shadow-yellow-500/50',
    heal: 'from-green-600 to-green-500 hover:shadow-green-500/50',
    secondary: 'from-slate-600 to-slate-500 hover:shadow-slate-500/50',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`
        relative overflow-hidden rounded-lg px-4 py-3
        bg-gradient-to-r ${variantClasses[variant]}
        text-white font-bold text-sm
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-lg
      `}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={!disabled ? { x: '100%' } : {}}
        transition={{ duration: 0.5 }}
      />

      <div className="relative flex items-center justify-center gap-2">
        <span className="text-lg">{emoji}</span>
        <span>{label}</span>
      </div>
    </motion.button>
  );
}
