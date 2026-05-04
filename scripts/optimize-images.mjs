#! /usr/bin/env node

/**
 * Post-build image optimizer.
 * Converts all PNG images in the build output to WebP for faster loading.
 * Uses cwebp if available, falls back gracefully with a warning.
 *
 * Run: node scripts/optimize-images.mjs
 */

import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync, renameSync, copyFileSync, mkdirSync } from 'fs';
import { join, extname, basename, dirname } from 'path';

const DIST_DIR = join(import.meta.dirname, '..', 'client', 'dist');
const QUALITY = 82;

async function findPNGs(dir) {
  let results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await findPNGs(fullPath));
    } else if (entry.name.endsWith('.webp')) {
      // already optimized
    } else if (entry.name.endsWith('.png') && statSync(fullPath).size > 1024) {
      results.push(fullPath);
    }
  }
  return results;
}

function tryCommand(cmd) {
  try {
    execSync(`which ${cmd.split(' ')[0]} 2>/dev/null`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function optimizeWithCwebp(pngPaths) {
  let converted = 0;
  let saved = 0;
  for (const png of pngPaths) {
    const webp = png.replace(/\.png$/, '.webp');
    try {
      execSync(`cwebp -q ${QUALITY} "${png}" -o "${webp}" 2>/dev/null`, { stdio: 'pipe' });
      const pngSize = statSync(png).size;
      const webpSize = statSync(webp).size;
      saved += pngSize - webpSize;
      converted++;
    } catch (e) {
      console.error(`  ✗ Failed: ${basename(png)}`);
    }
  }
  return { converted, saved };
}

async function optimizeWithSips(pngPaths) {
  // sips on macOS can't output WebP — try a workaround via HEIC then discard
  console.warn('  sips does not support WebP output on this system. Skipping.');
  return { converted: 0, saved: 0 };
}

async function main() {
  if (!existsSync(DIST_DIR)) {
    console.log(`Build output not found at ${DIST_DIR}. Run 'vite build' first.`);
    process.exit(0);
  }

  const pngs = await findPNGs(DIST_DIR);
  if (pngs.length === 0) {
    console.log('No PNG images found to optimize.');
    process.exit(0);
  }

  console.log(`Found ${pngs.length} PNGs to optimize in ${DIST_DIR}`);
  const totalSize = pngs.reduce((sum, p) => sum + statSync(p).size, 0);
  console.log(`Total PNG size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);

  let result;
  if (tryCommand('cwebp')) {
    console.log('Using cwebp...');
    result = await optimizeWithCwebp(pngs);
  } else {
    console.warn('');
    console.warn('╔══════════════════════════════════════════════════════════════╗');
    console.warn('║  No WebP converter found. Install one:                     ║');
    console.warn('║  macOS: brew install webp                                  ║');
    console.warn('║  Linux: apt install webp  or  yum install libwebp-tools    ║');
    console.warn('╚══════════════════════════════════════════════════════════════╝');
    console.warn('');
    result = { converted: 0, saved: 0 };
  }

  const mbSaved = (result.saved / 1024 / 1024).toFixed(1);
  console.log(`Converted ${result.converted}/${pngs.length} images, saved ~${mbSaved} MB`);
  if (result.saved > 0) {
    console.log(`Reduction: ${(result.saved / totalSize * 100).toFixed(0)}%`);
  }
}

main().catch(console.error);
