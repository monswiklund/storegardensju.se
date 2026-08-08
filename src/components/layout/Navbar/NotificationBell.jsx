import { useEffect, useRef, useState } from "react";
import { Bell, CalendarDays, Check } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  allUpcomingPasses,
  formatPassDate,
  formatPassTime,
  INSTRUCTORS,
  passAnchor,
  passHubPath,
} from "../../../data/courseEvents.js";
import { canonicalPath } from "../../../config/routes.js";
import { fetchPublicNotifications } from "../../../services/notificationsService.js";
import "./NotificationBell.css";

const STORAGE_KEY = "storegarden-read-notifications";

function readStoredIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function instructorFor(pass) {
  return pass.primaryTrack === "yoga" ? INSTRUCTORS.lina : INSTRUCTORS.ann;
}

function buildNotifications() {
  return allUpcomingPasses().map((pass) => {
    const instructor = instructorFor(pass);

    return {
      id: pass.id,
      title: `${instructor.name.split(" ")[0]} håller ${pass.title.toLowerCase()}`,
      detail: `${formatPassDate(pass)} kl. ${formatPassTime(pass.startAt)}`,
      href: `${passHubPath(pass)}/#${passAnchor(pass)}`,
    };
  });
}

export default function NotificationBell() {
  const location = useLocation();
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState(readStoredIds);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(
    (notification) => !readIds.includes(notification.id),
  ).length;

  useEffect(() => {
    let cancelled = false;

    fetchPublicNotifications()
      .then((items) => {
        if (cancelled) return;
        setNotifications(items.map((item) => ({
          id: item.updatedAt ? `${item.id}:${item.updatedAt}` : item.id,
          title: item.title,
          detail: item.message,
          href: item.href || "/",
        })));
      })
      .catch(() => {
        if (!cancelled) setNotifications(buildNotifications());
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const storeReadIds = (nextIds) => {
    setReadIds(nextIds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
    } catch {
      // Keep the current session working when browser storage is unavailable.
    }
  };

  const markAsRead = (id) => {
    if (!readIds.includes(id)) storeReadIds([...readIds, id]);
  };

  const markAllAsRead = () => {
    storeReadIds(notifications.map((notification) => notification.id));
  };

  return (
    <div className="notification-bell" ref={wrapperRef}>
      <button
        type="button"
        className="notification-bell-trigger"
        aria-label={
          unreadCount > 0
            ? `Visa aktuellt, ${unreadCount} oläst`
            : "Visa aktuellt"
        }
        aria-expanded={isOpen}
        aria-controls="notification-panel"
        onClick={() => setIsOpen((open) => !open)}
      >
        <Bell size={23} strokeWidth={1.8} />
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
          aria-label="Aktuellt"
        >
          <div className="notification-panel-header">
            <div>
              <span className="notification-panel-eyebrow">Storegården 7</span>
              <h2>Aktuellt</h2>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-mark-all"
                onClick={markAllAsRead}
              >
                <Check size={15} aria-hidden="true" />
                Markera lästa
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
                          <span className="sr-only">Oläst</span>
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="notification-empty">
              Inget nytt just nu. Nästa aktivitet dyker upp här.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
