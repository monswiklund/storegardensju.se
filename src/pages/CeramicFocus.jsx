import PropTypes from "prop-types";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Mail, X } from "lucide-react";
import { useSiteCopy } from "../hooks/usePageCopy.js";
import { ceramicImageProps, ceramicName } from "../data/ceramics.js";
import { FLIGHT_EASE, cancelCssAnimation, overTile, reducedMotion, settled } from "../utils/tileFlight.js";

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
    // The fade meant for paging would start the piece at 40% while its tile is already hidden.
    cancelCssAnimation(image, "ceramic-focus-swap");
    const start = overTile(image, tile);
    if (start) image.animate([start, settled], { duration: 520, easing: FLIGHT_EASE });
    // Only on opening; paging to the next piece cross-fades instead.
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    // Keeps the scrollbar's space, so the page behind does not jump sideways when it locks.
    document.documentElement.style.scrollbarGutter = "stable";
    document.body.style.overflow = "hidden";
    window.storegardenLenis?.stop();
    return () => {
      document.documentElement.style.scrollbarGutter = "";
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
    image.animate([settled, end], { duration: 380, easing: FLIGHT_EASE, fill: "forwards" })
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
