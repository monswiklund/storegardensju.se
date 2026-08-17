import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import GalleryLightbox from "../features/gallery/ImageGallery/components/GalleryLightbox.jsx";
import useGalleryLightbox from "../features/gallery/ImageGallery/hooks/useGalleryLightbox.js";
import { ScrollSpyNav, SectionDivider } from "../components";
import { smoothScrollTo } from "../utils/scrollUtils.js";
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
import usePageCopy, { useSiteCopy } from "../hooks/usePageCopy.js";
import usePageLists from "../hooks/usePageLists.js";
import usePageMedia from "../hooks/usePageMedia.js";
import { cdnAsset } from "../config/cdnAssets.js";
import {
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
  { original: linaYogaImg, thumbnail: linaYogaImg },
  { original: linaYogaYta2Img, thumbnail: linaYogaYta2Img },
  { original: yogaLoftImg, thumbnail: yogaLoftImg },
];

function KurserPage() {
  const copy = usePageCopy("yoga");
  const list = usePageLists("yoga");
  const media = usePageMedia("yoga");
  const faq = list(
    "faq",
    FAQ.map(({ question, answer }) => ({ title: question, body: answer })),
  )
    .filter((item) => item.title && item.body)
    .map(({ title, body }) => ({ question: title, answer: body }));
  const instructor = {
    ...INSTRUCTOR,
    name: copy("instructor.title"),
    role: copy("instructor.role"),
    bio: copy("instructor.bio"),
  };
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

  const siteCopy = useSiteCopy();
  const contactSubject = nextPassItem
    ? `${siteCopy("courses.inquiry-prefix") || "Fråga om"} ${nextPassItem.title} ${formatPassDate(nextPassItem)}`
    : copy("hero.contact-cta");

  const spySections = [
    { id: "kurser-hero", label: siteCopy("nav.start") },
    ...(nextPassItem
      ? [{ id: passAnchor(nextPassItem), label: copy("hero.next-pass-badge") }]
      : [{ id: "kommande", label: siteCopy("courses.upcoming-label") }]),
    { id: "om-lina", label: instructor.name.split(" ")[0] },
    { id: "fragor-och-svar", label: siteCopy("courses.faq-label") },
    { id: "gardens-atmosfar", label: siteCopy("courses.photos-label") },
    { id: "hitta-hit", label: siteCopy("courses.directions-label") },
    { id: "tidigare-pass", label: siteCopy("courses.past-label") },
    { id: "kontakt", label: siteCopy("nav.contact") },
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
                <span>{copy("hero.next-pass-badge") || "Nästa tillfälle:"} {formatPassDate(nextPassItem)}</span>
              </div>
            )}
            <h1>{copy("hero.title")}</h1>
            <a
              className="kurser-hero__link"
              href={nextPassItem ? `#${passAnchor(nextPassItem)}` : "#kontakt"}
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo(
                  nextPassItem ? passAnchor(nextPassItem) : "kontakt",
                  SPY_OFFSET
                );
              }}
            >
              {nextPassItem
                ? copy("hero.next-cta")
                : copy("hero.contact-cta")}
              <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
        </header>

        {upcomingPassesList.length === 0 ? (
          <NoUpcomingSection
            trackId={YOGA_TRACK_ID}
            background="alt"
            heading={copy("empty.title")}
            body={copy("empty.body")}
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

        <InstructorSection
          id="om-lina"
          instructor={instructor}
          label={copy("instructor.eyebrow")}
          background="white"
          variant="split"
        />

        <SectionDivider above="white" below="green" variant="wave" />

        <FaqSection
          faq={faq}
          label={copy("faq.eyebrow")}
          heading={copy("faq.title")}
          background="green"
        />

        <SectionDivider above="green" below="alt" variant="hill" />

        <CourseBand
          id="gardens-atmosfar"
          background="alt"
          className="kurser-recap"
        >
          <div className="kurser-recap__header">
            <span className="kurser-label">{copy("gallery.eyebrow")}</span>
            <h2>{copy("gallery.title")}</h2>
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLightbox(idx);
                  }
                }}
              >
                <img src={imgItem.thumbnail} alt="" />
              </figure>
            ))}
          </div>
        </CourseBand>

        <DirectionsSection
          background="white"
          variant="split-reverse"
          description={copy("directions.body")}
        />

        <SectionDivider above="white" below="alt" variant="wave" />

        <PastPassesSection
          passes={PAST_PASSES}
          trackId={YOGA_TRACK_ID}
          heading={copy("past.title")}
          background="alt"
          variant="timeline"
        />

        <SectionDivider above="alt" below="green" variant="hill" />

        <ContactSection
          heading={copy("contact.title")}
          body={copy("contact.body")}
          email={instructor.email}
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
          imageAlt=""
          eyebrow={copy("other.eyebrow")}
          heading={copy("other.title")}
          body={copy("other.body")}
          linkLabel={copy("other.cta")}
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
