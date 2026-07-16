// import { defineRouting } from "next-intl/routing";

// export const routing = defineRouting({
//   locales: ["en", "ar"],
//   defaultLocale: "en",
// });

import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "ar"],

  // Used when no locale matches
  defaultLocale: "en",

  // localeDetection: true
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {
  Link: LocalLink,
  redirect,
  usePathname,
  useRouter,
  getPathname,
} = createNavigation(routing);