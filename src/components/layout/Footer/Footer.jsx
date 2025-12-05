import "./Footer.css";
import { Link } from "react-router-dom";
import BuildInfo from "../../ui/BuildInfo.jsx";
import { useEffect, useState } from "react";

const Footer = () => {
  const [currentYear, setCurrentYear] = useState(2025);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const navLinks = [
    { label: "Hem", path: "/" },
    { label: "Event & Fest", path: "/event" },
    { label: "Kurser & Skapande", path: "/konst" },
    { label: "Galleri", path: "/galleri" },
    { label: "Om Oss", path: "/om-oss" },
  ];

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-content">
        <div className="footer-brand">
          <h2 className="footer-logo">Storegården 7</h2>
          <p className="footer-tagline">En plats för kreativt nöje</p>
        </div>

        <nav className="footer-nav" aria-label="Footer Navigation">
          <ul className="footer-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="footer-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-build-info">
          <BuildInfo />
        </div>

        <div className="footer-copyright">
          <p>
            &copy; {currentYear} Storegården 7. Alla rättigheter förbehållna.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
