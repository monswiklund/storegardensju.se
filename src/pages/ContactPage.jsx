import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock3,
  ExternalLink,
  Mail,
  MapPin,
  Navigation,
} from "lucide-react";
import { ContactSection } from "../features/contact";
import { contactEmail } from "../features/contact/contact.js";
import { COURSE_LOCATION } from "../data/courseEvents.js";
import { seoMeta } from "../config/seoMeta.js";
import { useSeo } from "../hooks/useSeo.js";
import "./ContactPage.css";

const QUICK_LINKS = [
  {
    to: "/event/brollop",
    eyebrow: "Fira",
    title: "Bröllop & fest",
    text: "Ladan, loftet och hela gårdens möjligheter.",
  },
  {
    to: "/gruppdagar",
    eyebrow: "Samlas",
    title: "Gruppdagar",
    text: "Möhippa, teambuilding eller en dag med vänner.",
  },
  {
    to: "/kurser/yoga",
    eyebrow: "Landa",
    title: "Yoga på loftet",
    text: "Pass i lugnt tempo med Lina.",
  },
  {
    to: "/kurser/konst",
    eyebrow: "Skapa",
    title: "Måleri & keramik",
    text: "Kurser och privata grupper i gårdsateljén.",
  },
];

function ContactPage() {
  useSeo(seoMeta.kontakt);
  const routeRef = useRef(null);

  useEffect(() => {
    const route = routeRef.current;
    if (!route) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      route.style.setProperty("--route-reveal", "0%");
      route.style.setProperty("--route-time-opacity", "1");
      route.style.setProperty("--route-end-opacity", "1");
      route.style.setProperty("--route-end-scale", "1");
      route.style.setProperty("--route-end-offset", "0px");
      return undefined;
    }

    let animationFrame = null;

    const updateRouteProgress = () => {
      animationFrame = null;
      const routeTop = route.getBoundingClientRect().top;
      const start = window.innerHeight * 0.9;
      const finish = window.innerHeight * 0.52;
      const progress = Math.min(
        1,
        Math.max(0, (start - routeTop) / (start - finish))
      );
      const timeOpacity = Math.min(1, Math.max(0, (progress - 0.25) / 0.35));
      const endOpacity = Math.min(1, Math.max(0, (progress - 0.72) / 0.28));

      route.style.setProperty(
        "--route-reveal",
        `${(1 - progress) * 100}%`
      );
      route.style.setProperty("--route-time-opacity", String(timeOpacity));
      route.style.setProperty("--route-end-opacity", String(endOpacity));
      route.style.setProperty(
        "--route-end-scale",
        String(0.65 + endOpacity * 0.35)
      );
      route.style.setProperty(
        "--route-end-offset",
        `${(1 - endOpacity) * 5}px`
      );
    };

    const requestRouteUpdate = () => {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(updateRouteProgress);
    };

    updateRouteProgress();
    window.addEventListener("scroll", requestRouteUpdate, { passive: true });
    window.addEventListener("resize", requestRouteUpdate);

    return () => {
      window.removeEventListener("scroll", requestRouteUpdate);
      window.removeEventListener("resize", requestRouteUpdate);
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  const fullAddress = `${COURSE_LOCATION.streetAddress}, ${COURSE_LOCATION.postalCode} ${COURSE_LOCATION.locality}`;

  return (
    <main className="contact-page" id="main-content">
      <section className="contact-page__hero" aria-labelledby="contact-page-title">
        <img
          className="contact-page__hero-image"
          src="/images/event/hero/hero.webp"
          alt="Loftet på Storegården 7 med träbjälkar och ljusinsläpp"
        />
        <div className="contact-page__hero-overlay" />
        <div className="contact-page__hero-content">
          <span className="contact-page__eyebrow">Kontakt & hitta hit</span>
          <h1 id="contact-page-title">Vi ses på Storegården 7</h1>
          <p>
            I Rackeby, en kvart från Lidköping. Hör av dig om du vill boka,
            planera ett besök eller bara fråga något om gården.
          </p>
          <div className="contact-page__hero-actions">
            <a className="contact-page__button contact-page__button--light" href={`mailto:${contactEmail}`}>
              <Mail size={18} aria-hidden="true" />
              Mejla oss
            </a>
            <a
              className="contact-page__button contact-page__button--ghost"
              href={COURSE_LOCATION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation size={18} aria-hidden="true" />
              Öppna vägbeskrivning
            </a>
          </div>
        </div>
        <div className="contact-page__hero-curve" aria-hidden="true" />
      </section>

      <section className="contact-page__arrival" aria-labelledby="arrival-title">
        <div className="contact-page__arrival-grid">
          <div className="contact-page__arrival-copy">
            <span className="contact-page__eyebrow contact-page__eyebrow--dark">
              Hitta hit
            </span>
            <h2 id="arrival-title">Nära stan. Mitt på landet.</h2>
            <p>
              Storegården 7 ligger i Rackeby, cirka 15 minuter med bil från
              Lidköpings centrum.
            </p>

            <div
              ref={routeRef}
              className="contact-page__route"
              aria-label="Avstånd från Lidköping"
            >
              <span className="contact-page__route-dot" aria-hidden="true" />
              <span className="contact-page__route-line" aria-hidden="true" />
              <span className="contact-page__route-dot contact-page__route-dot--destination" aria-hidden="true">
                7
              </span>
              <div className="contact-page__route-label contact-page__route-label--start">
                Lidköping
              </div>
              <div className="contact-page__route-time">ca 15 min</div>
              <div className="contact-page__route-label contact-page__route-label--end">
                Storegården
              </div>
            </div>
          </div>

          <aside className="contact-page__address-card" aria-label="Besöksinformation">
            <div className="contact-page__address-heading">
              <MapPin size={23} aria-hidden="true" />
              <div>
                <span>Besöksadress</span>
                <strong>{fullAddress}</strong>
              </div>
            </div>
            <ul className="contact-page__facts">
              <li>
                <Clock3 size={19} aria-hidden="true" />
                <span>Hör av dig före ett besök så ser vi till att någon är på plats.</span>
              </li>
            </ul>
            <a
              className="contact-page__map-link"
              href={COURSE_LOCATION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visa i Google Maps
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          </aside>
        </div>
      </section>

      <section className="contact-page__explore" aria-labelledby="explore-title">
        <div className="contact-page__section-heading">
          <span className="contact-page__eyebrow contact-page__eyebrow--dark">
            Vad vill du veta mer om?
          </span>
          <h2 id="explore-title">Hitta rätt direkt</h2>
        </div>
        <div className="contact-page__quick-links">
          {QUICK_LINKS.map((item) => (
            <Link className="contact-page__quick-link" to={item.to} key={item.to}>
              <span>{item.eyebrow}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <ContactSection defaultOpen />
    </main>
  );
}

export default ContactPage;
