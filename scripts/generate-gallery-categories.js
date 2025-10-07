#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GALLERY_DIR = path.join(__dirname, '../public/images/gallery');
const OUTPUT_FILE = path.join(__dirname, '../src/data/galleryCategories.json');

// Kategori-metadata för displayNames
const CATEGORY_METADATA = {
  lokal: {
    name: 'Lokal',
    description: 'Lokalen på Storegården 7'
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

// Subkategori-metadata för displayNames och sorteringsordning
const SUBCATEGORY_METADATA = {
  upper: { name: 'Övre våning', order: 1 },
  under: { name: 'Nedre våning', order: 2 },
  kok: { name: 'Kök', order: 3 },
  service: { name: 'Serviceområde', order: 4 },
  ute: { name: 'Utemiljö', order: 5 },
  'ute-toa': { name: 'Toaletter', order: 6 }
};

/**
 * Parsar filnamn enligt formatet: {kategori}-{subkategori}-{nummer}.{ext}
 * Exempel: lokal-kok-1.webp → { category: 'lokal', subcategory: 'kok', number: 1 }
 */
function parseFilename(filename) {
  // Prova matcha mot varje känd kategori (längsta först för att undvika false matches)
  const categories = Object.keys(CATEGORY_METADATA).sort((a, b) => b.length - a.length);

  for (const category of categories) {
    // Escape special regex characters in category name
    const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Match pattern: {category}-{subcategory}-{number}.{ext}
    // Double backslashes needed in template string for RegExp constructor
    const pattern = new RegExp(`^${escapedCategory}-([a-z-]+)-(\\d+)\\.(webp|jpg|jpeg|png)$`, 'i');
    const match = filename.match(pattern);

    if (match) {
      const [, subcategory, numberStr, ext] = match;
      return {
        filename,
        category: category,
        subcategory: subcategory,
        number: parseInt(numberStr, 10),
        extension: ext
      };
    }
  }

  return null;
}

/**
 * Skannar gallery-mappen och returnerar alla parsade bilder
 */
function scanGallery() {
  try {
    if (!fs.existsSync(GALLERY_DIR)) {
      console.warn(`⚠️  Gallery-mappen finns inte: ${GALLERY_DIR}`);
      return [];
    }

    const files = fs.readdirSync(GALLERY_DIR);
    const images = [];

    for (const file of files) {
      // Skippa DS_Store och andra hidden files
      if (file.startsWith('.')) continue;

      const parsed = parseFilename(file);
      if (parsed) {
        images.push(parsed);
      } else {
        console.warn(`⚠️  Kunde inte parsa filnamn: ${file}`);
      }
    }

    return images;
  } catch (error) {
    console.error(`❌ Fel vid skanning av gallery:`, error.message);
    return [];
  }
}

/**
 * Grupperar bilder per kategori och genererar metadata
 */
function generateGalleryCategories() {
  console.log('🔍 Skannar gallery-mappen...');

  const allImages = scanGallery();

  if (allImages.length === 0) {
    console.warn('⚠️  Inga bilder hittades i gallery-mappen');
    return { categories: [] };
  }

  console.log(`📸 Hittade ${allImages.length} bilder`);

  // Gruppera bilder per kategori
  const categoriesMap = new Map();

  for (const image of allImages) {
    if (!categoriesMap.has(image.category)) {
      const metadata = CATEGORY_METADATA[image.category] || {
        name: image.category.charAt(0).toUpperCase() + image.category.slice(1),
        description: `Bilder från kategorin ${image.category}`
      };

      categoriesMap.set(image.category, {
        id: image.category,
        name: metadata.name,
        description: metadata.description,
        images: []
      });
    }

    // Lägg till bild-metadata
    const subcategoryMeta = SUBCATEGORY_METADATA[image.subcategory];
    const subcategoryName = subcategoryMeta?.name || image.subcategory;
    const categoryName = CATEGORY_METADATA[image.category]?.name || image.category;
    const displayName = `${categoryName} - ${subcategoryName} ${image.number}`;

    categoriesMap.get(image.category).images.push({
      filename: image.filename,
      category: image.category,
      subcategory: image.subcategory,
      number: image.number,
      displayName: displayName,
      path: `/images/gallery/${image.filename}`
    });
  }

  // Sortera bilder inom varje kategori (order från metadata, sedan nummer)
  for (const category of categoriesMap.values()) {
    category.images.sort((a, b) => {
      if (a.subcategory !== b.subcategory) {
        // Sortera efter order om den finns i metadata, annars alfabetiskt
        const orderA = SUBCATEGORY_METADATA[a.subcategory]?.order ?? 999;
        const orderB = SUBCATEGORY_METADATA[b.subcategory]?.order ?? 999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.subcategory.localeCompare(b.subcategory);
      }
      return a.number - b.number;
    });
  }

  const categories = Array.from(categoriesMap.values());

  // Lägg till "Alla bilder" kategori först
  categories.unshift({
    id: 'alla',
    name: 'Alla bilder',
    description: 'Alla bilder från Storegården 7',
    images: [...allImages]
      .sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        if (a.subcategory !== b.subcategory) {
          // Sortera efter order om den finns i metadata, annars alfabetiskt
          const orderA = SUBCATEGORY_METADATA[a.subcategory]?.order ?? 999;
          const orderB = SUBCATEGORY_METADATA[b.subcategory]?.order ?? 999;
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          return a.subcategory.localeCompare(b.subcategory);
        }
        return a.number - b.number;
      })
      .map(img => {
        const subcategoryMeta = SUBCATEGORY_METADATA[img.subcategory];
        const subcategoryName = subcategoryMeta?.name || img.subcategory;
        const categoryName = CATEGORY_METADATA[img.category]?.name || img.category;
        return {
          filename: img.filename,
          category: img.category,
          subcategory: img.subcategory,
          number: img.number,
          displayName: `${categoryName} - ${subcategoryName} ${img.number}`,
          path: `/images/gallery/${img.filename}`
        };
      })
  });

  const output = { categories };

  // Skriv till fil
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log(`✅ Genererade ${OUTPUT_FILE}`);
  console.log(`📊 ${categories.length} kategorier med totalt ${allImages.length} bilder:`);

  for (const category of categories) {
    console.log(`   📁 ${category.name}: ${category.images.length} bilder`);
  }

  return output;
}

// Kör alltid när filen importeras eller körs
generateGalleryCategories();

export default generateGalleryCategories;