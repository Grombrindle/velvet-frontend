import { SITE_URL } from "@/lib/seo";

// Served at /robots.txt (Next.js metadata route).
// The i18n middleware must NOT rewrite /robots.txt — see middleware.ts.
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/*/dashboard",
          "/*/dashboard/",
          "/*/login",
          "/*/register",
          "/*/cart",
          "/*/checkout",
          "/*/payment",
          "/*/search",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
