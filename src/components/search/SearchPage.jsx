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

  const params = useMemo(() => {
    if (!submittedFilters) return null;

    const p = {
      include: submittedFilters.includeOption || "minimal",
      page,
      per_page: perPage,
      sort_by: sortBy,
      ...(submittedFilters.inStock ? { in_stock: 1 } : {}),
    };

    if (submittedFilters.searchQuery)
      p.search_query = submittedFilters.searchQuery;
    if (currentGender) p["gender[]"] = currentGender;
    if (submittedFilters.selectedCategories.length)
      p["categories[]"] = submittedFilters.selectedCategories.join(",");
    if (submittedFilters.selectedColors.length)
      p["colors[]"] = submittedFilters.selectedColors.join(",");
    if (submittedFilters.selectedSizes.length)
      p["sizes[]"] = submittedFilters.selectedSizes.join(",");
    if (submittedFilters.priceMin !== "")
      p.price_range_min = Number(submittedFilters.priceMin);
    if (submittedFilters.priceMax !== "")
      p.price_range_max = Number(submittedFilters.priceMax);

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
    setPriceMin(priceFilter ? String(Math.floor(priceFilter.range.min)) : "");
    setPriceMax(priceFilter ? String(Math.ceil(priceFilter.range.max)) : "");
    setInStock(false);
    setIncludeOption("minimal");
    setSearchQuery("");
    setPage(1);
    setSubmittedFilters(null);
  };

  return (
    <div className="container1 mx-auto px-4 py-8">
      <div className="mb-6  border border-slate-200 bg-white p-6 shadow-sm">
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
              onSubmit={() => {
                setPage(1);
                setSubmittedFilters({
                  searchQuery,
                  selectedCategories,
                  selectedColors,
                  selectedSizes,
                  selectedSpecs,
                  priceMin,
                  priceMax,
                  inStock,
                  includeOption,
                });
              }}
              placeholder={t("searchPlaceholder")}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-20 lg:grid-cols-[320px_minmax(0,1fr)]">
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
          <div className=" border border-slate-200 bg-slate-50 p-6">
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
                  onChange={(e) => setIncludeOption(e.target.value)}
                  className=" border border-slate-200 bg-white px-4 py-2 text-sm"
                >
                  <option value="variants">{t("includeVariants")}</option>
                  <option value="minimal">{t("includeMinimal")}</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className=" border border-slate-200 bg-white px-4 py-2 text-sm"
                >
                  <option value="price_low">{t("sortPriceLow")}</option>
                  <option value="price_high">{t("sortPriceHigh")}</option>
                  <option value="newest">{t("sortNewest")}</option>
                  <option value="name_asc">{t("sortNameAsc")}</option>
                  <option value="name_desc">{t("sortNameDesc")}</option>
                </select>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className=" border border-slate-200 bg-white px-4 py-2 text-sm"
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
            <div className=" border border-slate-200 bg-white p-6 text-center text-slate-500">
              {t("loadingFilters")}
            </div>
          ) : optionsError || categoriesError ? (
            <div className=" border border-red-200 bg-red-50 p-6 text-center text-red-700">
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
            <div className=" border border-slate-200 bg-white p-8 text-center text-slate-500">
              {/* {t("startMessage")}  */} {t("startMessage")}
            </div>
          )}

          {hasFilters && (
            <div className="flex items-center justify-between gap-4  border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <span>{t("pageLabel", { page })}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className=" border border-slate-200 px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("previous")}
                </button>
                <button
                  type="button"
                  onClick={() => setPage((value) => value + 1)}
                  className=" border border-slate-200 px-4 py-2 text-sm transition"
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
