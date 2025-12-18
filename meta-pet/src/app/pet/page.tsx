'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { HUD } from '@/components/HUD';
import AuraliaMetaPet from '@/components/AuraliaMetaPet';
import { Button } from '@/components/ui/button';
import { PetResponseOverlay } from '@/components/PetResponseOverlay';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PetPage() {
  const startTick = useStore(s => s.startTick);
  const stopTick = useStore(s => s.stopTick);

  useEffect(() => {
    startTick();
    return () => stopTick();
  }, [startTick, stopTick]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      {/* Real-time Response Overlay */}
      <PetResponseOverlay enableAudio={true} enableAnticipation={true} />

      {/* Back button */}
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-slate-700 bg-slate-900/80 text-zinc-300 hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-2xl">
        {/* Main Pet Window */}
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Pet Display Area */}
          <div className="aspect-square bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 relative">
            <AuraliaMetaPet />
          </div>

          {/* Controls Bar */}
          <div className="p-6 bg-slate-900/90 border-t border-slate-700/50">
            <HUD />
          </div>
        </div>
      </div>
    </div>
  );
}
