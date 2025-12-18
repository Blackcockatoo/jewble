"use client";

import React, { useMemo } from 'react';
import { GuardianSigilCanvas, generateSigilPoints } from '../../../shared/auralia/guardianBehavior';

const AuraliaSprite: React.FC = () => {
  // small deterministic seed for a compact sprite
  const seed = 12345;
  const sigilPoints = useMemo(() => generateSigilPoints(seed, 7, 200, 200), [seed]);

  return (
    <div className="w-full h-48 flex items-center justify-center p-2">
      <div className="w-40 h-40 rounded-md bg-slate-900/30 border border-slate-800 flex items-center justify-center">
        {/* Shared canvas component expects normalized points; pass a small focused view */}
        <GuardianSigilCanvas sigilPoints={sigilPoints} aiState={undefined} />
      </div>
    </div>
  );
};

export default AuraliaSprite;
