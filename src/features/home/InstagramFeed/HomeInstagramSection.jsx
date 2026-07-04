import { useEffect, useState } from "react";
import { Instagram } from "lucide-react";
import "./InstagramFeed.css";
import { fetchInstagramFeed } from "../../../services/instagramService";
import { getApiBaseUrl } from "../../../config/apiBaseUrl";

const PAGE_SIZE = 9;

// Backend serves downscaled WebP thumbs; full-size IG originals (1.9-4.5MB)
// cause scroll jank if loaded directly.
const toImageSrc = (item) =>
  `${getApiBaseUrl()}/api/instagram/image/${item.id}`;

const toFallbackImageSrc = (item) =>
  item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url;

const hasImage = (item) =>
  item?.id && toFallbackImageSrc(item);

const handleImageError = (event, item) => {
  const fallback = toFallbackImageSrc(item);
  if (!fallback || event.currentTarget.src === fallback) return;
  event.currentTarget.src = fallback;
};

function HomeInstagramSection() {
  const [items, setItems] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    fetchInstagramFeed()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data?.items) ? data.items : [];
        setItems(list.filter(hasImage));
      })
      .catch(() => {
        // Feed unavailable: section stays hidden, no error UI.
      });
    return () => {
      active = false;
    };
  }, []);

  if (items.length === 0) return null;

  const visibleItems = expanded ? items : items.slice(0, PAGE_SIZE);

  return (
    <section className="instagram-section" aria-labelledby="instagram-heading">
      <div className="instagram-container">
        <header className="instagram-section-header">
          <h2 id="instagram-heading">Följ oss på Instagram</h2>
          <a
            className="instagram-handle"
            href="https://www.instagram.com/storegarden7/"
            target="_blank"
            rel="noopener noreferrer"
          >
            @storegarden7
          </a>
        </header>
        <div className="instagram-frame">
          <div className="instagram-grid">
            {visibleItems.map((item, index) => (
              <a
                key={item.id}
                className="instagram-grid-item"
                href={item.permalink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={toImageSrc(item)}
                  alt={item.caption || "Instagram-inlägg från Storegården 7"}
                  loading={index < 3 ? "eager" : "lazy"}
                  decoding="async"
                  onError={(event) => handleImageError(event, item)}
                />
                <span className="instagram-overlay" aria-hidden="true">
                  {item.caption && (
                    <span className="instagram-overlay-caption">
                      {item.caption}
                    </span>
                  )}
                </span>
              </a>
            ))}
          </div>
        </div>
        <div className="instagram-actions">
          {!expanded && items.length > PAGE_SIZE ? (
            <button
              type="button"
              className="instagram-more"
              onClick={() => setExpanded(true)}
            >
              Visa fler
            </button>
          ) : (
            <>
              <a
                className="instagram-cta"
                href="https://www.instagram.com/storegarden7/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={16} />
                Se allt på Instagram
              </a>
              {expanded && (
                <button
                  type="button"
                  className="instagram-more"
                  onClick={() => setExpanded(false)}
                >
                  Visa färre
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default HomeInstagramSection;
