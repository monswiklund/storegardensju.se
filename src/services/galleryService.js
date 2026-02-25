import { apiRequest } from "./api";
import { getApiBaseUrl } from "../config/apiBaseUrl";

const API_URL = getApiBaseUrl();

export function fetchGalleryCategories() {
  return apiRequest(`${API_URL}/api/gallery`);
}
