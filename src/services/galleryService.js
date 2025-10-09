import { apiRequest } from "./api";

export function fetchGalleryCategories() {
  return apiRequest("/api/gallery");
}
