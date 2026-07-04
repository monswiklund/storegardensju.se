import { useState } from "react";
import "./Contact.css";

// Shown after a mailto link/submit: rescue path for users without a mail client.
function MailtoFallback({ email, copyText }) {
  const [copied, setCopied] = useState(false);

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
        <strong>Öppnades inget mailprogram?</strong>
        <br />
        Kopiera ditt meddelande och skicka det till{" "}
        <a href={`mailto:${email}`}>{email}</a> från din webbmail.
      </p>
      <button
        type="button"
        className="contact-fallback-copy"
        onClick={handleCopy}
      >
        {copied ? "Kopierat!" : "Kopiera meddelandet"}
      </button>
    </div>
  );
}

export default MailtoFallback;
