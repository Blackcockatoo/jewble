'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VimanaMap } from './VimanaMap';
import { BattleArena } from './BattleArena';
import { MiniGamesPanel } from './MiniGamesPanel';
import { CosmeticsPanel } from './CosmeticsPanel';
import { AchievementsPanel } from './AchievementsPanel';
import { PatternRecognitionGame } from './PatternRecognitionGame';
import { Map, Swords, Gamepad2, Sparkles, Trophy } from 'lucide-react';

export function FeaturesDashboard() {
  const [activeTab, setActiveTab] = useState('vimana');

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="vimana" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Explore</span>
          </TabsTrigger>
          <TabsTrigger value="battle" className="flex items-center gap-2">
            <Swords className="w-4 h-4" />
            <span className="hidden sm:inline">Battle</span>
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline">Games</span>
          </TabsTrigger>
          <TabsTrigger value="cosmetics" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Style</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Rewards</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vimana" className="mt-0">
          <div className="bg-zinc-900/80 backdrop-blur rounded-xl p-6 border border-zinc-800">
            <VimanaMap />
          </div>
        </TabsContent>

        <TabsContent value="battle" className="mt-0">
          <div className="bg-zinc-900/80 backdrop-blur rounded-xl p-6 border border-zinc-800">
            <BattleArena />
          </div>
        </TabsContent>

        <TabsContent value="games" className="mt-0">
          <div className="bg-zinc-900/80 backdrop-blur rounded-xl p-6 border border-zinc-800">
            <div className="space-y-6">
              <MiniGamesPanel />
              
              <div className="border-t border-zinc-700 pt-6">
                <PatternRecognitionGame />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cosmetics" className="mt-0">
          <div className="bg-zinc-900/80 backdrop-blur rounded-xl p-6 border border-zinc-800">
            <CosmeticsPanel />
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-0">
          <div className="bg-zinc-900/80 backdrop-blur rounded-xl p-6 border border-zinc-800">
            <AchievementsPanel />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
