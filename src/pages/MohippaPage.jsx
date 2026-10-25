import { useState } from "react";
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
import { PageSection, ScrollSpyNav, SectionDivider } from "../components";
import MailtoFallback from "../features/contact/MailtoFallback.jsx";
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
    duration: "1 h",
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
const formatKronor = (value) => value.toLocaleString("sv-SE");

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
  // Prices are whole kronor in the CMS ("-kr" keys); the code's numbers cover a missing or broken one.
  const kronor = (key, fallback) => {
    const value = Number.parseInt(copy(key), 10);
    return Number.isInteger(value) && value >= 0 ? value : fallback;
  };
  const activities = ACTIVITY_DEFINITIONS.map((def) => {
    const priceVal = kronor(`activities.items.${def.id}.price-kr`, def.priceVal);
    return {
      ...def,
      priceVal,
      image: media(`activities.${def.id}`, def.defaultImage, "card"),
      title: copy(`activities.items.${def.id}.title`),
      description: copy(`activities.items.${def.id}.body`),
      duration: copy(`activities.items.${def.id}.duration`, def.duration),
      // Shown from the same number the total is calculated from, so the two cannot disagree.
      price: `${formatKronor(priceVal)} kr/person`,
    };
  });
  const details = list("package-details", []);
  const [mainTab, setMainTab] = useState("baspaket"); // "baspaket" or "aktiviteter"
  const [activeTab, setActiveTab] = useState("alla");
  const [guestCount, setGuestCount] = useState(10);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [showMailFallback, setShowMailFallback] = useState(false);

  const toggleActivity = (id) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const basePricePerPerson = kronor("calc.base-price-kr", 500);
  const selectedObjects = activities.filter((a) => selectedActivities.includes(a.id));
  const activitiesPricePerPerson = selectedObjects.reduce((sum, a) => sum + a.priceVal, 0);
  const totalPerPerson = basePricePerPerson + activitiesPricePerPerson;
  const grandTotal = totalPerPerson * guestCount;

  const activitiesText = selectedObjects.length > 0
    ? selectedObjects.map((a) => `- ${a.title} (${a.price})`).join("\n")
    : copy("calc.email-no-options");
  const inquirySubject = copy("calc.email-subject", "Förfrågan gruppdag på Storegården 7");
  const inquiryBody =
    `${copy("calc.email-greeting")}\n\n` +
    `${copy("calc.email-intro")}\n\n` +
    `- ${copy("calc.guests-label")}: ${guestCount} st\n` +
    `- ${copy("calc.package-label")}: ${copy("calc.base-package-name")} (${formatKronor(basePricePerPerson)} kr/person)\n` +
    `- ${copy("calc.chosen-activities")}:\n${activitiesText}\n\n` +
    `${copy("calc.estimated-total")} ${formatKronor(grandTotal)} kr (${formatKronor(totalPerPerson)} kr/person)\n\n` +
    `${copy("calc.requested-date")}: [Fyll i datum här]\n\n` +
    `${copy("calc.email-closing")}\n\n` +
    `${copy("calc.email-regards")}\n` +
    `[${copy("calc.email-name-placeholder", "Ditt namn")}]\n` +
    `[${copy("calc.email-phone-placeholder", "Ditt telefonnummer")}]`;
  const mailtoLink = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(inquirySubject)}&body=${encodeURIComponent(inquiryBody)}`;

  const spySections = [
    { id: "mohippa-hero-section", label: copy("nav.start") },
    { id: "mohippa-planering", label: copy("nav.planning") },
    { id: "mohippa-services-recommendation", label: copy("nav.services") },
    { id: "site-contact", label: copy("nav.contact") },
  ];

  return (
    <div className="mohippa-page-container">
      <ScrollSpyNav sections={spySections} offset={70} />

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
                      smoothScrollTo("mohippa-planering", 70);
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
                      smoothScrollTo("mohippa-planering", 70);
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
                      <strong>{formatKronor(basePricePerPerson)} kr/person</strong>
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
                          <span>{formatKronor(guestCount * basePricePerPerson)} kr</span>
                        </div>
                        {selectedObjects.length > 0 && (
                          <div className="mohippa-breakdown-row mohippa-breakdown-row--details">
                            <span>{copy("calc.addon-title")} ({selectedObjects.length} st):</span>
                            <span>{formatKronor(guestCount * activitiesPricePerPerson)} kr</span>
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
                          <strong>{formatKronor(grandTotal)} kr</strong>
                        </div>
                        <div className="mohippa-price-per-person">
                          ({formatKronor(totalPerPerson)} kr/person)
                        </div>
                      </div>

                      <a
                        className="mohippa-button mohippa-button--primary mohippa-calculator__button"
                        href={mailtoLink}
                        onClick={() => setShowMailFallback(true)}
                      >
                        <Mail size={18} />
                        {copy("calc.send-inquiry")}
                      </a>
                      {showMailFallback && (
                        <MailtoFallback
                          email={CONTACT_EMAIL}
                          copyText={`${inquirySubject}\n\n${inquiryBody}`}
                        />
                      )}
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
