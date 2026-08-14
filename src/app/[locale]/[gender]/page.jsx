import CategoriesGrid from "@/components/home/CategoriesGrid";
import FeaturesStrip from "@/components/home/FeaturesStrip";
import HeroSection from "@/components/home/HeroSection";
import ScrollToTop from "@/components/scrollToTop/ScrollToTop";
import { apiGet } from "@/lib/api";
import { setRequestLocale } from "next-intl/server";

export const dynamic = 'force-dynamic';

export default async function GenderHome({ params }) {
  const { gender, locale } = await params;

  const categoriesData = await apiGet("/categories", {
    params: { gender },
    locale,
    next: { revalidate: 300 },
  });

  setRequestLocale(locale);

  return (
    <>
    <ScrollToTop/>
      <HeroSection gender={gender} />
      <CategoriesGrid data={categoriesData.result} />
      <FeaturesStrip />
    </>
  );
}
