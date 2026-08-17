import { useEffect, useState } from "react";
import { 
  Instagram, 
  Sprout, 
  ChevronLeft, 
  Bell, 
  MoreHorizontal, 
  Grid, 
  Film, 
  User, 
  Link as LinkIcon 
} from "lucide-react";
import "./InstagramFeed.css";
import { fetchInstagramFeed } from "../../../services/instagramService";
import { getApiBaseUrl } from "../../../config/apiBaseUrl";
import usePageMedia from "../../../hooks/usePageMedia.js";
import usePageCopy from "../../../hooks/usePageCopy.js";

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
  const copy = usePageCopy("home");
  const profileUrl = copy("instagram.profile-url");
  const siteMedia = usePageMedia("site");
  const logo = siteMedia("brand.logo", "/images/logoTransp_cropped.png", "thumbnail");
  const [items, setItems] = useState([]);
  const [timeStr, setTimeStr] = useState("09:41");

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

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      setTimeStr(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="instagram-section" aria-labelledby="instagram-heading">
      <div className="instagram-container">
        <header className="instagram-section-header">
          <span className="instagram-eyebrow">{copy("instagram.eyebrow")}</span>
          <div className="instagram-ornament" aria-hidden="true">
            <span className="instagram-ornament-line"></span>
            <Sprout size={20} />
            <span className="instagram-ornament-line"></span>
          </div>
          <h2 id="instagram-heading">{copy("instagram.title")}</h2>
          <p className="instagram-subtitle">
            {copy("instagram.body")}
          </p>
        </header>

        {/* iPhone Device Wrapper */}
        <div className="iphone-device">
          {/* Bezel details */}
          <div className="iphone-dynamic-island"></div>
          
          {/* Status Bar */}
          <div className="iphone-status-bar">
            <span className="iphone-time">{timeStr}</span>
            <div className="iphone-status-icons" aria-hidden="true">
              <span className="iphone-signal">
                <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
                  <rect x="0" y="8" width="2.5" height="3" rx="0.5" />
                  <rect x="3.5" y="6" width="2.5" height="5" rx="0.5" />
                  <rect x="7" y="4" width="2.5" height="7" rx="0.5" />
                  <rect x="10.5" y="2" width="2.5" height="9" rx="0.5" />
                  <rect x="14" y="0" width="2.5" height="11" rx="0.5" opacity="0.3" />
                </svg>
              </span>
              <span className="iphone-wifi">
                <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
                  <path d="M8 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3.535-4.95a5 5 0 0 1 7.07 0 1 1 0 1 0 1.415-1.414 7 7 0 0 0-9.9 0 1 1 0 1 0 1.415 1.414zm-2.829-2.829a9 9 0 0 1 12.728 0 1 1 0 1 0 1.414-1.414 11 11 0 0 0-15.556 0 1 1 0 1 0 1.414 1.414z" fill="currentColor" />
                </svg>
              </span>
              <span className="iphone-battery">
                <svg width="22" height="11" viewBox="0 0 22 11" fill="currentColor">
                  <rect x="0.5" y="0.5" width="18" height="10" rx="2.5" fill="none" stroke="currentColor" />
                  <rect x="2.5" y="2.5" width="14" height="6" rx="1.5" />
                  <path d="M20 3.5v4" stroke="currentColor" strokeLinecap="round" />
                </svg>
              </span>
            </div>
          </div>

          {/* Simulated Instagram App */}
          <div className="instagram-app">
            {/* App Header */}
            <header className="instagram-app-header">
              <a 
                className="instagram-app-back" 
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ChevronLeft size={24} />
              </a>
              <div className="instagram-app-title">
                <span className="instagram-app-username">{copy("instagram.username")}</span>
              </div>
              <div className="instagram-app-header-actions">
                <button className="instagram-icon-button">
                  <Bell size={20} />
                </button>
                <button className="instagram-icon-button">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </header>
 
            {/* Scrollable Main Area */}
            <div className="instagram-app-content" data-lenis-prevent>
              {/* Profile details */}
              <div className="instagram-profile-details">
                <div className="instagram-avatar-stats">
                  <div className="instagram-avatar-container">
                    <div className="instagram-avatar-ring">
                      <div className="instagram-avatar-bg">
                        {logo && <img src={logo} alt="" className="instagram-avatar-img" />}
                      </div>
                    </div>
                  </div>
                  <div className="instagram-stats-container">
                    <div className="instagram-stat">
                      <span className="instagram-stat-value">{copy("instagram.posts-count")}</span>
                      <span className="instagram-stat-label">{copy("instagram.posts-label")}</span>
                    </div>
                    <div className="instagram-stat">
                      <span className="instagram-stat-value">{copy("instagram.followers-count")}</span>
                      <span className="instagram-stat-label">{copy("instagram.followers-label")}</span>
                    </div>
                    <div className="instagram-stat">
                      <span className="instagram-stat-value">{copy("instagram.following-count")}</span>
                      <span className="instagram-stat-label">{copy("instagram.following-label")}</span>
                    </div>
                  </div>
                </div>
 
                <div className="instagram-bio-section">
                  <h3 className="instagram-bio-name">{copy("instagram.bio-name")}</h3>
                  <div className="instagram-bio-text">
                    {copy("instagram.bio-line1")}<br />
                    {copy("instagram.bio-line2")}<br />
                    {copy("instagram.bio-line3")}
                  </div>
                  <a 
                    href={copy("instagram.website-url")}
                    className="instagram-bio-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkIcon size={12} className="instagram-link-icon" />
                    <span>{copy("instagram.website-label")}</span>
                  </a>
                </div>
 
                <div className="instagram-profile-actions">
                  <a 
                    href={profileUrl}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="instagram-btn instagram-btn-primary"
                  >
                    {copy("instagram.follow-cta")}
                  </a>
                  <a 
                    href={profileUrl}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="instagram-btn instagram-btn-secondary"
                  >
                    {copy("instagram.message-cta")}
                  </a>
                </div>
              </div>

              {/* Tabs */}
              <div className="instagram-tabs">
                <button className="instagram-tab active">
                  <Grid size={20} />
                </button>
                <button className="instagram-tab">
                  <Film size={20} />
                </button>
                <button className="instagram-tab">
                  <User size={20} />
                </button>
              </div>

              {/* Post Grid */}
              <div className="instagram-grid">
                {items.map((item, index) => (
                  <a
                    key={item.id}
                    className="instagram-grid-item"
                    href={item.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={toImageSrc(item)}
                      alt={item.caption || ""}
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

            {/* Simulated Home Indicator Bottom Area */}
            <div className="iphone-home-area">
              <div className="iphone-home-indicator"></div>
            </div>
          </div>
        </div>

        {/* Actions Button */}
        <div className="instagram-actions">
          <a
            className="instagram-cta"
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram size={16} />
            {copy("instagram.cta")}
          </a>
        </div>
      </div>
    </section>
  );
}

export default HomeInstagramSection;
