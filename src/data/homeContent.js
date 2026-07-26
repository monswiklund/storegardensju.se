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
    id: "event-fest",
    kicker: "Ladan och loftet",
    title: "Event & fest",
    description:
      "Hyr gården för bröllop, företagsevent, födelsedagar eller en kväll med långbord, bar och dansgolv.",
    meta: "Loft 150+ sittande · Lada 50+ sittande · Mingel 300+",
    route: "/event",
    image: "/images/event/hero/hero.webp",
    ctaLabel: "Se eventlokalen",
  },
  {
    id: "mohippa",
    kicker: "Samla gruppen på gården",
    title: "Gruppdagar",
    description:
      "För möhippa, svensexa, teambuilding, afterwork och workshop. Lokal och hjälp på plats ingår, och ni väljer själva vilka aktiviteter ni vill lägga till.",
    meta: "Lokal 10:00-22:00 · Tillval per aktivitet",
    route: "/gruppdagar",
    image: "/images/evenemang/slide10.webp",
    ctaLabel: "Planera er gruppdag",
  },
  {
    id: "skapande",
    kicker: "Ateljé och lera",
    title: "Måleri & keramik",
    description:
      "Kurser i måleri, keramik och drejning för både nybörjare och vana. Det går också att boka ateljén för en egen grupp.",
    meta: "Målning · Keramik · Privata workshops",
    route: "/kurser/konst",
    image: "/images/portfolio/ann-2.webp",
    ctaLabel: "Se kurser",
  },
  {
    id: "kurser-heldagar",
    kicker: "På loftet",
    title: "Yoga & heldagar",
    description:
      "Yoga i lugnt tempo på loftet och heldagar där yoga varvas med måleri, fika och vegetarisk lunch.",
    meta: "Heldagar · Yoga · Lunch ingår",
    route: "/kurser/yoga",
    image: "/images/evenemang/heldag-paket.webp",
    ctaLabel: "Se heldagar",
  },
  {
    id: "galleri",
    kicker: "Se gården",
    title: "Bildgalleri",
    description:
      "Kika in i vårt galleri för att se bilder från gården, ateljén, festdukningar och tidigare evenemang.",
    meta: "Foton · Inspiration · Ladan & loftet",
    route: "/galleri",
    image: "/images/event/hero/hero-2.webp",
    ctaLabel: "Se bilderna",
  },
  {
    id: "om-platsen",
    kicker: "Människorna bakom",
    title: "Om platsen & oss",
    description:
      "Läs om oss som driver Storegården 7 och om vad som finns här på gården.",
    meta: "15 min från Lidköping · Ateljé · Gårdsbutik",
    route: "/om-oss",
    image: "/images/lokal/slide23.webp",
    ctaLabel: "Möt oss",
  },
];

export const venueIntro = {
  title: "Om platsen",
  description:
    "Storegården 7 ligger i Rackeby, 15 minuter från Lidköpings centrum. Här finns en renoverad lada med loft, en ateljé och en gårdsbutik, med gott om plats både inne och ute.",
  highlights: [],
};

export const featuredGalleryImages = [
  { src: "/images/event/hero/hero.webp", alt: "Evenemang" },
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
