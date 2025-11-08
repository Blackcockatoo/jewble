# Meta-Pet Mobile Assets

This directory contains all assets needed for the B$S Meta-Pet mobile app.

## Required Assets

### App Icons

Create the following icon files in the `/assets/icons` directory:

- **icon.png** (1024x1024): Main app icon
  - Use B$S sacred geometry design
  - Gold (#D4AF37) on black (#0A0A0A) background
  - Feature Seed of Life or similar sacred geometry pattern

- **adaptive-icon.png** (1024x1024): Android adaptive icon
  - Foreground: Sacred geometry symbol in gold
  - Background: Black with subtle gradient

- **favicon.png** (48x48): Web favicon
  - Simplified version of main icon

### Splash Screen

- **splash.png** (1284x2778): Launch screen
  - Black background (#0A0A0A)
  - Centered Seed of Life glyph in gold (#D4AF37)
  - App name "Meta-Pet" below in elegant font
  - Tagline "Sacred Companion" in smaller text

### Sound Effects (Optional)

Create audio files in `/assets/sfx` directory:

- **chime-c4.mp3**: C4 note (261.63 Hz)
- **chime-d4.mp3**: D4 note (293.66 Hz)
- **chime-e4.mp3**: E4 note (329.63 Hz)
- **chime-g4.mp3**: G4 note (392.00 Hz)
- **chime-a4.mp3**: A4 note (440.00 Hz)
- **chime-c5.mp3**: C5 note (523.25 Hz)
- **chime-d5.mp3**: D5 note (587.33 Hz)
- **success.mp3**: Success feedback sound
- **error.mp3**: Error feedback sound
- **tap.mp3**: Tap feedback sound

### Fonts (Optional)

Place custom fonts in `/assets/fonts` directory:

- **SourceCodePro-Regular.ttf**: For hepta codes
- **Cinzel-Regular.ttf**: For sacred titles

## Design Guidelines

### Color Palette

- **Primary Gold**: #D4AF37
- **Background Black**: #0A0A0A
- **Surface**: #1A1A1A
- **Text**: #F5F5F5

### Sacred Geometry Elements

- Seed of Life (7 circles)
- Flower of Life patterns
- Metatron's Cube
- Golden ratio proportions
- Vesica Piscis

### Style

- Minimalist and elegant
- High contrast (black & gold)
- Sacred geometry-inspired shapes
- Mystical but not cluttered
- Professional and polished

## Generating Assets

You can use tools like:

1. **Figma** - For designing app icons and splash screens
2. **Affinity Designer** - For vector graphics
3. **GIMP** - For raster image editing
4. **Audacity** - For generating/editing sound effects

## Asset Configuration

Update `app.json` with your asset paths:

```json
{
  "expo": {
    "icon": "./assets/icons/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "backgroundColor": "#0A0A0A"
    },
    "ios": {
      "icon": "./assets/icons/icon.png"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icons/adaptive-icon.png",
        "backgroundColor": "#0A0A0A"
      }
    },
    "web": {
      "favicon": "./assets/icons/favicon.png"
    }
  }
}
```
