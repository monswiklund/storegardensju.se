import { useEffect, useRef, useState } from "react";
import { Bell, CalendarDays, Check } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  allUpcomingPasses,
  formatPassDate,
  formatPassTime,
  passAnchor,
  passHubPath,
  passInstructor,
} from "../../../data/courseEvents.js";
import { canonicalPath } from "../../../config/routes.js";
import { fetchPublicNotifications, isNotificationLive } from "../../../services/notificationsService.js";
import { useSiteCopy } from "../../../hooks/usePageCopy.js";
import "./NotificationBell.css";

const STORAGE_KEY = "storegarden-read-notifications";

function readStoredIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** Stand-in when the CMS could not be read: the passes in this build's export that are still ahead. */
function passNotifications(now) {
  return allUpcomingPasses(now)
    .filter((pass) => pass.status !== "cancelled")
    .map((pass) => {
      // A guest instructor is not named; the pass title stands alone.
      const instructor = passInstructor(pass);
      return {
        id: pass.id,
        title: instructor ? `${instructor.name.split(" ")[0]} håller ${pass.title.toLowerCase()}` : pass.title,
        detail: `${formatPassDate(pass)} kl. ${formatPassTime(pass.startAt)}`,
        href: `${passHubPath(pass)}/#${passAnchor(pass)}`,
      };
    });
}

function cmsNotifications(items, now) {
  return items.filter((item) => isNotificationLive(item, now)).map((item) => ({
    id: item.updatedAt ? `${item.id}:${item.updatedAt}` : item.id,
    title: item.title,
    detail: item.message,
    href: item.href || "/event/",
  }));
}

export default function NotificationBell() {
  const location = useLocation();
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState(readStoredIds);
  // null until answered; "fallback" when the CMS could not be read.
  const [cmsItems, setCmsItems] = useState(null);
  const siteCopy = useSiteCopy();
  // Evaluated on every render, so a pass or a notice window that ends while the tab is open drops out.
  const now = new Date();
  const notifications = cmsItems === "fallback" ? passNotifications(now) : cmsNotifications(cmsItems || [], now);
  const unreadCount = notifications.filter(
    (notification) => !readIds.includes(notification.id),
  ).length;

  useEffect(() => {
    let cancelled = false;

    fetchPublicNotifications()
      .then((items) => {
        if (!cancelled) setCmsItems(items);
      })
      .catch(() => {
        if (!cancelled) setCmsItems("fallback");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const markAsRead = (id) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage might fail in private browsing mode; state is still updated
      }
      return next;
    });
  };

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds((prev) => {
      const next = Array.from(new Set([...prev, ...allIds]));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Fallback for storage errors
      }
      return next;
    });
  };

  const buttonLabel = unreadCount > 0
    ? `${siteCopy("ui.notification-bell-label")}, ${unreadCount} ${siteCopy("ui.notification-unread-suffix")}`
    : siteCopy("ui.notification-bell-label");

  return (
    <div className="notification-bell-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="notification-bell-btn"
        aria-label={buttonLabel}
        aria-expanded={isOpen}
        aria-controls="notification-panel"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Bell size={20} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="notification-bell-count" aria-hidden="true">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          id="notification-panel"
          className="notification-panel"
          aria-label={siteCopy("ui.notification-panel-title")}
        >
          <div className="notification-panel-header">
            <div>
              <span className="notification-panel-eyebrow">Storegården 7</span>
              <h2>{siteCopy("ui.notification-panel-title")}</h2>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-mark-all"
                onClick={markAllAsRead}
              >
                <Check size={15} aria-hidden="true" />
                {siteCopy("ui.notification-read-all")}
              </button>
            )}
          </div>

          {notifications.length > 0 ? (
            <ul className="notification-list">
              {notifications.map((notification) => {
                const isUnread = !readIds.includes(notification.id);

                return (
                  <li key={notification.id}>
                    <Link
                      to={canonicalPath(notification.href)}
                      className={`notification-item ${isUnread ? "is-unread" : ""}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <span className="notification-item-icon">
                        <CalendarDays size={19} aria-hidden="true" />
                      </span>
                      <span className="notification-item-copy">
                        <strong>{notification.title}</strong>
                        <span>{notification.detail}</span>
                      </span>
                      {isUnread && (
                        <span className="notification-unread-dot">
                          <span className="sr-only">{siteCopy("ui.notification-unread")}</span>
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="notification-empty">
              {siteCopy("ui.notification-empty")}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
