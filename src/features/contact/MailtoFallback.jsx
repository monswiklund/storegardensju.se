import { useState } from "react";
import { useSiteCopy } from "../../hooks/usePageCopy";
import "./Contact.css";

// Shown after a mailto link/submit: rescue path for users without a mail client.
function MailtoFallback({ email, copyText }) {
  const [copied, setCopied] = useState(false);
  const siteCopy = useSiteCopy();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="contact-fallback" role="status">
      <p>
        <strong>{siteCopy("contact.fallback.title")}</strong>
        <br />
        {siteCopy("contact.fallback.lead")}{" "}
        <a href={`mailto:${email}`}>{email}</a>
      </p>
      <button
        type="button"
        className="contact-fallback-copy"
        onClick={handleCopy}
      >
        {copied ? siteCopy("contact.fallback.copied") : siteCopy("contact.fallback.copy-btn")}
      </button>
    </div>
  );
}

export default MailtoFallback;
