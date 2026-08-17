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
import {
  ExploreMoreSection,
  ScrollSpyNav,
  SectionDivider,
} from "../components";
import { CourseBand } from "../features/courses/CourseSections.jsx";
import { useSeo } from "../hooks/useSeo.js";
import usePageCopy, { useSiteCopy } from "../hooks/usePageCopy.js";
import usePageMedia from "../hooks/usePageMedia.js";
import { seoMeta } from "../config/seoMeta.js";
import { cdnAsset } from "../config/cdnAssets.js";
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

const yogaLoftImg = cdnAsset("/images/evenemang/yoga-loft.webp");
const maleriKursImg = cdnAsset("/images/evenemang/maleri-kurs.webp");

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
  },
  {
    trackId: MALERI_TRACK_ID,
    image: maleriKursImg,
  },
];

const SPY_OFFSET = 130;

function KurserIndexPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const copy = usePageCopy("courses");
  const siteCopy = useSiteCopy();
  const media = usePageMedia("courses");

  const spySections = [
    { id: "kurser-index-intro", label: siteCopy("nav.start") },
    { id: "kurser-index-val", label: siteCopy("courses.courses-label") },
    { id: "grupper", label: siteCopy("courses.groups-label") },
  ];

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
      <ScrollSpyNav sections={spySections} offset={SPY_OFFSET} />

      <main id="main-content">
        <CourseBand
          id="kurser-index-intro"
          background="white"
          className="kurser-index__intro"
        >
          <div className="kurser-index__intro-copy" data-cms-hero data-cms-hero-content>
            <span className="kurser-label">
              {copy("hero.eyebrow")}
            </span>
            <h1>{copy("hero.title")}</h1>
            <p className="kurser-index__lead">
              {copy("hero.lead")}
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
                <span>
                  {copy("hero.fact-level")}
                </span>
              </li>
              <li>
                <Users size={17} aria-hidden="true" />
                <span>{copy("hero.fact-groups")}</span>
              </li>
            </ul>
          </div>
        </CourseBand>

        <SectionDivider above="white" below="alt" variant="wave" />

        <CourseBand id="kurser-index-val" background="alt">
          <div className="kurser-index__grid">
            {HUBS.map(({ trackId, image }, index) => {
              const track = TRACKS[trackId];
              const pass = nextPass(trackId);
              const hubImage = media(index === 0 ? "hubs.yoga" : "hubs.art", image, "card");

              return (
                <Link
                  key={trackId}
                  className="kurser-index__card"
                  to={`${track.hubPath}/`}
                >
                  <div className="kurser-index__card-media">
                    {hubImage && <img src={hubImage} alt="" loading="lazy" />}
                  </div>
                  <div className="kurser-index__card-body">
                    <span className="kurser-label">{track.label}</span>
                    <h2>{copy(`hubs.${index}.title`)}</h2>
                    <p>{copy(`hubs.${index}.body`)}</p>
                    <ul className="kurser-index__card-meta">
                      <li>
                        <Calendar size={17} aria-hidden="true" />
                        <span>
                          {pass
                            ? `${copy("hubs.next-pass-prefix") || "Nästa tillfälle:"} ${formatPassDate(pass)} kl ${formatPassTime(pass.startAt)}`
                            : copy("hubs.no-pass-text")}
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
                      {copy(`hubs.${index}.cta`)}
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
              <span className="kurser-label">
                {copy("groups.eyebrow")}
              </span>
              <h2>{copy("groups.title")}</h2>
              <p className="kurser-details__description">
                {copy("groups.body")}
              </p>
            </div>
            <div className="kurser-details__action">
              <div className="kurser-action-card">
                <h3>{copy("groups.card-title")}</h3>
                <p>
                  {copy("groups.card-body")}
                </p>
                <Link className="kurser-interest__link" to="/gruppdagar/">
                  {copy("groups.cta")}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </CourseBand>

        {/* Ends on green; the global contact section below is alt, so the colour
            change gets its own curve like every other one on the page. */}
        <SectionDivider above="green" below="alt" variant="valley" />

        <ExploreMoreSection
          id="kurser-explore-more"
          eyebrow={copy("explore.eyebrow")}
          title={copy("explore.title")}
          intro={copy("explore.body")}
          background="alt"
          items={[
            {
              to: "/kurser/yoga/",
              eyebrow: copy("explore.items.0.eyebrow"),
              title: copy("explore.items.0.title"),
              text: copy("explore.items.0.body"),
            },
            {
              to: "/kurser/konst/",
              eyebrow: copy("explore.items.1.eyebrow"),
              title: copy("explore.items.1.title"),
              text: copy("explore.items.1.body"),
            },
            {
              to: "/gruppdagar/",
              eyebrow: copy("explore.items.2.eyebrow"),
              title: copy("explore.items.2.title"),
              text: copy("explore.items.2.body"),
              featured: true,
            },
          ]}
        />
      </main>
    </div>
  );
}

export default KurserIndexPage;
