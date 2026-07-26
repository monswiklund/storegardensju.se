import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { contactMethods, contactEmail } from "./contact.js";
import MailtoFallback from "./MailtoFallback.jsx";
import "./Contact.css";

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
  tag: (
    <>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </>
  ),
};

const subjectSuggestions = [
  { label: "Bröllop", icon: "heart" },
  { label: "Fest & kalas", icon: "sparkles" },
  { label: "Företagsevent", icon: "briefcase" },
  { label: "Möhippa & svensexa", icon: "users" },
  { label: "Kurs & workshop", icon: "brush" },
  { label: "Utställning & loppis", icon: "tag" },
];

const iconMap = {
  mail: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
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
      width="24"
      height="24"
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

const methodNotes = {
  email: "Vi svarar vanligtvis inom 24 timmar.",
  instagram: "Följ oss för inspiration och uppdateringar.",
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

function ContactSection({ defaultOpen = false }) {
  const [subjectValue, setSubjectValue] = useState("");
  const [fallbackText, setFallbackText] = useState("");
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    const handleExpand = () => {
      setTimeout(() => {
        setIsOpen(true);
      }, 500);
    };
    window.addEventListener("expand-contact-form", handleExpand);
    return () => {
      window.removeEventListener("expand-contact-form", handleExpand);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subjectLine = `${data.get("subject")} – ${data.get("name")}`;
    const date = data.get("date");
    const bodyText = `${date ? `Önskat datum: ${date}\n\n` : ""}${data.get("message")}\n\n${data.get("name")}`;
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(bodyText)}`;
    setFallbackText(`Till: ${contactEmail}\nÄmne: ${subjectLine}\n\n${bodyText}`);
  };

  return (
    <section className="contact-section" aria-labelledby="contact-heading">
      <div className="contact-container">
        <span className="section-eyebrow">KONTAKT</span>
        <div className="section-ornament" aria-hidden="true">
          <span className="section-ornament-line"></span>
          <Mail size={20} />
          <span className="section-ornament-line"></span>
        </div>
        <h2 id="contact-heading">Kontakta oss</h2>
        <p className="contact-subtitle">
          Har du frågor, vill boka en kurs eller funderar på ett datum för fest? <br />
          Berätta vad du planerar, så återkommer vi så snart vi kan.
        </p>

        <div className="contact-trigger-wrapper">
          <button
            type="button"
            className="contact-toggle-btn"
            aria-expanded={isOpen}
            aria-controls="contact-collapsible-content"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? "Dölj kontaktformuläret" : "Öppna kontaktformuläret"}
            <svg
              className={`contact-toggle-chevron ${isOpen ? "contact-toggle-chevron--open" : ""}`}
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
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        <div
          id="contact-collapsible-content"
          className={`contact-collapsible-content ${isOpen ? "contact-collapsible-content--open" : ""}`}
          role="region"
          aria-labelledby="contact-heading"
        >
          <div className="contact-grid">
            <form className="contact-form contact-panel" onSubmit={handleSubmit}>
              <div className="contact-field-row">
                <div className="contact-field">
                  <label htmlFor="contact-name">Namn *</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder="Ditt namn"
                    required
                  />
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-date">Önskat datum (valfritt)</label>
                  <input id="contact-date" name="date" type="date" />
                </div>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-subject">Ämne *</label>
                <div className="contact-chips" role="group" aria-label="Föreslagna ämnen">
                  {subjectSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      type="button"
                      className={`contact-chip${
                        subjectValue === suggestion.label
                          ? " contact-chip--active"
                          : ""
                      }`}
                      aria-pressed={subjectValue === suggestion.label}
                      onClick={() => setSubjectValue(suggestion.label)}
                    >
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
                      {suggestion.label}
                    </button>
                  ))}
                </div>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  value={subjectValue}
                  onChange={(e) => setSubjectValue(e.target.value)}
                  placeholder="Välj ovan eller skriv eget ämne"
                  required
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">Meddelande *</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Berätta vad du vill boka och ungefär hur många ni blir."
                  required
                />
              </div>

              <div className="contact-note">
                <span className="contact-note-icon">{leafIcon}</span>
                <p>
                  <strong>Vi brukar svara inom 24 timmar.</strong>
                  <br />
                  Tack för att du hör av dig.
                </p>
              </div>

              <div className="contact-submit-row">
                <button type="submit" className="contact-submit">
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
                  Skicka meddelande
                </button>
              </div>

              {fallbackText && (
                <MailtoFallback
                  key={fallbackText}
                  email={contactEmail}
                  copyText={fallbackText}
                />
              )}
            </form>

            <div className="contact-aside">
              <h3 className="contact-aside-heading">Du kan också nå oss direkt</h3>
              {contactMethods.map((method) => {
                const icon = iconMap[method.icon] ?? null;
                const externalProps = method.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {};

                return (
                  <a
                    key={method.id}
                    href={method.href}
                    className="contact-card"
                    {...externalProps}
                  >
                    <div className="contact-icon">{icon}</div>
                    <div className="contact-card-body">
                      <h4>{method.label}</h4>
                      <p className="contact-info">{method.display}</p>
                      <p className="contact-card-note">{methodNotes[method.id]}</p>
                    </div>
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
                      className="contact-card-chevron"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
