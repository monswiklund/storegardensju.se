import { useState } from "react";
import { ArrowDown, ArrowUpRight, Mail } from "lucide-react";
import MailtoFallback from "../features/contact/MailtoFallback.jsx";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";
import "./KurserPages.css";

const CONTACT_EMAIL = "bylinawiklund@gmail.com";
const CONTACT_SUBJECT = "Yoga & måleri på Storegården 7";

function KurserPage() {
  const [showMailFallback, setShowMailFallback] = useState(false);

  useSeo({ ...seoMeta.kurser, jsonLd: [] });

  return (
    <div className="kurser-page">
      <main id="main-content">
        <header
          className="kurser-hero"
          style={{
            backgroundImage:
              "url('/images/evenemang/kurser-header.webp')",
          }}
        >
          <div className="kurser-hero__inner">
            <span className="kurser-eyebrow">Tidigare på Storegården</span>
            <h1>Yoga & måleri på gården</h1>
            <p>
              En sommardag med lugn yoga, skapande och tid tillsammans på
              Storegården 7.
            </p>
            <a className="kurser-hero__link" href="#kursdagen">
              Se mer
              <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
        </header>

        <section id="kursdagen" className="kurser-recap">
          <div className="kurser-recap__copy">
            <span className="kurser-label">En dag vi minns</span>
            <h2>Yoga, måleri och en paus från vardagen.</h2>
          </div>

          <div className="kurser-recap__gallery">
            <figure className="kurser-recap__image kurser-recap__image--large">
              <img
                src="/images/evenemang/yoga-loft.webp"
                alt="Yoga på loftet på Storegården 7"
              />
            </figure>
            <figure className="kurser-recap__image">
              <img
                src="/images/evenemang/maleri-kurs.webp"
                alt="Måleri i ateljén på Storegården 7"
              />
            </figure>
            <figure className="kurser-recap__image">
              <img
                src="/images/evenemang/heldag-paket.webp"
                alt="En dag med yoga och måleri på Storegården 7"
              />
            </figure>
          </div>
        </section>

        <section className="kurser-interest">
          <div>
            <span className="kurser-label">Nyfiken på något liknande?</span>
            <h2>Vi har inget nytt datum just nu.</h2>
            <p>
              Men hör gärna av dig om du vill veta mer eller samla en egen
              grupp på gården.
            </p>
          </div>
          <a
            className="kurser-interest__link"
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CONTACT_SUBJECT)}`}
            onClick={() => setShowMailFallback(true)}
          >
            <Mail size={17} aria-hidden="true" />
            Hör av dig
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          {showMailFallback && (
            <MailtoFallback
              email={CONTACT_EMAIL}
              copyText={`Till: ${CONTACT_EMAIL}\nÄmne: ${CONTACT_SUBJECT}`}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default KurserPage;
