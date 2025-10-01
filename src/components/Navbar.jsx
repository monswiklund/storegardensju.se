import { useState, useEffect } from "react";
import "./NavbarStyles.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top");

  const navItems = [
    { label: "Hem", target: "top" },
    { label: "Event & Fest", target: "event-fest-section" },
    { label: "Skapande", target: "skapande-section" },
    { label: "Kommande evenemang", target: "evenemang-section" },
    { label: "Tidigare evenemang", target: "tidigare-evenemang-section" },
    { label: "Om oss", target: "om-oss-heading" },
    { label: "Galleri", target: "gallery-heading" },
    { label: "Teamet", target: "about-heading" },
    { label: "Kontakt", target: "contact-heading" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => item.target);
      const scrollPosition = window.scrollY + 150;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Check if near bottom of page (within 200px)
      if (scrollPosition + windowHeight >= documentHeight - 200) {
        setActiveSection("contact-heading");
        return;
      }

      if (window.scrollY < 100) {
        setActiveSection("top");
        return;
      }

      for (const section of sections.reverse()) {
        let element;

        // Special handling for sections with custom targets
        if (section === "om-oss-heading") {
          element = document.querySelector('.featured-gallery-section');
        } else if (section === "gallery-heading") {
          element = document.querySelector('.storegarden-gallery');
        } else {
          element = document.getElementById(section);
        }

        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (target) => {
    if (target === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (target === "gallery-heading" || target === "om-oss-heading" || target === "about-heading") {
      // Scroll with offset for navbar
      let element;
      if (target === "gallery-heading") {
        element = document.querySelector('.storegarden-gallery');
      } else if (target === "om-oss-heading") {
        element = document.querySelector('.featured-gallery-section');
      } else {
        element = document.getElementById(target);
      }

      if (element) {
        const navbarHeight = 70; // Fixed navbar height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - navbarHeight - 20;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    } else {
      const element = document.getElementById(target);
      if (!element) {
        const sectionElement = document.getElementById(`${target}`);
        sectionElement?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setIsOpen(false);
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Huvudnavigation">
      <div className="navbar-container">
        <button
          className={`hamburger ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-menu ${isOpen ? "open" : ""}`}>
          <ul className="nav-list">
            {navItems.map((item, index) => (
              <li key={index} className="nav-item">
                <button
                  className={`nav-link ${activeSection === item.target ? "active" : ""}`}
                  onClick={() => scrollToSection(item.target)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {isOpen && (
          <div
            className="nav-overlay"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </nav>
  );
}

export default Navbar;
