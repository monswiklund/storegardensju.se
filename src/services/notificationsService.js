import { apiRequest } from "./api";
import { getApiBaseUrl } from "../config/apiBaseUrl";

const API_URL = getApiBaseUrl();

export async function fetchPublicNotifications() {
  const data = await apiRequest(`${API_URL}/api/notifications`);
  return Array.isArray(data?.notifications) ? data.notifications : [];
}
