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
import usePageCopy from "../hooks/usePageCopy.js";
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

// The dash rail on the right: how many sections the page has and where you are.
// Module-level for a stable array reference (ScrollSpyNav keys its listener on
// it); ids missing from the DOM are skipped at runtime.
const SPY_SECTIONS = [
  { id: "art-hero", label: "Start" },
  { id: "art-courses-section", label: "Kurser" },
  { id: "art-content-section", label: "Ateljén" },
  { id: "art-offerings-section", label: "Utbud" },
  { id: "art-cta-section", label: "Boka" },
  { id: "om-ann", label: "Om Ann" },
  { id: "fragor-och-svar", label: "Frågor" },
  { id: "tidigare-pass", label: "Tidigare" },
  { id: "hitta-hit", label: "Hitta hit" },
  { id: "kontakt", label: "Kontakt" },
];

// Navbar (60px) plus the section subnav (48px).
const SPY_OFFSET = 130;

function ArtPage() {
  const copy = usePageCopy("art");
  const media = usePageMedia("art");
  const list = usePageLists("art");
  const offerings = list("offerings", [
    { title: "Målningskurser", body: "Prova akvarell eller akryl. Ann visar tekniker och övningar och hjälper dig vidare under passet." },
    { title: "Keramik och lera", body: "Arbeta med handbygge, ringling eller drejning i keramikverkstaden. Verktyg och material finns på plats." },
    { title: "Privata workshops", body: "Boka ateljén för ett kompisgäng eller en annan grupp. Kursen anpassas efter vad ni vill prova och hur mycket erfarenhet ni har." },
    { title: "Teambuilding och kalas", body: "Måleri och keramik går att boka för företag, möhippor, svensexor och kalas. Det går också att lägga till fika." },
  ]);
  const offeringIcons = [Palette, Flame, Users, Sparkles];
  const offeringClasses = ["offering-terracotta", "offering-green", "offering-slate", "offering-gold"];
  const faq = list("faq", FAQ.map(({ answer, question }) => ({ body: answer, title: question })))
    .filter((item) => item.title && item.body)
    .map((item) => ({ question: item.title, answer: item.body }));
  const instructor = {
    ...INSTRUCTOR,
    name: copy("instructor.title", INSTRUCTOR.name),
    role: copy("instructor.role", INSTRUCTOR.role),
    bio: copy("instructor.bio", INSTRUCTOR.bio),
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
    ? `Fråga om ${nextPassItem.title} ${formatPassDate(nextPassItem)}`
    : "Förfrågan: Workshop eller kurs på Storegården 7";

  useSeo({
    ...seoMeta.kurserKonst,
    jsonLd: KONST_JSONLD.length > 0 ? KONST_JSONLD : undefined,
  });

  const scrollToSection = (id) => {
    smoothScrollTo(id, SPY_OFFSET);
  };

  return (
    <div className="art-page">
      <ScrollSpyNav sections={SPY_SECTIONS} offset={SPY_OFFSET} />

      <main id="main-content">
        {/* Hero Section */}
        <section className="art-hero" id="art-hero" data-cms-hero data-cms-hero-visual>
          <div className="art-hero__bg" style={{ backgroundImage: media("hero.background", "/images/portfolio/ann-2.webp", "hero") ? `url(${media("hero.background", "/images/portfolio/ann-2.webp", "hero")})` : "none" }} />
          <div className="art-hero__overlay" data-cms-hero-overlay />

          <div className="art-hero__content" data-cms-hero-content>
            <span className="art-hero__eyebrow">
              <Sparkles size={16} aria-hidden="true" />
              {copy("hero.eyebrow", "Gårdsateljén på Storegården 7")}
            </span>

            <h1 className="art-hero__heading">{copy("hero.title", "Måleri & keramik")}</h1>

            <p className="art-hero__subheading">
              {copy("hero.lead", "Kurser i akvarell, akryl och lera i inspirerande miljö på gården utanför Lidköping. Inga förkunskaper krävs.")}
            </p>

            <div className="art-hero__actions" data-cms-hero-actions>
              <button
                type="button"
                className="art-btn art-btn--primary"
                onClick={() => scrollToSection("art-courses-section")}
              >
                {copy("hero.primary-cta", "Se kommande kurser")}
              </button>
              <button
                type="button"
                className="art-btn art-btn--secondary"
                onClick={() => scrollToSection("art-cta-section")}
              >
                {copy("hero.secondary-cta", "Boka för egen grupp")}
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
              heading={copy("empty.title", "Kurser med fast datum släpps här")}
              body={copy("empty.body", `Just nu har vi ingen kurs med fast datum i kalendern. Nya tillfällen läggs upp här — och du kan alltid höra av dig till ${INSTRUCTOR.name} för att boka en egen kurs i måleri eller keramik för din grupp.`)}
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
                <h2>{copy("offerings.title", "Det här kan du göra i ateljén")}</h2>
                <p>{copy("offerings.lead", "Kom på en kurs med fast datum eller boka en egen tid för din grupp.")}</p>
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
                  <h2>{copy("contact.title", "Planerar du ett event eller vill du gå en kurs?")}</h2>
                  <p>{copy("contact.body", "Vi tar emot möhippor, födelsedagar, företag och andra grupper. Berätta hur många ni är och om ni vill måla, arbeta med lera eller kombinera kursen med fika.")}</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=Förfrågan: Workshop eller kurs på Storegården 7`}
                    className="art-button art-button--premium"
                  >
                    <Mail size={18} />
                    {copy("contact.cta", "Skicka en förfrågan")}
                  </a>
                </div>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="green" below="white" variant="hill" />

        {/* Every shared section below runs a different colour and a different
            variant than the same section on /kurser/yoga - portrait vs avatar,
            two columns vs one, timeline vs cards - so the two hubs read as two
            pages rather than one template with the nouns swapped. */}
        <InstructorSection
          id="om-ann"
          instructor={instructor}
          label={copy("instructor.eyebrow", "Vem håller kurserna")}
          background="white"
          variant="band"
        />

        <SectionDivider above="white" below="alt" variant="wave" />

        {/* FAQ stays visible: the FAQPage JSON-LD reads the same answers, and
            Google requires markup to match what a visitor can see. */}
        <FaqSection
          faq={faq}
          label={copy("faq.eyebrow", "Bra att veta")}
          heading={copy("faq.title", "Vanliga frågor")}
          background="alt"
          variant="stack"
        />

        <SectionDivider above="alt" below="white" variant="valley" />

        <PastPassesSection
          passes={PAST_PASSES}
          trackId={MALERI_TRACK_ID}
          heading={copy("past.title", "Tidigare kurser och skapardagar")}
          background="white"
          variant="timeline"
        />

        <SectionDivider above="white" below="alt" variant="wave" />

        <section className="art-location" id="hitta-hit" aria-labelledby="art-location-title">
          <div className="art-location__copy">
            <span className="art-location__eyebrow">{copy("directions.eyebrow", "Hitta hit")}</span>
            <h2 id="art-location-title">{copy("directions.title", "Storegården 7, Rackeby")}</h2>
            <p>{copy("directions.body", `Ateljén ligger ${COURSE_LOCATION.travelNote} från Lidköping. Det finns gott om parkering vid ladan.`)}</p>
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
              {copy("directions.cta", "Visa på karta")}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="art-next-course" aria-label="Andra kurser på gården">
          <span>{copy("other.eyebrow", "Mer att göra hos oss")}</span>
          <a href={`${TRACKS.yoga.hubPath}/`}>
            {copy("other.title", "Se även Yoga på loftet")}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </section>

        <ContactSection
          heading={copy("contact.section-title", "Fråga om en kurs")}
          body={copy("contact.section-body", `Hör av dig till ${instructor.name} — hon svarar gärna på frågor om kurserna, nivån eller hur en dag i ateljén läggs upp.`)}
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
