#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '../public/images');
const OUTPUT_FILE = path.join(__dirname, '../src/data/galleryCategories.json');

// Kategori-metadata
const CATEGORY_METADATA = {
  lokal: {
    name: 'Lokal',
    description: 'Lokal bilder från Storegården 7'
  },
  evenemang: {
    name: 'Evenemang', 
    description: 'Evenemang från Storegården 7'
  },
  'konst-keramik': {
    name: 'Konst & Keramik',
    description: 'Konst och keramik från Storegården 7'
  }
};

function getImageNumber(filename) {
  const match = filename.match(/slide(\d+)\.jpg$/);
  return match ? parseInt(match[1]) : null;
}

function scanImagesInCategory(categoryDir) {
  try {
    const files = fs.readdirSync(categoryDir);
    return files
      .filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png'))
      .map(file => getImageNumber(file))
      .filter(num => num !== null)
      .sort((a, b) => a - b);
  } catch (error) {
    console.warn(`Kunde inte läsa katalog ${categoryDir}:`, error.message);
    return [];
  }
}

function generateGalleryCategories() {
  console.log('🔍 Skannar bildmappar...');
  
  const categories = [];
  
  // Lägg till "Alla bilder" kategori
  const allImages = [];
  
  // Skanna alla kategorimappar
  const categoryDirs = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .filter(dirent => dirent.name !== 'slides') // Exkludera gamla slides-mappen
    .map(dirent => dirent.name);

  // Behandla varje kategori
  for (const categoryId of categoryDirs) {
    const categoryPath = path.join(IMAGES_DIR, categoryId);
    const images = scanImagesInCategory(categoryPath);
    
    if (images.length > 0) {
      const metadata = CATEGORY_METADATA[categoryId] || {
        name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
        description: `Bilder från kategorin ${categoryId}`
      };
      
      categories.push({
        id: categoryId,
        name: metadata.name,
        description: metadata.description,
        images: images
      });
      
      allImages.push(...images);
      
      console.log(`📁 ${metadata.name}: ${images.length} bilder`);
    }
  }
  
  // Lägg till "Alla bilder" först
  const allImagesUnique = [...new Set(allImages)].sort((a, b) => a - b);
  categories.unshift({
    id: 'alla',
    name: 'Alla bilder',
    description: 'Alla bilder från Storegården 7',
    images: allImagesUnique
  });
  
  const output = {
    categories: categories
  };
  
  // Skriv till fil
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  
  console.log(`✅ Genererade ${OUTPUT_FILE}`);
  console.log(`📊 Totalt ${categories.length} kategorier med ${allImagesUnique.length} unika bilder`);
  
  return output;
}

// Kör alltid när filen importeras eller körs
generateGalleryCategories();

export default generateGalleryCategories;