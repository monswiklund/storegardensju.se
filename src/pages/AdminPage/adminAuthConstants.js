export const SESSION_AUTH_KEY = "session";

export const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1"]);

export const isLoopbackHost = (host) =>
  typeof host === "string" && LOOPBACK_HOSTS.has(host);

export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
