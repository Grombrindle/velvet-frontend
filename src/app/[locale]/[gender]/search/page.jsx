import SearchPage from "@/components/search/SearchPage";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";

export default async function SearchRoute({ params }) {
  const currentGender = (await params).gender;
  const locale = await getLocale();
  console.log("LOCALE FROM SERVER IS ::", locale);
  return (
    <Suspense>
      <SearchPage currentGender={currentGender} />;
    </Suspense>
  );
}
