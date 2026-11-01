import PropTypes from "prop-types";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Mail, X } from "lucide-react";
import { useSiteCopy } from "../hooks/usePageCopy.js";
import { ceramicImageProps, ceramicName } from "../data/ceramics.js";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Keyframe that lays `node` over the photo in `tile`: scaled to cover it and clipped to its
 * square crop, so the piece grows out of the grid without being squashed.
 */
function overTile(node, tile) {
  const from = (tile.querySelector("img") || tile).getBoundingClientRect();
  const to = node.getBoundingClientRect();
  if (!to.width || !from.width) return null;
  const scale = Math.max(from.width / to.width, from.height / to.height);
  const insetX = Math.max(0, (to.width - from.width / scale) / 2);
  const insetY = Math.max(0, (to.height - from.height / scale) / 2);
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  return { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, clipPath: `inset(${insetY}px ${insetX}px)` };
}

const settled = { transform: "none", clipPath: "inset(0px 0px)" };

/**
 * One piece lifted out of the grid: it grows from its tile to the middle of the screen while the
 * page behind blurs, with the ask link under it. State, keys, focus and Back come from
 * useGalleryLightbox; this draws it.
 */
function CeramicFocus({ lightbox, pieces, tileFor, email, ask }) {
  const siteCopy = useSiteCopy();
  const imageRef = useRef(null);
  const [closing, setClosing] = useState(false);
  const [touchX, setTouchX] = useState(null);
  const { isOpen, currentIndex, dialogRef, closeButtonRef } = lightbox;
  const piece = isOpen ? pieces[currentIndex] : null;

  // Grows out of the tile it was opened from.
  useLayoutEffect(() => {
    const image = imageRef.current;
    const tile = isOpen && tileFor(currentIndex);
    if (!image || !tile || reducedMotion()) return;
    const start = overTile(image, tile);
    if (start) image.animate([start, settled], { duration: 520, easing: EASE });
    // Only on opening; paging to the next piece cross-fades instead.
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = "hidden";
    window.storegardenLenis?.stop();
    return () => {
      document.body.style.overflow = "";
      window.storegardenLenis?.start();
      setClosing(false);
    };
  }, [isOpen]);

  if (!piece) return null;

  // Settles back into its tile before the view goes away.
  const close = () => {
    if (closing) return;
    const image = imageRef.current;
    const tile = tileFor(currentIndex);
    const end = image && tile && !reducedMotion() ? overTile(image, tile) : null;
    if (!end) return lightbox.closeLightbox();
    setClosing(true);
    image.animate([settled, end], { duration: 380, easing: EASE, fill: "forwards" })
      .finished.then(lightbox.closeLightbox, lightbox.closeLightbox);
  };

  const name = ceramicName(piece);
  const several = pieces.length > 1;
  const swipe = (event) => {
    if (touchX === null || !several) return;
    const distance = event.changedTouches[0].clientX - touchX;
    if (distance > 50) lightbox.goToPreviousImage();
    if (distance < -50) lightbox.goToNextImage();
    setTouchX(null);
  };

  return createPortal(
    <div
      ref={dialogRef}
      className={`ceramic-focus${closing ? " is-closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={name}
      onClick={close}
      onTouchStart={(event) => setTouchX(event.touches[0].clientX)}
      onTouchEnd={swipe}
      data-lenis-prevent
    >
      <button ref={closeButtonRef} type="button" className="ceramic-focus__close" onClick={close} aria-label={siteCopy("ui.close")}>
        <X size={22} aria-hidden="true" />
      </button>

      <figure className="ceramic-focus__piece">
        <img
          key={piece.id}
          ref={imageRef}
          onClick={(event) => event.stopPropagation()}
          {...ceramicImageProps(piece, "(min-width: 760px) 720px, 92vw")}
          className="ceramic-focus__image"
        />
      </figure>

      <div className="ceramic-focus__actions" onClick={(event) => event.stopPropagation()}>
        {several && (
          <button type="button" className="ceramic-focus__step" onClick={lightbox.goToPreviousImage} aria-label={siteCopy("ui.prev-image")}>
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
        )}
        {email && (
          <a className="btn btn--primary" href={`mailto:${email}?subject=${encodeURIComponent(`${ask} "${name}"`)}`}>
            <Mail size={18} aria-hidden="true" />
            {ask}
          </a>
        )}
        {several && (
          <button type="button" className="ceramic-focus__step" onClick={lightbox.goToNextImage} aria-label={siteCopy("ui.next-image")}>
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}

CeramicFocus.propTypes = {
  lightbox: PropTypes.shape({
    isOpen: PropTypes.bool.isRequired,
    currentIndex: PropTypes.number.isRequired,
    closeLightbox: PropTypes.func.isRequired,
    goToNextImage: PropTypes.func.isRequired,
    goToPreviousImage: PropTypes.func.isRequired,
    dialogRef: PropTypes.any,
    closeButtonRef: PropTypes.any,
  }).isRequired,
  pieces: PropTypes.array.isRequired,
  tileFor: PropTypes.func.isRequired,
  email: PropTypes.string,
  ask: PropTypes.string,
};

export default CeramicFocus;
