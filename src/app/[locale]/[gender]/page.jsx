import CategoriesGrid from "@/components/home/CategoriesGrid";
import FeaturesStrip from "@/components/home/FeaturesStrip";
import HeroSection from "@/components/home/HeroSection";
import ScrollToTop from "@/components/scrollToTop/ScrollToTop";
import { apiGet } from "@/lib/api";
import { GENDER_LABELS, isValidGender } from "@/lib/genders";
import { languageAlternates } from "@/lib/seo";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { gender, locale } = await params;

  if (!isValidGender(gender)) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const labels = GENDER_LABELS[gender];
  const label = locale === "ar" ? labels.ar : labels.en;
  const description =
    locale === "ar"
      ? `تسوّقي ${label} من فيلفت — وصلات جديدة، قطع خالدة وأسعار مناسبة مع التوصيل داخل سوريا.`
      : `Shop ${label.toLowerCase()} at Velvet — new arrivals, timeless pieces and delivery across Syria.`;
  const path = `/${gender}`;

  return {
    title: label,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: languageAlternates(path),
    },
    openGraph: {
      title: `${label} | Velvet`,
      description,
      url: `/${locale}${path}`,
    },
  };
}

export default async function GenderHome({ params }) {
  const { gender, locale } = await params;

  // Unknown "genders" (e.g. /en/robots.txt, /en/random) used to render the
  // homepage with HTTP 200, creating soft-404s. 404 them instead.
  if (!isValidGender(gender)) notFound();

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
