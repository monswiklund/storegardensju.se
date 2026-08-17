import { useEffect, useState } from "react";
import {
  ArrowRight,
  Mail,
  MapPin,
  Palette,
  Sparkles,
  Flame,
  Users,
} from "lucide-react";
import CreativeWorkshopsSection from "../features/creation/CreativeWorkshopsSection.jsx";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import { PageSection, ScrollSpyNav, SectionDivider } from "../components";
import { smoothScrollTo } from "../utils/scrollUtils.js";
import {
  ContactSection,
  FaqSection,
  InstructorSection,
  NoUpcomingSection,
  PassSection,
  PastPassesSection,
} from "../features/courses/CourseSections.jsx";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta, activeJsonLd } from "../config/seoMeta.js";
import { fetchPublicEvents } from "../services/eventsService.js";
import usePageCopy, { useSiteCopy } from "../hooks/usePageCopy.js";
import usePageMedia from "../hooks/usePageMedia.js";
import usePageLists from "../hooks/usePageLists.js";
import {
  COURSE_LOCATION,
  COURSE_PASSES,
  MALERI_TRACK_ID,
  TRACKS,
  formatPassDate,
  mergeCoursePasses,
  pastPasses,
  resolvedFaq,
} from "../data/courseEvents.js";
import "./ArtPage.css";


// Module-level: stable reference for useSeo, and the same date gating runs
// client-side as in the prerendered HTML.
const KONST_JSONLD = activeJsonLd(seoMeta.kurserKonst);

const PAST_PASSES = pastPasses(MALERI_TRACK_ID);
const FAQ = resolvedFaq(MALERI_TRACK_ID);

const MALERI_TRACK = TRACKS[MALERI_TRACK_ID];
const INSTRUCTOR = MALERI_TRACK.instructor;
const CONTACT_EMAIL = INSTRUCTOR.email;

// Navbar (60px) plus the section subnav (48px).
const SPY_OFFSET = 130;

function ArtPage() {
  const copy = usePageCopy("art");
  const siteCopy = useSiteCopy();
  const media = usePageMedia("art");
  const list = usePageLists("art");
  const offerings = list("offerings", []);
  const offeringIcons = [Palette, Flame, Users, Sparkles];
  const offeringClasses = ["offering-terracotta", "offering-green", "offering-slate", "offering-gold"];
  const faq = list("faq", [])
    .filter((item) => item.title && item.body)
    .map((item) => ({ question: item.title, answer: item.body }));
  const instructor = {
    ...INSTRUCTOR,
    name: copy("instructor.title"),
    role: copy("instructor.role"),
    bio: copy("instructor.bio"),
  };
  const [showMailFallback, setShowMailFallback] = useState(false);
  const [apiEvents, setApiEvents] = useState([]);
  const onContactClick = () => setShowMailFallback(true);

  useEffect(() => {
    let active = true;
    fetchPublicEvents()
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data?.upcoming)) {
          setApiEvents(data.upcoming);
        }
      })
      .catch(() => {
        // Fall back to static passes on network error
      });

    return () => {
      active = false;
    };
  }, []);

  const upcomingPassesList = mergeCoursePasses(
    COURSE_PASSES.filter((p) => p.tracks.includes(MALERI_TRACK_ID)),
    apiEvents,
    MALERI_TRACK_ID
  );

  const nextPassItem = upcomingPassesList[0] || null;

  const contactSubject = nextPassItem
    ? `${siteCopy("courses.inquiry-prefix") || "Fråga om"} ${nextPassItem.title} ${formatPassDate(nextPassItem)}`
    : copy("hero.contact-cta");

  const spySections = [
    { id: "art-hero", label: siteCopy("nav.start") },
    { id: "art-courses-section", label: siteCopy("courses.courses-label") },
    { id: "art-content-section", label: copy("content.title") },
    { id: "art-offerings-section", label: copy("offerings.title") },
    { id: "art-cta-section", label: copy("cta.button") },
    { id: "om-ann", label: instructor.name },
    { id: "fragor-och-svar", label: siteCopy("courses.faq-label") },
    { id: "tidigare-pass", label: siteCopy("courses.past-label") },
    { id: "hitta-hit", label: siteCopy("courses.directions-label") },
    { id: "kontakt", label: siteCopy("nav.contact") },
  ];

  useSeo({
    ...seoMeta.kurserKonst,
    jsonLd: KONST_JSONLD.length > 0 ? KONST_JSONLD : undefined,
  });

  const scrollToSection = (id) => {
    smoothScrollTo(id, SPY_OFFSET);
  };

  return (
    <div className="art-page">
      <ScrollSpyNav sections={spySections} offset={SPY_OFFSET} />

      <main id="main-content">
        {/* Hero Section */}
        <section className="art-hero" id="art-hero" data-cms-hero data-cms-hero-visual>
          <div className="art-hero__bg" style={{ backgroundImage: media("hero.background", "/images/portfolio/ann-2.webp", "hero") ? `url(${media("hero.background", "/images/portfolio/ann-2.webp", "hero")})` : "none" }} />
          <div className="art-hero__overlay" data-cms-hero-overlay />

          <div className="art-hero__content" data-cms-hero-content>
            <span className="art-hero__eyebrow">
              <Sparkles size={16} aria-hidden="true" />
              {copy("hero.eyebrow")}
            </span>

            <h1 className="art-hero__heading">{copy("hero.title")}</h1>

            <p className="art-hero__subheading">
              {copy("hero.lead")}
            </p>

            <div className="art-hero__actions" data-cms-hero-actions>
              <button
                type="button"
                className="art-btn art-btn--primary"
                onClick={() => scrollToSection("art-courses-section")}
              >
                {copy("hero.primary-cta")}
              </button>
              <button
                type="button"
                className="art-btn art-btn--secondary"
                onClick={() => scrollToSection("art-cta-section")}
              >
                {copy("hero.secondary-cta")}
              </button>
            </div>
          </div>

          <div className="art-hero__wave">
            <svg
              viewBox="0 0 1200 48"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M0,24 C300,42 450,6 600,24 C750,42 900,6 1200,24 L1200,48 L0,48 Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </section>

        {/* Course hub for maleri & keramik: dated passes as anchored sections on
            this one URL, mirroring /kurser/yoga for yoga. Separate URLs per course
            date would only produce thin pages that expire. */}
        <div id="art-courses-section">
          {upcomingPassesList.length === 0 ? (
            <NoUpcomingSection
              trackId={MALERI_TRACK_ID}
              background="white"
              heading={copy("empty.title")}
              body={copy("empty.body")}
            />
          ) : (
            upcomingPassesList.map((pass) => (
              <PassSection
                key={pass.id}
                pass={pass}
                trackId={MALERI_TRACK_ID}
                background="white"
                variant="split-reverse"
                contactSubject={contactSubject}
                onContactClick={onContactClick}
                showMailFallback={showMailFallback}
              />
            ))
          )}
        </div>

        <SectionDivider above="white" below="alt" variant="hill" />

        {/* Content Section (Philosophy & alternating rows) - alt background */}
        <div id="art-content-section">
          <CreativeWorkshopsSection />
        </div>

        <SectionDivider above="alt" below="white" variant="wave" />

        {/* Offerings Grid Section */}
        <div id="art-offerings-section">
          <PageSection background="white" spacing="default">
            <FadeInSection>
              <div className="art-section-heading">
                <div
                  className="section-ornament"
                  aria-hidden="true"
                  style={{ color: "var(--accent-color)" }}
                >
                  <span
                    className="section-ornament-line"
                    style={{ background: "var(--accent-color)" }}
                  />
                  <Palette size={18} />
                  <span
                    className="section-ornament-line"
                    style={{ background: "var(--accent-color)" }}
                  />
                </div>
                <h2>{copy("offerings.title")}</h2>
                <p>{copy("offerings.lead")}</p>
              </div>

              <div className="art-offerings-grid">
                {offerings.map((offering, index) => {
                  const Icon = offeringIcons[index % offeringIcons.length];
                  return (
                    <div
                      key={offering.id || offering.title || index}
                      className={`art-offering-card ${offeringClasses[index % offeringClasses.length]}`}
                    >
                      <div className="offering-icon-wrapper"><Icon size={28} /></div>
                      <h3>{offering.title}</h3>
                      <p>{offering.body}</p>
                    </div>
                  );
                })}
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="white" below="green" variant="wave" />

        {/* Booking CTA Section */}
        <div id="art-cta-section">
          <PageSection background="green" spacing="default">
            <FadeInSection>
              <div className="art-cta-banner">
                <div className="art-cta-banner__inner">
                  <h2>{copy("contact.title")}</h2>
                  <p>{copy("contact.body")}</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(contactSubject)}`}
                    className="art-button art-button--premium"
                  >
                    <Mail size={18} />
                    {copy("contact.cta")}
                  </a>
                </div>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="alt" below="white" variant="wave" />

        {/* Instruktör */}
        <InstructorSection
          id="om-ann"
          instructor={instructor}
          label={copy("instructor.eyebrow")}
          background="white"
          variant="portrait"
          image={media("instructor.image", "/images/ann-profile.webp", "avatar") || instructor.image}
        />

        <SectionDivider above="white" below="green" variant="hill" />

        {/* Frågor & Svar */}
        <FaqSection
          faq={faq}
          label={copy("faq.eyebrow")}
          heading={copy("faq.title")}
          background="green"
          variant="stack"
          centered
        />

        <SectionDivider above="green" below="alt" variant="valley" />

        {/* Tidigare kurser / Inspiration */}
        <PastPassesSection
          passes={PAST_PASSES}
          trackId={MALERI_TRACK_ID}
          heading={copy("past.title")}
          background="alt"
          variant="cards"
        />

        <SectionDivider above="alt" below="white" variant="wave" />

        {/* Hitta hit */}
        <section id="hitta-hit" className="art-location">
          <div className="art-location__content">
            <span className="art-eyebrow">{copy("directions.eyebrow")}</span>
            <h2>{copy("directions.title")}</h2>
            <p>{copy("directions.body")}</p>
          </div>
          <div className="art-location__details">
            <address>
              {COURSE_LOCATION.streetAddress}, {COURSE_LOCATION.postalCode}{" "}
              {COURSE_LOCATION.locality}
            </address>
            <a
              href={COURSE_LOCATION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin size={17} aria-hidden="true" />
              {copy("directions.cta")}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="art-next-course">
          <span>{copy("other.eyebrow")}</span>
          <a href={`${TRACKS.yoga.hubPath}/`}>
            {copy("other.title")}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </section>

        <ContactSection
          heading={copy("contact.section-title")}
          body={copy("contact.section-body")}
          email={CONTACT_EMAIL}
          subject={contactSubject}
          background="alt"
          variant="center"
          onContactClick={onContactClick}
        />
      </main>
    </div>
  );
}

export default ArtPage;
