import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

export default createMiddleware({
  ...routing,
  localeDetection: false,
});

export const config = {
  // هذا الماتشر يستهدف:
  // 1. المسار الرئيسي /
  // 2. المسارات التي تبدأ باللغات /ar أو /en
  // 3. يستثني بوضوح ملفات الصور والـ API والـ Static
  	matcher: ["/", "/(ar|en)/:path*"]
  // matcher: [
  //   // السماح للمسار الرئيسي
  //   "/",
  //   // السماح لمسارات اللغات
  //   "/(ar|en)/:path*",
  //   // استثناء الملفات الثابتة والـ API بناءً على الامتدادات
  //   "/((?!api|_next/static|_next/image|assets|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|css|js|woff2?|ico)$).*)",
  // ],
};
