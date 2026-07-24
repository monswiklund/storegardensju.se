import { getApiBaseUrl } from "../config/apiBaseUrl";
import { SESSION_AUTH_KEY } from "../pages/AdminPage/adminAuthConstants";

// VERIFY: backend must set session cookies with SameSite=Lax (or stricter) and
// Secure flag. Bearer-token mode is unaffected by CSRF; cookie-mode relies on
// SameSite to mitigate cross-site requests when credentials: "include" is used.
const API_URL = getApiBaseUrl();
const isSessionAuth = (key) => key === SESSION_AUTH_KEY;
const shouldAvoidPreflight = (key) =>
  isSessionAuth(key) &&
  typeof API_URL === "string" &&
  API_URL.startsWith("https://");

const toQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });
  return searchParams.toString();
};

const createRequestId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `req_${crypto.randomUUID()}`;
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const createIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `adm_${crypto.randomUUID()}`;
  }
  return `adm_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
};

const getHeaders = (
  key,
  {
    includeJsonContentType = false,
    idempotencyKey = "",
    requestId = createRequestId(),
  } = {}
) => {
  if (shouldAvoidPreflight(key)) {
    const headers = {};
    if (includeJsonContentType) {
      headers["Content-Type"] = "application/json";
    }
    if (key && key !== SESSION_AUTH_KEY) {
      headers.Authorization = `Bearer ${key}`;
    }
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return headers;
  }
  const headers = {
    "X-Request-Id": requestId,
  };
  if (includeJsonContentType) {
    headers["Content-Type"] = "application/json";
  }
  if (key && key !== SESSION_AUTH_KEY) {
    headers.Authorization = `Bearer ${key}`;
  }
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  return headers;
};

const jsonRequestBody = (key, data) => JSON.stringify(data);

const parseJSONSafely = async (res) => {
  try {
    const raw = await res.text();
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const extractErrorMessage = (payload, defaultMessage) => {
  if (!payload) return defaultMessage;
  if (typeof payload.error === "string") return payload.error;
  if (typeof payload.message === "string") return payload.message;
  if (payload.error && typeof payload.error.message === "string") {
    return payload.error.message;
  }
  return defaultMessage;
};

const unwrapSuccessData = (payload) => {
  if (payload && typeof payload === "object" && payload.ok === true) {
    return payload.data;
  }
  return payload;
};

const logAdminCall = (res) => {
  if (!import.meta.env.DEV) return;
  const path = (res?.url || "").replace(API_URL, "");
  console.info(`[admin] ${res?.status ?? "?"} ${path}`);
};

const handleJSONResponse = async (res, defaultMessage) => {
  logAdminCall(res);
  const payload = await parseJSONSafely(res);

  if (!res.ok) {
    const message = extractErrorMessage(payload, defaultMessage);
    const error = new Error(message);
    error.status = res.status;
    error.code = payload?.error?.code || payload?.code;
    error.details = payload?.error?.details;
    error.requestId = payload?.error?.requestId || payload?.requestId;
    error.retryable = Boolean(payload?.error?.retryable);

    const retryAfter = Number(res.headers.get("Retry-After"));
    if (Number.isFinite(retryAfter) && retryAfter > 0) {
      error.retryAfter = retryAfter;
    }

    throw error;
  }

  return unwrapSuccessData(payload);
};

const handleBlobResponse = async (res, defaultMessage) => {
  logAdminCall(res);
  if (!res.ok) {
    const payload = await parseJSONSafely(res);
    const message = extractErrorMessage(payload, defaultMessage);
    const error = new Error(message);
    error.status = res.status;
    error.code = payload?.error?.code || payload?.code;
    error.details = payload?.error?.details;
    error.requestId = payload?.error?.requestId || payload?.requestId;
    error.retryable = Boolean(payload?.error?.retryable);

    const retryAfter = Number(res.headers.get("Retry-After"));
    if (Number.isFinite(retryAfter) && retryAfter > 0) {
      error.retryAfter = retryAfter;
    }

    throw error;
  }
  return res.blob();
};

const uploadScopedImage = async (key, file, path, defaultMessage) => {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: getHeaders(key, { idempotencyKey: createIdempotencyKey() }),
    body: form,
    credentials: "include",
  });
  return handleJSONResponse(res, defaultMessage);
};

export const AdminService = {
  getOrders: async (key, params = {}) => {
    const normalizedParams = { ...params };
    if (
      normalizedParams.startingAfter &&
      !normalizedParams.starting_after
    ) {
      normalizedParams.starting_after = normalizedParams.startingAfter;
    }
    delete normalizedParams.startingAfter;

    const query = toQueryString(normalizedParams);
    const res = await fetch(`${API_URL}/admin/orders${query ? `?${query}` : ""}`, {
      headers: getHeaders(key),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to fetch orders");
  },

  getOrder: async (key, id) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}`, {
      headers: getHeaders(key),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to fetch order");
  },

  updateFulfillment: async (key, id, data) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}/fulfillment`, {
      method: "POST",
      headers: getHeaders(key, {
        includeJsonContentType: true,
        idempotencyKey: createIdempotencyKey(),
      }),
      body: jsonRequestBody(key, data),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to update fulfillment");
  },

  refundOrder: async (key, id, amount) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}/refund`, {
      method: "POST",
      headers: getHeaders(key, {
        includeJsonContentType: true,
        idempotencyKey: createIdempotencyKey(),
      }),
      body: jsonRequestBody(key, { amount }),
      credentials: "include",
    });
    return handleJSONResponse(res, "Refund failed");
  },

  getProducts: async (key, params = {}) => {
    const query = toQueryString(params);
    const res = await fetch(`${API_URL}/admin/products${query ? `?${query}` : ""}`, {
      headers: getHeaders(key),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to fetch products");
  },

  createProduct: async (key, data) => {
    const isFormData = data instanceof FormData;
    const headers = getHeaders(key, {
      includeJsonContentType: !isFormData,
      idempotencyKey: createIdempotencyKey(),
    });

    if (isFormData) {
      delete headers["Content-Type"];
    }

    const res = await fetch(`${API_URL}/admin/products`, {
      method: "POST",
      headers,
      body: isFormData ? data : jsonRequestBody(key, data),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to create product");
  },

  updateProduct: async (key, id, data) => {
    const isFormData = data instanceof FormData;
    const headers = getHeaders(key, {
      includeJsonContentType: !isFormData,
      idempotencyKey: createIdempotencyKey(),
    });

    if (isFormData) {
      delete headers["Content-Type"];
    }

    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      method: "PUT",
      headers,
      body: isFormData ? data : JSON.stringify(data),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to update product");
  },

  archiveProduct: async (key, id) => {
    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      method: "DELETE",
      headers: getHeaders(key),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to archive product");
  },

  getCoupons: async (key, params = {}) => {
    const query = toQueryString(params);
    const res = await fetch(`${API_URL}/admin/coupons${query ? `?${query}` : ""}`, {
      headers: getHeaders(key),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to fetch coupons");
  },

  createCoupon: async (key, data) => {
    const res = await fetch(`${API_URL}/admin/coupons`, {
      method: "POST",
      headers: getHeaders(key, {
        includeJsonContentType: true,
        idempotencyKey: createIdempotencyKey(),
      }),
      body: jsonRequestBody(key, data),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to create coupon");
  },

  archiveCoupon: async (key, id) => {
    const res = await fetch(`${API_URL}/admin/coupons/${id}`, {
      method: "DELETE",
      headers: getHeaders(key),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to archive coupon");
  },

  getStats: async (key, range) => {
    const res = await fetch(`${API_URL}/admin/stats?range=${range}`, {
      headers: getHeaders(key),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to fetch stats");
  },

  exportOrders: async (key, params) => {
    const query = toQueryString(params);
    const res = await fetch(`${API_URL}/admin/orders/export${query ? `?${query}` : ""}`, {
      headers: getHeaders(key),
      credentials: "include",
    });
    return handleBlobResponse(res, "Failed to export orders");
  },

  getGallery: async (key) => {
    const res = await fetch(`${API_URL}/admin/gallery`, {
      headers: getHeaders(key),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to fetch gallery");
  },

  createGalleryCategory: async (key, data) => {
    const res = await fetch(`${API_URL}/admin/gallery/categories`, {
      method: "POST",
      headers: getHeaders(key, {
        includeJsonContentType: true,
        idempotencyKey: createIdempotencyKey(),
      }),
      body: jsonRequestBody(key, data),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to create category");
  },

  updateGalleryCategory: async (key, id, data) => {
    const res = await fetch(`${API_URL}/admin/gallery/categories/${id}`, {
      method: "PUT",
      headers: getHeaders(key, {
        includeJsonContentType: true,
        idempotencyKey: createIdempotencyKey(),
      }),
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to update category");
  },

  deleteGalleryCategory: async (key, id) => {
    const res = await fetch(`${API_URL}/admin/gallery/categories/${id}`, {
      method: "DELETE",
      headers: getHeaders(key),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to delete category");
  },

  createGalleryUpload: async (key, file) => {
    return uploadScopedImage(
      key,
      file,
      "/admin/gallery/uploads",
      "Failed to create upload"
    );
  },

  createGalleryImage: async (key, data) => {
    const res = await fetch(`${API_URL}/admin/gallery/images`, {
      method: "POST",
      headers: getHeaders(key, {
        includeJsonContentType: true,
        idempotencyKey: createIdempotencyKey(),
      }),
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to create image");
  },

  updateGalleryImage: async (key, id, data) => {
    const res = await fetch(`${API_URL}/admin/gallery/images/${id}`, {
      method: "PUT",
      headers: getHeaders(key, {
        includeJsonContentType: true,
        idempotencyKey: createIdempotencyKey(),
      }),
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to update image");
  },

  deleteGalleryImage: async (key, id) => {
    const res = await fetch(`${API_URL}/admin/gallery/images/${id}`, {
      method: "DELETE",
      headers: getHeaders(key),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to delete image");
  },

  getEvents: async (key) => {
    const res = await fetch(`${API_URL}/admin/events`, {
      headers: getHeaders(key),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to fetch events");
  },

  createEvent: async (key, data) => {
    const res = await fetch(`${API_URL}/admin/events`, {
      method: "POST",
      headers: getHeaders(key, {
        includeJsonContentType: true,
        idempotencyKey: createIdempotencyKey(),
      }),
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to create event");
  },

  updateEvent: async (key, id, data) => {
    const res = await fetch(`${API_URL}/admin/events/${id}`, {
      method: "PUT",
      headers: getHeaders(key, {
        includeJsonContentType: true,
        idempotencyKey: createIdempotencyKey(),
      }),
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to update event");
  },

  deleteEvent: async (key, id) => {
    const res = await fetch(`${API_URL}/admin/events/${id}`, {
      method: "DELETE",
      headers: getHeaders(key),
      credentials: "include",
    });
    return handleJSONResponse(res, "Failed to delete event");
  },

  createEventUpload: async (key, file) => {
    return uploadScopedImage(
      key,
      file,
      "/admin/events/uploads",
      "Failed to create event upload"
    );
  },
};
