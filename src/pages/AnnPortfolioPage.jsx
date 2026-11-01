import { useMemo } from "react";
import { ArrowDown, ArrowRight, Instagram, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { ExploreMore, SectionDivider } from "../components";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import GalleryLightbox from "../features/gallery/ImageGallery/components/GalleryLightbox.jsx";
import useGalleryLightbox from "../features/gallery/ImageGallery/hooks/useGalleryLightbox.js";
import "../features/gallery/ImageGallery/Gallery.css";
import { useMemberProfile } from "../features/team/teamProfile.js";
import { seoMeta } from "../config/seoMeta.js";
import useArtworks, { useCeramics } from "../hooks/useArtworks.js";
import { ceramicImageProps } from "../data/ceramics.js";
import usePageCopy from "../hooks/usePageCopy.js";
import { useSeo } from "../hooks/useSeo.js";
import { smoothScrollTo } from "../utils/scrollUtils.js";
import "./AnnPortfolioPage.css";
import { lightboxTile } from "../utils/tileFlight.js";

const externalUrl = (url) => (/^https?:\/\//.test(url) ? url : `https://${url}`);

/** An artwork from the CMS as the page shows it: the uncropped 900px size first, the original when wide. */
function toPiece(artwork) {
  const { image } = artwork;
  const medium = image.sizes?.medium;
  return {
    id: artwork.id,
    title: artwork.title,
    details: artwork.details,
    size: artwork.size,
    alt: image.alt || artwork.title,
    src: image.url,
    srcSmall: medium?.url || image.url,
    srcSet: medium?.url && medium.width && image.width ? `${medium.url} ${medium.width}w, ${image.url} ${image.width}w` : undefined,
    width: image.width,
    height: image.height,
  };
}

function Painting({ work, index, onOpen, sizes, showLarger, priority = false }) {
  return (
    <button
      type="button"
      className="ann-painting"
      onClick={() => onOpen(index)}
      data-lightbox-index={index}
      aria-label={`${showLarger}: ${work.title}`}
    >
      <img
        src={work.srcSmall}
        srcSet={work.srcSet}
        sizes={work.srcSet ? sizes : undefined}
        width={work.width}
        height={work.height}
        alt={work.alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
      />
    </button>
  );
}

// The mail names the work, so Ann knows which painting the question is about.
function WorkCaption({ work, email, ask }) {
  const subject = encodeURIComponent(`${ask} "${work.title}"`);
  return (
    <figcaption className="ann-caption">
      <span className="ann-caption__title">{work.title}</span>
      {work.details && <span className="ann-caption__details">{work.details}</span>}
      {email && (
        <a className="ann-caption__ask" href={`mailto:${email}?subject=${subject}`}>
          <Mail size={15} aria-hidden="true" />
          {ask}
        </a>
      )}
    </figcaption>
  );
}

function AnnPortfolioPage() {
  useSeo(seoMeta.annPortfolio);
  const copy = usePageCopy("portfolio-ann");
  const profile = useMemberProfile("ann");
  const artworks = useArtworks();
  const email = profile.contact?.email?.trim();
  const instagram = profile.contact?.instagram?.trim();

  const { works, studio, lightboxImages } = useMemo(() => {
    const works = artworks.filter((artwork) => artwork.placement === "wall").map(toPiece);
    const studio = artworks.filter((artwork) => artwork.placement === "studio").map(toPiece);
    // One lightbox pages through the paintings first, then the studio photos.
    const lightboxImages = [...works, ...studio].map((item) => ({
      original: item.src,
      thumbnail: item.srcSmall,
      originalAlt: item.alt,
      filename: `ann-${item.id}`,
      width: item.width,
      height: item.height,
    }));
    return { works, studio, lightboxImages };
  }, [artworks]);
  const [heroWork, ...wallWorks] = works;
  const lightbox = useGalleryLightbox(lightboxImages, "ann");
  const showLarger = copy("work.show-larger");
  const ask = copy("work.ask");
  const ceramics = useCeramics();
  const ceramicsSoon = copy("ceramics.soon");

  return (
    <main role="main" id="main-content" className="ann-page">
      <section className="ann-hero" aria-labelledby="ann-title">
        <div className="ann-hero__text">
          <h1 id="ann-title">{copy("hero.title")}</h1>
          <p className="ann-hero__lead">{copy("hero.lead")}</p>
          <div className="ann-hero__actions">
            {wallWorks.length > 0 && <a
              href="#verk"
              className="btn btn--primary"
              onClick={(event) => {
                event.preventDefault();
                smoothScrollTo("verk", 80);
              }}
            >
              <span>{copy("hero.works-cta")}</span>
              <ArrowDown size={18} aria-hidden="true" />
            </a>}
            {email && (
              <a href={`mailto:${email}`} className="btn btn--secondary">
                <Mail size={18} aria-hidden="true" />
                <span>{copy("ui.mail-cta")}</span>
              </a>
            )}
          </div>
        </div>
        {heroWork && (
          <figure className="ann-hero__work">
            <Painting
              work={heroWork}
              index={0}
              onOpen={lightbox.openLightbox}
              sizes="(min-width: 960px) 58vw, 100vw"
              showLarger={showLarger}
              priority
            />
            <WorkCaption work={heroWork} email={email} ask={ask} />
          </figure>
        )}
      </section>

      {wallWorks.length > 0 && <section id="verk" className="ann-wall" aria-labelledby="ann-wall-title">
        <header className="ann-section-head">
          <h2 id="ann-wall-title">{copy("wall.title")}</h2>
          <p>{copy("wall.lead")}</p>
        </header>
        <div className="ann-wall__grid">
          {wallWorks.map((work, i) => (
            <FadeInSection key={work.id}>
              <figure className={`ann-work ann-work--${work.size ?? "large"}`}>
                <Painting
                  work={work}
                  index={i + 1}
                  onOpen={lightbox.openLightbox}
                  sizes="(min-width: 960px) 34vw, (min-width: 600px) 46vw, 92vw"
                  showLarger={showLarger}
                />
                <WorkCaption work={work} email={email} ask={ask} />
              </figure>
            </FadeInSection>
          ))}
        </div>
      </section>}

      {/* A look at the ceramics: four pieces once some are published, a line of text before that. */}
      {ceramics.length > 0 ? (
        <section className="ann-ceramics-teaser" aria-labelledby="ann-ceramics-title">
          <header className="ann-section-head">
            <h2 id="ann-ceramics-title">{copy("ceramics.teaser-title")}</h2>
            <p>{copy("ceramics.teaser-lead")}</p>
          </header>
          <Link to="/ann/keramik/" className="ann-ceramics-teaser__pieces" tabIndex={-1} aria-hidden="true">
            {ceramics.slice(0, 4).map((piece) => (
              <img key={piece.id} {...ceramicImageProps(piece, "(min-width: 760px) 22vw, 46vw")} loading="lazy" decoding="async" />
            ))}
          </Link>
          <Link to="/ann/keramik/" className="ann-studio__link">
            {copy("ceramics.teaser-link")} ({ceramics.length})
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      ) : ceramicsSoon && (
        <aside className="ann-ceramics-teaser ann-ceramics-teaser--soon" aria-label={copy("ceramics.teaser-title")}>
          <span className="ann-ceramics-teaser__eyebrow">{copy("ceramics.teaser-title")}</span>
          <p>{ceramicsSoon}</p>
        </aside>
      )}

      <SectionDivider above="alt" below="green" variant="wave" />

      <section className="ann-studio" aria-labelledby="ann-studio-title">
        <div className="ann-studio__inner">
          <header className="ann-section-head">
            <h2 id="ann-studio-title">{copy("studio.title")}</h2>
            <p>{copy("studio.lead")}</p>
          </header>
          {studio.length > 0 && <ul className="ann-studio__grid">
            {studio.map((photo, i) => (
              <li key={photo.id}>
                <button
                  type="button"
                  className="ann-studio__photo"
                  onClick={() => lightbox.openLightbox(works.length + i)}
                  data-lightbox-index={works.length + i}
                  aria-label={`${showLarger}: ${photo.alt}`}
                >
                  <img
                    src={photo.srcSmall}
                    width={photo.width}
                    height={photo.height}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              </li>
            ))}
          </ul>}
          <Link to="/kontakt/" className="ann-studio__link">
            {copy("studio.link")}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <SectionDivider above="green" below="white" variant="hill" />

      <section className="ann-about" aria-labelledby="ann-about-title">
        <img
          className="ann-about__portrait"
          src={profile.imageSrc}
          alt={`Porträtt av ${profile.title}`}
          width="320"
          height="320"
          loading="lazy"
        />
        <div className="ann-about__text">
          <h2 id="ann-about-title">{copy("about.title")}</h2>
          {/* A bio in Teamet is one text field; a blank line starts a new paragraph. */}
          {profile.texts.flatMap((text) => text.split(/\n\s*\n/)).map((text) => (
            <p key={text}>{text}</p>
          ))}
          <div className="ann-about__actions">
            {email && (
              <a href={`mailto:${email}`} className="btn btn--primary">
                <Mail size={18} aria-hidden="true" />
                <span>{copy("ui.mail-cta")}</span>
              </a>
            )}
            <Link to="/kurser/konst/" className="btn btn--secondary">
              <span>{copy("about.course-cta")}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          {instagram && (
            <a className="ann-about__instagram" href={externalUrl(instagram)} target="_blank" rel="noreferrer">
              <Instagram size={18} aria-hidden="true" />
              @{instagram.replace(/\/+$/, "").split("/").pop().replace(/^@/, "")}
            </a>
          )}
        </div>
      </section>

      <ExploreMore exclude={["kurser-konst"]} background="green" />

      <GalleryLightbox
        isOpen={lightbox.isOpen}
        images={lightboxImages}
        currentIndex={lightbox.currentIndex}
        currentImage={lightbox.currentImage}
        onClose={lightbox.closeLightbox}
        onNext={lightbox.goToNextImage}
        onPrevious={lightbox.goToPreviousImage}
        onSelectImage={lightbox.goToImage}
        dialogRef={lightbox.dialogRef}
        closeButtonRef={lightbox.closeButtonRef}
        tileFor={lightboxTile}
      />
    </main>
  );
}

export default AnnPortfolioPage;
