import React from "react";
import CategoryContent from "@/components/categoriesPage/CategoryContent";
import { apiGet } from "@/lib/api";
import ScrollToTop from "@/components/scrollToTop/ScrollToTop";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id, gender, locale } = await params;

  let category = null;
  try {
    const categoryRes = await apiGet(`/categories/${id}?gender=${gender}`, {
      locale,
      next: { revalidate: 300 },
    });
    category = categoryRes?.result;
  } catch {
    // Metadata fetch failed — return fallback title
  }

  if (!category) return { title: "Category | Velvet" };

  return {
    title: `${category.name} | Velvet`,
    description:
      category.description ||
      `Shop the latest ${category.name} collection at Velvet.`,
    openGraph: {
      title: `${category.name} - Velvet Online Store`,
      description:
        category.description ||
        `Shop the latest ${category.name} collection at Velvet.`,
      images: [category.image || "/images/default-og.jpg"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: category.name,
      description:
        category.description ||
        `Shop the latest ${category.name} collection at Velvet.`,
    },
  };
}

// inside your page component
async function page({ params }) {
  const { id, gender, locale } = await params;

  let totalProducts = 0;
  let categoryName = null;
  let genderOptions = [];

  try {
    const [productsRes, categoryRes, genderRes] = await Promise.all([
      apiGet(`/categories/${id}/products?gender=${gender}`, {
        locale,
        next: { revalidate: 300 },
      }).catch(() => ({ result: { data: [], meta: { total: 0 } } })),
      apiGet(`/categories/${id}?gender=${gender}`, {
        locale,
        next: { revalidate: 300 },
      }).catch(() => ({ result: null })),
      apiGet(`/genders`, {
        params: { lang: locale || "en" },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }).catch(() => ({ result: [] })),
    ]);

    totalProducts = productsRes?.result?.meta?.total || 0;
    categoryName = categoryRes?.result;
    genderOptions = genderRes?.result || [];

    // Console log the genderOptions
    console.log("Gender Options from API:", genderOptions);
    console.log("Gender Options length:", genderOptions.length);

    // If you want to see the raw response
    console.log("Gender API Response:", genderRes);
  } catch (error) {
    console.error("Error fetching data:", error);
    // Server-side fetch failed — client will fetch its own data
  }

  if (!gender) return null;

  return (
    <>
      <ScrollToTop />
      <div className="px-1.5">
        <h1 className="text-center lg:mt-16 mt-[6rem] mb-4 text-2xl font-bold uppercase tracking-widest">
          {categoryName?.name}
        </h1>

        {/* Pass genderOptions to CategoryContent */}
        <CategoryContent
          categoryId={id}
          gender={gender}
          totalProducts={totalProducts}
          genderOptions={genderOptions}
        />
      </div>
    </>
  );
}

export default page;
