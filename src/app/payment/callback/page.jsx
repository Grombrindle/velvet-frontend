import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supportedLocales, defaultLocale } from "@/lib/locale";

export const dynamic = "force-dynamic";


export default async function RootCallbackPage({ searchParams }) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = supportedLocales.includes(localeCookie) ? localeCookie : defaultLocale;

  const params = await searchParams;
  const qs = new URLSearchParams(params).toString();
  redirect(`/${locale}/payment/callback${qs ? "?" + qs : ""}`);
}
