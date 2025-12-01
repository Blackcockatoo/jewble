/**
 * Visual Phenotype Generation
 * Generate visual attributes from genetic phenotype
 */

import type { Phenotype } from './breeding';

export interface VisualPhenotype {
  bodyType: 'angular' | 'ethereal' | 'balanced';
  primaryColor: string;
  size: number;
  auraIntensity: number;
  appearance: 'Radiant' | 'Subtle';
}

/**
 * Generate visual representation from phenotype
 */
export function generatePetVisual(phenotype: Phenotype): VisualPhenotype {
  const { appearance, consciousness, energy, wisdom, beauty, power, avgStrength, uniqueness } =
    phenotype;

  // Body shape based on dominant attributes
  let bodyType: 'angular' | 'ethereal' | 'balanced';
  if (power > 50) {
    bodyType = 'angular';
  } else if (consciousness > 50) {
    bodyType = 'ethereal';
  } else {
    bodyType = 'balanced';
  }

  // Color based on strongest attribute
  const primaryAttr = Math.max(consciousness, energy, wisdom, beauty, power);
  let primaryColor = '#a78bfa'; // default purple

  if (primaryAttr === consciousness) primaryColor = '#818cf8'; // indigo
  else if (primaryAttr === energy) primaryColor = '#f472b6'; // pink
  else if (primaryAttr === wisdom) primaryColor = '#60a5fa'; // blue
  else if (primaryAttr === beauty) primaryColor = '#a78bfa'; // purple
  else if (primaryAttr === power) primaryColor = '#f59e0b'; // amber

  // Size based on avg strength (60-140 range)
  const size = 60 + avgStrength * 0.8;

  // Aura intensity based on uniqueness (0-1 range)
  const auraIntensity = uniqueness / 100;

  return {
    bodyType,
    primaryColor,
    size,
    auraIntensity,
    appearance,
  };
}

/**
 * Get attribute color for visualization
 */
export function getAttributeColor(attribute: keyof Phenotype): string {
  const colorMap: Record<string, string> = {
    consciousness: '#818cf8',
    energy: '#f472b6',
    wisdom: '#60a5fa',
    beauty: '#a78bfa',
    power: '#f59e0b',
    protection: '#34d399',
    transformation: '#c084fc',
    unity: '#fbbf24',
  };

  return colorMap[attribute] || '#9ca3af';
}

/**
 * Calculate dominant attribute
 */
export function getDominantAttribute(phenotype: Phenotype): keyof Phenotype {
  const attributes: (keyof Phenotype)[] = [
    'consciousness',
    'energy',
    'wisdom',
    'beauty',
    'power',
    'protection',
    'transformation',
    'unity',
  ];

  let maxValue = 0;
  let dominant: keyof Phenotype = 'consciousness';

  attributes.forEach(attr => {
    const value = phenotype[attr] as number;
    if (value > maxValue) {
      maxValue = value;
      dominant = attr;
    }
  });

  return dominant;
}
