const LEGACY_API_HOSTS = new Set([
  "storegardensju-se-backend.onrender.com",
]);

export function getApiBaseUrl() {
  const raw = (import.meta.env.VITE_API_URL || "").trim();
  const forceLocalApi =
    String(import.meta.env.VITE_FORCE_LOCAL_API || "false").toLowerCase() ===
    "true";
  const devProxyEnabled =
    String(import.meta.env.VITE_DEV_USE_ACCESS_PROXY || "false").toLowerCase() !==
    "false";

  if (raw) {
    try {
      const parsed = new URL(raw);
      const isLoopbackHost =
        parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
      if (import.meta.env.PROD && isLoopbackHost) {
        // Never ship a localhost API target in production builds.
      } else {
      if (
        import.meta.env.DEV &&
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1") &&
        devProxyEnabled &&
        parsed.protocol.startsWith("http")
      ) {
        // In local dev, proxy through Vite to avoid CORS and share Access session.
        return "/__api";
      }
      if (LEGACY_API_HOSTS.has(parsed.host)) {
        return "https://api.storegardensju.se";
      }
      return raw.replace(/\/+$/, "");
      }
    } catch {
      // Fall back to runtime defaults below if VITE_API_URL is malformed.
    }
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (
      import.meta.env.DEV &&
      forceLocalApi &&
      (host === "localhost" || host === "127.0.0.1")
    ) {
      return "http://localhost:4242";
    }
    if (
      import.meta.env.DEV &&
      devProxyEnabled &&
      (host === "localhost" || host === "127.0.0.1")
    ) {
      return "/__api";
    }
    if (host === "storegardensju.se" || host === "www.storegardensju.se") {
      return "https://api.storegardensju.se";
    }
  }

  return "http://localhost:4242";
}
