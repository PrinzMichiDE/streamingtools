/**
 * Script to automatically download required fonts from Google Fonts
 * 
 * Downloads Orbitron, Inter, and JetBrains Mono fonts in WOFF2 format
 * and saves them to public/fonts/ directory.
 * 
 * Usage: npm run download-fonts
 * or: npx tsx scripts/download-fonts.ts
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

interface FontFile {
  name: string;
  weight: string;
  url: string;
}

const FONTS_DIR = join(process.cwd(), 'public', 'fonts');

// Font definitions with Google Fonts API URLs
const FONTS: Record<string, FontFile[]> = {
  Orbitron: [
    { name: 'Orbitron-Regular.woff2', weight: '400', url: 'https://fonts.gstatic.com/s/orbitron/v31/yMJRMIlzdpvBhQQL_Qq7dy0.woff2' },
    { name: 'Orbitron-Medium.woff2', weight: '500', url: 'https://fonts.gstatic.com/s/orbitron/v31/yMJRMIlzdpvBhQQL_Qq7dy0.woff2' },
    { name: 'Orbitron-SemiBold.woff2', weight: '600', url: 'https://fonts.gstatic.com/s/orbitron/v31/yMJWMIlzdpvBhQQL_Qq7dyd8kU.woff2' },
    { name: 'Orbitron-Bold.woff2', weight: '700', url: 'https://fonts.gstatic.com/s/orbitron/v31/yMJWMIlzdpvBhQQL_Qq7dyd8kU.woff2' },
    { name: 'Orbitron-Black.woff2', weight: '900', url: 'https://fonts.gstatic.com/s/orbitron/v31/yMJWMIlzdpvBhQQL_Qq7dyd8kU.woff2' },
  ],
  Inter: [
    { name: 'Inter-Light.woff2', weight: '300', url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2' },
    { name: 'Inter-Regular.woff2', weight: '400', url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2' },
    { name: 'Inter-Medium.woff2', weight: '500', url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2' },
    { name: 'Inter-SemiBold.woff2', weight: '600', url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2' },
    { name: 'Inter-Bold.woff2', weight: '700', url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2' },
  ],
  JetBrainsMono: [
    { name: 'JetBrainsMono-Regular.woff2', weight: '400', url: 'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yK1TOVY4.woff2' },
    { name: 'JetBrainsMono-Medium.woff2', weight: '500', url: 'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yK1TOVY4.woff2' },
    { name: 'JetBrainsMono-SemiBold.woff2', weight: '600', url: 'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yK1TOVY4.woff2' },
  ],
};

/**
 * Downloads a font file from a URL
 */
async function downloadFont(url: string, filePath: string): Promise<void> {
  try {
    console.log(`Downloading ${filePath}...`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));
    
    console.log(`✓ Downloaded ${filePath}`);
  } catch (error) {
    console.error(`✗ Failed to download ${filePath}:`, error);
    throw error;
  }
}

/**
 * Downloads all required fonts
 */
async function downloadAllFonts(): Promise<void> {
  // Create fonts directory if it doesn't exist
  if (!existsSync(FONTS_DIR)) {
    await mkdir(FONTS_DIR, { recursive: true });
    console.log(`Created directory: ${FONTS_DIR}`);
  }

  console.log('Starting font download...\n');

  let successCount = 0;
  let failCount = 0;

  // Download all fonts
  for (const [fontFamily, files] of Object.entries(FONTS)) {
    console.log(`\n📦 Downloading ${fontFamily}...`);
    
    for (const file of files) {
      const filePath = join(FONTS_DIR, file.name);
      
      // Skip if file already exists
      if (existsSync(filePath)) {
        console.log(`⊘ Skipped ${file.name} (already exists)`);
        successCount++;
        continue;
      }

      try {
        await downloadFont(file.url, filePath);
        successCount++;
      } catch (error) {
        failCount++;
        console.error(`Failed to download ${file.name}`);
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✓ Successfully downloaded: ${successCount} files`);
  if (failCount > 0) {
    console.log(`✗ Failed downloads: ${failCount} files`);
  }
  console.log('='.repeat(50));
}

/**
 * Alternative method: Download fonts using Google Fonts Helper API
 * This method uses a more reliable approach by fetching the actual font files
 */
async function downloadFontsFromGoogleFontsAPI(): Promise<void> {
  const fontFamilies = [
    { family: 'Orbitron', weights: ['400', '500', '600', '700', '900'] },
    { family: 'Inter', weights: ['300', '400', '500', '600', '700'] },
    { family: 'JetBrains Mono', weights: ['400', '500', '600'] },
  ];

  // Create fonts directory if it doesn't exist
  if (!existsSync(FONTS_DIR)) {
    await mkdir(FONTS_DIR, { recursive: true });
  }

  console.log('Downloading fonts from Google Fonts API...\n');

  for (const font of fontFamilies) {
    const familyParam = font.family.replace(' ', '+');
    const weightsParam = font.weights.join(';');
    
    // Google Fonts CSS API URL
    const cssUrl = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weightsParam}&display=swap`;
    
    try {
      console.log(`Fetching font info for ${font.family}...`);
      const cssResponse = await fetch(cssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      
      const cssText = await cssResponse.text();
      
      // Extract WOFF2 URLs from CSS
      const woff2Regex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g;
      const matches = [...cssText.matchAll(woff2Regex)];
      
      if (matches.length === 0) {
        console.warn(`⚠ No WOFF2 URLs found for ${font.family}`);
        continue;
      }

      // Download each weight variant
      for (let i = 0; i < font.weights.length && i < matches.length; i++) {
        const weight = font.weights[i];
        const url = matches[i][1];
        const fileName = `${font.family.replace(' ', '')}-${getWeightName(weight)}.woff2`;
        const filePath = join(FONTS_DIR, fileName);

        if (existsSync(filePath)) {
          console.log(`⊘ Skipped ${fileName} (already exists)`);
          continue;
        }

        try {
          await downloadFont(url, filePath);
        } catch (error) {
          console.error(`Failed to download ${fileName}`);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch ${font.family}:`, error);
    }
  }
}

/**
 * Converts numeric weight to name
 */
function getWeightName(weight: string): string {
  const weightMap: Record<string, string> = {
    '300': 'Light',
    '400': 'Regular',
    '500': 'Medium',
    '600': 'SemiBold',
    '700': 'Bold',
    '900': 'Black',
  };
  return weightMap[weight] || weight;
}

/**
 * Main execution
 */
async function main() {
  try {
    // Try the direct URL method first
    console.log('Attempting to download fonts using direct URLs...\n');
    await downloadAllFonts();
    
    // If some fonts failed, try the Google Fonts API method
    console.log('\n\nAttempting alternative download method...\n');
    await downloadFontsFromGoogleFontsAPI();
    
    console.log('\n✅ Font download completed!');
  } catch (error) {
    console.error('\n❌ Error during font download:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { downloadAllFonts, downloadFontsFromGoogleFontsAPI };

