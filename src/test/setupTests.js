import "@testing-library/jest-dom/vitest";
import cmsMockData from "./cmsMockData.json";
import { fetchPageContent } from "../services/cmsService";

const createStorageMock = () => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i) => Object.keys(store)[i] || null,
  };
};

const storageMock = createStorageMock();

Object.defineProperty(window, "localStorage", {
  value: storageMock,
  writable: true,
});
Object.defineProperty(globalThis, "localStorage", {
  value: storageMock,
  writable: true,
});

if (typeof globalThis.fetch === "undefined" || !globalThis.fetch._isMock) {
  const originalFetch = globalThis.fetch;
  const mockFetch = async (input, init) => {
    const urlStr = typeof input === "string" ? input : input?.url || "";
    if (urlStr.includes("/api/pages")) {
      const match = urlStr.match(/where(?:%5B|\[)slug(?:%5D|\])(?:%5B|\[)equals(?:%5D|\])=([^&]+)/);
      const slug = match ? decodeURIComponent(match[1]) : null;
      if (slug && cmsMockData[slug]) {
        return {
          ok: true,
          status: 200,
          json: async () => cmsMockData[slug],
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ docs: [] }),
      };
    }
    if (originalFetch) {
      return originalFetch(input, init);
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ docs: [] }),
    };
  };
  mockFetch._isMock = true;
  globalThis.fetch = mockFetch;
}

// Preload mock pages into cache
for (const slug of Object.keys(cmsMockData)) {
  fetchPageContent(slug);
}
