import { useState } from "react";
import { ArrowDown } from "lucide-react";
import GalleryLightbox from "../features/gallery/ImageGallery/components/GalleryLightbox.jsx";
import useGalleryLightbox from "../features/gallery/ImageGallery/hooks/useGalleryLightbox.js";
import { ScrollSpyNav, SectionDivider } from "../components";
import {
  ContactSection,
  CourseBand,
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
  TRACKS,
  YOGA_TRACK_ID,
  formatPassDate,
  nextPass,
  passAnchor,
  pastPasses,
  resolvedFaq,
  upcomingPasses,
} from "../data/courseEvents.js";
import "./KurserPages.css";
import "../features/gallery/ImageGallery/Gallery.css";

import linaYogaHeaderImg from "/images/evenemang/lina-yoga-header.jpg";
import linaYogaImg from "/images/evenemang/lina-yoga.jpg";
import linaYogaYta2Img from "/images/evenemang/lina-yoga-yta2.jpg";
import yogaLoftImg from "/images/evenemang/yoga-loft.webp";
import maleriKursImg from "/images/evenemang/maleri-kurs.webp";

// Module-level so the reference is stable across renders (useSeo dep) and so
// the same date gating runs client-side as in the prerendered HTML.
const KURSER_JSONLD = activeJsonLd(seoMeta.kurserYoga);

// Evaluated once per page load. The passes are known at build time, so there is
// nothing to re-render on - and a stable value keeps useSeo from re-running.
const UPCOMING_PASSES = upcomingPasses(YOGA_TRACK_ID);
const PAST_PASSES = pastPasses(YOGA_TRACK_ID);
const NEXT_PASS = nextPass(YOGA_TRACK_ID);
const FAQ = resolvedFaq(YOGA_TRACK_ID);

const YOGA_TRACK = TRACKS[YOGA_TRACK_ID];
const INSTRUCTOR = YOGA_TRACK.instructor;
const CONTACT_SUBJECT = NEXT_PASS
  ? `Fråga om ${NEXT_PASS.title} ${formatPassDate(NEXT_PASS)}`
  : "Fråga om yoga på Storegården 7";

// The dash rail on the right. Module-level so the array reference is stable
// across renders (ScrollSpyNav keys its scroll listener on it). Ids that are
// not in the DOM (no upcoming pass, no past passes) are skipped at runtime.
const SPY_SECTIONS = [
  { id: "kurser-hero", label: "Start" },
  ...(NEXT_PASS
    ? [{ id: passAnchor(NEXT_PASS), label: "Nästa pass" }]
    : [{ id: "kommande", label: "Kommande" }]),
  { id: "om-lina", label: `Om ${INSTRUCTOR.name.split(" ")[0]}` },
  { id: "fragor-och-svar", label: "Frågor" },
  { id: "gardens-atmosfar", label: "Bilder" },
  { id: "hitta-hit", label: "Hitta hit" },
  { id: "tidigare-pass", label: "Tidigare" },
  { id: "kontakt", label: "Kontakt" },
];

// Navbar (60px) plus the section subnav (48px) - the same clearance the anchors
// use, so a dot click lands with the heading visible.
const SPY_OFFSET = 130;

// Yoga imagery only - the painting shots belong on /kurser/konst, which is its
// own hub for maleri and keramik.
const RECAP_IMAGES = [
  {
    original: linaYogaImg,
    thumbnail: linaYogaImg,
    description: "Yoga på loftet event med Lina Wiklund på Storegården 7 i Lidköping",
    originalAlt: "Yoga på loftet event med Lina Wiklund på Storegården 7 i Lidköping",
  },
  {
    original: linaYogaYta2Img,
    thumbnail: linaYogaYta2Img,
    description: "Yogapass på loftet på Storegården 7",
    originalAlt: "Yogapass på loftet på Storegården 7",
  },
  {
    original: yogaLoftImg,
    thumbnail: yogaLoftImg,
    description: "Yoga på loftet på Storegården 7",
    originalAlt: "Yoga på loftet på Storegården 7",
  },
];

// Colour spine: photo hero -> alt -> white -> green -> white -> alt -> green ->
// white, with a SectionDivider on every colour change. /kurser/konst runs the
// colours and the layout variants in the opposite order on purpose, so the two
// hubs do not read as one template with the nouns swapped.
function KurserPage() {
  const [showMailFallback, setShowMailFallback] = useState(false);
  const onContactClick = () => setShowMailFallback(true);

  useSeo({
    ...seoMeta.kurserYoga,
    jsonLd: KURSER_JSONLD.length > 0 ? KURSER_JSONLD : undefined,
  });

  const {
    isOpen: showLightbox,
    currentIndex: lightboxIndex,
    currentImage,
    openLightbox,
    closeLightbox,
    goToImage,
    goToNextImage,
    goToPreviousImage,
    dialogRef,
    closeButtonRef,
  } = useGalleryLightbox(RECAP_IMAGES, "kurser");

  return (
    <div className="kurser-page">
      <ScrollSpyNav sections={SPY_SECTIONS} offset={SPY_OFFSET} />

      <main id="main-content">
        <header className="kurser-hero" id="kurser-hero">
          <div
            className="kurser-hero__bg"
            style={{
              backgroundImage: `url(${linaYogaHeaderImg})`,
            }}
          />
          <div className="kurser-hero__overlay" />
          <div className="kurser-hero__inner">
            {NEXT_PASS && (
              <div className="kurser-hero__badge">
                <span className="kurser-hero__badge-pulse" />
                <span>Nästa tillfälle: {formatPassDate(NEXT_PASS)}</span>
              </div>
            )}
            <h1>Yoga på loftet</h1>
            <p>
              Yoga i lugnt tempo med {INSTRUCTOR.name} på loftet på Storegården 7,{" "}
              {COURSE_LOCATION.travelNote}.
            </p>
            <a
              className="kurser-hero__link"
              href={NEXT_PASS ? `#${passAnchor(NEXT_PASS)}` : "#kontakt"}
            >
              {NEXT_PASS ? "Se nästa pass" : "Hör av dig"}
              <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
        </header>

        {/* No divider straight after the hero: the photo already closes the
            section, and a curve would only lay a pale strip across it. */}
        {UPCOMING_PASSES.length === 0 && (
          <NoUpcomingSection
            trackId={YOGA_TRACK_ID}
            background="alt"
            heading="Inget pass inbokat just nu"
            body={`Vi har för tillfället inget yogapass i kalendern. Håll utkik här, eller hör av dig till ${INSTRUCTOR.name} så berättar hon när nästa tillfälle släpps.`}
          />
        )}

        {UPCOMING_PASSES.map((pass) => (
          <PassSection
            key={pass.id}
            pass={pass}
            trackId={YOGA_TRACK_ID}
            background="alt"
            variant="split"
            sticky
            contactSubject={CONTACT_SUBJECT}
            onContactClick={onContactClick}
            showMailFallback={showMailFallback}
          />
        ))}

        <SectionDivider above="alt" below="white" variant="valley" />

        {/* No portrait here by request - the section runs as text only. */}
        <InstructorSection
          id="om-lina"
          instructor={INSTRUCTOR}
          label="Vem leder passen"
          background="white"
          variant="split"
        />

        <SectionDivider above="white" below="green" variant="wave" />

        <FaqSection
          faq={FAQ}
          heading="Vanliga frågor om yogan"
          background="green"
          variant="columns"
        />

        <SectionDivider above="green" below="white" variant="hill" />

        <CourseBand id="gardens-atmosfar" background="white" className="kurser-recap">
          <div className="kurser-recap__copy">
            <span className="kurser-label">Bilder från loftet</span>
            <h2>Loftet på Storegården 7</h2>
          </div>

          <div className="kurser-recap__gallery">
            {RECAP_IMAGES.map((imgItem, idx) => (
              <figure
                key={imgItem.original}
                className={`kurser-recap__image ${idx === 0 ? "kurser-recap__image--large" : ""}`}
                onClick={() => openLightbox(idx)}
                style={{ cursor: "pointer" }}
                tabIndex={0}
                role="button"
                aria-label={`Visa ${imgItem.description} i fullskärm`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLightbox(idx);
                  }
                }}
              >
                <img src={imgItem.thumbnail} alt={imgItem.originalAlt} />
              </figure>
            ))}
          </div>
        </CourseBand>

        <DirectionsSection
          background="white"
          variant="split-reverse"
          description={`Yogan hålls på loftet på ${COURSE_LOCATION.name} i ${COURSE_LOCATION.locality}, ${COURSE_LOCATION.travelNote}. Kör mot Rackeby och följ skyltningen till gården — det finns gott om parkering på grusplanen intill ladan.`}
        />

        <SectionDivider above="white" below="alt" variant="wave" />

        <PastPassesSection
          passes={PAST_PASSES}
          trackId={YOGA_TRACK_ID}
          heading="Tidigare pass på gården"
          background="alt"
          variant="timeline"
        />

        <SectionDivider above="alt" below="green" variant="hill" />

        {/* Kept off the very bottom on purpose: the global contact section that
            App.jsx renders below is a centred block, so a second centred contact
            block right above it read as the same section twice. */}
        <ContactSection
          heading="Frågor om yogan?"
          body={`Hör av dig till ${INSTRUCTOR.name} — hon svarar gärna på frågor om passen, nivån eller vad du behöver ta med.`}
          email={INSTRUCTOR.email}
          subject={CONTACT_SUBJECT}
          background="green"
          variant="split"
          onContactClick={onContactClick}
        />

        <SectionDivider above="green" below="white" variant="valley" />

        <OtherHubLink
          href={`${TRACKS.maleri.hubPath}/`}
          background="white"
          variant="band"
          image={maleriKursImg}
          imageAlt="Målarkurs i ateljén på Storegården 7"
          eyebrow="Mer att göra på gården"
          heading="Måla eller dreja i ateljén"
          body={`I gårdsateljén håller ${TRACKS.maleri.instructor.name} kurser i måleri och keramik, både på fasta datum och som privat kurs för grupper.`}
          linkLabel="Se kurser i måleri och keramik"
        />

        {/* White -> alt for the global contact section below. */}
        <SectionDivider above="white" below="alt" variant="wave" />

        {/* Lightbox / Bildvisare */}
        <GalleryLightbox
          isOpen={showLightbox}
          images={RECAP_IMAGES}
          currentIndex={lightboxIndex}
          currentImage={currentImage}
          onClose={closeLightbox}
          onNext={goToNextImage}
          onPrevious={goToPreviousImage}
          onSelectImage={goToImage}
          dialogRef={dialogRef}
          closeButtonRef={closeButtonRef}
        />
      </main>
    </div>
  );
}

export default KurserPage;
