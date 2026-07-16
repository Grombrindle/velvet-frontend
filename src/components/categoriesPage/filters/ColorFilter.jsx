"use client";
import React from "react";

export default function ColorFilter({ filter, selectedValues = [], onToggle }) {
  return (
    <div className="space-y-3  border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">{filter.name}</div>
      <div className="grid grid-cols-5 gap-2">
        {(filter.options || []).map((option, index) => (
          <button
            type="button"
            key={`${filter.id}-${option.id}-${index}`}
            onClick={() => onToggle(String(option.id))}
            className={`flex h-11 flex-col items-center justify-center gap-1 -2xl border px-2 py-2 text-xs transition ${
              selectedValues.includes(String(option.id))
                ? "border-black bg-slate-100"
                : "border-slate-200 bg-white"
            }`}
          >
            <span
              className="block h-7 w-7 rounded-full border"
              style={{ backgroundColor: option.hex || "#000" }}
            />
            {/* <span className="truncate">{option.label}</span> */}
          </button>
        ))}
      </div>
    </div>
  );
}
