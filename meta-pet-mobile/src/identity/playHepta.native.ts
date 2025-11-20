/**
 * Identity-facing shim that forwards to the UI audio implementation.
 * Keeps compatibility for legacy imports while avoiding duplicate logic.
 */
export { playHepta, playFeedbackSound } from '../ui/audio/playHepta.native';
