/**
 * Script to automatically download required fonts from Google Fonts
 * 
 * Downloads Orbitron, Inter, and JetBrains Mono fonts in WOFF2 format
 * and saves them to public/fonts/ directory.
 * 
 * Usage: npm run download-fonts
 * or: node scripts/download-fonts.js
 */

const { writeFile, mkdir } = require('fs/promises');
const { existsSync } = require('fs');
const { join } = require('path');

const FONTS_DIR = join(process.cwd(), 'public', 'fonts');

// Font definitions - Using Google Fonts CSS API to get actual WOFF2 URLs
const FONT_FAMILIES = [
  { 
    family: 'Orbitron', 
    weights: ['400', '500', '600', '700', '900'],
    fileNames: {
      '400': 'Orbitron-Regular.woff2',
      '500': 'Orbitron-Medium.woff2',
      '600': 'Orbitron-SemiBold.woff2',
      '700': 'Orbitron-Bold.woff2',
      '900': 'Orbitron-Black.woff2',
    }
  },
  { 
    family: 'Inter', 
    weights: ['300', '400', '500', '600', '700'],
    fileNames: {
      '300': 'Inter-Light.woff2',
      '400': 'Inter-Regular.woff2',
      '500': 'Inter-Medium.woff2',
      '600': 'Inter-SemiBold.woff2',
      '700': 'Inter-Bold.woff2',
    }
  },
  { 
    family: 'JetBrains Mono', 
    weights: ['400', '500', '600'],
    fileNames: {
      '400': 'JetBrainsMono-Regular.woff2',
      '500': 'JetBrainsMono-Medium.woff2',
      '600': 'JetBrainsMono-SemiBold.woff2',
    }
  },
];

/**
 * Downloads a font file from a URL
 */
async function downloadFont(url, filePath) {
  try {
    console.log(`Downloading ${filePath.split('/').pop()}...`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));
    
    console.log(`✓ Downloaded ${filePath.split('/').pop()}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to download ${filePath.split('/').pop()}:`, error.message);
    return false;
  }
}

/**
 * Extracts WOFF2 URLs from Google Fonts CSS with weight mapping
 */
function extractWoff2Urls(cssText, weights) {
  const urlMap = {};
  
  // Split CSS by font-face blocks
  const fontFaceBlocks = cssText.split('@font-face');
  
  for (const block of fontFaceBlocks) {
    // Extract weight from font-weight property
    const weightMatch = block.match(/font-weight:\s*(\d+)/);
    if (!weightMatch) continue;
    
    const weight = weightMatch[1];
    
    // Extract WOFF2 URL
    const urlMatch = block.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/);
    if (urlMatch && weights.includes(weight)) {
      urlMap[weight] = urlMatch[1];
    }
  }
  
  return urlMap;
}

/**
 * Downloads all required fonts using Google Fonts API
 */
async function downloadAllFonts() {
  // Create fonts directory if it doesn't exist
  if (!existsSync(FONTS_DIR)) {
    await mkdir(FONTS_DIR, { recursive: true });
    console.log(`Created directory: ${FONTS_DIR}\n`);
  }

  console.log('Starting font download from Google Fonts...\n');
  console.log('='.repeat(60));

  let successCount = 0;
  let failCount = 0;

  for (const font of FONT_FAMILIES) {
    const familyParam = font.family.replace(' ', '+');
    const weightsParam = font.weights.join(';');
    
    // Google Fonts CSS API URL
    const cssUrl = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weightsParam}&display=swap`;
    
    try {
      console.log(`\n📦 Fetching ${font.family} (weights: ${font.weights.join(', ')})...`);
      
      const cssResponse = await fetch(cssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      
      if (!cssResponse.ok) {
        throw new Error(`Failed to fetch CSS: ${cssResponse.status} ${cssResponse.statusText}`);
      }
      
      const cssText = await cssResponse.text();
      const woff2UrlMap = extractWoff2Urls(cssText, font.weights);
      
      if (Object.keys(woff2UrlMap).length === 0) {
        console.warn(`⚠ No WOFF2 URLs found for ${font.family}`);
        failCount += font.weights.length;
        continue;
      }

      // Download each weight variant
      for (const weight of font.weights) {
        const fileName = font.fileNames[weight];
        const filePath = join(FONTS_DIR, fileName);

        // Skip if file already exists
        if (existsSync(filePath)) {
          console.log(`⊘ Skipped ${fileName} (already exists)`);
          successCount++;
          continue;
        }

        // Get URL for this specific weight
        const url = woff2UrlMap[weight];
        
        if (!url) {
          console.warn(`⚠ No URL found for ${font.family} weight ${weight}`);
          failCount++;
          continue;
        }

        const success = await downloadFont(url, filePath);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error(`\n✗ Failed to process ${font.family}:`, error.message);
      failCount += font.weights.length;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   ✓ Successfully downloaded: ${successCount} files`);
  if (failCount > 0) {
    console.log(`   ✗ Failed downloads: ${failCount} files`);
  }
  console.log('='.repeat(60));
  
  if (failCount === 0) {
    console.log('\n✅ All fonts downloaded successfully!');
  } else {
    console.log('\n⚠ Some fonts failed to download. Please check the errors above.');
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    await downloadAllFonts();
  } catch (error) {
    console.error('\n❌ Fatal error during font download:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { downloadAllFonts };

