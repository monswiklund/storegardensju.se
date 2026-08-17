import { useEffect, useState } from "react";
import {
  ArrowDown,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  Mail,
  Music,
  Sparkles,
  Utensils,
  Palette,
} from "lucide-react";
import { PageSection, SectionDivider } from "../components";
import { smoothScrollTo } from "../utils/scrollUtils.js";
import { HomeServicesSection } from "../features/home";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";
import usePageCopy from "../hooks/usePageCopy.js";
import usePageMedia from "../hooks/usePageMedia.js";
import usePageLists from "../hooks/usePageLists.js";
import "./MohippaPage.css";

const CONTACT_EMAIL = "bylinawiklund@gmail.com";

const DEFAULT_OCCASIONS = ["Svensexa", "Teambuilding", "Afterwork", "Workshop"];

const BASE_FEATURE_DEFINITIONS = [
  { id: "planning", icon: <Calendar size={20} /> },
  { id: "toast", icon: <Heart size={20} /> },
  { id: "setting", icon: <Sparkles size={20} /> },
  { id: "music", icon: <Music size={20} /> },
  { id: "food", icon: <Utensils size={20} /> },
];

const ACTIVITY_DEFINITIONS = [
  {
    id: "yoga",
    priceVal: 200,
    category: "lugn",
    defaultImage: "/images/evenemang/slide12.webp",
  },
  {
    id: "farg",
    priceVal: 300,
    category: "kreativt",
    defaultImage: "/images/evenemang/konstafton/konstafton-2025.webp",
  },
  {
    id: "collage",
    priceVal: 100,
    category: "lugn",
    defaultImage: "/images/evenemang/slide10.webp",
  },
  {
    id: "cocktail",
    priceVal: 300,
    category: "festligt",
    defaultImage: "/images/evenemang/slide2.webp",
  },
  {
    id: "keramik",
    priceVal: 400,
    category: "kreativt",
    defaultImage: "/images/konst-keramik/slide16.webp",
  },
];

const formatActivityNumber = (index) => String(index + 1).padStart(2, "0");

function MohippaPage() {
  useSeo(seoMeta.gruppdagar);
  const copy = usePageCopy("group-days");
  const media = usePageMedia("group-days");
  const list = usePageLists("group-days");
  const heroFacts = list("hero-facts", []);
  const baseFeatures = list("package-features", []).map((feature, index) => ({
    ...feature,
    icon: BASE_FEATURE_DEFINITIONS[index % BASE_FEATURE_DEFINITIONS.length]?.icon || <Sparkles size={20} />,
  }));
  const activities = ACTIVITY_DEFINITIONS.map((def) => ({
    ...def,
    image: media(`activities.${def.id}`, def.defaultImage, "card"),
    title: copy(`activities.items.${def.id}.title`),
    description: copy(`activities.items.${def.id}.body`),
    duration: copy(`activities.items.${def.id}.duration`),
    price: copy(`activities.items.${def.id}.price`),
  }));
  const details = list("package-details", []);
  const [activeSection, setActiveSection] = useState("top");
  const [mainTab, setMainTab] = useState("baspaket"); // "baspaket" or "aktiviteter"
  const [activeTab, setActiveTab] = useState("alla");
  const [guestCount, setGuestCount] = useState(10);
  const [selectedActivities, setSelectedActivities] = useState([]);

  const toggleActivity = (id) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const basePricePerPerson = 500;
  const selectedObjects = activities.filter((a) => selectedActivities.includes(a.id));
  const activitiesPricePerPerson = selectedObjects.reduce((sum, a) => sum + a.priceVal, 0);
  const totalPerPerson = basePricePerPerson + activitiesPricePerPerson;
  const grandTotal = totalPerPerson * guestCount;

  const getMailtoLink = () => {
    const activitiesText = selectedObjects.length > 0
      ? selectedObjects.map((a) => `- ${a.title} (${a.price})`).join("\n")
      : copy("calc.email-no-options");

    const subject = encodeURIComponent(copy("calc.email-subject") || "Förfrågan gruppdag på Storegården 7");
    const body = encodeURIComponent(
      `${copy("calc.email-greeting")}\n\n` +
      `${copy("calc.email-intro")}\n\n` +
      `- ${copy("calc.guests-label")}: ${guestCount} st\n` +
      `- ${copy("calc.package-label")}: ${copy("calc.base-package-name")} (500 kr/person)\n` +
      `- ${copy("calc.chosen-activities")}:\n${activitiesText}\n\n` +
      `${copy("calc.estimated-total")}: ${grandTotal.toLocaleString("sv-SE")} kr (${totalPerPerson} kr/person)\n\n` +
      `${copy("calc.requested-date")}: [Fyll i datum här]\n\n` +
      `${copy("calc.email-closing")}\n\n` +
      `${copy("calc.email-regards")}\n` +
      `[${copy("calc.email-name-placeholder") || "Ditt namn"}]\n` +
      `[${copy("calc.email-phone-placeholder") || "Ditt telefonnummer"}]`
    );

    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  // Scroll spy listener to update floating navigation dots based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      const heroSection = document.getElementById("mohippa-hero-section");
      const planeringSection = document.getElementById("mohippa-planering");
      const ctaSection = document.getElementById("mohippa-cta-section");
      const contactSection = document.querySelector(".contact-container");

      const getAbsTop = (el) => el ? el.getBoundingClientRect().top + window.pageYOffset : 0;

      if (contactSection && scrollPosition >= getAbsTop(contactSection)) {
        setActiveSection("contact");
      } else if (ctaSection && scrollPosition >= getAbsTop(ctaSection)) {
        setActiveSection("cta");
      } else if (planeringSection && scrollPosition >= getAbsTop(planeringSection)) {
        setActiveSection("planering");
      } else {
        setActiveSection("top");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger once on mount
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const target = id === "mohippa-contact" ? ".contact-container" : id;
    smoothScrollTo(target, 70);
  };

  return (
    <div className="mohippa-page-container">
      {/* Floating Scroll Indicator Dot Navigation (Scroll Spy) */}
      <nav className="scroll-indicator-nav">
        <ul>
          <li>
            <button
              onClick={() => scrollToSection("mohippa-hero-section")}
              className={`scroll-dot ${activeSection === "top" ? "active" : ""}`}
              title={copy("nav.start")}
            >
              <span className="dot-label">{copy("nav.start")}</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("mohippa-planering")}
              className={`scroll-dot ${activeSection === "planering" ? "active" : ""}`}
              title={copy("nav.planning")}
            >
              <span className="dot-label">{copy("nav.planning")}</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("mohippa-cta-section")}
              className={`scroll-dot ${activeSection === "cta" ? "active" : ""}`}
              title={copy("nav.request")}
            >
              <span className="dot-label">{copy("nav.request")}</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("mohippa-contact")}
              className={`scroll-dot ${activeSection === "contact" ? "active" : ""}`}
              title={copy("nav.contact")}
            >
              <span className="dot-label">{copy("nav.contact")}</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="mohippa-page">
        <main>
          <section id="mohippa-hero-section" data-cms-hero className="mohippa-hero" aria-labelledby="mohippa-heading">
            <div className="mohippa-hero__inner">
              <div className="mohippa-hero__copy" data-cms-hero-content>
                <span className="mohippa-eyebrow">{copy("hero.eyebrow")}</span>
                <h1 id="mohippa-heading" aria-label={copy("hero.title-prefix")}>
                  {copy("hero.title-prefix")}{" "}
                  <span className="mohippa-word-switch" aria-hidden="true">
                    <span className="mohippa-word-switch__track">
                      {[...DEFAULT_OCCASIONS, DEFAULT_OCCASIONS[0]].map((occasion, index) => (
                        <span key={`${occasion}-${index}`}>{occasion}</span>
                      ))}
                    </span>
                  </span>{" "}
                  {copy("hero.title-suffix")}
                </h1>
                <p>
                  {copy("hero.lead")}
                </p>

                <div className="mohippa-hero__facts" aria-label="Snabbfakta">
                  {heroFacts.map((fact, index) => (
                    <div key={fact.id || fact.body || fact.value || index}>
                      <span>{fact.body}</span>
                      <strong>{fact.value}</strong>
                    </div>
                  ))}
                </div>

                <div className="mohippa-hero__actions" data-cms-hero-actions>
                  <button
                    type="button"
                    className="mohippa-button mohippa-button--primary"
                    onClick={() => {
                      setMainTab("baspaket");
                      scrollToSection("mohippa-planering");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {copy("hero.primary-cta")}
                  </button>
                  <button
                    type="button"
                    className="mohippa-button mohippa-button--secondary"
                    onClick={() => {
                      setMainTab("aktiviteter");
                      scrollToSection("mohippa-planering");
                    }}
                    style={{ background: "none", border: "1px solid rgba(0,0,0,0.15)", cursor: "pointer" }}
                  >
                    {copy("hero.secondary-cta")}
                    <ArrowDown size={17} />
                  </button>
                </div>
              </div>

              <div className="mohippa-hero__media" aria-hidden="true">
                {media("hero", "/images/evenemang/slide2.webp", "hero") && <img src={media("hero", "/images/evenemang/slide2.webp", "hero")} alt="" />}
                <div className="mohippa-hero__note">
                  <strong>{copy("hero.note")}</strong>
                </div>
              </div>
            </div>
          </section>

          <div id="mohippa-planering">
            <PageSection background="white" spacing="default">
              <FadeInSection>
                <div className="mohippa-planner-workspace">
                  
                  {/* Left Column: Sticky Calculator */}
                  <div className="mohippa-package-card__summary">
                    <div className="mohippa-summary__header">
                      <span>{copy("calc.base-package-title")}</span>
                      <strong>{copy("calc.base-package-price")}</strong>
                    </div>
                    <p className="mohippa-summary__desc">
                      {copy("calc.summary-desc")}
                    </p>

                    <div className="mohippa-calculator">
                      <div className="mohippa-calculator__field">
                        <label htmlFor="guest-count">{copy("calc.guest-count-label")}</label>
                        <div className="mohippa-guest-picker">
                          <button
                            type="button"
                            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                            aria-label={copy("calc.decrease-guests")}
                          >
                            -
                          </button>
                          <input
                            id="guest-count"
                            type="number"
                            min="1"
                            max="100"
                            value={guestCount}
                            onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                          />
                          <button
                            type="button"
                            onClick={() => setGuestCount(guestCount + 1)}
                            aria-label={copy("calc.increase-guests")}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="mohippa-calculator__breakdown">
                        <div className="mohippa-breakdown-row">
                          <span>{copy("calc.base-package-title")} ({guestCount} st):</span>
                          <span>{(guestCount * basePricePerPerson).toLocaleString("sv-SE")} kr</span>
                        </div>
                        {selectedObjects.length > 0 && (
                          <div className="mohippa-breakdown-row mohippa-breakdown-row--details">
                            <span>{copy("calc.addon-title")} ({selectedObjects.length} st):</span>
                            <span>{(guestCount * activitiesPricePerPerson).toLocaleString("sv-SE")} kr</span>
                          </div>
                        )}
                        {selectedObjects.length > 0 && (
                          <ul className="mohippa-selected-list">
                            {selectedObjects.map((a) => (
                              <li key={a.id}>
                                <span>{a.title}</span>
                                <button
                                  type="button"
                                  onClick={() => toggleActivity(a.id)}
                                  title={copy("calc.remove-addon")}
                                  aria-label={copy("calc.remove-addon")}
                                >
                                  &times;
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="mohippa-breakdown-row mohippa-breakdown-row--total">
                          <span>{copy("calc.total-price-label")}</span>
                          <strong>{grandTotal.toLocaleString("sv-SE")} kr</strong>
                        </div>
                        <div className="mohippa-price-per-person">
                          ({totalPerPerson} kr/person)
                        </div>
                      </div>

                      <a
                        className="mohippa-button mohippa-button--primary mohippa-calculator__button"
                        href={getMailtoLink()}
                      >
                        <Mail size={18} />
                        {copy("calc.send-inquiry")}
                      </a>
                    </div>
                  </div>

                  {/* Right Column: Tabbed Content */}
                  <div className="mohippa-planner-content">
                    {/* Main Tabs */}
                    <div className="mohippa-main-tabs">
                       <button
                        type="button"
                        className={`mohippa-main-tab-btn ${mainTab === "baspaket" ? "active" : ""}`}
                        onClick={() => setMainTab("baspaket")}
                      >
                        {copy("calc.tab-base")}
                      </button>
                      <button
                        type="button"
                        className={`mohippa-main-tab-btn ${mainTab === "aktiviteter" ? "active" : ""}`}
                        onClick={() => setMainTab("aktiviteter")}
                      >
                        {copy("calc.tab-addons")}
                      </button>
                    </div>

                    {/* Tab Contents */}
                    {mainTab === "baspaket" && (
                      <div className="mohippa-tab-content-pane">
                        <div className="mohippa-section-heading">
                          <span className="mohippa-eyebrow">{copy("package.eyebrow")}</span>
                          <div className="section-ornament align-left" aria-hidden="true">
                            <span className="section-ornament-line"></span>
                            <Heart size={18} />
                            <span className="section-ornament-line"></span>
                          </div>
                          <h2 id="mohippa-package-heading">{copy("package.title")}</h2>
                          <p>{copy("package.body")}</p>
                        </div>
                        
                        <div className="mohippa-checklist">
                          {baseFeatures.map((feature) => (
                            <div key={feature.title} className="mohippa-checklist-item">
                              <span className="mohippa-checklist-item__icon" aria-hidden="true">
                                {feature.icon}
                              </span>
                              <div className="mohippa-checklist-item__content">
                                <h3>{feature.title}</h3>
                                <p>{feature.body}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mohippa-good-to-know">
                          <h3>{copy("package.details-title")}</h3>
                          <ul>
                            {details.map((detail, index) => (
                              <li key={detail.id || index}>
                                <CheckCircle2 size={17} />
                                <span>{detail.body}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {mainTab === "aktiviteter" && (
                      <div className="mohippa-tab-content-pane">
                        <div className="mohippa-section-heading">
                          <span className="mohippa-eyebrow">{copy("activities.eyebrow")}</span>
                          <div className="section-ornament align-left" aria-hidden="true">
                            <span className="section-ornament-line"></span>
                            <Palette size={18} />
                            <span className="section-ornament-line"></span>
                          </div>
                          <h2 id="mohippa-activities-heading">
                            {copy("activities.title")}
                          </h2>
                          <p>{copy("activities.lead")}</p>
                        </div>

                        <div className="mohippa-tabs">
                          <button
                            type="button"
                            className={`mohippa-tab-btn ${activeTab === "alla" ? "active" : ""}`}
                            onClick={() => setActiveTab("alla")}
                          >
                            {copy("calc.filter-all")}
                          </button>
                          <button
                            type="button"
                            className={`mohippa-tab-btn ${activeTab === "lugn" ? "active" : ""}`}
                            onClick={() => setActiveTab("lugn")}
                          >
                            {copy("calc.filter-calm")}
                          </button>
                          <button
                            type="button"
                            className={`mohippa-tab-btn ${activeTab === "kreativt" ? "active" : ""}`}
                            onClick={() => setActiveTab("kreativt")}
                          >
                            {copy("calc.filter-creative")}
                          </button>
                          <button
                            type="button"
                            className={`mohippa-tab-btn ${activeTab === "festligt" ? "active" : ""}`}
                            onClick={() => setActiveTab("festligt")}
                          >
                            {copy("calc.filter-festive")}
                          </button>
                        </div>

                        <div className="mohippa-activity-grid">
                          {activities.filter(
                            (activity) => activeTab === "alla" || activity.category === activeTab
                          ).map((activity, index) => {
                            const isSelected = selectedActivities.includes(activity.id);
                            return (
                              <article
                                key={activity.title}
                                className={`mohippa-activity ${isSelected ? "mohippa-activity--selected" : ""}`}
                                onClick={() => toggleActivity(activity.id)}
                                style={{ cursor: "pointer" }}
                              >
                                <span className="mohippa-activity__number">
                                  {formatActivityNumber(index)}
                                </span>
                                <div className="mohippa-activity__body">
                                  <div className="mohippa-activity__header">
                                    <h3>{activity.title}</h3>
                                  </div>
                                  <p>{activity.description}</p>
                                </div>
                                <div className="mohippa-activity__meta" onClick={(e) => e.stopPropagation()}>
                                  {activity.duration && (
                                    <span>
                                      <Clock size={14} />
                                      {activity.duration}
                                    </span>
                                  )}
                                  <strong>
                                    <small>+ </small>
                                    {activity.price}
                                  </strong>
                                  <button
                                    type="button"
                                    className={`mohippa-select-btn ${isSelected ? "mohippa-select-btn--selected" : ""}`}
                                    onClick={() => toggleActivity(activity.id)}
                                  >
                                    {isSelected ? (
                                      <>
                                        <CheckCircle2 size={14} />
                                        {copy("calc.addon-selected")}
                                      </>
                                    ) : (
                                      copy("calc.add-addon")
                                    )}
                                  </button>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </FadeInSection>
            </PageSection>
          </div>

          <SectionDivider above="white" below="green" variant="wave" />

          {/* Andra erbjudanden */}
          <div id="mohippa-services-recommendation">
            <PageSection background="green" spacing="default">
              <FadeInSection>
                <HomeServicesSection
                  cmsPage="group-days"
                  excludeId="gruppdagar"
                  title={copy("services-section.title")}
                  eyebrow={copy("services-section.eyebrow")}
                />
              </FadeInSection>
            </PageSection>
          </div>

          <SectionDivider above="green" below="alt" variant="hill" />
        </main>
      </div>
    </div>
  );
}

export default MohippaPage;
