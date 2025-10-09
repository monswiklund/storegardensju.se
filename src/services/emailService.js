import { apiRequest } from "./api";

export function sendContactEmail(payload) {
  return apiRequest("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
