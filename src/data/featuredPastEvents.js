import { cdnAsset } from "../config/cdnAssets.js";

export const COURSE_DAY_EVENT = {
  id: "heldag-yoga-maleri-2026-07-13",
  title: "Heldag med yoga & måleri",
  startAt: "2026-07-13T10:00:00+02:00",
  endAt: "2026-07-13T17:30:00+02:00",
  description:
    "Den 13 juli hade vi yoga med Lina och måleri med Ann på Storegården 7. Under dagen åt vi också lunch och fikade tillsammans.",
  moments: [
    {
      time: "Kl 10:00",
      title: "Välkommen",
      description:
        "Lina Wiklund tar emot på gården. Det finns tid att rulla ut mattan och göra sig i ordning innan yogan börjar.",
      tone: "yoga",
    },
    {
      time: "Kl 10:30–12:00",
      title: "Yoga",
      description:
        "Yogapass lett av Lina Wiklund. Fokus på andning, närvaro och rörelse. Passar både nybörjare och vana utövare.",
      tone: "yoga",
    },
    {
      time: "Kl 12:00–13:30",
      title: "Gemensam lunch",
      description:
        "Vi äter vegetarisk lunch tillsammans på gården och tar en paus innan eftermiddagens målarkurs.",
      tone: "creative",
    },
    {
      time: "Kl 13:30–17:30",
      title: "Målarkurs",
      description:
        "Kreativ målarkurs ledd av Ann Wiklund. Vi gör roliga, prestationsfria uppvärmningsövningar och målar fritt med akvarell och akryl.",
      tone: "creative",
    },
    {
      time: "Kl 17:30",
      title: "Fika och avslutning",
      description: "Vi avslutar dagen med hembakat fika, kaffe och te.",
      tone: "creative",
    },
  ],
  location: "Storegården 7, Rackeby",
  links: [
    {
      href: "/kurser/yoga",
      label: "Yoga",
    },
    {
      href: "/kurser/konst",
      label: "Målarkurs",
    },
  ],
  images: [
    {
      url: cdnAsset("/images/evenemang/yoga-loft.webp"),
      alt: "Yoga på loftet på Storegården 7",
    },
    {
      url: cdnAsset("/images/evenemang/maleri-kurs.webp"),
      alt: "Målarkurs på Storegården 7",
    },
    {
      url: cdnAsset("/images/evenemang/heldag-paket.webp"),
      alt: "Heldag med yoga och måleri på Storegården 7",
    },
  ],
};

export const FEATURED_PAST_EVENTS_BY_ID = {
  [COURSE_DAY_EVENT.id]: COURSE_DAY_EVENT,
};
