"use client";
import React, { useMemo } from "react";
import { motion } from "motion/react";
import { useCategoryPageStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import RadioFilter from "./filters/RadioFilter";
import CheckboxFilter from "./filters/CheckboxFilter";
import ColorFilter from "./filters/ColorFilter";
import SliderFilter from "./filters/SliderFilter";

export default function FilterBar({
  totalProducts,
  gender,
  selectedFilters,
  onFilterChange,
}) {
  const { toggleFilter, viewMode, setViewMode, isFilterOpen } =
    useCategoryPageStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["filter-options", gender],
    queryFn: () => apiGet("/filter/options", { params: { gender } }),
    staleTime: 1000 * 60 * 10,
  });

  const normalizedFilters = useMemo(() => {
    const filterOptions = data?.result || [];

    return filterOptions
      .filter((filter) => filter.id !== "gender" && filter.id !== "categories")
      .map((filter) => filter);
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

  const renderFilterComponent = (filter) => {
    const selectedValue = selectedFilters[filter.id];

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

  return (
    <motion.aside
      className="overflow-hidden flex-shrink-0"
      initial={false}
      animate={{
        width: isFilterOpen ? 320 : 0,
        opacity: isFilterOpen ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      style={{ minWidth: 0 }}
    >
      <div className="">
        {/* <div className="container1 mx-auto flex justify-between  text-sm items-center max-w-1/4">
        <button
          onClick={toggleFilter}
          className={`flex items-center transition-all duration-200 py-1 rounded ${
            isFilterOpen ? "bg-black text-white px-5 " : "text-black"
          } gap-2 uppercase tracking-wide cursor-pointer`}
        >
          Show Filters
          <span>
            <FaPlus
              className={`transition-all duration-200 ${
                isFilterOpen ? "rotate-45" : ""
              }`}
              size={12}
            />
          </span>
        </button>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold tracking-widest uppercase">
              View + {viewMode}
            </span>

            <div className="relative flex items-center w-32 group">
              <div className="absolute w-full h-px bg-gray-300 group-hover:bg-gray-400 transition-colors" />

              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={viewMode}
                onChange={(e) => setViewMode(parseInt(e.target.value, 10))}
                className="relative z-10 w-full h-2 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-gray-400 [&::-moz-range-thumb]:transition-transform"
              />
            </div>
          </div>
          <span>{totalProducts} Products</span>
          <button className="uppercase tracking-wide inline-flex items-center ">
            Sort <IoIosArrowForward size={16} />
          </button>
        </div>
      </div> */}

        {isFilterOpen && (
          <div className="container1 mx-auto mt-6 space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              {totalProducts} products
            </div>
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
          </div>
        )}

        <hr className="my-4 text-gray-300" />
      </div>
    </motion.aside>
  );
}
