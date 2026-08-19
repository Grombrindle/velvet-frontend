"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCategoryPageStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import RadioFilter from "./filters/RadioFilter";
import CheckboxFilter from "./filters/CheckboxFilter";
import ColorFilter from "./filters/ColorFilter";
import SliderFilter from "./filters/SliderFilter";
import CategoryFilter from "./filters/categoriesFilter";
import { FaTimes } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function FilterBar({
  totalProducts,
  gender,
  selectedFilters,
  onFilterChange,
  genderOptions,
}) {
  const { toggleFilter, viewMode, setViewMode, isFilterOpen } =
    useCategoryPageStore();
  const t = useTranslations("filterBar");
  const [selectedGender, setSelectedGender] = useState(gender || "");
  const [isMobile, setIsMobile] = useState(false);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const prevFiltersRef = useRef(selectedFilters);
  const initialLoadRef = useRef(true);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Track when filters change
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      prevFiltersRef.current = selectedFilters;
      return;
    }

    const filtersChanged =
      JSON.stringify(prevFiltersRef.current) !==
      JSON.stringify(selectedFilters);

    if (filtersChanged) {
      setHasAppliedFilters(true);

      const hasFilters = Object.values(selectedFilters).some((value) => {
        if (Array.isArray(value)) return value.length > 0;
        if (value && typeof value === "object") {
          return value.min != null || value.max != null;
        }
        return Boolean(value);
      });

      if (isMobile && isFilterOpen && hasFilters) {
        const timer = setTimeout(() => {
          toggleFilter();
          setTimeout(() => setHasAppliedFilters(false), 300);
        }, 150);

        return () => clearTimeout(timer);
      }
    }

    prevFiltersRef.current = selectedFilters;
  }, [selectedFilters, isMobile, isFilterOpen, toggleFilter]);

  useEffect(() => {
    if (!isFilterOpen) {
      setHasAppliedFilters(false);
    }
  }, [isFilterOpen]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["filter-options", gender],
    queryFn: () => apiGet("/filter/options", { params: { gender } }),
    staleTime: 1000 * 60 * 10,
  });

  const normalizedFilters = useMemo(() => {
    const filterOptions = data?.result || [];
    return filterOptions.filter((filter) => filter.id !== "gender");
  }, [data?.result]);

  const toggleCheckboxValue = (filterId, value) => {
    const current = selectedFilters?.[filterId] ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onFilterChange({ ...selectedFilters, [filterId]: next });
  };

  const setSliderValue = (filterId, value) => {
    onFilterChange({
      ...selectedFilters,
      [filterId]: {
        ...selectedFilters?.[filterId],
        ...value,
      },
    });
  };

  const handleGenderChange = (e) => {
    const newGender = e.target.value;
    setSelectedGender(newGender);

    const genderValue = newGender ? [newGender] : [];

    const { gender: _, ...restFilters } = selectedFilters || {};

    onFilterChange({
      ...restFilters,
      gender: genderValue,
    });
  };

  const renderFilterComponent = (filter) => {
    const selectedValue = selectedFilters?.[filter.id];

    if (filter.id === "categories") {
      return (
        <CategoryFilter
          key={filter.id}
          filter={filter}
          selectedValues={selectedValue ?? []}
          onToggle={(value) => toggleCheckboxValue(filter.id, value)}
          gender={gender}
        />
      );
    }

    switch (filter.view_type) {
      case "radio":
        return (
          <RadioFilter
            key={filter.id}
            filter={filter}
            value={selectedValue}
            onChange={(value) =>
              onFilterChange({ ...selectedFilters, [filter.id]: value })
            }
          />
        );
      case "checkbox":
        return (
          <CheckboxFilter
            key={filter.id}
            filter={filter}
            selectedValues={selectedValue ?? []}
            onToggle={(value) => toggleCheckboxValue(filter.id, value)}
          />
        );
      case "color":
        return (
          <ColorFilter
            key={filter.id}
            filter={filter}
            selectedValues={selectedValue ?? []}
            onToggle={(value) => toggleCheckboxValue(filter.id, value)}
          />
        );
      case "slider":
        return (
          <SliderFilter
            key={filter.id}
            filter={filter}
            value={
              selectedValue ?? {
                min: filter.range?.min,
                max: filter.range?.max,
              }
            }
            onChange={(value) => setSliderValue(filter.id, value)}
          />
        );
      default:
        return null;
    }
  };

  const genderOptionsList = useMemo(() => {
    if (!genderOptions || !Array.isArray(genderOptions)) {
      return [];
    }
    return genderOptions;
  }, [genderOptions]);

  const displayGender = useMemo(() => {
    if (!selectedGender) return "";
    if (Array.isArray(selectedGender)) {
      return selectedGender.length > 0 ? selectedGender[0] : "";
    }
    return selectedGender;
  }, [selectedGender]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(selectedFilters).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (value && typeof value === "object") {
        return value.min != null || value.max != null;
      }
      return Boolean(value);
    });
  }, [selectedFilters]);

  const clearAllFilters = () => {
    onFilterChange({});
    setSelectedGender("");
  };

  // Filter content
  const filterContent = (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header with close button - Mobile only */}
        <div className="flex justify-between items-center mb-4 md:hidden">
          <h3 className="text-lg font-bold">Filters</h3>
          <button
            onClick={toggleFilter}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">{totalProducts} {t("products")}A</div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              {t("clear_all")}
            </button>
          )}
        </div>

        {genderOptionsList.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("Gender")}
            </label>
            <select
              value={displayGender}
              onChange={handleGenderChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {genderOptionsList.map((option) => {
                const genderName = option?.name?.en || option?.name || "";
                const genderValue = genderName.toLowerCase();
                return (
                  <option key={option.id} value={genderValue}>
                    {genderName}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            Loading filter options...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            Failed to load filters.
          </div>
        ) : normalizedFilters.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            No filter options available.
          </div>
        ) : (
          normalizedFilters.map(renderFilterComponent)
        )}

        {isMobile && (
          <button
            onClick={() => {
              toggleFilter();
              setHasAppliedFilters(false);
            }}
            className="w-full bg-black text-white py-4 rounded-xl font-semibold text-center hover:bg-gray-800 transition-colors sticky bottom-0"
          >
            {hasActiveFilters ? "Apply Filters" : "Close Filters"}
          </button>
        )}
      </div>
    </div>
  );

  // Mobile: Render as overlay drawer (no layout shift)
  if (isMobile) {
    return (
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={toggleFilter}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-50 shadow-2xl overflow-hidden"
            >
              {filterContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: Render as sidebar with proper sizing
  return (
    <motion.aside
      className="flex-shrink-0 relative hidden md:block"
      initial={false}
      animate={{
        width: isFilterOpen ? 320 : 0,
        opacity: isFilterOpen ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      style={{
        minWidth: 0,
        overflow: "hidden",
        height: "100%",
      }}
    >
      <div
        className={`w-[320px] h-full overflow-y-auto ${!isFilterOpen ? "hidden" : ""}`}
      >
        {filterContent}
      </div>
    </motion.aside>
  );
}
