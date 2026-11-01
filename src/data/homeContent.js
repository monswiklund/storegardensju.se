import { cdnAsset } from "../config/cdnAssets.js";
import CMS_CONTENT from "./cmsContent.generated.js";

// The first published piece in the build's CMS snapshot, so Ann's cards show her current work.
const firstWork = (works, keep = () => true) => {
  const image = works?.find((work) => work.image?.url && keep(work))?.image;
  return image && (image.sizes?.card?.url || image.sizes?.medium?.url || image.url);
};

export const heroContent = {
  title: "Välkommen till Storegården\xa07",
  subtitle: "En gård för fest, kurser och konst",
  paragraphs: [
    "Här i Rackeby, 15 minuter från Lidköping, driver vi Storegården 7 tillsammans.",
    "I ladan och på loftet ordnas bröllop, kalas och andra fester. I ateljén håller vi kurser i måleri.",
    "På gården finns också en liten butik med konst och keramik. Ibland har vi loppis, yoga och andra aktiviteter.",
  ],
  primaryCta: {
    label: "Kontakta oss",
    ariaLabel: "Scrolla till kontakt-sektionen",
  },
  secondaryCtas: [
    {
      label: "Se galleriet",
      to: "/galleri",
      type: "route",
      ariaLabel: "Gå till bildgalleri",
    },
    {
      label: "Hitta hit",
      href: "https://maps.google.com/?q=Storegården+7+Rackeby+Lidköping",
      type: "external",
      ariaLabel: "Öppna Google Maps för vägbeskrivning",
    },
  ],
};

export const services = [
  {
    id: "event",
    kicker: "Ladan och loftet",
    title: "Event",
    description:
      "Hyr gården för bröllop, företagsevent, födelsedagar eller andra tillställningar med långbord, bar och dansgolv.",
    meta: "Loft 150+ sittande · Lada 50+ sittande · Mingel 300+",
    route: "/event",
    image: cdnAsset("/images/event/hero/hero.webp"),
    ctaLabel: "Se event",
  },
  {
    id: "brollop",
    kicker: "En dag att minnas",
    title: "Bröllop",
    description:
      "Samla välkomstskål, middag och fest på samma gård. Ladan och loftet ger plats för både nära och många.",
    meta: "Middag · Mingel · Bar & dansgolv",
    route: "/event/brollop",
    image: cdnAsset("/images/event/hero/hero-2.webp"),
    ctaLabel: "Se bröllopslokalen",
  },
  {
    id: "gruppdagar",
    kicker: "Samla gruppen på gården",
    title: "Gruppdagar",
    description:
      "För möhippa, svensexa, teambuilding, afterwork och workshop. Lokal och hjälp på plats ingår, och ni väljer själva vilka aktiviteter ni vill lägga till.",
    meta: "Lokal 10:00-22:00 · Tillval per aktivitet",
    route: "/gruppdagar",
    image: cdnAsset("/images/evenemang/slide10.webp"),
    ctaLabel: "Planera er gruppdag",
  },
  {
    id: "fest",
    kicker: "Middag och dans",
    title: "Fest & företagsevent",
    description:
      "Fira födelsedag, jubileum, afterwork eller företagsfest i två flexibla våningar med plats för både middag och mingel.",
    meta: "Bar · Kök · Ljud · Dansgolv",
    route: "/event#event-amenities-section",
    image: cdnAsset("/images/event/hero/hero-3.webp"),
    ctaLabel: "Se festmöjligheterna",
  },
  {
    id: "kurser-konst",
    kicker: "Ateljén",
    title: "Måleri",
    description:
      "Kurser i måleri för både nybörjare och vana. Det går också att boka ateljén för en egen grupp.",
    meta: "Målning · Privata workshops",
    route: "/kurser/konst",
    image: cdnAsset("/images/konst-keramik/slide16.webp"),
    ctaLabel: "Se kurserna",
  },
  {
    id: "yoga",
    kicker: "På loftet",
    title: "Yoga",
    description:
      "Yoga i lugnt tempo på loftet med guidning, rörelse och vila. Passar både dig som är nybörjare och dig som yogat länge.",
    meta: "Loftet · Lugnt tempo · Mattor finns",
    route: "/kurser/yoga",
    image: cdnAsset("/images/evenemang/lina-yoga-header.jpg"),
    ctaLabel: "Se yogan",
  },
  {
    id: "ann",
    kicker: "Konstnären på gården",
    title: "Konst",
    description: "Målningar av Ann Wiklund, konstnär och keramiker med ateljé här på gården.",
    meta: "Målningar · Ateljé",
    route: "/ann",
    image:
      firstWork(CMS_CONTENT?.artworks, (work) => work.placement === "wall") ||
      cdnAsset("/images/portfolio/ann-2.webp"),
    ctaLabel: "Se målningarna",
  },
  {
    id: "keramik",
    kicker: "Från ateljén",
    title: "Keramik",
    description: "Handgjord keramik av Ann: skålar, koppar, vaser och skulpturer.",
    meta: "Skålar · Koppar · Vaser",
    route: "/ann/keramik",
    // Fallback: a shelf of Ann's bowls, for builds without the CMS snapshot.
    image:
      firstWork(CMS_CONTENT?.ceramics) ||
      "https://media.storegardensju.se/keramik/keramik-a35e8aff2ef93bfe14c6c4bc866f6a7d27a82f99754be336baa4f2c8790c26eb-900x1200.webp",
    ctaLabel: "Se keramiken",
  },
];

export const venueIntro = {
  title: "Om platsen",
  description:
    "Storegården 7 ligger i Rackeby, 15 minuter från Lidköpings centrum. Här finns en renoverad lada med loft, en ateljé och en gårdsbutik, med gott om plats både inne och ute.",
  highlights: [],
};

export const featuredGalleryImages = [
  { src: cdnAsset("/images/event/hero/hero.webp"), alt: "Evenemang" },
];
