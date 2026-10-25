import "./Footer.css";
import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";
import BuildInfo from "../../ui/BuildInfo.jsx";
import { useEffect, useState } from "react";
import { canonicalPath, routeLabel } from "../../../config/routes.js";
import usePageCopy from "../../../hooks/usePageCopy.js";
import useShopHasProducts from "../../../hooks/useShopHasProducts.js";
import { COURSE_LOCATION } from "../../../data/courseEvents.js";
import { contactEmail } from "../../../features/contact/contact.js";

// Grouped by what a visitor came for, instead of one flat row of every route.
const footerGroups = [
  {
    titleKey: "footer.nav.celebrate",
    links: [
      { path: "/event/brollop", label: "Bröllop" },
      { path: "/event", label: "Event" },
      { path: "/gruppdagar", label: "Gruppdagar" },
    ],
  },
  {
    titleKey: "footer.nav.courses",
    links: [
      { path: "/kurser", label: "Kurser" },
      { path: "/kurser/yoga", label: "Yoga" },
      { path: "/kurser/konst", label: "Måleri" },
    ],
  },
  {
    titleKey: "footer.nav.farm",
    links: [
      { path: "/galleri", label: "Galleri" },
      { path: "/butik", label: "Butik", shopOnly: true },
      { path: "/om-oss", label: "Om Oss" },
      { path: "/kontakt", label: "Kontakt" },
    ],
  },
];

const Footer = () => {
  const copy = usePageCopy("site");
  const shopHasProducts = useShopHasProducts();
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
          <h2 className="footer-logo">{copy("footer.name")}</h2>
          <p className="footer-tagline">{copy("footer.tagline")}</p>
        </div>

        <div className="footer-columns">
          <address className="footer-contact">
            <h3 className="footer-column-title">{copy("footer.contact-title")}</h3>
            <p>
              {COURSE_LOCATION.name}
              <br />
              {COURSE_LOCATION.postalCode} {COURSE_LOCATION.locality}
              <br />
              {COURSE_LOCATION.travelNote}
            </p>
            <p>
              <a href={`mailto:${contactEmail}`} className="footer-link">
                {contactEmail}
              </a>
              <br />
              <span className="footer-muted">{copy("contact.response-time")}</span>
            </p>
            <p>
              <Link to={canonicalPath("/kontakt")} className="footer-link" onClick={handleLinkClick}>
                {copy("footer.directions")}
              </Link>
            </p>
          </address>

          <nav className="footer-nav" aria-label={copy("footer.nav-label")}>
            {footerGroups.map((group) => (
              <div key={group.titleKey} className="footer-nav-group">
                <h3 className="footer-column-title">{copy(group.titleKey)}</h3>
                <ul className="footer-links">
                  {group.links
                    .filter((link) => shopHasProducts || !link.shopOnly)
                    .map((link) => (
                      <li key={link.path}>
                        <Link
                          to={canonicalPath(link.path)}
                          className="footer-link"
                          onClick={handleLinkClick}
                        >
                          {routeLabel(link, copy)}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

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
              <a href={`mailto:${contactEmail}?subject=${encodeURIComponent("Samarbete med Storegården 7")}`} className="footer-collab-link">
                {copy("footer.collaboration-cta")}
              </a>
            </p>
          </div>
        </div>

        <div className="footer-copyright">
          <p>
            &copy; {currentYear} {copy("footer.copyright")}
          </p>
          {/* Also the hidden way into /admin (three clicks). */}
          <BuildInfo />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
