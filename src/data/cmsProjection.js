// The one contract for public CMS data. The build export (scripts/export-cms-content.js) and the
// browser (cmsService, eventsService) both read Payload through these functions, so the snapshot
// baked into the build and a live answer have the same shape and the same allowed fields.
//
// Plain JavaScript without Vite or browser APIs: Node imports it during the build.

// Every page the site renders; a build without one of them would show code fallbacks instead of
// the editors' text, so the export refuses to build.
export const REQUIRED_PAGE_SLUGS = Object.freeze([
  "site",
  "home",
  "event",
  "wedding",
  "group-days",
  "courses",
  "yoga",
  "art",
  "gallery",
  "shop",
  "about",
  "contact",
  "portfolio-mans",
  "not-found",
]);

const appearanceOptions = Object.freeze({
  pageTheme: new Set(["original", "linen", "clay", "forest"]),
  heroLayout: new Set(["original", "centered", "editorial"]),
  heroOverlay: new Set(["original", "soft", "strong"]),
  sectionSpacing: new Set(["original", "compact", "airy"]),
});

export function normalizePageAppearance(doc) {
  return Object.freeze(Object.fromEntries(
    Object.entries(appearanceOptions).map(([key, allowed]) => [
      key,
      allowed.has(doc?.[key]) ? doc[key] : "original",
    ]),
  ));
}

const absolute = (url, cmsUrl) => {
  if (typeof url !== "string" || url === "") return null;
  // Without R2 Payload serves /api/media/file/... from the CMS host itself.
  return cmsUrl ? new URL(url, `${cmsUrl}/`).href : url;
};

const text = (value) => (typeof value === "string" ? value : "");
const optionalText = (value) => (typeof value === "string" && value !== "" ? value : null);
const optionalNumber = (value) => (typeof value === "number" && Number.isFinite(value) ? value : null);

/** An upload as the site needs it: URLs, alt text and dimensions; nothing about where it is used. */
export function projectMedia(media, cmsUrl) {
  if (!media || typeof media !== "object") return null;
  const sizes = Object.fromEntries(
    Object.entries(media.sizes && typeof media.sizes === "object" ? media.sizes : {})
      .filter(([, size]) => size && typeof size === "object" && (size.url || size.filename))
      .map(([name, size]) => [name, {
        url: absolute(size.url, cmsUrl),
        filename: optionalText(size.filename),
        width: optionalNumber(size.width),
        height: optionalNumber(size.height),
      }]),
  );
  const url = absolute(media.url, cmsUrl) || absolute(media.externalUrl, cmsUrl);
  if (!url && !media.filename && Object.keys(sizes).length === 0) return null;
  return {
    id: media.id ?? null,
    url,
    alt: text(media.alt),
    filename: optionalText(media.filename),
    width: optionalNumber(media.width),
    height: optionalNumber(media.height),
    sizes,
  };
}

/** One published page, in the shape page components read. Empty values stay empty. */
export function projectPage(doc, cmsUrl) {
  const rows = Array.isArray(doc?.copy) ? doc.copy : [];
  const lists = Array.isArray(doc?.contentLists) ? doc.contentLists : [];
  const slots = Array.isArray(doc?.imageSlots) ? doc.imageSlots : [];
  return {
    slug: doc.slug,
    updatedAt: optionalText(doc.updatedAt),
    copy: Object.fromEntries(
      rows
        .filter((row) => typeof row?.key === "string" && typeof row?.value === "string")
        .map((row) => [row.key, row.value]),
    ),
    lists: Object.fromEntries(
      lists
        .filter((list) => typeof list?.key === "string")
        .map((list) => [list.key, (Array.isArray(list.items) ? list.items : []).map((item) => ({
          value: text(item?.value),
          title: text(item?.title),
          body: text(item?.body),
        }))]),
    ),
    // A slot with no image is kept as null: the editor removed it.
    images: Object.fromEntries(
      slots.filter((slot) => typeof slot?.key === "string").map((slot) => [slot.key, projectMedia(slot.image, cmsUrl)]),
    ),
    socialImage: projectMedia(doc.socialImage, cmsUrl),
    appearance: normalizePageAppearance(doc),
  };
}

/** A published event with the fields the calendar, course hubs and SEO read. */
export function projectEvent(doc, cmsUrl) {
  return {
    id: doc.id,
    legacyId: optionalText(doc.legacyId),
    title: text(doc.title),
    category: optionalText(doc.category),
    startAt: optionalText(doc.startAt),
    endAt: optionalText(doc.endAt),
    description: text(doc.description),
    location: optionalText(doc.location),
    artists: optionalText(doc.artists),
    spots: optionalText(doc.spots),
    price: optionalNumber(doc.price),
    durationMinutes: optionalNumber(doc.durationMinutes),
    dropIn: typeof doc.dropIn === "boolean" ? doc.dropIn : null,
    status: ["few_left", "fully_booked", "cancelled"].includes(doc.status) ? doc.status : "open",
    // A course that meets several times; one or none means an ordinary single-date event.
    sessions: (Array.isArray(doc.sessions) ? doc.sessions : [])
      .filter((session) => typeof session?.startAt === "string" && Number.isFinite(new Date(session.startAt).getTime()))
      .map((session) => ({ startAt: session.startAt, endAt: optionalText(session.endAt), cancelled: session.cancelled === true }))
      .sort((a, b) => new Date(a.startAt) - new Date(b.startAt)),
    bucketOverride: doc.bucketOverride === "upcoming" || doc.bucketOverride === "past" ? doc.bucketOverride : null,
    sortOrder: optionalNumber(doc.sortOrder),
    links: (Array.isArray(doc.links) ? doc.links : [])
      .filter((link) => typeof link?.href === "string" && link.href !== "")
      .map((link) => ({ href: link.href, label: text(link.label) })),
    // Images entered as addresses before the media library existed.
    images: (Array.isArray(doc.images) ? doc.images : [])
      .filter((image) => typeof image?.url === "string" && image.url !== "")
      .map((image) => ({ url: absolute(image.url, cmsUrl), alt: text(image.alt), order: optionalNumber(image.order) ?? 0 })),
    media: (Array.isArray(doc.media) ? doc.media : []).map((media) => projectMedia(media, cmsUrl)).filter(Boolean),
    mediaMigrated: Boolean(doc.mediaMigrated),
    updatedAt: optionalText(doc.updatedAt),
  };
}

/** A published shop product: what its static page and the sitemap need. */
export function projectShopProduct(doc, cmsUrl) {
  return {
    id: doc.id,
    slug: text(doc.slug),
    title: text(doc.title),
    description: text(doc.description),
    price: optionalNumber(doc.price),
    status: ["in_stock", "made_to_order", "sold_out"].includes(doc.status) ? doc.status : "in_stock",
    image: projectMedia(Array.isArray(doc.images) ? doc.images[0] : null, cmsUrl),
    updatedAt: optionalText(doc.updatedAt),
  };
}

/** A published course pass (the older bookable-session collection, kept compatible). */
export function projectCoursePass(doc) {
  return {
    id: doc.id,
    title: text(doc.title),
    track: optionalText(doc.track),
    instructor: optionalText(doc.instructor),
    startAt: optionalText(doc.startAt),
    endAt: optionalText(doc.endAt),
    price: optionalNumber(doc.price),
    spots: optionalNumber(doc.spots),
    status: ["open", "few_left", "fully_booked", "cancelled"].includes(doc.status) ? doc.status : "open",
    description: text(doc.description),
    bookingEmail: optionalText(doc.bookingEmail),
    updatedAt: optionalText(doc.updatedAt),
  };
}

/**
 * Every published document of a collection, page by page. Throws unless the answer is complete:
 * a failed or malformed page, or fewer documents than the CMS reported, is never treated as
 * "these are all of them".
 */
export async function fetchAllPublished(cmsUrl, collection, { depth = 1, fetchImpl = fetch, pageSize = 100 } = {}) {
  const docs = [];
  let totalDocs = null;
  for (let page = 1; ; page += 1) {
    // Sorting by id keeps page boundaries stable while editors keep working.
    const query = new URLSearchParams({ limit: String(pageSize), page: String(page), depth: String(depth), sort: "id" });
    const response = await fetchImpl(`${cmsUrl}/api/${collection}?${query}`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`/api/${collection} svarade ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data?.docs) || !Number.isInteger(data?.totalDocs)) throw new Error(`/api/${collection} saknar docs eller totalDocs`);
    if (totalDocs === null) totalDocs = data.totalDocs;
    else if (data.totalDocs !== totalDocs) throw new Error(`/api/${collection} ändrades under hämtningen (${totalDocs} → ${data.totalDocs})`);
    docs.push(...data.docs);
    if (!data.hasNextPage) break;
    if (data.docs.length === 0) throw new Error(`/api/${collection} sida ${page} var tom trots fler sidor`);
  }
  if (docs.length !== totalDocs) throw new Error(`/api/${collection} gav ${docs.length} av ${totalDocs} dokument`);
  if (new Set(docs.map((doc) => doc.id)).size !== docs.length) throw new Error(`/api/${collection} gav samma dokument två gånger`);
  return docs;
}

/** Latest updatedAt over a set of projected documents; the build reports it as its content revision. */
export function latestUpdate(documents) {
  return documents.reduce((latest, doc) => (doc?.updatedAt && doc.updatedAt > latest ? doc.updatedAt : latest), "") || null;
}
