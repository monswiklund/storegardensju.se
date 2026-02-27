import { apiRequest } from "./api";
import { getApiBaseUrl } from "../config/apiBaseUrl";

const API_URL = getApiBaseUrl();

export function fetchPublicEvents() {
  return apiRequest(`${API_URL}/api/events`);
}
