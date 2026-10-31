// Ann Wiklund's portfolio at /ann. The paintings were photographed on the studio wall and
// straightened; the files live in public/images/ann (NAME.webp ≤1800px, NAME-sm.webp ≤800px).
// `details` (technique, size) shows under the title when set.

export const ANN_EMAIL = "ann.wiklund.design@gmail.com";
export const ANN_INSTAGRAM = "https://www.instagram.com/annwiklundstudio/";

const image = (name, width, height) => ({
  src: `/images/ann/${name}.webp`,
  srcSmall: `/images/ann/${name}-sm.webp`,
  width,
  height,
});

// The first work opens the page; the rest hang on the wall in this order, in rows of three
// large works and three small ones (`size: "small"`; "narrow" for a tall, thin canvas).
// Titles and technique read from the labels beside a work are Ann's own; the rest describe the motif.
export const annWorks = [
  {
    id: "kolibri",
    title: "Kolibri och lupin",
    alt: "Målning av ett gulgrönt landskap med en kolibri vid en rosa lupin, signerad AnnW.",
    ...image("kolibri", 1800, 1334),
  },
  {
    id: "trollslanda",
    title: "Trollslända",
    alt: "Målning av en stor blå trollslända med genomskinliga vingar mot mörkgröna och lila fält.",
    ...image("trollslanda", 1452, 1800),
  },
  {
    id: "landskap-gra",
    title: "Sjö mellan bergen",
    alt: "Landskapsmålning i dova grå och gröna toner: berg, en stilla sjö och gröna kullar i förgrunden.",
    ...image("landskap-gra", 1415, 1800),
  },
  {
    id: "pafagel",
    title: "Påfågel",
    alt: "Målning av en blå påfågel med utfälld stjärt i guld och grönt mot en ljusblå och gul bakgrund.",
    ...image("pafagel", 1800, 1800),
  },
  {
    id: "fjall-litet",
    title: "Liten landskapsstudie",
    size: "small",
    alt: "Liten målning i vit ram: ett lantligt landskap med en röd lada och mörka träd framför en kulle.",
    ...image("fjall-litet", 1800, 1778),
  },
  {
    id: "pumpa",
    title: "Stilleben med pumpa",
    size: "small",
    alt: "Stillebensmålning med en ljusgrön pumpa, en rosa pelargon i vas och lila astrar.",
    ...image("pumpa", 1561, 1800),
  },
  {
    id: "tukan",
    title: "Tukan",
    size: "small",
    alt: "Liten målning av en tukan på en gren med palmer och lila kullar i bakgrunden.",
    ...image("tukan", 972, 960),
  },
  {
    id: "kaffe-i-det-grona",
    title: "Kaffe i det gröna",
    details: "Akryl",
    alt: "Målning av sju kvinnor utan ansiktsdrag som dricker kaffe kring en vit duk i gräset.",
    ...image("kaffe-i-det-grona", 1800, 1379),
  },
  {
    id: "ornen",
    title: "Örnen har landat",
    details: "Akryl",
    alt: "Målning i grått och brunt av en örn som landar med utbredda vingar mot en smal ljusblå himmel.",
    ...image("ornen", 1544, 1800),
  },
  {
    id: "blommor-guld",
    title: "Blommor och guld",
    alt: "Mönstermålning med fyra gula blommor, lila slingor och guldkonturer mot en blågrå bakgrund.",
    ...image("blommor-guld", 1520, 1800),
  },
  {
    id: "blasippor",
    title: "Blåsippor",
    size: "narrow",
    alt: "Smal, hög målning med fyra stora blåsippor mot en grön bakgrund.",
    ...image("blasippor", 625, 1800),
  },
  {
    id: "akvarell-blommor",
    title: "Blå blommor",
    size: "small",
    alt: "Inramad bild med passepartout: blå och gröna blommor och slingor med orange detaljer.",
    ...image("akvarell-blommor", 1790, 1800),
  },
  {
    id: "dromrum",
    title: "Drömrum",
    size: "small",
    alt: "Målning i ljus ram med drömlika motiv: en rosa fåtölj, tulpaner, en sköldpadda och blå slingor.",
    ...image("dromrum", 1446, 1800),
  },
  {
    id: "lotus-krona",
    title: "Krona och lotus",
    alt: "Abstrakt målning i blått med en blå lotusblomma på lång stjälk, en gyllene krona och en fågel högst upp.",
    ...image("lotus-krona", 1308, 1800),
  },
  {
    id: "landskap-berg",
    title: "Landskap",
    details: "Akryl",
    alt: "Landskapsmålning med böljande berg och kullar i blått, lila, grönt och ockra.",
    ...image("landskap-berg", 1493, 1800),
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
