import { useEffect, useRef } from "react";
import {
  ArrowDown,
  Car,
  Clock3,
  ExternalLink,
  MapPin,
  Navigation,
} from "lucide-react";
import { ContactSection } from "../features/contact";
import { ExploreMore } from "../components";
import { COURSE_LOCATION } from "../data/courseEvents.js";
import { seoMeta } from "../config/seoMeta.js";
import { useSeo } from "../hooks/useSeo.js";
import usePageCopy from "../hooks/usePageCopy.js";
import usePageMedia from "../hooks/usePageMedia.js";
import { smoothScrollTo } from "../utils/scrollUtils.js";
import "./ContactPage.css";

const NAV_OFFSET = 80;

// App leaves its site-wide form off /kontakt, so the page places the form itself, right
// under the hero. The line under the form already carries the e-mail address and Instagram.
function goToForm(event) {
  event.preventDefault();
  smoothScrollTo(".contact-container", NAV_OFFSET);
  // A keyboard activation (click detail 0) continues at the form's first question, the subject.
  if (event.detail === 0) {
    document.querySelector('.contact-form input[name="subject"]')?.focus({ preventScroll: true });
  }
}

function ContactPage() {
  useSeo(seoMeta.kontakt);
  const copy = usePageCopy("contact");
  const media = usePageMedia("contact");
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
      <section className="contact-page__hero" data-cms-hero data-cms-hero-visual aria-labelledby="contact-page-title">
        {media("hero", "/images/event/hero/hero.webp", "hero") && <img
          className="contact-page__hero-image"
          src={media("hero", "/images/event/hero/hero.webp", "hero")}
          alt=""
        />}
        <div className="contact-page__hero-overlay" data-cms-hero-overlay />
        <div className="contact-page__hero-content" data-cms-hero-content>
          <span className="contact-page__eyebrow">{copy("hero.eyebrow")}</span>
          <h1 id="contact-page-title">{copy("hero.title")}</h1>
          <p>
            {copy("hero.lead")}
          </p>
          <div className="contact-page__hero-actions" data-cms-hero-actions>
            <a className="btn btn--light" href="#kontakt-formular" onClick={goToForm}>
              {copy("hero.form-cta")}
              <ArrowDown size={18} aria-hidden="true" />
            </a>
            <a
              className="btn btn--ghost"
              href={COURSE_LOCATION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation size={18} aria-hidden="true" />
              {copy("hero.map-cta")}
            </a>
          </div>
        </div>
        <div className="contact-page__hero-curve" aria-hidden="true" />
      </section>

      <div id="kontakt-formular" className="contact-page__form">
        <ContactSection />
      </div>

      <section className="contact-page__arrival" aria-labelledby="arrival-title">
        <div className="contact-page__arrival-grid">
          <div className="contact-page__arrival-copy">
            <span className="contact-page__eyebrow contact-page__eyebrow--dark">
              {copy("arrival.eyebrow")}
            </span>
            <h2 id="arrival-title">{copy("arrival.title")}</h2>
            <p>
              {copy("arrival.body")}
            </p>

            <div
              ref={routeRef}
              className="contact-page__route"
            >
              <span className="contact-page__route-dot" aria-hidden="true" />
              <span className="contact-page__route-line" aria-hidden="true" />
              <span className="contact-page__route-dot contact-page__route-dot--destination" aria-hidden="true">
                7
              </span>
              <div className="contact-page__route-label contact-page__route-label--start">
                {copy("arrival.route-start")}
              </div>
              <div className="contact-page__route-time">{copy("arrival.route-time")}</div>
              <div className="contact-page__route-label contact-page__route-label--end">
                {copy("arrival.route-end")}
              </div>
            </div>
          </div>

          <div className="contact-page__address-card">
            <div className="contact-page__address-heading">
              <MapPin size={23} aria-hidden="true" />
              <div>
                <span>{copy("arrival.address-label")}</span>
                <strong>{fullAddress}</strong>
              </div>
            </div>
            <ul className="contact-page__facts">
              <li>
                <Car size={19} aria-hidden="true" />
                <span>{copy("arrival.parking")}</span>
              </li>
              <li>
                <Clock3 size={19} aria-hidden="true" />
                <span>{copy("arrival.visit-note")}</span>
              </li>
            </ul>
            <a
              className="contact-page__map-link"
              href={COURSE_LOCATION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy("arrival.maps-cta")}
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <ExploreMore />
    </main>
  );
}

export default ContactPage;
