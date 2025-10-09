export async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
}
