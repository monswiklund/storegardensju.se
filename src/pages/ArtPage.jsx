import { useState } from "react";
import { Mail, Palette, Sparkles, Flame, Users } from "lucide-react";
import CreativeWorkshopsSection from "../features/creation/CreativeWorkshopsSection.jsx";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import { PageSection, ScrollSpyNav, SectionDivider } from "../components";
import { HomeServicesSection } from "../features/home";
import {
  ContactSection,
  DirectionsSection,
  FaqSection,
  InstructorSection,
  NoUpcomingSection,
  OtherHubLink,
  PassSection,
  PastPassesSection,
} from "../features/courses/CourseSections.jsx";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta, activeJsonLd } from "../config/seoMeta.js";
import {
  COURSE_LOCATION,
  MALERI_TRACK_ID,
  TRACKS,
  formatPassDate,
  nextPass,
  pastPasses,
  resolvedFaq,
  upcomingPasses,
} from "../data/courseEvents.js";
import "./ArtPage.css";


// Module-level: stable reference for useSeo, and the same date gating runs
// client-side as in the prerendered HTML.
const KONST_JSONLD = activeJsonLd(seoMeta.kurserKonst);

const UPCOMING_PASSES = upcomingPasses(MALERI_TRACK_ID);
const PAST_PASSES = pastPasses(MALERI_TRACK_ID);
const NEXT_PASS = nextPass(MALERI_TRACK_ID);
const FAQ = resolvedFaq(MALERI_TRACK_ID);

const MALERI_TRACK = TRACKS[MALERI_TRACK_ID];
const INSTRUCTOR = MALERI_TRACK.instructor;
const CONTACT_EMAIL = INSTRUCTOR.email;
const CONTACT_SUBJECT = NEXT_PASS
  ? `Fråga om ${NEXT_PASS.title} ${formatPassDate(NEXT_PASS)}`
  : "Förfrågan: Workshop eller kurs på Storegården 7";

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
  useSeo({
    ...seoMeta.kurserKonst,
    jsonLd: KONST_JSONLD.length > 0 ? KONST_JSONLD : undefined,
  });
  const [showMailFallback, setShowMailFallback] = useState(false);
  const onContactClick = () => setShowMailFallback(true);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (!element) return;
    const y =
      element.getBoundingClientRect().top + window.scrollY - SPY_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="art-page">
      <ScrollSpyNav sections={SPY_SECTIONS} offset={SPY_OFFSET} />

      <main role="main" id="main-content">
        {/* Parallax Hero Section */}
        <section
          id="art-hero"
          className="art-hero"
          style={{ backgroundImage: "url('/images/portfolio/ann-2.webp')" }}
          aria-labelledby="art-heading"
        >
          <div className="art-hero__inner">
            <span className="art-eyebrow">Ateljén på Storegården 7</span>
            <div className="section-ornament" aria-hidden="true" style={{ color: "var(--accent-color)" }}>
              <span className="section-ornament-line" style={{ background: "var(--accent-color)" }}></span>
              <Palette size={20} />
              <span className="section-ornament-line" style={{ background: "var(--accent-color)" }}></span>
            </div>
            {/* Same wording as seoMeta.kurserKonst.staticContent.h1 - the prerendered
                shell must not say something the page then contradicts. */}
            <h1 id="art-heading">Skapande — måleri &amp; keramik i Lidköping</h1>
            <p>Kurser i målning och keramik med konstnären {INSTRUCTOR.name} i gårdsateljén på Storegården 7, {COURSE_LOCATION.travelNote}</p>
            <button
              onClick={() => scrollToSection("art-cta-section")}
              className="art-button art-button--primary"
            >
              <Sparkles size={18} />
              Boka en workshop
            </button>
          </div>

          {/* Organic edge into the white band below - same wave geometry as
              SectionDivider, drawn on top of the photo instead of beside it. */}
          <svg
            className="art-hero__curve"
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
        </section>

        {/* Course hub for maleri & keramik: dated passes as anchored sections on
            this one URL, mirroring /kurser/yoga for yoga. Separate URLs per course
            date would only produce thin pages that expire. */}
        <div id="art-courses-section">
          {UPCOMING_PASSES.length === 0 ? (
            <NoUpcomingSection
              trackId={MALERI_TRACK_ID}
              background="white"
              heading="Kurser med fast datum släpps här"
              body={`Just nu har vi ingen kurs med fast datum i kalendern. Nya tillfällen läggs upp här — och du kan alltid höra av dig till ${INSTRUCTOR.name} för att boka en egen kurs i måleri eller keramik för din grupp.`}
            />
          ) : (
            UPCOMING_PASSES.map((pass) => (
              <PassSection
                key={pass.id}
                pass={pass}
                trackId={MALERI_TRACK_ID}
                background="white"
                variant="split-reverse"
                contactSubject={CONTACT_SUBJECT}
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
          heading="Vanliga frågor om kurserna"
          background="alt"
          variant="stack"
        />

        <SectionDivider above="alt" below="white" variant="valley" />

        <PastPassesSection
          passes={PAST_PASSES}
          trackId={MALERI_TRACK_ID}
          heading="Tidigare kurser och skapardagar"
          background="white"
          variant="cards"
        />

        <SectionDivider above="white" below="green" variant="wave" />

        <DirectionsSection
          description={`Ateljén ligger på ${COURSE_LOCATION.name} i ${COURSE_LOCATION.locality}, ${COURSE_LOCATION.travelNote}. Kör mot Rackeby och följ skyltningen till gården — det finns gott om parkering på grusplanen intill ladan.`}
          background="green"
          variant="split"
        />

        <SectionDivider above="green" below="alt" variant="hill" />

        <OtherHubLink
          href={`${TRACKS.yoga.hubPath}/`}
          background="alt"
          variant="split"
          eyebrow="Mer att göra på gården"
          heading="Yoga på loftet"
          body={`Vi håller även yogapass på loftet med ${TRACKS.yoga.instructor.name} — lugnt tempo, guidning och vila, ${COURSE_LOCATION.travelNote}.`}
          linkLabel="Se yogan på loftet"
        />

        <ContactSection
          heading="Frågor om kurserna?"
          body={`Hör av dig till ${INSTRUCTOR.name} — hon svarar gärna på frågor om kurserna, nivån eller hur en dag i ateljén läggs upp.`}
          email={CONTACT_EMAIL}
          subject={CONTACT_SUBJECT}
          background="alt"
          variant="split"
          onContactClick={onContactClick}
        />

        <SectionDivider above="alt" below="white" variant="wave" />

        {/* Andra erbjudanden */}
        <div id="art-services-recommendation">
          <PageSection background="white" spacing="default">
            <FadeInSection>
              <HomeServicesSection
                excludeId="skapande"
                title="Se mer på gården"
                eyebrow="MER ATT SE & GÖRA"
              />
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="white" below="alt" variant="wave" />
      </main>
    </div>
  );
}

export default ArtPage;
