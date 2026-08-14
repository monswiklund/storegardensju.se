import { getCmsUrl } from "./cmsService";

let notificationsRequest = null;

export async function fetchPublicNotifications() {
  if (!notificationsRequest) {
    const cmsUrl = getCmsUrl();
    const query = new URLSearchParams({
      "where[active][equals]": "true",
      limit: "10",
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
        if (Array.isArray(data?.docs) && data.docs.length > 0) {
          return data.docs.map((doc) => ({
            id: doc.id,
            title: doc.title,
            message: doc.message,
            href: doc.href || "/",
            updatedAt: doc.updatedAt,
          }));
        }
        return [];
      })
      .catch(() => {
        notificationsRequest = null;
        return [];
      });
  }

  return notificationsRequest;
}

export function clearNotificationsCache() {
  notificationsRequest = null;
}
