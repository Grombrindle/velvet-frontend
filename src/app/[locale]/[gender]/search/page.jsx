import SearchPage from "@/components/search/SearchPage";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";

// Search result pages are user-specific and shouldn't be indexed.
export const metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchRoute({ params }) {
  const currentGender = (await params).gender;
  const locale = await getLocale();
  return (
    <Suspense>
      <SearchPage currentGender={currentGender} />;
    </Suspense>
  );
}
