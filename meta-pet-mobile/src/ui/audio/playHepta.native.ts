/**
 * Hepta Audio System
 * Plays sacred tones based on hepta codes using expo-av
 */

import { Audio } from 'expo-av';
import { FEATURES } from '../../config';

// Musical scale frequencies (C major pentatonic for simplicity)
const BASE_SCALE = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
];

// Vault transpositions
const VAULT_TRANSPOSE = {
  red: 0,    // No transpose
  blue: 2,   // +2 semitones
  black: -2, // -2 semitones
};

// Rotation affects playback order
const ROTATION_MULTIPLIER = {
  CW: 1,    // Clockwise: normal order
  CCW: -1,  // Counter-clockwise: reverse order
};

/**
 * Map hepta digits to musical scale frequencies
 */
function mapDigitsToScale(
  digits: number[],
  vault: 'red' | 'blue' | 'black',
  rotation: 'CW' | 'CCW'
): number[] {
  const transpose = VAULT_TRANSPOSE[vault];
  const multiplier = Math.pow(2, transpose / 12); // Semitone transposition

  let processedDigits = [...digits];
  if (rotation === 'CCW') {
    processedDigits = processedDigits.reverse();
  }

  return processedDigits.map(digit => {
    const scaleIndex = digit % BASE_SCALE.length;
    return BASE_SCALE[scaleIndex] * multiplier;
  });
}

/**
 * Generate a simple tone using Web Audio API (for native simulation)
 * In production, you could use pre-recorded samples or synthesize tones
 */
async function playTone(frequency: number, duration: number = 200): Promise<void> {
  // For now, we'll use a simple beep sound
  // In production, you would:
  // 1. Load pre-recorded chime samples
  // 2. Or use a native audio synthesis library
  // 3. Or use a synthesizer like Tone.js (if available for RN)

  try {
    // Placeholder: In a real implementation, load and play a sample at the given frequency
    console.log(`Playing tone at ${frequency.toFixed(2)}Hz for ${duration}ms`);

    // Simulate delay for tone duration
    await new Promise(resolve => setTimeout(resolve, duration));
  } catch (error) {
    console.error('Error playing tone:', error);
  }
}

/**
 * Play hepta code as musical sequence
 */
export async function playHepta(
  digits: number[],
  {
    vault = 'red',
    rotation = 'CW',
  }: {
    vault?: 'red' | 'blue' | 'black';
    rotation?: 'CW' | 'CCW';
  } = {}
): Promise<void> {
  if (!FEATURES.AUDIO) {
    console.log('Audio is disabled');
    return;
  }

  console.log(`Playing Hepta: ${digits.join(', ')} with vault ${vault} and rotation ${rotation}`);

  try {
    // Configure audio mode for playback
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    const frequencies = mapDigitsToScale(digits, vault, rotation);

    // Play each tone in sequence
    for (const freq of frequencies) {
      await playTone(freq, 150);
      // Small gap between tones
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`Hepta playback complete`);
  } catch (error) {
    console.error('Error playing hepta sequence:', error);
  }
}

/**
 * Play a simple feedback sound
 */
export async function playFeedbackSound(type: 'success' | 'error' | 'tap'): Promise<void> {
  if (!FEATURES.AUDIO) return;

  try {
    const frequencies = {
      success: [523.25, 659.25, 783.99], // C5, E5, G5
      error: [392.00, 329.63], // G4, E4 (descending)
      tap: [440.00], // A4
    };

    const freqs = frequencies[type];
    for (const freq of freqs) {
      await playTone(freq, 80);
      await new Promise(resolve => setTimeout(resolve, 30));
    }
  } catch (error) {
    console.error('Error playing feedback sound:', error);
  }
}
