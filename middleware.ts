import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./src/i18n/routing";

const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: false,
});

export default function middleware(request: NextRequest) {
  // Root / -> default landing page (single hop, no intermediate /en request).
  const { pathname } = request.nextUrl;
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/en/woman", request.url));
  }
  return intlMiddleware(request);
}

export const config = {
  // Runs the locale middleware on every path EXCEPT API routes and static
  // assets, so unprefixed URLs (/login, /cart, /woman, the root /) are
  // redirected to their locale version instead of 404ing.
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|css|js|woff2?|ico)$).*)",
  ],
};