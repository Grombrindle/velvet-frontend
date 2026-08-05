import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

export default createMiddleware({
  ...routing,
  localeDetection: false,
});

export const config = {
  // Runs the locale middleware on every path EXCEPT API routes and static
  // assets, so unprefixed URLs (/login, /cart, /woman, the root /) are
  // redirected to their locale version instead of 404ing.
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|css|js|woff2?|ico)$).*)",
  ],
};
