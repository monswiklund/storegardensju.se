// How Ann's ceramics read on the site. The types are the CMS's select values (Ceramics.ts).
export const CERAMIC_TYPES = {
  skal: { name: "Skålar", filter: "Skålar" },
  kopp: { name: "Koppar och muggar", filter: "Koppar och muggar" },
  vas: { name: "Vaser", filter: "Vaser" },
  fat: { name: "Fat och tallrikar", filter: "Fat och tallrikar" },
  kanna: { name: "Kannor", filter: "Kannor" },
  skulptur: { name: "Skulpturer", filter: "Skulpturer" },
  ovrigt: { name: "Keramik", filter: "Övrigt" },
};

/** The photo's name, or its type when the editor left the name empty (a photo often shows a group). */
export const ceramicName = (piece) => piece.title || CERAMIC_TYPES[piece.type]?.name || "Keramik";

/** Glaze and size on one line. */
export const ceramicDetails = (piece) => [piece.glaze, piece.dimensions].filter(Boolean).join(" · ");

/** The editor's description, else one built from what is known about the piece. */
export const ceramicAlt = (piece) =>
  piece.image.alt || [`${ceramicName(piece)} av Ann Wiklund`, piece.glaze].filter(Boolean).join(", ");

/** <img> attributes: the 900px size first, the original when wide, cropped around the focal point. */
export function ceramicImageProps(piece, sizes) {
  const { image } = piece;
  const medium = image.sizes?.medium;
  const srcSet = medium?.url && medium.width && image.width ? `${medium.url} ${medium.width}w, ${image.url} ${image.width}w` : undefined;
  return {
    src: medium?.url || image.url,
    srcSet,
    sizes: srcSet ? sizes : undefined,
    width: medium?.width || image.width || undefined,
    height: medium?.height || image.height || undefined,
    alt: ceramicAlt(piece),
    style: { objectPosition: `${image.focalX ?? 50}% ${image.focalY ?? 50}%` },
  };
}
