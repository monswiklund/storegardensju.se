import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import useGalleryLightbox from "../features/gallery/ImageGallery/hooks/useGalleryLightbox.js";
import { annCeramicsSeoMeta } from "../config/seoMeta.js";
import { CERAMIC_TYPES, ceramicImageProps, ceramicName } from "../data/ceramics.js";
import { useMemberProfile } from "../features/team/teamProfile.js";
import { useCeramics } from "../hooks/useArtworks.js";
import usePageCopy from "../hooks/usePageCopy.js";
import { useSeo } from "../hooks/useSeo.js";
import "./AnnPortfolioPage.css";
import CeramicFocus from "./CeramicFocus.jsx";
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
  // The hook preloads `original` for the neighbours; the focus view mostly shows the medium size.
  const focusImages = useMemo(
    () => pieces.map((piece) => ({ original: piece.image.sizes?.medium?.url || piece.image.url })),
    [pieces],
  );
  const lightbox = useGalleryLightbox(focusImages, "ann-keramik");
  const tiles = useRef([]);
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
                {type === "all" ? copy("ceramics.filter-all") : CERAMIC_TYPES[type].filter}
                <span className="ann-ceramics__count">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {pieces.length > 0 && (
        <ul className="ann-ceramics__grid">
          {pieces.slice(0, shown).map((piece, index) => (
            <li key={piece.id}>
              <button
                ref={(node) => {
                  tiles.current[index] = node;
                }}
                type="button"
                className={`ann-ceramics__photo${lightbox.isOpen && lightbox.currentIndex === index ? " is-lifted" : ""}`}
                onClick={() => lightbox.openLightbox(index)}
                aria-label={`${copy("work.show-larger")}: ${ceramicName(piece)}`}
              >
                <img
                  {...ceramicImageProps(piece, "(min-width: 1100px) 25vw, (min-width: 700px) 33vw, 50vw")}
                  loading={index < 8 ? "eager" : "lazy"}
                  decoding="async"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <div className="ann-ceramics__more">
          <button type="button" className="btn btn--secondary" onClick={() => setShown((count) => count + BATCH)}>
            {copy("ceramics.show-more")} ({remaining})
          </button>
        </div>
      )}

      {/* The pieces end here, so lead on to the paintings instead of a dead end. */}
      <Link to="/ann/" className="ann-studio__link ann-ceramics__onward">
        {copy("ceramics.paintings-link", "Se Anns målningar")}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>

      <CeramicFocus
        lightbox={lightbox}
        pieces={pieces}
        tileFor={(index) => tiles.current[index]}
        email={email}
        ask={ask}
      />
    </main>
  );
}

export default AnnCeramicsPage;
