# Yantra & Genetics Systems

Extracted from Soundarya Lahari Consciousness Laboratory and integrated into the Jewble Meta-Pet engine.

## Overview

This module provides mathematical analysis and genetic breeding systems based on:
- **Prime Yantra Theory**: Base-60 mathematical analysis with golden ratio resonance
- **Genetic Breeding**: Mendelian inheritance with mutation mechanics
- **Phenotype Generation**: Visual attributes derived from genetic traits
- **Base Conversion**: Multi-base number system utilities (2-62)

## Modules

### 1. Yantra Analysis (`@metapet/core/yantra`)

Analyzes numbers using sacred geometry principles and mathematical properties.

```typescript
import { analyzeVerse, calculateRarity, getVerseColor } from '@metapet/core/yantra';

// Analyze a number
const analysis = analyzeVerse(41);
console.log(analysis);
// {
//   mod60: 41,
//   wheel: 0,
//   isPrime: true,
//   trianglePhase: 5,
//   concurrency: "1.000",
//   phiResonance: "85.4",
//   redSequence: "W0:P41",
//   geometricTension: "⬡ Prime-favorable",
//   yantraCircuit: "Triangle 5"
// }

// Calculate rarity based on properties
const rarity = calculateRarity(analysis, 41);
console.log(rarity); // "Mythic"

// Get color for visualization
const color = getVerseColor(41);
console.log(color); // "hsl(246, 85%, 65%)"
```

**Key Features:**
- **Base-60 Analysis**: Modulo 60 positioning and wheel tracking
- **Prime Detection**: Identifies prime numbers within mod-60 space
- **Φ (Phi) Resonance**: Golden ratio harmonic analysis
- **Sri Yantra Mapping**: 9-triangle phase concurrency
- **Rarity Tiers**: Common, Rare, Epic, Legendary, Mythic

**Rarity Calculation:**
- **Mythic**: Sacred numbers (1, 41, 100, 108)
- **Legendary**: Prime + High Concurrency (>0.7)
- **Epic**: High Concurrency (>0.7)
- **Rare**: Prime numbers
- **Common**: All others

### 2. Base Conversion (`@metapet/core/yantra/baseConversion`)

Convert numbers between any base system (2-62).

```typescript
import { toBase, fromBase, toSexagesimal, BASE_SYSTEMS } from '@metapet/core/yantra/baseConversion';

// Convert to different bases
toBase(103, BASE_SYSTEMS.BINARY);        // "1100111"
toBase(103, BASE_SYSTEMS.HEXADECIMAL);   // "67"
toBase(103, BASE_SYSTEMS.SEXAGESIMAL);   // "1H"

// Convert from base to decimal
fromBase('1H', BASE_SYSTEMS.SEXAGESIMAL); // 103

// Sexagesimal helpers
toSexagesimal(103);   // "1H"
fromSexagesimal('1H'); // 103
```

**Supported Bases:**
- Binary (2)
- Octal (8)
- Decimal (10)
- Dozenal (12)
- Hexadecimal (16)
- Sexagesimal (60)
- Any base 2-62

### 3. Genetic Breeding (`@metapet/core/genetics`)

Complete genetic system with Mendelian inheritance and mutations.

```typescript
import {
  getGeneticTrait,
  generateGenome,
  breedGenomes,
  mutateGene,
  evolveGenome,
} from '@metapet/core/genetics';

// Generate a gene from a verse number
const gene = getGeneticTrait(41);
console.log(gene);
// {
//   id: "GENE_41",
//   verse: 41,
//   category: "Power",
//   rarity: "Mythic",
//   strength: 85,
//   dominance: "Dominant",  // Prime = Dominant
//   resonance: "85.4"
// }

// Create a genome from verse numbers
const genome = generateGenome([1, 2, 3, 11, 23, 41, 59, 89, 103]);
console.log(genome.phenotype);
// {
//   appearance: "Radiant",
//   consciousness: 10,
//   energy: 20,
//   wisdom: 10,
//   power: 10,
//   avgStrength: 78,
//   uniqueness: 88.9
// }

// Breed two genomes
const parent1 = generateGenome([1, 2, 3, 4, 5, 6, 7, 8, 9]);
const parent2 = generateGenome([10, 11, 12, 13, 14, 15, 16, 17, 18]);

const offspring = breedGenomes(
  parent1,
  parent2,
  'Dragon',
  'Phoenix',
  9,          // gene count
  0.1         // 10% mutation rate
);

// Check inheritance
offspring.inheritance?.forEach(info => {
  console.log(`Verse ${info.verse} from ${info.source}${info.mutated ? ' (MUTATED)' : ''}`);
});
```

**Gene Categories (9):**
1. Consciousness
2. Energy
3. Wisdom
4. Beauty
5. Power
6. Protection
7. Transformation
8. Unity
9. Transcendence

**Breeding Mechanics:**
- **Dominant Genes**: 75% expression rate over recessive
- **Equal Dominance**: 50/50 split
- **Mutation**: RED-60 sequence shifting (default 10% chance)
- **Inheritance Tracking**: Records parent source and mutations

**Mutation System (RED-60):**
```typescript
// Mutate a gene using RED-60 palindromic wheel
const original = 41;
const mutated = mutateGene(original, 1); // strength = 1
// Returns a verse with mod60 = (41 + 13) % 60 = 54
```

**Evolution System:**
```typescript
// Evolve genome toward higher concurrency
const evolved = evolveGenome(genome, 103);
// Genes with concurrency < 0.8 may evolve to higher concurrency verses
```

### 4. Phenotype Visualization (`@metapet/core/genetics`)

Generate visual attributes from genetic phenotype.

```typescript
import { generatePetVisual, getAttributeColor, getDominantAttribute } from '@metapet/core/genetics';

const genome = generateGenome([1, 2, 3, 4, 5, 6, 7, 8, 9]);

// Generate visual representation
const visual = generatePetVisual(genome.phenotype);
console.log(visual);
// {
//   bodyType: "ethereal",      // angular | ethereal | balanced
//   primaryColor: "#818cf8",   // Based on dominant attribute
//   size: 92,                  // 60 + (strength * 0.8)
//   auraIntensity: 0.89,       // uniqueness / 100
//   appearance: "Radiant"
// }

// Get attribute color
const color = getAttributeColor('consciousness'); // "#818cf8"

// Find dominant attribute
const dominant = getDominantAttribute(genome.phenotype); // "consciousness"
```

**Body Types:**
- **Angular**: Power > 50
- **Ethereal**: Consciousness > 50
- **Balanced**: Default

**Attribute Colors:**
- Consciousness: Indigo (#818cf8)
- Energy: Pink (#f472b6)
- Wisdom: Blue (#60a5fa)
- Beauty: Purple (#a78bfa)
- Power: Amber (#f59e0b)
- Protection: Emerald (#34d399)
- Transformation: Violet (#c084fc)
- Unity: Yellow (#fbbf24)

## Integration Examples

### Creating a Verse-Based Pet

```typescript
import { analyzeVerse, calculateRarity } from '@metapet/core/yantra';
import { generateGenome, generatePetVisual } from '@metapet/core/genetics';

// Pick verses based on yantra analysis
const verses = [1, 11, 23, 41, 59, 71, 83, 89, 103];

// Analyze each verse
verses.forEach(v => {
  const analysis = analyzeVerse(v);
  const rarity = calculateRarity(analysis, v);
  console.log(`Verse ${v}: ${rarity} (Φ: ${analysis.phiResonance}%)`);
});

// Generate pet genome
const genome = generateGenome(verses);

// Create visual
const visual = generatePetVisual(genome.phenotype);

console.log('Pet Created:', {
  rarity: 'Legendary',
  genes: genome.geneCount,
  bodyType: visual.bodyType,
  color: visual.primaryColor,
  size: visual.size,
  power: genome.phenotype.power,
  consciousness: genome.phenotype.consciousness,
});
```

### Breeding System

```typescript
import { generateGenome, breedGenomes, generatePetVisual } from '@metapet/core/genetics';

// Create parent genomes
const mother = generateGenome([1, 2, 3, 5, 7, 11, 13, 17, 19]);  // Prime-heavy
const father = generateGenome([4, 6, 8, 9, 10, 12, 14, 15, 16]); // Composite-heavy

// Breed with 15% mutation rate
const child = breedGenomes(mother, father, 'Primus', 'Secundus', 9, 0.15);

console.log('Breeding Results:');
console.log('Mutations:', child.inheritance?.filter(i => i.mutated).length);
console.log('From Primus:', child.inheritance?.filter(i => i.source === 'Primus').length);
console.log('From Secundus:', child.inheritance?.filter(i => i.source === 'Secundus').length);
console.log('Phenotype:', child.phenotype);
```

## Mathematical Foundations

### Base-60 (Sexagesimal) System
- Used in ancient Babylonian mathematics
- Foundation for time (60 seconds, 60 minutes)
- Ideal for astronomical/astrological calculations
- 60 = 2² × 3 × 5 (highly composite)

### Prime Yantra
- Primes in mod-60 space: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]
- Creates geometric patterns when mapped to circular/yantra diagrams
- Hexagonal tensions at mod-60 = 30
- Pentagonal tensions at mod-60 = 12, 24, 36, 48

### Sri Yantra Concurrency
- 9 interlocking triangles: 4 upward (Shiva), 5 downward (Shakti)
- Central point (Bindu) at triangle phase 5
- Concurrency = 1 - |phase - 5| / 9
- Perfect concurrency (1.0) at center

### Golden Ratio (Φ) Resonance
- Φ = 1.618033988749895
- Resonance = |sin(n / Φ × π)| × 100
- Higher resonance indicates harmonic alignment
- Used for strength calculations

## Testing

Run tests with:

```bash
npm test yantra
npm test genetics
```

## License

Part of the Jewble Meta-Pet Core Engine.
Blue Snake Studios • Consciousness Laboratory Series
