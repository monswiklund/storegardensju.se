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
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="art-page">
      <ScrollSpyNav sections={SPY_SECTIONS} offset={SPY_OFFSET} />

      <main id="main-content">
        {/* Hero Section */}
        <section className="art-hero" id="art-hero">
          <div className="art-hero__bg" />
          <div className="art-hero__overlay" />

          <div className="art-hero__content">
            <span className="art-hero__eyebrow">
              <Sparkles size={16} aria-hidden="true" />
              Gårdsateljén på Storegården 7
            </span>

            <h1 className="art-hero__heading">Måleri & keramik</h1>

            <p className="art-hero__subheading">
              Kurser i akvarell, akryl och lera i inspirerande miljö på gården
              utanför Lidköping. Inga förkunskaper krävs.
            </p>

            <div className="art-hero__actions">
              <button
                type="button"
                className="art-btn art-btn--primary"
                onClick={() => scrollToSection("art-courses-section")}
              >
                Se kommande kurser
              </button>
              <button
                type="button"
                className="art-btn art-btn--secondary"
                onClick={() => scrollToSection("art-cta-section")}
              >
                Boka för egen grupp
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
              heading="Kurser med fast datum släpps här"
              body={`Just nu har vi ingen kurs med fast datum i kalendern. Nya tillfällen läggs upp här — och du kan alltid höra av dig till ${INSTRUCTOR.name} för att boka en egen kurs i måleri eller keramik för din grupp.`}
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
                <h2>Det här kan du göra i ateljén</h2>
                <p>Kom på en kurs med fast datum eller boka en egen tid för din grupp.</p>
              </div>

              <div className="art-offerings-grid">
                <div className="art-offering-card offering-terracotta">
                  <div className="offering-icon-wrapper">
                    <Palette size={28} />
                  </div>
                  <h3>Målningskurser</h3>
                  <p>Prova akvarell eller akryl. Ann visar tekniker och övningar och hjälper dig vidare under passet.</p>
                </div>

                <div className="art-offering-card offering-green">
                  <div className="offering-icon-wrapper">
                    <Flame size={28} />
                  </div>
                  <h3>Keramik och lera</h3>
                  <p>Arbeta med handbygge, ringling eller drejning i keramikverkstaden. Verktyg och material finns på plats.</p>
                </div>

                <div className="art-offering-card offering-slate">
                  <div className="offering-icon-wrapper">
                    <Users size={28} />
                  </div>
                  <h3>Privata workshops</h3>
                  <p>Boka ateljén för ett kompisgäng eller en annan grupp. Kursen anpassas efter vad ni vill prova och hur mycket erfarenhet ni har.</p>
                </div>

                <div className="art-offering-card offering-gold">
                  <div className="offering-icon-wrapper">
                    <Sparkles size={28} />
                  </div>
                  <h3>Teambuilding och kalas</h3>
                  <p>Måleri och keramik går att boka för företag, möhippor, svensexor och kalas. Det går också att lägga till fika.</p>
                </div>
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
                  <h2>Planerar du ett event eller vill du gå en kurs?</h2>
                  <p>
                    Vi tar emot möhippor, födelsedagar, företag och andra
                    grupper. Berätta hur många ni är och om ni vill måla,
                    arbeta med lera eller kombinera kursen med fika.
                  </p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=Förfrågan: Workshop eller kurs på Storegården 7`}
                    className="art-button art-button--premium"
                  >
                    <Mail size={18} />
                    Skicka en förfrågan
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
          instructor={INSTRUCTOR}
          label="Vem håller kurserna"
          background="white"
          variant="band"
        />

        <SectionDivider above="white" below="alt" variant="wave" />

        {/* FAQ stays visible: the FAQPage JSON-LD reads the same answers, and
            Google requires markup to match what a visitor can see. */}
        <FaqSection
          faq={FAQ}
          heading="Vanliga frågor"
          background="alt"
          variant="stack"
        />

        <SectionDivider above="alt" below="white" variant="valley" />

        <PastPassesSection
          passes={PAST_PASSES}
          trackId={MALERI_TRACK_ID}
          heading="Tidigare kurser och skapardagar"
          background="white"
          variant="timeline"
        />

        <SectionDivider above="white" below="alt" variant="wave" />

        <section className="art-location" id="hitta-hit" aria-labelledby="art-location-title">
          <div className="art-location__copy">
            <span className="art-location__eyebrow">Hitta hit</span>
            <h2 id="art-location-title">Storegården 7, Rackeby</h2>
            <p>
              Ateljén ligger {COURSE_LOCATION.travelNote} från Lidköping. Det
              finns gott om parkering vid ladan.
            </p>
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
              Visa på karta
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="art-next-course" aria-label="Andra kurser på gården">
          <span>Mer att göra hos oss</span>
          <a href={`${TRACKS.yoga.hubPath}/`}>
            Se även Yoga på loftet
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </section>

        <ContactSection
          heading="Fråga om en kurs"
          body={`Hör av dig till ${INSTRUCTOR.name} — hon svarar gärna på frågor om kurserna, nivån eller hur en dag i ateljén läggs upp.`}
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
