# Jewble Monorepo

This repository contains the Meta-Pet experience across mobile (Expo), Next.js web, and a Vite shell powered by a shared core gameplay engine.

## Packages

- `packages/core` – Platform-agnostic vitals, evolution, genome utilities, crypto adapter interfaces, RNG, and Zustand store.

### Element math for Jewble genomes

The genome module exposes element-centric metrics derived from atomic residues on the base-60 circle. `decodeGenome` now returns an
`elements` block containing:

- `bridgeScore` – counts residues that host both lower and upper shell elements.
- `frontierWeight` – counts digits that land on frontier elements (defaults to selecting the frontier side when present).
- `chargeVector` – sums the 2/3/5 exponents carried by the chosen elements.
- `heptaSignature` – aggregated base-7 triples across the digits (both raw totals and mod 7).
- `elementWave` – complex wave built from residue angles, layer offsets, and factorization weights.

Example:

```ts
import { decodeGenome, genomeBridgeScore, frontierWeight, elementWave } from '@metapet/core/genome';

const traits = decodeGenome(genome);
console.log(traits.elements.chargeVector); // { c2, c3, c5 }

// Lower-level helpers for custom flows
const bridge = genomeBridgeScore(genome);
const frontier = frontierWeight([...genome.red60, ...genome.blue60], {
  selectionMode: 'frontier-preferred',
});
const wave = elementWave(genome.black60, { lambda: 0.25 });
```

Configuration knobs:

- `selectionMode`: `'low' | 'high' | 'frontier-preferred'` to pick which element on a residue to use.
- `frontierSelector`: `(z: number) => boolean` that marks which atomic numbers count as frontier (defaults to `z >= 93`).
- `lambda`: coupling constant applied to the average residue layer when computing element waves.
- `table`: custom residue tables if you want to experiment beyond Z ≤ 118.

## Apps

- `meta-pet` – Next.js dashboard consuming the shared core with a web-specific crypto adapter (`meta-pet/src/lib/genome/webCrypto.ts`).
- `meta-pet-mobile` – Expo app wired through light re-export shims to the shared store with persistence merging defaults.
- `apps/web-vite` – Vite + Netlify shell rendering vitals via the shared store.

## Development

Install dependencies and build packages using the workspace root.

```bash
npm install
```

### Run Next.js web app

```bash
cd meta-pet
npm run dev
```

### Run Vite shell

```bash
cd apps/web-vite
npm run dev
```

### Run Expo mobile app

```bash
cd meta-pet-mobile
npm run start
```

### Tests

Run the Vitest suite for the Next.js app:

```bash
cd meta-pet
npx vitest run
```

Manual smoke checks are recommended for the Expo and Vite applications, especially for persistence behavior.
