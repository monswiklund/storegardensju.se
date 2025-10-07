#!/usr/bin/env node

/**
 * Optimise images under public/images using sharp.
 * Requires `sharp` to be installed (`npm install --save-dev sharp`).
 */

import { readdir, stat, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const INPUT_DIR = path.join(process.cwd(), 'public/images');
const OUTPUT_DIR = path.join(process.cwd(), 'public/images-optimized');

async function loadSharp() {
  try {
    const sharp = await import('sharp');
    return sharp.default ?? sharp;
  } catch (error) {
    console.error('❌  Sharp is not installed. Run `npm install --save-dev sharp` and try again.');
    process.exitCode = 1;
    throw error;
  }
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function optimiseFile(sharp, inputPath, outputPath) {
  const sourceBuffer = await readFile(inputPath);
  const beforeSize = sourceBuffer.byteLength;

  await sharp(sourceBuffer)
    .webp({ quality: 80, effort: 5 })
    .toFile(outputPath);

  const afterStats = await stat(outputPath);
  const afterSize = afterStats.size;
  const savings = beforeSize - afterSize;
  const percent = beforeSize === 0 ? 0 : ((savings / beforeSize) * 100).toFixed(1);

  console.log(
    `⚙️  ${path.relative(INPUT_DIR, inputPath)} → ${path.relative(OUTPUT_DIR, outputPath)} ` +
    `(${formatBytes(beforeSize)} → ${formatBytes(afterSize)}, saved ${formatBytes(savings)} / ${percent}%)`
  );
}

function formatBytes(bytes) {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

async function walk(sharp, currentDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const inputPath = path.join(currentDir, entry.name);
    const relative = path.relative(INPUT_DIR, inputPath);
    const outputPath = path.join(OUTPUT_DIR, relative);

    if (entry.isDirectory()) {
      await ensureDir(outputPath);
      await walk(sharp, inputPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      continue;
    }

    await ensureDir(path.dirname(outputPath));
    await optimiseFile(sharp, inputPath, outputPath.replace(ext, '.webp'));
  }
}

async function main() {
  const sharp = await loadSharp();
  await ensureDir(OUTPUT_DIR);
  console.log(`📁  Optimising images from ${INPUT_DIR} → ${OUTPUT_DIR}`);
  await walk(sharp, INPUT_DIR);
  console.log('✅  Image optimisation complete.');
}

main().catch((error) => {
  if (!process.exitCode) {
    process.exitCode = 1;
  }
  console.error('❌  Image optimisation failed:', error.message);
});
