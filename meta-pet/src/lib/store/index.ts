import { createMetaPetWebStore, type MetaPetState } from '@metapet/core/store';

export type { MetaPetState };
export { createMetaPetWebStore } from '@metapet/core/store';

export const useStore = createMetaPetWebStore();
