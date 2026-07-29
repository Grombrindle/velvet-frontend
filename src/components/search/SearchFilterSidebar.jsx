"use client";
import React from "react";
import { useTranslations } from "next-intl";

function CheckboxOption({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 border-slate-300 text-black focus:ring-black"
      />
      <span>{label}</span>
    </label>
  );
}

function ColorOption({ color, label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border rounded-full w-10 h-10 flex items-center justify-center transition ${
        selected ? "border-black" : "border-slate-200"
      }`}
    >
      <span
        className="block h-6 w-6 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="sr-only">{label}</span>
    </button>
  );
}

export default function SearchFilterSidebar({
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
}) {
  const t = useTranslations("searchPage");

  return (
    <aside className="w-full lg:w-80 xl:w-96 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-base font-semibold">{t("filtersTitle")}</h2>
          <p className="text-sm text-slate-500">{t("filtersDescription")}</p>
        </div>

        <div className="space-y-4 rounded-3xl bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{t("genderLabel")}</p>
              <p className="text-xs text-slate-500">{t("genderContext")}</p>
            </div>
            <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
              {gender}
            </span>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={inStock}
              onChange={onToggleInStock}
              className="h-4 w-4 border-slate-300 text-black focus:ring-black"
            />
            {t("inStockOnly")}
          </label>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium">{t("categoriesLabel")}</div>
          <div className="space-y-2 max-h-56 overflow-auto pr-1">
            {categories.map((category) => (
              <CheckboxOption
                key={category.id}
                label={category.name}
                checked={selectedCategories.includes(String(category.id))}
                onChange={() => onToggleCategory(String(category.id))}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium">{t("colorsLabel")}</div>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((color) => (
              <ColorOption
                key={color.id}
                color={color.hex}
                label={color.label}
                selected={selectedColors.includes(String(color.id))}
                onClick={() => onToggleColor(String(color.id))}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium">{t("sizesLabel")}</div>
          <div className="grid grid-cols-2 gap-2">
            {sizes.map((size) => (
              <CheckboxOption
                key={size.id}
                label={size.label}
                checked={selectedSizes.includes(String(size.id))}
                onChange={() => onToggleSize(String(size.id))}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium">{t("priceRangeLabel")}</div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={priceMin}
                onChange={(e) => onChangePriceMin(e.target.value)}
                min={priceRange?.min ?? 0}
                max={priceMax || priceRange?.max || 0}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                placeholder={String(priceRange?.min ?? 0)}
              />
              <input
                type="number"
                value={priceMax}
                onChange={(e) => onChangePriceMax(e.target.value)}
                min={priceMin || priceRange?.min || 0}
                max={priceRange?.max ?? 10000}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                placeholder={String(priceRange?.max ?? 0)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
              <span>{t("minLabel", { value: priceRange?.min ?? 0 })}</span>
              <span className="text-right">
                {t("maxLabel", { value: priceRange?.max ?? 0 })}
              </span>
            </div>
          </div>
        </div>

        {specs.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">{t("moreFiltersLabel")}</div>
            <div className="space-y-2 max-h-48 overflow-auto pr-1">
              {specs.map((spec) => (
                <div key={spec.id}>
                  <div className="text-sm font-medium text-slate-800">
                    {spec.name}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {spec.options.map((option) => (
                      <CheckboxOption
                        key={option.id}
                        label={`${option.label} (${option.product_count})`}
                        checked={selectedSpecs.includes(option.id)}
                        onChange={() => onToggleSpec(option.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onResetFilters}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          {t("clearFilters")}
        </button>
      </div>
    </aside>
  );
}