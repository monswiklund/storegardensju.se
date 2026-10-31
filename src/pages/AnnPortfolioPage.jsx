import { ArrowDown, ArrowRight, Instagram, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { ExploreMore, SectionDivider } from "../components";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import GalleryLightbox from "../features/gallery/ImageGallery/components/GalleryLightbox.jsx";
import useGalleryLightbox from "../features/gallery/ImageGallery/hooks/useGalleryLightbox.js";
import "../features/gallery/ImageGallery/Gallery.css";
import { profiles } from "../data/profileData.js";
import {
  ANN_EMAIL,
  ANN_INSTAGRAM,
  annStudio,
  annWorks,
  askAboutWork,
} from "../data/annPortfolio.js";
import { seoMeta } from "../config/seoMeta.js";
import { useSeo } from "../hooks/useSeo.js";
import { smoothScrollTo } from "../utils/scrollUtils.js";
import "./AnnPortfolioPage.css";

const [heroWork, ...wallWorks] = annWorks;

// One lightbox pages through the paintings first, then the studio photos.
const lightboxImages = [...annWorks, ...annStudio].map((item) => ({
  original: item.src,
  thumbnail: item.srcSmall,
  originalAlt: item.alt,
  filename: item.id,
  width: item.width,
  height: item.height,
}));
const studioOffset = annWorks.length;

function Painting({ work, index, onOpen, sizes, priority = false }) {
  return (
    <button
      type="button"
      className="ann-painting"
      onClick={() => onOpen(index)}
      aria-label={`Visa större: ${work.title}`}
    >
      <img
        src={work.srcSmall}
        srcSet={`${work.srcSmall} 800w, ${work.src} 1800w`}
        sizes={sizes}
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

function WorkCaption({ work }) {
  return (
    <figcaption className="ann-caption">
      <span className="ann-caption__title">{work.title}</span>
      {work.details && <span className="ann-caption__details">{work.details}</span>}
      <a className="ann-caption__ask" href={askAboutWork(work)}>
        <Mail size={15} aria-hidden="true" />
        Fråga om verket
      </a>
    </figcaption>
  );
}

function AnnPortfolioPage() {
  useSeo(seoMeta.annPortfolio);
  const profile = profiles.ann;
  const lightbox = useGalleryLightbox(lightboxImages, "ann");

  return (
    <main role="main" id="main-content" className="ann-page">
      <section className="ann-hero" aria-labelledby="ann-title">
        <div className="ann-hero__text">
          <h1 id="ann-title">Ann Wiklund</h1>
          <p className="ann-hero__lead">
            Måleri och teckning från ateljén på Storegården 7 i Rackeby, utanför Lidköping.
          </p>
          <div className="ann-hero__actions">
            <a
              href="#verk"
              className="btn btn--primary"
              onClick={(event) => {
                event.preventDefault();
                smoothScrollTo("verk", 80);
              }}
            >
              <span>Se verken</span>
              <ArrowDown size={18} aria-hidden="true" />
            </a>
            <a href={`mailto:${ANN_EMAIL}`} className="btn btn--secondary">
              <Mail size={18} aria-hidden="true" />
              <span>Mejla Ann</span>
            </a>
          </div>
        </div>
        <figure className="ann-hero__work">
          <Painting
            work={heroWork}
            index={0}
            onOpen={lightbox.openLightbox}
            sizes="(min-width: 960px) 58vw, 100vw"
            priority
          />
          <WorkCaption work={heroWork} />
        </figure>
      </section>

      <section id="verk" className="ann-wall" aria-labelledby="ann-wall-title">
        <header className="ann-section-head">
          <h2 id="ann-wall-title">Verk</h2>
          <p>
            Ett urval målningar. Tryck på en bild för att se den större, och hör av dig om
            du vill veta mer om något av verken.
          </p>
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
                />
                <WorkCaption work={work} />
              </figure>
            </FadeInSection>
          ))}
        </div>
      </section>

      <SectionDivider above="alt" below="green" variant="wave" />

      <section className="ann-studio" aria-labelledby="ann-studio-title">
        <div className="ann-studio__inner">
          <header className="ann-section-head">
            <h2 id="ann-studio-title">I ateljén</h2>
            <p>
              Kort, skisser och mindre målningar finns på plats i ateljén på gården.
            </p>
          </header>
          <ul className="ann-studio__grid">
            {annStudio.map((photo, i) => (
              <li key={photo.id}>
                <button
                  type="button"
                  className="ann-studio__photo"
                  onClick={() => lightbox.openLightbox(studioOffset + i)}
                  aria-label={`Visa större: ${photo.alt}`}
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
          </ul>
          <Link to="/kontakt/" className="ann-studio__link">
            Hitta hit
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <SectionDivider above="green" below="white" variant="hill" />

      <section className="ann-about" aria-labelledby="ann-about-title">
        <img
          className="ann-about__portrait"
          src={profile.imageSrc}
          alt="Porträtt av Ann Wiklund"
          width="320"
          height="320"
          loading="lazy"
        />
        <div className="ann-about__text">
          <h2 id="ann-about-title">Om Ann</h2>
          {profile.texts.map((text) => (
            <p key={text}>{text}</p>
          ))}
          <div className="ann-about__actions">
            <a href={`mailto:${ANN_EMAIL}`} className="btn btn--primary">
              <Mail size={18} aria-hidden="true" />
              <span>Mejla Ann</span>
            </a>
            <Link to="/kurser/konst/" className="btn btn--secondary">
              <span>Måla med Ann</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <a className="ann-about__instagram" href={ANN_INSTAGRAM} target="_blank" rel="noreferrer">
            <Instagram size={18} aria-hidden="true" />
            @annwiklundstudio
          </a>
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
      />
    </main>
  );
}

export default AnnPortfolioPage;
