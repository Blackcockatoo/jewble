import { createMetaPetWebStore, type MetaPetState, type PetType } from '@metapet/core/store';

export type { MetaPetState, PetType };
export { createMetaPetWebStore } from '@metapet/core/store';
export type { Vitals } from '@metapet/core/vitals';

export const useStore = createMetaPetWebStore();
