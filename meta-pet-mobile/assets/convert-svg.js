const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSVGtoPNG() {
  try {
    // Create icons directory if it doesn't exist
    const iconsDir = path.join(__dirname, 'icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir);
    }

    console.log('Converting PLACEHOLDER_ICON.svg to icon.png (1024x1024)...');
    await sharp(path.join(__dirname, 'PLACEHOLDER_ICON.svg'))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(iconsDir, 'icon.png'));
    console.log('✓ icon.png created');

    console.log('Converting PLACEHOLDER_ICON.svg to adaptive-icon.png (1024x1024)...');
    await sharp(path.join(__dirname, 'PLACEHOLDER_ICON.svg'))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(iconsDir, 'adaptive-icon.png'));
    console.log('✓ adaptive-icon.png created');

    console.log('Converting PLACEHOLDER_ICON.svg to favicon.png (48x48)...');
    await sharp(path.join(__dirname, 'PLACEHOLDER_ICON.svg'))
      .resize(48, 48)
      .png()
      .toFile(path.join(iconsDir, 'favicon.png'));
    console.log('✓ favicon.png created');

    console.log('Converting PLACEHOLDER_SPLASH.svg to splash.png (1284x2778)...');
    await sharp(path.join(__dirname, 'PLACEHOLDER_SPLASH.svg'))
      .resize(1284, 2778)
      .png()
      .toFile(path.join(__dirname, 'splash.png'));
    console.log('✓ splash.png created');

    console.log('\n✅ All assets converted successfully!');
    console.log('\nGenerated files:');
    console.log('  - assets/icons/icon.png (1024x1024)');
    console.log('  - assets/icons/adaptive-icon.png (1024x1024)');
    console.log('  - assets/icons/favicon.png (48x48)');
    console.log('  - assets/splash.png (1284x2778)');
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
    process.exit(1);
  }
}

convertSVGtoPNG();
