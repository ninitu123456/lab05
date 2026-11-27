// Empty base URL = same-origin (/api/... goes through the Vite proxy in dev).
// Set VITE_API_BASE_URL only when the API lives on another origin in production.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export const apiUrl = (path) => `${API_BASE_URL}${path}`;