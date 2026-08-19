"use client";
import React from "react";
import SearchFilterSidebar from "./SearchFilterSidebar";

export default function MobileFilterSidebar({
  isOpen,
  onClose,
  t,
  sortBy,
  perPage,
  handleSortChange,
  handlePerPageChange,
  gender,
  categories,
  colors,
  sizes,
  specs,
  priceRange,
  selectedCategories,
  onToggleCategory,
  selectedColors,
  onToggleColor,
  selectedSizes,
  onToggleSize,
  selectedSpecs,
  onToggleSpec,
  priceMin,
  priceMax,
  onChangePriceMin,
  onChangePriceMax,
  inStock,
  onToggleInStock,
  onResetFilters,
  onApplyFilters,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <div className="fixed top-0 left-0 h-full w-[85%] max-w-[400px] bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto translate-x-0">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">{t("filtersTitle")}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition"
            aria-label="Close filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Sort By - Mobile */}
          <div className="space-y-2">
          
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
            >
              <option value="">{t("sortDefault") || "Sort by..."}</option>
              <option value="price_low">{t("sortPriceLow") || "Price: Low to High"}</option>
              <option value="price_high">{t("sortPriceHigh") || "Price: High to Low"}</option>
              <option value="newest">{t("sortNewest") || "Newest First"}</option>
              <option value="name_asc">{t("sortNameAsc") || "Name A-Z"}</option>
              <option value="name_desc">{t("sortNameDesc") || "Name Z-A"}</option>
            </select>
          </div>

          {/* Per Page - Mobile */}
          <div className="space-y-2">
           
            <select
              value={perPage}
              onChange={handlePerPageChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
            >
              <option value="">{t("perPageDefault") || "Per page..."}</option>
              <option value={6}>{t("perPage", { count: 6 })}</option>
              <option value={9}>{t("perPage", { count: 9 })}</option>
              <option value={12}>{t("perPage", { count: 12 })}</option>
              <option value={24}>{t("perPage", { count: 24 })}</option>
            </select>
          </div>

          <div className="border-t border-slate-200 my-4"></div>

          <SearchFilterSidebar
            gender={gender}
            categories={categories}
            colors={colors}
            sizes={sizes}
            specs={specs}
            priceRange={priceRange}
            selectedCategories={selectedCategories}
            onToggleCategory={onToggleCategory}
            selectedColors={selectedColors}
            onToggleColor={onToggleColor}
            selectedSizes={selectedSizes}
            onToggleSize={onToggleSize}
            selectedSpecs={selectedSpecs}
            onToggleSpec={onToggleSpec}
            priceMin={priceMin}
            priceMax={priceMax}
            onChangePriceMin={onChangePriceMin}
            onChangePriceMax={onChangePriceMax}
            inStock={inStock}
            onToggleInStock={onToggleInStock}
            onResetFilters={onResetFilters}
          />

          <button
            onClick={onApplyFilters}
            className="w-full rounded-2xl bg-black px-4 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 transition"
          >
            {t("applyFilters") || "Apply Filters"}
          </button>
        </div>
      </div>
    </>
  );
}