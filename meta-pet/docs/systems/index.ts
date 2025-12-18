export function calculateRequiredXP(level: number): number {
  // BaseXP * Level^2
  const BASE_XP = 10;
  return BASE_XP * level * level;
}
