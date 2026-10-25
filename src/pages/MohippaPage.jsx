import { useState } from "react";
import {
  ArrowDown,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  Music,
  Sparkles,
  Utensils,
  Palette,
} from "lucide-react";
import { ExploreMore, PageSection, ScrollSpyNav, SectionDivider } from "../components";
import { smoothScrollTo } from "../utils/scrollUtils.js";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";
import usePageCopy from "../hooks/usePageCopy.js";
import usePageMedia from "../hooks/usePageMedia.js";
import usePageLists from "../hooks/usePageLists.js";
import "./MohippaPage.css";

const DEFAULT_OCCASIONS = ["Möhippa", "Svensexa", "Teambuilding", "Afterwork", "Workshop"];
// The rotating word is hidden from screen readers, so the heading reads every occasion instead.
const OCCASIONS_SPOKEN = new Intl.ListFormat("sv", { type: "disjunction" }).format(DEFAULT_OCCASIONS);

const MAIN_TABS = ["baspaket", "aktiviteter"];
const SPY_OFFSET = 70;

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
  // The day the group put together, handed to the site's enquiry form with the request.
  const inquirySummary =
    `${copy("calc.email-intro")}\n\n` +
    `- ${copy("calc.guests-label")}: ${guestCount} st\n` +
    `- ${copy("calc.package-label")}: ${copy("calc.base-package-name")} (${formatKronor(basePricePerPerson)} kr/person)\n` +
    `- ${copy("calc.chosen-activities")}:\n${activitiesText}\n\n` +
    `${copy("calc.estimated-total")} ${formatKronor(grandTotal)} kr (${formatKronor(totalPerPerson)} kr/person)`;

  // One inbox and one form for the farm: the request goes through the form App renders after the page.
  const goToContactForm = (event) => {
    event.preventDefault();
    window.dispatchEvent(
      new CustomEvent("expand-contact-form", {
        detail: { subject: "group", message: inquirySummary },
      })
    );
    smoothScrollTo(".contact-container", SPY_OFFSET);
    // A keyboard activation (click detail 0) continues in the form; a tap does not open the keyboard.
    if (event.detail === 0) document.getElementById("contact-name")?.focus({ preventScroll: true });
  };

  const handleTabKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = MAIN_TABS[(MAIN_TABS.indexOf(mainTab) + step + MAIN_TABS.length) % MAIN_TABS.length];
    setMainTab(next);
    document.getElementById(`mohippa-tab-${next}`)?.focus();
  };

  const spySections = [
    { id: "mohippa-hero-section", label: copy("nav.start") },
    { id: "mohippa-planering", label: copy("nav.planning") },
    { id: "mohippa-services-recommendation", label: copy("nav.services") },
    { id: "site-contact", label: copy("nav.contact") },
  ];

  return (
    <div className="mohippa-page-container">
      <ScrollSpyNav sections={spySections} offset={SPY_OFFSET} />

      <div className="mohippa-page">
        <main>
          <section id="mohippa-hero-section" data-cms-hero className="mohippa-hero" aria-labelledby="mohippa-heading">
            <div className="mohippa-hero__inner">
              <div className="mohippa-hero__copy" data-cms-hero-content>
                <span className="mohippa-eyebrow">{copy("hero.eyebrow")}</span>
                <h1 id="mohippa-heading">
                  {copy("hero.title-prefix")}{" "}
                  <span className="visually-hidden">{OCCASIONS_SPOKEN}</span>
                  {/* The words share one grid cell: the slot is as wide as the longest and sits on the
                      heading's baseline; each word takes its turn (MohippaPage.css). */}
                  <span className="mohippa-word-switch" aria-hidden="true">
                    {DEFAULT_OCCASIONS.map((occasion, index) => (
                      <span key={occasion} style={{ "--word-index": index }}>{occasion}</span>
                    ))}
                  </span>{" "}
                  {copy("hero.title-suffix")}
                </h1>
                <p>
                  {copy("hero.lead")}
                </p>

                <div className="mohippa-hero__facts">
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
                    className="btn btn--primary"
                    onClick={() => {
                      setMainTab("baspaket");
                      smoothScrollTo("mohippa-planering", SPY_OFFSET);
                    }}
                  >
                    {copy("hero.primary-cta")}
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => {
                      setMainTab("aktiviteter");
                      smoothScrollTo("mohippa-planering", SPY_OFFSET);
                    }}
                  >
                    {copy("hero.secondary-cta")}
                    <ArrowDown size={17} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="mohippa-hero__media" aria-hidden="true">
                {media("hero", "/images/evenemang/slide2.webp", "hero") && <img src={media("hero", "/images/evenemang/slide2.webp", "hero")} alt="" />}
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
                                  aria-label={`${copy("calc.remove-addon")}: ${a.title}`}
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
                        className="btn btn--primary mohippa-calculator__button"
                        href="#site-contact"
                        onClick={goToContactForm}
                      >
                        {copy("calc.send-inquiry")}
                        <ArrowDown size={18} aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  {/* Right Column: Tabbed Content */}
                  <div className="mohippa-planner-content">
                    {/* Main Tabs */}
                    <div className="mohippa-main-tabs" role="tablist" onKeyDown={handleTabKeyDown}>
                      {MAIN_TABS.map((tab) => (
                        <button
                          key={tab}
                          id={`mohippa-tab-${tab}`}
                          type="button"
                          role="tab"
                          aria-selected={mainTab === tab}
                          aria-controls={`mohippa-panel-${tab}`}
                          tabIndex={mainTab === tab ? 0 : -1}
                          className={`mohippa-main-tab-btn ${mainTab === tab ? "active" : ""}`}
                          onClick={() => setMainTab(tab)}
                        >
                          {copy(tab === "baspaket" ? "calc.tab-base" : "calc.tab-addons")}
                        </button>
                      ))}
                    </div>

                    {/* Tab Contents */}
                    {mainTab === "baspaket" && (
                      <div
                        id="mohippa-panel-baspaket"
                        role="tabpanel"
                        aria-labelledby="mohippa-tab-baspaket"
                        className="mohippa-tab-content-pane"
                      >
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
                                <CheckCircle2 size={17} aria-hidden="true" />
                                <span>{detail.body}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {mainTab === "aktiviteter" && (
                      <div
                        id="mohippa-panel-aktiviteter"
                        role="tabpanel"
                        aria-labelledby="mohippa-tab-aktiviteter"
                        className="mohippa-tab-content-pane"
                      >
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
                            aria-pressed={activeTab === "alla"}
                            onClick={() => setActiveTab("alla")}
                          >
                            {copy("calc.filter-all")}
                          </button>
                          <button
                            type="button"
                            className={`mohippa-tab-btn ${activeTab === "lugn" ? "active" : ""}`}
                            aria-pressed={activeTab === "lugn"}
                            onClick={() => setActiveTab("lugn")}
                          >
                            {copy("calc.filter-calm")}
                          </button>
                          <button
                            type="button"
                            className={`mohippa-tab-btn ${activeTab === "kreativt" ? "active" : ""}`}
                            aria-pressed={activeTab === "kreativt"}
                            onClick={() => setActiveTab("kreativt")}
                          >
                            {copy("calc.filter-creative")}
                          </button>
                          <button
                            type="button"
                            className={`mohippa-tab-btn ${activeTab === "festligt" ? "active" : ""}`}
                            aria-pressed={activeTab === "festligt"}
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
                                key={activity.id}
                                className={`mohippa-activity ${isSelected ? "mohippa-activity--selected" : ""}`}
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
                                <div className="mohippa-activity__meta">
                                  {activity.duration && (
                                    <span>
                                      <Clock size={14} aria-hidden="true" />
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
                                    aria-pressed={isSelected}
                                    onClick={() => toggleActivity(activity.id)}
                                  >
                                    {isSelected && <CheckCircle2 size={14} aria-hidden="true" />}
                                    {isSelected ? copy("calc.addon-selected") : copy("calc.add-addon")}
                                    <span className="visually-hidden">: {activity.title}</span>
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

          <div id="mohippa-services-recommendation">
            <ExploreMore exclude={["gruppdagar"]} background="green" />
          </div>

          <SectionDivider above="green" below="alt" variant="hill" />
        </main>
      </div>
    </div>
  );
}

export default MohippaPage;
