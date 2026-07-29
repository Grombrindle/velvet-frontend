"use client";
import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FaCheck } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";

export default function SortDropdown({ sortBy, onSortChange }) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);
  const t = useTranslations('sort_by');
  const locale = useLocale();

  const sortOptions = [
    { id: "newest", label: t('newest') },
    { id: "price_low", label: t('price_low') },
    { id: "price_high", label: t('price_high') },
    { id: "name_asc", label: t('name_asc') },
    { id: "name_desc", label: t('name_desc') },
    { id: "stock_high", label: t('stock_high') },
    { id: "stock_low", label: t('stock_low') },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={sortRef}>
      <button
        onClick={() => setIsSortOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 cursor-pointer"
      >
        {t("sort")} <IoIosArrowDown size={14} className={`transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
      </button>

      {isSortOpen && (
        <div className={`absolute ${locale === "ar"?'left-0':'right-0'} mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md py-2 z-50`}>
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                onSortChange(option.id);
                setIsSortOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-gray-100 transition-colors ${
                sortBy === option.id ? "font-bold text-black" : "text-gray-600"
              }`}
            >
              {option.label}
              {sortBy === option.id && <FaCheck size={10} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}