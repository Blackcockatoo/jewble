'use client';

import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';

/**
 * StatusAnnouncer provides screen reader announcements for dynamic game events
 * using ARIA live regions. This makes the game accessible to users with visual
 * impairments by announcing critical state changes.
 *
 * Live region uses aria-live="polite" to avoid interrupting screen reader flow.
 * The sr-only class ensures it's only visible to screen readers.
 */
export function StatusAnnouncer() {
  const [message, setMessage] = useState('');
  const [lastMessageTime, setLastMessageTime] = useState(0);

  const evolution = useStore(s => s.evolution);
  const achievements = useStore(s => s.achievements);
  const vitals = useStore(s => s.vitals);
  const battle = useStore(s => s.battle);

  // Announce when evolution becomes available
  useEffect(() => {
    if (evolution.canEvolve) {
      const now = Date.now();
      // Debounce to avoid repeated announcements
      if (now - lastMessageTime > 5000) {
        const nextStage = getNextEvolutionStage(evolution.state);
        setMessage(`Your pet is ready to evolve${nextStage ? ` to ${nextStage}` : ''}!`);
        setLastMessageTime(now);
      }
    }
  }, [evolution.canEvolve, evolution.state, lastMessageTime]);

  // Announce new achievements
  useEffect(() => {
    if (achievements.length > 0) {
      const latest = achievements[achievements.length - 1];
      // Only announce if earned recently (within last 10 seconds)
      if (latest.earnedAt && Date.now() - latest.earnedAt < 10000) {
        setMessage(`Achievement unlocked: ${latest.title}`);
        setLastMessageTime(Date.now());
      }
    }
  }, [achievements]);

  // Announce critical vitals warnings
  useEffect(() => {
    const criticalThreshold = 20;
    const now = Date.now();

    if (now - lastMessageTime < 30000) return; // Don't spam warnings

    if (vitals.hunger < criticalThreshold) {
      setMessage('Warning: Your pet is very hungry!');
      setLastMessageTime(now);
    } else if (vitals.energy < criticalThreshold) {
      setMessage('Warning: Your pet is exhausted!');
      setLastMessageTime(now);
    } else if (vitals.hygiene < criticalThreshold) {
      setMessage('Warning: Your pet needs cleaning!');
      setLastMessageTime(now);
    } else if (vitals.mood < criticalThreshold) {
      setMessage('Warning: Your pet is very unhappy!');
      setLastMessageTime(now);
    }
  }, [vitals.hunger, vitals.energy, vitals.hygiene, vitals.mood, lastMessageTime]);

  // Announce battle victories (high win streak)
  useEffect(() => {
    if (battle.winStreak > 0 && battle.winStreak % 5 === 0) {
      const now = Date.now();
      if (now - lastMessageTime > 10000) {
        setMessage(`Impressive! Win streak: ${battle.winStreak} battles!`);
        setLastMessageTime(now);
      }
    }
  }, [battle.winStreak, lastMessageTime]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

/**
 * Get the name of the next evolution stage for announcements
 */
function getNextEvolutionStage(current: string): string | null {
  const stages: Record<string, string> = {
    GENETICS: 'Neuro',
    NEURO: 'Quantum',
    QUANTUM: 'Speciation',
  };
  return stages[current] || null;
}
