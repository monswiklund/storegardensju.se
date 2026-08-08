import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  Building2,
  CalendarCheck,
  Heart,
  Maximize2,
  PartyPopper,
  Sparkles,
  UsersRound,
  Wine,
} from "lucide-react";
import { PageSection, ScrollSpyNav, SectionDivider } from "../../components";
import { HomeServicesSection } from "../../features/home";
import FadeInSection from "../../components/ui/FadeInSection.jsx";
import { useSeo } from "../../hooks/useSeo.js";
import useSequentialScrollTimeline from "../../hooks/useSequentialScrollTimeline.js";
import { seoMeta } from "../../config/seoMeta.js";
import { canonicalPath } from "../../config/routes.js";
import "./EventPage.css";

const EVENT_FACTS = [
  {
    value: "360 kvm",
    label: "Inomhus på två våningar: ladan och loftet.",
  },
  {
    value: "150+",
    label: "Sittande gäster på loftet.",
  },
  {
    value: "Bar, kök",
    label: "Kök med arbetsytor, handdisk samt varmt och kallt vatten.",
  },
  {
    value: "Personal",
    label: "Vi kan hjälpa till med servering, bar eller DJ vid behov.",
  },
];

const EVENT_STEPS = [
  {
    title: "Berätta vad ni planerar",
    body: "Skicka datum, ungefärligt antal gäster och vad ni vill ordna.",
  },
  {
    title: "Gå igenom det praktiska",
    body: "Vi går igenom lokalerna, dukningen, maten, drycken och vilken hjälp ni behöver.",
  },
  {
    title: "Kom till gården",
    body: "När dagen kommer är ladan i ordning för det upplägg vi har kommit överens om.",
  },
];

const EVENT_TYPES = [
  {
    title: "Bröllop",
    description:
      "Hyr ladan och loftet för bröllopsmiddag och fest. Ni får ta med egen mat och dryck.",
    to: "/event/brollop/",
    linkLabel: "Läs om bröllop",
    variant: "wedding",
    image: "/images/event/hero/hero-2.webp",
    imageAlt: "Dukade långbord på loftet inför ett bröllop",
    Icon: Heart,
  },
  {
    title: "Fest & företagsevent",
    description:
      "Födelsedag, jubileum, afterwork eller företagsfest med två flexibla våningar.",
    href: "#event-loft-section",
    linkLabel: "Se lokalens möjligheter",
    variant: "celebration",
    Icon: Building2,
  },
  {
    title: "Gruppdagar",
    description:
      "Ett färdigt upplägg för möhippa, svensexa, teambuilding eller en dag med vänner.",
    to: "/gruppdagar/",
    linkLabel: "Planera en gruppdag",
    variant: "group",
    image: "/images/evenemang/heldag-paket.webp",
    imageAlt: "Samlingsplats utomhus vid ladan",
    Icon: UsersRound,
  },
];

// The rail follows EventPage's own sections. The global contact and Instagram
// bands belong to the shared page shell and should not change this page's map.
const SPY_SECTIONS = [
  { id: "event-hero", label: "Start" },
  { id: "event-details-section", label: "Välj event" },
  { id: "event-loft-section", label: "Kapacitet" },
  { id: "event-amenities-section", label: "Möjligheter" },
  { id: "event-planning-section", label: "Planering" },
  { id: "event-services-recommendation", label: "Utforska mer" },
];

// Navbar (60px) plus the section subnav (48px), with breathing room for the
// heading so a dot click never hides it behind the fixed navigation.
const SPY_OFFSET = 130;

function EventPage() {
  useSeo(seoMeta.event);
  const navigate = useNavigate();
  const {
    timelineRef,
    activeSteps: activeTimelineSteps,
    progress: timelineProgress,
  } = useSequentialScrollTimeline(EVENT_STEPS.length);

  const handleGalleryClick = () => {
    navigate(canonicalPath("/galleri"));
  };

  return (
    <div className="event-page-container">
      <ScrollSpyNav sections={SPY_SECTIONS} offset={SPY_OFFSET} />

      <main role="main" id="main-content" className="event-page">
        {/* Hero Section */}
        <section
          id="event-hero"
          className="event-hero"
          style={{ backgroundImage: "url('/images/event/hero/hero.webp')" }}
          aria-labelledby="event-heading"
        >
          <div className="event-hero__inner">
            <span className="event-eyebrow">Eventlokal på landet</span>
            <div className="section-ornament" aria-hidden="true" style={{ color: "var(--primary-color)" }}>
              <span className="section-ornament-line" style={{ background: "var(--primary-color)" }}></span>
              <PartyPopper size={20} />
              <span className="section-ornament-line" style={{ background: "var(--primary-color)" }}></span>
            </div>
            <h1 id="event-heading">Event på Storegården 7</h1>
            <p>Lada och loft för bröllop, fest och företagsevent</p>
            <div className="event-hero__actions">
              <Link to="/kontakt/" className="event-button event-button--primary">
                Berätta om ert event
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <a
                href="#event-details-section"
                className="event-button event-button--secondary"
              >
                Se eventtyper
                <ArrowDown size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* The curve belongs on the photo so the hero keeps its full image;
              placing a separate divider here would add a pale strip over it. */}
          <svg
            className="event-hero__curve"
            viewBox="0 0 1200 48"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M0,24 C300,42 450,6 600,24 C750,42 900,6 1200,24 L1200,48 L0,48 Z"
              fill="currentColor"
            />
          </svg>
        </section>

        <div id="event-details-section">
          <PageSection background="alt" spacing="default">
            <FadeInSection>
              <div className="event-section-intro">
                <span className="event-section-eyebrow">Bröllop, fest eller gruppdag</span>
                <div className="section-ornament" aria-hidden="true">
                  <span className="section-ornament-line"></span>
                  <Wine size={20} />
                  <span className="section-ornament-line"></span>
                </div>
                <h2>Vad vill ni ordna?</h2>
                <p className="event-section-lead">
                  Här finns plats för bröllop, privata fester, företagsevent och
                  gruppdagar i en renoverad lada strax utanför Lidköping.
                </p>
              </div>

              <div className="event-types-grid">
                {EVENT_TYPES.map(
                  ({
                    Icon,
                    description,
                    href,
                    image,
                    imageAlt,
                    linkLabel,
                    title,
                    to,
                    variant,
                  }, index) => {
                    const content = (
                      <>
                        {image && (
                          <img
                            className="event-type-card__image"
                            src={image}
                            alt={imageAlt}
                            loading="lazy"
                          />
                        )}
                        <span className="event-type-card__index" aria-hidden="true">
                          0{index + 1}
                        </span>
                        <div className="event-type-card__content">
                          <span className="event-type-card__icon" aria-hidden="true">
                            <Icon size={23} />
                          </span>
                          <h3>{title}</h3>
                          <p>{description}</p>
                          <span className="event-type-card__link">
                            {linkLabel}
                            <ArrowUpRight size={16} aria-hidden="true" />
                          </span>
                        </div>
                      </>
                    );
                    const className = [
                      "event-type-card",
                      `event-type-card--${variant}`,
                      image ? "event-type-card--image" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return to ? (
                      <Link key={title} className={className} to={to}>
                        {content}
                      </Link>
                    ) : (
                      <a key={title} className={className} href={href}>
                        {content}
                      </a>
                    );
                  }
                )}
              </div>

              <div className="event-facts-grid">
                {EVENT_FACTS.map((fact) => (
                  <article key={fact.value} className="event-fact-card">
                    <strong>{fact.value}</strong>
                    <p>{fact.label}</p>
                  </article>
                ))}
              </div>

              <div className="event-action-bar">
                <button
                  className="event-gallery-button event-gallery-button--solid"
                  type="button"
                  onClick={handleGalleryClick}
                  aria-label="Gå till bildgalleri"
                >
                  Se galleriet
                </button>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="alt" below="white" variant="valley" />

        <div id="event-loft-section">
          <PageSection background="white" spacing="default">
            <FadeInSection>
              <div className="event-split-layout">
                <div className="event-split-image">
                  <img src="/images/event/hero/hero-2.webp" alt="Dukade bord för fest på loftet" />
                </div>
                <div className="event-split-content">
                  <span className="event-section-eyebrow">Ytor och kapacitet</span>
                  <div className="section-ornament align-left" aria-hidden="true">
                    <span className="section-ornament-line"></span>
                    <Maximize2 size={18} />
                    <span className="section-ornament-line"></span>
                  </div>
                  <h2>Plats för både middag och mingel</h2>
                  <p>
                    Ladan och loftet ger er totalt 360 kvm inomhus på två
                    våningar. Ni kan använda en våning eller låta gästerna röra
                    sig mellan båda.
                  </p>
                  <ul className="event-bullets">
                    <li><strong>Loftet:</strong> Plats för 150+ sittande gäster vid middag eller föreläsning.</li>
                    <li><strong>Ladan:</strong> Plats för 50+ sittande gäster på bottenvåningen.</li>
                    <li><strong>Mingel:</strong> Tillsammans rymmer lokalerna 300+ stående gäster.</li>
                  </ul>
                </div>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="white" below="green" variant="wave" />

        <div id="event-amenities-section">
          <PageSection background="green" spacing="default">
            <FadeInSection>
              <div className="event-split-layout event-split-layout--reverse">
                <div className="event-split-image">
                  <img src="/images/event/hero/hero-3.webp" alt="Detaljbild från baren i ladan" />
                </div>
                <div className="event-split-content">
                  <span className="event-section-eyebrow">Det här finns på plats</span>
                  <div className="section-ornament align-left" aria-hidden="true">
                    <span className="section-ornament-line"></span>
                    <Sparkles size={18} />
                    <span className="section-ornament-line"></span>
                  </div>
                  <h2>Möbler, bar, ljud och köksytor</h2>
                  <p>
                    Mycket av det praktiska finns redan här och ingår i hyran.
                    Ni får också ta med egen mat och dryck.
                  </p>
                  <ul className="event-bullets">
                    <li><strong>Dukning & möbler:</strong> Glas, tallrikar, bestick, bord och stolar finns färdigt för alla gäster.</li>
                    <li><strong>Kök:</strong> Bra arbetsytor, handdisk samt varmt och kallt vatten. Muurikka-hällar kan hyras.</li>
                    <li><strong>Övriga ytor:</strong> Lounge med soffor, dansgolv, bar och toaletter.</li>
                    <li><strong>Ljud och ljus:</strong> Ljudanläggning och festbelysning är installerade.</li>
                    <li><strong>Mat och dryck:</strong> Ni får ta med egen mat och dryck. Vid behov kan vi hjälpa till att ordna serveringspersonal, bar eller DJ.</li>
                  </ul>
                </div>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="green" below="alt" variant="hill" />

        <div id="event-planning-section">
          <PageSection background="alt" spacing="default">
            <FadeInSection>
              <div className="event-planning">
                <div className="event-section-intro event-section-intro--compact">
                  <span className="event-section-eyebrow">Så går planeringen till</span>
                  <div className="section-ornament" aria-hidden="true">
                    <span className="section-ornament-line"></span>
                    <CalendarCheck size={20} />
                    <span className="section-ornament-line"></span>
                  </div>
                  <h2>Vi planerar det praktiska tillsammans</h2>
                  <p className="event-section-lead">
                    Ni sätter tonen och vi hjälper er att få lokalerna och det
                    praktiska på plats.
                  </p>
                </div>

                <ol
                  className="event-timeline event-timeline--scroll"
                  ref={timelineRef}
                  style={{
                    "--event-timeline-progress": timelineProgress,
                  }}
                >
                  {EVENT_STEPS.map((step, index) => (
                    <li
                      key={step.title}
                      className={`event-timeline__item${
                        index < activeTimelineSteps
                          ? " event-timeline__item--active"
                          : ""
                      }`}
                    >
                      <span className="event-timeline__number" aria-hidden="true">
                        {index + 1}
                      </span>
                      <div className="event-timeline__content">
                        <h3>{step.title}</h3>
                        <p>{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="alt" below="white" variant="wave" />

        <div id="event-services-recommendation">
          <PageSection background="white" spacing="none">
            <FadeInSection>
              <HomeServicesSection
                excludeId="event"
                title="Utforska mer"
                eyebrow="MER HOS OSS"
              />
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="white" below="alt" variant="valley" />
      </main>
    </div>
  );
}

export default EventPage;
