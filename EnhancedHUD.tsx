'use client';

import { useStore } from '@/lib/store';
import { UtensilsCrossed, Sparkles, Droplets, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { useRealtimeResponse } from '@/hooks/useRealtimeResponse';
import { ResponseBubble } from './ResponseBubble';

export function EnhancedHUD() {
  const vitals = useStore(s => s.vitals);
  const feed = useStore(s => s.feed);
  const clean = useStore(s => s.clean);
  const play = useStore(s => s.play);
  const sleep = useStore(s => s.sleep);

  const { currentResponse, isVisible, triggerResponse } = useRealtimeResponse({
    mood: vitals.mood,
    energy: vitals.energy,
    hunger: vitals.hunger,
    hygiene: vitals.hygiene,
    recentActions: [],
  });

  const handleFeed = () => {
    feed();
    triggerResponse('feed');
  };

  const handleClean = () => {
    clean();
    triggerResponse('clean');
  };

  const handlePlay = () => {
    play();
    triggerResponse('play');
  };

  const handleSleep = () => {
    sleep();
    triggerResponse('sleep');
  };

  return (
    <>
      <ResponseBubble response={currentResponse} isVisible={isVisible} />

      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Stat Bars with enhanced animations */}
        <div className="space-y-3">
          <EnhancedStatBar
            label="Hunger"
            value={vitals.hunger}
            icon={<UtensilsCrossed className="w-4 h-4" />}
            color="from-orange-500 to-red-500"
            critical={vitals.hunger > 80}
          />
          <EnhancedStatBar
            label="Hygiene"
            value={vitals.hygiene}
            icon={<Droplets className="w-4 h-4" />}
            color="from-blue-500 to-cyan-500"
            critical={vitals.hygiene < 20}
          />
          <EnhancedStatBar
            label="Mood"
            value={vitals.mood}
            icon={<Sparkles className="w-4 h-4" />}
            color="from-pink-500 to-purple-500"
          />
          <EnhancedStatBar
            label="Energy"
            value={vitals.energy}
            icon={<Zap className="w-4 h-4" />}
            color="from-yellow-500 to-amber-500"
            critical={vitals.energy < 10}
          />
        </div>

        {/* Action Buttons with slick interactions */}
        <motion.div
          className="grid grid-cols-2 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <EnhancedButton
            onClick={handleFeed}
            icon={<UtensilsCrossed className="w-4 h-4" />}
            label="Feed"
            variant="default"
          />
          <EnhancedButton
            onClick={handleClean}
            icon={<Droplets className="w-4 h-4" />}
            label="Clean"
            variant="secondary"
          />
          <EnhancedButton
            onClick={handlePlay}
            icon={<Sparkles className="w-4 h-4" />}
            label="Play"
            variant="outline"
          />
          <EnhancedButton
            onClick={handleSleep}
            icon={<Zap className="w-4 h-4" />}
            label="Sleep"
            variant="ghost"
          />
        </motion.div>
      </motion.div>
    </>
  );
}

interface EnhancedStatBarProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  critical?: boolean;
}

function EnhancedStatBar({ label, value, icon, color, critical = false }: EnhancedStatBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-1 text-sm">
        <div className="flex items-center gap-2 text-zinc-300">
          <motion.div
            animate={critical ? { scale: [1, 1.2, 1] } : {}}
            transition={critical ? { duration: 1, repeat: Infinity } : {}}
          >
            {icon}
          </motion.div>
          <span>{label}</span>
        </div>
        <motion.span
          className="font-bold text-white tabular-nums"
          animate={critical ? { color: ['#ffffff', '#ff6b6b', '#ffffff'] } : {}}
          transition={critical ? { duration: 1, repeat: Infinity } : {}}
        >
          {Math.round(value)}%
        </motion.span>
      </div>

      <div className="h-3 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 relative">
        {/* Animated background shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Progress bar */}
        <motion.div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-500 relative overflow-hidden`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        >
          {/* Glow effect for critical state */}
          {critical && (
            <motion.div
              className="absolute inset-0 bg-white/30 blur-sm"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

interface EnhancedButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant: 'default' | 'secondary' | 'outline' | 'ghost';
}

function EnhancedButton({ onClick, icon, label, variant }: EnhancedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Button
        onClick={onClick}
        variant={variant}
        className={`
          w-full gap-2 relative overflow-hidden
          transition-all duration-300
          ${variant === 'default' ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-lg hover:shadow-blue-500/50' : ''}
          ${variant === 'secondary' ? 'bg-gradient-to-r from-slate-700 to-slate-600 hover:shadow-lg hover:shadow-slate-500/50' : ''}
        `}
      >
        {/* Shimmer effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.5 }}
        />

        <motion.div
          className="flex items-center gap-2 relative z-10"
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {icon}
          {label}
        </motion.div>
      </Button>
    </motion.div>
  );
}
