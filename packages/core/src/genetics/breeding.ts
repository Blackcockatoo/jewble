/**
 * Genetic Breeding System
 * Mendelian inheritance with mutations
 */

import { analyzeVerse } from '../yantra';

export interface Gene {
  id: string;
  verse: number;
  category: string;
  rarity: string;
  strength: number;
  circuit: string;
  expression: string;
  dominance: 'Dominant' | 'Recessive';
  resonance: string;
}

export interface Genome {
  genes: Gene[];
  phenotype: Phenotype;
  geneCount: number;
  inheritance?: InheritanceInfo[];
}

export interface Phenotype {
  appearance: 'Radiant' | 'Subtle';
  consciousness: number;
  energy: number;
  wisdom: number;
  beauty: number;
  power: number;
  protection: number;
  transformation: number;
  unity: number;
  avgStrength: number;
  uniqueness: number;
}

export interface InheritanceInfo {
  verse: number;
  source: string;
  mutated: boolean;
}

const GENE_CATEGORIES = [
  'Consciousness',
  'Energy',
  'Wisdom',
  'Beauty',
  'Power',
  'Protection',
  'Transformation',
  'Unity',
  'Transcendence',
];

/**
 * Generate a genetic trait from a verse number
 */
export function getGeneticTrait(
  verseNum: number,
  circuit: string = 'Unknown'
): Gene {
  const category = GENE_CATEGORIES[(verseNum - 1) % 9];
  const analysis = analyzeVerse(verseNum);

  // Trait rarity based on mathematical properties
  let rarity = 'Common';
  const concurrency = parseFloat(analysis.concurrency);

  if (analysis.isPrime) rarity = 'Rare';
  if (concurrency > 0.7) rarity = 'Epic';
  if (analysis.isPrime && concurrency > 0.7) rarity = 'Legendary';
  if (verseNum === 1 || verseNum === 41 || verseNum === 100) rarity = 'Mythic';

  // Gene expression strength based on Φ resonance
  const strength = Math.round(parseFloat(analysis.phiResonance));

  return {
    id: `GENE_${verseNum}`,
    verse: verseNum,
    category,
    rarity,
    strength,
    circuit,
    expression: `${category}_${analysis.mod60}`,
    dominance: analysis.isPrime ? 'Dominant' : 'Recessive',
    resonance: analysis.phiResonance,
  };
}

/**
 * Generate phenotype from genes
 */
export function generatePhenotype(genes: Gene[]): Phenotype {
  if (genes.length === 0) {
    return {
      appearance: 'Subtle',
      consciousness: 0,
      energy: 0,
      wisdom: 0,
      beauty: 0,
      power: 0,
      protection: 0,
      transformation: 0,
      unity: 0,
      avgStrength: 0,
      uniqueness: 0,
    };
  }

  const avgStrength = genes.reduce((sum, g) => sum + g.strength, 0) / genes.length;
  const dominantCount = genes.filter(g => g.dominance === 'Dominant').length;
  const recessiveCount = genes.filter(g => g.dominance === 'Recessive').length;

  // Calculate attribute scores based on gene categories
  const categoryScores: Record<string, number> = {};
  GENE_CATEGORIES.forEach(cat => {
    categoryScores[cat.toLowerCase()] = genes.filter(g => g.category === cat).length * 10;
  });

  return {
    appearance: dominantCount > recessiveCount ? 'Radiant' : 'Subtle',
    consciousness: categoryScores.consciousness || 0,
    energy: categoryScores.energy || 0,
    wisdom: categoryScores.wisdom || 0,
    beauty: categoryScores.beauty || 0,
    power: categoryScores.power || 0,
    protection: categoryScores.protection || 0,
    transformation: categoryScores.transformation || 0,
    unity: categoryScores.unity || 0,
    avgStrength: Math.round(avgStrength),
    uniqueness: (new Set(genes.map(g => g.category)).size / GENE_CATEGORIES.length) * 100,
  };
}

/**
 * Generate complete genome from gene verses
 */
export function generateGenome(geneVerses: number[], circuits?: string[]): Genome {
  const genes = geneVerses.map((v, i) =>
    getGeneticTrait(v, circuits?.[i] || 'Unknown')
  );
  const phenotype = generatePhenotype(genes);

  return {
    genes,
    phenotype,
    geneCount: genes.length,
  };
}

/**
 * RED sequence mutation system
 * Mutates a gene based on RED-60 palindromic wheel
 */
export function mutateGene(
  verseNum: number,
  mutationStrength: number = 1,
  maxVerse: number = 103
): number {
  const analysis = analyzeVerse(verseNum);
  const mod60 = analysis.mod60;

  // Calculate mutation based on RED-60 sequence
  // 13 is prime offset for mutation jumps
  const redShift = (mod60 + mutationStrength * 13) % 60;

  // Find verses with matching mod60
  const possibleMutations: number[] = [];
  for (let i = 1; i <= maxVerse; i++) {
    const testAnalysis = analyzeVerse(i);
    if (testAnalysis.mod60 === redShift) {
      possibleMutations.push(i);
    }
  }

  if (possibleMutations.length > 0) {
    return possibleMutations[Math.floor(Math.random() * possibleMutations.length)];
  }

  return verseNum;
}

/**
 * Breed two genomes with Mendelian inheritance
 */
export function breedGenomes(
  parent1: Genome,
  parent2: Genome,
  parent1Name: string = 'Parent 1',
  parent2Name: string = 'Parent 2',
  geneCount: number = 9,
  mutationRate: number = 0.1
): Genome {
  const offspring: number[] = [];
  const inheritance: InheritanceInfo[] = [];

  for (let i = 0; i < geneCount; i++) {
    const gene1 = parent1.genes[i % parent1.genes.length];
    const gene2 = parent2.genes[i % parent2.genes.length];

    // Mendelian inheritance
    let selectedGene: Gene;
    let sourceName: string;

    if (gene1.dominance === 'Dominant' && gene2.dominance === 'Recessive') {
      // 75% dominant expression
      if (Math.random() > 0.25) {
        selectedGene = gene1;
        sourceName = parent1Name;
      } else {
        selectedGene = gene2;
        sourceName = parent2Name;
      }
    } else if (gene2.dominance === 'Dominant' && gene1.dominance === 'Recessive') {
      // 75% dominant expression
      if (Math.random() > 0.25) {
        selectedGene = gene2;
        sourceName = parent2Name;
      } else {
        selectedGene = gene1;
        sourceName = parent1Name;
      }
    } else {
      // 50/50 split for equal dominance
      if (Math.random() > 0.5) {
        selectedGene = gene1;
        sourceName = parent1Name;
      } else {
        selectedGene = gene2;
        sourceName = parent2Name;
      }
    }

    let finalVerse = selectedGene.verse;
    let mutated = false;

    // Mutation chance
    if (Math.random() < mutationRate) {
      finalVerse = mutateGene(selectedGene.verse, 1);
      mutated = true;
    }

    offspring.push(finalVerse);
    inheritance.push({ verse: finalVerse, source: sourceName, mutated });
  }

  const genome = generateGenome(offspring);
  genome.inheritance = inheritance;

  return genome;
}

/**
 * Evolution system - genes evolve toward higher concurrency
 */
export function evolveGenome(genome: Genome, maxVerse: number = 103): Genome {
  const evolvedGenes = genome.genes.map(gene => {
    const currentAnalysis = analyzeVerse(gene.verse);
    const currentConcurrency = parseFloat(currentAnalysis.concurrency);

    // Try to find better verse with higher concurrency
    if (currentConcurrency < 0.8 && Math.random() > 0.5) {
      const betterVerses: number[] = [];

      for (let v = 1; v <= maxVerse; v++) {
        const analysis = analyzeVerse(v);
        const concurrency = parseFloat(analysis.concurrency);

        if (
          concurrency > currentConcurrency &&
          Math.abs(analysis.mod60 - currentAnalysis.mod60) < 10
        ) {
          betterVerses.push(v);
        }
      }

      if (betterVerses.length > 0) {
        return betterVerses[0];
      }
    }

    return gene.verse;
  });

  return generateGenome(evolvedGenes);
}
