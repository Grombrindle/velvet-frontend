import React from "react";
import CategoryContent from "@/components/categoriesPage/CategoryContent";
import { apiGet } from "@/lib/api";
import ScrollToTop from "@/components/scrollToTop/ScrollToTop";
import { getTranslations } from 'next-intl/server'; // ✅ ADD THIS

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

async function page({ params }) {
  const { id, gender, locale } = await params;
  
  const t = await getTranslations({ locale, namespace: 'emptyProduct' }); // ✅ ADD THIS

  let totalProducts = 0;
  let categoryName = null;
  let genderOptions = [];
  let products = [];

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
        next: { revalidate: 3600 },
      }).catch(() => ({ result: [] })),
    ]);

    products = productsRes?.result?.data || [];
    totalProducts = productsRes?.result?.meta?.total || 0;
    categoryName = categoryRes?.result;
    genderOptions = genderRes?.result || [];

    console.log("Gender Options from API:", genderOptions);
    console.log("Gender Options length:", genderOptions.length);
    console.log("Gender API Response:", genderRes);
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  if (!gender) return null;

  const hasProducts = products.length > 0;

  return (
    <>
      <ScrollToTop />
      <div className="px-1.5">
        <h1 className="text-center lg:mt-16 mt-[6rem] mb-4 text-2xl font-bold uppercase tracking-widest">
          {categoryName?.name}
        </h1>

        {hasProducts ? (
          <CategoryContent
            categoryId={id}
            gender={gender}
            totalProducts={totalProducts}
            genderOptions={genderOptions}
          />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              {t('no_product')} {/* ✅ CHANGED THIS */}
            </h2>
            <p className="text-gray-500 max-w-md">
              {t('product_not_found')} {/* ✅ CHANGED THIS */}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default page;