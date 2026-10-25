import { useState, useEffect, useRef } from "react";
import { Mail } from "lucide-react";
import { contactMethods, contactEmail } from "./contact.js";
import "./Contact.css";
import usePageCopy from "../../hooks/usePageCopy.js";
import { getCmsUrl } from "../../services/cmsService.js";

const chipIcons = {
  heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  sparkles: (
    <>
      <path d="M9.9 4.2 11 1l1.1 3.2a2 2 0 0 0 1.3 1.3L16.6 7l-3.2 1.1a2 2 0 0 0-1.3 1.3L11 12.6 9.9 9.4a2 2 0 0 0-1.3-1.3L5.4 7l3.2-1.1a2 2 0 0 0 1.3-1.7Z" />
      <path d="M18 13.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
      <path d="M5 16.5l.6 1.6 1.6.6-1.6.6L5 21l-.6-1.7-1.6-.6 1.6-.6L5 16.5Z" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  brush: (
    <>
      <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
      <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
    </>
  ),
  chat: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
};

// type: the CMS inquiry category the chip files the request under.
// event: the subject is a gathering, so date, guest count and phone are worth asking for.
const subjectSuggestions = [
  { id: "wedding", icon: "heart", type: "wedding", event: true },
  { id: "party", icon: "sparkles", type: "event", event: true },
  { id: "corporate", icon: "briefcase", type: "event", event: true },
  { id: "group", icon: "users", type: "group_day", event: true },
  { id: "course", icon: "brush", type: "course" },
  { id: "other", icon: "chat", type: "general" },
];
const isSubject = (id) => subjectSuggestions.some((item) => item.id === id);

const iconMap = {
  mail: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  ),
  instagram: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
};

const leafIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

// hideHeader: the page wraps the form in its own titled section, so this one stays unnamed
// (a second region with the same name would be a duplicate landmark).
function ContactSection({ initialSubject = "", cmsPage = "site", hideHeader = false }) {
  const copy = usePageCopy(cmsPage);
  const chipLabel = (id) => copy(`contact.chips.${id}`) || id;
  // The chosen subject chip's id; it also decides whether the event fields show.
  const [subjectId, setSubjectId] = useState(() => (isSubject(initialSubject) ? initialSubject : ""));
  const chosen = subjectSuggestions.find((item) => item.id === subjectId);
  // idle | sending | sent | error
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [copyText, setCopyText] = useState("");
  const [copied, setCopied] = useState(false);
  const statusRef = useRef(null);
  const messageRef = useRef(null);

  useEffect(() => {
    if (isSubject(initialSubject)) setSubjectId(initialSubject);
  }, [initialSubject]);

  // CTAs elsewhere ("Kontakta oss", "Skicka en bröllopsförfrågan") can preselect a subject.
  useEffect(() => {
    const onExpand = (event) => {
      const { subject, message } = event?.detail ?? {};
      if (isSubject(subject)) setSubjectId(subject);
      // e.g. the group-day calculator's summary; never overwrite what the visitor already wrote.
      if (message && messageRef.current && !messageRef.current.value.trim()) {
        messageRef.current.value = message;
      }
    };
    window.addEventListener("expand-contact-form", onExpand);
    return () => window.removeEventListener("expand-contact-form", onExpand);
  }, []);

  useEffect(() => {
    if (status === "sent" || status === "error") statusRef.current?.focus();
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const value = (name) => form.elements[name]?.value.trim() ?? "";
    const subject = chosen ? chipLabel(chosen.id) : "";
    const payload = {
      name: value("name"),
      email: value("email"),
      phone: value("phone"),
      preferredDate: value("date"),
      guestCount: value("guests"),
      subject,
      message: value("message"),
      type: chosen?.type ?? "general",
      website: value("website"),
    };

    setCopyText(
      [
        `Namn: ${payload.name}`,
        `E-post: ${payload.email}`,
        payload.phone && `Telefon: ${payload.phone}`,
        payload.preferredDate && `Önskat datum: ${payload.preferredDate}`,
        payload.guestCount && `Antal: ${payload.guestCount}`,
        `Ämne: ${subject}`,
        "",
        payload.message,
      ]
        .filter((line) => line || line === "")
        .join("\n"),
    );
    setCopied(false);
    setStatus("sending");
    try {
      const response = await fetch(`${getCmsUrl()}/api/inquiries/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        setErrorMessage(result?.message ?? "");
        setStatus("error");
        return;
      }
      form.reset();
      setSubjectId("");
      setStatus("sent");
    } catch {
      setErrorMessage("");
      setStatus("error");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      className="contact-section"
      aria-labelledby={hideHeader ? undefined : "contact-heading"}
    >
      <div className="contact-container">
        {!hideHeader && (
          <>
            <span className="section-eyebrow">{copy("contact.eyebrow")}</span>
            <div className="section-ornament" aria-hidden="true">
              <span className="section-ornament-line"></span>
              <Mail size={20} />
              <span className="section-ornament-line"></span>
            </div>
            <h2 id="contact-heading">{copy("contact.title")}</h2>
            <p className="contact-subtitle">{copy("contact.lead")}</p>
          </>
        )}

        <div className="contact-body">
          {status === "sent" ? (
            <div
              className="contact-panel contact-result"
              role="status"
              tabIndex={-1}
              ref={statusRef}
            >
              <span className="contact-note-icon">{leafIcon}</span>
              <h3>{copy("contact.form.success-title")}</h3>
              <p>{copy("contact.form.success-message")}</p>
              <p className="contact-result-meta">{copy("contact.response-time")}</p>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setStatus("idle")}
              >
                {copy("contact.form.send-another")}
              </button>
            </div>
          ) : (
            <form className="contact-form contact-panel" onSubmit={handleSubmit}>
              {/* The subject comes first: it reads as a question and decides which fields follow. */}
              <fieldset className="contact-field">
                <legend className="contact-legend">{copy("contact.form.topic-label")}</legend>
                <div className="contact-chips">
                  {subjectSuggestions.map((suggestion) => {
                    const active = subjectId === suggestion.id;
                    return (
                      <label
                        key={suggestion.id}
                        className={`contact-chip${active ? " contact-chip--active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="subject"
                          value={suggestion.id}
                          className="contact-chip-input"
                          checked={active}
                          onChange={() => setSubjectId(suggestion.id)}
                          required
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          {chipIcons[suggestion.icon]}
                        </svg>
                        {chipLabel(suggestion.id)}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="contact-field-row">
                <div className="contact-field">
                  <label htmlFor="contact-name">{copy("contact.form.name-label")}</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder={copy("contact.form.name-placeholder")}
                    autoComplete="name"
                    maxLength={120}
                    required
                  />
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-email">{copy("contact.form.email-label")}</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder={copy("contact.form.email-placeholder")}
                    autoComplete="email"
                    maxLength={200}
                    required
                  />
                </div>
              </div>

              {/* Only for gatherings; unmounted fields are left out of the request. */}
              {chosen?.event && (
                <div className="contact-field-row contact-field-row--three contact-event-fields">
                  <div className="contact-field">
                    <label htmlFor="contact-date">{copy("contact.form.date-label")}</label>
                    <input id="contact-date" name="date" type="date" />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="contact-guests">{copy("contact.form.guests-label")}</label>
                    <input
                      id="contact-guests"
                      name="guests"
                      type="text"
                      inputMode="numeric"
                      placeholder={copy("contact.form.guests-placeholder")}
                      maxLength={40}
                    />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="contact-phone">{copy("contact.form.phone-label")}</label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength={40}
                    />
                  </div>
                </div>
              )}

              <div className="contact-field">
                <label htmlFor="contact-message">{copy("contact.form.message-label")}</label>
                <textarea
                  id="contact-message"
                  ref={messageRef}
                  name="message"
                  rows={5}
                  placeholder={copy("contact.form.message-placeholder")}
                  maxLength={4000}
                  required
                />
              </div>

              {/* Honeypot: hidden from people and screen readers, bots fill it in. */}
              <div className="visually-hidden" aria-hidden="true">
                <label htmlFor="contact-website">Webbplats</label>
                <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              {status === "error" && (
                <div className="contact-fallback" role="alert" tabIndex={-1} ref={statusRef}>
                  <p>
                    <strong>{copy("contact.form.error-title")}</strong>
                    <br />
                    {errorMessage || copy("contact.form.error-lead")}{" "}
                    <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                  </p>
                  <button type="button" className="contact-fallback-copy" onClick={handleCopy}>
                    {copied ? copy("contact.fallback.copied") : copy("contact.fallback.copy-btn")}
                  </button>
                </div>
              )}

              <div className="contact-submit-row">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={status === "sending"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m2 7 10 7 10-7" />
                  </svg>
                  {status === "sending"
                    ? copy("contact.form.sending-label")
                    : copy("contact.form.submit-label")}
                </button>
                <p className="contact-privacy">{copy("contact.response-time")}</p>
              </div>
            </form>
          )}

          <p className="contact-direct">
            <span>{copy("contact.direct-lead")}</span>
            {contactMethods.map((method) => (
              <a
                key={method.id}
                href={method.href}
                className="contact-direct-link"
                aria-label={method.ariaLabel}
                {...(method.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {iconMap[method.icon]}
                {method.display}
              </a>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
