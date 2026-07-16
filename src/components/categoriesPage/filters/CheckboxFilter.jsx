"use client";
import React from "react";

export default function CheckboxFilter({
  filter,
  selectedValues = [],
  onToggle,
}) {
  return (
    <div className="space-y-3 -3xl border border-slate-200 bg-white p-4 -sm">
      <div className="text-sm font-semibold text-slate-900">{filter.name}</div>
      <div className="grid gap-2">
        {(filter.options || []).map((option, index) => (
          <label
            key={`${filter.id}-${option.id}-${index}`}
            className="flex items-center justify-between gap-3 -2xl border border-slate-200 px-3 py-2 text-sm hover:border-slate-400"
          >
            <span className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedValues.includes(String(option.id))}
                onChange={() => onToggle(String(option.id))}
                className="h-4 w-4 accent-black"
              />
              <span>{option.label}</span>
            </span>
            <span className="text-xs text-slate-500">
              {option.product_count}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
