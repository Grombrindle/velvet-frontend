import React from "react";

import CategoryContent from "@/components/categoriesPage/CategoryContent";
import { apiGet } from "@/lib/api";
import FilterToggleAndResults from "@/components/categoriesPage/FilterToggleAndResults";

export const dynamic = 'force-dynamic';

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

  let totalProducts = 0;
  let categoryName = null;

  try {
    const [productsRes, categoryRes] = await Promise.all([
      apiGet(`/categories/${id}/products?gender=${gender}`, {
        locale,
        next: { revalidate: 300 },
      }).catch(() => ({ result: { data: [], meta: { total: 0 } } })),
      apiGet(`/categories/${id}?gender=${gender}`, {
        locale,
        next: { revalidate: 300 },
      }).catch(() => ({ result: null })),
    ]);

    totalProducts = productsRes?.result?.meta?.total || 0;
    categoryName = categoryRes?.result;
  } catch {
    // Server-side fetch failed — client will fetch its own data
  }

  if (!gender) return null;

  return (
    <div className="px-1.5">
      <h1 className="text-center mt-16 mb-4 text-2xl font-bold uppercase tracking-widest">
        {categoryName?.name}
      </h1>

      <FilterToggleAndResults totalProducts={totalProducts} />
      <CategoryContent
        // items={products}
        categoryId={id}
        gender={gender}
        // totalProducts={totalProducts}
      />
    </div>
  );
}
export default page;
