import { getCmsUrl } from "./cmsService";

let notificationsRequest = null;

/** An active notice only shows inside its optional startsAt/endsAt window. */
export function isNotificationLive(doc, now = new Date()) {
  const time = new Date(now).getTime();
  if (doc.startsAt && new Date(doc.startsAt).getTime() > time) return false;
  if (doc.endsAt && new Date(doc.endsAt).getTime() <= time) return false;
  return true;
}

/**
 * Active notices with their display window, or a rejection when the CMS could not be read, so the
 * bell can tell "no notices" from "no answer". Callers filter with isNotificationLive when they
 * render: a tab left open keeps its notices, and a window opens or closes without a new request.
 */
export async function fetchPublicNotifications() {
  if (!notificationsRequest) {
    const cmsUrl = getCmsUrl();
    const query = new URLSearchParams({
      "where[active][equals]": "true",
      limit: "50",
      sort: "-priority",
    });

    notificationsRequest = fetch(`${cmsUrl}/api/notifications?${query}`, {
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data?.docs)) throw new Error("Notices answer without docs");
        return data.docs.map((doc) => ({
          id: doc.id,
          title: doc.title,
          message: doc.message,
          href: doc.href || "/",
          startsAt: doc.startsAt || null,
          endsAt: doc.endsAt || null,
          updatedAt: doc.updatedAt,
        }));
      })
      .catch((error) => {
        notificationsRequest = null;
        throw error;
      });
  }

  return notificationsRequest;
}

export function clearNotificationsCache() {
  notificationsRequest = null;
}
