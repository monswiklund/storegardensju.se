import { apiRequest } from "./api";

const API_URL = import.meta.env.VITE_API_URL || "";

export function fetchGalleryCategories() {
  return apiRequest(`${API_URL}/api/gallery`);
}
