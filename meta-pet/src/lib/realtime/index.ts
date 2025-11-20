/**
 * Real-time Response System - Main exports
 */

export {
  getResponse,
  getIdleResponse,
  getWarningResponse,
  getAnticipatoryResponse,
  getAudioToneForResponse,
  type PetResponse,
  type ResponseContext,
  type ResponseType,
} from './responseSystem';

export {
  useRealtimeResponse,
  type UseRealtimeResponseOptions,
} from './useRealtimeResponse';
