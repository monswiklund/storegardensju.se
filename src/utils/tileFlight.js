/**
 * Keyframes for a photo that grows out of its tile in a grid and settles back into it.
 * The big photo is moved and scaled over the tile and clipped to what the tile shows,
 * so it is never squashed on the way.
 */

export const FLIGHT_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export const settled = { transform: "none", clipPath: "inset(0px 0px)" };

export const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** The photo inside a tile; a tile may also be the <img> itself. */
export const tilePhoto = (tile) => (tile.tagName === "IMG" ? tile : tile.querySelector("img") || tile);

/** The opener marked data-lightbox-index={index}: one lightbox per page, so the page is the scope. */
export const lightboxTile = (index) => document.querySelector(`[data-lightbox-index="${index}"]`);

/**
 * Keyframe that lays `node` over the photo in `tile`. With `contain`, the photo fills only part
 * of `node` (object-fit: contain) in its own proportions; it then covers the tile the way a
 * cropped thumbnail does, clipped to what the tile shows.
 */
export function overTile(node, tile, { contain = false } = {}) {
  const photo = tilePhoto(tile);
  const from = photo.getBoundingClientRect();
  const to = node.getBoundingClientRect();
  if (!to.width || !to.height || !from.width || !from.height) return null;
  const ratio = photo.naturalWidth && photo.naturalHeight ? photo.naturalWidth / photo.naturalHeight : from.width / from.height;
  const shown = contain
    ? { width: Math.min(to.width, to.height * ratio), height: Math.min(to.height, to.width / ratio) }
    : to;
  const scale = Math.max(from.width / shown.width, from.height / shown.height);
  const insetX = Math.max(0, (to.width - from.width / scale) / 2);
  const insetY = Math.max(0, (to.height - from.height / scale) / 2);
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  return { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, clipPath: `inset(${insetY}px ${insetX}px)` };
}

/** Stops a CSS entrance fade that would start the flying photo half transparent. */
export function cancelCssAnimation(node, name) {
  node.getAnimations?.().forEach((animation) => animation.animationName === name && animation.cancel());
}
