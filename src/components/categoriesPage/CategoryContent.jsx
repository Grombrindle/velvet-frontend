"use client";
import React, { Suspense, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import ProductsGrid from "./ProductsGrid";
import FilterBar from "./FilterBar";
import { apiGet } from "@/lib/api";
import { useTranslations } from "next-intl";
import LottieAnimationPlayer from "@/loader/LottieAnimationPlayer";

export default function CategoryContent({ totalProducts, categoryId, gender }) {
  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: dataLoading,
  } = useInfiniteQuery({
    queryKey: ["category-products", categoryId, gender],
    queryFn: ({ pageParam = 1 }) =>
      apiGet(
        `/categories/${categoryId}/products?gender=${gender}&page=${pageParam}`,
      ),
    staleTime: 30 * 60 * 1000,

    getNextPageParam: (lastPage) => {
      const meta = lastPage?.result?.meta;
      return meta?.has_more ? meta.current_page + 1 : undefined;
    },
  });

  const t = useTranslations("categoriesPage");

  const items =
    productsData?.pages?.flatMap((page) => page?.result?.data || []) || [];

  const [selectedFilters, setSelectedFilters] = useState({});

  const params = useMemo(() => {
    const p = {
      include: "variants",
      page: 1,
      per_page: 24,
      "gender[]": [String(gender)],
      "categories[]": [String(categoryId)],
    };

    if (selectedFilters.colors?.length)
      p["colors[]"] = selectedFilters.colors.map(String);
    if (selectedFilters.sizes?.length)
      p["sizes[]"] = selectedFilters.sizes.map(String);
    if (selectedFilters.price_range?.min != null)
      p.price_range_min = Number(selectedFilters.price_range.min);
    if (selectedFilters.price_range?.max != null)
      p.price_range_max = Number(selectedFilters.price_range.max);

    return p;
  }, [categoryId, gender, selectedFilters]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["category-search", categoryId, gender, params],
    queryFn: () => apiGet("/filter/search", { params }),
    enabled: Object.keys(selectedFilters).length > 0,
    keepPreviousData: true,
  });

  const { data: countData } = useQuery({
    queryKey: ["category-count", categoryId, gender, params],
    queryFn: () => apiGet("/filter/count", { params }),
    enabled: Object.keys(selectedFilters).length > 0,
  });

  const results = data?.result || items || [];
  const resultCount = countData?.result?.count ?? totalProducts;

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LottieAnimationPlayer />
      </div>
    );
  }

  return (
    <motion.div className="flex gap-4" layout>
      <Suspense fallback={<div>Loading...</div>}>
        <FilterBar
          totalProducts={resultCount}
          gender={gender}
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
        />
      </Suspense>
      <motion.div className="flex-1" layout>
        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            <LottieAnimationPlayer />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            Failed to load filtered results.
          </div>
        ) : (
          <>
            <ProductsGrid clothingItems={results} />
            {hasNextPage && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className={`bg-black disabled:bg-black/50 disabled:cursor-not-allowed text-white px-16 py-3.5 cursor-pointer font-semibold uppercase`}
                >
                  {t("show_more")} {isFetchingNextPage && "..."}
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
