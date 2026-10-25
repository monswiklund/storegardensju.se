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
  ArrowDown,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { ContactSection as EnquiryForm } from "../contact";
import SectionHeader from "../../components/ui/SectionHeader/SectionHeader.jsx";
import { smoothScrollTo } from "../../utils/scrollUtils.js";
import {
  COURSE_LOCATION,
  formatPassDate,
  formatPassTime,
  groupSeries,
  passAnchor,
  passHref,
  passInstructor,
  passYear,
  trackById,
} from "../../data/courseEvents.js";
import { commonHours, dayRange, scheduleSessions, weekdaysOf } from "../../data/eventSeries.js";
import { FEATURED_PAST_EVENTS_BY_ID } from "../../data/featuredPastEvents.js";
import PastEventModal from "../home/UpcomingEvents/components/PastEventModal.jsx";
import SessionSchedule from "../home/UpcomingEvents/components/SessionSchedule.jsx";
import { toUiEvent } from "../home/UpcomingEvents/toUiEvent.js";
import { useSiteCopy } from "../../hooks/usePageCopy.js";
import "../../pages/KurserPages.css";

const fullAddress = `${COURSE_LOCATION.streetAddress}, ${COURSE_LOCATION.postalCode} ${COURSE_LOCATION.locality}`;
const pastPassHistoryStateKey = "__storegardenPastPass";

/** Id of each hub's enquiry section; the subnav, the hero link and every sign-up CTA land here. */
export const COURSE_CONTACT_ID = "kontakt";
// Navbar (60px) plus the section subnav (48px), as the hubs' own anchors.
const COURSE_CONTACT_OFFSET = 130;

/**
 * Sends a visitor to the hub's enquiry form with "Kurs & workshop" chosen, then puts the
 * keyboard in its first field. Used as onClick on links whose href is #kontakt, so the
 * link still works where this handler does not run.
 */
export function goToCourseContact(event) {
  event?.preventDefault();
  window.dispatchEvent(new CustomEvent("expand-contact-form", { detail: { subject: "course" } }));
  smoothScrollTo(COURSE_CONTACT_ID, COURSE_CONTACT_OFFSET);
  document.getElementById("contact-name")?.focus({ preventScroll: true });
}

/** A link to the hub's enquiry form, styled as a button. */
function CourseContactLink({ children, className = "btn btn--primary btn--sm" }) {
  return (
    <a href={`#${COURSE_CONTACT_ID}`} className={className} onClick={goToCourseContact}>
      <span>{children}</span>
      <ArrowDown size={16} aria-hidden="true" />
    </a>
  );
}

/**
 * Full-bleed colour band with a width-constrained inner column.
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

function ContactCard({ heading, body, linkLabel }) {
  return (
    <div className="kurser-action-card">
      <h3>{heading}</h3>
      <p>{body}</p>
      <CourseContactLink>{linkLabel}</CourseContactLink>
    </div>
  );
}

/** The booking state the CMS sets on a pass, as a label; null for an ordinary open pass. */
function passStatusLabel(pass, siteCopy) {
  if (pass.status === "cancelled") return siteCopy("ui.cancelled", "Inställt");
  if (pass.status === "fully_booked") return siteCopy("ui.spot-sold-out", "Fullbokat");
  if (pass.status === "few_left") return siteCopy("ui.spot-few-left", "Få platser kvar");
  return null;
}

/** Spots as the editor wrote them (events: free text) or as a count (course passes). */
function passSpotsText(pass, siteCopy) {
  if (typeof pass.spots === "number") return `${pass.spots} ${siteCopy("ui.spots-label", "platser")}`;
  return pass.spots || "";
}

// Older passes beyond this fold out, so the recap stays a glance rather than a log.
const PAST_LIMIT = 5;

const byStart = (a, b) => new Date(a.startAt) - new Date(b.startAt);

/** A course is called off only when every session is; otherwise its held sessions carry its status. */
const seriesStatus = (passes) => passes.find((pass) => pass.status !== "cancelled")?.status ?? "cancelled";

/** A series' passes as the calendar draws them, called-off days included. */
const calendarOf = (passes) =>
  scheduleSessions(passes.map(({ startAt, endAt, status }) => ({ startAt, endAt, cancelled: status === "cancelled" })));

/** "tis, tors · 18:00 - 19:00", "8 sep – 27 okt" and "8 tillfällen" (the ones that take place) for a series (oldest first). */
function seriesLines(passes, siteCopy) {
  const span = dayRange(passes[0].startAt, passes[passes.length - 1].startAt);
  const held = passes.filter((pass) => pass.status !== "cancelled").length || passes.length;
  const count = `${held} ${siteCopy("courses.sessions-suffix")}`;
  return {
    days: [weekdaysOf(passes), commonHours(passes)].filter(Boolean).join(" · "),
    span,
    count,
    range: `${span} · ${count}`,
  };
}

// Every later session keeps its anchor (shared links, Event markup); placed in the series' title,
// they all land on it.
function SeriesAnchors({ passes }) {
  return passes.slice(1).map((pass) => <span key={pass.id} id={passAnchor(pass)} aria-hidden="true" />);
}

/**
 * One upcoming pass as an anchored section. Status, instructor, spots and location are the
 * pass's own; a cancelled pass keeps its section (shared links land on it) without a sign-up card.
 * Signing up goes through the hub's enquiry form, so every pass reaches the farm's one inbox.
 */
export function PassSection({
  pass,
  trackId,
  background = "white",
  variant = "split",
  sticky = false,
  series = null,
}) {
  const siteCopy = useSiteCopy();
  const track = trackById(trackId);
  const lines = series && seriesLines(series, siteCopy);
  const instructor = passInstructor(pass);
  const bookingStatus = series ? seriesStatus(series) : pass.status;
  const status = passStatusLabel({ status: bookingStatus }, siteCopy);
  const spots = passSpotsText(pass, siteCopy);
  const cancelled = bookingStatus === "cancelled";

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
            {track.id === pass.primaryTrack ? siteCopy("courses.upcoming-pass") : siteCopy("courses.upcoming-day")}
          </span>
          <h2>
            {series && <SeriesAnchors passes={series} />}
            {pass.title}
          </h2>
          {status && <p className="kurser-details__status" data-status={bookingStatus}>{status}</p>}
          <p className="kurser-details__description">{pass.summary}</p>

          <ul className="kurser-details__meta">
            <li>
              <Calendar size={20} aria-hidden="true" />
              <span>
                <strong>{lines ? lines.range : formatPassDate(pass)}</strong>
              </span>
            </li>
            <li>
              <Clock size={20} aria-hidden="true" />
              <span>
                <strong>{lines ? lines.days : `${siteCopy("ui.time-at")} ${formatPassTime(pass.startAt)}`}</strong>
                {pass.doorsOpenAt && (
                  <>
                    {" "}
                    ({siteCopy("courses.doors-open-from")} {formatPassTime(pass.doorsOpenAt)})
                  </>
                )}
              </span>
            </li>
            <li>
              <MapPin size={20} aria-hidden="true" />
              <span>
                {pass.location || `${COURSE_LOCATION.name}, ${COURSE_LOCATION.locality}`}
              </span>
            </li>
            {instructor && (
              <li>
                <User size={20} aria-hidden="true" />
                <span>{instructor.name}</span>
              </li>
            )}
            {spots && !cancelled && (
              <li>
                <span>{spots}</span>
              </li>
            )}
          </ul>

          {series && <SessionSchedule sessions={calendarOf(series)} />}

          <div className="kurser-details__extra">
            {pass.price && (
              <p>
                <strong>{siteCopy("cart.price-label")}: {pass.price}:- /person</strong>
              </p>
            )}
            {/* dropIn null: the CMS does not say, so neither does the page. */}
            {pass.dropIn === true && (
              <p style={{ marginTop: "4px" }}>
                {siteCopy("courses.dropin-note", "Ingen föranmälan behövs – betalning på plats")}
              </p>
            )}
            {pass.dropIn === false && (
              <p style={{ marginTop: "4px" }}>
                {siteCopy("courses.sign-up-note", "Föranmälan krävs.")}
              </p>
            )}
            {pass.practicalNote && (
              <p style={{ marginTop: "12px", opacity: 0.9 }}>
                {pass.practicalNote}
              </p>
            )}
          </div>
        </div>

        {!cancelled && (
          <div className="kurser-details__action">
            <ContactCard
              heading={siteCopy("courses.card-heading")}
              body={
                pass.dropIn === true && instructor
                  ? `${siteCopy("courses.dropin-note", "Ingen föranmälan behövs – betalning på plats")} ${siteCopy("courses.contact-instructor-prefix", "Hör av dig till")} ${instructor.name.split(" ")[0]}.`
                  : siteCopy("courses.sign-up-note", "Föranmälan krävs.")
              }
              linkLabel={siteCopy("courses.send-message")}
            />
          </div>
        )}
      </div>
    </CourseBand>
  );
}

/**
 * Shown instead of the pass sections when the calendar is empty. With ctaLabel it ends on a
 * link to the hub's enquiry form, so an empty calendar still has a next step.
 */
export function NoUpcomingSection({
  trackId,
  heading,
  body,
  ctaLabel,
  background = "white",
}) {
  const siteCopy = useSiteCopy();
  const track = trackById(trackId);

  return (
    <CourseBand
      id="kommande"
      background={background}
      className="kurser-details kurser-details--anchored"
    >
      <div className="kurser-details__info kurser-details__info--wide">
        <span className="kurser-label">{siteCopy("courses.upcoming-label")}</span>
        <h2>{heading}</h2>
        <p className="kurser-details__description">
          {body ||
            `Vi har för tillfället inget datum i kalendern för ${track.hubLabel}. Håll utkik här, eller hör av dig till ${track.instructor.name} så berättar hon när nästa tillfälle släpps.`}
        </p>
        {ctaLabel && <CourseContactLink className="btn btn--primary">{ctaLabel}</CourseContactLink>}
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

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  const slug = question.toLowerCase().replace(/[^a-z0-9åäö]/g, "-").replace(/-+/g, "-");
  const contentId = `faq-answer-${slug}`;

  return (
    <div className={`kurser-faq__item ${isOpen ? "is-open" : ""}`}>
      <dt>
        <button
          type="button"
          className="kurser-faq__trigger"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className="kurser-faq__question">{question}</span>
          <ChevronDown
            className={`kurser-faq__chevron ${isOpen ? "is-open" : ""}`}
            size={20}
            aria-hidden="true"
          />
        </button>
      </dt>
      <dd
        id={contentId}
        className={`kurser-faq__answer-wrapper ${isOpen ? "is-open" : ""}`}
      >
        <div className="kurser-faq__answer-inner">
          <p>{answer}</p>
        </div>
      </dd>
    </div>
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
  label = "Bra att veta",
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
        <span className="kurser-label">{label}</span>
        <h2>{heading}</h2>
        <dl className={`kurser-faq__list kurser-faq__list--${variant}`}>
          {faq.map(({ question, answer }) => (
            <FaqItem key={question} question={question} answer={answer} />
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
  const siteCopy = useSiteCopy();
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
          <span className="kurser-label">{siteCopy("courses.directions-label")}</span>
          <h2>{siteCopy("courses.directions-title-prefix")} {COURSE_LOCATION.name}</h2>
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
            <h3>{siteCopy("courses.directions-card-title")}</h3>
            <p>{siteCopy("courses.directions-card-body")}</p>
            <a
              className="kurser-interest__link"
              href={COURSE_LOCATION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin size={17} aria-hidden="true" />
              {siteCopy("courses.directions-map-cta")}
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
  const siteCopy = useSiteCopy();
  const [selectedEvent, setSelectedEvent] = useState(null);
  // A shared link to an older pass opens the fold, so its anchor exists to land on.
  const [showAll, setShowAll] = useState(() =>
    typeof window !== "undefined" &&
    passes.some((pass) => pass.primaryTrack === trackId && `#${passAnchor(pass)}` === window.location.hash));
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
  const groups = groupSeries(passes);
  const shownGroups = showAll ? groups : groups.slice(0, PAST_LIMIT);
  let previousYear = null;

  return (
    <>
      <CourseBand
        id="tidigare-pass"
        background={background}
        className="kurser-past"
      >
        <div className={`kurser-past__inner kurser-past__inner--${variant}`}>
          <span className="kurser-label">{siteCopy("courses.recap-label")}</span>
          <h2>{heading}</h2>
          <ol className={`kurser-past__list kurser-past__list--${variant}`}>
            {shownGroups.map(({ id, passes: group }) => {
              // A finished course is one entry: its first session stands for it, its span as the date.
              const series = group.length > 1 ? [...group].sort(byStart) : null;
              const pass = series ? series[0] : group[0];
              const lines = series && seriesLines(series, siteCopy);
              const ownedHere = pass.primaryTrack === trackId;
              // The year opens its run of passes instead of standing on every row.
              const year = passYear(pass);
              const newYear = year !== previousYear;
              previousYear = year;
              // Only migrated records carry a legacy key linking them to a hand-written recap.
              const eventSource = pass.legacyKey ? FEATURED_PAST_EVENTS_BY_ID[pass.legacyKey] : null;
              const eventDetail = eventSource ? toUiEvent(eventSource) : null;
              const titleHref =
                !eventDetail && !ownedHere ? passHref(pass, trackId) : "";

              return (
                <li
                  key={id}
                  id={ownedHere ? passAnchor(pass) : undefined}
                  className="kurser-past__item"
                >
                  {variant === "timeline" && (
                    <span className="kurser-past__year" aria-hidden="true">
                      {newYear ? year : ""}
                    </span>
                  )}
                  <div className="kurser-past__body">
                    <h3>
                      {series && ownedHere && <SeriesAnchors passes={series} />}
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
                        {lines ? `${lines.span} ${passYear(pass)} · ${lines.count}` : `${formatPassDate(pass)} ${passYear(pass)}`}
                      </time>
                    </p>
                    <p>{pass.description}</p>
                    {eventDetail && (
                      <button
                        type="button"
                        onClick={() => openEvent(eventDetail)}
                        className="kurser-past__detail-link"
                      >
                        {pass.recapLabel || siteCopy("courses.see-recap")}
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          {groups.length > PAST_LIMIT && (
            <button
              type="button"
              className="btn btn--secondary kurser-past__more"
              aria-expanded={showAll}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? siteCopy("ui.show-less") : `${siteCopy("ui.show-more")} (${groups.length - PAST_LIMIT})`}
              <ChevronDown size={18} aria-hidden="true" className={showAll ? "is-rotated" : undefined} />
            </button>
          )}
        </div>
      </CourseBand>

      {selectedEvent && (
        <PastEventModal event={selectedEvent} onClose={closeEvent} />
      )}
    </>
  );
}

/**
 * The hub's enquiry section: the hub's own heading and lead, then the site's one enquiry form
 * with "Kurs & workshop" chosen. App.jsx leaves the global form off the hubs, so this is the
 * only form on the page; it posts to the CMS like every other enquiry.
 */
export function ContactSection({ heading, body, background = "white" }) {
  const siteCopy = useSiteCopy();
  return (
    <section
      id={COURSE_CONTACT_ID}
      className={`kurser-band kurser-band--${background} kurser-contact`}
      aria-labelledby="kurser-contact-title"
    >
      <div className="kurser-band__inner kurser-contact__intro">
        <SectionHeader
          id="kurser-contact-title"
          eyebrow={siteCopy("contact.eyebrow")}
          title={heading}
          lead={body}
        />
      </div>
      <EnquiryForm initialSubject="course" hideHeader />
    </section>
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

/** One class as a row: date, booking tag, price and how to come. */
function ScheduleCard({ pass }) {
  const siteCopy = useSiteCopy();
  const isDropIn = pass.dropIn === true;
  const status = passStatusLabel(pass, siteCopy);
  // Cancelled or full: nothing to sign up for, the status replaces the button.
  const closed = pass.status === "cancelled" || pass.status === "fully_booked";
  const duration = pass.durationMinutes;

  const dateParts = formatPassDate(pass).split(" ");
  const weekday = dateParts[0] || "";
  const dayNum = dateParts[1] || "";
  const monthName = dateParts[2] || "";

  return (
    <div
      id={passAnchor(pass)}
      data-status={pass.status}
      className={`kurser-schedule-card ${isDropIn ? "kurser-schedule-card--dropin" : "kurser-schedule-card--signup"}`}
    >
      {/* Mobile Top Row: Date Badge + Weekday & Time + Tag */}
      <div className="kurser-schedule-card__mobile-top mobile-only">
        <div className="kurser-schedule-badge">
          <span className="kurser-schedule-badge__day">{dayNum}</span>
          <span className="kurser-schedule-badge__month">{monthName ? monthName.slice(0, 3).toUpperCase() : ""}</span>
        </div>
        <div className="kurser-schedule-card__mobile-header-info">
          <div className="kurser-schedule-card__mobile-header-title">
            <span className="kurser-schedule-card__weekday">{weekday}</span>
            <span className={`kurser-schedule-card__tag ${isDropIn ? "kurser-schedule-card__tag--dropin" : "kurser-schedule-card__tag--signup"}`}>
              {status || (isDropIn ? siteCopy("courses.dropin-badge", "DROP-IN") : siteCopy("courses.signup-badge", "FÖRANMÄLAN"))}
            </span>
          </div>
          <span className="kurser-schedule-card__time">
            <Clock size={13} aria-hidden="true" />
            kl {formatPassTime(pass.startAt)}{duration ? ` (${duration} min)` : ""}
          </span>
        </div>
      </div>

      {/* Left Column: Date & Time Side-by-Side (Desktop) */}
      <div className="kurser-schedule-card__datetime-col desktop-only">
        <div className="kurser-schedule-badge">
          <span className="kurser-schedule-badge__day">{dayNum}</span>
          <span className="kurser-schedule-badge__month">{monthName ? monthName.slice(0, 3).toUpperCase() : ""}</span>
        </div>
        <div className="kurser-schedule-card__datetime-info">
          <span className="kurser-schedule-card__weekday">{weekday}</span>
          <span className="kurser-schedule-card__time">
            <Clock size={14} aria-hidden="true" />
            kl {formatPassTime(pass.startAt)}{duration ? ` (${duration} min)` : ""}
          </span>
        </div>
      </div>



      {/* Tag Column */}
      <div className="kurser-schedule-card__tag-col desktop-only">
        <span className={`kurser-schedule-card__tag ${isDropIn ? "kurser-schedule-card__tag--dropin" : "kurser-schedule-card__tag--signup"}`}>
          {status || (isDropIn ? siteCopy("courses.dropin-badge", "DROP-IN") : siteCopy("courses.signup-badge", "FÖRANMÄLAN"))}
        </span>
      </div>

      {/* Price Column */}
      <div className="kurser-schedule-card__price-col desktop-only">
        <span className="kurser-schedule-card__price">{pass.price ? `${pass.price}:-` : ""}</span>
      </div>

      {/* Action Column */}
      <div className="kurser-schedule-card__action-col desktop-only">
        {closed ? (
          <span className="kurser-schedule-card__note">{status}</span>
        ) : isDropIn ? (
          <span className="kurser-schedule-card__note">
            {siteCopy("courses.dropin-note")}
          </span>
        ) : (
          <CourseContactLink>{siteCopy("courses.pre-register-cta")}</CourseContactLink>
        )}
      </div>

      {/* Mobile Footer Row */}
      <div className="kurser-schedule-card__mobile-footer mobile-only">
        <div className="kurser-schedule-card__mobile-price-chip">
          <span className="kurser-schedule-card__price-val">{pass.price ? `${pass.price}:-` : ""}</span>
        </div>
        <div className="kurser-schedule-card__mobile-action">
          {closed ? (
            <span className="kurser-schedule-card__note">{status}</span>
          ) : isDropIn ? (
            <span className="kurser-schedule-card__note">
              {siteCopy("courses.pay-on-site")}
            </span>
          ) : (
            <CourseContactLink>{siteCopy("courses.pre-register-cta")}</CourseContactLink>
          )}
        </div>
      </div>
    </div>
  );
}

/** A course that meets several times: one card with its calendar instead of a row per session. */
function SeriesScheduleCard({ passes }) {
  const siteCopy = useSiteCopy();
  const pass = passes[0];
  const isDropIn = pass.dropIn === true;
  const lines = seriesLines(passes, siteCopy);
  const bookingStatus = seriesStatus(passes);
  const status = passStatusLabel({ status: bookingStatus }, siteCopy);
  // Cancelled or full: nothing to sign up for, the status replaces the button.
  const closed = bookingStatus === "cancelled" || bookingStatus === "fully_booked";
  const tagClass = isDropIn ? "kurser-schedule-card__tag--dropin" : "kurser-schedule-card__tag--signup";

  return (
    <div
      id={passAnchor(pass)}
      data-status={bookingStatus}
      className={`kurser-schedule-card kurser-schedule-card--series ${isDropIn ? "kurser-schedule-card--dropin" : "kurser-schedule-card--signup"}`}
    >
      <div className="kurser-series__info">
        <h3 className="kurser-series__title">
          <SeriesAnchors passes={passes} />
          {pass.title}
        </h3>
        <p className="kurser-series__line">
          <Clock size={14} aria-hidden="true" />
          {lines.days}
        </p>
        <p className="kurser-series__line">
          <Calendar size={14} aria-hidden="true" />
          {lines.range}
        </p>
      </div>
      <span className={`kurser-schedule-card__tag kurser-series__tag ${tagClass}`}>
        {status || (isDropIn ? siteCopy("courses.dropin-badge", "DROP-IN") : siteCopy("courses.signup-badge", "FÖRANMÄLAN"))}
      </span>
      <span className="kurser-schedule-card__price kurser-series__price">{pass.price ? `${pass.price}:-` : ""}</span>
      <div className="kurser-series__action">
        {closed ? (
          <span className="kurser-schedule-card__note">{status}</span>
        ) : isDropIn ? (
          <span className="kurser-schedule-card__note">{siteCopy("courses.dropin-note")}</span>
        ) : (
          <CourseContactLink>{siteCopy("courses.pre-register-cta")}</CourseContactLink>
        )}
      </div>
      <div className="kurser-series__schedule">
        <SessionSchedule sessions={calendarOf(passes)} />
      </div>
    </div>
  );
}

/**
 * Interactive monthly schedule for yoga classes.
 * Displays recurring or multi-pass monthly schedules cleanly.
 */
export function YogaScheduleSection({
  passes = [],
  background = "alt",
}) {
  return (
    <CourseBand id="kommande" background={background} className="kurser-schedule-section">
      <div className="kurser-schedule__header">
        <span className="kurser-label">Schema & klasser</span>
        {/* No month in the heading: the schedule is whatever the CMS has, not a fixed August. */}
        <h2>Kommande klasser på loftet</h2>
        <p className="kurser-schedule__subtitle">
          Anpassat för både nybörjare och övade utövare. Mattor finns att låna på plats på loftet på Storegården 7.
        </p>
      </div>

      <div className="kurser-schedule__grid">
        {groupSeries(passes).map(({ id, passes: group }) =>
          group.length > 1 ? <SeriesScheduleCard key={id} passes={group} /> : <ScheduleCard key={id} pass={group[0]} />
        )}
      </div>
    </CourseBand>
  );
}
