import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavbarStyles.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Hem", path: "/" },
    { label: "Event", path: "/event" },
    { label: "Konst", path: "/konst" },
    { label: "Galleri", path: "/galleri" },
      { label: "Vilka Vi Är", path: "/team" },
  ];

  const handleNavClick = () => {
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
                <Link
                  to={item.path}
                  className={`nav-link ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                  onClick={handleNavClick}
                >
                  {item.label}
                </Link>
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
