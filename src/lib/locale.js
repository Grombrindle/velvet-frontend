export const supportedLocales = ["en", "ar"];
export const defaultLocale = "en";

const reservedRoutes = [
  "search",
  "login",
  "register",
  "dashboard",
  "cart",
  "product",
  "category",
];

export function getLocaleFromPathname(pathname) {
  const segments = pathname?.split("/").filter(Boolean) || [];
  const maybeLocale = segments[0];
  return supportedLocales.includes(maybeLocale) ? maybeLocale : defaultLocale;
}

export function getGenderFromPathname(pathname, searchParams) {
  const segments = pathname?.split("/").filter(Boolean) || [];
  const maybeLocale = segments[0];
  const isLocalePrefixed = supportedLocales.includes(maybeLocale);
  const genderSegment = isLocalePrefixed ? segments[1] : segments[0];

  const currentGender =
    searchParams?.get("gender") ||
    (genderSegment && !reservedRoutes.includes(genderSegment)
      ? genderSegment
      : null);

  return currentGender;
}

export function getLocalePrefix(pathname) {
  const locale = getLocaleFromPathname(pathname);
  return `/${locale}`;
}
