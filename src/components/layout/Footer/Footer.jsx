import "./Footer.css";
import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";
import BuildInfo from "../../ui/BuildInfo.jsx";
import { useEffect, useState } from "react";
import { appRoutes, canonicalPath } from "../../../config/routes.js";
import usePageCopy from "../../../hooks/usePageCopy.js";

const Footer = () => {
  const copy = usePageCopy("site");
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
          <h2 className="footer-logo">{copy("footer.name")}</h2>
          <p className="footer-tagline">{copy("footer.tagline")}</p>
        </div>

        <nav className="footer-nav" aria-label="Footer Navigation">
          <ul className="footer-links">
            {footerLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={canonicalPath(link.path)}
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
          <p className="footer-social-title">{copy("footer.social-title")}</p>
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
            <h3 className="footer-collab-title">{copy("footer.collaboration-title")}</h3>
            <p className="footer-collab-text">
              {copy("footer.collaboration-body")}{" "}
              <a href={`mailto:${copy("footer.contact-email")}?subject=Samarbete med Storegården 7`} className="footer-collab-link">
                {copy("footer.collaboration-cta")}
              </a>
            </p>
          </div>
        </div>

        <div className="footer-build-info">
          <BuildInfo />
        </div>

        <div className="footer-copyright">
          <p>
            &copy; {currentYear} {copy("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
