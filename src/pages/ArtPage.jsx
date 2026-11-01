import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, MapPin } from "lucide-react";
import { ExploreMore, ScrollSpyNav, SectionDivider } from "../components";
import { smoothScrollTo } from "../utils/scrollUtils.js";
import { canonicalPath } from "../config/routes.js";
import {
  COURSE_CONTACT_ID,
  ContactSection,
  FaqSection,
  InstructorSection,
  PassSection,
  PastPassesSection,
  goToCourseContact,
} from "../features/courses/CourseSections.jsx";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta, activeJsonLd } from "../config/seoMeta.js";
import useCmsSchedule from "../hooks/useCmsSchedule.js";
import useArtworks, { useCeramics } from "../hooks/useArtworks.js";
import { ceramicImageProps } from "../data/ceramics.js";
import usePageCopy, { useSiteCopy } from "../hooks/usePageCopy.js";
import usePageMedia from "../hooks/usePageMedia.js";
import usePageLists from "../hooks/usePageLists.js";
import {
  COURSE_LOCATION,
  MALERI_TRACK_ID,
  TRACKS,
  groupSeries,
  hubFaq,
  pastPasses,
  schedulePasses,
  upcomingPasses,
} from "../data/courseEvents.js";
import "./ArtPage.css";
import Breadcrumbs from "../components/layout/Breadcrumbs/Breadcrumbs.jsx";

const MALERI_TRACK = TRACKS[MALERI_TRACK_ID];
const INSTRUCTOR = MALERI_TRACK.instructor;

// Navbar (60px) plus the section subnav (48px).
const SPY_OFFSET = 130;

// How many of Ann's paintings and ceramics the page shows; the rest are one link away on /ann.
const WORKS_SHOWN = 6;
const CERAMICS_SHOWN = 4;

function ArtPage() {
  const copy = usePageCopy("art");
  const siteCopy = useSiteCopy();
  // The ceramics texts are the ones the teaser on /ann already uses.
  const annCopy = usePageCopy("portfolio-ann");
  const media = usePageMedia("art");
  const list = usePageLists("art");
  const facts = list("facts", [
    { body: "Akvarell och akryl" },
    { body: "Material finns på plats" },
    { body: "Ingen förkunskap behövs" },
    { body: "15 minuter från Lidköping" },
  ]);
  const steps = list("steps", [
    {
      title: "Värm upp",
      body: "Passet börjar med prestationsfria uppvärmningsövningar. Ann visar momenten innan du sätter igång.",
    },
    {
      title: "Måla fritt",
      body: "Sedan målar du med akvarell eller akryl. Ann går runt och hjälper dig vidare under hela passet.",
    },
    {
      title: "Kom som du är",
      body: "Material och verktyg finns i ateljén. Ta med kläder som får bli lite färg på.",
    },
  ]);
  const offerings = list("offerings", []);
  const artworks = useArtworks();
  const works = artworks.filter((work) => work.placement === "wall").slice(0, WORKS_SHOWN);
  const ceramics = useCeramics();
  const showStudio = works.length > 0 || ceramics.length > 0;
  const schedule = useCmsSchedule();
  const passes = useMemo(() => schedulePasses(schedule), [schedule]);
  const now = new Date();
  const faqList = list("faq", null);
  const faq = hubFaq(MALERI_TRACK_ID, now, passes, faqList);
  const instructor = {
    ...INSTRUCTOR,
    name: copy("instructor.title"),
    role: copy("instructor.role"),
    bio: copy("instructor.bio"),
  };
  const upcomingPassesList = upcomingPasses(MALERI_TRACK_ID, now, passes);
  const hasUpcoming = upcomingPassesList.length > 0;
  const recapPasses = pastPasses(MALERI_TRACK_ID, now, passes);
  // Same passes and answers as rendered; recomputed when either source changes.
  const jsonLd = useMemo(
    () => activeJsonLd(seoMeta.kurserKonst, new Date(), { passes, faq: hubFaq(MALERI_TRACK_ID, new Date(), passes, faqList) }),
    [passes, faqList],
  );

  const spySections = [
    { id: "art-hero", label: siteCopy("nav.start") },
    { id: "art-courses-section", label: siteCopy("courses.courses-label") },
    { id: "sa-gar-det-till", label: copy("steps.title", "Så går en kurs till") },
    works.length > 0 && { id: "anns-malningar", label: copy("works.title", "Anns målningar") },
    ceramics.length > 0 && { id: "anns-keramik", label: annCopy("ceramics.teaser-title", "Keramik") },
    { id: "om-ann", label: instructor.name },
    recapPasses.length > 0 && { id: "tidigare-pass", label: siteCopy("courses.past-label") },
    { id: "fragor-och-svar", label: siteCopy("courses.faq-label") },
    { id: COURSE_CONTACT_ID, label: siteCopy("nav.contact") },
  ].filter(Boolean);

  useSeo({
    ...seoMeta.kurserKonst,
    jsonLd: jsonLd.length > 0 ? jsonLd : undefined,
  });

  const studioImage = media("hero.background", "/images/portfolio/ann-2.webp");
  const tableImage = media("workshops.0", "/images/evenemang/maleri-kurs.webp", "card");

  return (
    <div className="art-page">
      <ScrollSpyNav sections={spySections} offset={SPY_OFFSET} />

      <main id="main-content">
        {/* The work table first: the studio and a painting in progress, beside what a course is. */}
        <section className="art-hero" id="art-hero" data-cms-hero>
          <div className="art-hero__inner">
            <div className="art-hero__text" data-cms-hero-content>
              <Breadcrumbs />
              <h1>{copy("hero.title")}</h1>
              <p className="art-hero__lead">{copy("hero.lead")}</p>

              {facts.length > 0 && (
                <ul className="art-hero__facts">
                  {facts.map((fact, index) => (
                    <li key={fact.id || fact.body || index}>{fact.body}</li>
                  ))}
                </ul>
              )}

              {/* With no dated course, "Se kurserna" would only lead to an empty calendar, so the
                  enquiry form leads instead. */}
              <div className="art-hero__actions" data-cms-hero-actions>
                {hasUpcoming ? (
                  <>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => smoothScrollTo("art-courses-section", SPY_OFFSET)}
                    >
                      {copy("hero.primary-cta")}
                      <ArrowDown size={18} aria-hidden="true" />
                    </button>
                    <a href={`#${COURSE_CONTACT_ID}`} className="btn btn--secondary" onClick={goToCourseContact}>
                      {copy("contact.cta")}
                    </a>
                  </>
                ) : (
                  <>
                    <a href={`#${COURSE_CONTACT_ID}`} className="btn btn--primary" onClick={goToCourseContact}>
                      {copy("contact.cta")}
                      <ArrowDown size={18} aria-hidden="true" />
                    </a>
                    <a
                      href="#sa-gar-det-till"
                      className="art-hero__more"
                      onClick={(event) => {
                        event.preventDefault();
                        smoothScrollTo("sa-gar-det-till", SPY_OFFSET);
                      }}
                    >
                      {copy("steps.title", "Så går en kurs till")}
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Editors can swap these photos, so they carry no description that could go stale. */}
            <div className="art-hero__table" data-cms-hero-visual aria-hidden="true">
              {studioImage && (
                <img
                  className="art-sheet art-hero__studio"
                  src={studioImage}
                  alt=""
                  fetchPriority="high"
                  decoding="async"
                />
              )}
              {tableImage && (
                <img
                  className="art-sheet art-hero__paper"
                  src={tableImage}
                  alt=""
                  decoding="async"
                />
              )}
            </div>
          </div>
        </section>

        <div id="art-courses-section">
          {hasUpcoming ? (
            groupSeries(upcomingPassesList).map(({ id, passes: group }) => (
              <PassSection
                key={id}
                pass={group[0]}
                series={group.length > 1 ? group : null}
                trackId={MALERI_TRACK_ID}
                background="white"
                variant="split-reverse"
              />
            ))
          ) : (
            <section id="kommande" className="art-next">
              <div className="art-next__inner">
                <div>
                  <h2>{copy("empty.title")}</h2>
                  <p>{copy("empty.body")}</p>
                </div>
                <a href={`#${COURSE_CONTACT_ID}`} className="btn btn--secondary" onClick={goToCourseContact}>
                  {copy("contact.cta")}
                  <ArrowDown size={18} aria-hidden="true" />
                </a>
              </div>
            </section>
          )}
        </div>

        <section id="sa-gar-det-till" className="art-steps" aria-labelledby="art-steps-title">
          <div className="art-steps__inner">
            <div className="art-steps__intro">
              <h2 id="art-steps-title">{copy("steps.title", "Så går en kurs till")}</h2>
              <p>{copy("steps.lead", "Ann leder hela passet, och du behöver inte ha målat förut.")}</p>
            </div>
            <ol className="art-steps__list">
              {steps.map((step, index) => (
                <li key={step.id || step.title || index}>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {showStudio && <SectionDivider above="white" below="alt" variant="wave" />}
        {works.length > 0 && (
          <section id="anns-malningar" className="art-works" aria-labelledby="art-works-title">
            <div className="art-works__head">
              <h2 id="art-works-title">{copy("works.title", "Anns målningar")}</h2>
              <p>{copy("works.lead", "Ett urval från ateljén på gården.")}</p>
            </div>
            {/* Hung in a row at their own proportions; on phones the row scrolls sideways. */}
            <ul className="art-works__row">
              {works.map((work) => (
                <li key={work.id} style={{ "--ratio": work.image.width / work.image.height || 0.8 }}>
                  <figure>
                    <img
                      className="art-sheet"
                      src={work.image.sizes?.medium?.url || work.image.url}
                      width={work.image.width}
                      height={work.image.height}
                      alt={work.image.alt || work.title}
                      loading="lazy"
                      decoding="async"
                    />
                    <figcaption>{work.title}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
            <div className="art-works__more">
              <Link to={canonicalPath(INSTRUCTOR.portfolioUrl || "/ann")} className="art-link">
                {copy("works.cta", "Se alla verk")}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>
        )}
        {/* Only what Ann makes; the page offers no ceramics course. */}
        {ceramics.length > 0 && (
          <section id="anns-keramik" className="art-works art-works--ceramics" aria-labelledby="art-ceramics-title">
            <div className="art-works__head">
              <h2 id="art-ceramics-title">{annCopy("ceramics.teaser-title", "Keramik")}</h2>
              <p>{annCopy("ceramics.teaser-lead", "Ann drejar, bygger och glaserar i ateljén. Här är ett smakprov.")}</p>
            </div>
            <ul className="art-ceramics">
              {ceramics.slice(0, CERAMICS_SHOWN).map((piece) => (
                <li key={piece.id}>
                  <img
                    className="art-sheet"
                    {...ceramicImageProps(piece, "(min-width: 760px) 22vw, 44vw")}
                    loading="lazy"
                    decoding="async"
                  />
                </li>
              ))}
            </ul>
            <div className="art-works__more">
              <Link to={canonicalPath("/ann/keramik")} className="art-link">
                {annCopy("ceramics.teaser-link", "Se all keramik")} ({ceramics.length})
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>
        )}
        <SectionDivider above={showStudio ? "alt" : "white"} below="green" variant="hill" />

        {offerings.length > 0 && (
          <section className="art-ways" aria-labelledby="art-ways-title">
            <div className="art-ways__inner">
              <div className="art-ways__head">
                <h2 id="art-ways-title">{copy("offerings.title")}</h2>
                <p>{copy("offerings.lead")}</p>
              </div>
              <ul className="art-ways__list">
                {offerings.map((offering, index) => (
                  <li key={offering.id || offering.title || index}>
                    <h3>{offering.title}</h3>
                    <p>{offering.body}</p>
                  </li>
                ))}
              </ul>
              <a href={`#${COURSE_CONTACT_ID}`} className="btn btn--primary art-ways__cta" onClick={goToCourseContact}>
                {copy("contact.cta")}
                <ArrowDown size={18} aria-hidden="true" />
              </a>
            </div>
          </section>
        )}

        <SectionDivider above="green" below="white" variant="wave" />

        <InstructorSection
          id="om-ann"
          instructor={instructor}
          label={copy("instructor.eyebrow")}
          background="white"
          variant="portrait"
          image={media("instructor.image", "/images/ann-profile.webp", "avatar") || instructor.image}
        />

        {recapPasses.length > 0 && <SectionDivider above="white" below="alt" variant="valley" />}
        <PastPassesSection
          passes={recapPasses}
          trackId={MALERI_TRACK_ID}
          heading={copy("past.title")}
          background="alt"
          variant="cards"
        />

        <SectionDivider above={recapPasses.length > 0 ? "alt" : "white"} below="green" variant="hill" />

        <FaqSection
          faq={faq}
          label={copy("faq.eyebrow")}
          heading={copy("faq.title")}
          background="green"
          variant="stack"
          centered
        />

        <SectionDivider above="green" below="alt" variant="valley" />

        <ContactSection
          heading={copy("contact.section-title")}
          body={copy("contact.section-body")}
          background="alt"
        />

        {/* Where the studio is, and where next once the visitor knows how to sign up. */}
        <section id="hitta-hit" className="art-location">
          <div className="art-location__content">
            <h2>{copy("directions.title")}</h2>
            <p>{copy("directions.body")}</p>
          </div>
          <div className="art-location__details">
            <address>
              {COURSE_LOCATION.streetAddress}, {COURSE_LOCATION.postalCode} {COURSE_LOCATION.locality}
            </address>
            <a href={COURSE_LOCATION.mapsUrl} target="_blank" rel="noopener noreferrer" className="art-link">
              <MapPin size={17} aria-hidden="true" />
              {copy("directions.cta")}
            </a>
            <a href={`${TRACKS.yoga.hubPath}/`} className="art-link">
              {copy("other.title")}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>

        <ExploreMore ids={["ann", "keramik", "event", "brollop"]} background="green" />
      </main>
    </div>
  );
}

export default ArtPage;
