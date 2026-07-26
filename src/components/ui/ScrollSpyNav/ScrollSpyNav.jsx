import { useEffect, useState } from "react";

/**
 * The floating dash rail on the right that shows how many sections a page has
 * and which one you are in. HomePage/EventPage/MohippaPage each had their own
 * copy of the scroll-spy effect; this is the same markup and the same global
 * .scroll-indicator-nav styles, driven by a section list instead.
 *
 * sections: [{ id, label, title? }] in document order.
 *
 * The active section is the last one whose top has passed the probe line, so
 * short sections at the bottom of the page still light up.
 */
function ScrollSpyNav({ sections, label = "Sidinnehåll", offset = 90 }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const ids = sections.map((s) => s.id);

    const handleScroll = () => {
      // Probe a bit below the fixed navbar so a section counts as active once
      // its heading is actually on screen.
      const probe = window.scrollY + offset + 40;
      let current = ids[0];

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (probe >= top) current = id;
      }

      // At the very bottom the last section may be too short to ever reach the
      // probe line - treat "scrolled to the end" as being in it.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) {
        const lastPresent = [...ids]
          .reverse()
          .find((id) => document.getElementById(id));
        if (lastPresent) current = lastPresent;
      }

      setActiveId(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [sections, offset]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <nav className="scroll-indicator-nav" aria-label={label}>
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => scrollTo(section.id)}
              className={`scroll-dot ${activeId === section.id ? "active" : ""}`}
              title={section.title || section.label}
              aria-current={activeId === section.id ? "true" : undefined}
            >
              <span className="dot-label">{section.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default ScrollSpyNav;
