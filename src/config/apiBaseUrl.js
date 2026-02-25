const LEGACY_API_HOSTS = new Set([
  "storegardensju-se-backend.onrender.com",
]);

export function getApiBaseUrl() {
  const raw = (import.meta.env.VITE_API_URL || "").trim();

  if (raw) {
    try {
      const parsed = new URL(raw);
      if (LEGACY_API_HOSTS.has(parsed.host)) {
        return "https://api.storegardensju.se";
      }
      return raw.replace(/\/+$/, "");
    } catch {
      // Fall back to runtime defaults below if VITE_API_URL is malformed.
    }
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "storegardensju.se" || host === "www.storegardensju.se") {
      return "https://api.storegardensju.se";
    }
  }

  return "http://localhost:4242";
}

