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
    ctaLabel: "Utforska event",
  },
  {
    id: "mohippa",
    kicker: "Samla gruppen på gården",
    title: "Gruppdagar",
    description:
      "För möhippa, svensexa, teambuilding, afterwork och workshop – med lokal, hjälp på plats och kreativa tillval.",
    meta: "Lokal 10:00-22:00 · Tillval per aktivitet",
    route: "/gruppdagar",
    image: "/images/evenemang/slide10.webp",
    ctaLabel: "Planera er gruppdag",
  },
  {
    id: "skapande",
    kicker: "Ateljé och lera",
    title: "Kurser & skapande",
    description:
      "Målning, keramik, drejning och privata workshops för nybörjare, vänner, kollegor och kreativa grupper.",
    meta: "Målning · Keramik · Privata workshops",
    route: "/konst",
    image: "/images/portfolio/ann-2.webp",
    ctaLabel: "Se kurser",
  },
  {
    id: "kurser-heldagar",
    kicker: "Närvaro & återhämtning",
    title: "Yoga & heldagar",
    description:
      "Följ med på harmoniska heldagar med en härlig kombination av yoga, skapande, fika och vegetarisk lunch på gården.",
    meta: "Heldagar · Yoga · Lunch ingår",
    route: "/kurser",
    image: "/images/evenemang/heldag-paket.webp",
    ctaLabel: "Se heldagar",
  },
  {
    id: "galleri",
    kicker: "Bilder & inspiration",
    title: "Bildgalleri",
    description:
      "Kika in i vårt galleri för att se bilder från gården, ateljén, festdukningar och tidigare evenemang.",
    meta: "Foton · Inspiration · Ladan & loftet",
    route: "/galleri",
    image: "/images/event/hero/hero-2.webp",
    ctaLabel: "Utforska galleriet",
  },
  {
    id: "om-platsen",
    kicker: "Människorna bakom",
    title: "Om platsen & oss",
    description:
      "Lär känna Storegården 7, människorna bakom ateljén och hur den gamla gården blivit en plats för möten.",
    meta: "15 min från Lidköping · Ateljé · Gårdsbutik",
    route: "/om-oss",
    image: "/images/lokal/slide23.webp",
    ctaLabel: "Möt oss",
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
