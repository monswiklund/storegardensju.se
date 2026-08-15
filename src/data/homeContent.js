import { cdnAsset } from "../config/cdnAssets.js";

export const heroContent = {
  title: "Välkommen till Storegården\xa07",
  subtitle: "En gård för fest, kurser och konst",
  paragraphs: [
    "Här i Rackeby, 15 minuter från Lidköping, driver vi Storegården 7 tillsammans.",
    "I ladan och på loftet ordnas bröllop, kalas och andra fester. I ateljén håller vi kurser i måleri och keramik.",
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
    kicker: "Ateljé och lera",
    title: "Måleri & keramik",
    description:
      "Kurser i måleri, keramik och drejning för både nybörjare och vana. Det går också att boka ateljén för en egen grupp.",
    meta: "Målning · Keramik · Privata workshops",
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

export const creationContent = {
  title: "Måleri och keramik",
  sections: [
    {
      heading: "Prova måleri eller keramik",
      body: [
        "I ateljén håller Ann kurser i måleri och keramik. Du får hjälp under hela passet och behöver inte ha provat tidigare.",
      ],
    },
    {
      heading: "Kurser och workshops",
      body: [
        "Du kan boka en plats på en kurs i måleri, keramik eller drejning. Vi tar också emot privata grupper, till exempel kompisgäng, kollegor, möhippor och svensexor.",
      ],
    },
    {
      heading: "Utställningar",
      body: [
        "I ladan ordnar vi ibland utställningar och loppisar. Hör av dig om du vill ställa ut egen konst eller har en idé som skulle passa här.",
      ],
    },
  ],
  offerings: [
    "Målningskurser i olika tekniker",
    "Keramik och lerarbete",
    "Workshops för alla nivåer",
    "Privata kurser och teambuilding",
  ],
};
