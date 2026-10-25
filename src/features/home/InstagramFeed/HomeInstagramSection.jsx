import { useEffect, useState } from "react";
import { Instagram } from "lucide-react";
import "./InstagramFeed.css";
import { fetchInstagramFeed } from "../../../services/instagramService";
import { getApiBaseUrl } from "../../../config/apiBaseUrl";
import usePageCopy from "../../../hooks/usePageCopy.js";
import SectionHeader from "../../../components/ui/SectionHeader/SectionHeader.jsx";

const MAX_POSTS = 6;

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

// A row of the latest posts and one link out. It replaced a mock iPhone whose
// Instagram buttons (bell, tabs, menu) did nothing when tapped.
function HomeInstagramSection() {
  const copy = usePageCopy("home");
  const profileUrl = copy("instagram.profile-url");
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    fetchInstagramFeed()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data?.items) ? data.items : [];
        setItems(list.filter(hasImage).slice(0, MAX_POSTS));
      })
      .catch(() => {
        // Feed unavailable: section stays hidden, no error UI.
      });
    return () => {
      active = false;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="instagram-section" aria-labelledby="instagram-heading">
      <div className="instagram-container">
        <SectionHeader
          id="instagram-heading"
          eyebrow={copy("instagram.eyebrow")}
          title={copy("instagram.title")}
          lead={copy("instagram.body")}
          icon={Instagram}
        />

        <ul className="instagram-strip">
          {items.map((item, index) => (
            <li key={item.id}>
              <a
                className="instagram-strip-item"
                href={item.permalink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={toImageSrc(item)}
                  alt={item.caption ? item.caption.slice(0, 140) : copy("instagram.title")}
                  loading={index < 3 ? "eager" : "lazy"}
                  decoding="async"
                  onError={(event) => handleImageError(event, item)}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="instagram-actions">
          <a
            className="btn btn--secondary"
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram size={16} aria-hidden="true" />
            {copy("instagram.cta")}
          </a>
        </div>
      </div>
    </section>
  );
}

export default HomeInstagramSection;
