// Ann Wiklund's portfolio at /ann. The paintings were photographed on the studio wall and
// straightened; the files live in public/images/ann (NAME.webp ≤1800px, NAME-sm.webp ≤800px).
// Titles describe the motif until Ann gives her own; `details` (technique, size) shows when set.

export const ANN_EMAIL = "ann.wiklund.design@gmail.com";
export const ANN_INSTAGRAM = "https://www.instagram.com/annwiklundstudio/";

const image = (name, width, height) => ({
  src: `/images/ann/${name}.webp`,
  srcSmall: `/images/ann/${name}-sm.webp`,
  width,
  height,
});

// The first work opens the page; the rest hang on the wall in this order.
export const annWorks = [
  {
    id: "kolibri",
    title: "Kolibri och lupin",
    details: null,
    alt: "Målning av ett gulgrönt landskap med en kolibri vid en rosa lupin, signerad AnnW.",
    ...image("kolibri", 1800, 1334),
  },
  {
    id: "solvandet",
    title: "Kvinna i solen",
    details: null,
    alt: "Målning i guldram av en naken kvinna med armarna bakom huvudet i en äng med solrosor under en stor gul sol.",
    ...image("solvandet", 1376, 1800),
  },
  {
    id: "landskap-gra",
    title: "Sjö mellan bergen",
    details: null,
    alt: "Landskapsmålning i dova grå och gröna toner: berg, en stilla sjö och gröna kullar i förgrunden.",
    ...image("landskap-gra", 1415, 1800),
  },
  {
    id: "blommor-guld",
    title: "Blommor och guld",
    details: null,
    alt: "Mönstermålning med fyra gula blommor, lila slingor och guldkonturer mot en blågrå bakgrund.",
    ...image("blommor-guld", 1520, 1800),
  },
  {
    id: "fjall-litet",
    title: "Liten landskapsstudie",
    details: null,
    alt: "Liten målning i vit ram: ett lantligt landskap med en röd lada och mörka träd framför en kulle.",
    ...image("fjall-litet", 1800, 1778),
  },
  {
    id: "pumpa",
    title: "Stilleben med pumpa",
    details: null,
    alt: "Stillebensmålning med en ljusgrön pumpa, en rosa pelargon i vas och lila astrar.",
    ...image("pumpa", 1561, 1800),
  },
  {
    id: "dromrum",
    title: "Drömrum",
    details: null,
    alt: "Målning i ljus ram med drömlika motiv: en rosa fåtölj, tulpaner, en sköldpadda och blå slingor.",
    ...image("dromrum", 1446, 1800),
  },
];

// Photos of the studio as it is, not straightened.
export const annStudio = [
  {
    id: "kort-1",
    alt: "Hyllor i ateljén med Anns kort i akvarell och tusch: strutsar, kyrkor och slott.",
    ...image("kort-1", 1355, 1800),
  },
  {
    id: "smaverk",
    alt: "Små stilleben med krukor och frukt på en hylla i ateljén.",
    ...image("smaverk", 1355, 1800),
  },
  {
    id: "skissvagg",
    alt: "En vägg full av små akvareller och skisser med handskriven text.",
    ...image("skissvagg", 1355, 1800),
  },
  {
    id: "kort-2",
    alt: "Kortställ med Anns tecknade och målade kort.",
    ...image("kort-2", 1355, 1800),
  },
];

/** mailto link that names the work, so Ann knows which painting the question is about. */
export const askAboutWork = (work) =>
  `mailto:${ANN_EMAIL}?subject=${encodeURIComponent(`Fråga om verket "${work.title}"`)}`;
