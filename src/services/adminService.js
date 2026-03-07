import { getApiBaseUrl } from "../config/apiBaseUrl";

const API_URL = getApiBaseUrl();

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
  const headers = {
    "X-Request-Id": requestId,
  };
  if (includeJsonContentType) {
    headers["Content-Type"] = "application/json";
  }
  if (key && key !== "session") {
    headers.Authorization = `Bearer ${key}`;
  }
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  return headers;
};

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

const handleJSONResponse = async (res, defaultMessage) => {
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

const shouldFallbackToLegacyUpload = (status, code) => {
  if (status === 404 || status === 503) return true;
  return (
    code === "upload_store_unavailable" ||
    code === "not_found" ||
    code === "method_not_allowed"
  );
};

const buildErrorFromPayload = (status, payload, defaultMessage) => {
  const message = extractErrorMessage(payload, defaultMessage);
  const error = new Error(message);
  error.status = status;
  error.code = payload?.error?.code || payload?.code;
  error.details = payload?.error?.details;
  error.requestId = payload?.error?.requestId || payload?.requestId;
  error.retryable = Boolean(payload?.error?.retryable);
  return error;
};

const uploadImageWithFallback = async (
  key,
  file,
  scope,
  legacyPath,
  defaultMessage
) => {
  const genericHeaders = getHeaders(key, {
    idempotencyKey: createIdempotencyKey(),
  });
  const genericForm = new FormData();
  genericForm.append("file", file);
  genericForm.append("scope", scope);

  const genericRes = await fetch(`${API_URL}/admin/uploads/images`, {
    method: "POST",
    headers: genericHeaders,
    body: genericForm,
    credentials: "include",
  });
  if (genericRes.ok) {
    return handleJSONResponse(genericRes, defaultMessage);
  }

  const genericPayload = await parseJSONSafely(genericRes);
  const genericCode = genericPayload?.error?.code || genericPayload?.code;
  if (!shouldFallbackToLegacyUpload(genericRes.status, genericCode)) {
    throw buildErrorFromPayload(genericRes.status, genericPayload, defaultMessage);
  }

  const legacyForm = new FormData();
  legacyForm.append("file", file);
  const legacyRes = await fetch(`${API_URL}${legacyPath}`, {
    method: "POST",
    headers: getHeaders(key, { idempotencyKey: createIdempotencyKey() }),
    body: legacyForm,
    credentials: "include",
  });
  return handleJSONResponse(legacyRes, defaultMessage);
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
      body: JSON.stringify(data),
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
      body: JSON.stringify({ amount }),
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
      body: isFormData ? data : JSON.stringify(data),
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
      body: JSON.stringify(data),
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
      body: JSON.stringify(data),
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
    return uploadImageWithFallback(
      key,
      file,
      "gallery",
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
    return uploadImageWithFallback(
      key,
      file,
      "events",
      "/admin/events/uploads",
      "Failed to create event upload"
    );
  },
};
