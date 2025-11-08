# Custom Fonts

Place your custom font files here.

## Recommended Fonts

### For Hepta Codes (Monospace)

- **Source Code Pro** (Google Fonts)
  - File: `SourceCodePro-Regular.ttf`
  - Style: Monospace, clean, technical
  - Use: Hepta code displays, technical data

- **JetBrains Mono** (Alternative)
  - File: `JetBrainsMono-Regular.ttf`
  - Style: Monospace with ligatures
  - Use: Code-like elements

### For Sacred Titles (Serif)

- **Cinzel** (Google Fonts)
  - File: `Cinzel-Regular.ttf`
  - Style: Elegant serif, classical
  - Use: App title, evolution state names

- **Playfair Display** (Alternative)
  - File: `PlayfairDisplay-Regular.ttf`
  - Style: Graceful serif
  - Use: Headers, important text

### For Body Text (Sans-serif)

Most apps can use the system default (San Francisco on iOS, Roboto on Android).

If you want custom:

- **Inter** (Modern, clean)
- **Nunito** (Friendly, rounded)

## Installation

### 1. Download Fonts

From Google Fonts or font repository:
- https://fonts.google.com/

### 2. Place Files

Copy `.ttf` or `.otf` files to `/assets/fonts/`

### 3. Configure in app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-font",
        {
          "fonts": [
            "./assets/fonts/SourceCodePro-Regular.ttf",
            "./assets/fonts/Cinzel-Regular.ttf"
          ]
        }
      ]
    ]
  }
}
```

### 4. Load in App

```typescript
import * as Font from 'expo-font';

await Font.loadAsync({
  'SourceCodePro': require('../assets/fonts/SourceCodePro-Regular.ttf'),
  'Cinzel': require('../assets/fonts/Cinzel-Regular.ttf'),
});
```

### 5. Use in Styles

```typescript
{
  fontFamily: 'SourceCodePro',
  fontSize: 16,
}
```

## Font Weights

For better typography, include multiple weights:

- `SourceCodePro-Regular.ttf`
- `SourceCodePro-Bold.ttf`
- `Cinzel-Regular.ttf`
- `Cinzel-Bold.ttf`

## License

Ensure fonts are licensed for mobile app distribution. Google Fonts are open-source and safe to use.
