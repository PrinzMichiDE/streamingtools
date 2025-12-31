# Font Files Setup

This directory should contain the following font files in WOFF2 format:

## Required Fonts

### Orbitron (Display Font)
- `Orbitron-Regular.woff2` (weight: 400)
- `Orbitron-Medium.woff2` (weight: 500)
- `Orbitron-SemiBold.woff2` (weight: 600)
- `Orbitron-Bold.woff2` (weight: 700)
- `Orbitron-Black.woff2` (weight: 900)

### Inter (Body Font)
- `Inter-Light.woff2` (weight: 300)
- `Inter-Regular.woff2` (weight: 400)
- `Inter-Medium.woff2` (weight: 500)
- `Inter-SemiBold.woff2` (weight: 600)
- `Inter-Bold.woff2` (weight: 700)

### JetBrains Mono (Monospace Font)
- `JetBrainsMono-Regular.woff2` (weight: 400)
- `JetBrainsMono-Medium.woff2` (weight: 500)
- `JetBrainsMono-SemiBold.woff2` (weight: 600)

## How to Download Fonts

### Option 1: Automatic Download Script (Recommended) ⚡

Use the provided script to automatically download all required fonts:

```bash
npm run download-fonts
```

This script will:
- Download all required font files in WOFF2 format
- Save them to `public/fonts/` directory
- Skip files that already exist
- Show progress and summary

**Requirements:**
- Node.js 18+ (for native fetch support)
- Internet connection

### Option 2: Manual Download via Google Fonts

1. Visit [Google Fonts](https://fonts.google.com/)
2. Search for each font (Orbitron, Inter, JetBrains Mono)
3. Select the required weights
4. Download and extract the fonts
5. Convert TTF files to WOFF2 using a tool like [woff2](https://github.com/google/woff2) or an online converter

**Direct Links:**
- **Orbitron**: https://fonts.google.com/specimen/Orbitron
- **Inter**: https://fonts.google.com/specimen/Inter
- **JetBrains Mono**: https://fonts.google.com/specimen/JetBrains+Mono

## Font Conversion

If you have TTF files, convert them to WOFF2:

```bash
# Using woff2 (install via npm: npm install -g woff2)
woff2_compress font.ttf
```

Or use an online converter like:
- https://cloudconvert.com/ttf-to-woff2
- https://convertio.co/ttf-woff2/

## Notes

- All fonts must be in WOFF2 format for optimal performance
- Font files are self-hosted to comply with security requirements
- The application will fall back to system fonts if these files are missing

