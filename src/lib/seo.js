// Shared SEO helpers. SITE_URL falls back to production so metadata is always
// absolute even when the env var is missing (e.g. a fresh server build).

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://velvet-leaf.com"
).replace(/\/+$/, "");

export const LOCALES = ["en", "ar"];

export const DEFAULT_OG_IMAGE = "/images/default-og.jpg";

/**
 * hreflang alternates for a path that does NOT include the locale prefix.
 * e.g. languageAlternates("/woman") -> { en: "/en/woman", ar: "/ar/woman" }
 * Relative URLs are resolved by Next.js against `metadataBase`.
 */
export function languageAlternates(path = "") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return {
    en: `/en${clean}`,
    ar: `/ar${clean}`,
    "x-default": `/en${clean}`,
  };
}

export function stripHtml(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(value = "", max = 160) {
  const text = stripHtml(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
