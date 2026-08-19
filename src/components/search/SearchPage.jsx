"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import SearchFilterSidebar from "./SearchFilterSidebar";
import ErrorState from "../ui/errorMessage";
import LottieAnimationPlayer from "@/loader/LottieAnimationPlayer";
import MobileFilterSidebar from "./MobileSearchView";

export default function SearchPage({ currentGender }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedSpecs, setSelectedSpecs] = useState([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [inStock, setInStock] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [perPage, setPerPage] = useState("");
  const [page, setPage] = useState(1);
  const [submittedFilters, setSubmittedFilters] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const loc = useLocale();
  const t = useTranslations("searchPage");

  const {
    data: filterOptionsData,
    isLoading: isLoadingOptions,
    error: optionsError,
  } = useQuery({
    queryKey: ["filter-options"],
    queryFn: () => apiGet("/filter/options"),
    staleTime: 1000 * 60 * 10,
  });

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories", currentGender],
    queryFn: () => apiGet("/categories", { params: { gender: currentGender } }),
    enabled: Boolean(currentGender),
    staleTime: 1000 * 60 * 10,
  });

  const filterOptions = filterOptionsData?.result || [];
  const categories = categoriesData?.result || [];

  const colorFilter = filterOptions.find((item) => item.id === "colors");
  const sizeFilter = filterOptions.find((item) => item.id === "sizes");
  const priceFilter = filterOptions.find((item) => item.id === "price_range");
  const specFilters = filterOptions.filter((item) =>
    item.id.startsWith("spec_"),
  );

  // Auto-submit initial search with ONLY gender
  useEffect(() => {
    if (currentGender && isInitialLoad) {
      setSubmittedFilters({
        searchQuery: "",
        selectedCategories: [],
        selectedColors: [],
        selectedSizes: [],
        selectedSpecs: [],
        priceMin: "",
        priceMax: "",
        inStock: false,
        isInitialLoad: true,
      });
      setIsInitialLoad(false);
    }
  }, [currentGender]);

  // Auto-submit for FILTERS ONLY when user interacts
  useEffect(() => {
    if (isInitialLoad) return;
    if (!submittedFilters) return;
    if (!hasUserInteracted) return;

    const timer = setTimeout(() => {
      setPage(1);
      setSubmittedFilters({
        searchQuery,
        selectedCategories,
        selectedColors,
        selectedSizes,
        selectedSpecs,
        priceMin: priceMin || "",
        priceMax: priceMax || "",
        inStock,
        isInitialLoad: false,
      });
      if (isMobileFilterOpen) {
        setIsMobileFilterOpen(false);
        document.body.style.overflow = "unset";
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    selectedCategories,
    selectedColors,
    selectedSizes,
    selectedSpecs,
    priceMin,
    priceMax,
    inStock,
    hasUserInteracted,
  ]);

  const params = useMemo(() => {
    if (!submittedFilters) return null;

    const p = {};

    if (!submittedFilters.isInitialLoad) {
      if (page) p.page = page;
      if (perPage) p.per_page = Number(perPage);
      if (sortBy) p.sort_by = sortBy;
      if (submittedFilters.inStock) p.in_stock = 1;
      if (submittedFilters.searchQuery)
        p.search_query = submittedFilters.searchQuery;

      if (submittedFilters.selectedCategories?.length > 0) {
        submittedFilters.selectedCategories.forEach((categoryId) => {
          p["categories[]"] = p["categories[]"] || [];
          p["categories[]"].push(categoryId);
        });
      }

      if (submittedFilters.selectedColors?.length > 0) {
        submittedFilters.selectedColors.forEach((colorId) => {
          p["colors[]"] = p["colors[]"] || [];
          p["colors[]"].push(colorId);
        });
      }

      if (submittedFilters.selectedSizes?.length > 0) {
        submittedFilters.selectedSizes.forEach((sizeId) => {
          p["sizes[]"] = p["sizes[]"] || [];
          p["sizes[]"].push(sizeId);
        });
      }

      if (submittedFilters.priceMin !== "")
        p.price_range_min = Number(submittedFilters.priceMin);
      if (submittedFilters.priceMax !== "")
        p.price_range_max = Number(submittedFilters.priceMax);
    }

    if (currentGender) p["gender[]"] = currentGender;

    return p;
  }, [submittedFilters, currentGender, sortBy, page, perPage]);

  const hasFilters = Boolean(submittedFilters);

  const {
    data: searchData,
    isLoading: isLoadingResults,
    error: searchError,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ["search-results", params],
    queryFn: () => apiGet("/filter/search", { params }),
    enabled: Boolean(currentGender && params),
    keepPreviousData: true,
    staleTime: 1000 * 10,
    retry: 2,
  });

  const products = searchData?.result || [];
  const total = searchData?.result?.length ?? 0;

  const isEmptyResults =
    hasFilters &&
    !submittedFilters?.isInitialLoad &&
    products.length === 0 &&
    !isLoadingResults;

  const markUserInteracted = () => {
    if (!hasUserInteracted) setHasUserInteracted(true);
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedSpecs([]);
    setPriceMin("");
    setPriceMax("");
    setInStock(false);
    setSearchQuery("");
    setSortBy("");
    setPerPage("");
    setPage(1);
    setHasUserInteracted(false);
    setIsMobileFilterOpen(false);
    document.body.style.overflow = "unset";

    setSubmittedFilters({
      searchQuery: "",
      selectedCategories: [],
      selectedColors: [],
      selectedSizes: [],
      selectedSpecs: [],
      priceMin: "",
      priceMax: "",
      inStock: false,
      isInitialLoad: true,
    });
  };

  const handleSearch = () => {
    markUserInteracted();
    setPage(1);
    setSubmittedFilters({
      searchQuery,
      selectedCategories,
      selectedColors,
      selectedSizes,
      selectedSpecs,
      priceMin: priceMin || "",
      priceMax: priceMax || "",
      inStock,
      isInitialLoad: false,
    });
    if (isMobileFilterOpen) {
      setIsMobileFilterOpen(false);
      document.body.style.overflow = "unset";
    }
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    markUserInteracted();
    if (submittedFilters && !submittedFilters.isInitialLoad) {
      setPage(1);
      setSubmittedFilters({
        searchQuery,
        selectedCategories,
        selectedColors,
        selectedSizes,
        selectedSpecs,
        priceMin: priceMin || "",
        priceMax: priceMax || "",
        inStock,
        isInitialLoad: false,
      });
    }
    // Add this to close the mobile sidebar if it's open
    if (isMobileFilterOpen) {
      setIsMobileFilterOpen(false);
      document.body.style.overflow = "unset";
    }
  
  };

  const handleToggleCategory = (id) => {
    markUserInteracted();
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleColor = (id) => {
    markUserInteracted();
    setSelectedColors((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleSize = (id) => {
    markUserInteracted();
    setSelectedSizes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleSpec = (id) => {
    markUserInteracted();
    setSelectedSpecs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handlePriceMinChange = (value) => {
    markUserInteracted();
    setPriceMin(value.replace(/[^0-9]/g, ""));
  };

  const handlePriceMaxChange = (value) => {
    markUserInteracted();
    setPriceMax(value.replace(/[^0-9]/g, ""));
  };

  const handleToggleInStock = () => {
    markUserInteracted();
    setInStock((prev) => !prev);
  };

  const handlePerPageChange = (e) => {
    const newPerPage = e.target.value;
    setPerPage(newPerPage);
    markUserInteracted();
    if (submittedFilters && !submittedFilters.isInitialLoad) {
      setPage(1);
      setSubmittedFilters({
        searchQuery,
        selectedCategories,
        selectedColors,
        selectedSizes,
        selectedSpecs,
        priceMin: priceMin || "",
        priceMax: priceMax || "",
        inStock,
        isInitialLoad: false,
      });
    }
    // Add this to close the mobile sidebar if it's open
    if (isMobileFilterOpen) {
      setIsMobileFilterOpen(false);
      document.body.style.overflow = "unset";
    }
  };

  const handleRetry = () => {
    if (searchError) refetchSearch();
  };

  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
    document.body.style.overflow = !isMobileFilterOpen ? "hidden" : "unset";
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isMobileFilterOpen) {
        setIsMobileFilterOpen(false);
        document.body.style.overflow = "unset";
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMobileFilterOpen]);

  if (isLoadingOptions || isLoadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full px-4">
        <div className="w-32 h-32 lg:w-48 lg:h-48">
          <LottieAnimationPlayer />
        </div>
      </div>
    );
  }

  if (optionsError || categoriesError) {
    return (
      <ErrorState
        title={t("loadErrorTitle") || "Failed to load filters"}
        description={
          t("loadErrorDescription") ||
          "Something went wrong while loading filters. Please try again."
        }
        onRetry={() => window.location.reload()}
        retryText={t("retry") || "Try Again"}
      />
    );
  }

  return (
    <div className="container1 mx-auto px-4 py-8">
      {/* Called Mobile Component */}
      <MobileFilterSidebar
        isOpen={isMobileFilterOpen}
        onClose={() => {
          setIsMobileFilterOpen(false);
          document.body.style.overflow = "unset";
        }}
        t={t}
        sortBy={sortBy}
        perPage={perPage}
        handleSortChange={handleSortChange}
        handlePerPageChange={handlePerPageChange}
        gender={currentGender}
        categories={categories}
        colors={colorFilter?.options || []}
        sizes={sizeFilter?.options || []}
        specs={specFilters}
        priceRange={priceFilter?.range}
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
        selectedColors={selectedColors}
        onToggleColor={handleToggleColor}
        selectedSizes={selectedSizes}
        onToggleSize={handleToggleSize}
        selectedSpecs={selectedSpecs}
        onToggleSpec={handleToggleSpec}
        priceMin={priceMin}
        priceMax={priceMax}
        onChangePriceMin={handlePriceMinChange}
        onChangePriceMax={handlePriceMaxChange}
        inStock={inStock}
        onToggleInStock={handleToggleInStock}
        onResetFilters={() => {
          resetFilters();
          setIsMobileFilterOpen(false);
          document.body.style.overflow = "unset";
        }}
        onApplyFilters={() => {
          setPage(1);
          setSubmittedFilters({
            searchQuery,
            selectedCategories,
            selectedColors,
            selectedSizes,
            selectedSpecs,
            priceMin: priceMin || "",
            priceMax: priceMax || "",
            inStock,
            isInitialLoad: false,
          });
          setIsMobileFilterOpen(false);
          document.body.style.overflow = "unset";
        }}
      />

      {/* Header Section */}
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 lg:p-6 lg:mt-0 mt-[3rem] shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-md lg:text-3xl font-semibold text-slate-900">
              {t("title")}
            </h1>
            <p className="hidden lg:block mt-2 max-w-2xl text-sm text-slate-500">
              {t("description")}
            </p>
          </div>

          <div className="flex items-center gap-2 lg:gap-3 w-full lg:max-w-lg">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={(value) => setSearchQuery(value)}
                onSubmit={handleSearch}
                placeholder={t("searchPlaceholder")}
                className="text-sm lg:text-base"
              />
            </div>
            <button
              onClick={toggleMobileFilter}
              className="lg:hidden p-2.5 lg:p-3 border border-slate-200 rounded-full hover:bg-slate-50 transition flex-shrink-0"
              aria-label="Toggle filters"
            >
              <svg
                className="w-4 h-4 lg:w-5 lg:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[25rem_minmax(0,1fr)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <SearchFilterSidebar
            gender={currentGender}
            categories={categories}
            colors={colorFilter?.options || []}
            sizes={sizeFilter?.options || []}
            specs={specFilters}
            priceRange={priceFilter?.range}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            selectedColors={selectedColors}
            onToggleColor={handleToggleColor}
            selectedSizes={selectedSizes}
            onToggleSize={handleToggleSize}
            selectedSpecs={selectedSpecs}
            onToggleSpec={handleToggleSpec}
            priceMin={priceMin}
            priceMax={priceMax}
            onChangePriceMin={handlePriceMinChange}
            onChangePriceMax={handlePriceMaxChange}
            inStock={inStock}
            onToggleInStock={handleToggleInStock}
            onResetFilters={resetFilters}
          />
        </div>

        <main className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:p-6 p-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs lg:text-sm text-slate-500">
                  {t("resultsLabel")}
                </p>
                <h2 className="text-base lg:text-xl font-semibold text-slate-900">
                  {t("productsFound", { count: total })}
                </h2>
              </div>
              <div className="hidden lg:flex flex-wrap items-center gap-3">
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm"
                >
                  <option value="">{t("sortDefault") || "Sort by..."}</option>
                  <option value="price_low">{t("sortPriceLow")}</option>
                  <option value="price_high">{t("sortPriceHigh")}</option>
                  <option value="newest">{t("sortNewest")}</option>
                  <option value="name_asc">{t("sortNameAsc")}</option>
                  <option value="name_desc">{t("sortNameDesc")}</option>
                </select>
                <select
                  value={perPage}
                  onChange={handlePerPageChange}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm"
                >
                  <option value="">
                    {t("perPageDefault") || "Per page..."}
                  </option>
                  <option value={6}>{t("perPage", { count: 6 })}</option>
                  <option value={9}>{t("perPage", { count: 9 })}</option>
                  <option value={12}>{t("perPage", { count: 12 })}</option>
                  <option value={24}>{t("perPage", { count: 24 })}</option>
                </select>
              </div>
            </div>
          </div>

          {isLoadingResults ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 lg:p-12 text-center flex flex-col items-center justify-center">
              {/* Responsive Wrapper for Lottie */}
              <div className="w-32 h-32 lg:w-48 lg:h-48 flex items-center justify-center">
                <LottieAnimationPlayer />
              </div>
              <p className="mt-4 text-sm lg:text-base text-slate-500">
                {t("loadingResults") || "Loading results..."}
              </p>
            </div>
          ) : searchError ? (
            <ErrorState
              title={t("searchErrorTitle") || "Search Error"}
              description={
                t("searchErrorDescription") ||
                "Something went wrong while searching. Please try again."
              }
              onRetry={handleRetry}
              retryText={t("retry") || "Try Again"}
              secondaryAction={{
                label: t("clear_and_retry") || "Clear & Retry",
                onClick: () => {
                  resetFilters();
                  handleRetry();
                },
              }}
            />
          ) : isEmptyResults ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-slate-200">
              <div className="relative w-48 h-48 mb-6">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png"
                  alt="No results found"
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </div>
              <h3 className="md:text-xl text-md font-semibold text-gray-800 mb-2">
                {t("noResultsTitle") || "No products found"}
              </h3>
              <p className="text-gray-500 max-w-md">
                {t("noResultsDescription") ||
                  "We couldn't find any products matching your filters. Try adjusting your search criteria."}
              </p>
              <button
                onClick={resetFilters}
                className="mt-6 px-6 py-2.5 cursor-pointer bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                {t("clearFilters") || "Clear Filters"}
              </button>
            </div>
          ) : (
            <>
              <SearchResults
                results={products}
                isLoading={isLoadingResults}
                error={searchError}
              />

              {hasFilters &&
                !submittedFilters?.isInitialLoad &&
                products.length > 0 && (
                  <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                    <span>{t("pageLabel", { page })}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() =>
                          setPage((value) => Math.max(1, value - 1))
                        }
                        className="rounded-3xl border border-slate-200 px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {t("previous")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPage((value) => value + 1)}
                        className="rounded-3xl border border-slate-200 px-4 py-2 text-sm transition"
                      >
                        {t("next")}
                      </button>
                    </div>
                  </div>
                )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
