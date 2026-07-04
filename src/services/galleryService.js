import { apiRequest } from "./api";
import { getApiBaseUrl } from "../config/apiBaseUrl";

const API_URL = getApiBaseUrl();
let galleryCategoriesCache = null;
let galleryCategoriesRequest = null;

export function fetchGalleryCategories() {
  if (galleryCategoriesCache) {
    return Promise.resolve(galleryCategoriesCache);
  }

  if (!galleryCategoriesRequest) {
    galleryCategoriesRequest = apiRequest(`${API_URL}/api/gallery`)
      .then((data) => {
        galleryCategoriesCache = data;
        return data;
      })
      .finally(() => {
        galleryCategoriesRequest = null;
      });
  }

  return galleryCategoriesRequest;
}
