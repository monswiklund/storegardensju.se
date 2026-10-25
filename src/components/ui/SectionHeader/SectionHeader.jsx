import PropTypes from "prop-types";
import { Sprout } from "lucide-react";
import "./SectionHeader.css";

/** Eyebrow, ornament, heading and lead in the house style, so sections stop restyling their own. */
function SectionHeader({ id, eyebrow, title, lead, align = "center", icon: Icon = Sprout, as: Heading = "h2" }) {
  return (
    <header className={`section-header section-header--${align}`}>
      {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
      <div className={`section-ornament${align === "left" ? " align-left" : ""}`} aria-hidden="true">
        <span className="section-ornament-line"></span>
        <Icon size={20} />
        <span className="section-ornament-line"></span>
      </div>
      <Heading id={id} className="section-header__title">
        {title}
      </Heading>
      {lead && <p className="section-header__lead">{lead}</p>}
    </header>
  );
}

SectionHeader.propTypes = {
  id: PropTypes.string,
  eyebrow: PropTypes.string,
  title: PropTypes.node.isRequired,
  lead: PropTypes.node,
  align: PropTypes.oneOf(["center", "left"]),
  icon: PropTypes.elementType,
  as: PropTypes.oneOf(["h1", "h2", "h3"]),
};

export default SectionHeader;
