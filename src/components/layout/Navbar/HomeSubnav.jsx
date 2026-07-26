import { useEffect, useState } from "react";

const HOME_SECTIONS = [
  { id: "home-events", label: "Kommande evenemang" },
  { id: "past-events", label: "Tidigare evenemang" },
  { id: "home-services", label: "Vad vi erbjuder" },
  { id: "home-contact", label: "Kontakta oss" },
];

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;

  const subnavHeight =
    document.querySelector(".event-subnav.active")?.getBoundingClientRect()
      .height ?? 0;
  const offset = -(60 + subnavHeight + 16);

  if (window.storegardenLenis?.scrollTo) {
    window.storegardenLenis.scrollTo(target, { offset });
    return;
  }

  const top = target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: "smooth" });
}

function HomeSubnav() {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const updateActiveSection = () => {
      const probe = window.scrollY + 130;
      let nextActive = null;

      for (const section of HOME_SECTIONS) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= probe) {
          nextActive = section.id;
        }
      }

      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      ) {
        nextActive = HOME_SECTIONS.at(-1).id;
      }

      setActiveId(nextActive);
    };

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    updateActiveSection();

    return () => window.removeEventListener("scroll", updateActiveSection);
  }, []);

  return (
    <div
      className="event-subnav home-subnav active"
      role="navigation"
      aria-label="Startsida undernavigering"
    >
      <div className="event-subnav-inner">
        {HOME_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`event-subnav-link home-subnav-link ${
              activeId === section.id ? "active" : ""
            }`}
            aria-current={activeId === section.id ? "location" : undefined}
            onClick={() => scrollToSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default HomeSubnav;
