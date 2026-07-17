import { redirect } from "next/navigation";
import { apiGet } from "@/lib/api";
import { supportedLocales, defaultLocale } from "@/lib/locale";
import { getLocale, setRequestLocale } from "next-intl/server";

export const dynamic = 'force-dynamic';

export default async function LocaleHome({ params }) {
  const loc = (await params).locale;
  const locale = supportedLocales.includes(loc) ? loc : defaultLocale;

  const gendersData = await apiGet("/genders", {
    locale,
    next: { revalidate: 300 },
  });


  setRequestLocale(locale);

  const firstGender = gendersData?.result?.[0]?.name || "male";
  redirect(`/${locale}/${encodeURIComponent(firstGender)}`);
}
