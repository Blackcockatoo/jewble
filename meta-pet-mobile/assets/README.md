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

### Quick Start - Convert SVG Placeholders

The `PLACEHOLDER_ICON.svg` and `PLACEHOLDER_SPLASH.svg` files are ready to convert:

**Method 1: Online Converter (Easiest)**
1. Visit [CloudConvert](https://cloudconvert.com/svg-to-png)
2. Upload `PLACEHOLDER_ICON.svg`
   - Convert to PNG at 1024x1024 → save as `icons/icon.png`
   - Convert to PNG at 1024x1024 → save as `icons/adaptive-icon.png`
   - Convert to PNG at 48x48 → save as `icons/favicon.png`
3. Upload `PLACEHOLDER_SPLASH.svg`
   - Convert to PNG at 1284x2778 → save as `splash.png`

**Method 2: Using Inkscape (Free Desktop Tool)**
```bash
# Install Inkscape from https://inkscape.org
inkscape --export-type=png --export-width=1024 --export-height=1024 PLACEHOLDER_ICON.svg -o icons/icon.png
inkscape --export-type=png --export-width=1024 --export-height=1024 PLACEHOLDER_ICON.svg -o icons/adaptive-icon.png
inkscape --export-type=png --export-width=48 --export-height=48 PLACEHOLDER_ICON.svg -o icons/favicon.png
inkscape --export-type=png --export-width=1284 --export-height=2778 PLACEHOLDER_SPLASH.svg -o splash.png
```

**Method 3: Using ImageMagick**
```bash
# Install ImageMagick from https://imagemagick.org
magick PLACEHOLDER_ICON.svg -resize 1024x1024 icons/icon.png
magick PLACEHOLDER_ICON.svg -resize 1024x1024 icons/adaptive-icon.png
magick PLACEHOLDER_ICON.svg -resize 48x48 icons/favicon.png
magick PLACEHOLDER_SPLASH.svg -resize 1284x2778 splash.png
```

### Other Design Tools

You can also use these tools to create custom designs:

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
