// src/services/AdminService.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242";

const getHeaders = (key) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${key}`,
});

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
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  },

  getOrder: async (key, id) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}`, {
      headers: getHeaders(key),
    });
    if (!res.ok) throw new Error("Failed to fetch order");
    return res.json();
  },

  updateFulfillment: async (key, id, data) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}/fulfillment`, {
      method: "POST",
      headers: getHeaders(key),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update fulfillment");
    return res.json();
  },

  refundOrder: async (key, id, amount) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}/refund`, {
      method: "POST",
      headers: getHeaders(key),
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error("Refund failed");
    return res.json();
  },

  // Products
  getProducts: async (key) => {
    const res = await fetch(`${API_URL}/admin/products`, {
      headers: getHeaders(key),
    });
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },

  createProduct: async (key, data) => {
    const res = await fetch(`${API_URL}/admin/products`, {
      method: "POST",
      headers: getHeaders(key),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
  },

  updateProduct: async (key, id, data) => {
    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      method: "PUT",
      headers: getHeaders(key),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
  },

  archiveProduct: async (key, id) => {
    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      method: "DELETE",
      headers: getHeaders(key),
    });
    if (!res.ok) throw new Error("Failed to archive product");
    return res.json();
  },

  // Coupons
  getCoupons: async (key) => {
    const res = await fetch(`${API_URL}/admin/coupons`, {
      headers: getHeaders(key),
    });
    if (!res.ok) throw new Error("Failed to fetch coupons");
    return res.json();
  },

  createCoupon: async (key, data) => {
    const res = await fetch(`${API_URL}/admin/coupons`, {
      method: "POST",
      headers: getHeaders(key),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create coupon");
    return res.json();
  },

  archiveCoupon: async (key, id) => {
    const res = await fetch(`${API_URL}/admin/coupons/${id}`, {
      method: "DELETE",
      headers: getHeaders(key),
    });
    if (!res.ok) throw new Error("Failed to archive coupon");
    return res.json();
  },

  // Stats
  getStats: async (key, range) => {
    const res = await fetch(`${API_URL}/admin/stats?range=${range}`, {
      headers: getHeaders(key),
    });
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },
};
