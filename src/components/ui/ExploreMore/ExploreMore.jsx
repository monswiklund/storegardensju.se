import PropTypes from "prop-types";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { services } from "../../../data/homeContent.js";
import { canonicalPath } from "../../../config/routes.js";
import usePageCopy from "../../../hooks/usePageCopy.js";
import usePageMedia from "../../../hooks/usePageMedia.js";
import SectionHeader from "../SectionHeader/SectionHeader.jsx";
import "./ExploreMore.css";

// "fest" is left out by default: it links into /event, so it doubled the Event card.
const DEFAULT_IDS = ["brollop", "event", "gruppdagar", "kurser-konst", "yoga"];

/**
 * The site's one "where next" block: static cards built from the home page's service
 * texts and images (edited once, under Startsidan in the CMS), minus the page you are on.
 */
function ExploreMore({
  ids = DEFAULT_IDS,
  exclude = [],
  limit = 4,
  eyebrow,
  title,
  lead,
  showMeta = false,
  headingId = "explore-more-title",
  background = "white",
}) {
  const homeCopy = usePageCopy("home");
  const homeMedia = usePageMedia("home");
  const siteCopy = usePageCopy("site");

  const cards = ids
    .filter((id) => !exclude.includes(id))
    .map((id) => services.find((service) => service.id === id))
    .filter(Boolean)
    .slice(0, limit)
    .map((service) => ({
      id: service.id,
      route: service.route,
      image: homeMedia(`services.${service.id}`, service.image, "card"),
      kicker: homeCopy(`services.${service.id}.kicker`, service.kicker),
      title: homeCopy(`services.${service.id}.title`, service.title),
      description: homeCopy(`services.${service.id}.description`, service.description),
      meta: homeCopy(`services.${service.id}.meta`, service.meta),
      cta: homeCopy(`services.${service.id}.cta`, service.ctaLabel),
    }));

  if (cards.length === 0) return null;

  return (
    <section className={`explore-more explore-more--${background}`} aria-labelledby={headingId}>
      <div className="explore-more__inner">
        <SectionHeader
          id={headingId}
          eyebrow={eyebrow ?? siteCopy("explore.eyebrow")}
          title={title ?? siteCopy("explore.title")}
          lead={lead}
        />
        <ul className={`explore-more__grid explore-more__grid--${cards.length}`}>
          {cards.map((card) => (
            <li key={card.id}>
              <Link to={canonicalPath(card.route)} className="explore-more__card">
                <span className="explore-more__media">
                  {card.image && <img src={card.image} alt="" loading="lazy" decoding="async" />}
                </span>
                <span className="explore-more__body">
                  <span className="explore-more__kicker">{card.kicker}</span>
                  <span className="explore-more__title">{card.title}</span>
                  <span className="explore-more__text">{card.description}</span>
                  {showMeta && card.meta && <span className="explore-more__meta">{card.meta}</span>}
                  <span className="explore-more__cta">
                    {card.cta}
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

ExploreMore.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.string),
  exclude: PropTypes.arrayOf(PropTypes.string),
  limit: PropTypes.number,
  eyebrow: PropTypes.string,
  title: PropTypes.string,
  lead: PropTypes.string,
  showMeta: PropTypes.bool,
  headingId: PropTypes.string,
  background: PropTypes.oneOf(["white", "alt", "green"]),
};

export default ExploreMore;
