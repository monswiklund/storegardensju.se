#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GALLERY_DIR = path.join(__dirname, '../public/images/gallery');
const OUTPUT_FILE = path.join(__dirname, '../src/data/galleryCategories.json');
const ORDER_FILE = path.join(__dirname, '../src/data/gallery-order.json');

// Kategori-metadata för displayNames
const CATEGORY_METADATA = {
  overvaning: {
    name: 'Loftet',
    description: 'Övre våningen på Storegården 7'
  },
  undervaning: {
    name: 'Ladan',
    description: 'Nedre våningen, kök och serviceområden'
  },
  ute: {
    name: 'Övrigt',
    description: 'Utemiljö och toaletter'
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

// Mapping från filnamn-kategori och subkategori till display-kategori
const CATEGORY_MAPPING = {
  lokal: {
    upper: 'overvaning',
    under: 'undervaning',
    kok: 'undervaning',
    service: 'undervaning',
    ute: 'ute',
    'ute-toa': 'ute'
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
 * Mappar från filnamns-kategori och subkategori till display-kategori
 */
function getMappedCategory(fileCategory, subcategory) {
  // Om vi har en mapping för denna kategori + subkategori, använd den
  if (CATEGORY_MAPPING[fileCategory]?.[subcategory]) {
    return CATEGORY_MAPPING[fileCategory][subcategory];
  }
  // Annars använd filnamns-kategorin direkt
  return fileCategory;
}

/**
 * Parsar filnamn enligt formatet: {kategori}-{subkategori}-{nummer}.{ext}
 * Exempel: lokal-kok-1.webp → { category: 'undervaning', subcategory: 'kok', number: 1 }
 */
function parseFilename(filename) {
  // Filnamn kan börja med "lokal", "evenemang", "konst-keramik" etc
  // Men vi mappar sedan till display-kategorier baserat på subkategori
  const knownFilePrefixes = ['lokal', 'evenemang', 'konst-keramik'];

  for (const prefix of knownFilePrefixes) {
    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^${escapedPrefix}-([a-z-]+)-(\\d+)\\.(webp|jpg|jpeg|png)$`, 'i');
    const match = filename.match(pattern);

    if (match) {
      const [, subcategory, numberStr, ext] = match;
      const mappedCategory = getMappedCategory(prefix, subcategory);

      return {
        filename,
        category: mappedCategory,
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
  if (!fs.existsSync(GALLERY_DIR)) {
    throw new Error(`Gallery-mappen finns inte: ${GALLERY_DIR}`);
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
}

/**
 * Läser manuell bildordning från gallery-order.json om den finns
 */
function loadManualOrder() {
  try {
    if (fs.existsSync(ORDER_FILE)) {
      const orderData = JSON.parse(fs.readFileSync(ORDER_FILE, 'utf8'));
      console.log('📌 Använder manuell ordning från gallery-order.json');
      return orderData;
    }
  } catch (error) {
    console.warn('⚠️  Kunde inte läsa gallery-order.json:', error.message);
  }
  return null;
}

/**
 * Sorterar bilder automatiskt (fallback när manuell ordning saknas)
 */
function automaticSort(images) {
  return images.sort((a, b) => {
    if (a.subcategory !== b.subcategory) {
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

/**
 * Sorterar bilder med manuell ordning om tillgänglig, annars automatisk
 */
function sortImages(images, categoryId, manualOrder) {
  // Om vi har manuell ordning för denna kategori, använd den
  if (manualOrder?.categories?.[categoryId]) {
    const order = manualOrder.categories[categoryId];
    const orderMap = new Map(order.map((filename, index) => [filename, index]));

    return [...images].sort((a, b) => {
      const orderA = orderMap.get(a.filename) ?? 999999;
      const orderB = orderMap.get(b.filename) ?? 999999;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // Fallback till automatisk sortering för bilder som inte finns i manuell ordning
      if (a.subcategory !== b.subcategory) {
        const subOrderA = SUBCATEGORY_METADATA[a.subcategory]?.order ?? 999;
        const subOrderB = SUBCATEGORY_METADATA[b.subcategory]?.order ?? 999;
        if (subOrderA !== subOrderB) {
          return subOrderA - subOrderB;
        }
        return a.subcategory.localeCompare(b.subcategory);
      }
      return a.number - b.number;
    });
  }

  // Fallback till automatisk sortering
  return automaticSort([...images]);
}

/**
 * Grupperar bilder per kategori och genererar metadata
 */
function generateGalleryCategories() {
  console.log('🔍 Skannar gallery-mappen...');

  const allImages = scanGallery();

  if (allImages.length === 0) {
    throw new Error('Inga giltiga bilder hittades i gallery-mappen');
  }

  console.log(`📸 Hittade ${allImages.length} bilder`);

  // Ladda manuell ordning om den finns
  const manualOrder = loadManualOrder();

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

  // Sortera bilder inom varje kategori med manuell ordning eller automatisk
  for (const category of categoriesMap.values()) {
    category.images = sortImages(category.images, category.id, manualOrder);
  }

  const categories = Array.from(categoriesMap.values());

  // Lägg till "Alla bilder" kategori först
  const allaSortedImages = sortImages([...allImages], 'alla', manualOrder);

  categories.unshift({
    id: 'alla',
    name: 'Alla bilder',
    description: 'Alla bilder från Storegården 7',
    images: allaSortedImages.map(img => {
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
