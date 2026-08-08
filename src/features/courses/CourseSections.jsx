// Section components shared by the two course hubs (/kurser/yoga for yoga,
// /kurser/konst for maleri & keramik). Both hubs need the same anchored pass
// sections, visible FAQ, directions and past-pass recap - duplicating ~200
// lines of JSX per hub is how the two drift apart, and the FAQ in particular
// must stay identical to the FAQPage JSON-LD.
//
// Shared logic, NOT shared looks: every section takes a `background` and most
// take a `variant`, because the first version of this file rendered both hubs as
// byte-identical white blocks from top to bottom. The data stays in one place
// while each hub picks its own rhythm - see the spine comment in KurserPage.jsx
// and ArtPage.jsx.
//
// Styling stays in KurserPages.css under the existing kurser-* class names:
// the markup is the same, so a rename would only churn the stylesheet.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Calendar,
  Clock,
  Mail,
  MapPin,
  User,
} from "lucide-react";
import MailtoFallback from "../contact/MailtoFallback.jsx";
import {
  COURSE_LOCATION,
  formatPassDate,
  formatPassTime,
  passAnchor,
  passHref,
  passYear,
  trackById,
} from "../../data/courseEvents.js";
import { FEATURED_PAST_EVENTS_BY_ID } from "../../data/featuredPastEvents.js";
import PastEventModal from "../home/UpcomingEvents/components/PastEventModal.jsx";
import { toUiEvent } from "../home/UpcomingEvents/toUiEvent.js";
import "../../pages/KurserPages.css";

const fullAddress = `${COURSE_LOCATION.streetAddress}, ${COURSE_LOCATION.postalCode} ${COURSE_LOCATION.locality}`;
const pastPassHistoryStateKey = "__storegardenPastPass";

/**
 * Full-bleed colour band with a width-constrained inner column.
 *
 * The colour has to sit on a full-width element while the content stays in the
 * 1120px column - and the anchor id has to sit on that same outermost element,
 * since scroll-margin-top is what keeps a deep link from landing behind the
 * fixed navbar plus section subnav.
 *
 * `divided` draws a hairline rule, for the rare case where two neighbouring
 * sections share a background colour and would otherwise run together.
 */
export function CourseBand({
  id,
  background = "white",
  className = "",
  divided = false,
  children,
}) {
  const classes = [
    "kurser-band",
    `kurser-band--${background}`,
    divided ? "kurser-band--divided" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section id={id} className={classes}>
      <div className="kurser-band__inner">{children}</div>
    </section>
  );
}

function ContactCard({
  heading,
  body,
  email,
  subject,
  linkLabel,
  onContactClick,
  showMailFallback,
}) {
  return (
    <div className="kurser-action-card">
      <h3>{heading}</h3>
      <p>{body}</p>
      <a
        className="kurser-interest__link"
        href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}
        onClick={onContactClick}
      >
        <Mail size={17} aria-hidden="true" />
        {linkLabel}
        <ArrowUpRight size={15} aria-hidden="true" />
      </a>
      {showMailFallback && (
        <MailtoFallback
          email={email}
          copyText={`Till: ${email}\nÄmne: ${subject}`}
        />
      )}
    </div>
  );
}

/**
 * One upcoming pass as an anchored section. The id is the anchor the Event
 * JSON-LD points at, so it has to match passAnchor() exactly.
 *
 * variant: "split" (copy left, card right) | "split-reverse" (mirrored)
 */
export function PassSection({
  pass,
  trackId,
  contactSubject,
  onContactClick,
  showMailFallback,
  background = "white",
  variant = "split",
  sticky = false,
}) {
  const track = trackById(trackId);
  const instructor = trackById(pass.primaryTrack).instructor;

  return (
    <CourseBand
      id={passAnchor(pass)}
      background={background}
      className="kurser-details kurser-details--anchored"
    >
      <div
        className={`kurser-details__container kurser-details__container--${variant}${
          sticky ? " kurser-details__container--sticky" : ""
        }`}
      >
        <div className="kurser-details__info">
          <span className="kurser-label">
            {track.id === pass.primaryTrack ? "Kommande pass" : "Kommande dag"}
          </span>
          <h2>
            {pass.title}
          </h2>
          <p className="kurser-details__description">{pass.summary}</p>

          <ul className="kurser-details__meta">
            <li>
              <Calendar size={20} aria-hidden="true" />
              <span>
                <strong>{formatPassDate(pass)}</strong>
              </span>
            </li>
            <li>
              <Clock size={20} aria-hidden="true" />
              <span>
                <strong>Klockan {formatPassTime(pass.startAt)}</strong>
                {pass.doorsOpenAt && (
                  <>
                    {" "}
                    (du kan komma från {formatPassTime(pass.doorsOpenAt)})
                  </>
                )}
              </span>
            </li>
            <li>
              <MapPin size={20} aria-hidden="true" />
              <span>
                {COURSE_LOCATION.name}, {COURSE_LOCATION.locality} (Lidköping)
              </span>
            </li>
          </ul>

          <div className="kurser-details__extra">
            {pass.price && (
              <p>
                <strong>Pris: {pass.price}:- /person</strong>
              </p>
            )}
            {pass.dropIn && (
              <p style={{ marginTop: "4px" }}>
                Betalning sker på plats, ingen föranmälan behövs.
              </p>
            )}
            {pass.practicalNote && (
              <p style={{ marginTop: "12px", opacity: 0.9 }}>
                {pass.practicalNote}
              </p>
            )}
          </div>
        </div>

        <div className="kurser-details__action">
          <ContactCard
            heading="Frågor och kontakt"
            body={
              pass.dropIn
                ? `Det är drop-in och ingen föranmälan behövs. Hör av dig till ${instructor.name.split(" ")[0]} om du undrar något inför passet.`
                : "Vill du veta mer eller anmäla dig?"
            }
            email={instructor.email}
            subject={contactSubject}
            linkLabel="Skicka ett meddelande"
            onContactClick={onContactClick}
            showMailFallback={showMailFallback}
          />
        </div>
      </div>
    </CourseBand>
  );
}

/** Shown instead of the pass sections when the calendar is empty. */
export function NoUpcomingSection({
  trackId,
  heading,
  body,
  background = "white",
}) {
  const track = trackById(trackId);

  return (
    <CourseBand
      id="kommande"
      background={background}
      className="kurser-details kurser-details--anchored"
    >
      <div className="kurser-details__info kurser-details__info--wide">
        <span className="kurser-label">Kommande</span>
        <h2>{heading}</h2>
        <p className="kurser-details__description">
          {body ||
            `Vi har för tillfället inget datum i kalendern för ${track.hubLabel}. Håll utkik här, eller hör av dig till ${track.instructor.name} så berättar hon när nästa tillfälle släpps.`}
        </p>
      </div>
    </CourseBand>
  );
}

/**
 * variant: "split" (bio + role card) | "portrait" (portrait photo beside the
 * bio, overlapping the band edge) | "band" (round avatar above centred copy)
 */
export function InstructorSection({
  instructor,
  label,
  id,
  background = "white",
  variant = "split",
  image,
  imageAlt,
}) {
  const bio = (
    <div className="kurser-details__info">
      <span className="kurser-label">{label}</span>
      <h2>Om {instructor.shortName || instructor.name.split(" ")[0]}</h2>
      <p className="kurser-details__description">{instructor.bio}</p>
      <ul className="kurser-details__meta">
        <li>
          <User size={20} aria-hidden="true" />
          <span>
            {instructor.name} — {instructor.role}
          </span>
        </li>
      </ul>
    </div>
  );

  if (variant === "band") {
    return (
      <CourseBand
        id={id}
        background={background}
        className="kurser-details kurser-instructor--band"
      >
        <div className="kurser-instructor__centered">
          {image && (
            <div className="kurser-instructor__avatar">
              <img
                src={image}
                alt={imageAlt || instructor.name}
                loading="lazy"
              />
            </div>
          )}
          {bio}
        </div>
      </CourseBand>
    );
  }

  if (variant === "portrait") {
    return (
      <CourseBand id={id} background={background} className="kurser-details">
        <div className="kurser-details__container kurser-details__container--portrait">
          {image && (
            <figure className="kurser-instructor__portrait">
              <img
                src={image}
                alt={imageAlt || instructor.name}
                loading="lazy"
              />
            </figure>
          )}
          {bio}
        </div>
      </CourseBand>
    );
  }

  return (
    <CourseBand id={id} background={background} className="kurser-details">
      <div className="kurser-details__container kurser-details__container--split">
        {bio}
      </div>
    </CourseBand>
  );
}

/**
 * FAQ answers must stay visible on the page - the FAQPage JSON-LD in seoMeta
 * reads from the same data, and Google requires the markup to match what a
 * visitor can see. Only the layout changes per hub, never the text.
 *
 * variant: "stack" (one column) | "columns" (two columns on desktop)
 */
export function FaqSection({
  faq,
  heading,
  background = "white",
  variant = "stack",
  centered = false,
}) {
  return (
    <CourseBand
      id="fragor-och-svar"
      background={background}
      className="kurser-faq"
    >
      <div
        className={`kurser-faq__inner kurser-faq__inner--${variant}${
          centered ? " kurser-faq__inner--centered" : ""
        }`}
      >
        <span className="kurser-label">Frågor och svar</span>
        <h2>{heading}</h2>
        <dl className={`kurser-faq__list kurser-faq__list--${variant}`}>
          {faq.map(({ question, answer }) => (
            <div key={question} className="kurser-faq__item">
              <dt>{question}</dt>
              <dd>{answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </CourseBand>
  );
}

export function DirectionsSection({
  description,
  background = "white",
  variant = "stacked",
}) {
  return (
    <CourseBand
      id="hitta-hit"
      background={background}
      className="kurser-details"
    >
      <div
        className={`kurser-details__container kurser-details__container--${variant}`}
      >
        <div className="kurser-details__info">
          <span className="kurser-label">Hitta hit</span>
          <h2>Hitta till {COURSE_LOCATION.name}</h2>
          <p className="kurser-details__description">{description}</p>
          <ul className="kurser-details__meta">
            <li>
              <MapPin size={20} aria-hidden="true" />
              <address>{fullAddress}</address>
            </li>
          </ul>
        </div>

        <div className="kurser-details__action">
          <div className="kurser-action-card">
            <h3>Öppna i Google Maps</h3>
            <p>Öppna kartan för vägbeskrivning ända fram till gården.</p>
            <a
              className="kurser-interest__link"
              href={COURSE_LOCATION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin size={17} aria-hidden="true" />
              Visa på karta
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </CourseBand>
  );
}

export const CourseLocationSection = DirectionsSection;

/**
 * Past passes stay on the page: they show that the courses actually run, and
 * each one adds a dated section Google can crawl. A pass owned by the other hub
 * links there instead of duplicating the anchor.
 *
 * variant: "timeline" (year rail down the left) | "cards" (grid)
 */
export function PastPassesSection({
  passes,
  trackId,
  heading,
  background = "white",
  variant = "timeline",
}) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const ownsHistoryEntryRef = useRef(false);

  const openEvent = useCallback((event) => {
    window.history.pushState(
      {
        ...window.history.state,
        [pastPassHistoryStateKey]: true,
      },
      ""
    );
    ownsHistoryEntryRef.current = true;
    setSelectedEvent(event);
  }, []);

  const closeEvent = useCallback(() => {
    setSelectedEvent(null);

    if (
      ownsHistoryEntryRef.current &&
      window.history.state?.[pastPassHistoryStateKey]
    ) {
      ownsHistoryEntryRef.current = false;
      window.history.back();
      return;
    }

    ownsHistoryEntryRef.current = false;
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;

    const handleHistoryBack = () => {
      ownsHistoryEntryRef.current = false;
      setSelectedEvent(null);
    };

    window.addEventListener("popstate", handleHistoryBack);
    return () => window.removeEventListener("popstate", handleHistoryBack);
  }, [selectedEvent]);

  if (passes.length === 0) return null;

  return (
    <>
      <CourseBand
        id="tidigare-pass"
        background={background}
        className="kurser-past"
      >
        <div className={`kurser-past__inner kurser-past__inner--${variant}`}>
          <span className="kurser-label">Återblick</span>
          <h2>{heading}</h2>
          <ol className={`kurser-past__list kurser-past__list--${variant}`}>
            {passes.map((pass) => {
              const ownedHere = pass.primaryTrack === trackId;
              const eventSource = FEATURED_PAST_EVENTS_BY_ID[pass.id];
              const eventDetail = eventSource ? toUiEvent(eventSource) : null;
              const titleHref =
                !eventDetail && !ownedHere ? passHref(pass, trackId) : "";

              return (
                <li
                  key={pass.id}
                  id={ownedHere ? passAnchor(pass) : undefined}
                  className="kurser-past__item"
                >
                  {variant === "timeline" && (
                    <span className="kurser-past__year" aria-hidden="true">
                      {passYear(pass)}
                    </span>
                  )}
                  <div className="kurser-past__body">
                    <h3>
                      {eventDetail ? (
                        <button
                          type="button"
                          className="kurser-past__title-button"
                          onClick={() => openEvent(eventDetail)}
                        >
                          {pass.title}
                        </button>
                      ) : titleHref ? (
                        <a href={titleHref}>{pass.title}</a>
                      ) : (
                        pass.title
                      )}
                    </h3>
                    <p className="kurser-past__date">
                      <Calendar size={16} aria-hidden="true" />
                      <time dateTime={pass.startAt}>
                        {formatPassDate(pass)} {passYear(pass)}
                      </time>
                    </p>
                    <p>{pass.description}</p>
                    {eventDetail && (
                      <button
                        type="button"
                        onClick={() => openEvent(eventDetail)}
                        className="kurser-past__detail-link"
                      >
                        {pass.recapLabel || "Se återblicken"}
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </CourseBand>

      {selectedEvent && (
        <PastEventModal event={selectedEvent} onClose={closeEvent} />
      )}
    </>
  );
}

export function ContactSection({
  heading,
  body,
  email,
  subject,
  onContactClick,
  background = "white",
  variant = "split",
}) {
  return (
    <CourseBand
      id="kontakt"
      background={background}
      className={`kurser-interest kurser-interest--${variant}`}
    >
      <div className="kurser-interest__inner">
        <div className="kurser-interest__copy">
          <h2>{heading}</h2>
          <p>{body}</p>
        </div>
        <a
          className="kurser-interest__link"
          href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}
          onClick={onContactClick}
        >
          <Mail size={17} aria-hidden="true" />
          {email}
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
    </CourseBand>
  );
}

/**
 * Cross-link between the two hubs: more relevance signals, more crawl paths.
 *
 * variant: "split" (copy + card) | "band" (image beside a centred statement)
 */
export function OtherHubLink({
  href,
  eyebrow,
  heading,
  body,
  linkLabel,
  image,
  imageAlt,
  background = "white",
  variant = "split",
}) {
  if (variant === "band") {
    return (
      <CourseBand background={background} className="kurser-crosslink">
        <div className="kurser-crosslink__inner">
          {image && (
            <div className="kurser-crosslink__media">
              <img src={image} alt={imageAlt || heading} loading="lazy" />
            </div>
          )}
          <div className="kurser-crosslink__copy">
            <span className="kurser-label">{eyebrow}</span>
            <h2>{heading}</h2>
            <p>{body}</p>
            <a className="kurser-interest__link" href={href}>
              {linkLabel}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </CourseBand>
    );
  }

  return (
    <CourseBand background={background} className="kurser-details">
      <div className="kurser-details__container kurser-details__container--split">
        <div className="kurser-details__info">
          <span className="kurser-label">{eyebrow}</span>
          <h2>{heading}</h2>
          <p className="kurser-details__description">{body}</p>
        </div>
        <div className="kurser-details__action">
          <div className="kurser-action-card">
            <h3>{linkLabel}</h3>
            <p>Läs om tider, innehåll och kommande datum.</p>
            <a className="kurser-interest__link" href={href}>
              {linkLabel}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </CourseBand>
  );
}

/**
 * Interactive monthly schedule for yoga classes.
 * Displays recurring or multi-pass monthly schedules cleanly.
 */
export function YogaScheduleSection({
  passes = [],
  trackId = "yoga",
  contactSubject,
  onContactClick,
  showMailFallback,
  background = "alt",
}) {
  const instructor = trackById(trackId).instructor;

  return (
    <CourseBand id="kommande" background={background} className="kurser-schedule-section">
      <div className="kurser-schedule__header">
        <span className="kurser-label">Månadsschema & klasser</span>
        <h2>Klasser på loftet i augusti</h2>
        <p className="kurser-schedule__subtitle">
          Anpassat för både nybörjare och övade utövare. Mattor finns att låna på plats på loftet på Storegården 7.
        </p>
      </div>

      <div className="kurser-schedule__grid">
        {passes.map((pass) => {
          const isDropIn = pass.dropIn;
          const duration = pass.durationMinutes || (pass.endAt ? Math.round((new Date(pass.endAt) - new Date(pass.startAt)) / 60000) : 60);
          const mailSubject = `Föranmälan: ${pass.title} (${formatPassDate(pass)})`;
          const mailHref = `mailto:${instructor.email}?subject=${encodeURIComponent(mailSubject)}`;

          const dateParts = formatPassDate(pass).split(" ");
          const weekday = dateParts[0] || "";
          const dayNum = dateParts[1] || "";
          const monthName = dateParts[2] || "";

          const focusText = pass.summary || (isDropIn 
            ? "Öppet drop-in-pass – kom som du är!"
            : "Lugnt tempo & djup återhämtning på loftet"
          );

          return (
            <div
              key={pass.id}
              id={passAnchor(pass)}
              className={`kurser-schedule-card ${isDropIn ? "kurser-schedule-card--dropin" : "kurser-schedule-card--signup"}`}
            >
              {/* Mobile Top Row: Date Badge + Weekday & Time + Tag */}
              <div className="kurser-schedule-card__mobile-top mobile-only">
                <div className="kurser-schedule-badge">
                  <span className="kurser-schedule-badge__day">{dayNum}</span>
                  <span className="kurser-schedule-badge__month">{monthName ? monthName.slice(0, 3).toUpperCase() : "AUG"}</span>
                </div>
                <div className="kurser-schedule-card__mobile-header-info">
                  <div className="kurser-schedule-card__mobile-header-title">
                    <span className="kurser-schedule-card__weekday">{weekday}</span>
                    <span className={`kurser-schedule-card__tag ${isDropIn ? "kurser-schedule-card__tag--dropin" : "kurser-schedule-card__tag--signup"}`}>
                      {isDropIn ? "DROP-IN" : "FÖRANMÄLAN"}
                    </span>
                  </div>
                  <span className="kurser-schedule-card__time">
                    <Clock size={13} aria-hidden="true" />
                    kl {formatPassTime(pass.startAt)} ({duration} min)
                  </span>
                </div>
              </div>

              {/* Left Column: Date & Time Side-by-Side (Desktop) */}
              <div className="kurser-schedule-card__datetime-col desktop-only">
                <div className="kurser-schedule-badge">
                  <span className="kurser-schedule-badge__day">{dayNum}</span>
                  <span className="kurser-schedule-badge__month">{monthName ? monthName.slice(0, 3).toUpperCase() : "AUG"}</span>
                </div>
                <div className="kurser-schedule-card__datetime-info">
                  <span className="kurser-schedule-card__weekday">{weekday}</span>
                  <span className="kurser-schedule-card__time">
                    <Clock size={14} aria-hidden="true" />
                    kl {formatPassTime(pass.startAt)} ({duration} min)
                  </span>
                </div>
              </div>

              {/* Center Info: Focus Quote & Location */}
              <div className="kurser-schedule-card__meta-col">
                <div className="kurser-schedule-card__focus-quote">
                  <span>"{focusText}"</span>
                </div>
                <div className="kurser-schedule-card__submeta">
                  <a
                    href={COURSE_LOCATION.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="kurser-schedule-card__location"
                    title="Öppna Storegården 7, Rackeby i Google Maps"
                  >
                    <MapPin size={15} aria-hidden="true" />
                    <span>Storegården 7, Rackeby</span>
                  </a>
                </div>
              </div>

              {/* Tag Column */}
              <div className="kurser-schedule-card__tag-col desktop-only">
                <span className={`kurser-schedule-card__tag ${isDropIn ? "kurser-schedule-card__tag--dropin" : "kurser-schedule-card__tag--signup"}`}>
                  {isDropIn ? "DROP-IN" : "FÖRANMÄLAN"}
                </span>
              </div>

              {/* Price Column */}
              <div className="kurser-schedule-card__price-col desktop-only">
                <span className="kurser-schedule-card__price">{pass.price ? `${pass.price}:-` : "150:-"}</span>
              </div>

              {/* Action Column */}
              <div className="kurser-schedule-card__action-col desktop-only">
                {isDropIn ? (
                  <span className="kurser-schedule-card__note">
                    Ingen föranmälan behövs – betalning på plats
                  </span>
                ) : (
                  <a
                    href={mailHref}
                    className="kurser-btn kurser-btn--primary"
                    onClick={onContactClick}
                  >
                    <span>Föranmäl dig</span>
                    <Mail size={16} aria-hidden="true" />
                  </a>
                )}
              </div>

              {/* Mobile Footer Row */}
              <div className="kurser-schedule-card__mobile-footer mobile-only">
                <div className="kurser-schedule-card__mobile-price-chip">
                  <span className="kurser-schedule-card__price-val">{pass.price ? `${pass.price}:-` : "150:-"}</span>
                </div>
                <div className="kurser-schedule-card__mobile-action">
                  {isDropIn ? (
                    <span className="kurser-schedule-card__note">
                      Betalas på plats
                    </span>
                  ) : (
                    <a
                      href={mailHref}
                      className="kurser-btn kurser-btn--primary"
                      onClick={onContactClick}
                    >
                      <span>Föranmäl dig</span>
                      <Mail size={15} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showMailFallback && (
        <MailtoFallback
          email={instructor.email}
          subject={contactSubject}
          onClose={() => {}}
        />
      )}
    </CourseBand>
  );
}
