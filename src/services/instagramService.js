import { apiRequest } from "./api";
import { getApiBaseUrl } from "../config/apiBaseUrl";

const API_URL = getApiBaseUrl();

export function fetchInstagramFeed() {
  return apiRequest(`${API_URL}/api/instagram`);
}
