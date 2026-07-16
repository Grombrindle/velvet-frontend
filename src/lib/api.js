import { getToken } from "./auth";
import { defaultLocale, getLocaleFromPathname } from "./locale";

// const BASE_URL = "https://velvet.e-solutionsgroup.org/api";

const BASE_URL = "http://127.0.0.1:8000/api";

function appendLangQuery(endpoint, lang) {
  if (!lang) return endpoint;
  if (/[?&]lang=/.test(endpoint)) return endpoint;
  const separator = endpoint.includes("?") ? "&" : "?";
  return `${endpoint}${separator}lang=${encodeURIComponent(lang)}`;
}

/**
 * The Core Engine
 * Handles headers, tokens, and error normalization.
 */
async function apiFetch(
  endpoint,
  {
    method = "GET",
    data = null,
    locale: localeOption,
    lang: langOption,
    ...options
  } = {},
) {
  const token = getToken();
  // Debug: Log token status
  // console.log("Token present:", token);
  if (token) {
    // console.log("Token first 20 chars:", token.substring(0, 20) + "...");
  }

  const clientLocale =
    typeof window !== "undefined"
      ? getLocaleFromPathname(window.location.pathname)
      : defaultLocale;

  const locale = localeOption || langOption || clientLocale;
  const endpointWithLang = appendLangQuery(endpoint, locale);

  const config = {
    method,
    headers: {
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      "Accept-Language": locale,
      ...options.headers,
    },
    ...options,
  };

  if (data) {
    if (data instanceof FormData) {
      config.body = data;
    } else {
      config.body = JSON.stringify(data);
      config.headers["Content-Type"] = "application/json";
    }
  }

  try {
    const res = await fetch(`${BASE_URL}${endpointWithLang}`, config);

    // Handle "No Content"
    if (res.status === 204) return null;

    // Parse Response (JSON or Text)
    const contentType = res.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await res.json()
      : await res.text();

    if (!res.ok) {
      const error = new Error(body?.message || `API Error: ${res.status}`);
      error.status = res.status;
      error.response = body;
      throw error;
    }

    // console.log("API Response:", {
    //   endpoint,
    //   method,
    //   status: res.status,
    //   body,
    // });
    return body;
  } catch (err) {
    // Catch Network/Fetch failures (The "Failed to fetch" issue)
    if (!err.status) {
      err.message = "SERVER_UNREACHABLE";
      err.status = 0;
    }
    throw err;
  }
}

/**
 * Universal Helpers
 * These preserve your existing function signatures so your pages don't break.
 */

export const apiGet = (endpoint, { params = {}, ...options } = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null) searchParams.append(key, String(item));
      });
      return;
    }
    searchParams.append(key, String(value));
  });

  const search = searchParams.toString();
  const fullPath = search
    ? `${endpoint}${endpoint.includes("?") ? "&" : "?"}${search}`
    : endpoint;

  return apiFetch(fullPath, { method: "GET", ...options });
};

export const apiPost = (endpoint, data, options = {}) =>
  apiFetch(endpoint, { method: "POST", data, ...options });

export const apiPut = (endpoint, data, options = {}) =>
  apiFetch(endpoint, { method: "PUT", data, ...options });

export const apiDelete = (endpoint, options = {}) =>
  apiFetch(endpoint, { method: "DELETE", ...options });
export const apiPatch = (endpoint, data) =>
  apiFetch(endpoint, { method: "PATCH", data });
