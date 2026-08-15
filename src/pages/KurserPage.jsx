import { useEffect, useState } from "react";
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
  PastPassesSection,
  YogaScheduleSection,
} from "../features/courses/CourseSections.jsx";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta, activeJsonLd } from "../config/seoMeta.js";
import { fetchPublicEvents } from "../services/eventsService.js";
import usePageCopy from "../hooks/usePageCopy.js";
import usePageMedia from "../hooks/usePageMedia.js";
import { cdnAsset } from "../config/cdnAssets.js";
import {
  COURSE_LOCATION,
  COURSE_PASSES,
  TRACKS,
  YOGA_TRACK_ID,
  formatPassDate,
  mergeCoursePasses,
  passAnchor,
  pastPasses,
  resolvedFaq,
} from "../data/courseEvents.js";
import "./KurserPages.css";
import "../features/gallery/ImageGallery/Gallery.css";

const linaYogaHeaderImg = cdnAsset("/images/evenemang/lina-yoga-header.jpg");
const linaYogaImg = cdnAsset("/images/evenemang/lina-yoga.jpg");
const linaYogaYta2Img = cdnAsset("/images/evenemang/lina-yoga-yta2.jpg");
const yogaLoftImg = cdnAsset("/images/evenemang/yoga-loft.webp");
const maleriKursImg = cdnAsset("/images/evenemang/maleri-kurs.webp");

// Module-level so the reference is stable across renders (useSeo dep) and so
// the same date gating runs client-side as in the prerendered HTML.
const KURSER_JSONLD = activeJsonLd(seoMeta.kurserYoga);

const PAST_PASSES = pastPasses(YOGA_TRACK_ID);
const FAQ = resolvedFaq(YOGA_TRACK_ID);

const YOGA_TRACK = TRACKS[YOGA_TRACK_ID];
const INSTRUCTOR = YOGA_TRACK.instructor;

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
  const copy = usePageCopy("yoga");
  const media = usePageMedia("yoga");
  const recapImages = RECAP_IMAGES.map((item, index) => {
    const next = media(`gallery.${index}`, item.original, "card");
    return { ...item, original: next, thumbnail: next };
  }).filter((item) => item.original);
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
    COURSE_PASSES.filter((p) => p.tracks.includes(YOGA_TRACK_ID)),
    apiEvents,
    YOGA_TRACK_ID
  );

  const nextPassItem =
    upcomingPassesList.find((p) => new Date(p.endAt || p.startAt).getTime() >= Date.now()) ||
    upcomingPassesList[0] ||
    null;

  const contactSubject = nextPassItem
    ? `Fråga om ${nextPassItem.title} ${formatPassDate(nextPassItem)}`
    : "Fråga om yoga på Storegården 7";

  const spySections = [
    { id: "kurser-hero", label: "Start" },
    ...(nextPassItem
      ? [{ id: passAnchor(nextPassItem), label: "Nästa pass" }]
      : [{ id: "kommande", label: "Kommande" }]),
    { id: "om-lina", label: `Om ${INSTRUCTOR.name.split(" ")[0]}` },
    { id: "fragor-och-svar", label: "Frågor" },
    { id: "gardens-atmosfar", label: "Bilder" },
    { id: "hitta-hit", label: "Hitta hit" },
    { id: "tidigare-pass", label: "Tidigare" },
    { id: "kontakt", label: "Kontakt" },
  ];

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
  } = useGalleryLightbox(recapImages, "kurser");

  return (
    <div className="kurser-page">
      <ScrollSpyNav sections={spySections} offset={SPY_OFFSET} />

      <main id="main-content">
        <header className="kurser-hero" id="kurser-hero" data-cms-hero data-cms-hero-visual>
          <div
            className="kurser-hero__bg"
            style={{
              backgroundImage: media("hero.background", linaYogaHeaderImg, "hero") ? `url(${media("hero.background", linaYogaHeaderImg, "hero")})` : "none",
            }}
          />
          <div className="kurser-hero__overlay" data-cms-hero-overlay />
          <div className="kurser-hero__inner" data-cms-hero-content>
            {nextPassItem && (
              <div className="kurser-hero__badge">
                <span className="kurser-hero__badge-pulse" />
                <span>Nästa tillfälle: {formatPassDate(nextPassItem)}</span>
              </div>
            )}
            <h1>{copy("hero.title", "Yoga")}</h1>
            <a
              className="kurser-hero__link"
              href={nextPassItem ? `#${passAnchor(nextPassItem)}` : "#kontakt"}
            >
              {nextPassItem
                ? copy("hero.next-cta", "Se nästa pass")
                : copy("hero.contact-cta", "Hör av dig")}
              <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
        </header>

        {/* No divider straight after the hero: the photo already closes the
            section, and a curve would only lay a pale strip across it. */}
        {upcomingPassesList.length === 0 ? (
          <NoUpcomingSection
            trackId={YOGA_TRACK_ID}
            background="alt"
            heading={copy("empty.title", "Inget pass inbokat just nu")}
            body={copy("empty.body", `Vi har för tillfället inget yogapass i kalendern. Håll utkik här, eller hör av dig till ${INSTRUCTOR.name} så berättar hon när nästa tillfälle släpps.`)}
          />
        ) : (
          <YogaScheduleSection
            passes={upcomingPassesList}
            trackId={YOGA_TRACK_ID}
            background="alt"
            contactSubject={contactSubject}
            onContactClick={onContactClick}
            showMailFallback={showMailFallback}
          />
        )}

        <SectionDivider above="alt" below="white" variant="valley" />

        {/* No portrait here by request - the section runs as text only. */}
        <InstructorSection
          id="om-lina"
          instructor={INSTRUCTOR}
          label={copy("instructor.label", "Vem leder passen")}
          background="white"
          variant="split"
        />

        <SectionDivider above="white" below="green" variant="wave" />

        <FaqSection
          faq={FAQ}
          heading="Vanliga frågor"
          background="green"
          variant="columns"
        />

        <SectionDivider above="green" below="white" variant="hill" />

        <CourseBand id="gardens-atmosfar" background="white" className="kurser-recap">
          <div className="kurser-recap__copy">
            <span className="kurser-label">{copy("gallery.eyebrow", "Bilder från loftet")}</span>
            <h2>{copy("gallery.title", "Loftet på Storegården 7")}</h2>
          </div>

          <div className="kurser-recap__gallery">
            {recapImages.map((imgItem, idx) => (
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
          description={copy("directions.body", `Yogan hålls på loftet på ${COURSE_LOCATION.name} i ${COURSE_LOCATION.locality}, ${COURSE_LOCATION.travelNote}. Kör mot Rackeby och följ skyltningen till gården — det finns gott om parkering på grusplanen intill ladan.`)}
        />

        <SectionDivider above="white" below="alt" variant="wave" />

        <PastPassesSection
          passes={PAST_PASSES}
          trackId={YOGA_TRACK_ID}
          heading={copy("past.title", "Tidigare pass")}
          background="alt"
          variant="timeline"
        />

        <SectionDivider above="alt" below="green" variant="hill" />

        {/* Kept off the very bottom on purpose: the global contact section that
            App.jsx renders below is a centred block, so a second centred contact
            block right above it read as the same section twice. */}
        <ContactSection
          heading={copy("contact.title", "Frågor om yogan?")}
          body={copy("contact.body", `Hör av dig till ${INSTRUCTOR.name} — hon svarar gärna på frågor om passen, nivån eller vad du behöver ta med.`)}
          email={INSTRUCTOR.email}
          subject={contactSubject}
          background="green"
          variant="split"
          onContactClick={onContactClick}
        />

        <SectionDivider above="green" below="white" variant="valley" />

        <OtherHubLink
          href={`${TRACKS.maleri.hubPath}/`}
          background="white"
          variant="band"
          image={media("other.art", maleriKursImg, "card")}
          imageAlt="Målarkurs i ateljén på Storegården 7"
          eyebrow={copy("other.eyebrow", "Mer hos oss")}
          heading={copy("other.title", "Måla eller dreja i ateljén")}
          body={copy("other.body", `I gårdsateljén håller ${TRACKS.maleri.instructor.name} kurser i måleri och keramik, både på fasta datum och som privat kurs för grupper.`)}
          linkLabel={copy("other.cta", "Se kurser i måleri och keramik")}
        />

        {/* White -> alt for the global contact section below. */}
        <SectionDivider above="white" below="alt" variant="wave" />

        {/* Lightbox / Bildvisare */}
        <GalleryLightbox
          isOpen={showLightbox}
          images={recapImages}
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
