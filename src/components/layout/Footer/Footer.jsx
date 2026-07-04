import "./Footer.css";
import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";
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

  const footerLinks = appRoutes
    .filter((link) => !link.hidden)
    .flatMap((link) => {
      const children = (link.children ?? []).filter(
        (child) => !child.hidden,
      );
      return [link, ...children];
    });

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-content">
        <div className="footer-brand">
          <h2 className="footer-logo">Storegården 7</h2>
          <p className="footer-tagline">En plats för kreativt nöje</p>
        </div>

        <nav className="footer-nav" aria-label="Footer Navigation">
          <ul className="footer-links">
            {footerLinks.map((link) => (
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

        <div className="footer-social-wrapper">
          <p className="footer-social-title">Följ oss gärna på</p>
          <div className="footer-social">
            <a
              href="https://www.facebook.com/profile.php?id=61564642647081"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Besök oss på Facebook"
            >
              <Facebook size={24} />
            </a>
            <a
              href="https://www.instagram.com/storegarden7/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Besök oss på Instagram"
            >
              <Instagram size={24} />
            </a>
          </div>

          <div className="footer-collaboration">
            <h3 className="footer-collab-title">Samarbeta med oss</h3>
            <p className="footer-collab-text">
              Vi samarbetar gärna med andra som har idéer eller vill ställa ut konst, arrangera evenemang eller skapa något kreativt.{" "}
              <a href="mailto:storegardensju@gmail.com?subject=Samarbete med Storegården 7" className="footer-collab-link">
                Hör av dig till oss!
              </a>
            </p>
          </div>
        </div>

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
