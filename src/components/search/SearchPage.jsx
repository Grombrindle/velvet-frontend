"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import SearchFilterSidebar from "./SearchFilterSidebar";

export default function SearchPage({ currentGender }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedSpecs, setSelectedSpecs] = useState([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [inStock, setInStock] = useState(false);
  const [includeOption, setIncludeOption] = useState("variants");
  const [sortBy, setSortBy] = useState("price_low");
  const [perPage, setPerPage] = useState(12);
  const [page, setPage] = useState(1);
  const [submittedFilters, setSubmittedFilters] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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

  // ⭐ NEW: Auto-submit initial search with ONLY gender
  useEffect(() => {
    if (currentGender && isInitialLoad) {
      // Set default price range values in the UI
      if (priceFilter) {
        setPriceMin(String(Math.floor(priceFilter.range.min)));
        setPriceMax(String(Math.ceil(priceFilter.range.max)));
      }
      
      // ⭐ CRITICAL: Submit with NO filters, just gender
      setSubmittedFilters({
        searchQuery: "",
        selectedCategories: [],
        selectedColors: [],
        selectedSizes: [],
        selectedSpecs: [],
        priceMin: "",
        priceMax: "",
        inStock: false,
        includeOption: "",
        isInitialLoad: true, // Flag for initial load
      });
      setIsInitialLoad(false);
    }
  }, [currentGender, priceFilter]);

  const params = useMemo(() => {
    if (!submittedFilters) return null;

    const p = {};

    // ⭐ CRITICAL: Only add parameters if this is NOT initial load
    if (!submittedFilters.isInitialLoad) {
      // Add pagination and sorting for non-initial loads
      p.include = submittedFilters.includeOption || "variants";
      p.page = page;
      p.per_page = perPage;
      p.sort_by = sortBy;
      
      if (submittedFilters.inStock) {
        p.in_stock = 1;
      }
      
      if (submittedFilters.searchQuery) {
        p.search_query = submittedFilters.searchQuery;
      }
      
      if (submittedFilters.selectedCategories && submittedFilters.selectedCategories.length > 0) {
        submittedFilters.selectedCategories.forEach((categoryId) => {
          p["categories[]"] = p["categories[]"] || [];
          p["categories[]"].push(categoryId);
        });
      }
      
      if (submittedFilters.selectedColors && submittedFilters.selectedColors.length > 0) {
        submittedFilters.selectedColors.forEach((colorId) => {
          p["colors[]"] = p["colors[]"] || [];
          p["colors[]"].push(colorId);
        });
      }
      
      if (submittedFilters.selectedSizes && submittedFilters.selectedSizes.length > 0) {
        submittedFilters.selectedSizes.forEach((sizeId) => {
          p["sizes[]"] = p["sizes[]"] || [];
          p["sizes[]"].push(sizeId);
        });
      }
      
      if (submittedFilters.priceMin && submittedFilters.priceMin !== "") {
        p.price_range_min = Number(submittedFilters.priceMin);
      }
      if (submittedFilters.priceMax && submittedFilters.priceMax !== "") {
        p.price_range_max = Number(submittedFilters.priceMax);
      }
    }

    // ⭐ ALWAYS add gender to all requests
    if (currentGender) {
      p["gender[]"] = currentGender;
    }

    return p;
  }, [submittedFilters, currentGender, sortBy, page, perPage]);

  const hasFilters = Boolean(submittedFilters);

  const {
    data: searchData,
    isLoading: isLoadingResults,
    error: searchError,
  } = useQuery({
    queryKey: ["search-results", params],
    queryFn: () => apiGet("/filter/search", { params }),
    enabled: Boolean(currentGender && params),
    keepPreviousData: true,
    staleTime: 1000 * 10,
  });

  const products = searchData?.result || [];
  const total = searchData?.result?.length ?? 0;

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedSpecs([]);
    setPriceMin("");
    setPriceMax("");
    setInStock(false);
    setIncludeOption("variants");
    setSearchQuery("");
    setPage(1);
    // ⭐ Reset to show all - only gender
    setSubmittedFilters({
      searchQuery: "",
      selectedCategories: [],
      selectedColors: [],
      selectedSizes: [],
      selectedSpecs: [],
      priceMin: "",
      priceMax: "",
      inStock: false,
      includeOption: "",
      isInitialLoad: true, // ⭐ This will trigger the clean API call
    });
  };

  const handleSearch = () => {
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
      includeOption: includeOption || "variants",
      isInitialLoad: false, // ⭐ NOT initial load - include all params
    });
  };

  return (
    <div className="container1 mx-auto px-4 py-8">
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 lg:mt-0 mt-[5rem] shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              {t("title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              {t("description")}
            </p>
          </div>
          <div className="w-full max-w-lg">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearch}
              placeholder={t("searchPlaceholder")}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[25rem_minmax(0,1fr)]">
        <SearchFilterSidebar
          gender={currentGender}
          categories={categories}
          colors={colorFilter?.options || []}
          sizes={sizeFilter?.options || []}
          specs={specFilters}
          priceRange={priceFilter?.range}
          selectedCategories={selectedCategories}
          onToggleCategory={(id) =>
            setSelectedCategories((prev) =>
              prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
            )
          }
          selectedColors={selectedColors}
          onToggleColor={(id) =>
            setSelectedColors((prev) =>
              prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
            )
          }
          selectedSizes={selectedSizes}
          onToggleSize={(id) =>
            setSelectedSizes((prev) =>
              prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
            )
          }
          selectedSpecs={selectedSpecs}
          onToggleSpec={(id) =>
            setSelectedSpecs((prev) =>
              prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
            )
          }
          priceMin={priceMin}
          priceMax={priceMax}
          onChangePriceMin={(value) =>
            setPriceMin(value.replace(/[^0-9]/g, ""))
          }
          onChangePriceMax={(value) =>
            setPriceMax(value.replace(/[^0-9]/g, ""))
          }
          inStock={inStock}
          onToggleInStock={() => setInStock((prev) => !prev)}
          onResetFilters={resetFilters}
        />

        <main className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">{t("resultsLabel")}</p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {t("productsFound", { count: total })}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={includeOption}
                  onChange={(e) => {
                    setIncludeOption(e.target.value);
                    if (submittedFilters && !submittedFilters.isInitialLoad) {
                      handleSearch();
                    }
                  }}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm"
                >
                  <option value="variants">{t("includeVariants")}</option>
                  <option value="minimal">{t("includeMinimal")}</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    if (submittedFilters && !submittedFilters.isInitialLoad) {
                      handleSearch();
                    }
                  }}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm"
                >
                  <option value="price_low">{t("sortPriceLow")}</option>
                  <option value="price_high">{t("sortPriceHigh")}</option>
                  <option value="newest">{t("sortNewest")}</option>
                  <option value="name_asc">{t("sortNameAsc")}</option>
                  <option value="name_desc">{t("sortNameDesc")}</option>
                </select>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    if (submittedFilters && !submittedFilters.isInitialLoad) {
                      handleSearch();
                    }
                  }}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm"
                >
                  <option value={6}>{t("perPage", { count: 6 })}</option>
                  <option value={9}>{t("perPage", { count: 9 })}</option>
                  <option value={12}>{t("perPage", { count: 12 })}</option>
                  <option value={24}>{t("perPage", { count: 24 })}</option>
                </select>
              </div>
            </div>
          </div>

          {isLoadingOptions || isLoadingCategories ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500">
              {t("loadingFilters")}
            </div>
          ) : optionsError || categoriesError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              {t("loadError")}
            </div>
          ) : null}

          {hasFilters ? (
            <SearchResults
              results={products}
              isLoading={isLoadingResults}
              error={searchError}
            />
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              {t("startMessage")}
            </div>
          )}

          {hasFilters && !submittedFilters?.isInitialLoad && products.length > 0 && (
            <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <span>{t("pageLabel", { page })}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
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
        </main>
      </div>
    </div>
  );
}