# Bildgalleri-system

## Översikt

Detta projekt använder ett flexibelt bildgallerisystem som baseras på beskrivande filnamn istället för generiska nummer. Systemet är byggt för att vara enkelt att utöka och underhålla.

## Filnamnskonvention

Alla bilder följer detta format:
```
{kategori}-{subkategori}-{nummer}.{ext}
```

### Exempel
```
lokal-kok-1.webp          → Lokal, Kök, bild 1
lokal-under-5.webp        → Lokal, Nedre våning, bild 5
lokal-ute-toa-1.webp      → Lokal, Toaletter, bild 1
evenemang-konsert-3.webp  → Evenemang, Konsert, bild 3
```

### Stödda format
- `.webp` (rekommenderat för bästa prestanda)
- `.jpg` / `.jpeg`
- `.png`

## Mappstruktur

Alla bilder läggs i en enda mapp:
```
public/
  images/
    gallery/
      lokal-kok-1.webp
      lokal-kok-2.webp
      lokal-under-1.webp
      evenemang-konsert-1.webp
      ...
```

Detta gör det enkelt att hantera alla bilder på ett ställe.

## Hur man lägger till nya bilder

### 1. Döp bilden enligt konventionen
```bash
# Exempel: Lägga till en ny bild från köket
lokal-kok-5.webp
```

### 2. Placera bilden i gallery-mappen
```bash
cp min-nya-bild.webp public/images/gallery/lokal-kok-5.webp
```

### 3. Regenerera galleri-metadata
```bash
npm run build:gallery
```

Detta scannar automatiskt alla bilder och uppdaterar `src/data/galleryCategories.json`.

### 4. Kontrollera resultatet
```bash
npm run dev
# Navigera till /galleri i browsern
```

## Hur man ändrar ordning på bilder

Ordningen styrs av **filnamnet**:

### Sorteringsregler
1. **Kategori** (alfabetisk): `evenemang` → `lokal` → `konst-keramik`
2. **Subkategori** (alfabetisk): `kok` → `service` → `under` → `upper` → `ute`
3. **Nummer** (numerisk): `1` → `2` → `3` ...

### Exempel: Ändra ordning

**Nuvarande ordning:**
```
lokal-kok-1.webp
lokal-kok-2.webp
lokal-kok-3.webp
```

**Vill flytta bild 3 till position 1:**
```bash
# Byt namn på filerna
mv public/images/gallery/lokal-kok-1.webp public/images/gallery/lokal-kok-1-temp.webp
mv public/images/gallery/lokal-kok-3.webp public/images/gallery/lokal-kok-1.webp
mv public/images/gallery/lokal-kok-1-temp.webp public/images/gallery/lokal-kok-3.webp

# Regenerera metadata
npm run build:gallery
```

**Tips:** Du behöver inte ha alla nummer i sekvens. `lokal-kok-1.webp`, `lokal-kok-5.webp`, `lokal-kok-10.webp` fungerar utmärkt!

## Kategorier och subkategorier

### Befintliga kategorier

Definierade i `scripts/generate-gallery-categories.js`:

```javascript
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
```

### Befintliga subkategorier

```javascript
const SUBCATEGORY_METADATA = {
  kok: 'Kök',
  service: 'Serviceområde',
  under: 'Nedre våning',
  upper: 'Övre våning',
  ute: 'Utemiljö',
  'ute-toa': 'Toaletter'
};
```

### Lägga till ny kategori

**1. Uppdatera `CATEGORY_METADATA`:**
```javascript
// scripts/generate-gallery-categories.js
const CATEGORY_METADATA = {
  lokal: { ... },
  evenemang: { ... },
  'konst-keramik': { ... },
  utställning: {  // NY KATEGORI
    name: 'Utställningar',
    description: 'Utställningar på Storegården 7'
  }
};
```

**2. Lägg till bilder med nya kategorin:**
```
public/images/gallery/utställning-vår-1.webp
public/images/gallery/utställning-vår-2.webp
```

**3. Regenerera:**
```bash
npm run build:gallery
```

### Lägga till ny subkategori

**1. (Valfritt) Uppdatera `SUBCATEGORY_METADATA` för vackrare namn:**
```javascript
// scripts/generate-gallery-categories.js
const SUBCATEGORY_METADATA = {
  kok: 'Kök',
  // ... befintliga ...
  utomhus: 'Utomhusområde'  // NY SUBKATEGORI
};
```

**2. Lägg till bilder med nya subkategorin:**
```
public/images/gallery/lokal-utomhus-1.webp
```

**3. Regenerera:**
```bash
npm run build:gallery
```

**OBS:** Subkategorier utan metadata fungerar också! Systemet genererar automatiskt ett läsbart namn (första bokstaven stor).

## Hur systemet fungerar

### 1. Build-process

När du kör `npm run build:gallery`:

1. **Scannar** `public/images/gallery/` för bilder
2. **Parsar** varje filnamn enligt mönstret `{kategori}-{subkategori}-{nummer}.{ext}`
3. **Grupperar** bilder per kategori
4. **Sorterar** bilder (kategori → subkategori → nummer)
5. **Genererar** `src/data/galleryCategories.json` med metadata

### 2. JSON-struktur

```json
{
  "categories": [
    {
      "id": "alla",
      "name": "Alla bilder",
      "description": "Alla bilder från Storegården 7",
      "images": [
        {
          "filename": "lokal-kok-1.webp",
          "category": "lokal",
          "subcategory": "kok",
          "number": 1,
          "displayName": "Lokal - Kök 1",
          "path": "/images/gallery/lokal-kok-1.webp"
        }
      ]
    },
    {
      "id": "lokal",
      "name": "Lokal",
      "images": [ ... ]
    }
  ]
}
```

### 3. React-komponenten

`ImageGallery.jsx` läser JSON-filen och renderar:
- **Thumbnail grid** (Masonry layout)
- **Kategorifilter** (tabs)
- **Lightbox** (custom implementation)

## Användning

### Visa alla bilder
```javascript
// Default state
activeCategory = 'alla'
```

### Filtrera på kategori
```javascript
// Klicka på kategori-tab
activeCategory = 'lokal'  // Visar bara lokal-bilder
```

### Expandera galleriet
```javascript
// Initial: 6 bilder visas
// Klick på "Visa alla bilder (26)" → Alla bilder visas
```

## Tips och tricks

### Bästa filformat
Använd **WebP** för bästa prestanda:
```bash
# Konvertera JPG till WebP
cwebp -q 80 input.jpg -o lokal-kok-1.webp
```

### Bulk-omdöpning
Om du vill byta namn på flera bilder:
```bash
# macOS/Linux
for i in {1..10}; do
  mv "slide$i.jpg" "lokal-kok-$i.webp"
done
```

### Verifiera filnamn
Innan du regenerar, kontrollera att alla filnamn är korrekta:
```bash
ls public/images/gallery/ | grep -v "^[a-z-]*-[a-z-]*-[0-9]*\.(webp|jpg|png)$"
```

### Se vad som parsas
Kör build:gallery för att se output:
```bash
npm run build:gallery
# Output:
# 🔍 Skannar gallery-mappen...
# 📸 Hittade 26 bilder
# ✅ Genererade .../galleryCategories.json
# 📊 2 kategorier med totalt 26 bilder:
#    📁 Alla bilder: 26 bilder
#    📁 Lokal: 26 bilder
```

## Troubleshooting

### Problem: "Kunde inte parsa filnamn: X"

**Orsak:** Filnamnet följer inte konventionen.

**Lösning:**
1. Kontrollera formatet: `{kategori}-{subkategori}-{nummer}.{ext}`
2. Se till att kategorin finns i `CATEGORY_METADATA`
3. Kontrollera att filnamnet är lowercase (små bokstäver)

### Problem: Bilder visas inte i browsern

**Lösning:**
1. Kontrollera att `npm run build:gallery` kördes utan fel
2. Verifiera att `src/data/galleryCategories.json` uppdaterades
3. Kontrollera att bildfilerna finns i `public/images/gallery/`
4. Starta om dev server: `npm run dev`

### Problem: Ordningen är fel

**Lösning:**
- Kom ihåg: Sortering är alfabetisk för subkategorier!
- `kok` < `service` < `under` < `upper` < `ute` (alfabetisk ordning)
- Om du vill annan ordning, byt namn på subkategorier eller använd prefix: `1-kok`, `2-service`

### Problem: Kategori saknas i filter

**Lösning:**
1. Lägg till kategorin i `CATEGORY_METADATA`
2. Kör `npm run build:gallery`
3. Kontrollera att minst en bild med den kategorin finns

## Workflow: Lägga till event-bilder

**Scenario:** Du vill lägga till bilder från ett event.

```bash
# 1. Förbered bilder (konvertera till WebP om möjligt)
cwebp -q 80 event1.jpg -o evenemang-julmarknad-1.webp
cwebp -q 80 event2.jpg -o evenemang-julmarknad-2.webp

# 2. Flytta till gallery
mv evenemang-*.webp public/images/gallery/

# 3. Regenerera
npm run build:gallery

# 4. Verifiera lokalt
npm run dev
# Navigera till http://localhost:5173/galleri

# 5. Commit och deploy
git add .
git commit -m "Add julmarknad event images"
npm run deploy
```

## Framtida förbättringar

Möjliga tillägg till systemet:

- **Datum i filnamn:** `lokal-kok-20250307-1.webp` för kronologisk sortering
- **Metadata-fil:** JSON-fil per bild med titel, fotograf, tags
- **Auto-thumbnails:** Generera automatiskt optimerade thumbnails
- **Subkategori-filter:** Filtrera på både kategori och subkategori
- **Lazy load optimization:** Progressiv bildladdning

## Kontakt

Vid frågor eller problem, kontakta utvecklaren eller öppna ett issue i projektet.

---

**Senast uppdaterad:** 2025-10-07
