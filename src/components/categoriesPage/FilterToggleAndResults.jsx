"use client";
import { useCategoryPageStore } from "@/lib/store";
import { useLocale, useTranslations } from "next-intl";
import React from "react";
import { FaPlus } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

function FilterToggleAndResults({ totalProducts }) {
  const { toggleFilter, viewMode, setViewMode, isFilterOpen } =
    useCategoryPageStore();
  const t = useTranslations("categoriesPage");
  const locale = useLocale();
  return (
    <div className="container1 mb-5 mx-auto flex justify-between  text-sm items-center max-w-1/4">
      <button
        onClick={toggleFilter}
        className={`flex items-center transition-all duration-200 py-1 rounded ${
          isFilterOpen ? "bg-black text-white px-5 " : "text-black"
        } gap-2 uppercase tracking-wide cursor-pointer`}
      >
        {t("show_filters")}
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
            {t("view")}
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
        <span>
          {totalProducts} {t("products")}
        </span>
        <button className="uppercase tracking-wide inline-flex items-center ">
          {t("sort")}{" "}
          {locale === "en" ? (
            <IoIosArrowForward size={16} />
          ) : (
            <IoIosArrowBack size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

export default FilterToggleAndResults;
