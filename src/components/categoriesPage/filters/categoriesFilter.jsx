"use client";
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import CheckboxFilter from "./CheckboxFilter";

export default function CategoryFilter({
  filter,
  selectedValues,
  onToggle,
  gender, // Add gender prop
}) {
  // Fetch categories from the categories API
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ["categories", gender],
    queryFn: () => apiGet("/categories", { params: { gender } }),
    staleTime: 1000 * 60 * 10,
  });

  // Transform the categories data to match the expected format
  const flattenedCategories = useMemo(() => {
    if (!categoriesData?.result) return [];

    // Assuming the API returns categories in the result array
    const categories = categoriesData.result;
    
    // If categories are nested by gender, flatten them
    if (Array.isArray(categories)) {
      return categories.map(cat => ({
        ...cat,
        // Ensure each category has an id and label
        id: cat.id || cat.category_id,
        label: cat.name || cat.label || cat.category_name,
      }));
    }

    // If categories are grouped by gender (like in the filter options)
    if (typeof categories === 'object' && !Array.isArray(categories)) {
      const allCategories = [];
      Object.keys(categories).forEach(genderKey => {
        const cats = categories[genderKey] || [];
        cats.forEach(cat => {
          allCategories.push({
            ...cat,
            id: cat.id || cat.category_id,
            label: cat.name || cat.label || cat.category_name,
          });
        });
      });
      return allCategories;
    }

    return [];
  }, [categoriesData]);

  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500">
        Loading categories...
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        Failed to load categories.
      </div>
    );
  }

  // If no categories, don't render
  if (flattenedCategories.length === 0) {
    return null;
  }

  const flattenedFilter = {
    ...filter,
    options: flattenedCategories
  };

  return (
    <CheckboxFilter
      filter={flattenedFilter}
      selectedValues={selectedValues ?? []}
      onToggle={onToggle}
    />
  );
}