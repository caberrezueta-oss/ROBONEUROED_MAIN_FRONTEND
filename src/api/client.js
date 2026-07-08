// Cliente central para hablar con el backend de RoboNeuroED.
// Todas las páginas deben importar `apiFetch` de aquí en vez de
// usar fetch() directo, para no repetir la URL base ni el manejo del token.

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const TOKEN_KEY = "roboneuro_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Wrapper de fetch que:
 * - Antepone la URL base del backend
 * - Agrega el header Authorization automáticamente si hay token
 * - Parsea JSON y lanza un Error legible si la respuesta no es OK
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Sesión expirada o token inválido: limpiamos y forzamos vuelta al login
  if (response.status === 401) {
    clearToken();
    window.location.href = "/";
    throw new Error("Sesión expirada. Inicia sesión de nuevo.");
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.error || `Error ${response.status} al conectar con el servidor.`);
  }

  return data;
}
