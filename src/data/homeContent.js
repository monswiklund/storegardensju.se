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

export const upcomingEvents = [];

export const pastEvents = [
  {
    title: "Julmarknad",
    date: "13 December 2025",
    time: "10:00 - 18:00",
    description: "",
    artists: "",
    spots: "Fri entré",
    location: "Storegården 7, Rackeby",
    links: [
      {
        href: "https://www.facebook.com/groups/3216106561976652/",
        label: "→ Skapande Hörnan",
      },
      {
        href: "https://www.instagram.com/annwiklundstudio/",
        label: "→ Ann Wiklund Studio",
      },
      {
        href: "https://maps.google.com/?q=Storegården+7+Rackeby+Lidköping",
        label: "Hitta hit",
      },
    ],
    image: {
      src: "/images/evenemang/2025/julmarknad-2025.webp",
      alt: "Affisch för Julmarknad på Storegården 7",
    },
  },
  {
    title: "Konstafton 2025",
    date: "1 November 2025",
    time: "12:00 - 24:00",
    description:
      "En plats för kreativitet och nöje. Vi öppnar upp dörrarna till ateljén, keramikbutiken och vår eventlokal med utställning på loftet. Vi bjuder in alla för inspiration, skapande och en upplevelse kring gården.",
    artists: "Ann - Keramik & Måleri, Lina - Digital design & Måleri",
    spots: "Fri entré",
    link: "https://konstafton.se/",
    linkLabel: "Läs mer på konstafton.se",
    location: "Storegården 7, Rackeby",
    image: {
      src: "/images/evenemang//konstafton/konstafton-2025.webp",
      alt: "Affisch och besökare på Konstafton i Storegården 7",
    },
  },
  {
    title: "Västra Kållands Kulturrunda",
    date: "29 Maj 2024",
    time: "10:00 - 17:00",
    description:
      "Kom och häng på Storegården 7, ta en kaffe i solen, gå in i Ann's ateljé med konst över hela väggarna, fynda på loppisen och ta ett djupt andetag på denna drömmiga plats!",
    location: "Storegården 7, Rackeby",
  },
  {
    title: "Helgkurs Keramik",
    date: "22-23 November 2024",
    time: "17:00 - 21:00\n10:00 - 16:00",
    description:
      "Både för nybörjare och dig som provat tidigare. Tillkommer ett glaseringstillfälle.",
    location: "Skaparverkstaden, Rörstrand, Lidköping",
  },
  {
    title: "Helgkurs Keramik",
    date: "7-8 November 2024",
    time: "17:00-21:00\n10:00-16:00",
    description:
      "Både för nybörjare och dig som provat tidigare. Tillkommer ett glaseringstillfälle.",
    location: "Skaparverkstaden, Rörstrand, Lidköping",
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
