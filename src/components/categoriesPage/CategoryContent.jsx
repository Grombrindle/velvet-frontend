"use client";
import React, { Suspense, useMemo, useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import ProductsGrid from "./ProductsGrid";
import FilterBar from "./FilterBar";
import FilterToggleAndResults from "./FilterToggleAndResults";
import { apiGet } from "@/lib/api";
import { useTranslations } from "next-intl";
import LottieAnimationPlayer from "@/loader/LottieAnimationPlayer";
import Image from "next/image";
import ErrorState from "../ui/errorMessage";

export default function CategoryContent({
  genderOptions,
  totalProducts,
  categoryId,
  gender,
}) {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [sortBy, setSortBy] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const prevFilteringRef = useRef(false);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: dataLoading,
    refetch: refetchProducts,
    error: productsError,
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
    
    retry: 2,
  });

  const t = useTranslations("categoriesPage");

  const items =
    productsData?.pages?.flatMap((page) => page?.result?.data || []) || [];

  const hasActiveFilters = useMemo(() => {
    return Object.entries(selectedFilters).some(([key, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      if (value && typeof value === "object") {
        return value.min != null || value.max != null;
      }
      return Boolean(value);
    });
  }, [selectedFilters]);

  const shouldFilter = hasActiveFilters || Boolean(sortBy);

  useEffect(() => {
    setIsFiltering(shouldFilter);
  }, [shouldFilter]);

  const params = useMemo(() => {
    const p = {
      include: "variants",
      page: 1,
      per_page: 24,
      "gender[]": [String(gender)],
    };

    if (selectedFilters.categories?.length) {
      p["categories[]"] = selectedFilters.categories.map(String);
    } else {
      p["categories[]"] = [String(categoryId)];
    }

    if (selectedFilters.colors?.length) {
      p["colors[]"] = selectedFilters.colors.map(String);
    }

    if (selectedFilters.sizes?.length) {
      p["sizes[]"] = selectedFilters.sizes.map(String);
    }

    if (selectedFilters.price_range?.min != null) {
      p.price_range_min = Number(selectedFilters.price_range.min);
    }
    if (selectedFilters.price_range?.max != null) {
      p.price_range_max = Number(selectedFilters.price_range.max);
    }

    Object.keys(selectedFilters).forEach((key) => {
      if (!["categories", "colors", "sizes", "price_range"].includes(key)) {
        const val = selectedFilters[key];
        if (Array.isArray(val) && val.length > 0) {
          p[`${key}[]`] = val.map(String);
        } else if (val && !Array.isArray(val)) {
          p[key] = val;
        }
      }
    });

    if (sortBy) {
      p.sort_by = sortBy;
    }

    return p;
  }, [categoryId, gender, selectedFilters, sortBy]);

  const {
    data,
    isLoading,
    error: searchError,
    refetch: refetchSearch,
    isFetching,
    isError: isSearchError,
  } = useQuery({
    queryKey: ["category-search", categoryId, gender, params],
    queryFn: () => {
      console.log("Fetching filtered results with params:", params);
      return apiGet("/filter/search", { params });
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    retry: 2,
  });

  const {
    data: countData,
    error: countError,
    isError: isCountError,
  } = useQuery({
    queryKey: ["category-count", categoryId, gender, params],
    queryFn: () => {
      console.log("Fetching count with params:", params);
      return apiGet("/filter/count", { params });
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    retry: 2,
  });

  const results = useMemo(() => {
    if (isFiltering) {
      return data?.result || [];
    } else {
      return items;
    }
  }, [isFiltering, data?.result, items]);

  const resultCount = useMemo(() => {
    if (isFiltering) {
      return countData?.result?.count ?? 0;
    } else {
      return totalProducts;
    }
  }, [isFiltering, countData?.result?.count, totalProducts]);

  useEffect(() => {
    if (!isFiltering && prevFilteringRef.current) {
      refetchProducts();
    }
    prevFilteringRef.current = isFiltering;
  }, [isFiltering, refetchProducts]);

  // Check if results are empty
  const isEmptyResults = isFiltering && results.length === 0 && !isFetching;

  // Check for errors
  const hasError = productsError || searchError || countError;

  // Handle retry
  const handleRetry = () => {
    if (searchError) {
      refetchSearch();
    }
    if (productsError) {
      refetchProducts();
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LottieAnimationPlayer />
      </div>
    );
  }

  // Show error state for products
  if (productsError) {
    return (
      <ErrorState message={error.message}
      />
    );
  }

  return (
    <>
      <FilterToggleAndResults
        totalProducts={resultCount}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      {/* Remove layout prop on mobile to prevent layout shifts */}
      <motion.div
        className={`flex ${isMobile ? "relative" : "gap-4"}`}
        {...(!isMobile && { layout: true })}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <FilterBar
            totalProducts={resultCount}
            gender={gender}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
            genderOptions={genderOptions}
          />
        </Suspense>
        <motion.div
          className="flex-1 min-w-0"
          {...(!isMobile && { layout: true })}
        >
          {isFiltering && isFetching ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500">
              <LottieAnimationPlayer />
            </div>
          ) : isSearchError || isCountError ? (
            <ErrorState
              title={t("filter_error_title") || "Filter Error"}
              description={t("filter_error_description") || "Something went wrong while applying filters. Please try again."}
              onRetry={() => refetchSearch()}
              retryText={t("retry") || "Try Again"}
              secondaryAction={{
                label: t("clear_and_retry") || "Clear & Retry",
                onClick: () => {
                  setSelectedFilters({});
                  setSortBy("");
                  refetchSearch();
                }
              }}
            />
          ) : isEmptyResults ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="relative w-64 h-64 mb-6">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png"
                  alt="No results found"
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </div>
              <h3 className="md:text-xl text-md font-semibold text-gray-800 mb-2">
                {t("no_results_title") || "No products found"}
              </h3>
              <p className="text-gray-500 max-w-md">
                {t("no_results_description") || 
                  "We couldn't find any products matching your filters. Try adjusting your search criteria."}
              </p>
              <button
                onClick={() => {
                  setSelectedFilters({});
                  setSortBy("");
                }}
                className="mt-6 px-6 py-2.5 cursor-pointer bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                {t("clear_filters")}
              </button>
            </div>
          ) : (
            <>
              <ProductsGrid clothingItems={results} />
              {!isFiltering && hasNextPage && (
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
    </>
  );
}