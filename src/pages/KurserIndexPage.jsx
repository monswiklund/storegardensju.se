import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ArrowUpRight,
  Calendar,
  MapPin,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { ScrollSpyNav, SectionDivider } from "../components";
import { CourseBand } from "../features/courses/CourseSections.jsx";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";
import {
  COURSE_LOCATION,
  MALERI_TRACK_ID,
  TRACKS,
  YOGA_TRACK_ID,
  formatPassDate,
  formatPassTime,
  nextPass,
} from "../data/courseEvents.js";
import "./KurserPages.css";

import yogaLoftImg from "/images/evenemang/yoga-loft.webp";
import maleriKursImg from "/images/evenemang/maleri-kurs.webp";

// /kurser was the yoga hub until the two subjects got a hub each. Links to its
// old anchors are out in the wild (and were the url of every Event object in the
// old structured data), so they are forwarded to the yoga hub rather than
// landing on an index page with no such section.
const LEGACY_YOGA_HASHES = new Set([
  "#kommande",
  "#kursdagen",
  "#om-lina",
  "#fragor-och-svar",
  "#hitta-hit",
  "#tidigare-pass",
  "#kontakt",
]);

const isLegacyYogaHash = (hash) =>
  hash.startsWith("#yoga-") || LEGACY_YOGA_HASHES.has(hash);

// One card per subject. Copy is written for the choice between them - the hubs
// carry the subject copy, and repeating it here would just make the three pages
// compete for the same query.
const HUBS = [
  {
    trackId: YOGA_TRACK_ID,
    image: yogaLoftImg,
    imageAlt: "Loftet på Storegården 7 dukat för yoga",
    heading: "Yoga på loftet",
    body: "Yoga i lugnt tempo på loftet. När det finns ett datum i kalendern är det drop-in, och yogamattor finns att låna.",
    cta: "Se yogan",
  },
  {
    trackId: MALERI_TRACK_ID,
    image: maleriKursImg,
    imageAlt: "Målarkurs i ateljén på Storegården 7",
    heading: "Måleri och keramik",
    body: "Akvarell, akryl, handbygge, ringling och drejning i gårdsateljén. Material och verktyg finns på plats - ta bara med kläder som får bli lite färg eller lera på.",
    cta: "Se kurserna i ateljén",
  },
];

// Same dash rail as the hubs. Stable reference: ScrollSpyNav keys its listener
// on the array.
const SPY_SECTIONS = [
  { id: "kurser-index-intro", label: "Start" },
  { id: "kurser-index-val", label: "Välj kurs" },
  { id: "grupper", label: "Grupper" },
];

const SPY_OFFSET = 130;

function KurserIndexPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useSeo(seoMeta.kurser);

  useEffect(() => {
    if (isLegacyYogaHash(location.hash)) {
      navigate(`${TRACKS[YOGA_TRACK_ID].hubPath}${location.hash}`, {
        replace: true,
      });
    }
  }, [location.hash, navigate]);

  return (
    <div className="kurser-page">
      <ScrollSpyNav sections={SPY_SECTIONS} offset={SPY_OFFSET} />

      <main id="main-content">
        <CourseBand
          id="kurser-index-intro"
          background="white"
          className="kurser-index__intro"
        >
          <div className="kurser-index__intro-copy">
            <span className="kurser-label">Kurser i Lidköping</span>
            <h1>Kurser på Storegården 7</h1>
            <p className="kurser-index__lead">
              Två sorters kurser på gården: yoga på loftet med{" "}
              {TRACKS[YOGA_TRACK_ID].instructor.name} och skapande i
              gårdsateljén med {TRACKS[MALERI_TRACK_ID].instructor.name}. Välj
              den du är intresserad av. Datum, priser och praktiska detaljer finns på
              respektive sida.
            </p>
            <ul className="kurser-index__facts">
              <li>
                <MapPin size={17} aria-hidden="true" />
                <span>
                  {COURSE_LOCATION.locality} — {COURSE_LOCATION.travelNote}
                </span>
              </li>
              <li>
                <Sparkles size={17} aria-hidden="true" />
                <span>Kurser för både nybörjare och vana</span>
              </li>
              <li>
                <Users size={17} aria-hidden="true" />
                <span>Privata kurser för grupper</span>
              </li>
            </ul>
          </div>
        </CourseBand>

        <SectionDivider above="white" below="alt" variant="wave" />

        <CourseBand id="kurser-index-val" background="alt">
          <div className="kurser-index__grid">
            {HUBS.map(({ trackId, image, imageAlt, heading, body, cta }) => {
              const track = TRACKS[trackId];
              const pass = nextPass(trackId);

              return (
                <Link
                  key={trackId}
                  className="kurser-index__card"
                  to={`${track.hubPath}/`}
                >
                  <div className="kurser-index__card-media">
                    <img src={image} alt={imageAlt} loading="lazy" />
                  </div>
                  <div className="kurser-index__card-body">
                    <span className="kurser-label">{track.label}</span>
                    <h2>{heading}</h2>
                    <p>{body}</p>
                    <ul className="kurser-index__card-meta">
                      <li>
                        <Calendar size={17} aria-hidden="true" />
                        <span>
                          {pass
                            ? `Nästa tillfälle: ${formatPassDate(pass)} kl ${formatPassTime(pass.startAt)}`
                            : "Inget fast datum just nu — hör av dig för nästa tillfälle"}
                        </span>
                      </li>
                      <li>
                        <User size={17} aria-hidden="true" />
                        <span>
                          {track.instructor.name} — {track.instructor.role}
                        </span>
                      </li>
                    </ul>
                    <span className="kurser-index__card-cta">
                      {cta}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </CourseBand>

        <SectionDivider above="alt" below="green" variant="hill" />

        {/* Group bookings are neither hub's subject but are what a fair share of
            course traffic is actually after, and the page already exists. */}
        <CourseBand id="grupper" background="green" className="kurser-details">
          <div className="kurser-details__container kurser-details__container--split-reverse">
            <div className="kurser-details__info">
              <span className="kurser-label">Grupper</span>
              <h2>Egen kurs för din grupp</h2>
              <p className="kurser-details__description">
                Möhippa, svensexa, teambuilding eller ett gäng vänner som vill
                göra något tillsammans? Vi håller kurser i måleri, keramik och
                yoga som privat bokning, med lokalen och fikat på gården.
              </p>
            </div>
            <div className="kurser-details__action">
              <div className="kurser-action-card">
                <h3>Gruppdagar</h3>
                <p>
                  Baspaket från 500 kr per person, lokalen är er 10:00-22:00.
                </p>
                <Link className="kurser-interest__link" to="/gruppdagar/">
                  Läs om gruppdagar
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </CourseBand>

        {/* Ends on green; the global contact section below is alt, so the colour
            change gets its own curve like every other one on the page. */}
        <SectionDivider above="green" below="alt" variant="valley" />
      </main>
    </div>
  );
}

export default KurserIndexPage;
