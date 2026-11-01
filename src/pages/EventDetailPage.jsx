import PropTypes from "prop-types";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowUpRight, ExternalLink, Loader2, Mail, MapPin } from "lucide-react";
import { contactEmail } from "../features/contact/contact.js";
import GalleryLightbox from "../features/gallery/ImageGallery/components/GalleryLightbox.jsx";
import useGalleryLightbox from "../features/gallery/ImageGallery/hooks/useGalleryLightbox.js";
import "../features/gallery/ImageGallery/Gallery.css";
import { toUiEvent } from "../features/home/UpcomingEvents/toUiEvent.js";
import { canonicalPath } from "../config/routes.js";
import { eventSeoMeta } from "../config/seoMeta.js";
import { isUpcoming } from "../data/schedulePlacement.js";
import useCmsSchedule from "../hooks/useCmsSchedule.js";
import usePageCopy, { useSiteCopy } from "../hooks/usePageCopy.js";
import { useSeo } from "../hooks/useSeo.js";
import "./EventDetailPage.css";
import { lightboxTile } from "../utils/tileFlight.js";
import Breadcrumbs from "../components/layout/Breadcrumbs/Breadcrumbs.jsx";
import { ExploreMore } from "../components";

/** The event's photos: uploads from the media library, else addresses saved before it existed. */
function eventPhotos(doc) {
  if (doc.media?.length > 0) {
    return doc.media.map((media, index) => {
      const medium = media.sizes?.medium;
      return {
        key: media.id ?? index,
        src: medium?.url || media.url,
        full: media.url || medium?.url,
        width: medium?.width || media.width,
        height: medium?.height || media.height,
        fullWidth: media.width,
        fullHeight: media.height,
        alt: media.alt || "",
        caption: media.caption || "",
      };
    });
  }
  return [...(doc.images || [])]
    .sort((a, b) => a.order - b.order)
    .map((image, index) => ({ key: index, src: image.url, full: image.url, alt: image.alt || "", caption: "" }));
}

function EventLinks({ links, fallbackLabel }) {
  return (
    <div className="event-page__links">
      {links.map((link, index) => {
        const className = `btn ${index === 0 ? "btn--primary" : "btn--secondary"}`;
        const label = link.label || fallbackLabel;
        if (link.href.startsWith("/")) {
          return (
            <Link key={link.href} to={canonicalPath(link.href)} className={className}>
              <ArrowUpRight size={18} aria-hidden="true" />
              {label}
            </Link>
          );
        }
        const Icon = link.href.includes("maps.google.com") ? MapPin : ExternalLink;
        const external = /^https?:/.test(link.href);
        return (
          <a
            key={link.href}
            href={link.href}
            className={className}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </a>
        );
      })}
    </div>
  );
}

// The farm forwards to the right artist: the subject names the work by its caption, else by the
// photo's number, and the body links the photo itself.
function askHref(ask, title, photo, number) {
  const work = photo?.caption ? ` "${photo.caption}"` : "";
  const subject = photo && !work ? `${ask} – ${title}, bild ${number}` : `${ask}${work} – ${title}`;
  const body = photo ? `Bilden: ${photo.full}\n\n` : "";
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
}

EventLinks.propTypes = {
  links: PropTypes.arrayOf(PropTypes.shape({ href: PropTypes.string.isRequired, label: PropTypes.string })).isRequired,
  fallbackLabel: PropTypes.string,
};

function EventDetailPage() {
  const { slug } = useParams();
  const siteCopy = useSiteCopy();
  const ask = usePageCopy("portfolio-ann")("work.ask");
  const schedule = useCmsSchedule();
  const doc = schedule.events.find((event) => event.slug === slug) || null;
  const event = useMemo(() => (doc ? toUiEvent(doc) : null), [doc]);
  const photos = useMemo(() => (doc ? eventPhotos(doc) : []), [doc]);
  const past = doc ? !isUpcoming(doc) : false;

  const seo = useMemo(
    () =>
      doc
        ? eventSeoMeta({
          slug: doc.slug,
          title: doc.title,
          description: doc.description,
          image: photos[0]?.src || null,
          startAt: doc.startAt,
          endAt: doc.endAt,
          status: doc.status,
        })
        : {},
    [doc, photos],
  );
  useSeo(seo);

  const lightboxImages = useMemo(
    () =>
      photos.map((photo, index) => ({
        original: photo.full,
        thumbnail: photo.src,
        originalAlt: photo.alt,
        caption: photo.caption,
        filename: `${slug}-${index + 1}`,
        width: photo.fullWidth,
        height: photo.fullHeight,
      })),
    [photos, slug],
  );
  const lightbox = useGalleryLightbox(lightboxImages, `evenemang-${slug}`);

  if (!event) {
    // Until the live answer is in, an unknown address may be an event published after this build.
    const loading = !schedule.settled;
    return (
      <main role="main" id="main-content" className="event-page">
        <div className="event-page__missing" role={loading ? "status" : undefined}>
          {loading ? (
            <>
              <Loader2 className="spinner" size={40} aria-hidden="true" />
              <p>{siteCopy("event-page.loading")}</p>
            </>
          ) : (
            <>
              <h1>{siteCopy("event-page.not-found")}</h1>
              <p>{siteCopy("event-page.not-found-desc")}</p>
              <Link to="/evenemang/" className="btn btn--primary">
                {siteCopy("event-page.back")}
              </Link>
            </>
          )}
        </div>
      </main>
    );
  }

  const [cover, ...rest] = photos;
  const status = doc.status === "cancelled" ? siteCopy("ui.cancelled", "Inställt") : past ? siteCopy("event-page.past") : event.spots;
  // A past event shows only its own links, not the course page an upcoming one points to for booking.
  const links = (past ? doc.links : event.links).filter((link) => link?.href);
  const hasSessions = event.sessions?.length > 1;
  // An evening with artists shows art, and a visitor may want a work they saw.
  const askAboutWorks = Boolean(event.artists) && photos.length > 0;

  return (
    <main role="main" id="main-content" className="event-page">
      <div className="event-page__inner">
        <Breadcrumbs current={event.title} />

        <article className={`event-page__hero${cover ? "" : " event-page__hero--text"}`}>
          <header className="event-page__head">
            <h1>{event.title}</h1>
            {status && <p className={`event-page__status${past ? " is-past" : ""}`}>{status}</p>}
            <dl className="event-page__facts">
              <div>
                <dt>{siteCopy("ui.date-label")}</dt>
                <dd>{event.date}</dd>
              </div>
              {event.time && (
                <div>
                  <dt>{siteCopy("ui.time-label")}</dt>
                  <dd>{event.time}</dd>
                </div>
              )}
              {event.location && (
                <div>
                  <dt>{siteCopy("ui.location-label")}</dt>
                  <dd>{event.location}</dd>
                </div>
              )}
              {event.artists && (
                <div>
                  <dt>{siteCopy("ui.artists-label", "Konstnärer")}</dt>
                  <dd>{event.artists}</dd>
                </div>
              )}
            </dl>
          </header>

          {cover && (
            <figure className="event-page__cover">
              <button
                type="button"
                onClick={() => lightbox.openLightbox(0)}
                data-lightbox-index={0}
                aria-label={`${siteCopy("event-page.show-larger")}: ${cover.caption || cover.alt || event.title}`}
              >
                <img src={cover.src} alt={cover.alt} width={cover.width} height={cover.height} fetchPriority="high" />
              </button>
              {cover.caption && <figcaption>{cover.caption}</figcaption>}
            </figure>
          )}

          <div className="event-page__body">
            {event.description && <p className="event-page__description">{event.description}</p>}

            {hasSessions && (
              <div className="event-page__sessions">
                <h2>
                  {event.sessions.some((session) => session.isPast === false)
                    ? siteCopy("ui.all-sessions", "Alla tillfällen")
                    : "Genomförda tillfällen"}
                </h2>
                <ul>
                  {event.sessions.map((session, index) => (
                    <li key={session.id || index} className={session.cancelled ? "is-cancelled" : undefined}>
                      <span>{session.date}</span>
                      {session.time && <span>{session.time}</span>}
                      {session.cancelled && <span>{siteCopy("ui.cancelled", "Inställt")}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {links.length > 0 && <EventLinks links={links} fallbackLabel={siteCopy("ui.read-more")} />}
          </div>
        </article>

        {rest.length > 0 && (
          <section className="event-page__photos" aria-labelledby="event-photos-title">
            <h2 id="event-photos-title">
              {siteCopy("event-page.photos")} <span className="event-page__count">{photos.length}</span>
            </h2>
            <ul className="event-page__grid">
              {rest.map((photo, index) => (
                <li key={photo.key}>
                  <figure>
                    <button
                      type="button"
                      onClick={() => lightbox.openLightbox(index + 1)}
                      data-lightbox-index={index + 1}
                      aria-label={`${siteCopy("event-page.show-larger")}: ${photo.caption || photo.alt || index + 2}`}
                    >
                      <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
                    </button>
                    {photo.caption && <figcaption>{photo.caption}</figcaption>}
                  </figure>
                </li>
              ))}
            </ul>
            {askAboutWorks && (
              <aside className="event-page__ask">
                <p>
                  <strong>Intresserad av ett verk?</strong> Öppna bilden och tryck på ”{ask}”, så vet vi vilket det gäller.
                </p>
                <a className="btn btn--secondary" href={askHref(ask, event.title)}>
                  <Mail size={18} aria-hidden="true" />
                  Mejla oss
                </a>
              </aside>
            )}
          </section>
        )}
      </div>

      {/* An evening ends here; lead on to the rest of the farm instead of a dead end. */}
      <ExploreMore ids={["ann", "keramik", "event", "brollop"]} background="green" />

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
        action={
          askAboutWorks && (
            <a
              className="btn btn--primary"
              href={askHref(ask, event.title, photos[lightbox.currentIndex], lightbox.currentIndex + 1)}
            >
              <Mail size={18} aria-hidden="true" />
              {ask}
            </a>
          )
        }
      />
    </main>
  );
}

export default EventDetailPage;
