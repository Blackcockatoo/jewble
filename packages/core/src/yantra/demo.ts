/**
 * Demo: Yantra & Genetics System
 *
 * Run with: npx tsx packages/core/src/yantra/demo.ts
 */

import { analyzeVerse, calculateRarity, getVerseColor } from './index';
import { toBase, toSexagesimal, BASE_SYSTEMS } from './baseConversion';
import { generateGenome, breedGenomes, evolveGenome, generatePetVisual } from '../genetics';

console.log('🕉️ Yantra & Genetics System Demo\n');

// 1. Analyze sacred verses
console.log('1️⃣ YANTRA ANALYSIS\n');

const sacredVerses = [1, 11, 41, 59, 103];

sacredVerses.forEach(v => {
  const analysis = analyzeVerse(v);
  const rarity = calculateRarity(analysis, v);
  const color = getVerseColor(v);

  console.log(`Verse ${v}:`);
  console.log(`  Rarity: ${rarity}`);
  console.log(`  Triangle Phase: ${analysis.trianglePhase}/9`);
  console.log(`  Concurrency: ${analysis.concurrency}`);
  console.log(`  Φ Resonance: ${analysis.phiResonance}%`);
  console.log(`  Color: ${color}`);
  console.log(`  ${analysis.geometricTension}\n`);
});

// 2. Base conversion
console.log('2️⃣ BASE CONVERSION\n');

const verse = 103;
console.log(`Verse ${verse}:`);
console.log(`  Binary: ${toBase(verse, BASE_SYSTEMS.BINARY)}`);
console.log(`  Octal: ${toBase(verse, BASE_SYSTEMS.OCTAL)}`);
console.log(`  Hexadecimal: ${toBase(verse, BASE_SYSTEMS.HEXADECIMAL)}`);
console.log(`  Sexagesimal: ${toSexagesimal(verse)}\n`);

// 3. Generate genomes
console.log('3️⃣ GENOME GENERATION\n');

// Prime-heavy genome
const primeGenome = generateGenome([2, 3, 5, 7, 11, 13, 17, 19, 23]);
console.log('Prime Genome:');
console.log(`  Appearance: ${primeGenome.phenotype.appearance}`);
console.log(`  Consciousness: ${primeGenome.phenotype.consciousness}`);
console.log(`  Power: ${primeGenome.phenotype.power}`);
console.log(`  Avg Strength: ${primeGenome.phenotype.avgStrength}`);
console.log(`  Uniqueness: ${primeGenome.phenotype.uniqueness.toFixed(1)}%\n`);

// Composite-heavy genome
const compositeGenome = generateGenome([4, 6, 8, 9, 10, 12, 14, 15, 16]);
console.log('Composite Genome:');
console.log(`  Appearance: ${compositeGenome.phenotype.appearance}`);
console.log(`  Energy: ${compositeGenome.phenotype.energy}`);
console.log(`  Wisdom: ${compositeGenome.phenotype.wisdom}`);
console.log(`  Avg Strength: ${compositeGenome.phenotype.avgStrength}`);
console.log(`  Uniqueness: ${compositeGenome.phenotype.uniqueness.toFixed(1)}%\n`);

// 4. Breeding
console.log('4️⃣ BREEDING SYSTEM\n');

const offspring = breedGenomes(
  primeGenome,
  compositeGenome,
  'Primus (Prime)',
  'Secundus (Composite)',
  9,
  0.15 // 15% mutation rate
);

console.log('Offspring Genome:');
console.log(`  Genes: ${offspring.genes.length}`);
console.log(`  Appearance: ${offspring.phenotype.appearance}`);
console.log(`  Avg Strength: ${offspring.phenotype.avgStrength}`);

const mutations = offspring.inheritance?.filter(i => i.mutated).length || 0;
const fromPrimus = offspring.inheritance?.filter(i => i.source === 'Primus (Prime)').length || 0;
const fromSecundus = offspring.inheritance?.filter(i => i.source === 'Secundus (Composite)').length || 0;

console.log(`\nInheritance:`);
console.log(`  From Primus: ${fromPrimus}`);
console.log(`  From Secundus: ${fromSecundus}`);
console.log(`  Mutations: ${mutations}`);

if (offspring.inheritance) {
  console.log(`\nDetailed Inheritance:`);
  offspring.inheritance.forEach((info, i) => {
    const gene = offspring.genes[i];
    console.log(
      `  Gene ${i + 1}: V${info.verse} (${gene.category}) from ${info.source}${
        info.mutated ? ' 🧬 MUTATED' : ''
      }`
    );
  });
}

// 5. Visual phenotype
console.log('\n5️⃣ VISUAL PHENOTYPE\n');

const visual = generatePetVisual(offspring.phenotype);
console.log('Visual Attributes:');
console.log(`  Body Type: ${visual.bodyType}`);
console.log(`  Primary Color: ${visual.primaryColor}`);
console.log(`  Size: ${visual.size.toFixed(1)}`);
console.log(`  Aura Intensity: ${(visual.auraIntensity * 100).toFixed(1)}%`);

// 6. Evolution
console.log('\n6️⃣ EVOLUTION\n');

const evolved = evolveGenome(offspring, 103);
console.log('Evolved Genome:');
console.log(`  Appearance: ${evolved.phenotype.appearance}`);
console.log(`  Avg Strength: ${evolved.phenotype.avgStrength}`);
console.log(`  Uniqueness: ${evolved.phenotype.uniqueness.toFixed(1)}%`);

console.log('\n✨ Demo Complete!\n');
