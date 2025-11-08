export type Vault = 'red' | 'blue' | 'black';
export type Rotation = 'CW' | 'CCW';
export type PrivacyPreset = 'stealth' | 'standard' | 'radiant';

export interface PrimeTailId {
  vault: Vault;
  rotation: Rotation;
  tail: [number, number, number, number];
  coronatedAt: number;
  dnaHash: string;
  mirrorHash: string;
  signature: string;
}

export interface HeptaPayload {
  version: number;
  preset: PrivacyPreset;
  vault: Vault;
  rotation: Rotation;
  tail: [number, number, number, number];
  epoch13: number;
  nonce14: number;
}

export interface ConsentState {
  granted: boolean;
  grantedAt: number | null;
  version: string;
}

export interface SealedExport {
  version: string;
  exportedAt: number;
  crest: PrimeTailId;
  vitals: unknown;
  signature: string;
}
