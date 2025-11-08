# Sound Effects

Place your audio files here for the hepta audio system.

## Required Audio Files

### Hepta Chimes (for playHepta system)

Create 7 pure tone chimes at these frequencies:

- **chime-c4.mp3** - C4 (261.63 Hz)
- **chime-d4.mp3** - D4 (293.66 Hz)
- **chime-e4.mp3** - E4 (329.63 Hz)
- **chime-g4.mp3** - G4 (392.00 Hz)
- **chime-a4.mp3** - A4 (440.00 Hz)
- **chime-c5.mp3** - C5 (523.25 Hz)
- **chime-d5.mp3** - D5 (587.33 Hz)

### UI Feedback Sounds

- **success.mp3** - Success/completion sound (ascending chime)
- **error.mp3** - Error sound (descending tone)
- **tap.mp3** - Tap/button press sound (short click)

## Specifications

- **Format**: MP3 (best compatibility) or M4A
- **Duration**: 150-300ms for chimes, 100-200ms for feedback
- **Sample rate**: 44.1kHz
- **Bit rate**: 128kbps minimum
- **Volume**: Normalized to -3dB to prevent clipping

## Creating Audio Files

### Online Tone Generators

1. **Online Tone Generator**: https://www.szynalski.com/tone-generator/
2. **Audacity**: Free, open-source audio editor
3. **GarageBand** (Mac): Create pure sine wave tones

### Audacity Instructions

1. Generate > Tone
2. Set waveform to Sine
3. Set frequency (e.g., 261.63 for C4)
4. Set duration to 0.2 seconds
5. Apply fade out (last 50ms)
6. Export as MP3

### Sacred Tone Option

For a more "sacred" sound, consider:

- Crystal bowl recordings
- Tibetan singing bowl samples
- Tuning fork samples
- Synthesized bell tones with harmonic overtones

## Testing

Test your audio files:

```typescript
import { Audio } from 'expo-av';

const { sound } = await Audio.Sound.createAsync(
  require('../assets/sfx/chime-c4.mp3')
);
await sound.playAsync();
await sound.unloadAsync();
```

## Optional: Adaptive Audio

For enhanced experience, consider:

- Different timbres for each vault (red/blue/black)
- Reverb/echo for quantum evolution state
- Layered harmonics for higher evolution states
