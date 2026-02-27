export const heroContent = {
  title: "Välkommen till Storegården\xa07",
  subtitle: "En plats för kreativt nöje!",
  paragraphs: [
    "En ständigt växande plats där tanken är att det ska finnas något för alla.",
    "Hyr vår fina lokal till att anordna kalas, bröllop, eller fest.",
    "Konstnärliga kurser i att måla och att skapa med keramik.",
    "Loppis har vi även emellanåt och det finns en gårdsbutik med konst, keramik och en ateljé för inspiration.",
  ],
  primaryCta: {
    label: "Boka ditt evenemang",
    ariaLabel: "Scrolla till kontakt-sektion",
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
    title: "Event, Bröllop & Fest",
    description: "Boka lokalen för ditt nästa evenemang",
    route: "/event",
    image: "/images/lokal/slide22.jpg",
  },
  {
    id: "skapande",
    title: "Kurser & Skapande",
    description: "Kreativa workshops i en inspirerande miljö",
    route: "/konst",
    image: "/images/portfolio/ann-2.webp",
  },
];

export const venueIntro = {
  title: "Om platsen",
  description:
    "Storegården 7 ligger bara 15 minuter utanför Lidköpings centrum i en lantlig omgivning, långt från stadens brus. En plats där dina gäster kan koppla av och uppleva något unikt. Vi har tagit vara på den gamla gårdens charm och kombinerat den med moderna bekvämligheter.",
  highlights: [],
};

export const featuredGalleryImages = [
  { src: "/images/event/hero/hero.webp", alt: "Evenemang" },
];

export const creationContent = {
  title: "Skapande - Målning & Lera",
  sections: [
    {
      heading: "Kreativa workshops i inspirerande miljö",
      body: [
        "Upptäck din kreativa sida med våra kurser i målning och keramik. I vår ljusa och välkomnande lokal får du skapa konst under professionell guidning – oavsett om du är nybörjare eller mer erfaren.",
      ],
    },
    {
      heading: "Kurser & Workshops",
      body: [
        "Hos oss kan du fördjupa dig i keramik, målning och drejning. Boka en plats för dig själv – eller upplev skapandet tillsammans med vänner, kollegor, på en möhippa eller svensexa.",
      ],
    },
    {
      heading: "Utställningar",
      body: [
        "I vår charmiga ladugård arrangerar vi även utställningar. Här kan du visa upp ditt eget skapande, ordna en loppis eller inspireras av andras konst. Kontakta oss för mer information.",
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
