import { useEffect, useState } from "react";
import usePageCopy from "../../../hooks/usePageCopy.js";

const HOME_SECTIONS = [
  { id: "home-services", key: "services-section.title" },
  { id: "home-events", key: "events.upcoming.title" },
  { id: "past-events", key: "events.past.title" },
  { id: "home-contact", key: "hero.primary-cta" },
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
  const homeCopy = usePageCopy("home");
  const siteCopy = usePageCopy("site");
  const [activeId, setActiveId] = useState(null);
  // Sections render only with content (no upcoming events, no section), so link only to those on the page.
  const [presentIds, setPresentIds] = useState("");

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
      setPresentIds(
        HOME_SECTIONS.filter((section) => document.getElementById(section.id))
          .map((section) => section.id)
          .join(" "),
      );
    };

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    updateActiveSection();

    // The events sections mount after their fetch, so recount when the page changes, not on the next scroll.
    const observer = new MutationObserver(updateActiveSection);
    // The whole body: during a route transition #main-content may still be the previous page's.
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="event-subnav home-subnav active"
      role="navigation"
      aria-label={siteCopy("ui.page-sections")}
    >
      <div className="event-subnav-inner">
        {HOME_SECTIONS.filter((section) => presentIds.split(" ").includes(section.id)).map((section) => {
          const label = homeCopy(section.key);
          if (!label) return null;
          return (
            <button
              key={section.id}
              type="button"
              className={`event-subnav-link home-subnav-link ${
                activeId === section.id ? "active" : ""
              }`}
              aria-current={activeId === section.id ? "location" : undefined}
              onClick={() => scrollToSection(section.id)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default HomeSubnav;

