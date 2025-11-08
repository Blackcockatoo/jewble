import type { ConsentState } from './types';

const CURRENT_VERSION = '1.0.0';

export function createDefaultConsent(): ConsentState {
  return {
    granted: false,
    grantedAt: null,
    version: CURRENT_VERSION,
  };
}

export function grantConsent(): ConsentState {
  return {
    granted: true,
    grantedAt: Date.now(),
    version: CURRENT_VERSION,
  };
}

export function revokeConsent(): ConsentState {
  return {
    granted: false,
    grantedAt: null,
    version: CURRENT_VERSION,
  };
}

export function isConsentValid(consent: ConsentState): boolean {
  return consent.granted && consent.version === CURRENT_VERSION;
}
