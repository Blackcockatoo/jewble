'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ResponseBubble } from '@/components/ResponseBubble';
import { useRealtimeResponse } from '@/lib/realtime/useRealtimeResponse';
import { playHepta } from '@/lib/identity/hepta';
import type { ResponseContext } from '@/lib/realtime/responseSystem';
import { Sparkles, Heart, Zap, Trophy, AlertTriangle } from 'lucide-react';

/**
 * Test page for the interactive response system
 * Allows manual triggering of all response types
 */
export default function TestResponsesPage() {
  const [mood, setMood] = useState(70);
  const [energy, setEnergy] = useState(80);
  const [hunger, setHunger] = useState(30);
  const [hygiene, setHygiene] = useState(90);

  const context: ResponseContext = {
    mood,
    energy,
    hunger,
    hygiene,
    recentActions: [],
    evolutionStage: 'GENETICS',
    level: 5,
  };

  const handleAudioTrigger = useCallback(async (digits: number[]) => {
    try {
      await playHepta(digits as readonly number[], {
        tempo: 200,
        volume: 0.15,
        sustainRatio: 0.7,
      });
    } catch (error) {
      console.warn('Failed to play audio:', error);
    }
  }, []);

  const {
    currentResponse,
    isVisible,
    triggerResponse,
    triggerIdleResponse,
    triggerAnticipationResponse,
    responseHistory,
    consecutiveActionCount,
  } = useRealtimeResponse(context, {
    enableAudio: true,
    enableAnticipation: true,
    onAudioTrigger: handleAudioTrigger,
    autoIdleInterval: 15000,
  });

  const testActions = [
    { action: 'feed', label: 'Feed', icon: <Heart className="w-4 h-4" />, color: 'bg-orange-500' },
    { action: 'play', label: 'Play', icon: <Sparkles className="w-4 h-4" />, color: 'bg-purple-500' },
    { action: 'clean', label: 'Clean', icon: <Sparkles className="w-4 h-4" />, color: 'bg-blue-500' },
    { action: 'sleep', label: 'Sleep', icon: <Zap className="w-4 h-4" />, color: 'bg-indigo-500' },
    { action: 'achievement', label: 'Achievement', icon: <Trophy className="w-4 h-4" />, color: 'bg-yellow-500' },
    { action: 'evolution', label: 'Evolution', icon: <Zap className="w-4 h-4" />, color: 'bg-pink-500' },
    { action: 'battle_victory', label: 'Battle Win', icon: <Trophy className="w-4 h-4" />, color: 'bg-green-500' },
    { action: 'battle_defeat', label: 'Battle Loss', icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-red-500' },
    { action: 'minigame_victory', label: 'Game Win', icon: <Trophy className="w-4 h-4" />, color: 'bg-emerald-500' },
    { action: 'minigame_good', label: 'Good Score', icon: <Heart className="w-4 h-4" />, color: 'bg-teal-500' },
    { action: 'exploration_discovery', label: 'Discovery', icon: <Sparkles className="w-4 h-4" />, color: 'bg-cyan-500' },
    { action: 'vitals_check', label: 'Check Vitals', icon: <Heart className="w-4 h-4" />, color: 'bg-rose-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-6">
      <ResponseBubble response={currentResponse} isVisible={isVisible} />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Response System Test Page
          </h1>
          <p className="text-zinc-400">Test all interactive response types with audio feedback</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-800">
            <div className="text-zinc-400 text-sm mb-1">Consecutive Actions</div>
            <div className="text-3xl font-bold text-cyan-400">{consecutiveActionCount}</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-800">
            <div className="text-zinc-400 text-sm mb-1">Response History</div>
            <div className="text-3xl font-bold text-purple-400">{responseHistory.length}</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-800">
            <div className="text-zinc-400 text-sm mb-1">Current Response</div>
            <div className="text-xl font-bold text-pink-400">{isVisible ? 'Visible' : 'Hidden'}</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-800">
            <div className="text-zinc-400 text-sm mb-1">Audio Enabled</div>
            <div className="text-xl font-bold text-green-400">Yes</div>
          </div>
        </div>

        {/* Context Controls */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Context Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Mood: {mood}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Energy: {energy}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Hunger: {hunger}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={hunger}
                onChange={(e) => setHunger(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Hygiene: {hygiene}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={hygiene}
                onChange={(e) => setHygiene(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Test Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {testActions.map(({ action, label, icon, color }) => (
              <Button
                key={action}
                onClick={() => triggerResponse(action)}
                className={`${color} hover:opacity-90 gap-2`}
              >
                {icon}
                {label}
              </Button>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <Button
              onClick={() => triggerIdleResponse()}
              variant="outline"
              className="flex-1"
            >
              Trigger Idle Response
            </Button>
            <Button
              onClick={() => triggerAnticipationResponse()}
              variant="outline"
              className="flex-1"
            >
              Trigger Anticipation
            </Button>
          </div>
        </div>

        {/* Response History */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-4">Response History</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {responseHistory.length === 0 ? (
              <p className="text-zinc-500 text-center py-4">No responses yet. Try triggering some actions!</p>
            ) : (
              responseHistory.map((response, index) => (
                <div
                  key={response.id}
                  className="bg-slate-950/50 rounded-lg px-4 py-3 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{response.emoji}</span>
                    <div>
                      <div className="text-white font-medium">{response.text}</div>
                      <div className="text-xs text-zinc-500">
                        Type: {response.type} • Intensity: {response.intensity}
                        {response.audioTrigger && ` • Audio: ${response.audioTrigger}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-zinc-500 text-sm">#{index + 1}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-slate-900/30 backdrop-blur-sm rounded-xl p-6 border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-2">How to Test</h3>
          <ul className="text-zinc-400 space-y-1 text-sm">
            <li>• Click action buttons to trigger different response types</li>
            <li>• Adjust vitals sliders to see context-aware responses</li>
            <li>• Click the same action 3+ times quickly to see streak celebrations</li>
            <li>• Set hunger &gt; 80 or hygiene &lt; 20 to trigger warnings</li>
            <li>• Audio feedback plays automatically (make sure volume is up)</li>
            <li>• Watch for chain reactions on streak milestones</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
