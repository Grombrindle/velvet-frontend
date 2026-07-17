import { redirect } from "next/navigation";
import { apiGet } from "@/lib/api";
import { defaultLocale } from "@/lib/locale";

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }) {
  const genderQuery = (await searchParams)?.gender;

  // if (genderQuery) {
  //   redirect(`/${defaultLocale}/${genderQuery}`);
  // }
  if (genderQuery) {
    redirect(`/${defaultLocale}/${encodeURIComponent(genderQuery)}`);
  }

  const gendersData = await apiGet(`/web/genders`, {
    next: { revalidate: 24 * 60 * 60 }, // 24 hours
  });
  const firstGender = gendersData?.result?.[0]?.name.en || "Female";
  // redirect(`/${defaultLocale}/${firstGender}`);
  redirect(`/${defaultLocale}/${encodeURIComponent(firstGender)}`);
}
