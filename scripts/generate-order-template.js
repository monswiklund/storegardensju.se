#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.join(__dirname, '../src/data/gallery-order.json');
const CATEGORIES_FILE = path.join(__dirname, '../src/data/galleryCategories.json');

/**
 * Generates a gallery-order.json template based on the current automatic sorting
 * from galleryCategories.json
 */
function generateOrderTemplate() {
  console.log('📋 Genererar gallery-order.json mall...');

  // Check if galleryCategories.json exists
  if (!fs.existsSync(CATEGORIES_FILE)) {
    console.error('❌ galleryCategories.json finns inte. Kör "npm run build:gallery" först.');
    process.exit(1);
  }

  // Read current gallery data
  const galleryData = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));

  // Build order config from current data
  const orderConfig = {
    _comment: "Flytta runt filnamn för att ändra visningsordning. Bilder som inte listas hamnar sist (automatiskt sorterade).",
    featured: [],
    categories: {}
  };

  // Get first 6 images from "alla" category as default featured
  const allaCategory = galleryData.categories.find(cat => cat.id === 'alla');
  if (allaCategory && allaCategory.images.length > 0) {
    orderConfig.featured = allaCategory.images
      .slice(0, Math.min(6, allaCategory.images.length))
      .map(img => img.filename);
  }

  // Extract order for each category
  for (const category of galleryData.categories) {
    orderConfig.categories[category.id] = category.images.map(img => img.filename);
  }

  // Check if file already exists
  if (fs.existsSync(OUTPUT_FILE)) {
    console.warn('⚠️  gallery-order.json finns redan!');
    console.log('💡 Vill du skriva över den? (Ctrl+C för att avbryta)');

    // Create backup
    const backupFile = OUTPUT_FILE.replace('.json', '.backup.json');
    fs.copyFileSync(OUTPUT_FILE, backupFile);
    console.log(`📦 Backup sparad: ${backupFile}`);
  }

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(orderConfig, null, 2));

  console.log(`✅ Genererade ${OUTPUT_FILE}`);
  console.log(`⭐ Featured bilder: ${orderConfig.featured.length} st`);
  console.log('📊 Kategorier inkluderade:');

  for (const [categoryId, images] of Object.entries(orderConfig.categories)) {
    console.log(`   📁 ${categoryId}: ${images.length} bilder`);
  }

  console.log('\n💡 Nästa steg:');
  console.log('   1. Öppna src/data/gallery-order.json');
  console.log('   2. Redigera "featured" array för att välja utvalda bilder (6-10 st)');
  console.log('   3. Flytta runt filnamn i categories för att ändra ordning');
  console.log('   4. Kör "npm run build:gallery"');
}

generateOrderTemplate();
