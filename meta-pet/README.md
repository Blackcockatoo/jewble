# Meta-Pet Starter 🧬

**Working Demo:** Identity Core + Genome System + Live Vitals (v5)

---

## What's Running Now

✅ **Prime-Tail Crest System**
- Mints unique crest with vault/rotation/tail
- SHA-256 DNA + mirror hashes
- HMAC signature for tamper-evidence
- DNA stays **100% private** (only hashes visible)

✅ **Genome Core** (Red60/Blue60/Black60)
- Deterministic trait derivation from DNA hashes
- **Red60**: Physical traits (body, colors, patterns, features)
- **Blue60**: Personality traits (temperament, stats, quirks)
- **Black60**: Latent traits (evolution paths, rare abilities)
- Privacy-first: only genome hashes stored, never raw genome

✅ **Visual Pet Sprite**
- SVG-based rendering driven by genome traits
- Reflects body type, colors, patterns, and special features
- Animated behaviors based on vitals (happy, tired, hungry)
- Features: Horns, Wings, Tail Flame, Aura, Third Eye, Crown

✅ **HeptaCode v1** (Base-7 Identity)
- Encodes payload → MAC → base-7 → ECC
- Target: 42 digits (6×7 blocks with error correction)
- Renders as HeptaTag (7-sided) + Seed of Life (7 circles)
- Syncs to audio tone (playable crest chime)

✅ **Live Vitals System**
- Real-time tick loop (1000ms)
- Hunger/Hygiene/Mood/Energy
- Background-pause (battery-safe)
- Zustand state management

✅ **Evolution Guidance**
- Stage-specific lore and celebration copy per phase
- Requirement breakdown with age, interaction, and vitals progress

✅ **Offline-First**
- No network required
- IndexedDB persistence with autosave cadence
- PWA-ready architecture

✅ **Archive Manager**
- Multi-pet switching with rename, export, and import controls
- Autosave indicator with graceful fallback when persistence is unavailable

---

## File Structure

```
meta-pet/
├── src/
│   ├── lib/
│   │   ├── identity/
│   │   │   ├── types.ts          # Core types
│   │   │   ├── crest.ts          # PrimeTailId minting
│   │   │   └── hepta/
│   │   │       ├── codec.ts      # Payload → base-7
│   │   │       ├── ecc.ts        # 6×7 error correction
│   │   │       ├── audio.ts      # HeptaCode → crest chime playback
│   │   │       └── index.ts      # heptaEncode42/Decode42
│   │   ├── genome/
│   │   │   ├── types.ts          # Genome + trait types
│   │   │   ├── encoder.ts        # Red60/Blue60/Black60 encoding
│   │   │   ├── decoder.ts        # Trait derivation logic
│   │   │   └── index.ts          # Public API
│   │   └── store/
│   │       └── index.ts          # Zustand (vitals + genome + tick)
│   ├── components/
│   │   ├── HUD.tsx               # Vitals + actions
│   │   ├── TraitPanel.tsx        # Genome trait display
│   │   ├── PetSprite.tsx         # Visual pet (SVG + genome-driven)
│   │   ├── HeptaTag.tsx          # 7-sided visual
│   │   └── SeedOfLifeGlyph.tsx   # Sacred geometry
│   └── app/
│       └── page.tsx              # Main demo
```

---

## Run It

```bash
cd meta-pet
bun install
bun dev
```

Visit `http://localhost:3000`

---

## What Works

### 1. Identity (Crest)
```ts
import { mintPrimeTailId, getDeviceHmacKey } from '@/lib/identity/crest';

const hmacKey = await getDeviceHmacKey();
const crest = await mintPrimeTailId({
  dna: 'ATGCCG...', // Your genome
  vault: 'blue',
  rotation: 'CW',
  tail: [12, 37, 5, 59],
  hmacKey
});

// crest.dnaHash = SHA-256 of DNA (visible)
// crest.mirrorHash = SHA-256 of reverse DNA
// crest.signature = HMAC(hashes + tail + vault + rotation)
// DNA itself NEVER leaves device!
```

### 2. HeptaCode (Base-7 Encoding)
```ts
import { heptaEncode42, playHepta } from '@/lib/identity/hepta';

const payload = {
  version: 1,
  preset: 'standard',
  vault: 'blue',
  rotation: 'CW',
  tail: [12, 37, 5, 59],
  epoch13: Math.floor(Date.now() / 60000) % 8192,
  nonce14: Math.floor(Math.random() * 16384)
};

const digits42 = await heptaEncode42(payload, hmacKey);
// Returns: readonly number[] (42 digits, base-7)

// Play the crest chime in the browser
await playHepta(digits42);
```

### 3. Genome System
```ts
import { encodeGenome, decodeGenome, hashGenome } from '@/lib/genome';

// Generate genome from DNA hashes
const genome = await encodeGenome(primeDNA, tailDNA);
// Returns: { red60, blue60, black60 } - 3 × 60-digit base-7 arrays

// Derive all traits deterministically
const traits = decodeGenome(genome);
// Returns: { physical, personality, latent }

// Physical traits: body type, colors, pattern, texture, size, features
console.log(traits.physical.bodyType); // 'Spherical'
console.log(traits.physical.primaryColor); // '#4ECDC4'
console.log(traits.physical.features); // ['Horns', 'Tail Flame']

// Personality traits: temperament, energy, social, curiosity, etc.
console.log(traits.personality.temperament); // 'Gentle'
console.log(traits.personality.energy); // 70 (0-100)

// Latent traits: evolution path, rare abilities, potential
console.log(traits.latent.evolutionPath); // 'Chaos Trickster'
console.log(traits.latent.rareAbilities); // ['Telepathy', ...]

// For privacy: only store genome hashes
const hashes = await hashGenome(genome);
// Returns: { redHash, blueHash, blackHash } - SHA-256 hashes
```

### 4. Live Vitals
```ts
import { useStore } from '@/lib/store';

const vitals = useStore(s => s.vitals);
const feed = useStore(s => s.feed);
const startTick = useStore(s => s.startTick);

useEffect(() => {
  startTick(); // Begins real-time decay
}, []);

<button onClick={feed}>Feed</button>
```

---

## Next Steps (From Master Build Prompt)

### Phase 1: Complete Identity Layer
- [x] Prime-Tail crest minting
- [x] HeptaCode v1 (pack + MAC + base-7)
- [x] **Genome Core (Red60/Blue60/Black60)**
- [x] **Deterministic trait derivation**
- [x] **Visual pet sprite (genome-driven)**
- [x] Fix ECC to output exactly 42 digits
- [x] Add audio chime (playHepta)
- [ ] Privacy presets (Stealth/Standard/Radiant)
- [ ] Consent grants (pairwise, time-boxed)

### Phase 2: Game Loop
- [x] Vitals tick (real-time)
- [x] 4-state machine (genetics → neuro → quantum → speciation)
- [x] Evolution gates + transitions
- [ ] Sealed export/import
- [ ] Breeding system (genome inheritance)

### Phase 3: Vimana Integration
- [ ] Grid map component
- [ ] Field scanning
- [ ] Anomaly detection
- [ ] Sample collection

### Phase 4: Endgame Features
- [ ] Battle system (consciousness-based)
- [ ] Breeding (standard + recursive)
- [ ] Mini-games (pattern recognition, meditation)
- [ ] Cosmetics + achievements

---

## Design Principles (B$S)

1. **DNA stays private** – Only hashes + tail are ever shared
2. **One source, multi-modal** – 42 digits render as color + geometry + tone
3. **Offline-first** – Full gameplay without network
4. **Deterministic** – Same genome always produces same traits
5. **Kid-safe** – Parental mode, no ads, calm UX

---

## Tech Stack

- **Next.js 15** + Turbopack
- **TypeScript** (ES2020 for BigInt)
- **Zustand** (state)
- **Tailwind** + shadcn/ui
- **Framer Motion** (animations)
- **Crypto API** (HMAC, SHA-256)

---

## Current Status

**Version 5** ✅
- Identity core: **WORKING**
- Genome system: **WORKING** (Red60/Blue60/Black60 encoding + trait derivation)
- Visual pet sprite: **WORKING** (genome-driven SVG rendering)
- Vitals loop: **WORKING**
- HeptaCode: **PARTIAL** (needs ECC fix)
- Visual components: **WORKING**

**Known Issues:**
- HeptaCode ECC needs to output 42 digits (currently variable)
- Need to test decode path
- Audio (playHepta) not implemented yet

**Recent Additions (v4-v5):**
- ✨ Complete genome encoding system (deterministic from DNA hashes)
- 🎨 Visual pet sprite that reflects genome traits
- 📊 TraitPanel component showing all derived traits
- 🎭 Animated behaviors based on vitals

---

## Master Build Prompt

Full spec: `docs/master-build-prompt.pdf` (attached by user)

**TL;DR:**
- Offline-first Meta-Pet (Tamagotchy × Vimana)
- Prime-Tail Crest + HeptaCode v1 for identity
- 4-state evolution (genetics → neuro → quantum → speciation)
- Privacy-first (DNA never shared, time-boxed consent)
- Success: D1 ≥ 45%, crash-free ≥ 99.5%, cold-start ≤ 2s

---

## License

TBD (likely MIT for core, CC for assets)

---

**Built with Same.new** | [Docs](https://docs.same.new) | [Support](mailto:support@same.new)
