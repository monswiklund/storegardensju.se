// src/services/adminService.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242";

const getHeaders = (key) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${key}`,
});

const handleResponse = async (res, defaultMessage) => {
  if (!res.ok) {
    let message = defaultMessage;
    try {
      const errorData = await res.json();
      message = errorData.error || defaultMessage;
    } catch {
      // Not JSON
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return res;
};

export const AdminService = {
  // Orders
  getOrders: async (key, params) => {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(
      `${API_URL}/admin/orders?${searchParams.toString()}`,
      {
        headers: getHeaders(key),
      }
    );
    await handleResponse(res, "Failed to fetch orders");
    return res.json();
  },

  getOrder: async (key, id) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}`, {
      headers: getHeaders(key),
    });
    await handleResponse(res, "Failed to fetch order");
    return res.json();
  },

  updateFulfillment: async (key, id, data) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}/fulfillment`, {
      method: "POST",
      headers: getHeaders(key),
      body: JSON.stringify(data),
    });
    await handleResponse(res, "Failed to update fulfillment");
    return res.json();
  },

  refundOrder: async (key, id, amount) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}/refund`, {
      method: "POST",
      headers: getHeaders(key),
      body: JSON.stringify({ amount }),
    });
    await handleResponse(res, "Refund failed");
    return res.json();
  },

  // Products
  getProducts: async (key, params = {}) => {
    const searchParams = new URLSearchParams(params);
    const query = searchParams.toString();
    const res = await fetch(
      `${API_URL}/admin/products${query ? `?${query}` : ""}`,
      {
      headers: getHeaders(key),
      }
    );
    await handleResponse(res, "Failed to fetch products");
    return res.json();
  },

  createProduct: async (key, data) => {
    const isFormData = data instanceof FormData;
    const headers = getHeaders(key);
    if (isFormData) {
      delete headers["Content-Type"];
    }

    const res = await fetch(`${API_URL}/admin/products`, {
      method: "POST",
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    await handleResponse(res, "Failed to create product");
    return res.json();
  },

  updateProduct: async (key, id, data) => {
    const isFormData = data instanceof FormData;
    const headers = getHeaders(key);
    if (isFormData) {
      delete headers["Content-Type"];
    }

    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      method: "PUT",
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    await handleResponse(res, "Failed to update product");
    return res.json();
  },

  archiveProduct: async (key, id) => {
    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      method: "DELETE",
      headers: getHeaders(key),
    });
    await handleResponse(res, "Failed to archive product");
    return res.json();
  },

  // Coupons
  getCoupons: async (key) => {
    const res = await fetch(`${API_URL}/admin/coupons`, {
      headers: getHeaders(key),
    });
    await handleResponse(res, "Failed to fetch coupons");
    return res.json();
  },

  createCoupon: async (key, data) => {
    const res = await fetch(`${API_URL}/admin/coupons`, {
      method: "POST",
      headers: getHeaders(key),
      body: JSON.stringify(data),
    });
    await handleResponse(res, "Failed to create coupon");
    return res.json();
  },

  archiveCoupon: async (key, id) => {
    const res = await fetch(`${API_URL}/admin/coupons/${id}`, {
      method: "DELETE",
      headers: getHeaders(key),
    });
    await handleResponse(res, "Failed to archive coupon");
    return res.json();
  },

  // Stats
  getStats: async (key, range) => {
    const res = await fetch(`${API_URL}/admin/stats?range=${range}`, {
      headers: getHeaders(key),
    });
    await handleResponse(res, "Failed to fetch stats");
    return res.json();
  },

  exportOrders: async (key, params) => {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(
      `${API_URL}/admin/orders/export?${searchParams.toString()}`,
      {
        headers: getHeaders(key),
      }
    );
    await handleResponse(res, "Failed to export orders");
    return res.blob();
  },

  // Gallery
  getGallery: async (key) => {
    const res = await fetch(`${API_URL}/admin/gallery`, {
      headers: getHeaders(key),
    });
    await handleResponse(res, "Failed to fetch gallery");
    return res.json();
  },

  createGalleryCategory: async (key, data) => {
    const res = await fetch(`${API_URL}/admin/gallery/categories`, {
      method: "POST",
      headers: getHeaders(key),
      body: JSON.stringify(data),
    });
    await handleResponse(res, "Failed to create category");
    return res.json();
  },

  updateGalleryCategory: async (key, id, data) => {
    const res = await fetch(`${API_URL}/admin/gallery/categories/${id}`, {
      method: "PUT",
      headers: getHeaders(key),
      body: JSON.stringify(data),
    });
    await handleResponse(res, "Failed to update category");
    return res.json();
  },

  deleteGalleryCategory: async (key, id) => {
    const res = await fetch(`${API_URL}/admin/gallery/categories/${id}`, {
      method: "DELETE",
      headers: getHeaders(key),
    });
    await handleResponse(res, "Failed to delete category");
    return res.json();
  },

  createGalleryUpload: async (key, data) => {
    const res = await fetch(`${API_URL}/admin/gallery/uploads`, {
      method: "POST",
      headers: getHeaders(key),
      body: JSON.stringify(data),
    });
    await handleResponse(res, "Failed to create upload");
    return res.json();
  },

  createGalleryImage: async (key, data) => {
    const res = await fetch(`${API_URL}/admin/gallery/images`, {
      method: "POST",
      headers: getHeaders(key),
      body: JSON.stringify(data),
    });
    await handleResponse(res, "Failed to create image");
    return res.json();
  },

  updateGalleryImage: async (key, id, data) => {
    const res = await fetch(`${API_URL}/admin/gallery/images/${id}`, {
      method: "PUT",
      headers: getHeaders(key),
      body: JSON.stringify(data),
    });
    await handleResponse(res, "Failed to update image");
    return res.json();
  },

  deleteGalleryImage: async (key, id) => {
    const res = await fetch(`${API_URL}/admin/gallery/images/${id}`, {
      method: "DELETE",
      headers: getHeaders(key),
    });
    await handleResponse(res, "Failed to delete image");
    return res.json();
  },
};
