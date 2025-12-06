import "./Footer.css";
import { Link } from "react-router-dom";
import BuildInfo from "../../ui/BuildInfo.jsx";
import { useEffect, useState } from "react";
import { appRoutes } from "../../../config/routes.js";

const Footer = () => {
  const [currentYear, setCurrentYear] = useState(2025);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-content">
        <div className="footer-brand">
          <h2 className="footer-logo">Storegården 7</h2>
          <p className="footer-tagline">En plats för kreativt nöje</p>
        </div>

        <nav className="footer-nav" aria-label="Footer Navigation">
          <ul className="footer-links">
            {appRoutes.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="footer-link"
                  onClick={handleLinkClick}
                >
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
