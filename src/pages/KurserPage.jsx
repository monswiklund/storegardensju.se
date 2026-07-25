import { useState } from "react";
import { ArrowDown, ArrowUpRight, Calendar, Clock, Mail, MapPin } from "lucide-react";
import MailtoFallback from "../features/contact/MailtoFallback.jsx";
import GalleryLightbox from "../features/gallery/ImageGallery/components/GalleryLightbox.jsx";
import useGalleryLightbox from "../features/gallery/ImageGallery/hooks/useGalleryLightbox.js";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta, activeJsonLd } from "../config/seoMeta.js";
import "./KurserPages.css";
import "../features/gallery/ImageGallery/Gallery.css";

import linaYogaHeaderImg from "/images/evenemang/lina-yoga-header.jpg";
import linaYogaImg from "/images/evenemang/lina-yoga.jpg";
import linaYogaYta2Img from "/images/evenemang/lina-yoga-yta2.jpg";
import mala1Img from "/images/evenemang/mala1.jpg";
import mala2Img from "/images/evenemang/mala2.jpg";
import yogaLoftImg from "/images/evenemang/yoga-loft.webp";
import maleriKursImg from "/images/evenemang/maleri-kurs.webp";

// Module-level so the reference is stable across renders (useSeo dep) and so
// the same date gating runs client-side as in the prerendered HTML.
const KURSER_JSONLD = activeJsonLd(seoMeta.kurser);

const CONTACT_EMAIL = "bylinawiklund@gmail.com";
const CONTACT_SUBJECT = "Anmälan: Yoga på loftet 30/7";

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
    original: mala1Img,
    thumbnail: mala1Img,
    description: "Målarkurs och skapande på Storegården 7",
    originalAlt: "Målarkurs och skapande på Storegården 7",
  },
  {
    original: mala2Img,
    thumbnail: mala2Img,
    description: "Konst och måleri i ateljén på Storegården 7",
    originalAlt: "Konst och måleri i ateljén på Storegården 7",
  },
  {
    original: yogaLoftImg,
    thumbnail: yogaLoftImg,
    description: "Yoga i stämningsfull gårdsmiljö på Storegården 7",
    originalAlt: "Yoga i stämningsfull gårdsmiljö på Storegården 7",
  },
  {
    original: maleriKursImg,
    thumbnail: maleriKursImg,
    description: "Skapande och kurser på Storegården 7 nära Lidköping",
    originalAlt: "Skapande och kurser på Storegården 7 nära Lidköping",
  },
];

function KurserPage() {
  const [showMailFallback, setShowMailFallback] = useState(false);

  useSeo({
    ...seoMeta.kurser,
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
      <main id="main-content">
        <header className="kurser-hero">
          <div
            className="kurser-hero__bg"
            style={{
              backgroundImage: `url(${linaYogaHeaderImg})`,
            }}
          />
          <div className="kurser-hero__overlay" />
          <div className="kurser-hero__inner">
            <div className="kurser-hero__badge">
              <span className="kurser-hero__badge-pulse" />
              <span>Nästa tillfälle: Torsdag 30 juli</span>
            </div>
            <h1>Yoga på loftet</h1>
            <p>
              Välkommen på en lugn och skön yogastund i vår stämningsfulla gårdsmiljö tillsammans med Lina Wiklund.
            </p>
            <a className="kurser-hero__link" href="#anmalan">
              Boka / Anmäl intresse
              <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
        </header>

        <section id="anmalan" className="kurser-details">
          <div className="kurser-details__container">
            <div className="kurser-details__info">
              <span className="kurser-label">Nästa event</span>
              <h2>Yoga på loftet med Lina Wiklund</h2>
              <p className="kurser-details__description">
                Välkommen på ett 90 minuters yogapass med guidning och skön vila i den fridfulla miljö på loftet på Storegården 7.
              </p>
              
              <ul className="kurser-details__meta">
                <li>
                  <Calendar size={20} aria-hidden="true" />
                  <span><strong>Torsdag 30 juli</strong></span>
                </li>
                <li>
                  <Clock size={20} aria-hidden="true" />
                  <span><strong>Klockan 18:00</strong> (Välkommen från 17:30 för att landa och förbereda dig)</span>
                </li>
                <li>
                  <MapPin size={20} aria-hidden="true" />
                  <span>Storegården 7, Rackeby (Lidköping)</span>
                </li>
              </ul>

              <div className="kurser-details__extra">
                <p><strong>Pris: 150:- /person</strong></p>
                <p style={{ marginTop: "4px" }}>Betalning sker på plats, ingen föranmälan behövs.</p>
                <p style={{ marginTop: "12px", opacity: 0.9 }}><strong>Yogamattor finns på plats.</strong> Har du en egen matta får du självklart gärna ta med den!</p>
              </div>
            </div>

            <div className="kurser-details__action">
              <div className="kurser-action-card">
                <h3>Frågor & Kontakt</h3>
                <p>Ingen föranmälan krävs (drop-in), men har du funderingar eller vill kontakta Lina inför passet?</p>
                <a
                  className="kurser-interest__link"
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CONTACT_SUBJECT)}`}
                  onClick={() => setShowMailFallback(true)}
                >
                  <Mail size={17} aria-hidden="true" />
                  Skicka ett meddelande
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
                {showMailFallback && (
                  <MailtoFallback
                    email={CONTACT_EMAIL}
                    copyText={`Till: ${CONTACT_EMAIL}\nÄmne: ${CONTACT_SUBJECT}`}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="kursdagen" className="kurser-recap">
          <div className="kurser-recap__copy">
            <span className="kurser-label">Gårdens atmosfär</span>
            <h2>Sköna stunder och yoga i Lidköping.</h2>
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
                <img
                  src={imgItem.thumbnail}
                  alt={imgItem.originalAlt}
                />
              </figure>
            ))}
          </div>
        </section>

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

