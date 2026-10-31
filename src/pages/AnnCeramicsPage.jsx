import { useMemo, useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import GalleryLightbox from "../features/gallery/ImageGallery/components/GalleryLightbox.jsx";
import useGalleryLightbox from "../features/gallery/ImageGallery/hooks/useGalleryLightbox.js";
import "../features/gallery/ImageGallery/Gallery.css";
import { annCeramicsSeoMeta } from "../config/seoMeta.js";
import { CERAMIC_TYPES, ceramicAlt, ceramicDetails, ceramicImageProps, ceramicName } from "../data/ceramics.js";
import { useMemberProfile } from "../features/team/teamProfile.js";
import { useCeramics } from "../hooks/useArtworks.js";
import usePageCopy from "../hooks/usePageCopy.js";
import { useSeo } from "../hooks/useSeo.js";
import "./AnnPortfolioPage.css";
import "./AnnCeramicsPage.css";

// Hundreds of pieces: the grid grows a batch at a time instead of loading every image at once.
const BATCH = 24;

function AnnCeramicsPage() {
  useSeo(annCeramicsSeoMeta);
  const copy = usePageCopy("portfolio-ann");
  const ceramics = useCeramics();
  const [activeType, setActiveType] = useState("all");
  const [shown, setShown] = useState(BATCH);
  const email = useMemberProfile("ann").contact?.email?.trim();
  const ask = copy("ceramics.ask");

  // Only the types that have published pieces get a filter, in the CMS's order.
  const types = useMemo(
    () => Object.keys(CERAMIC_TYPES).filter((type) => ceramics.some((piece) => piece.type === type)),
    [ceramics],
  );
  const pieces = useMemo(
    () => (activeType === "all" ? ceramics : ceramics.filter((piece) => piece.type === activeType)),
    [ceramics, activeType],
  );
  const lightboxImages = useMemo(
    () =>
      pieces.map((piece) => ({
        original: piece.image.url,
        thumbnail: piece.image.sizes?.medium?.url || piece.image.url,
        originalAlt: ceramicAlt(piece),
        filename: `keramik-${piece.id}`,
        width: piece.image.width,
        height: piece.image.height,
      })),
    [pieces],
  );
  const lightbox = useGalleryLightbox(lightboxImages, "ann-keramik");
  const remaining = pieces.length - shown;

  const chooseType = (type) => {
    setActiveType(type);
    setShown(BATCH);
  };

  return (
    <main role="main" id="main-content" className="ann-page ann-ceramics">
      <header className="ann-ceramics__head">
        <Link to="/ann/" className="ann-ceramics__back">
          <ArrowLeft size={16} aria-hidden="true" />
          {copy("ceramics.back")}
        </Link>
        <h1>{copy("ceramics.title")}</h1>
        <p className="ann-ceramics__lead">{copy("ceramics.lead")}</p>
        {ceramics.length === 0 && copy("ceramics.soon") && (
          <p className="ann-ceramics__soon">{copy("ceramics.soon")}</p>
        )}
      </header>

      {types.length > 1 && (
        <div className="ann-ceramics__filters" role="group" aria-label={copy("ceramics.filter-label")}>
          {["all", ...types].map((type) => {
            const count = type === "all" ? ceramics.length : ceramics.filter((piece) => piece.type === type).length;
            return (
              <button
                type="button"
                key={type}
                aria-pressed={activeType === type}
                onClick={() => chooseType(type)}
              >
                {type === "all" ? copy("ceramics.filter-all") : CERAMIC_TYPES[type].many}
                <span className="ann-ceramics__count">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {pieces.length > 0 && (
        <ul className="ann-ceramics__grid">
          {pieces.slice(0, shown).map((piece, index) => {
            const name = ceramicName(piece);
            const details = ceramicDetails(piece);
            const subject = encodeURIComponent(`${ask} "${name}"`);
            return (
              <li key={piece.id}>
                <figure className="ann-ceramics__piece">
                  <button
                    type="button"
                    className="ann-ceramics__photo"
                    onClick={() => lightbox.openLightbox(index)}
                    aria-label={`${copy("work.show-larger")}: ${name}`}
                  >
                    <img
                      {...ceramicImageProps(piece, "(min-width: 1100px) 22vw, (min-width: 700px) 30vw, 46vw")}
                      loading={index < 8 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </button>
                  <figcaption className="ann-ceramics__caption">
                    <span className="ann-ceramics__name">{name}</span>
                    {details && <span className="ann-ceramics__details">{details}</span>}
                    {email && (
                      <a className="ann-ceramics__ask" href={`mailto:${email}?subject=${subject}`}>
                        <Mail size={14} aria-hidden="true" />
                        {ask}
                      </a>
                    )}
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      )}

      {remaining > 0 && (
        <div className="ann-ceramics__more">
          <button type="button" className="btn btn--secondary" onClick={() => setShown((count) => count + BATCH)}>
            {copy("ceramics.show-more")} ({remaining})
          </button>
        </div>
      )}

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

export default AnnCeramicsPage;
