import { getResidue, getResidueMeta } from './elements';
import type { Genome, ElementResidue, ElementWebSummary } from './types';

export const ELEMENT_RESIDUES: ElementResidue[] = Array.from(
  { length: 60 },
  (_, residue) => getResidueMeta(residue)
);

export function summarizeElementWeb(genome: Genome): ElementWebSummary {
  const usedResidues = new Set<number>();
  const voidSlotsHit = new Set<number>();

  const sequences = [genome.red60, genome.black60, genome.blue60];
  sequences.forEach(sequence => {
    sequence.forEach(value => {
      const residue = getResidue(value);
      usedResidues.add(residue);
      const meta = getResidueMeta(residue);
      if (meta.isVoid) {
        voidSlotsHit.add(residue);
      }
    });
  });

  const pairSlots: number[] = [];
  const frontierSlots: number[] = [];

  usedResidues.forEach(residue => {
    const meta = getResidueMeta(residue);
    if (meta.hasBridge60) {
      pairSlots.push(residue);
    }
    if (meta.hasFrontier) {
      frontierSlots.push(residue);
    }
  });

  const usedResidueList = Array.from(usedResidues).sort((a, b) => a - b);
  const voidSlotsList = Array.from(voidSlotsHit).sort((a, b) => a - b);
  pairSlots.sort((a, b) => a - b);
  frontierSlots.sort((a, b) => a - b);

  return {
    usedResidues: usedResidueList,
    pairSlots,
    frontierSlots,
    voidSlotsHit: voidSlotsList,
    coverage: usedResidues.size / 60,
    frontierAffinity: frontierSlots.length,
    bridgeCount: pairSlots.length,
    voidDrift: voidSlotsHit.size,
  };
}
